/**
 * Run do pipeline (Fase 1: scan + gate). Read-only no Shopify, nada é gerado.
 *
 *   npx tsx run/index.ts --loja kokeshi            # grava runs/<run_id>/ e imprime o resumo
 *   npx tsx run/index.ts --loja kokeshi --ingest   # + envia o run.json ao painel (PAINEL_URL + PAINEL_API_KEY)
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { parseDocument } from "yaml";
import { escanear, novoRunId } from "../core/scan.js";
import { assertEnabled, getLoja, loadContrato, loadPipelineConfig, PIPELINE_DIR, REPO_ROOT } from "../lib/config.js";
import { carregarFontes } from "../lib/fontes/carregar.js";
import { ShopifyReadClient } from "../lib/shopify/client.js";
import type { KitProposto, RunPayload } from "../lib/types.js";

const { values } = parseArgs({
  options: {
    loja: { type: "string" },
    ingest: { type: "boolean", default: false },
  },
});
if (!values.loja) {
  console.error("uso: run --loja <marca> [--ingest]");
  process.exit(2);
}

const config = loadPipelineConfig();
assertEnabled(config);
const loja = getLoja(config, values.loja);
const contrato = loadContrato(loja.marca);

const iniciadoEm = new Date();
const runId = novoRunId(loja.marca, iniciadoEm);
const dir = resolve(PIPELINE_DIR, "runs", runId);
mkdirSync(dir, { recursive: true });

const client = ShopifyReadClient.fromEnv(loja.shop_domain, loja.credenciais_env_leitura, config.shopify_api_version);
const dirProdutos = resolve(REPO_ROOT, "conteudos", loja.marca, "produtos");
const lerJson = <T>(path: string): T | null => (existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as T) : null);
const brandbookPath = resolve(REPO_ROOT, "brand-context", loja.marca, "brandbook.md");

const { run, fichas, catalogo, kitsNovos } = await escanear({
  client,
  config,
  loja,
  contrato,
  dados: carregarFontes(loja),
  deps: {
    brandbook: existsSync(brandbookPath) ? readFileSync(brandbookPath, "utf8") : "",
    publicacoes: (h) => lerJson(resolve(dirProdutos, h, "pipeline-publicacoes.json")) ?? [],
    resultadoManual: (h) => lerJson(resolve(dirProdutos, h, "shopify-result.json")),
    hash: async (partes) => partes.reduce((h, p) => h.update(p), createHash("sha256")).digest("hex"),
  },
  runId,
  iniciadoEm,
  log: (m) => console.error(`[run ${runId}] ${m}`),
});

// Propostas de composição para kits ainda não mapeados → entram no kits.yaml como não confirmadas.
const fonteKit = loja.fontes_produto.find((f) => f.tipo === "kit");
if (fonteKit && fonteKit.tipo === "kit" && kitsNovos.length) registrarPropostas(resolve(REPO_ROOT, fonteKit.path), kitsNovos);
const kitsPropostos = run.kits_propostos;

writeFileSync(resolve(dir, "run.json"), JSON.stringify(run, null, 2));
mkdirSync(resolve(dir, "fichas"), { recursive: true });
for (const [handle, ctx] of Object.entries(fichas)) writeFileSync(resolve(dir, "fichas", `${handle}.json`), JSON.stringify(ctx, null, 2));
writeFileSync(resolve(dir, "catalogo-reuso.json"), JSON.stringify(catalogo, null, 2));

const c = run.contagens;
console.log(`\nrun ${runId} (${loja.marca}) — ${dir}`);
console.log(`escaneados ${c.produtos_escaneados} · ativos ${c.ativos} · excluídos ${c.excluidos} · completos ${c.completos}`);
console.log(`elegíveis ${c.elegiveis} · bloqueados ${c.bloqueados} · selecionados hoje ${c.selecionados}/${loja.max_produtos_por_run}`);
console.log(`itens liberados ${c.itens_liberados} · itens bloqueados ${c.itens_bloqueados} · kits pendentes ${kitsPropostos.length} (${kitsNovos.length} propostos agora)`);
console.log(`catálogo de reuso: ${Object.entries(catalogo).map(([t, l]) => `${t}=${l.length}`).join(" ")}`);

if (values.ingest) await ingest(run);

function registrarPropostas(path: string, propostas: KitProposto[]): void {
  const doc = existsSync(path) ? parseDocument(readFileSync(path, "utf8")) : parseDocument("kits: {}\n");
  for (const k of propostas) {
    if (doc.hasIn(["kits", k.handle])) continue;
    doc.setIn(["kits", k.handle], {
      componentes: k.componentes,
      ...(k.quantidade ? { quantidade: k.quantidade } : {}),
      confirmado: false,
      nota: `proposta automática ${runId}: ${k.evidencias.join("; ")}`,
    });
  }
  writeFileSync(path, doc.toString({ lineWidth: 0 }));
}

async function ingest(payload: RunPayload): Promise<void> {
  const url = process.env[config.painel.url_env];
  const key = process.env[config.painel.api_key_env];
  if (!url || !key) throw new Error(`--ingest exige ${config.painel.url_env} e ${config.painel.api_key_env}`);
  const res = await fetch(`${url.replace(/\/$/, "")}/api/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`ingest falhou (HTTP ${res.status}): ${await res.text()}`);
  console.log(`✓ ingest no painel: ${await res.text()}`);
}
