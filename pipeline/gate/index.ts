import type { Contrato, LojaConfig } from "../core/config.js";
import { ehKit } from "../lib/fontes/kit.js";
import type { ResolvedorFichas } from "../lib/fontes/index.js";
import type { ProdutoShopify } from "../lib/shopify/queries.js";
import type { EstadoFormato, ItemRun, ProdutoRun } from "../lib/types.js";

/**
 * O que o gate precisa saber além do Shopify e das fichas. Vem do disco na CLI
 * (conteudos/<marca>/produtos/<handle>/...) e do SQLite no worker do painel.
 */
export type GateDeps = {
  brandbook: string;
  /** log de publicações do pipeline para o produto (pipeline-publicacoes.json / tabela publicacoes) */
  publicacoes: (handle: string) => { status: string; formatos_publicados: string[] }[];
  /** shopify-result.json de rodada manual (sem pipeline_run_id), se houver */
  resultadoManual: (handle: string) => { published_at?: string; pipeline_run_id?: string } | null;
  /** sha-256 hex (node:crypto na CLI, crypto.subtle no worker) */
  hash: (partes: string[]) => Promise<string>;
};

/**
 * Formatos preenchidos que não foram publicados pelo pipeline = rodada anterior (manual).
 * O publisher grava `pipeline_run_id` no shopify-result.json; resultados sem esse campo são manuais.
 */
function rodadaAnterior(deps: GateDeps, handle: string, preenchidosNoShopify: string[]): ProdutoRun["rodada_anterior"] {
  let preenchidos = preenchidosNoShopify;
  if (preenchidos.length === 0) return null;
  // Formatos publicados pelo pipeline (log por produto) não são rodada anterior.
  const log = deps.publicacoes(handle);
  if (log.length) {
    const doPipeline = new Set(log.filter((e) => e.status === "publicado" || e.status === "parcial").flatMap((e) => e.formatos_publicados));
    const revertidos = new Set(log.filter((e) => e.status === "revertido").flatMap((e) => e.formatos_publicados));
    preenchidos = preenchidos.filter((f) => !doPipeline.has(f) || revertidos.has(f));
    if (preenchidos.length === 0) return null;
  }
  const result = deps.resultadoManual(handle);
  if (result?.pipeline_run_id) return null;
  return { formatos: preenchidos, publicado_em: result?.published_at ?? null, fonte: "manual" };
}

/** Brandbook com menos que isso é tratado como não populado. */
const MIN_BRANDBOOK_CHARS = 2000;

type Exclusao = { motivo: string } | null;

/** Regras de exclusão, na ordem em que são avaliadas. Determinístico, sem LLM. */
export function exclusao(p: ProdutoShopify, loja: LojaConfig): Exclusao {
  const ex = loja.exclusoes;
  if (ex.exigir_status_active && p.status !== "ACTIVE") return { motivo: `status_${p.status.toLowerCase()}` };
  if (ex.exigir_publicado_online_store && !p.onlineStoreUrl) return { motivo: "fora_loja_online" };
  const gift = new RegExp(ex.gift_regex, "i");
  if ([p.handle, p.title, p.productType, ...p.tags].some((t) => gift.test(t))) return { motivo: "gift" };
  if (p.precoMin <= ex.gift_preco_max) return { motivo: "gift_preco" };
  const tag = p.tags.find((t) => ex.tags_excluir.includes(t.toLowerCase()));
  if (tag) return { motivo: `tag_${tag.toLowerCase()}` };
  if (ex.handles.includes(p.handle)) return { motivo: "exclusao_manual" };
  return null;
}

/**
 * Gate: para cada produto, decide quais formatos com gap estão liberados para geração
 * e quais ficam bloqueados (com motivo). Nunca pergunta, nunca inventa.
 */
