import type { ShopifyReadClient, ShopifyWriteClient } from "../lib/shopify/client.js";

export type MetafieldAtual = { id: string; type: string; value: string; compareDigest: string } | null;

/** Lê o estado atual dos metafields (com compareDigest) de um produto. */
export async function lerMetafields(
  client: ShopifyReadClient,
  productGid: string,
  metafields: string[],
): Promise<{ updatedAt: string; title: string; descriptionHtml: string; valores: Record<string, MetafieldAtual> }> {
  const aliases = metafields
    .map((m, i) => {
      const [namespace, key] = m.split(".");
      return `m${i}: metafield(namespace: ${JSON.stringify(namespace)}, key: ${JSON.stringify(key)}) { id type value compareDigest }`;
    })
    .join("\n      ");
  const data = await client.query<{ product: ({ updatedAt: string; title: string; descriptionHtml: string } & Record<string, MetafieldAtual>) | null }>(
    `query Atual($id: ID!) { product(id: $id) { updatedAt title descriptionHtml
      ${aliases}
    } }`,
    { id: productGid },
  );
  if (!data.product) throw new Error(`produto ${productGid} não encontrado`);
  return {
    updatedAt: data.product.updatedAt,
    title: data.product.title,
    descriptionHtml: data.product.descriptionHtml,
    valores: Object.fromEntries(metafields.map((m, i) => [m, data.product![`m${i}`] ?? null])),
  };
}

/** Metaobjetos existentes com estes handles (para não sobrescrever o que não é nosso). */
export async function metaobjetosExistentes(client: ShopifyReadClient, itens: { type: string; handle: string }[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  for (const it of itens) {
    const data = await client.query<{ metaobjectByHandle: { id: string } | null }>(
      `query H($h: MetaobjectHandleInput!) { metaobjectByHandle(handle: $h) { id } }`,
      { h: { type: it.type, handle: it.handle } },
    );
    if (data.metaobjectByHandle) out.set(`${it.type}/${it.handle}`, data.metaobjectByHandle.id);
  }
  return out;
}

export async function upsertMetaobjeto(
  client: ShopifyWriteClient,
  m: { type: string; handle: string; fields: { key: string; value: string }[] },
): Promise<string> {
  const r = await client.mutate<{ metaobject: { id: string; handle: string } }>(
    `mutation Up($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
      metaobjectUpsert(handle: $handle, metaobject: $metaobject) { metaobject { id handle } userErrors { field message code } }
    }`,
    {
      handle: { type: m.type, handle: m.handle },
      metaobject: { fields: m.fields, capabilities: { publishable: { status: "ACTIVE" } } },
    },
    "metaobjectUpsert",
  );
  return r.metaobject.id;
}

export async function setMetafields(
  client: ShopifyWriteClient,
  metafields: { ownerId: string; namespace: string; key: string; type: string; value: string; compareDigest: string | null }[],
): Promise<void> {
  await client.mutate(
    `mutation Set($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) { metafields { id namespace key } userErrors { field message code } }
    }`,
    { metafields },
    "metafieldsSet",
  );
}

export async function deleteMetafields(client: ShopifyWriteClient, metafields: { ownerId: string; namespace: string; key: string }[]): Promise<void> {
  await client.mutate(
    `mutation Del($metafields: [MetafieldIdentifierInput!]!) {
      metafieldsDelete(metafields: $metafields) { deletedMetafields { key namespace } userErrors { field message } }
    }`,
    { metafields },
    "metafieldsDelete",
  );
}

export async function deleteMetaobjeto(client: ShopifyWriteClient, id: string): Promise<void> {
  await client.mutate(
    `mutation DelMo($id: ID!) { metaobjectDelete(id: $id) { deletedId userErrors { field message code } } }`,
    { id },
    "metaobjectDelete",
  );
}

/** Substitui a descrição do produto (descriptionHtml). Só depois do snapshot da descrição anterior. */
export async function atualizarDescricao(client: ShopifyWriteClient, productGid: string, html: string): Promise<void> {
  await client.mutate(
    `mutation Desc($product: ProductUpdateInput!) {
      productUpdate(product: $product) { product { id } userErrors { field message } }
    }`,
    { product: { id: productGid, descriptionHtml: html } },
    "productUpdate",
  );
}
