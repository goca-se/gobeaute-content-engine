/**
 * Camada 1 do validator: regras determinísticas (schema, limites, compliance por regex).
 * Derivadas de brand-context/_shared/compliance-anvisa.md e das references da skill pdp-content.
 */
import { z } from "zod";
import type { FormatoContrato } from "../core/config.js";
import type { FlagValidacao } from "../lib/types.js";

const Campo = z.object({ key: z.string(), value: z.string() });
export const PayloadV1 = z
  .object({
    schema: z.literal("pdp-payload/v1"),
    shop: z.string(),
    product_gid: z.string().startsWith("gid://shopify/Product/"),
    product_handle: z.string().optional(),
    formato: z.string(),
    metaobjects: z.array(
      z.object({ type: z.string(), handle: z.string(), status: z.literal("ACTIVE"), fields: z.array(Campo).min(1) }),
    ),
    reuse: z.array(z.object({ gid: z.string().startsWith("gid://shopify/Metaobject/"), handle: z.string(), type: z.string() })).default([]),
    metafield: z.object({
      namespace: z.string(),
      key: z.string(),
      type: z.string(),
      value: z.string().optional(),
      value_refs: z.array(z.string()).optional(),
    }),
  })
  .refine((p) => !!p.metafield.value !== !!p.metafield.value_refs, { message: "metafield precisa de value OU value_refs" });
export type PayloadV1 = z.infer<typeof PayloadV1>;

/** Termos proibidos para cosméticos (RDC 7/2015). Severidade erro = reprova. */
const PROIBIDOS: { re: RegExp; codigo: string; sev: "erro" | "aviso" }[] = [
  { re: /\bcur(a|ar|am|ou|ando)\b/i, codigo: "anvisa_cura", sev: "erro" },
  { re: /\btrat(a|am|ar|amento|amentos)\b/i, codigo: "anvisa_trata", sev: "erro" },
  { re: /\belimin(a|am|ar|ando)\b/i, codigo: "anvisa_elimina", sev: "erro" },
  { re: /\bremov(e|em|er)\s+(as\s+)?manchas\b/i, codigo: "anvisa_remove_manchas", sev: "erro" },
  { re: /\bclarei(a|am|ar)\b/i, codigo: "anvisa_clareia", sev: "erro" },
  { re: /\bacaba(m)?\s+com\b/i, codigo: "anvisa_acaba_com", sev: "erro" },
  { re: /\btira(m)?\s+(as\s+)?olheiras\b/i, codigo: "anvisa_tira_olheiras", sev: "erro" },
  { re: /\brejuvenesc/i, codigo: "anvisa_rejuvenesce", sev: "erro" },
  { re: /\bpenetra\b[^.]{0,40}\bderme\b/i, codigo: "anvisa_derme", sev: "erro" },
  { re: /\brepar(a|ar)\s+(o\s+)?dna\b|\bdetox\b|\bdesintoxic/i, codigo: "anvisa_biologico", sev: "erro" },
  { re: /\bestimul(a|ar)\b[^.]{0,30}\bcol[aá]geno\b/i, codigo: "anvisa_estimula_colageno", sev: "erro" },
  { re: /\banti-?envelhecimento\b|\banti-?idade\b/i, codigo: "anvisa_anti_idade", sev: "aviso" },
];

/** Claims que exigem laudo: só passam se a própria ficha trouxer o claim. */
const EXIGEM_LAUDO: { re: RegExp; codigo: string }[] = [
  { re: /hipoalerg[eê]nic/i, codigo: "claim_hipoalergenico" },
  { re: /n[aã]o[\s-]comedog[eê]nic/i, codigo: "claim_nao_comedogenico" },
  { re: /dermatologicamente\s+testad|aprovad[oa]\s+por\s+dermatologistas/i, codigo: "claim_dermatologico" },
  { re: /oftalmologicamente\s+testad/i, codigo: "claim_oftalmologico" },
];

const MARCADORES = /\[(VALIDAR|REGULAT[ÓO]RIO)[^\]]*\]/i;
const NUMERO_CLAIM = /(\d+(?:[.,]\d+)?)\s*(%|h\b|horas?\b|dias?\b|x\b|vezes\b)/gi;

export type ContextoValidacao = {
  handle: string;
  productGid: string;
  formato: FormatoContrato;
  /** texto da ficha (para conferir números e claims que exigem laudo) */
  fonteTexto: string;
  /** números aceitos como fonte (ex.: nota e total do Judge.me) */
  numerosAceitos: string[];
  catalogo: Record<string, { id: string; handle: string }[]>;
  /** handles de outros produtos da loja, para detectar reuso de metaobjeto específico */
  outrosHandles: string[];
};

