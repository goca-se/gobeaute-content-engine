import { textoRichText, type ProdutoShopify } from "../shopify/queries.js";
import type { Resolucao } from "./index.js";

/**
 * Ficha a partir do conteúdo já publicado no Shopify (descrição + metafields de texto).
 * É a fonte mais fraca da cadeia: só vale se o texto disponível passar de `minChars`.
 */
export function fichaDoShopify(produto: ProdutoShopify, minChars: number): Resolucao {
  const texto = (key: string) => valorTexto(produto.metafields[key]?.value ?? produto.textosFonte[key] ?? null);

  const descricao = htmlParaTexto(produto.descriptionHtml);
  const ativos = texto("custom.actives");
  const beneficios = texto("custom.benefits");
  const modoUso = texto("custom.how_to_use");
  const advertencias = texto("custom.como_usar");
  const inci = inciDoShopify(produto);

  const total = [descricao, ativos, beneficios, modoUso].join("").length;
  if (total < minChars) return { ok: false, motivo: `falta_ficha:shopify_${total}_chars` };

  return {
    ok: true,
    ficha: {
      handle: produto.handle,
      nome: produto.title,
      origem: "shopify",
      collection: "",
      categoria: produto.productType,
      descricao,
      ativos,
      inci: inci || null,
      paraQuem: "",
      beneficios,
      provaEficacia: "",
      modoUso,
      advertencias,
      faq: "",
      claims: "",
      doNotSay: "",
      raw: JSON.stringify({ descricao, ativos, beneficios, modoUso, advertencias, inci }),
    },
  };
}

/** Composição (INCI) já publicada no produto, como texto. "" quando não há. */
export function inciDoShopify(produto: ProdutoShopify): string {
  const texto = (key: string) => valorTexto(produto.metafields[key]?.value ?? produto.textosFonte[key] ?? null);
  return texto("custom.caracteristicas_plain") || texto("custom.caracteristicas");
}

function valorTexto(value: string | null): string {
  if (!value) return "";
  try {
    const parsed = JSON.parse(value);
    if (parsed?.type === "root") return textoRichText(parsed).trim();
  } catch {
    // texto simples
  }
  return value.trim();
}

export function htmlParaTexto(html: string): string {
  return html
    .replace(/<\/(p|li|h\d|div)>|<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}
