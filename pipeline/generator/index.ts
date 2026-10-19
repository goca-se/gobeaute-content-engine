/**
 * Generator: para cada produto do lote, roda o Claude Code headless (`claude -p`) com as skills do repo.
 * Sem MCP, sem Shopify, sem Bash: só lê o contexto e escreve em conteudos/<marca>/produtos/<handle>/.
 *
 *   npx tsx generator/index.ts --run <run_id>                    # todos os selecionados do run
 *   npx tsx generator/index.ts --run <run_id> --handle <handle>   # só um produto
 *   … --handle <h> --formato <f> --feedback "<texto>"             # regera formatos (versão anterior vai para _versoes/)
 *   … --retry-reprovados                                          # regera 1x os reprovados no validator, com os erros como feedback
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { parseArgs } from "node:util";
import { assertEnabled, getLoja, loadContrato, loadPipelineConfig, PIPELINE_DIR, REPO_ROOT } from "../lib/config.js";
import type { RunPayload } from "../lib/types.js";

const { values } = parseArgs({
  options: {
    run: { type: "string" },
    handle: { type: "string", multiple: true },
    formato: { type: "string", multiple: true },
    feedback: { type: "string" },
    "retry-reprovados": { type: "boolean", default: false },
  },
});
if (!values.run) {
  console.error("uso: generator --run <run_id> [--handle <handle>...]");
  process.exit(2);
}

const config = loadPipelineConfig();
assertEnabled(config);
const runDir = resolve(PIPELINE_DIR, "runs", values.run);
const run = JSON.parse(readFileSync(resolve(runDir, "run.json"), "utf8")) as RunPayload;
const loja = getLoja(config, run.loja);
const contrato = loadContrato(loja.marca);

const retry = values["retry-reprovados"];
const alvo = values.handle?.length
  ? run.produtos.filter((p) => values.handle!.includes(p.handle))
  : retry
    ? run.produtos.filter((p) => run.items.some((i) => i.handle === p.handle && i.status === "reprovado_validacao"))
    : run.produtos.filter((p) => p.selecionado);
if (!alvo.length) throw new Error("nenhum produto para gerar");

// Ferramentas: leitura livre, escrita só em conteudos/. Shopify/PiApp/Bash/web explicitamente negados.
const ALLOWED = ["Read", "Glob", "Grep", "Skill", "Write(conteudos/**)", "Edit(conteudos/**)"];
const DISALLOWED = ["Bash", "WebFetch", "WebSearch", "Agent", "mcp__claude_ai_Shopify", "mcp__piapp", "mcp__claude_ai_Godeploy"];
const MAX_USD_POR_PRODUTO = Math.max(0.5, loja.max_custo_usd_por_run / loja.max_produtos_por_run);

type ResultadoGeracao = {
  handle: string;
  ok: boolean;
  custo_usd: number;
  duracao_s: number;
  resposta: string;
  erro?: string;
};

const resultados: ResultadoGeracao[] = [];
let custoTotal = 0;

for (const produto of alvo) {
  if (custoTotal >= loja.max_custo_usd_por_run) {
    console.error(`teto de custo do run atingido (US$ ${custoTotal.toFixed(2)}): parando antes de ${produto.handle}`);
    break;
  }
  const fichaPath = resolve(runDir, "fichas", `${produto.handle}.json`);
  if (!existsSync(fichaPath)) {
    resultados.push({ handle: produto.handle, ok: false, custo_usd: 0, duracao_s: 0, resposta: "", erro: "ficha_ausente_no_run" });
    continue;
  }

  const dirProduto = resolve(REPO_ROOT, "conteudos", loja.marca, "produtos", produto.handle);
  const reprovados = run.items.filter((i) => i.handle === produto.handle && i.status === "reprovado_validacao");
  const regerar = retry ? reprovados.map((i) => i.formato) : (values.formato ?? []);
  const formatos = run.items.filter(
    (i) => i.handle === produto.handle && (regerar.length ? regerar.includes(i.formato) && i.status !== "bloqueado" : i.status === "detectado"),
  );
  if (!formatos.length) {
    console.error(`[generator] ${produto.handle}: nada pendente, pulando`);
    continue;
  }
  const feedback = retry
    ? reprovados
        .map((i) => `- ${i.formato}: ${(i.flags ?? []).filter((f) => f.severidade === "erro").map((f) => `${f.codigo} — ${f.detalhe}`).join(" | ")}`)
        .join("\n")
    : values.feedback;
  const marcadorPath = resolve(dirProduto, "pipeline-geracao.json");
  const marcador: { run_id: string; formatos: string[] } | null = existsSync(marcadorPath)
    ? JSON.parse(readFileSync(marcadorPath, "utf8"))
    : null;

  // Regra #0 ao contrário: conteúdo local que não veio do pipeline (rodada anterior) nunca é sobrescrito.
  const existentes = formatos.filter((i) => existsSync(resolve(dirProduto, i.formato)));
  const manuais = existentes.filter((i) => !marcador?.formatos.includes(i.formato));
  if (manuais.length) {
    resultados.push({
      handle: produto.handle, ok: false, custo_usd: 0, duracao_s: 0, resposta: "",
      erro: `conteudo_local_existente:${manuais.map((i) => i.formato).join(",")}`,
    });
    continue;
  }
  // Conteúdo do próprio pipeline: arquiva a versão anterior antes de regerar.
  const arquivados: { origem: string; destino: string }[] = [];
  for (const i of existentes) {
    const origem = resolve(dirProduto, i.formato);
    const destino = resolve(dirProduto, "_versoes", new Date().toISOString().replace(/[:.]/g, "-"), i.formato);
    mkdirSync(resolve(destino, ".."), { recursive: true });
    renameSync(origem, destino);
    arquivados.push({ origem, destino });
  }

  const ficha = JSON.parse(readFileSync(fichaPath, "utf8"));
  const prompt = renderPrompt({
    marca: loja.marca,
    handle: produto.handle,
    title: produto.title,
    product_gid: produto.product_gid,
    shop: loja.storefront_domain,
    dir_produto: relative(REPO_ROOT, dirProduto),
    ficha_path: relative(REPO_ROOT, fichaPath),
    ficha_origem: ficha.ficha.origem,
    catalogo_path: relative(REPO_ROOT, resolve(runDir, "catalogo-reuso.json")),
    formatos: formatos
      .map((i) => {
        const f = contrato.pdp.find((c) => c.formato === i.formato)!;
        return `- \`${f.formato}\` → \`${f.metafield}\` (${f.tipo}${f.metaobject_type ? ` → ${f.metaobject_type}` : ""})`;
      })
      .join("\n"),
    feedback: feedback ? `## Feedback da validação anterior (corrija isto)\n\n${feedback}\n` : "",
  });

  console.error(`[generator] ${produto.handle}: ${formatos.length} formatos (teto US$ ${MAX_USD_POR_PRODUTO.toFixed(2)})…`);
  const inicio = Date.now();
  const r = await claudeHeadless(prompt, MAX_USD_POR_PRODUTO);
  const duracao = (Date.now() - inicio) / 1000;
  custoTotal += r.custo;
  // Geração falhou sem escrever o formato (ex.: limite de sessão): devolve a versão arquivada.
  if (!r.ok) for (const a of arquivados) if (!existsSync(a.origem)) renameSync(a.destino, a.origem);
  mkdirSync(dirProduto, { recursive: true });
  writeFileSync(
    marcadorPath,
    JSON.stringify({ run_id: run.run_id, formatos: [...new Set([...(marcador?.formatos ?? []), ...formatos.map((i) => i.formato)])], atualizado_em: new Date().toISOString() }, null, 2),
  );
  resultados.push({ handle: produto.handle, ok: r.ok, custo_usd: r.custo, duracao_s: duracao, resposta: r.resposta, erro: r.erro });
  console.error(`[generator] ${produto.handle}: ${r.ok ? "ok" : "ERRO"} · US$ ${r.custo.toFixed(2)} · ${duracao.toFixed(0)}s · ${r.resposta || r.erro}`);
}

const saida = resolve(runDir, "geracao.json");
const anteriores: ResultadoGeracao[] = existsSync(saida) ? JSON.parse(readFileSync(saida, "utf8")) : [];
// Regerar soma custo ao da geração anterior do mesmo produto (custo real acumulado por produto).
const porHandle = new Map(anteriores.map((r) => [r.handle, r]));
for (const r of resultados) {
  const antes = porHandle.get(r.handle);
  porHandle.set(r.handle, antes ? { ...r, custo_usd: antes.custo_usd + r.custo_usd } : r);
}
writeFileSync(saida, JSON.stringify([...porHandle.values()], null, 2));
console.log(`geração: ${resultados.filter((r) => r.ok).length}/${resultados.length} ok · US$ ${custoTotal.toFixed(2)} → ${saida}`);

function renderPrompt(vars: Record<string, string>): string {
  const tpl = readFileSync(resolve(PIPELINE_DIR, "generator", "prompt.md"), "utf8");
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k: string) => {
    if (!(k in vars)) throw new Error(`placeholder sem valor: ${k}`);
    return vars[k];
  });
}

function claudeHeadless(prompt: string, maxUsd: number): Promise<{ ok: boolean; custo: number; resposta: string; erro?: string }> {
  return new Promise((done) => {
    const args = [
      "-p",
      "--output-format", "json",
      "--strict-mcp-config",
      "--max-budget-usd", maxUsd.toFixed(2),
      "--allowedTools", ...ALLOWED,
      "--disallowedTools", ...DISALLOWED,
    ];
    const proc = spawn("claude", args, { cwd: REPO_ROOT, stdio: ["pipe", "pipe", "pipe"] });
    let out = "";
    let err = "";
    proc.stdout.on("data", (d) => (out += d));
    proc.stderr.on("data", (d) => (err += d));
    proc.stdin.end(prompt);
    proc.on("close", (code) => {
      try {
        const j = JSON.parse(out) as { is_error?: boolean; result?: string; total_cost_usd?: number; subtype?: string };
        done({
          ok: code === 0 && !j.is_error,
          custo: j.total_cost_usd ?? 0,
          resposta: (j.result ?? "").trim().split("\n").pop() ?? "",
          erro: j.is_error ? `${j.subtype ?? "erro"}: ${(j.result ?? "").slice(0, 300)}` : undefined,
        });
      } catch {
        done({ ok: false, custo: 0, resposta: "", erro: `saida_invalida (exit ${code}): ${(err || out).slice(0, 500)}` });
      }
    });
  });
}
