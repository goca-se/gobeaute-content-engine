/**
 * Publisher: aplica no Shopify o conteúdo que passou no validator, por produto.
 * Único componente com credencial de escrita. Dry-run por padrão: só escreve com --apply.
 *
 *   npx tsx publisher/index.ts --run <run_id> [--handle <h>...]           # dry-run: mostra o plano
 *   npx tsx publisher/index.ts --run <run_id> [--handle <h>...] --apply   # escreve no Shopify
 *
 * Ordem (regra #0 + princípio 4): arquivos locais conferidos → core/publicar.ts (snapshot salvo →
 * metaobjectUpsert → descrição → metafieldsSet atômico com compareDigest → releitura) → log por produto.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { parseArgs } from "node:util";
import { assertEnabled, getLoja, loadContrato, loadPipelineConfig, PIPELINE_DIR, REPO_ROOT } from "../lib/config.js";
import { ShopifyWriteClient } from "../lib/shopify/client.js";
import type { ItemRun, PublicacaoProduto, RunPayload } from "../lib/types.js";
import { PayloadV1 } from "../validator/regras.js";
import { publicarProduto } from "../core/publicar.js";

const { values } = parseArgs({
  options: {
    run: { type: "string" },
    handle: { type: "string", multiple: true },
    apply: { type: "boolean", default: false },
  },
});
if (!values.run) {
  console.error("uso: publisher --run <run_id> [--handle <h>...] [--apply]");
  process.exit(2);
}

const config = loadPipelineConfig();
assertEnabled(config);
const runPath = resolve(PIPELINE_DIR, "runs", values.run, "run.json");
const run = JSON.parse(readFileSync(runPath, "utf8")) as RunPayload;
const loja = getLoja(config, run.loja);
const contrato = loadContrato(loja.marca);
const client = ShopifyWriteClient.fromEnv(loja.shop_domain, loja.credenciais_env_escrita, config.shopify_api_version);
const lojaAdmin = loja.shop_domain.replace(".myshopify.com", "");

/** Passou no validator (ou foi aprovado). Reprovados e bloqueados nunca são publicados. */
const PUBLICAVEIS = ["em_revisao", "aprovado"];

const handles = values.handle?.length
  ? values.handle
  : [...new Set(run.items.filter((i) => PUBLICAVEIS.includes(i.status)).map((i) => i.handle))];

