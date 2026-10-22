/**
 * Receita recente por produto, do Metabase (Data Mart, gold.fct_shopify_order_items), gravada no
 * `vendas_path` da loja. É o 1º critério da fila do lote (gate/priorizar). O worker não acessa o
 * Metabase: rodar este script → build-painel → deploy para a nuvem usar a ordem nova.
 * Read-only no Shopify (só resolve id → handle).
 *
 *   npx tsx scripts/sync-vendas-metabase.ts --loja kokeshi              # últimos 30 dias
 *   npx tsx scripts/sync-vendas-metabase.ts --loja kokeshi --dias 60
 *
 * Credenciais no .env da raiz: METABASE_URL, METABASE_API_KEY.
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { assertEnabled, getLoja, loadPipelineConfig, REPO_ROOT } from "../lib/config.js";
import { ShopifyReadClient } from "../lib/shopify/client.js";

const { values } = parseArgs({
  options: {
    loja: { type: "string" },
    dias: { type: "string", default: "30" },
  },
});
if (!values.loja) {
  console.error("uso: sync-vendas-metabase --loja <marca> [--dias 30]");
  process.exit(2);
}
const dias = Number(values.dias);
if (!Number.isInteger(dias) || dias < 1) throw new Error("--dias precisa ser um inteiro positivo");

const config = loadPipelineConfig();
assertEnabled(config);
const loja = getLoja(config, values.loja);
if (!loja.vendas_path) throw new Error(`${loja.marca} não tem vendas_path no pipeline.yaml`);

const METABASE_URL = process.env.METABASE_URL ?? "https://metabase.gobeaute.com.br";
const METABASE_API_KEY = process.env.METABASE_API_KEY;
if (!METABASE_API_KEY) throw new Error("defina METABASE_API_KEY no .env");
/** banco "Data Mart" no Metabase */
const METABASE_DB = 43;

const marcaSql = loja.marca.replace(/'/g, "''");
const sql = `select product_id, sum(quantity) as unidades, sum(quantity * price) as receita
  from gold.fct_shopify_order_items
 where brand = '${marcaSql}'
   and created_at >= now() - interval '${dias} days'
   and cancel_reason is null
   and financial_status in ('paid', 'partially_refunded')
 group by 1`;

type Resposta = { error?: string; data: { rows: [number | string, number, number][] } };
// Consulta longa na réplica do Data Mart pode ser cancelada ("conflict with recovery"): tenta de novo.
async function consultar(tentativas = 4): Promise<Resposta> {
  for (let i = 1; ; i++) {
    console.error(`[sync-vendas] consultando o Metabase (${dias} dias, tentativa ${i}/${tentativas}; pode levar alguns minutos)…`);
    const res = await fetch(`${METABASE_URL}/api/dataset`, {
      method: "POST",
      headers: { "x-api-key": METABASE_API_KEY!, "Content-Type": "application/json" },
      body: JSON.stringify({ database: METABASE_DB, type: "native", native: { query: sql } }),
    });
    if (!res.ok) throw new Error(`Metabase HTTP ${res.status}: ${await res.text()}`);
    const body = (await res.json()) as Resposta;
    if (!body.error) return body;
    if (i >= tentativas || !/conflict with recovery|canceling statement/i.test(body.error)) throw new Error(`Metabase: ${body.error}`);
    console.error(`[sync-vendas] cancelada pela réplica, tentando de novo em 30s`);
    await new Promise((r) => setTimeout(r, 30_000));
  }
}
const body = await consultar();

type Node = { id: string; handle: string };
const client = ShopifyReadClient.fromEnv(loja.shop_domain, loja.credenciais_env_leitura, config.shopify_api_version);
const handles = new Map<string, string>();
for await (const n of client.paginate<{ products: { nodes: Node[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } }, Node>(
  `query($after: String) { products(first: 250, after: $after) { nodes { id handle } pageInfo { hasNextPage endCursor } } }`,
  (d) => d.products,
  {},
  60,
)) {
  handles.set(n.id.split("/").pop()!, n.handle);
}

const produtos: Record<string, { receita: number; unidades: number }> = {};
let semHandle = 0;
for (const [id, unidades, receita] of body.data.rows) {
  const handle = handles.get(String(id));
  if (!handle) {
    semHandle++;
    continue;
  }
  produtos[handle] = { receita: Math.round(Number(receita) * 100) / 100, unidades: Number(unidades) };
}

const ordenado = Object.fromEntries(Object.entries(produtos).sort(([, a], [, b]) => b.receita - a.receita));
const out = resolve(REPO_ROOT, loja.vendas_path);
writeFileSync(
  out,
  JSON.stringify(
    {
      gerado_em: new Date().toISOString(),
      janela_dias: dias,
      fonte: "Metabase gold.fct_shopify_order_items (pedidos pagos, sem cancelados)",
      produtos: ordenado,
    },
    null,
    2,
  ) + "\n",
);
const total = Object.values(produtos).reduce((s, p) => s + p.receita, 0);
console.log(`✓ ${Object.keys(produtos).length} produtos · R$ ${total.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} em ${dias} dias → ${out}`);
if (semHandle) console.log(`  (${semHandle} product_id sem produto correspondente no Shopify: apagados, ignorados)`);