export function validarRegras(payload: unknown, contentMd: string, ctx: ContextoValidacao): FlagValidacao[] {
  const flags: FlagValidacao[] = [];
  const erro = (codigo: string, detalhe: string) => flags.push({ camada: "regras", severidade: "erro", codigo, detalhe });
  const aviso = (codigo: string, detalhe: string) => flags.push({ camada: "regras", severidade: "aviso", codigo, detalhe });

  const parsed = PayloadV1.safeParse(payload);
  if (!parsed.success) {
    erro("schema", parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
    return flags;
  }
  const p = parsed.data;
  const f = ctx.formato;

  // Identidade: payload é deste produto, deste formato, deste metafield.
  if (p.product_gid !== ctx.productGid) erro("produto_errado", `${p.product_gid} ≠ ${ctx.productGid}`);
  if (p.formato !== f.formato) erro("formato_errado", `${p.formato} ≠ ${f.formato}`);
  if (`${p.metafield.namespace}.${p.metafield.key}` !== f.metafield) erro("metafield_errado", `${p.metafield.namespace}.${p.metafield.key} ≠ ${f.metafield}`);
  if (p.metafield.type !== f.tipo) erro("tipo_errado", `${p.metafield.type} ≠ ${f.tipo}`);

  // Metaobjetos: tipo do contrato, handle prefixado pelo produto, referências resolvem.
  const handlesNovos = new Set(p.metaobjects.map((m) => m.handle));
  for (const m of p.metaobjects) {
    if (m.type !== f.metaobject_type) erro("metaobject_type", `${m.handle}: ${m.type} ≠ ${f.metaobject_type}`);
    if (!m.handle.startsWith(`${ctx.handle}-`)) erro("handle_prefixo", `${m.handle} não começa com ${ctx.handle}-`);
    if (m.handle.length > 255) erro("handle_longo", m.handle);
  }
  const catalogoTipo = new Map((ctx.catalogo[f.metaobject_type ?? ""] ?? []).map((c) => [c.id, c.handle]));
  for (const r of p.reuse) {
    if (r.type !== f.metaobject_type) erro("reuso_tipo", `${r.handle}: ${r.type}`);
    if (!catalogoTipo.has(r.gid)) erro("reuso_inexistente", `${r.gid} (${r.handle}) não está no catálogo da loja`);
    const dono = ctx.outrosHandles.find((h) => r.handle.startsWith(`${h}-`));
    if (dono) aviso("reuso_especifico", `${r.handle} é específico de ${dono}; prefira um item universal ou crie um novo`);
  }
  const refs = p.metafield.value_refs ?? [];
  for (const ref of refs) {
    const m = ref.match(/^<GID:(.+)>$/);
    if (m && !handlesNovos.has(m[1])) erro("ref_quebrada", `${ref} não está em metaobjects[]`);
    if (!m && !p.reuse.some((r) => r.gid === ref)) erro("ref_quebrada", `${ref} não está em reuse[]`);
  }
  if (f.tipo === "metaobject_reference" && refs.length !== 1) erro("refs_quantidade", `esperado 1 ref, veio ${refs.length}`);
  if (f.tipo === "list.metaobject_reference") {
    if (f.min_itens && refs.length < f.min_itens) erro("itens_poucos", `${refs.length} < ${f.min_itens}`);
    if (f.max_itens && refs.length > f.max_itens) erro("itens_demais", `${refs.length} > ${f.max_itens}`);
  }
  if (f.tipo === "rich_text_field") {
    if (!richTextValido(p.metafield.value)) erro("rich_text_invalido", "metafield.value não é rich_text root");
    else if (f.min_chars && textoDe(p.metafield.value!).length < f.min_chars) erro("texto_curto", `< ${f.min_chars} chars`);
  }

  // Campos por tipo de metaobjeto (references da skill).
  for (const m of p.metaobjects) {
    const v = Object.fromEntries(m.fields.map((c) => [c.key, c.value]));
    switch (m.type) {
      case "product_benefit": {
        if (!richTextValido(v.descricao)) erro("campo", `${m.handle}.descricao não é rich_text`);
        if (!richTextValido(v.titulo_destacado)) erro("campo", `${m.handle}.titulo_destacado não é rich_text`);
        const bs = listaJson(v.beneficios);
        if (!bs || bs.length < 3 || bs.length > 6) erro("campo", `${m.handle}.beneficios precisa de 3 a 6 itens`);
        if (v.cor_bullet_point) erro("campo", `${m.handle}.cor_bullet_point deve ficar vazio`);
        break;
      }
      case "faq_item":
        if (!v.question?.trim()) erro("campo", `${m.handle}.question vazio`);
        if (!richTextValido(v.answer)) erro("campo", `${m.handle}.answer não é rich_text`);
        break;
      case "eficiencia_item":
        if (!v.text?.trim() || v.text.length > 80) erro("campo", `${m.handle}.text vazio ou > 80 chars`);
        if (v.number && v.number.length > 12) erro("campo", `${m.handle}.number > 12 chars`);
        if (v.footnote && v.footnote.length > 200) erro("campo", `${m.handle}.footnote > 200 chars`);
        if (!["Active", "Inactive"].includes(v.state)) erro("campo", `${m.handle}.state inválido`);
        if (v.number) {
          if (!v.footnote) erro("numero_sem_fonte", `${m.handle}: card numérico sem footnote`);
          const nums = v.number.match(/\d+(?:[.,]\d+)?/g) ?? [];
          const semFonte = nums.filter((n) => !numeroTemFonte(n, ctx));
          if (semFonte.length) erro("numero_sem_fonte", `${m.handle}: ${semFonte.join(", ")} não aparece na ficha nem nas avaliações`);
        }
        break;
      case "como_usar": {
        const steps = listaJson(v.steps);
        if (!steps || steps.length < (f.min_itens ?? 1) || steps.length > (f.max_itens ?? 99)) {
          erro("campo", `${m.handle}.steps fora do intervalo ${f.min_itens}–${f.max_itens}`);
        }
        break;
      }
    }
  }

  // Compliance sobre todo o texto visível (payload + content.md).
  // Seções internas do content.md ("Notas para revisão", "Fontes") não vão para o Shopify.
  const mdVisivel = contentMd
    .split(/^(?=## )/m)
    .filter((s) => !/^## *(notas|fontes?)\b/i.test(s))
    .join("");
  const textos = [mdVisivel, ...p.metaobjects.flatMap((m) => m.fields.filter((c) => c.key !== "footnote").map((c) => textoDe(c.value))), textoDe(p.metafield.value ?? "")];
  const tudo = textos.join("\n");
  if (MARCADORES.test(tudo)) erro("marcador_pendente", tudo.match(MARCADORES)![0]);
  for (const { re, codigo, sev } of PROIBIDOS) {
    const m = tudo.match(re);
    if (m) flags.push({ camada: "regras", severidade: sev, codigo, detalhe: trecho(tudo, m.index!) });
  }
  for (const { re, codigo } of EXIGEM_LAUDO) {
    const m = tudo.match(re);
    if (m && !re.test(ctx.fonteTexto)) erro(codigo, `claim sem laudo na ficha: ${trecho(tudo, m.index!)}`);
  }
  for (const m of tudo.matchAll(NUMERO_CLAIM)) {
    if (!numeroTemFonte(m[1], ctx)) erro("numero_sem_fonte", trecho(tudo, m.index!));
  }
  return flags;
}

function numeroTemFonte(n: string, ctx: ContextoValidacao): boolean {
  const variantes = [n, n.replace(",", "."), n.replace(".", ",")];
  return variantes.some((v) => ctx.numerosAceitos.includes(v) || ctx.fonteTexto.includes(v));
}

function richTextValido(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const j = JSON.parse(value);
    return j?.type === "root" && Array.isArray(j.children) && textoDe(value).trim().length > 0;
  } catch {
    return false;
  }
}

function listaJson(value: string | undefined): string[] | null {
  try {
    const j = JSON.parse(value ?? "");
    return Array.isArray(j) && j.every((x) => typeof x === "string" && x.trim()) ? j : null;
  } catch {
    return null;
  }
}

/** Texto plano de um valor: rich_text JSON, lista JSON ou string. */
export function textoDe(value: string): string {
  try {
    const j = JSON.parse(value);
    if (j?.type === "root") return coletar(j);
    if (Array.isArray(j)) return j.join("\n");
  } catch {
    // string simples
  }
  return value;
}

function coletar(node: { value?: string; children?: unknown[] }): string {
  return (node.value ?? "") + (node.children ?? []).map((c) => coletar(c as typeof node)).join(" ");
}

function trecho(texto: string, i: number): string {
  return `…${texto.slice(Math.max(0, i - 40), i + 60).replace(/\s+/g, " ").trim()}…`;
}
