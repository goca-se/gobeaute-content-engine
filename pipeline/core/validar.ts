/**
 * Validação de um produto: camada 1 (regras determinísticas, validator/regras.ts) por formato
 * + camada 2 (revisão LLM de compliance, alucinação e tom), uma chamada para todos os formatos.
 */
import type { FichaContexto, FlagValidacao } from "../lib/types.js";
import { validarRegras } from "../validator/regras.js";
import type { Contrato, LlmConfig } from "./config.js";
import type { ContextoMarca } from "./gerar.js";
import { chat, extrairJson } from "./llm.js";

export type ItemParaValidar = { formato: string; content_md: string; payload: unknown };
export type ResultadoValidacao = { flags: Record<string, FlagValidacao[]>; tokens: number; erroLlm?: string };

export async function validarProduto(opts: {
  llm: LlmConfig;
  token: string;
  contexto: ContextoMarca;
  contrato: Contrato;
  ficha: FichaContexto;
  itens: ItemParaValidar[];
  catalogo: Record<string, { id: string; handle: string }[]>;
  outrosHandles: string[];
  usarLlm?: boolean;
}): Promise<ResultadoValidacao> {
  const { ficha } = opts;
  const handle = ficha.produto.handle;
  const flags: Record<string, FlagValidacao[]> = {};
  const av = ficha.avaliacoes;

  for (const item of opts.itens) {
    const formato = opts.contrato.pdp.find((f) => f.formato === item.formato);
    if (!formato) throw new Error(`formato ${item.formato} fora do contrato`);
    flags[item.formato] = validarRegras(item.payload, item.content_md, {
      handle,
      productGid: ficha.produto.gid,
      formato,
      fonteTexto: ficha.ficha.raw + "\n" + Object.values(ficha.ficha).join("\n"),
      // A nota aparece arredondada no card (4,74 → "4,7").
      numerosAceitos: av ? [String(av.nota), av.nota.toFixed(1), String(av.total), "5"] : [],
      catalogo: opts.catalogo,
      outrosHandles: opts.outrosHandles.filter((h) => h !== handle),
    });
  }

  if (opts.usarLlm === false || !opts.itens.length) return { flags, tokens: 0 };

  const prompt = `Você é revisor(a) de compliance e tom de voz de conteúdo de PDP da marca ${opts.contexto.marca}. Não pergunte nada.

# Ficha do produto (única fonte de fatos)
${JSON.stringify({ produto: ficha.produto, avaliacoes: ficha.avaliacoes, ficha: ficha.ficha }, null, 2)}

# Brandbook
${opts.contexto.brandbook}

# Regras ANVISA
${opts.contexto.compliance}

# Conteúdo gerado para "${ficha.produto.title}"
${opts.itens.map((i) => `## ${i.formato}\n### content.md\n${i.content_md}\n### shopify-payload.json\n${JSON.stringify(i.payload)}`).join("\n\n")}

Aponte SOMENTE problemas reais no que vai para a loja (ignore a seção "Notas para revisão" do content.md):
- "erro": claim proibido pela ANVISA; fato, ingrediente, número, selo ou claim que NÃO está na ficha (alucinação); violação do "do not say" da ficha; conteúdo de outro produto.
- "aviso": tom fora do brandbook; repetição entre formatos; texto confuso ou com erro de português.
- Kits: tom de venda (rotina completa, por que os itens funcionam juntos, presente) é esperado e não é problema. É "erro" dizer que o kit sai mais em conta que comprar separado quando ficha.precos não mostra o kit mais barato que soma_avulsos, e citar valor em R$ ou percentual de desconto.

Responda APENAS com JSON, sem markdown:
{"problemas":[{"formato":"<nome do formato>","severidade":"erro|aviso","codigo":"<snake_case curto>","detalhe":"<trecho + por quê, 1 frase>"}]}
Se não houver problema: {"problemas":[]}`;

  try {
    const r = await chat(opts.llm, opts.token, opts.llm.modelo_validacao, [{ role: "user", content: prompt }]);
    const corpo = extrairJson(r.texto) as { problemas?: { formato: string; severidade: string; codigo: string; detalhe: string }[] };
    for (const p of corpo.problemas ?? []) {
      // Problema sem formato reconhecido vale para todos (ex.: repetição entre formatos).
      const alvos = flags[p.formato] ? [p.formato] : Object.keys(flags);
      for (const f of alvos) {
        flags[f].push({ camada: "llm", severidade: p.severidade === "erro" ? "erro" : "aviso", codigo: p.codigo, detalhe: p.detalhe });
      }
    }
    return { flags, tokens: r.tokens };
  } catch (err) {
    // Sem a camada 2 nada é publicado: o motor trata erroLlm como "tentar de novo depois".
    return { flags, tokens: 0, erroLlm: String(err).slice(0, 300) };
  }
}
