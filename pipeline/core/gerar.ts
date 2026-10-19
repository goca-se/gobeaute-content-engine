/**
 * Geração de um formato de PDP via AI Proxy. Uma chamada por formato (cabe no tempo de um
 * request do worker e deixa o retry com feedback do validator por formato).
 *
 * Sem ferramentas e sem Shopify: todo o contexto vai no prompt (ficha, brandbook, ANVISA,
 * references da skill pdp-content, catálogo de reuso filtrado). A saída é o mesmo trio da
 * regra #0 (content.md, content.json, shopify-payload.json), que quem chama persiste ANTES de publicar.
 */
import { z } from "zod";
import type { MetaobjetoReuso } from "../lib/shopify/queries.js";
import type { FichaContexto } from "../lib/types.js";
import { PayloadV1 } from "../validator/regras.js";
import type { FormatoContrato, LlmConfig } from "./config.js";
import { chat, extrairJson, type MensagemLlm } from "./llm.js";

/** Textos de referência da marca e da skill, embutidos no bundle do worker ou lidos do disco na CLI. */
export type ContextoMarca = {
  marca: string;
  brandbook: string;
  compliance: string;
  /** .claude/skills/pdp-content/SKILL.md */
  skillPdp: string;
  /** references/*.md da skill, por nome de arquivo (ex.: "format-faq.md") */
  referencias: Record<string, string>;
};

/** Reference da skill que cobre cada formato do contrato. */
export const REFERENCIA_POR_FORMATO: Record<string, string> = {
  "descricao-curta": "format-bullets.md",
  faq: "format-faq.md",
  "section-efficacy": "format-section-efficacy.md",
  "como-usar": "format-como-usar.md",
  "modo-de-uso": "format-descricao.md",
  precaucoes: "format-descricao.md",
  composicao: "format-descricao.md",
  icones: "format-icones.md",
  ingredientes: "format-ingredientes.md",
};

/** Regras do pipeline por formato (complementam as references da skill). */
const REGRAS_FORMATO: Record<string, (handle: string) => string> = {
  "descricao-curta": (h) =>
    `1 metaobjeto novo \`${h}-benefits\` (type product_benefit) com os campos \`descricao\` (rich_text), \`titulo_destacado\` (rich_text, curto, caixa alta), \`beneficios\` (string JSON de uma lista com 4 a 6 strings, cada uma começando com emoji semântico) e \`cor_bullet_point\` = "". metafield.value_refs = ["<GID:${h}-benefits>"].`,
  faq: (h) =>
    `De 5 a 7 perguntas no total. Reuse um faq_item do catálogo **só** se a pergunta for genérica e a resposta continuar verdadeira para este produto (ex.: cruelty-free), e só itens da lista "reutilizáveis" abaixo. Sem item adequado, crie um novo. Perguntas novas: handle \`${h}-faq-N\` (N = 1, 2, …), campos \`question\` (texto) e \`answer\` (rich_text). Priorize as perguntas da coluna FAQ da ficha, se existirem. metafield.value_refs = lista ordenada ("<GID:handle>" para novos, GID literal para reuso).`,
  "section-efficacy": (h) =>
    `De 3 a 5 cards (type eficiencia_item). **Card numérico só com fonte**: a prova de eficácia da ficha (citada) ou as avaliações Judge.me do contexto, com \`footnote\` no formato \`*Base: N avaliações Judge.me, <mês>/<ano>\` (não escreva "verificadas"). Use **um** card numérico de avaliações (nota média com 1 casa decimal, ex.: "4,7/5"), não dois com o mesmo dado. Selos: **reuse** os eficiencia_item da lista "reutilizáveis" quando o selo bater **e a ficha confirmar o selo** (ex.: só use cruelty-free se a ficha disser cruelty-free). Selo novo: campos \`text\` + \`state\` = "Active", sem ícone. Cards novos: handle \`${h}-<proposito>\`. Campos de um card numérico: \`text\` (≤ 80 chars), \`number\` (≤ 12 chars), \`footnote\`, \`state\` = "Active".`,
  "como-usar": (h) =>
    `1 metaobjeto \`${h}-como-usar\` (type como_usar) com o campo \`steps\` (string JSON de uma lista de 5 a 8 passos no imperativo, 1 linha cada), baseado no modo de uso da ficha. Sem campo de imagem/arquivo. metafield.value_refs = ["<GID:${h}-como-usar>"].`,
  "modo-de-uso": () => `Rich_text direto no metafield: metaobjects = [], metafield.value = string JSON rich_text {"type":"root","children":[...]}. Baseado no modo de uso da ficha.`,
  precaucoes: () => `Rich_text direto no metafield: metaobjects = [], metafield.value = string JSON rich_text. Advertências e cuidados de uso, só o que a ficha sustenta ou o que é padrão para a categoria pela ANVISA.`,
  composicao: () => `Rich_text direto no metafield: metaobjects = [], metafield.value = string JSON rich_text. **Só com o INCI literal da ficha**; sem INCI completo, bloqueie.`,
};

