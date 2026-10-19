import { z } from "zod";
import type { ProdutoShopify } from "../shopify/queries.js";
import { htmlParaTexto } from "./shopify.js";
import type { Ficha, Resolucao } from "./index.js";

/**
 * Composição dos kits. Os kits da Kokeshi não são bundles nativos do Shopify:
 * a composição só existe no texto da descrição, então ela é declarada aqui e revisada por humano.
 * O scanner propõe entradas novas com `confirmado: false`; só kits confirmados geram ficha.
 */
const Kit = z
  .object({
    // Proposta automática pode achar só 1 componente; confirmar exige a composição completa.
    componentes: z.array(z.string()).min(1),
    confirmado: z.boolean(),
    nota: z.string().optional(),
  })
  .refine((k) => !k.confirmado || k.componentes.length >= 2, { message: "kit confirmado precisa de 2+ componentes" });
const KitsConfig = z.object({ kits: z.record(Kit).default({}) });

export type Kit = z.infer<typeof Kit>;
export type KitsConfig = z.infer<typeof KitsConfig>;

/** Kits, rituais, trios etc. Na Kokeshi nenhum é bundle nativo: a composição vem do kits.yaml. */
export function ehKit(p: Pick<ProdutoShopify, "handle" | "title">): boolean {
  return (
    /^(kit|super-kit|trio|duo|dupla|quarteto|ritual|rotina)-/.test(p.handle) ||
    /^(super kit|kit|trio|duo|dupla|quarteto|ritual|rotina)\b/i.test(p.title.trim())
  );
}

/** Valida o conteúdo já parseado do kits.yaml (a leitura do disco fica em carregar.ts). */
export function parseKits(dados: unknown): KitsConfig {
  return KitsConfig.parse(dados ?? {});
}

export function fichaDeKit(
  handle: string,
  kit: Kit,
  produto: ProdutoShopify | undefined,
  resolver: (handle: string) => Resolucao,
): Resolucao {
  if (!kit.confirmado) return { ok: false, motivo: "kit_nao_confirmado" };

  const componentes: Ficha[] = [];
  for (const h of kit.componentes) {
    const r = resolver(h);
    if (!r.ok) return { ok: false, motivo: `kit_componente_sem_ficha:${h}` };
    componentes.push(r.ficha);
  }

  // Cada campo vira uma lista rotulada por componente: o generator vê de onde veio cada claim.
  const porComponente = (campo: keyof Ficha) =>
    componentes
      .filter((c) => typeof c[campo] === "string" && (c[campo] as string).trim())
      .map((c) => `[${c.nome}]\n${c[campo]}`)
      .join("\n\n");

  return {
    ok: true,
    ficha: {
      handle,
      nome: produto?.title ?? handle,
      origem: "kit",
      collection: "Kits",
      categoria: "Kit",
      descricao: produto ? htmlParaTexto(produto.descriptionHtml) : "",
      ativos: porComponente("ativos"),
      // INCI de kit não se compõe: cada item tem sua fórmula, e composicao de kit fica bloqueada.
      inci: null,
      paraQuem: porComponente("paraQuem"),
      beneficios: porComponente("beneficios"),
      provaEficacia: porComponente("provaEficacia"),
      modoUso: porComponente("modoUso"),
      advertencias: porComponente("advertencias"),
      faq: porComponente("faq"),
      claims: porComponente("claims"),
      doNotSay: porComponente("doNotSay"),
      componentes: kit.componentes,
      raw: JSON.stringify({ kit, componentes: componentes.map((c) => c.raw) }),
    },
  };
}
