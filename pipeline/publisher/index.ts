/**
 * Publisher: aplica no Shopify o conteúdo que passou no validator, por produto.
 * Único componente com credencial de escrita. Dry-run por padrão: só escreve com --apply.
 *
 *   npx tsx publisher/index.ts --run <run_id> [--handle <h>...]           # dry-run: mostra o plano
 *   npx tsx publisher/index.ts --run <run_id> [--handle <h>...] --apply   # escreve no Shopify
 *
 * Ordem (regra #0 + princípio 4): arquivos locais conferidos → snapshot salvo → metaobjectUpsert →
 * metafieldsSet atômico com compareDigest → releitura de conferência → log por produto.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { parseArgs } from "node:util";
import { assertEnabled, getLoja, loadContrato, loadPipelineConfig, PIPELINE_DIR, REPO_ROOT } from "../lib/config.js";
import { ShopifyWriteClient } from "../lib/shopify/client.js";
import { metafieldVazio } from "../lib/shopify/queries.js";
import type { ItemRun, PublicacaoProduto, RunPayload } from "../lib/types.js";
import { PayloadV1 } from "../validator/regras.js";
import { lerMetafields, metaobjetosExistentes, setMetafields, upsertMetaobjeto } from "./shopify.js";

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
      planos.push({ item, payload: parsed.data });
    }

    // 2) Estado atual no Shopify: alvo precisa continuar vazio (não sobrescreve edição feita no admin).
    const alvos = planos.map((p) => `${p.payload.metafield.namespace}.${p.payload.metafield.key}`);
    const atual = alvos.length ? await lerMetafields(client, produto.product_gid, alvos) : null;
    const jaPublicados = handlesPublicadosPeloPipeline(dirProduto);
    const existentes = await metaobjetosExistentes(client, planos.flatMap((p) => p.payload.metaobjects));
    const aplicaveis = planos.filter(({ item, payload }) => {
      const mf = `${payload.metafield.namespace}.${payload.metafield.key}`;
      if (atual && !metafieldVazio(atual.valores[mf]?.value)) {
        pub.formatos_pulados.push({ formato: item.formato, motivo: "preenchido_fora_do_pipeline" });
        return false;
      }
      const alheio = payload.metaobjects.find((m) => existentes.has(`${m.type}/${m.handle}`) && !jaPublicados.has(m.handle));
      if (alheio) {
        pub.formatos_pulados.push({ formato: item.formato, motivo: `handle_existente:${alheio.handle}` });
        return false;
      }
      return true;
    });

    if (!aplicaveis.length) {
      pub.status = "nao_publicado";
      console.error(`[publisher] ${handle}: nada a publicar (${pub.formatos_pulados.map((f) => `${f.formato}=${f.motivo}`).join(", ")})`);
      registrar(produto.handle, pub, itens);
      continue;
    }

    console.error(`[publisher] ${handle}: ${aplicaveis.map((p) => p.item.formato).join(", ")} → ${values.apply ? "APLICANDO" : "dry-run"}`);
    for (const { payload } of aplicaveis) {
      console.error(`    ${payload.metafield.namespace}.${payload.metafield.key}: ${payload.metaobjects.length} novos, ${payload.reuse.length} reaproveitados`);
    }
    if (!values.apply) continue;

    // 3) Snapshot ANTES de qualquer mutation (princípio 4).
    const snapDir = resolve(dirProduto, "snapshots");
    mkdirSync(snapDir, { recursive: true });
    const snapPath = resolve(snapDir, `${run.run_id}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    writeFileSync(
      snapPath,
      JSON.stringify(
        { capturado_em: new Date().toISOString(), run_id: run.run_id, shop: loja.shop_domain, product_gid: produto.product_gid, product_updated_at: atual!.updatedAt, metafields: atual!.valores },
        null,
        2,
      ),
    );
    pub.snapshot_path = relative(REPO_ROOT, snapPath);


    // 4) Metaobjetos (upsert por handle: idempotente em retry).
    const gidPorHandle = new Map<string, string>();
    for (const { payload } of aplicaveis) {
      for (const m of payload.metaobjects) {
        const gid = await upsertMetaobjeto(client, m);
        gidPorHandle.set(m.handle, gid);
        pub.criados[m.handle] = gid;
      }
      pub.reaproveitados.push(...payload.reuse.map((r) => ({ handle: r.handle, gid: r.gid })));
    }

    // 5) Metafields num único metafieldsSet (atômico), com compareDigest do snapshot.
    const sets = aplicaveis.map(({ item, payload }) => {
      const mf = `${payload.metafield.namespace}.${payload.metafield.key}`;
      const refs = (payload.metafield.value_refs ?? []).map((r) => {
        const m = r.match(/^<GID:(.+)>$/);
        return m ? gidPorHandle.get(m[1])! : r;
      });
      const value = payload.metafield.value ?? (payload.metafield.type.startsWith("list.") ? JSON.stringify(refs) : refs[0]);
      pub.metafields.push({ metafield: mf, formato: item.formato, antes: atual!.valores[mf]?.value ?? null, depois: value });
      return {
        ownerId: produto.product_gid,
        namespace: payload.metafield.namespace,
        key: payload.metafield.key,
        type: payload.metafield.type,
        value,
        compareDigest: atual!.valores[mf]?.compareDigest ?? null,
      };
    });
    await setMetafields(client, sets);

    // 6) Conferência: relê e compara.
    const depois = await lerMetafields(client, produto.product_gid, alvos);
    const divergentes = pub.metafields.filter((m) => depois.valores[m.metafield]?.value !== m.depois);
    if (divergentes.length) throw new Error(`conferência falhou: ${divergentes.map((d) => d.metafield).join(", ")}`);

    pub.status = pub.formatos_pulados.length ? "parcial" : "publicado";
    pub.publicado_em = new Date().toISOString();
    pub.formatos_publicados = aplicaveis.map((p) => p.item.formato);
    console.error(`[publisher] ${handle}: ✓ ${pub.status} (${pub.formatos_publicados.join(", ")}) · ${Object.keys(pub.criados).length} metaobjetos · admin: ${adminUrl}`);
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
