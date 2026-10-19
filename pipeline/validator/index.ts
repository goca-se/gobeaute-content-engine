/**
 * Validator: camada 1 (regras determinísticas) + camada 2 (revisão LLM de compliance e tom).
 * Atualiza o status de cada item gerado no run.json: em_revisao | reprovado_validacao | bloqueado | erro.
 *
 *   npx tsx validator/index.ts --run <run_id> [--handle <handle>...] [--sem-llm]
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { parseArgs } from "node:util";
import { getLoja, loadContrato, loadPipelineConfig, PIPELINE_DIR, REPO_ROOT } from "../lib/config.js";
import type { FlagValidacao, ItemRun, RunPayload } from "../lib/types.js";
import { validarRegras } from "./regras.js";

const { values } = parseArgs({
  options: {
    run: { type: "string" },
    handle: { type: "string", multiple: true },
    "sem-llm": { type: "boolean", default: false },
  },
});
if (!values.run) {
  console.error("uso: validator --run <run_id> [--handle <handle>...] [--sem-llm]");
  process.exit(2);
}

const config = loadPipelineConfig();
const runDir = resolve(PIPELINE_DIR, "runs", values.run);
const runPath = resolve(runDir, "run.json");
const run = JSON.parse(readFileSync(runPath, "utf8")) as RunPayload;
const loja = getLoja(config, run.loja);
const contrato = loadContrato(loja.marca);
const catalogo = JSON.parse(readFileSync(resolve(runDir, "catalogo-reuso.json"), "utf8"));
const geracao: { handle: string; ok: boolean; custo_usd: number }[] = existsSync(resolve(runDir, "geracao.json"))
  ? JSON.parse(readFileSync(resolve(runDir, "geracao.json"), "utf8"))
  : [];

const gerados = new Set(geracao.filter((g) => g.ok).map((g) => g.handle));
const handles = values.handle?.length ? values.handle : [...gerados];
const outrosHandles = run.produtos.map((p) => p.handle);
const MAX_PREVIEW = 6000;

let custoLlm = 0;
for (const handle of handles) {
  const fichaCtx = JSON.parse(readFileSync(resolve(runDir, "fichas", `${handle}.json`), "utf8"));
  const dirProduto = resolve(REPO_ROOT, "conteudos", loja.marca, "produtos", handle);
  // Itens já decididos por humano (ou publicados) nunca são reavaliados.
  const itens = run.items.filter(
    (i) => i.handle === handle && i.status !== "bloqueado" && !["aprovado", "rejeitado", "publicado", "revertido"].includes(i.status),
  );
  const custoGeracao = geracao.find((g) => g.handle === handle)?.custo_usd ?? 0;

  // Camada 1, por formato.
  for (const item of itens) {
    const dir = resolve(dirProduto, item.formato);
    const textos = resolve(dir, "textos");
    item.custo_usd = Number((custoGeracao / itens.length).toFixed(4));
    if (existsSync(resolve(dir, "blocked.json"))) {
      const b = JSON.parse(readFileSync(resolve(dir, "blocked.json"), "utf8"));
      Object.assign(item, { status: "bloqueado", motivo: `generator:${b.motivo}`, flags: [], conteudo_preview: b.detalhe ?? null });
      continue;
    }
    const arquivos = ["content.md", "content.json", "shopify-payload.json"].map((a) => resolve(textos, a));
    const faltando = arquivos.filter((a) => !existsSync(a));
    if (faltando.length) {
      // Regra #0: sem os 3 arquivos não há o que revisar nem publicar.
      Object.assign(item, { status: "erro", motivo: `arquivos_ausentes:${faltando.map((a) => a.split("/").pop()).join(",")}`, flags: [] });
      continue;
    }
    const contentMd = readFileSync(arquivos[0], "utf8");
    let payload: unknown;
    try {
      payload = JSON.parse(readFileSync(arquivos[2], "utf8"));
    } catch {
      payload = null;
    }
    const formato = contrato.pdp.find((f) => f.formato === item.formato)!;
    const flags = validarRegras(payload, contentMd, {
      handle,
      productGid: item.product_gid,
      formato,
      fonteTexto: fichaCtx.ficha.raw + "\n" + Object.values(fichaCtx.ficha).join("\n"),
      numerosAceitos: fichaCtx.avaliacoes
        ? [String(fichaCtx.avaliacoes.nota), fichaCtx.avaliacoes.nota.toFixed(1), String(fichaCtx.avaliacoes.total), "5"]
        : [],
      catalogo,
      outrosHandles: outrosHandles.filter((h) => h !== handle),
    });
    // Arquivos presentes: zera status/motivo de uma validação anterior (ex.: "erro" de geração que falhou).
    Object.assign(item, {
      status: "gerado",
      motivo: null,
      content_path: relative(REPO_ROOT, dir),
      conteudo_preview: contentMd.slice(0, MAX_PREVIEW),
      flags,
    });
  }

  // Camada 2: uma revisão LLM por produto (todos os formatos juntos, mais barato e com visão do conjunto).
  const revisaveis = itens.filter((i) => i.content_path && i.status !== "bloqueado" && i.status !== "erro");
  if (!values["sem-llm"] && revisaveis.length) {
    const r = await revisaoLlm(handle, fichaCtx.produto.title, revisaveis);
    custoLlm += r.custo;
    for (const item of revisaveis) {
      item.flags = [...(item.flags ?? []), ...r.flags.filter((f) => f.formato === item.formato).map(({ formato: _, ...f }) => f)];
      item.custo_usd = Number(((item.custo_usd ?? 0) + r.custo / revisaveis.length).toFixed(4));
    }
    if (r.erro) for (const item of revisaveis) item.flags!.push({ camada: "llm", severidade: "aviso", codigo: "llm_indisponivel", detalhe: r.erro });
  }

  for (const item of revisaveis) {
    const erros = (item.flags ?? []).filter((f) => f.severidade === "erro");
    item.status = erros.length ? "reprovado_validacao" : "em_revisao";
    item.motivo = erros.length ? erros.map((e) => e.codigo).join(",") : null;
  }
  const resumo = itens.map((i) => `${i.formato}=${i.status}${i.flags?.length ? `(${i.flags.length} flags)` : ""}`).join(" ");
  console.error(`[validator] ${handle}: ${resumo}`);
}

const custoGeracaoTotal = geracao.reduce((s, g) => s + g.custo_usd, 0);
run.status = "gerado";
run.geracao = { produtos: gerados.size, custo_usd: Number((custoGeracaoTotal + custoLlm).toFixed(2)), gerado_em: new Date().toISOString() };
writeFileSync(runPath, JSON.stringify(run, null, 2));
const cont = (s: string) => run.items.filter((i) => i.status === s).length;
console.log(
  `validação: em_revisao ${cont("em_revisao")} · reprovado ${cont("reprovado_validacao")} · bloqueado(generator) ${run.items.filter((i) => i.motivo?.startsWith("generator:")).length} · erro ${cont("erro")} · LLM US$ ${custoLlm.toFixed(2)}`,
);

type FlagLlm = FlagValidacao & { formato: string };

function revisaoLlm(handle: string, title: string, itens: ItemRun[]): Promise<{ flags: FlagLlm[]; custo: number; erro?: string }> {
  const fichaRel = relative(REPO_ROOT, resolve(runDir, "fichas", `${handle}.json`));
  const prompt = `Você é revisor(a) de compliance e tom de voz de conteúdo de PDP da marca ${loja.marca}. Modo headless: não pergunte nada, não edite nada.

Leia:
- Ficha do produto (única fonte de fatos): ${fichaRel}
- Brandbook: brand-context/${loja.marca}/brandbook.md
- Regras ANVISA: brand-context/_shared/compliance-anvisa.md
- Conteúdo gerado para "${title}":
${itens.map((i) => `  - ${i.formato}: ${i.content_path}/textos/content.md e ${i.content_path}/textos/shopify-payload.json`).join("\n")}

Aponte SOMENTE problemas reais:
- "erro": claim proibido pela ANVISA; fato, ingrediente, número ou claim que NÃO está na ficha (alucinação); violação do "do not say" da ficha; conteúdo de outro produto.
- "aviso": tom fora do brandbook; repetição entre formatos; texto confuso ou com erro de português.

Responda APENAS com JSON, sem markdown:
{"problemas":[{"formato":"<nome do formato>","severidade":"erro|aviso","codigo":"<snake_case curto>","detalhe":"<trecho + por quê, 1 frase>"}]}
Se não houver problema: {"problemas":[]}`;

  return new Promise((done) => {
    const proc = spawn(
      "claude",
      ["-p", "--output-format", "json", "--strict-mcp-config", "--max-budget-usd", "0.60", "--allowedTools", "Read", "Glob", "Grep",
        "--disallowedTools", "Bash", "Write", "Edit", "WebFetch", "WebSearch", "Agent", "mcp__claude_ai_Shopify"],
      { cwd: REPO_ROOT, stdio: ["pipe", "pipe", "pipe"] },
    );
    let out = "";
    proc.stdout.on("data", (d) => (out += d));
    proc.stdin.end(prompt);
    proc.on("close", () => {
      try {
        const j = JSON.parse(out) as { result?: string; total_cost_usd?: number; is_error?: boolean };
        const texto = (j.result ?? "").replace(/^```(json)?\s*|\s*```$/g, "").trim();
        const corpo = JSON.parse(texto.slice(texto.indexOf("{"), texto.lastIndexOf("}") + 1)) as {
          problemas: { formato: string; severidade: "erro" | "aviso"; codigo: string; detalhe: string }[];
        };
        done({
          custo: j.total_cost_usd ?? 0,
          flags: corpo.problemas.map((p) => ({ camada: "llm", severidade: p.severidade === "erro" ? "erro" : "aviso", codigo: p.codigo, detalhe: p.detalhe, formato: p.formato })),
        });
      } catch (err) {
        done({ flags: [], custo: 0, erro: `revisão LLM falhou: ${String(err).slice(0, 200)}` });
      }
    });
  });
}