const Saida = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("ok"),
    content_md: z.string().min(20),
    conteudo: z.unknown(),
    payload: z.record(z.unknown()),
  }),
  z.object({ status: z.literal("bloqueado"), motivo: z.string().min(2), detalhe: z.string().default("") }),
]);

export type Gerado =
  | { status: "ok"; content_md: string; content_json: Record<string, unknown>; payload: PayloadV1 }
  | { status: "bloqueado"; motivo: string; detalhe: string };

export type ResultadoGeracao = { gerado: Gerado | null; tokens: number; modelo: string; erro?: string; chamadas: number };

/**
 * Filtra o catálogo para o prompt: só itens reutilizáveis entre produtos (FAQ e selos universais).
 * product_benefit e como_usar são sempre 1 por produto, então não entram.
 */
export function catalogoParaPrompt(formato: FormatoContrato, catalogo: Record<string, MetaobjetoReuso[]>, handlesProdutos: string[]): MetaobjetoReuso[] {
  const tipo = formato.metaobject_type;
  if (!tipo || !["faq_item", "eficiencia_item", "product_icon"].includes(tipo)) return [];
  const universal = (h: string) => !handlesProdutos.some((p) => h.startsWith(`${p}-`) || h === p);
  return (catalogo[tipo] ?? [])
    .filter((m) => universal(m.handle))
    .filter((m) => tipo !== "eficiencia_item" || !m.fields.number) // selos (badges), não cards numéricos de outro produto
    .slice(0, 120);
}

