/**
 * Publicação e rollback de um produto no Shopify (núcleo, sem fs).
 *
 * Ordem (regra #0 + princípio 4): o chamador já persistiu os textos/payloads → estado atual lido →
 * snapshot persistido pelo chamador (`antesDeEscrever`) → metaobjectUpsert → metafieldsSet atômico
 * com compareDigest → releitura de conferência.
 */
import { metafieldVazio } from "../lib/shopify/queries.js";
import type { ShopifyWriteClient } from "../lib/shopify/client.js";
import type { PublicacaoProduto } from "../lib/types.js";
import type { PayloadV1 } from "../validator/regras.js";
import {
  deleteMetafields,
  deleteMetaobjeto,
  lerMetafields,
  metaobjetosExistentes,
  setMetafields,
  upsertMetaobjeto,
  atualizarDescricao,
  type MetafieldAtual,
} from "../publisher/shopify.js";

export type Snapshot = {
  capturado_em: string;
  run_id: string;
  shop: string;
  product_gid: string;
  product_updated_at: string;
  metafields: Record<string, MetafieldAtual>;
  /** descrição do produto antes da publicação (sempre capturada: é o que o rollback restaura) */
  descricao_html?: string;
};

export type PlanoFormato = { formato: string; payload: PayloadV1 };

