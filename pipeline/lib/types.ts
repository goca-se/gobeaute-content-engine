/**
 * Contrato de dados entre pipeline e painel (schema "run/v1").
 * O painel tem uma cópia destes tipos em painel/src/types.ts — manter as duas em sincronia.
 */
import type { OrigemFicha } from "./fontes/index.js";

export type StatusItem =
  | "detectado"
  | "bloqueado"
  | "gerado"
  | "reprovado_validacao"
  | "em_revisao"
  | "rejeitado"
  | "aprovado"
  | "publicado"
  | "revertido"
  | "erro";

export type EstadoFormato = "preenchido" | "gap" | "fora_piloto";

export type ProdutoRun = {
  product_gid: string;
  handle: string;
  title: string;
  status_shopify: string;
  url: string | null;
  preco: number;
  tags: string[];
  is_kit: boolean;
  /** elegivel = tem pelo menos 1 item liberado; completo = sem gap nos formatos do piloto */
  elegibilidade: "elegivel" | "bloqueado" | "completo" | "excluido";
  motivo: string | null;
  ficha_origem: OrigemFicha | null;
  formatos: Record<string, EstadoFormato>;
  /**
   * Conteúdo já preenchido que NÃO veio do pipeline (rodadas manuais anteriores).
   * null quando nenhum formato está preenchido ou tudo foi publicado pelo pipeline.
   */
  rodada_anterior: { formatos: string[]; publicado_em: string | null; fonte: "manual" } | null;
  /** última publicação deste produto pelo pipeline neste run (log por produto) */
  publicacao?: PublicacaoProduto | null;
  /** posição na fila (1 = primeiro). null quando não elegível */
  prioridade: number | null;
  /** entrou no lote de hoje (respeitando max_produtos_por_run) */
  selecionado: boolean;
  updated_at: string;
};

export type PublicacaoProduto = {
  status: "publicado" | "parcial" | "nao_publicado" | "erro" | "revertido";
  publicado_em: string | null;
  admin_url: string;
  formatos_publicados: string[];
  formatos_pulados: { formato: string; motivo: string }[];
  metafields: { metafield: string; formato: string; antes: string | null; depois: string }[];
  criados: Record<string, string>;
  reaproveitados: { handle: string; gid: string }[];
  snapshot_path: string | null;
  erro?: string;
};

export type ItemRun = {
  id: string;
  product_gid: string;
  handle: string;
  formato: string;
  metafield: string;
  status: StatusItem;
  motivo: string | null;
  input_hash: string | null;
  /** preenchidos a partir da geração (Fase 2) */
  content_path?: string | null;
  commit_sha?: string | null;
  conteudo_preview?: string | null;
  flags?: FlagValidacao[];
  custo_usd?: number | null;
};

export type FlagValidacao = {
  camada: "regras" | "llm";
  severidade: "erro" | "aviso";
  codigo: string;
  detalhe: string;
};

export type KitProposto = {
  handle: string;
  title: string;
  componentes: string[];
  evidencias: string[];
};

export type RunPayload = {
  schema: "run/v1";
  run_id: string;
  loja: string;
  shop_domain: string;
  iniciado_em: string;
  finalizado_em: string;
  status: "scan_ok" | "gerado" | "abortado" | "erro";
  geracao?: { produtos: number; custo_usd: number; gerado_em: string };
  /** commit no branch conteudos-auto com os arquivos gerados deste run */
  commit_sha?: string;
  dry_run: boolean;
  max_produtos_por_run: number;
  formatos: { formato: string; metafield: string; gerar: boolean }[];
  contagens: {
    produtos_escaneados: number;
    ativos: number;
    excluidos: number;
    completos: number;
    elegiveis: number;
    bloqueados: number;
    selecionados: number;
    itens_liberados: number;
    itens_bloqueados: number;
  };
  produtos: ProdutoRun[];
  items: ItemRun[];
  kits_propostos: KitProposto[];
};

/** Contexto de um produto elegível: é tudo o que a geração sabe sobre ele (não acessa o Shopify). */
export type FichaContexto = {
  produto: { gid: string; handle: string; title: string; url: string | null; is_kit: boolean };
  avaliacoes: { nota: number; total: number; fonte: "Judge.me"; capturado_em: string } | null;
  ficha: import("./fontes/index.js").Ficha;
};
