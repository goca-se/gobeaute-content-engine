/**
 * Teste local da geração + validação via AI Proxy, sem publicar nada.
 *   npx tsx scripts/testar-geracao.ts --run <run_id> --handle <h> [--formato <f>...] [--out <dir>]
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { catalogoParaPrompt, gerarFormato } from "../core/gerar.js";
import { validarProduto } from "../core/validar.js";
import { getLoja, loadContrato, loadPipelineConfig, PIPELINE_DIR } from "../lib/config.js";
import { carregarContextoMarca } from "../lib/contexto.js";
import type { FichaContexto, RunPayload } from "../lib/types.js";

const { values } = parseArgs({ options: { run: { type: "string" }, handle: { type: "string" }, formato: { type: "string", multiple: true }, out: { type: "string" } } });
const config = loadPipelineConfig();
const runDir = resolve(PIPELINE_DIR, "runs", values.run!);
const run = JSON.parse(readFileSync(resolve(runDir, "run.json"), "utf8")) as RunPayload;
const loja = getLoja(config, run.loja);
const contrato = loadContrato(loja.marca);
const contexto = carregarContextoMarca(loja.marca);
const catalogo = JSON.parse(readFileSync(resolve(runDir, "catalogo-reuso.json"), "utf8"));
const ficha = JSON.parse(readFileSync(resolve(runDir, "fichas", `${values.handle}.json`), "utf8")) as FichaContexto;
const token = process.env[config.llm.token_env];
if (!token) throw new Error(`defina ${config.llm.token_env}`);
const formatos = values.formato?.length
  ? values.formato
  : run.items.filter((i) => i.handle === values.handle && i.status === "detectado").map((i) => i.formato);
const handles = run.produtos.map((p) => p.handle);
const out = values.out ?? resolve(runDir, "teste-api", values.handle!);

const itens = [];
let tokens = 0;
for (const f of formatos) {
  const formato = contrato.pdp.find((c) => c.formato === f)!;
  const t0 = Date.now();
  const r = await gerarFormato({ llm: config.llm, token, contexto, shop: loja.storefront_domain, formato, ficha, catalogo: catalogoParaPrompt(formato, catalogo, handles) });
  tokens += r.tokens;
  console.error(`[gerar] ${f}: ${r.gerado?.status === "bloqueado" ? `bloqueado (${r.gerado.motivo}: ${r.gerado.detalhe})` : r.gerado?.status ?? "ERRO " + r.erro} · ${r.tokens} tokens · ${((Date.now() - t0) / 1000).toFixed(0)}s · ${r.chamadas} chamada(s)`);
  if (r.gerado?.status === "ok") {
    mkdirSync(resolve(out, f), { recursive: true });
    writeFileSync(resolve(out, f, "content.md"), r.gerado.content_md);
    writeFileSync(resolve(out, f, "shopify-payload.json"), JSON.stringify(r.gerado.payload, null, 2));
    itens.push({ formato: f, content_md: r.gerado.content_md, payload: r.gerado.payload });
  }
}
const t0 = Date.now();
const v = await validarProduto({ llm: config.llm, token, contexto, contrato, ficha, itens, catalogo, outrosHandles: handles });
console.error(`[validar] ${v.tokens} tokens · ${((Date.now() - t0) / 1000).toFixed(0)}s ${v.erroLlm ?? ""}`);
for (const [f, fl] of Object.entries(v.flags)) {
  const erros = fl.filter((x) => x.severidade === "erro");
  console.log(`${f}: ${erros.length ? "REPROVADO" : "ok"} ${fl.map((x) => `[${x.severidade}] ${x.codigo}: ${x.detalhe.slice(0, 140)}`).join(" | ")}`);
}
console.log(`tokens ${tokens + v.tokens} → ${out}`);
