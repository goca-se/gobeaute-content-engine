import type { FonteProdutoConfig, LojaConfig } from "../../core/config.js";
import type { ProdutoShopify } from "../shopify/queries.js";
import { ehKit, fichaDeKit, type KitsConfig } from "./kit.js";
import { fichaDoShopify } from "./shopify.js";

export type OrigemFicha = "kb_csv" | "kit" | "shopify";

/**
 * Ficha de produto normalizada. O gate e o generator só dependem desta interface,
 * então plugar uma marca com outra fonte é escrever um adapter novo.
 */
export type Ficha = {
  handle: string;
  nome: string;
  origem: OrigemFicha;
  collection: string;
  categoria: string;
  descricao: string;
  ativos: string;
  inci: string | null;
  paraQuem: string;
  beneficios: string;
  provaEficacia: string;
  modoUso: string;
  advertencias: string;
  faq: string;
  claims: string;
  doNotSay: string;
  /** só em kits: handles dos componentes, na ordem do kits.yaml */
  componentes?: string[];
  /** texto bruto de origem, entra no input_hash */
  raw: string;
};

export type Resolucao = { ok: true; ficha: Ficha } | { ok: false; motivo: string };

/** Dados das fontes já carregados (do disco na CLI, do bundle no worker). */
export type DadosFontes = { kbCsv: Ficha[]; kits: KitsConfig | null };

/**
 * Resolve a ficha de um produto percorrendo as fontes na ordem do pipeline.yaml.
 * A primeira fonte que conhece o produto decide: se ela bloquear (ex.: kit não confirmado),
 * o produto fica bloqueado, sem cair para uma fonte mais fraca.
 */
export class ResolvedorFichas {
  private kbCsv = new Map<string, Ficha>();
  private kits: KitsConfig | null = null;
  private emResolucao = new Set<string>();

  constructor(
    private fontes: FonteProdutoConfig[],
    private produtos: Map<string, ProdutoShopify>,
    dados: DadosFontes,
  ) {
    for (const fonte of fontes) {
      if (fonte.tipo === "produtos_csv" || fonte.tipo === "fichas_md") {
        throw new Error(`adapter de fonte "${fonte.tipo}" ainda não implementado`);
      }
    }
    if (fontes.some((f) => f.tipo === "kb_csv")) for (const f of dados.kbCsv) this.kbCsv.set(f.handle, f);
    if (fontes.some((f) => f.tipo === "kit")) this.kits = dados.kits ?? { kits: {} };
  }

  static paraLoja(loja: LojaConfig, produtos: ProdutoShopify[], dados: DadosFontes): ResolvedorFichas {
    return new ResolvedorFichas(loja.fontes_produto, new Map(produtos.map((p) => [p.handle, p])), dados);
  }

  get totalKbCsv(): number {
    return this.kbCsv.size;
  }

  resolver(handle: string): Resolucao {
    if (this.emResolucao.has(handle)) return { ok: false, motivo: `kit_ciclico:${handle}` };
    this.emResolucao.add(handle);
    try {
      for (const fonte of this.fontes) {
        const r = this.tentar(fonte, handle);
        if (r) return r;
      }
      return { ok: false, motivo: "falta_ficha" };
    } finally {
      this.emResolucao.delete(handle);
    }
  }

  private tentar(fonte: FonteProdutoConfig, handle: string): Resolucao | null {
    switch (fonte.tipo) {
      case "kb_csv": {
        const ficha = this.kbCsv.get(handle);
        return ficha ? { ok: true, ficha } : null;
      }
      case "kit": {
        const kit = this.kits?.kits[handle];
        if (!kit) return null;
        return fichaDeKit(handle, kit, this.produtos.get(handle), (h) => this.resolver(h));
      }
      case "shopify": {
        const produto = this.produtos.get(handle);
        if (!produto) return null;
        // Kit só gera a partir dos componentes (decisão de 19/10): sem composição confirmada, bloqueia.
        if (this.kits && ehKit(produto)) return { ok: false, motivo: "kit_sem_composicao" };
        return fichaDoShopify(produto, fonte.min_chars);
      }
      default:
        return null;
    }
  }
}
