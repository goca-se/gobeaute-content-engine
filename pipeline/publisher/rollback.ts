/**
 * Rollback de uma publicação do pipeline, a partir do snapshot gravado antes da escrita.
 * Restaura cada metafield ao valor do snapshot (ou apaga, se estava vazio), a descrição do produto
 * (se a publicação a reescreveu) e remove os metaobjetos CRIADOS naquela publicação.
 * Reaproveitados nunca são tocados. Mesmo núcleo do painel (core/publicar.ts).
 *
 *   npx tsx publisher/rollback.ts --loja kokeshi --handle <h> [--run <run_id>]           # dry-run
 *   npx tsx publisher/rollback.ts --loja kokeshi --handle <h> [--run <run_id>] --apply
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { assertEnabled, getLoja, loadPipelineConfig, REPO_ROOT } from "../lib/config.js";
import { ShopifyWriteClient } from "../lib/shopify/client.js";
import type { PublicacaoProduto } from "../lib/types.js";
import { reverterPublicacao, type Snapshot } from "../core/publicar.js";

const { values } = parseArgs({
  options: {
    loja: { type: "string" },
    handle: { type: "string" },
    run: { type: "string" },
    apply: { type: "boolean", default: false },
  },
});
if (!values.loja || !values.handle) {
  console.error("uso: rollback --loja <marca> --handle <h> [--run <run_id>] [--apply]");
  process.exit(2);
}

const config = loadPipelineConfig();
assertEnabled(config);
const loja = getLoja(config, values.loja);
const dirProduto = resolve(REPO_ROOT, "conteudos", loja.marca, "produtos", values.handle);
const logPath = resolve(dirProduto, "pipeline-publicacoes.json");
if (!existsSync(logPath)) throw new Error(`sem log de publicação em ${logPath}`);
const log = JSON.parse(readFileSync(logPath, "utf8")) as (PublicacaoProduto & { run_id: string })[];
const alvo = [...log].reverse().find((e) => (e.status === "publicado" || e.status === "parcial") && (!values.run || e.run_id === values.run));
if (!alvo?.snapshot_path) throw new Error("nenhuma publicação com snapshot para reverter");

const snapshot = JSON.parse(readFileSync(resolve(REPO_ROOT, alvo.snapshot_path), "utf8")) as Snapshot;
const client = ShopifyWriteClient.fromEnv(loja.shop_domain, loja.credenciais_env_escrita, config.shopify_api_version);
const restaura = [...alvo.metafields.map((m) => m.metafield), ...(alvo.descricao ? ["descrição do produto"] : [])];
console.error(`rollback ${values.handle} (run ${alvo.run_id}): restaura ${restaura.join(", ")} e remove ${Object.keys(alvo.criados).length} metaobjetos criados`);

const r = await reverterPublicacao({ client, pub: alvo, snapshot, aplicar: values.apply });
if (r.editados.length) {
  // Se alguém editou no admin depois da publicação, o rollback não atropela: avisa e para.
  console.error(`⚠ editado no admin depois da publicação: ${r.editados.join(", ")} — rollback cancelado`);
  process.exit(1);
}
if (!r.ok) throw new Error(r.erro);
if (!values.apply) {
  console.log("dry-run: nada foi alterado. Rode com --apply para reverter.");
  process.exit(0);
}

log.push({ ...alvo, status: "revertido", publicado_em: new Date().toISOString(), formatos_publicados: [], erro: undefined });
writeFileSync(logPath, JSON.stringify(log, null, 2));
console.log(`✓ revertido: igual ao snapshot ${alvo.snapshot_path}`);
