/**
 * Paliativo: preenche a composição dos kits a partir do Metabase (Data Mart, estrutura do Protheus)
 * em vez de deduzir da descrição. Fonte: silver.bridge_shopify_kit_components, que liga o produto-kit
 * do Shopify aos produtos avulsos que ele contém (match por SKU no Protheus).
 *
 * Grava no kits.yaml com `confirmado: true` só os kits ainda não confirmados (ou sem entrada).
 * Kit já confirmado em revisão humana nunca é sobrescrito: se o Metabase diverge, só imprime.
 * Read-only no Shopify (só resolve id → handle).
 *
 *   npx tsx scripts/sync-kits-metabase.ts --loja kokeshi            # dry-run: imprime o que mudaria
 *   npx tsx scripts/sync-kits-metabase.ts --loja kokeshi --apply    # grava no kits.yaml
 *
 * Credenciais no .env da raiz: METABASE_URL, METABASE_API_KEY.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { parseDocument } from "yaml";
import { assertEnabled, getLoja, loadPipelineConfig, REPO_ROOT } from "../lib/config.js";
import { ShopifyReadClient } from "../lib/shopify/client.js";

const { values } = parseArgs({
  options: {
    loja: { type: "string" },
    apply: { type: "boolean", default: false },
  },
});
if (!values.loja) {
  console.error("uso: sync-kits-metabase --loja <marca> [--apply]");
  process.exit(2);
}

const config = loadPipelineConfig();
assertEnabled(config);
const loja = getLoja(config, values.loja);
const fonteKit = loja.fontes_produto.find((f) => f.tipo === "kit");
if (!fonteKit || fonteKit.tipo !== "kit") throw new Error(`${loja.marca} não tem fonte "kit" no pipeline.yaml`);
const kitsPath = resolve(REPO_ROOT, fonteKit.path);

const METABASE_URL = process.env.METABASE_URL ?? "https://metabase.gobeaute.com.br";
const METABASE_API_KEY = process.env.METABASE_API_KEY;
if (!METABASE_API_KEY) throw new Error("defina METABASE_API_KEY no .env");
/** banco "Data Mart" no Metabase */
const METABASE_DB = 43;

type Linha = {
  kit_product_id: number;
  kit_title: string;
  kit_item_text: string;
  matched_product_id: number | null;
  matched_product_title: string | null;
  matched_sku: string | null;
  qty_per_kit: number;
  is_confirmed: boolean;
  match_source: string;
};

async function metabase(sql: string): Promise<Record<string, unknown>[]> {
  const res = await fetch(`${METABASE_URL}/api/dataset`, {
    method: "POST",
    headers: { "x-api-key": METABASE_API_KEY!, "Content-Type": "application/json" },
    body: JSON.stringify({ database: METABASE_DB, type: "native", native: { query: sql } }),
  });
  if (!res.ok) throw new Error(`Metabase HTTP ${res.status}: ${await res.text()}`);
  const body = (await res.json()) as { error?: string; data: { cols: { name: string }[]; rows: unknown[][] } };
  if (body.error) throw new Error(`Metabase: ${body.error}`);
  const cols = body.data.cols.map((c) => c.name);
  return body.data.rows.map((r) => Object.fromEntries(cols.map((c, i) => [c, r[i]])));
}