export async function publicarProduto(opts: {
  client: ShopifyWriteClient;
  runId: string;
  shopDomain: string;
  productGid: string;
  planos: PlanoFormato[];
  /** formatos que nem chegaram aqui (reprovados, erro), para o log */
  pulados: { formato: string; motivo: string }[];
  /** handles de metaobjetos que o próprio pipeline já criou para este produto (podem ser re-upsertados) */
  jaPublicados: Set<string>;
  /** persiste o snapshot; se lançar erro, nada é escrito no Shopify */
  antesDeEscrever: (snapshot: Snapshot) => Promise<string>;
  aplicar: boolean;
  log?: (msg: string) => void;
}): Promise<PublicacaoProduto & { snapshot?: Snapshot }> {
  const { client, planos } = opts;
  const log = opts.log ?? (() => undefined);
  const lojaAdmin = opts.shopDomain.replace(".myshopify.com", "");
  const pub: PublicacaoProduto & { snapshot?: Snapshot } = {
    status: "nao_publicado",
    publicado_em: null,
    admin_url: `https://admin.shopify.com/store/${lojaAdmin}/products/${opts.productGid.split("/").pop()}`,
    formatos_publicados: [],
    formatos_pulados: [...opts.pulados],
    metafields: [],
    criados: {},
    reaproveitados: [],
    snapshot_path: null,
  };

  try {
    // 1) Estado atual: alvo precisa continuar vazio (não sobrescreve edição feita no admin).
    const alvos = planos.map((p) => `${p.payload.metafield.namespace}.${p.payload.metafield.key}`);
    if (!alvos.length) return pub;
    const atual = await lerMetafields(client, opts.productGid, alvos);
    const existentes = await metaobjetosExistentes(client, planos.flatMap((p) => p.payload.metaobjects));
    const jaFeitos: string[] = [];
    const aplicaveis = planos.filter(({ formato, payload }) => {
      const mf = `${payload.metafield.namespace}.${payload.metafield.key}`;
      if (!metafieldVazio(atual.valores[mf]?.value)) {
        // Retomada após queda no meio da publicação: o valor atual é exatamente o que o pipeline escreveria.
        const esperado = valorEsperado(payload, (h) => (opts.jaPublicados.has(h) ? existentes.get(`${payload.metaobjects.find((m) => m.handle === h)?.type}/${h}`) : undefined));
        if (esperado !== null && esperado === atual.valores[mf]?.value) {
          jaFeitos.push(formato);
          return false;
        }
        pub.formatos_pulados.push({ formato, motivo: "preenchido_fora_do_pipeline" });
        return false;
      }
      const alheio = payload.metaobjects.find((m) => existentes.has(`${m.type}/${m.handle}`) && !opts.jaPublicados.has(m.handle));
      if (alheio) {
        pub.formatos_pulados.push({ formato, motivo: `handle_existente:${alheio.handle}` });
        return false;
      }
      return true;
    });

    if (!aplicaveis.length) {
      if (jaFeitos.length) {
        pub.status = pub.formatos_pulados.length ? "parcial" : "publicado";
        pub.formatos_publicados = jaFeitos;
        pub.publicado_em = new Date().toISOString();
      }
      return pub;
    }

    log(`${aplicaveis.map((p) => p.formato).join(", ")} → ${opts.aplicar ? "aplicando" : "dry-run"}`);
    if (!opts.aplicar) return pub;

    // Descrição do produto: no máximo um formato por produto escreve nela.
    const comDescricao = aplicaveis.filter((p) => p.payload.descricao_html !== undefined);
    if (comDescricao.length > 1) throw new Error(`mais de um formato reescreve a descrição: ${comDescricao.map((p) => p.formato).join(", ")}`);

    // 2) Snapshot ANTES de qualquer mutation (princípio 4). Sem snapshot persistido, não escreve.
    const snapshot: Snapshot = {
      capturado_em: new Date().toISOString(),
      run_id: opts.runId,
      shop: opts.shopDomain,
      product_gid: opts.productGid,
      product_updated_at: atual.updatedAt,
      metafields: atual.valores,
      descricao_html: atual.descriptionHtml,
    };
    pub.snapshot_path = await opts.antesDeEscrever(snapshot);
    pub.snapshot = snapshot;

    // 3) Metaobjetos (upsert por handle: idempotente em retry).
    const gidPorHandle = new Map<string, string>();
    for (const { payload } of aplicaveis) {
      for (const m of payload.metaobjects) {
        const gid = await upsertMetaobjeto(client, m);
        gidPorHandle.set(m.handle, gid);
        pub.criados[m.handle] = gid;
      }
      pub.reaproveitados.push(...payload.reuse.map((r) => ({ handle: r.handle, gid: r.gid })));
    }

    // 4) Metafields num único metafieldsSet (atômico), com compareDigest do snapshot.
    const sets = aplicaveis.map(({ formato, payload }) => {
      const mf = `${payload.metafield.namespace}.${payload.metafield.key}`;
      const value = valorEsperado(payload, (h) => gidPorHandle.get(h))!;
      pub.metafields.push({ metafield: mf, formato, antes: atual.valores[mf]?.value ?? null, depois: value });
      return {
        ownerId: opts.productGid,
        namespace: payload.metafield.namespace,
        key: payload.metafield.key,
        type: payload.metafield.type,
        value,
        compareDigest: atual.valores[mf]?.compareDigest ?? null,
      };
    });
    // Descrição antes do marcador: se a descrição falhar, o marcador não fica dizendo que foi reescrita.
    const [desc] = comDescricao;
    if (desc) {
      const agora = await lerMetafields(client, opts.productGid, []);
      if (agora.descriptionHtml !== atual.descriptionHtml) throw new Error("descrição mudou no admin durante a publicação");
      await atualizarDescricao(client, opts.productGid, desc.payload.descricao_html!);
      // Registra já: se algo falhar daqui em diante, o log sabe que a descrição mudou e o que havia antes.
      pub.descricao = { formato: desc.formato, antes: atual.descriptionHtml, depois: desc.payload.descricao_html! };
    }
    await setMetafields(client, sets);

    // 5) Conferência: relê e compara.
    const depois = await lerMetafields(client, opts.productGid, alvos);
    const divergentes = pub.metafields.filter((m) => depois.valores[m.metafield]?.value !== m.depois);
    if (divergentes.length) throw new Error(`conferência falhou: ${divergentes.map((d) => d.metafield).join(", ")}`);
    if (desc) {
      // O Shopify pode normalizar o HTML: guarda o que ficou na loja, que é o que o rollback compara.
      if (normalizarHtml(depois.descriptionHtml) !== normalizarHtml(desc.payload.descricao_html!)) {
        log(`aviso: descrição relida difere do enviado só na normalização do Shopify`);
      }
      if (!depois.descriptionHtml.trim()) throw new Error("conferência falhou: descrição vazia após a publicação");
      pub.descricao = { formato: desc.formato, antes: atual.descriptionHtml, depois: depois.descriptionHtml };
    }

    pub.formatos_publicados = [...jaFeitos, ...aplicaveis.map((p) => p.formato)];
    pub.status = pub.formatos_pulados.length ? "parcial" : "publicado";
    pub.publicado_em = new Date().toISOString();
  } catch (err) {
    pub.status = "erro";
    pub.erro = String(err);
  }
  return pub;
}

