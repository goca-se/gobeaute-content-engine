/**
 * Refaz a proposta de composição dos kits ainda não confirmados: lista "O kit contém" da descrição
 * (determinística) + LLM casando cada item com o catálogo de avulsos. Read-only no Shopify.
 * Nunca confirma nem toca kit com `confirmado: true`: a confirmação continua humana.
 *
 *   npx tsx scripts/propor-kits.ts --loja kokeshi                 # imprime e salva em runs/propor-kits-<id>.json
 *   npx tsx scripts/propor-kits.ts --loja kokeshi --apply         # + reescreve as entradas não confirmadas no kits.yaml
 *   npx tsx scripts/propor-kits.ts --loja kokeshi --handle kit-x  # só esses kits
 *   npx tsx scripts/propor-kits.ts --loja kokeshi --de runs/propor-kits-<id>.json --apply   # grava uma revisão já feita, sem LLM
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { parseDocument } from "yaml";
import { chat, extrairJson } from "../core/llm.js";
import { novoRunId } from "../core/scan.js";
import { assertEnabled, getLoja, loadContrato, loadPipelineConfig, PIPELINE_DIR, REPO_ROOT } from "../lib/config.js";
import { carregarKits } from "../lib/fontes/carregar.js";
import { ehKit } from "../lib/fontes/kit.js";
import { htmlParaTexto } from "../lib/fontes/shopify.js";
import { ShopifyReadClient } from "../lib/shopify/client.js";
import { listarProdutos, type ProdutoShopify } from "../lib/shopify/queries.js";
import { avulsosAtivos, itensDaLista, proporPelaLista } from "../scanner/kits.js";

const { values } = parseArgs({
  options: {
    loja: { type: "string" },
    apply: { type: "boolean", default: false },
    handle: { type: "string", multiple: true },
    de: { type: "string" },
  },
});
if (!values.loja) {
  console.error("uso: propor-kits --loja <marca> [--apply] [--handle <h>...] [--de <revisao.json>]");
  process.exit(2);
}

const config = loadPipelineConfig();
assertEnabled(config);
const loja = getLoja(config, values.loja);
const fonteKit = loja.fontes_produto.find((f) => f.tipo === "kit");
if (!fonteKit || fonteKit.tipo !== "kit") throw new Error(`${loja.marca} não tem fonte "kit" no pipeline.yaml`);
const kitsPath = resolve(REPO_ROOT, fonteKit.path);
const runId = `propor-kits-${novoRunId(loja.marca)}`;
const SYSTEM = `Você identifica os produtos que compõem um kit de e-commerce de cosméticos.
Recebe o título e a descrição do kit e o catálogo de produtos avulsos (handle | título | preço).
Regras:
- Use só handles que existem no catálogo, copiados exatamente.
- Baseie-se no que a descrição e o título dizem. Não complete o kit por palpite: item que você não consegue
  ligar a um único handle com segurança vai para "nao_identificados".
- "quantidade" é o número de unidades daquele produto no kit (padrão 1).
- Se o kit diz "N passos" ou "N em 1" e você achou menos itens, registre isso em "observacao".
Responda só com JSON: {"itens":[{"handle":"...","quantidade":1,"trecho":"trecho da descrição que justifica"}],"nao_identificados":["..."],"observacao":"..."}`;

type ItemLlm = { handle: string; quantidade: number; trecho: string };
type Revisao = {
  handle: string;
  title: string;
  componentes: string[];
  quantidade?: number;
  nota: string;
  concorda: boolean | null;
  tokens: number;
};

const revisoes: Revisao[] = values.de ? (JSON.parse(readFileSync(resolve(values.de), "utf8")) as Revisao[]) : await revisarTodos();
revisoes.sort((a, b) => a.handle.localeCompare(b.handle));
if (!values.de) {
  mkdirSync(resolve(PIPELINE_DIR, "runs"), { recursive: true });
  const out = resolve(PIPELINE_DIR, "runs", `${runId}.json`);
  writeFileSync(out, JSON.stringify(revisoes, null, 2));
  console.error(`[propor-kits] revisão salva em ${out}`);
}

async function revisarTodos(): Promise<Revisao[]> {
  const token = process.env[config.llm.token_env];
  if (!token) throw new Error(`defina ${config.llm.token_env}`);
  const client = ShopifyReadClient.fromEnv(loja.shop_domain, loja.credenciais_env_leitura, config.shopify_api_version);
  const produtos = await listarProdutos(client, loadContrato(loja.marca).pdp);
  const avulsos = avulsosAtivos(produtos);
  const mapeados = carregarKits(kitsPath).kits;
  const alvos = produtos.filter(
    (p) =>
      p.status === "ACTIVE" &&
      ehKit(p) &&
      !mapeados[p.handle]?.confirmado &&
      (!values.handle?.length || values.handle.includes(p.handle)),
  );
  console.error(`[propor-kits] ${alvos.length} kits não confirmados · ${avulsos.length} avulsos no catálogo`);

  // Poucas chamadas em paralelo para não estourar o rate limit do proxy.
  const revisoes: Revisao[] = [];
  const falhas: string[] = [];
  const fila = [...alvos];
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      for (let kit = fila.shift(); kit; kit = fila.shift()) {
        try {
          revisoes.push(await revisar(kit, avulsos, token));
        } catch (err) {
          falhas.push(`${kit.handle}: ${String(err).slice(0, 200)}`);
        }
      }
    }),
  );
  if (falhas.length) console.error(`falhas (${falhas.length}):\n  ${falhas.join("\n  ")}`);
  return revisoes;
}

async function revisar(kit: ProdutoShopify, avulsos: ProdutoShopify[], token: string): Promise<Revisao> {
  const porHandle = new Map(avulsos.map((p) => [p.handle, p]));
  const catalogo = avulsos.map((p) => `- ${p.handle} | ${p.title} | R$ ${p.precoMin.toFixed(2)}`).join("\n");
  const descricao = htmlParaTexto(kit.descriptionHtml);
  const lista = proporPelaLista(kit, avulsos);
  const itensLista = itensDaLista(descricao)?.length ?? 0;
  const { texto, tokens } = await chat(config.llm, token, config.llm.modelo_validacao, [
    { role: "system", content: SYSTEM },
    { role: "user", content: `## Kit\nTítulo: ${kit.title}\nHandle: ${kit.handle}\nDescrição:\n${descricao || "(vazia)"}\n\n## Catálogo de avulsos\n${catalogo}` },
  ]);
  const r = extrairJson(texto) as { itens?: ItemLlm[]; nao_identificados?: string[]; observacao?: string };

  const qtds = new Map<string, number>();
  const descartados: string[] = [];
  for (const i of r.itens ?? []) {
    if (!porHandle.has(i.handle)) descartados.push(i.handle);
    else qtds.set(i.handle, (qtds.get(i.handle) ?? 0) + Math.max(1, Math.round(Number(i.quantidade) || 1)));
  }
  const componentes = [...qtds.keys()];
  const unico = componentes.length === 1 ? qtds.get(componentes[0])! : 0;

  // Concordância com a lista "O kit contém" (quando há): o LLM mantém tudo que a lista casou
  // e acha um produto por item da lista (os ambíguos da lista ele pode resolver).
  const concorda = lista ? lista.componentes.every((h) => qtds.has(h)) && componentes.length === itensLista : null;
  const partes = [
    `revisão ${runId}`,
    concorda === null ? "sem lista na descrição" : concorda ? "lista da descrição e LLM concordam" : "lista da descrição e LLM DIVERGEM",
    ...(r.itens ?? []).filter((i) => porHandle.has(i.handle)).map((i) => `${i.handle} ×${i.quantidade ?? 1} ← "${i.trecho}"`),
    ...(componentes.length > 1 && [...qtds.values()].some((q) => q > 1) ? [`quantidades: ${[...qtds].map(([h, q]) => `${h} ×${q}`).join(", ")}`] : []),
    ...(lista && !concorda ? [`lista: ${lista.componentes.join(", ")}`] : []),
    ...(r.nao_identificados?.length ? [`não identificados: ${r.nao_identificados.join(" | ")}`] : []),
    ...(descartados.length ? [`handles inexistentes descartados: ${descartados.join(", ")}`] : []),
    ...(r.observacao ? [`obs: ${r.observacao}`] : []),
  ];
  return {
    handle: kit.handle,
    title: kit.title,
    componentes,
    ...(unico >= 2 ? { quantidade: unico } : {}),
    nota: partes.join("; "),
    concorda,
    tokens,
  };
}

// Item citado que ninguém achou no catálogo (produto inativo, nome ambíguo) ≠ discordar de um item.
const status = (r: Revisao) =>
  r.componentes.length === 0
    ? "VAZIO"
    : r.nota.includes("não identificados:")
      ? "INCOMPLETO"
      : r.concorda === false
        ? "DIVERGE"
        : r.componentes.length === 1 && !r.quantidade
        ? "PARCIAL"
        : r.concorda
          ? "ok (lista)"
          : "ok (LLM)";
for (const r of revisoes) {
  const comp = r.quantidade ? `${r.quantidade}× ${r.componentes[0]}` : r.componentes.join(", ");
  console.log(`${status(r).padEnd(10)} ${r.handle} → ${comp || "-"}`);
  if (status(r) === "DIVERGE" || status(r) === "INCOMPLETO") console.log(`           ${r.nota}`);
}
const conta = (s: string) => revisoes.filter((r) => status(r) === s).length;
console.log(
  `\n${revisoes.length} revisados · ${conta("ok (lista)")} ok pela lista+LLM · ${conta("ok (LLM)")} ok só LLM · ${conta("DIVERGE")} divergem · ${conta("INCOMPLETO")} incompletos · ` +
    `${conta("PARCIAL")} parciais · ${conta("VAZIO")} vazios · ${revisoes.filter((r) => r.quantidade).length} de quantidade · ` +
    `${revisoes.reduce((s, r) => s + r.tokens, 0)} tokens`,
);

if (values.apply) {
  const doc = existsSync(kitsPath) ? parseDocument(readFileSync(kitsPath, "utf8")) : parseDocument("kits: {}\n");
  let escritos = 0;
  for (const r of revisoes) {
    if (r.componentes.length === 0) continue; // sem proposta melhor: mantém o que está lá
    if (doc.getIn(["kits", r.handle, "confirmado"]) === true) continue;
    doc.setIn(["kits", r.handle], {
      componentes: r.componentes,
      ...(r.quantidade ? { quantidade: r.quantidade } : {}),
      confirmado: false,
      nota: r.nota,
    });
    escritos++;
  }
  writeFileSync(kitsPath, doc.toString({ lineWidth: 0 }));
  console.log(`✓ ${escritos} entradas reescritas em ${kitsPath} (todas com confirmado: false)`);
} else {
  console.log("(dry-run: rode com --apply para gravar no kits.yaml)");
}
