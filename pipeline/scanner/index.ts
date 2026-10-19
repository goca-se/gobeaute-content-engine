/**
 * Scanner (Fase 0): lista os produtos da loja com o estado de cada metafield do contrato.
 * Read-only. Gaps, exclusões e catálogo de reuso entram na Fase 1.
 *
 *   npx tsx scanner/index.ts --loja kokeshi            # lê o Shopify (credenciais de leitura no .env)
 *   npx tsx scanner/index.ts --loja kokeshi --fichas   # só valida a fonte de produto, offline
 */
import { parseArgs } from "node:util";
import { assertEnabled, getLoja, loadContrato, loadPipelineConfig } from "../lib/config.js";
import { carregarFontes } from "../lib/fontes/carregar.js";
import { ResolvedorFichas } from "../lib/fontes/index.js";
import { ShopifyReadClient } from "../lib/shopify/client.js";
import { listarProdutos } from "../lib/shopify/queries.js";

const { values } = parseArgs({
  options: {
    loja: { type: "string" },
    fichas: { type: "boolean", default: false },
  },
});
if (!values.loja) {
  console.error("uso: scanner --loja <marca> [--fichas]");
  process.exit(2);
}

const config = loadPipelineConfig();
assertEnabled(config);
const loja = getLoja(config, values.loja);
const contrato = loadContrato(loja.marca);

if (values.fichas) {
  const offline = ResolvedorFichas.paraLoja(loja, [], carregarFontes(loja));
  console.log(`fontes: ${loja.fontes_produto.map((f) => f.tipo).join(" → ")} · ${offline.totalKbCsv} fichas na base CSV`);
  process.exit(0);
}

const client = ShopifyReadClient.fromEnv(loja.shop_domain, loja.credenciais_env_leitura, config.shopify_api_version);
const produtos = await listarProdutos(client, contrato.pdp);
const fichas = ResolvedorFichas.paraLoja(loja, produtos, carregarFontes(loja));

const siglas = contrato.pdp.map((f) => f.formato);
console.log(`\n${produtos.length} produtos em ${loja.shop_domain}`);
console.log(`legenda: ● preenchido · ○ vazio — colunas: ${siglas.join(", ")}\n`);
for (const p of produtos) {
  const marcas = contrato.pdp.map((f) => (p.metafields[f.metafield] ? "●" : "○")).join(" ");
  const r = fichas.resolver(p.handle);
  const ficha = (r.ok ? r.ficha.origem : r.motivo).padEnd(10);
  console.log(`${marcas}  ${p.status.padEnd(8)} ${p.onlineStoreUrl ? "loja" : "    "} ${ficha}  ${p.handle}`);
}

const ativos = produtos.filter((p) => p.status === "ACTIVE");
console.log(`\nativos: ${ativos.length} · com ficha: ${ativos.filter((p) => fichas.resolver(p.handle).ok).length}`);
