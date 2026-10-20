import type { ProdutoShopify } from "../lib/shopify/queries.js";
import { htmlParaTexto } from "../lib/fontes/shopify.js";
import { ehKit } from "../lib/fontes/kit.js";
import type { KitProposto } from "../lib/types.js";

const STOP = new Set(["de", "da", "do", "das", "dos", "e", "com", "para", "o", "a", "os", "as", "em", "kokeshi", "-"]);

export function tokens(texto: string): string[] {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\b\d+([.,]\d+)?\s*(ml|g|gr|un|%)\b/g, " ")
    .split(/[^a-z0-9]+/)
    .filter((t) => t && !STOP.has(t));
}

function ngramas(toks: string[], min = 2, max = 4): string[] {
  const out: string[] = [];
  for (let n = min; n <= max; n++) for (let i = 0; i + n <= toks.length; i++) out.push(toks.slice(i, i + n).join(" "));
  return out;
}

/** Produtos que podem compor um kit: avulsos ativos, sem brinde. */
export function avulsosAtivos(produtos: ProdutoShopify[]): ProdutoShopify[] {
  return produtos.filter((p) => p.status === "ACTIVE" && !ehKit(p) && !/brinde|gift/i.test(`${p.handle} ${p.title}`));
}

export type ItemLista = { texto: string; quantidade: number };

/**
 * Lê a lista "O kit contém: 1 unid do X; 1 unidade do Y…" da descrição.
 * Item começa em "N unid/unidade(s)/x/un" ou em número solto logo após separador (início, ";", "•", quebra de linha).
 */
export function itensDaLista(descricao: string): ItemLista[] | null {
  const m = descricao.match(/kit\s+cont[eé]m\s*:?\s*([\s\S]*)/i);
  if (!m) return null;
  // A lista acaba no primeiro fim de frase depois dela.
  const bloco = m[1].split(/\.\s+(?=[A-ZÀ-Ú])|\n\s*\n/)[0];
  const INICIO = /(?:^|[;\n•·]\s*|\s)(\d{1,2})\s*(?:x\b|unid(?:ades?|\.)?\b|un\.?\b)\s*|(?:^|[;\n•·])\s*(\d{1,2})\s+(?=[a-zà-ú])/gi;
  const marcas: { ini: number; fim: number; qtd: number }[] = [];
  for (const x of bloco.matchAll(INICIO)) marcas.push({ ini: x.index!, fim: x.index! + x[0].length, qtd: Number(x[1] ?? x[2]) });
  if (!marcas.length) return null;
  const itens = marcas
    .map((mk, i) => ({
      // item vai até o próximo marcador ou a quebra de linha (o que vem depois da lista não é item)
      texto: bloco
        .slice(mk.fim, marcas[i + 1]?.ini ?? bloco.length)
        .split("\n")[0]
        .replace(/^\s*(d[oae]s?|de)\s+/i, "")
        .replace(/[;.,\s]+$/, "")
        .trim(),
      quantidade: mk.qtd,
    }))
    .filter((i) => i.texto && i.quantidade > 0);
  return itens.length ? itens : null;
}

// Palavras que a descrição usa para qualquer produto: podem faltar no título sem desqualificar o par.
const GENERICAS = new Set(["creme", "gel", "hidratante", "facial", "puro", "regiao", "unidade", "produto"]);

/**
 * Casa o texto de um item com um avulso: vence quem tem mais palavras do título presentes no item.
 * Palavra específica do item ausente do título desqualifica ("creme para mãos" ≠ "creme para o corpo").
 * Empate no topo ou menos de 2 palavras em comum → ambíguo (null); quem decide é a revisão.
 */
export function casarItem(texto: string, avulsos: ProdutoShopify[]): string | null {
  const doItem = new Set(tokens(texto));
  const placar = avulsos
    .map((p) => {
      const doTitulo = new Set(tokens(p.title));
      const sobra = [...doItem].some((t) => !doTitulo.has(t) && !GENERICAS.has(t));
      return { handle: p.handle, pontos: sobra ? 0 : [...doTitulo].filter((t) => doItem.has(t)).length };
    })
    .sort((a, b) => b.pontos - a.pontos);
  const [primeiro, segundo] = placar;
  if (!primeiro || primeiro.pontos < 2 || (segundo && segundo.pontos === primeiro.pontos)) return null;
  return primeiro.handle;
}

/** Proposta a partir da lista "O kit contém", quando a descrição traz uma. */
export function proporPelaLista(kit: ProdutoShopify, avulsos: ProdutoShopify[]): Omit<KitProposto, "handle" | "title"> | null {
  const itens = itensDaLista(htmlParaTexto(kit.descriptionHtml));
  if (!itens) return null;
  const qtds = new Map<string, number>();
  const evidencias: string[] = [];
  for (const item of itens) {
    const h = casarItem(item.texto, avulsos);
    if (h) qtds.set(h, (qtds.get(h) ?? 0) + item.quantidade);
    evidencias.push(h ? `${h} ×${item.quantidade} ← "${item.texto}"` : `não identificado ×${item.quantidade}: "${item.texto}"`);
  }
  if (!qtds.size) return null;
  const componentes = [...qtds.keys()];
  const total = qtds.get(componentes[0])!;
  return {
    componentes,
    ...(componentes.length === 1 && total >= 2 ? { quantidade: total } : {}),
    evidencias: [`lista "O kit contém"`, ...evidencias],
  };
}

/**
 * Proposta pelo título: cruza título + descrição do kit com frases que identificam um único
 * avulso ativo (n-gramas exclusivos do título). Fallback de quando não há lista.
 */
function proporPeloTitulo(kit: ProdutoShopify, donos: Map<string, Set<string>>): Omit<KitProposto, "handle" | "title"> | null {
  const texto = ` ${tokens(`${kit.title} ${htmlParaTexto(kit.descriptionHtml)}`).join(" ")} `;
  const achados = new Map<string, string>();
  for (const [frase, hs] of donos) {
    if (hs.size !== 1 || !texto.includes(` ${frase} `)) continue;
    const [handle] = hs;
    // guarda a frase mais longa como evidência
    if (!achados.has(handle) || achados.get(handle)!.length < frase.length) achados.set(handle, frase);
  }
  if (achados.size === 0) return null;
  return { componentes: [...achados.keys()], evidencias: [...achados].map(([h, f]) => `${h} ← "${f}"`) };
}

/**
 * Propõe a composição de cada kit sem entrada no kits.yaml: primeiro pela lista "O kit contém"
 * da descrição, senão por frases do título dos avulsos. É só proposta: entra no kits.yaml com
 * `confirmado: false` para revisão humana (o scripts/propor-kits.ts refina com LLM).
 */
export function proporKits(produtos: ProdutoShopify[], jaMapeados: Set<string>): KitProposto[] {
  const avulsos = avulsosAtivos(produtos);

  // frase → produtos avulsos que a contêm no título
  const donos = new Map<string, Set<string>>();
  for (const p of avulsos) {
    for (const g of new Set(ngramas(tokens(p.title)))) {
      if (!donos.has(g)) donos.set(g, new Set());
      donos.get(g)!.add(p.handle);
    }
  }

  const propostas: KitProposto[] = [];
  for (const kit of produtos.filter((p) => p.status === "ACTIVE" && ehKit(p) && !jaMapeados.has(p.handle))) {
    const proposta = proporPelaLista(kit, avulsos) ?? proporPeloTitulo(kit, donos);
    if (proposta) propostas.push({ handle: kit.handle, title: kit.title, ...proposta });
  }
  return propostas;
}
