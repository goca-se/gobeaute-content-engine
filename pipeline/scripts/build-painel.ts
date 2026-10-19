/**
 * Build do painel/motor para o GoDeploy.
 *
 *   npx tsx scripts/build-painel.ts [--historico <run_id>...]
 *
 * 1. Gera painel/src/gen/bundle.ts: pipeline.yaml + contratos + textos da marca/skill + fichas das fontes.
 *    O worker não lê disco: mudou brandbook, base CSV, kits.yaml ou contrato → rebuild + deploy.
 * 2. Gera painel/src/gen/historico.ts com runs locais (run.json + conteúdos + publicações + snapshots).
 * 3. Empacota painel/src/server.ts (+ pipeline/core) num único painel/dist/server.js com o esbuild.
 */
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { build } from "esbuild";
import { loadContrato, loadPipelineConfig, PIPELINE_DIR, REPO_ROOT } from "../lib/config.js";
import { carregarContextoMarca } from "../lib/contexto.js";
import { carregarFontes } from "../lib/fontes/carregar.js";
import type { PublicacaoProduto, RunPayload } from "../lib/types.js";

const { values } = parseArgs({ options: { historico: { type: "string", multiple: true } } });
const PAINEL = resolve(REPO_ROOT, "painel");
const GEN = resolve(PAINEL, "src/gen");
mkdirSync(GEN, { recursive: true });

const config = loadPipelineConfig();
const marcas = config.lojas.map((l) => l.marca);
const lerJson = <T>(p: string): T | null => (existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as T) : null);

const contratos = Object.fromEntries(marcas.map((m) => [m, loadContrato(m)]));
const contextos = Object.fromEntries(marcas.map((m) => [m, carregarContextoMarca(m)]));
const fontes = Object.fromEntries(config.lojas.map((l) => [l.marca, carregarFontes(l)]));
// shopify-result.json de rodadas manuais (sem pipeline_run_id): o gate marca como "rodada anterior".
const manuais = Object.fromEntries(
  marcas.map((m) => {
    const dir = resolve(REPO_ROOT, "conteudos", m, "produtos");
    const out: Record<string, { published_at?: string; pipeline_run_id?: string }> = {};
    if (existsSync(dir)) {
      for (const h of readdirSync(dir)) {
        const r = lerJson<{ published_at?: string; pipeline_run_id?: string }>(resolve(dir, h, "shopify-result.json"));
        if (r && !r.pipeline_run_id) out[h] = { published_at: r.published_at };
      }
    }
    return [m, out];
  }),
);
let commit = "local";
try {
  commit = execSync("git rev-parse --short HEAD", { cwd: REPO_ROOT }).toString().trim();
} catch {
  // sem git
}
const buildInfo = { commit, gerado_em: new Date().toISOString() };

writeFileSync(
  resolve(GEN, "bundle.ts"),
  `// Gerado por pipeline/scripts/build-painel.ts. Não editar à mão.
import type { Contrato, PipelineConfig } from "../../../pipeline/core/config.js";
import type { ContextoMarca } from "../../../pipeline/core/gerar.js";
import type { DadosFontes } from "../../../pipeline/lib/fontes/index.js";
export const BUILD = ${JSON.stringify(buildInfo)};
export const CONFIG: PipelineConfig = ${JSON.stringify(config)};
export const CONTRATOS: Record<string, Contrato> = ${JSON.stringify(contratos)};
export const CONTEXTOS: Record<string, ContextoMarca> = ${JSON.stringify(contextos)};
export const FONTES: Record<string, DadosFontes> = ${JSON.stringify(fontes)};
export const RESULTADOS_MANUAIS: Record<string, Record<string, { published_at?: string; pipeline_run_id?: string }>> = ${JSON.stringify(manuais)};
`,
);

// Histórico: runs locais já publicados.
const runsHistorico = (values.historico ?? []).map((runId) => {
  const runDir = resolve(PIPELINE_DIR, "runs", runId);
  const run = JSON.parse(readFileSync(resolve(runDir, "run.json"), "utf8")) as RunPayload;
  const dirProdutos = resolve(REPO_ROOT, "conteudos", run.loja, "produtos");
  const selecionados = run.produtos.filter((p) => p.selecionado);
  const fichas: Record<string, unknown> = {};
  const conteudos = [];
  const publicacoes = [];
  for (const p of selecionados) {
    const f = lerJson(resolve(runDir, "fichas", `${p.handle}.json`));
    if (f) fichas[p.handle] = f;
    for (const i of run.items.filter((x) => x.handle === p.handle)) {
      const textos = resolve(dirProdutos, p.handle, i.formato, "textos");
      if (!existsSync(resolve(textos, "shopify-payload.json"))) continue;
      conteudos.push({
        handle: p.handle,
        formato: i.formato,
        content_md: readFileSync(resolve(textos, "content.md"), "utf8"),
        content_json: readFileSync(resolve(textos, "content.json"), "utf8"),
        payload_json: readFileSync(resolve(textos, "shopify-payload.json"), "utf8"),
        criado_em: statSync(resolve(textos, "shopify-payload.json")).mtime.toISOString(),
      });
    }
    const log = lerJson<(PublicacaoProduto & { run_id: string })[]>(resolve(dirProdutos, p.handle, "pipeline-publicacoes.json")) ?? [];
    for (const e of log.filter((x) => x.run_id === runId)) {
      const snap = e.snapshot_path && existsSync(resolve(REPO_ROOT, e.snapshot_path)) ? readFileSync(resolve(REPO_ROOT, e.snapshot_path), "utf8") : null;
      publicacoes.push({ handle: p.handle, product_gid: p.product_gid, detalhe: e, snapshot_json: snap });
    }
  }
  console.log(`histórico ${runId}: ${selecionados.length} produtos · ${conteudos.length} conteúdos · ${publicacoes.length} publicações`);
  return { run, fichas, conteudos, publicacoes };
});
const versao = createHash("sha256").update(JSON.stringify(runsHistorico)).digest("hex").slice(0, 12);
writeFileSync(
  resolve(GEN, "historico.ts"),
  `// Gerado por pipeline/scripts/build-painel.ts. Não editar à mão.\nexport const HISTORICO = ${JSON.stringify({ versao, runs: runsHistorico })};\n`,
);

mkdirSync(resolve(PAINEL, "dist"), { recursive: true });
await build({
  entryPoints: [resolve(PAINEL, "src/server.ts")],
  outfile: resolve(PAINEL, "dist/server.js"),
  bundle: true,
  format: "esm",
  platform: "neutral",
  mainFields: ["module", "main"],
  target: "es2022",
  nodePaths: [resolve(PIPELINE_DIR, "node_modules")],
  legalComments: "none",
});
const kb = (p: string) => `${(statSync(p).size / 1024).toFixed(0)} KB`;
console.log(`✓ painel/dist/server.js (${kb(resolve(PAINEL, "dist/server.js"))}) · bundle.ts ${kb(resolve(GEN, "bundle.ts"))} · historico.ts ${kb(resolve(GEN, "historico.ts"))} · build ${commit}`);