for (const handle of handles) {
  const produto = run.produtos.find((p) => p.handle === handle);
  if (!produto) throw new Error(`produto ${handle} não está no run`);
  const itens = run.items.filter((i) => i.handle === handle && PUBLICAVEIS.includes(i.status));
  const naoPublicaveis = run.items.filter((i) => i.handle === handle && ["reprovado_validacao", "erro"].includes(i.status));
  const dirProduto = resolve(REPO_ROOT, "conteudos", loja.marca, "produtos", handle);
  const adminUrl = `https://admin.shopify.com/store/${lojaAdmin}/products/${produto.product_gid.split("/").pop()}`;

  const pub: PublicacaoProduto = {
    status: "nao_publicado",
    publicado_em: null,
    admin_url: adminUrl,
    formatos_publicados: [],
    formatos_pulados: naoPublicaveis.map((i) => ({ formato: i.formato, motivo: `${i.status}:${i.motivo ?? ""}` })),
    metafields: [],
    criados: {},
    reaproveitados: [],
    snapshot_path: null,
  };

  try {
    // 1) Regra #0: só publica o que está salvo em disco, completo e válido.
    const planos: { item: ItemRun; payload: PayloadV1 }[] = [];
    for (const item of itens) {
      const payloadPath = resolve(dirProduto, item.formato, "textos", "shopify-payload.json");
      const ok = ["content.md", "content.json", "shopify-payload.json"].every((a) => existsSync(resolve(dirProduto, item.formato, "textos", a)));
      if (!ok) {
        pub.formatos_pulados.push({ formato: item.formato, motivo: "regra0_arquivos_ausentes" });
        continue;
      }
      const parsed = PayloadV1.safeParse(JSON.parse(readFileSync(payloadPath, "utf8")));
      if (!parsed.success) {
        pub.formatos_pulados.push({ formato: item.formato, motivo: "payload_invalido" });
        continue;
      }
      // Regra #0: HTML que vai para a descrição também fica salvo como .html antes da mutation.
      if (parsed.data.descricao_html) {
        mkdirSync(resolve(dirProduto, item.formato, "conteudo-html"), { recursive: true });
        writeFileSync(resolve(dirProduto, item.formato, "conteudo-html", "descricao.html"), parsed.data.descricao_html);
      }
      planos.push({ item, payload: parsed.data });
    }

    // 2) Núcleo compartilhado com o painel: estado atual → snapshot em disco → metaobjetos →
    //    descrição (se houver) → metafieldsSet → conferência.
    const r = await publicarProduto({
      client,
      runId: run.run_id,
      shopDomain: loja.shop_domain,
      productGid: produto.product_gid,
      planos: planos.map((p) => ({ formato: p.item.formato, payload: p.payload })),
      pulados: pub.formatos_pulados,
      jaPublicados: handlesPublicadosPeloPipeline(dirProduto),
      aplicar: values.apply,
      log: (m) => console.error(`[publisher] ${handle}: ${m}`),
      antesDeEscrever: async (snapshot) => {
        const snapDir = resolve(dirProduto, "snapshots");
        mkdirSync(snapDir, { recursive: true });
        const snapPath = resolve(snapDir, `${run.run_id}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
        writeFileSync(snapPath, JSON.stringify(snapshot, null, 2));
        return relative(REPO_ROOT, snapPath);
      },
    });
    const { snapshot: _, ...resultado } = r;
    Object.assign(pub, resultado);
    if (!values.apply) continue;
    if (pub.status === "erro") throw new Error(pub.erro);
    if (pub.status === "nao_publicado") {
      console.error(`[publisher] ${handle}: nada a publicar (${pub.formatos_pulados.map((f) => `${f.formato}=${f.motivo}`).join(", ")})`);
    } else {
      console.error(`[publisher] ${handle}: ✓ ${pub.status} (${pub.formatos_publicados.join(", ")}) · ${Object.keys(pub.criados).length} metaobjetos · admin: ${adminUrl}`);
    }
  } catch (err) {
    pub.status = "erro";
    pub.erro = String(err);
    console.error(`[publisher] ${handle}: ERRO ${pub.erro}`);
  }
  if (values.apply) registrar(handle, pub, itens);
}

if (values.apply) {
  writeFileSync(runPath, JSON.stringify(run, null, 2));
  console.log(`run.json atualizado (${run.run_id})`);
} else {
  console.log("dry-run: nada foi escrito no Shopify. Rode com --apply para publicar.");
}

/** Handles de metaobjetos que o próprio pipeline já publicou para este produto (podem ser re-upsertados). */
function handlesPublicadosPeloPipeline(dirProduto: string): Set<string> {
  const log = lerLog(dirProduto);
  return new Set(log.flatMap((e) => Object.keys(e.criados ?? {})));
}

function lerLog(dirProduto: string): (PublicacaoProduto & { run_id: string })[] {
  const p = resolve(dirProduto, "pipeline-publicacoes.json");
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : [];
}

/** Grava o log por produto (pipeline-publicacoes.json), o shopify-result.json e atualiza o run. */
function registrar(handle: string, pub: PublicacaoProduto, itens: ItemRun[]): void {
  const dirProduto = resolve(REPO_ROOT, "conteudos", loja.marca, "produtos", handle);
  mkdirSync(dirProduto, { recursive: true });
  const log = lerLog(dirProduto);
  log.push({ run_id: run.run_id, ...pub });
  writeFileSync(resolve(dirProduto, "pipeline-publicacoes.json"), JSON.stringify(log, null, 2));
  if (pub.status === "publicado" || pub.status === "parcial") {
    const resultPath = resolve(dirProduto, existsSync(resolve(dirProduto, "shopify-result.json")) ? `shopify-result-${run.run_id}.json` : "shopify-result.json");
    writeFileSync(
      resultPath,
      JSON.stringify(
        { published_at: pub.publicado_em, pipeline_run_id: run.run_id, shop: loja.storefront_domain, product_handle: handle, created: pub.criados, reused: pub.reaproveitados, metafields_set: pub.metafields.map((m) => m.metafield), snapshot: pub.snapshot_path },
        null,
        2,
      ),
    );
  }
  const produto = run.produtos.find((p) => p.handle === handle)!;
  produto.publicacao = pub;
  for (const item of itens) {
    if (pub.formatos_publicados.includes(item.formato)) {
      item.status = "publicado";
      item.motivo = null;
    } else {
      const pulado = pub.formatos_pulados.find((f) => f.formato === item.formato);
      if (pulado || pub.status === "erro") {
        item.status = "erro";
        item.motivo = pulado?.motivo ?? pub.erro ?? "erro";
      }
    }
  }
}
