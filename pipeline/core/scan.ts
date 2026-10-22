/**
 * Scan + gate de uma loja: lê o Shopify (read-only), resolve fichas e decide o lote do dia.
 * Sem fs: a CLI (run/index.ts) grava o resultado em pipeline/runs/, o worker do painel no SQLite.
 */
import { gate, type GateDeps } from "../gate/index.js";
import { ResolvedorFichas, type DadosFontes } from "../lib/fontes/index.js";
import type { ShopifyReadClient } from "../lib/shopify/client.js";
import { catalogoReuso, listarProdutos, type MetaobjetoReuso } from "../lib/shopify/queries.js";
import type { FichaContexto, KitProposto, RunPayload } from "../lib/types.js";
import { proporKits } from "../scanner/kits.js";
import type { Contrato, LojaConfig, PipelineConfig } from "./config.js";

export type ResultadoScan = {
  run: RunPayload;
  fichas: Record<string, FichaContexto>;
  catalogo: Record<string, MetaobjetoReuso[]>;
  /** kits ativos sem entrada no kits.yaml: a CLI grava como propostas, o worker só mostra */
  kitsNovos: KitProposto[];
};

export function novoRunId(marca: string, agora = new Date()): string {
  return `${marca}-${agora.toISOString().slice(0, 19).replace(/[-:]/g, "").replace("T", "-")}`;
}

export async function escanear(opts: {
  client: ShopifyReadClient;
  config: PipelineConfig;
  loja: LojaConfig;
  contrato: Contrato;
  dados: DadosFontes;
  deps: GateDeps;
  runId: string;
  iniciadoEm: Date;
  log?: (msg: string) => void;
}): Promise<ResultadoScan> {
  const { client, config, loja, contrato, dados, deps, runId, iniciadoEm } = opts;
  const log = opts.log ?? (() => undefined);

  log(`scanner: lendo produtos de ${loja.shop_domain}…`);
  const produtos = await listarProdutos(client, contrato.pdp);

  log(`scanner: catálogo de reuso…`);
  const tipos = [...new Set(contrato.pdp.map((f) => f.metaobject_type).filter((t): t is string => !!t))];
  const catalogo = await catalogoReuso(client, tipos);

  const kitsMapeados = dados.kits?.kits ?? {};
  const kitsNovos = loja.fontes_produto.some((f) => f.tipo === "kit") ? proporKits(produtos, new Set(Object.keys(kitsMapeados))) : [];
  // O painel mostra todos os kits pendentes de confirmação (mapeados sem confirmar + propostos agora).
  const titulos = new Map(produtos.map((p) => [p.handle, p.title]));
  const kitsPropostos: KitProposto[] = [
    ...Object.entries(kitsMapeados)
      .filter(([, k]) => !k.confirmado)
      .map(([handle, k]) => ({
        handle,
        title: titulos.get(handle) ?? handle,
        componentes: k.componentes,
        ...(k.quantidade ? { quantidade: k.quantidade } : {}),
        evidencias: k.nota ? [k.nota] : [],
      })),
    ...kitsNovos,
  ];

  log(`gate…`);
  const fichas = ResolvedorFichas.paraLoja(loja, produtos, dados);
  const resultado = await gate(produtos, loja, contrato, fichas, runId, deps, dados.vendas ?? {});

  const conta = (e: string) => resultado.produtos.filter((p) => p.elegibilidade === e).length;
  const run: RunPayload = {
    schema: "run/v1",
    run_id: runId,
    loja: loja.marca,
    shop_domain: loja.shop_domain,
    iniciado_em: iniciadoEm.toISOString(),
    finalizado_em: new Date().toISOString(),
    status: "scan_ok",
    dry_run: config.dry_run,
    max_produtos_por_run: loja.max_produtos_por_run,
    formatos: contrato.pdp.map((f) => ({ formato: f.formato, metafield: f.metafield, gerar: f.gerar })),
    contagens: {
      produtos_escaneados: produtos.length,
      ativos: produtos.filter((p) => p.status === "ACTIVE").length,
      excluidos: conta("excluido"),
      completos: conta("completo"),
      elegiveis: conta("elegivel"),
      bloqueados: conta("bloqueado"),
      selecionados: resultado.produtos.filter((p) => p.selecionado).length,
      itens_liberados: resultado.items.filter((i) => i.status === "detectado").length,
      itens_bloqueados: resultado.items.filter((i) => i.status === "bloqueado").length,
    },
    produtos: resultado.produtos,
    items: resultado.items,
    kits_propostos: kitsPropostos,
  };

  // Ficha + contexto de cada produto elegível: é o que a geração lê (ela não acessa o Shopify).
  const porHandle = new Map(produtos.map((p) => [p.handle, p]));
  const contextos: Record<string, FichaContexto> = {};
  for (const p of resultado.produtos.filter((x) => x.elegibilidade === "elegivel")) {
    const r = fichas.resolver(p.handle);
    if (!r.ok) continue;
    const shop = porHandle.get(p.handle)!;
    const rating = shop.textosFonte["reviews.rating"];
    const count = shop.textosFonte["reviews.rating_count"];
    contextos[p.handle] = {
      produto: { gid: p.product_gid, handle: p.handle, title: p.title, url: p.url, is_kit: p.is_kit },
      avaliacoes:
        rating && count
          ? { nota: Number(JSON.parse(rating).value), total: Number(count), fonte: "Judge.me", capturado_em: iniciadoEm.toISOString().slice(0, 10) }
          : null,
      ficha: r.ficha,
    };
  }

  return { run, fichas: contextos, catalogo, kitsNovos };
}
