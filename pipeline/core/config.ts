/**
 * Schemas e tipos da configuração (pipeline.yaml + contrato/<marca>.yaml).
 * Sem fs/process: usado tanto pela CLI (lib/config.ts carrega os YAML do disco)
 * quanto pelo worker do painel (config embutida no bundle).
 */
import { z } from "zod";

export const MARCAS = ["apice", "barbours", "rituaria", "lescent", "kokeshi", "bysamia", "aua"] as const;

const FonteProduto = z.discriminatedUnion("tipo", [
  z.object({ tipo: z.literal("kb_csv"), path: z.string() }),
  z.object({ tipo: z.literal("produtos_csv"), path: z.string() }),
  z.object({ tipo: z.literal("fichas_md"), path: z.string() }),
  z.object({ tipo: z.literal("kit"), path: z.string() }),
  z.object({ tipo: z.literal("shopify"), min_chars: z.number().int().positive() }),
]);

const Loja = z.object({
  marca: z.enum(MARCAS),
  shop_domain: z.string().regex(/\.myshopify\.com$/, "shop_domain deve ser o domínio .myshopify.com"),
  storefront_domain: z.string(),
  credenciais_env_leitura: z.string().regex(/^[A-Z][A-Z0-9_]*$/),
  credenciais_env_escrita: z.string().regex(/^[A-Z][A-Z0-9_]*$/),
  fontes_produto: z.array(FonteProduto).min(1),
  /** receita recente por produto (scripts/sync-vendas-metabase.ts): 1º critério da fila */
  vendas_path: z.string().optional(),
  max_produtos_por_run: z.number().int().positive(),
  max_custo_usd_por_run: z.number().positive(),
  /** teto de tokens do AI Proxy por run (geração + validação) */
  max_tokens_por_run: z.number().int().positive().default(2_000_000),
  exclusoes: z.object({
    exigir_status_active: z.boolean(),
    exigir_publicado_online_store: z.boolean(),
    /** produto sem SKU em nenhuma variante = teste de CTR, não vendável */
    exigir_sku: z.boolean().default(true),
    gift_regex: z.string(),
    gift_preco_max: z.number().nonnegative(),
    tags_excluir: z.array(z.string()),
    handles: z.array(z.string()),
  }),
});

const Llm = z.object({
  base_url: z.string().url(),
  token_env: z.string().regex(/^[A-Z][A-Z0-9_]*$/),
  modelo_geracao: z.string(),
  modelo_validacao: z.string(),
  /** tentativas de geração por formato (1ª + retries com o feedback do validator) */
  max_tentativas_geracao: z.number().int().positive().default(2),
});

export const PipelineConfig = z.object({
  enabled: z.boolean(),
  dry_run: z.boolean(),
  shopify_api_version: z.string().regex(/^\d{4}-\d{2}$/),
  max_backlog_em_revisao: z.number().int().positive(),
  llm: Llm,
  lojas: z.array(Loja).min(1),
  notificacao: z.object({ google_chat_webhook_env: z.string() }),
  painel: z.object({ url_env: z.string(), api_key_env: z.string() }),
});

export const FormatoContrato = z
  .object({
    formato: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "formato deve ser kebab-case"),
    metafield: z.string().regex(/^[a-z0-9_]+\.[a-z0-9_-]+$/i, "metafield deve ser namespace.key"),
    tipo: z.enum([
      "rich_text_field",
      "multi_line_text_field",
      "single_line_text_field",
      "json",
      "metaobject_reference",
      "list.metaobject_reference",
    ]),
    metaobject_type: z.string().optional(),
    obrigatorio: z.boolean(),
    gerar: z.boolean(),
    min_chars: z.number().int().positive().optional(),
    max_chars: z.number().int().positive().optional(),
    min_itens: z.number().int().positive().optional(),
    max_itens: z.number().int().positive().optional(),
    requer_inci: z.boolean().optional(),
    renderizado_no_tema: z.union([z.boolean(), z.literal("a_confirmar")]),
    /**
     * Onde o conteúdo vai. `descricao_html` reescreve a descrição do produto (descriptionHtml);
     * aí o metafield do formato é só o marcador "já reescrito pelo pipeline" (json), que o gate lê.
     */
    destino: z.enum(["metafield", "descricao_html"]).default("metafield"),
    /** formato só para kits (nos outros produtos fica fora_piloto) */
    so_kits: z.boolean().default(false),
  })
  .refine((f) => !f.tipo.includes("metaobject_reference") || !!f.metaobject_type, {
    message: "formatos metaobject_reference precisam de metaobject_type",
  })
  .refine((f) => f.destino !== "descricao_html" || f.tipo === "json", { message: "destino descricao_html usa metafield marcador do tipo json" });

export const Contrato = z.object({ pdp: z.array(FormatoContrato).min(1) }).superRefine((c, ctx) => {
  const dup = c.pdp.map((f) => f.metafield).filter((m, i, all) => all.indexOf(m) !== i);
  if (dup.length) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `metafield duplicado: ${dup.join(", ")}` });
});

export type PipelineConfig = z.infer<typeof PipelineConfig>;
export type LojaConfig = z.infer<typeof Loja>;
export type LlmConfig = z.infer<typeof Llm>;
export type FormatoContrato = z.infer<typeof FormatoContrato>;
export type FonteProdutoConfig = z.infer<typeof FonteProduto>;
export type Contrato = z.infer<typeof Contrato>;

/** Retorna a loja da allowlist, ou lança erro. Nada fora da allowlist é tocado. */
export function getLoja(config: PipelineConfig, marca: string): LojaConfig {
  const loja = config.lojas.find((l) => l.marca === marca);
  if (!loja) throw new Error(`loja "${marca}" não está na allowlist de pipeline.yaml`);
  return loja;
}