export async function gate(
  produtos: ProdutoShopify[],
  loja: LojaConfig,
  contrato: Contrato,
  fichas: ResolvedorFichas,
  runId: string,
  deps: GateDeps,
): Promise<{ produtos: ProdutoRun[]; items: ItemRun[] }> {
  const brandbook = deps.brandbook;
  const brandbookOk = brandbook.length >= MIN_BRANDBOOK_CHARS;

  const outProdutos: ProdutoRun[] = [];
  const items: ItemRun[] = [];

  for (const p of produtos) {
    const formatos: Record<string, EstadoFormato> = {};
    for (const f of contrato.pdp) {
      formatos[f.formato] = p.metafields[f.metafield] ? "preenchido" : f.gerar && (!f.so_kits || ehKit(p)) ? "gap" : "fora_piloto";
    }

    const base: ProdutoRun = {
      product_gid: p.id,
      handle: p.handle,
      title: p.title,
      status_shopify: p.status,
      url: p.onlineStoreUrl,
      preco: p.precoMin,
      tags: p.tags,
      is_kit: ehKit(p),
      elegibilidade: "excluido",
      motivo: null,
      ficha_origem: null,
      formatos,
      rodada_anterior: rodadaAnterior(deps, p.handle, Object.keys(formatos).filter((k) => formatos[k] === "preenchido")),
      prioridade: null,
      selecionado: false,
      updated_at: p.updatedAt,
    };

    const ex = exclusao(p, loja);
    if (ex) {
      outProdutos.push({ ...base, motivo: ex.motivo });
      continue;
    }

    const gaps = contrato.pdp.filter((f) => formatos[f.formato] === "gap");
    if (gaps.length === 0) {
      outProdutos.push({ ...base, elegibilidade: "completo" });
      continue;
    }

    const r = fichas.resolver(p.handle);
    const motivoProduto = !brandbookOk ? "falta_brandbook" : r.ok ? null : r.motivo;
    let liberados = 0;

    for (const f of gaps) {
      let motivo = motivoProduto;
      if (!motivo && r.ok && f.requer_inci && !r.ficha.inci) motivo = "falta_inci";
      const inputHash = r.ok && !motivo ? (await deps.hash([r.ficha.raw, brandbook, JSON.stringify(f)])).slice(0, 16) : null;
      if (!motivo) liberados++;
      items.push({
        id: `${runId}:${p.handle}:${f.formato}`,
        product_gid: p.id,
        handle: p.handle,
        formato: f.formato,
        metafield: f.metafield,
        status: motivo ? "bloqueado" : "detectado",
        motivo,
        input_hash: inputHash,
      });
    }

    outProdutos.push({
      ...base,
      elegibilidade: liberados > 0 ? "elegivel" : "bloqueado",
      motivo: liberados > 0 ? null : (motivoProduto ?? "falta_inci"),
      ficha_origem: r.ok ? r.ficha.origem : null,
    });
  }

  priorizar(outProdutos, loja.max_produtos_por_run);
  return { produtos: outProdutos, items };
}

const RANK_ORIGEM = { kb_csv: 0, kit: 1, shopify: 2 } as const;

/**
 * Fila do dia: mais vendidos primeiro, depois fonte mais confiável (CSV > kit > Shopify),
 * depois mais formatos faltando. Os primeiros `max` entram no lote.
 */
function priorizar(produtos: ProdutoRun[], max: number): void {
  const fila = produtos
    .filter((p) => p.elegibilidade === "elegivel")
    .sort((a, b) => {
      const mv = Number(!b.tags.includes("Mais Vendido")) - Number(!a.tags.includes("Mais Vendido"));
      if (mv) return -mv;
      const origem = RANK_ORIGEM[a.ficha_origem!] - RANK_ORIGEM[b.ficha_origem!];
      if (origem) return origem;
      const gaps = (p: ProdutoRun) => Object.values(p.formatos).filter((e) => e === "gap").length;
      return gaps(b) - gaps(a) || a.title.localeCompare(b.title, "pt-BR");
    });
  fila.forEach((p, i) => {
    p.prioridade = i + 1;
    p.selecionado = i < max;
  });
}