const marcaSql = loja.marca.replace(/'/g, "''");
const linhas = (await metabase(
  `select kit_product_id, kit_title, kit_item_text, matched_product_id, matched_product_title, matched_sku,
          qty_per_kit, is_confirmed, match_source
     from silver.bridge_shopify_kit_components
    where brand = '${marcaSql}'
    order by kit_product_id, matched_product_title`,
)) as Linha[];
console.error(`[sync-kits] ${linhas.length} linhas do Metabase para ${loja.marca}`);

// id numérico → handle/status de todos os produtos (inclui UNLISTED: itens só vendidos em kit).
type Node = { id: string; handle: string; status: string };
const client = ShopifyReadClient.fromEnv(loja.shop_domain, loja.credenciais_env_leitura, config.shopify_api_version);
const porId = new Map<string, Node>();
for await (const n of client.paginate<{ products: { nodes: Node[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } }, Node>(
  `query($after: String) { products(first: 250, after: $after) { nodes { id handle status } pageInfo { hasNextPage endCursor } } }`,
  (d) => d.products,
  {},
  60,
)) {
  porId.set(n.id.split("/").pop()!, n);
}

const porKit = new Map<string, Linha[]>();
for (const l of linhas) {
  const k = String(l.kit_product_id);
  porKit.set(k, [...(porKit.get(k) ?? []), l]);
}

const doc = existsSync(kitsPath) ? parseDocument(readFileSync(kitsPath, "utf8")) : parseDocument("kits: {}\n");
const hoje = new Date().toISOString().slice(0, 10);
let escritos = 0;
let iguais = 0;
const pulados: string[] = [];
const divergentes: string[] = [];

for (const [kitId, itens] of porKit) {
  const kit = porId.get(kitId);
  if (!kit || kit.status !== "ACTIVE") continue;

  if (itens.some((i) => !i.is_confirmed || !i.matched_product_id)) {
    pulados.push(`${kit.handle}: item sem match confirmado (${itens.filter((i) => !i.is_confirmed || !i.matched_product_id).map((i) => i.kit_item_text).join("; ")})`);
    continue;
  }
  const naoAchados = itens.filter((i) => !porId.has(String(i.matched_product_id)));
  if (naoAchados.length) {
    pulados.push(`${kit.handle}: componente fora do Shopify (${naoAchados.map((i) => i.matched_product_title).join("; ")})`);
    continue;
  }

  // Mesmo produto pode vir em mais de uma linha: soma as quantidades.
  const qtd = new Map<string, number>();
  for (const i of itens) {
    const h = porId.get(String(i.matched_product_id))!.handle;
    qtd.set(h, (qtd.get(h) ?? 0) + Number(i.qty_per_kit || 1));
  }
  const componentes = [...qtd.keys()];
  const quantidade = componentes.length === 1 ? qtd.get(componentes[0])! : undefined;
  if (componentes.length === 1 && (quantidade ?? 1) < 2) {
    pulados.push(`${kit.handle}: só 1 componente com quantidade 1 (${componentes[0]})`);
    continue;
  }
  const qtdTexto = [...qtd].map(([h, q]) => `${h} ×${q}`).join("; ");
  const nota = `fonte: Protheus via Metabase (silver.bridge_shopify_kit_components), sync ${hoje}; ${qtdTexto}`;

  const atual = doc.getIn(["kits", kit.handle]) as { toJSON(): { componentes?: string[]; confirmado?: boolean } } | undefined;
  const atualJson = atual?.toJSON();
  const mesma = !!atualJson?.componentes && [...atualJson.componentes].sort().join() === [...componentes].sort().join();
  if (atualJson?.confirmado === true) {
    if (mesma) iguais++;
    else divergentes.push(`${kit.handle}\n    kits.yaml: ${atualJson.componentes?.join(", ")}\n    Metabase:  ${qtdTexto}`);
    continue;
  }

  console.log(`${atualJson ? "atualiza" : "novo    "} ${kit.handle}: ${qtdTexto}`);
  doc.setIn(["kits", kit.handle], { componentes, ...(quantidade ? { quantidade } : {}), confirmado: true, nota });
  escritos++;
}

if (pulados.length) console.log(`\npulados (${pulados.length}):\n  ${pulados.join("\n  ")}`);
if (divergentes.length) console.log(`\nconfirmados que divergem do Metabase (mantidos, revisar à mão) (${divergentes.length}):\n  ${divergentes.join("\n  ")}`);
console.log(`\n${escritos} a gravar · ${iguais} confirmados já batem com o Metabase · ${divergentes.length} divergentes · ${pulados.length} pulados`);

if (values.apply) {
  writeFileSync(kitsPath, doc.toString({ lineWidth: 0 }));
  console.log(`✓ ${escritos} entradas gravadas em ${kitsPath} (confirmado: true, fonte Metabase)`);
} else {
  console.log("(dry-run: rode com --apply para gravar no kits.yaml)");
}