export async function gerarFormato(opts: {
  llm: LlmConfig;
  token: string;
  contexto: ContextoMarca;
  shop: string;
  formato: FormatoContrato;
  ficha: FichaContexto;
  catalogo: MetaobjetoReuso[];
  feedback?: string | null;
}): Promise<ResultadoGeracao> {
  const { formato, ficha, contexto } = opts;
  const handle = ficha.produto.handle;
  const referencia = contexto.referencias[REFERENCIA_POR_FORMATO[formato.formato] ?? ""] ?? "";
  const schemaPayload = contexto.referencias["shopify-payload-schema.md"] ?? "";

  const system = `Você gera conteúdo de PDP para a marca ${contexto.marca} dentro de um pipeline automático (sem humano no loop).

Regras invioláveis:
- Nunca pergunte nada. Se faltar informação para gerar com fidelidade, responda com status "bloqueado".
- A reference do formato descreve o conteúdo ideal. Quando a ficha não tem um dado que a reference sugere (frequência, quantidade, tipo de pele/cabelo, compatibilidades, tempo de resultado…), **omita esse ponto** e gere com o que a ficha sustenta: isso NÃO é motivo para bloquear. Bloqueie só quando a ficha não sustenta nem o mínimo do formato (ex.: FAQ sem 5 perguntas respondíveis com a ficha; como-usar sem modo de uso na ficha; composição sem INCI).
- Passos de uso podem detalhar o modo de uso da ficha em ações menores (molhar, aplicar, massagear, enxaguar…), sem acrescentar o que ela não diz.
- A ficha do produto é a ÚNICA fonte de fatos: nunca invente ingrediente, número, porcentagem, claim, selo ou certificação.
- Siga o tom de voz do brandbook e as regras ANVISA. Nunca escreva [VALIDAR] nem [REGULATÓRIO]: se precisaria disso, bloqueie.
- Não gere imagens nem campos de imagem.
- Responda SOMENTE com um objeto JSON, sem markdown em volta.

# Brandbook (${contexto.marca})
${contexto.brandbook}

# Compliance ANVISA
${contexto.compliance}

# Skill pdp-content (convenções Goshop)
${contexto.skillPdp}

# Reference do formato
${referencia}

# Schema obrigatório do payload
${schemaPayload}`;

  const user = `## Produto
- Título: ${ficha.produto.title}
- Handle (prefixo de todo handle novo): \`${handle}\`
- Product GID: \`${ficha.produto.gid}\`
- Loja: \`${opts.shop}\`
- É kit: ${ficha.produto.is_kit ? "sim (a ficha traz os componentes rotulados)" : "não"}

## Ficha (origem: ${ficha.ficha.origem})
${JSON.stringify(ficha.ficha, null, 2)}

## Avaliações
${ficha.avaliacoes ? JSON.stringify(ficha.avaliacoes) : "sem avaliações: nenhum card numérico de avaliação"}

## Metaobjetos reutilizáveis da loja (${formato.metaobject_type ?? "nenhum"})
${opts.catalogo.length ? JSON.stringify(opts.catalogo) : "nenhum"}

## Formato a gerar: \`${formato.formato}\` → \`${formato.metafield}\` (${formato.tipo}${formato.metaobject_type ? ` → ${formato.metaobject_type}` : ""})
${REGRAS_FORMATO[formato.formato]?.(handle) ?? ""}
${opts.feedback ? `\n## Feedback da validação anterior (corrija isto)\n${opts.feedback}\n` : ""}
## Saída
Responda com UM objeto JSON:
{"status":"ok","content_md":"<o conteúdo legível em markdown, como um revisor humano vai ler; uma seção final '## Notas para revisão' é opcional>","conteudo":<o conteúdo estruturado (o mesmo que vai no metafield/metaobjetos, em forma legível)>,"payload":<objeto no schema pdp-payload/v1, com "formato":"${formato.formato}">}
ou, se não der para gerar com fidelidade:
{"status":"bloqueado","motivo":"<snake_case curto>","detalhe":"<1 frase>"}`;

  const mensagens: MensagemLlm[] = [
    { role: "system", content: system },
    { role: "user", content: user },
  ];

  let tokens = 0;
  let modelo = opts.llm.modelo_geracao;
  let ultimoErro = "";
  // 1ª chamada + 1 reparo se o JSON vier inválido.
  for (let chamada = 1; chamada <= 2; chamada++) {
    const r = await chat(opts.llm, opts.token, opts.llm.modelo_geracao, mensagens);
    tokens += r.tokens;
    modelo = r.modelo;
    try {
      const saida = Saida.parse(extrairJson(r.texto));
      if (saida.status === "bloqueado") return { gerado: saida, tokens, modelo, chamadas: chamada };
      // Identidade do payload é determinística: o código fixa, o modelo não tem como errar.
      const [namespace, key] = formato.metafield.split(".");
      const bruto = saida.payload as Record<string, unknown> & { metafield?: Record<string, unknown> };
      const payload = PayloadV1.parse({
        ...bruto,
        schema: "pdp-payload/v1",
        shop: opts.shop,
        product_gid: ficha.produto.gid,
        product_handle: handle,
        formato: formato.formato,
        metaobjects: ((bruto.metaobjects as { fields?: { key: string; value: unknown }[] }[] | undefined) ?? []).map((m) => ({
          ...m,
          status: "ACTIVE",
          // Shopify só aceita string em field.value: listas/objetos viram JSON (ex.: beneficios, steps).
          fields: (m.fields ?? []).map((c) => ({ key: c.key, value: typeof c.value === "string" ? c.value : JSON.stringify(c.value) })),
        })),
        metafield: {
          ...(bruto.metafield ?? {}),
          namespace,
          key,
          type: formato.tipo,
          ...(typeof bruto.metafield?.value === "object" && bruto.metafield?.value ? { value: JSON.stringify(bruto.metafield.value) } : {}),
        },
      });
      return {
        gerado: {
          status: "ok",
          content_md: saida.content_md,
          content_json: { brand: contexto.marca, product_slug: handle, product_gid: ficha.produto.gid, metafield: formato.metafield, value: saida.conteudo },
          payload,
        },
        tokens,
        modelo,
        chamadas: chamada,
      };
    } catch (err) {
      ultimoErro = err instanceof z.ZodError ? err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") : String(err);
      mensagens.push(
        { role: "assistant", content: r.texto },
        { role: "user", content: `Sua resposta não é válida: ${ultimoErro.slice(0, 800)}\nResponda de novo somente com o objeto JSON corrigido.` },
      );
    }
  }
  return { gerado: null, tokens, modelo, erro: `saida_invalida: ${ultimoErro.slice(0, 500)}`, chamadas: 2 };
}