function normalizarHtml(html: string): string {
  return html.replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
}

/** Valor final do metafield: rich_text literal ou refs resolvidas. null se alguma ref não resolve. */
function valorEsperado(payload: PayloadV1, gidDe: (handle: string) => string | undefined): string | null {
  if (payload.metafield.value) return payload.metafield.value;
  const refs: string[] = [];
  for (const r of payload.metafield.value_refs ?? []) {
    const m = r.match(/^<GID:(.+)>$/);
    const gid = m ? gidDe(m[1]) : r;
    if (!gid) return null;
    refs.push(gid);
  }
  return payload.metafield.type.startsWith("list.") ? JSON.stringify(refs) : refs[0];
}

/**
 * Rollback de uma publicação: restaura cada metafield ao snapshot (ou apaga, se estava vazio) e remove
 * os metaobjetos CRIADOS naquela publicação. Reaproveitados nunca são tocados. Se alguém editou no
 * admin depois da publicação, não atropela: devolve os editados e não muda nada.
 */
export async function reverterPublicacao(opts: {
  client: ShopifyWriteClient;
  pub: PublicacaoProduto;
  snapshot: Snapshot;
  aplicar: boolean;
}): Promise<{ ok: boolean; editados: string[]; erro?: string }> {
  const { client, pub, snapshot } = opts;
  const mfs = pub.metafields.map((m) => m.metafield);
  const atual = await lerMetafields(client, snapshot.product_gid, mfs);
  const editados = pub.metafields.filter((m) => atual.valores[m.metafield]?.value !== m.depois).map((m) => m.metafield);
  if (pub.descricao && normalizarHtml(atual.descriptionHtml) !== normalizarHtml(pub.descricao.depois)) editados.push("descricao_html");
  if (pub.descricao && snapshot.descricao_html === undefined) return { ok: false, editados: [], erro: "snapshot_sem_descricao" };
  if (editados.length) return { ok: false, editados, erro: "editado_no_admin_depois_da_publicacao" };
  if (!opts.aplicar) return { ok: true, editados: [] };

  if (pub.descricao) await atualizarDescricao(client, snapshot.product_gid, snapshot.descricao_html!);
  const restaurar = pub.metafields.filter((m) => snapshot.metafields[m.metafield]?.value);
  const apagar = pub.metafields.filter((m) => !snapshot.metafields[m.metafield]?.value);
  if (restaurar.length) {
    await setMetafields(
      client,
      restaurar.map((m) => {
        const [namespace, key] = m.metafield.split(".");
        const antes = snapshot.metafields[m.metafield]!;
        return { ownerId: snapshot.product_gid, namespace, key, type: antes.type, value: antes.value, compareDigest: atual.valores[m.metafield]?.compareDigest ?? null };
      }),
    );
  }
  if (apagar.length) {
    await deleteMetafields(client, apagar.map((m) => ({ ownerId: snapshot.product_gid, namespace: m.metafield.split(".")[0], key: m.metafield.split(".")[1] })));
  }
  for (const gid of Object.values(pub.criados)) await deleteMetaobjeto(client, gid);

  const depois = await lerMetafields(client, snapshot.product_gid, mfs);
  const divergentes = mfs.filter((m) => (depois.valores[m]?.value ?? null) !== (snapshot.metafields[m]?.value ?? null));
  if (pub.descricao && normalizarHtml(depois.descriptionHtml) !== normalizarHtml(snapshot.descricao_html!)) divergentes.push("descricao_html");
  if (divergentes.length) return { ok: false, editados: [], erro: `conferência do rollback falhou: ${divergentes.join(", ")}` };
  return { ok: true, editados: [] };
}
