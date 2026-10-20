import type { FormatoContrato } from "../../core/config.js";
import type { ShopifyReadClient } from "./client.js";

export type ProdutoShopify = {
  id: string;
  handle: string;
  title: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED" | "UNLISTED";
  productType: string;
  tags: string[];
  updatedAt: string;
  onlineStoreUrl: string | null;
  precoMin: number;
  descriptionHtml: string;
  /** valor atual de cada metafield do contrato (null = vazio), indexado por "namespace.key" */
  metafields: Record<string, { type: string; value: string } | null>;
  /** metafields de texto fora do contrato que servem de fonte de ficha (null = vazio) */
  textosFonte: Record<string, string | null>;
};

/** Metafields legados com texto do produto, lidos só como fonte de ficha (nunca escritos). */
export const METAFIELDS_FONTE = [
  "custom.actives",
  "custom.benefits",
  "custom.caracteristicas_plain",
  // Judge.me: fonte verificável para cards numéricos de eficácia (nota e nº de avaliações)
  "reviews.rating",
  "reviews.rating_count",
] as const;

type ProdutoNode = Omit<ProdutoShopify, "metafields" | "textosFonte" | "precoMin"> & {
  priceRangeV2: { minVariantPrice: { amount: string } };
  [alias: `mf_${number}` | `src_${number}`]: { type: string; value: string } | null;
};

type ProductsPage = {
  products: { nodes: ProdutoNode[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
};

function produtosQuery(formatos: FormatoContrato[]): string {
  const mfs = formatos
    .map((f, i) => {
      const [namespace, key] = f.metafield.split(".");
      return `mf_${i}: metafield(namespace: ${JSON.stringify(namespace)}, key: ${JSON.stringify(key)}) { type value }`;
    })
    .join("\n        ");
  const fontes = METAFIELDS_FONTE.map((m, i) => {
    const [namespace, key] = m.split(".");
    return `src_${i}: metafield(namespace: ${JSON.stringify(namespace)}, key: ${JSON.stringify(key)}) { type value }`;
  }).join("\n        ");
  return `query Produtos($after: String) {
    products(first: 50, after: $after, sortKey: TITLE) {
      nodes {
        id handle title status productType tags updatedAt onlineStoreUrl descriptionHtml
        priceRangeV2 { minVariantPrice { amount } }
        ${mfs}
        ${fontes}
      }
      pageInfo { hasNextPage endCursor }
    }
  }`;
}

/** Lê todos os produtos da loja com os metafields do contrato. Read-only. */
export async function listarProdutos(client: ShopifyReadClient, formatos: FormatoContrato[]): Promise<ProdutoShopify[]> {
  const produtos: ProdutoShopify[] = [];
  const doc = produtosQuery(formatos);
  for await (const node of client.paginate<ProductsPage, ProdutoNode>(doc, (d) => d.products, {}, 50 * (2 + formatos.length + METAFIELDS_FONTE.length))) {
    const metafields: ProdutoShopify["metafields"] = {};
    formatos.forEach((f, i) => {
      const mf = node[`mf_${i}`];
      metafields[f.metafield] = mf && !metafieldVazio(mf.value) ? mf : null;
    });
    const textosFonte: ProdutoShopify["textosFonte"] = {};
    METAFIELDS_FONTE.forEach((m, i) => {
      const mf = node[`src_${i}`];
      textosFonte[m] = mf && !metafieldVazio(mf.value) ? mf.value : null;
    });
    produtos.push({
      id: node.id,
      handle: node.handle,
      title: node.title,
      status: node.status,
      productType: node.productType,
      tags: node.tags,
      updatedAt: node.updatedAt,
      onlineStoreUrl: node.onlineStoreUrl,
      precoMin: Number(node.priceRangeV2.minVariantPrice.amount),
      descriptionHtml: node.descriptionHtml,
      metafields,
      textosFonte,
    });
  }
  return produtos;
}

/** rich_text sem texto, lista vazia e string em branco contam como vazio. */
export function metafieldVazio(value: string | null | undefined): boolean {
  if (value == null || value.trim() === "" || value.trim() === "[]") return true;
  try {
    const parsed = JSON.parse(value);
    if (parsed?.type === "root") return textoRichText(parsed).trim() === "";
  } catch {
    // não é JSON: texto simples
  }
  return false;
}

/** Texto de um rich_text. Blocos (parágrafos, títulos, itens de lista) ficam em linhas separadas. */
export function textoRichText(node: { type?: string; value?: string; children?: unknown[] }): string {
  const sep = node.type === "root" || node.type === "list" ? "\n" : "";
  return (node.value ?? "") + (node.children ?? []).map((c) => textoRichText(c as typeof node)).join(sep);
}

export type MetaobjetoReuso = { id: string; handle: string; type: string; fields: Record<string, string | null> };

type MetaobjectsPage = {
  metaobjects: {
    nodes: { id: string; handle: string; type: string; fields: { key: string; value: string | null }[] }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

/**
 * Catálogo de metaobjetos existentes por tipo, pro generator headless reaproveitar
 * (substitui o check-before-create que a skill pdp-content faz via MCP no modo interativo).
 */
export async function catalogoReuso(client: ShopifyReadClient, tipos: string[]): Promise<Record<string, MetaobjetoReuso[]>> {
  const doc = `query Catalogo($type: String!, $after: String) {
    metaobjects(type: $type, first: 100, after: $after) {
      nodes { id handle type fields { key value } }
      pageInfo { hasNextPage endCursor }
    }
  }`;
  const catalogo: Record<string, MetaobjetoReuso[]> = {};
  for (const type of tipos) {
    catalogo[type] = [];
    for await (const n of client.paginate<MetaobjectsPage, MetaobjectsPage["metaobjects"]["nodes"][number]>(
      doc,
      (d) => d.metaobjects,
      { type },
      200,
    )) {
      catalogo[type].push({ id: n.id, handle: n.handle, type: n.type, fields: Object.fromEntries(n.fields.map((f) => [f.key, f.value])) });
    }
  }
  return catalogo;
}
