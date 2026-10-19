/**
 * Rollback de uma publicação do pipeline, a partir do snapshot gravado antes da escrita.
 * Restaura cada metafield ao valor do snapshot (ou apaga, se estava vazio) e remove os
 * metaobjetos CRIADOS naquela publicação. Reaproveitados nunca são tocados.
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
import type { MetafieldAtual } from "./shopify.js";
import { deleteMetafields, deleteMetaobjeto, lerMetafields, setMetafields } from "./shopify.js";

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

const snapshot = JSON.parse(readFileSync(resolve(REPO_ROOT, alvo.snapshot_path), "utf8")) as {
  product_gid: string;
  metafields: Record<string, MetafieldAtual>;
};
const client = ShopifyWriteClient.fromEnv(loja.shop_domain, loja.credenciais_env_escrita, config.shopify_api_version);
const mfs = alvo.metafields.map((m) => m.metafield);
const atual = await lerMetafields(client, snapshot.product_gid, mfs);

// Se alguém editou no admin depois da publicação, o rollback não atropela: avisa e para.
const editados = alvo.metafields.filter((m) => atual.valores[m.metafield]?.value !== m.depois);
if (editados.length) {
  console.error(`⚠ editado no admin depois da publicação: ${editados.map((m) => m.metafield).join(", ")} — rollback cancelado`);
  process.exit(1);
}

console.error(`rollback ${values.handle} (run ${alvo.run_id}): restaura ${mfs.join(", ")} e remove ${Object.keys(alvo.criados).length} metaobjetos criados`);
if (!values.apply) {
  console.log("dry-run: nada foi alterado. Rode com --apply para reverter.");
  process.exit(0);
}

const restaurar = alvo.metafields.filter((m) => snapshot.metafields[m.metafield]?.value);
const apagar = alvo.metafields.filter((m) => !snapshot.metafields[m.metafield]?.value);
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
for (const gid of Object.values(alvo.criados)) await deleteMetaobjeto(client, gid);

const depois = await lerMetafields(client, snapshot.product_gid, mfs);
const divergentes = mfs.filter((m) => (depois.valores[m]?.value ?? null) !== (snapshot.metafields[m]?.value ?? null));
if (divergentes.length) throw new Error(`conferência do rollback falhou: ${divergentes.join(", ")}`);

log.push({ ...alvo, status: "revertido", publicado_em: new Date().toISOString(), formatos_publicados: [], erro: undefined });
writeFileSync(logPath, JSON.stringify(log, null, 2));
console.log(`✓ revertido: metafields iguais ao snapshot ${alvo.snapshot_path}`);
