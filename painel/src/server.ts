/**
 * Painel + motor do content pipeline (GoDeploy: Worker + SQLite em env.DB).
 *
 * O pipeline roda aqui dentro, disparado pelo cron do GoDeploy:
 *   POST /tasks/iniciar  (diário)      → scan + lote do dia
 *   POST /tasks/avancar  (a cada min.) → gerar → validar → publicar, um passo por vez
 * O painel só lê o SQLite (o que o motor fez) e o Shopify ao vivo (o que está na loja agora).
 */
import { getLoja } from "../../pipeline/core/config.js";
import { ShopifyReadClient, tokenProvider } from "../../pipeline/lib/shopify/client.js";
import { lerMetafields } from "../../pipeline/publisher/shopify.js";
import type { PublicacaoProduto, RunPayload } from "../../pipeline/lib/types.js";
import { evento, gravarEstado, lerEstado, migrar } from "./db";
import { BUILD, CONFIG, CONTRATOS } from "./gen/bundle";
import { importarHistorico } from "./historico";
import { avancar, iniciarRun, pausado, reverter, type Env } from "./motor";

const json = (data: unknown, status = 200) => Response.json(data, { status });
const LOJA_PADRAO = CONFIG.lojas[0].marca;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const usuario = request.headers.get("x-godeploy-user-email");
    const cron = request.headers.get("x-godeploy-cron");
    const db = env.DB;
    // Navegador que pede o .ico por conta própria recebe o SVG dos assets.
    if (url.pathname === "/favicon.ico") return Response.redirect(new URL("/favicon.svg", url).toString(), 301);

    try {
      await migrar(db);
      await importarHistorico(db);

      // ── cron ──────────────────────────────────────────────────────────────
      // O app é "authenticated": só chega aqui o cron do GoDeploy ou alguém logado.
      if (url.pathname.startsWith("/tasks/") && request.method === "POST") {
        const origem = cron ? "cron" : usuario ? `manual:${usuario}` : null;
        if (!origem) return json({ erro: "sem permissão" }, 403);
        if (url.pathname === "/tasks/iniciar") {
          const lojas = CONFIG.lojas.map((l) => l.marca);
          const out: Record<string, unknown> = {};
          for (const marca of lojas) out[marca] = await iniciarRun(env, marca, "completo", origem).catch((e) => ({ erro: String(e) }));
          console.log("[cron] iniciar", JSON.stringify(out));
          return json(out);
        }
        if (url.pathname === "/tasks/avancar") {
          const r = await avancar(env, origem);
          if (r.passos.length) console.log("[cron] avancar", r.passos.join(" · "));
          return json(r);
        }
      }

      if (url.pathname === "/api/health") {
        const { rows } = await db.query("SELECT COUNT(*) AS n FROM execucoes", []);
        return json({ ok: true, execucoes: rows[0].n, build: BUILD, usuario });
      }

      // ── estado do robô ───────────────────────────────────────────────────
      if (url.pathname === "/api/estado" && request.method === "GET") {
        const ativo = await db.query(
          "SELECT id, loja, status, etapa, iniciado_em, tokens, origem FROM execucoes WHERE status IN ('escaneando', 'em_andamento') ORDER BY iniciado_em DESC LIMIT 1",
          [],
        );
        const progresso = ativo.rows.length
          ? (await db.query("SELECT status, COUNT(*) AS n FROM itens WHERE run_id = ? GROUP BY status", [ativo.rows[0].id])).rows
          : [];
        const ultimo = await db.query("SELECT id, status, iniciado_em, finalizado_em, erro FROM execucoes WHERE origem != 'importado' ORDER BY iniciado_em DESC LIMIT 1", []);
        const pausa = await db.query("SELECT valor, atualizado_por, atualizado_em FROM estado WHERE chave = 'pausado'", []);
        const motor = await lerEstado(db, "trava:motor");
        const ultimoTick = await lerEstado(db, "ultimo_tick");
        return json({
          usuario,
          pausado: await pausado(db),
          pausado_por: pausa.rows[0]?.valor !== "0" ? (pausa.rows[0]?.atualizado_por ?? "nunca iniciado") : null,
          pausado_em: pausa.rows[0]?.valor !== "0" ? (pausa.rows[0]?.atualizado_em ?? null) : null,
          motor_ocupado: !!motor && motor > new Date().toISOString(),
          ultimo_tick: ultimoTick,
          run_ativo: ativo.rows[0] ? { ...ativo.rows[0], progresso: Object.fromEntries(progresso.map((p) => [p.status, p.n])) } : null,
          ultimo_run: ultimo.rows[0] ?? null,
          config: {
            enabled: CONFIG.enabled,
            dry_run: CONFIG.dry_run,
            lojas: CONFIG.lojas.map((l) => ({ marca: l.marca, max_produtos_por_run: l.max_produtos_por_run, storefront: l.storefront_domain })),
            modelo: CONFIG.llm.modelo_geracao,
          },
          build: BUILD,
        });
      }

      if (url.pathname === "/api/pausa" && request.method === "POST") {
        if (!usuario) return json({ erro: "login necessário" }, 401);
        const body = (await request.json().catch(() => ({}))) as { pausado?: boolean };
        await gravarEstado(db, "pausado", body.pausado ? "1" : "0", usuario);
        await evento(db, { tipo: body.pausado ? "pausado" : "retomado", autor: usuario });
        return json({ ok: true, pausado: !!body.pausado });
      }

      // Rodar agora: completo (gera e publica) ou só scan (atualiza a foto da loja).
      if (url.pathname === "/api/runs" && request.method === "POST") {
        if (!usuario) return json({ erro: "login necessário" }, 401);
        const body = (await request.json().catch(() => ({}))) as { modo?: string; loja?: string };
        const modo = body.modo === "scan" ? "scan" : "completo";
        const r = await iniciarRun(env, body.loja ?? LOJA_PADRAO, modo, `manual:${usuario}`);
        return json(r, "pulado" in r ? 409 : 200);
      }

      // ── leitura ──────────────────────────────────────────────────────────
      if (url.pathname === "/api/runs" && request.method === "GET") {
        const { rows } = await db.query(
          `SELECT e.id, e.loja, e.modo, e.origem, e.status, e.etapa, e.iniciado_em, e.finalizado_em, e.tokens, e.erro,
             json_extract(e.scan_json, '$.contagens') AS contagens,
             (SELECT json_group_object(status, n) FROM (SELECT status, COUNT(*) AS n FROM itens WHERE run_id = e.id GROUP BY status)) AS itens
           FROM execucoes e WHERE e.scan_json IS NOT NULL OR e.status != 'concluido' ORDER BY e.iniciado_em DESC LIMIT 60`,
          [],
        );
        return json(rows.map((r) => ({ ...r, contagens: r.contagens ? JSON.parse(String(r.contagens)) : null, itens: r.itens ? JSON.parse(String(r.itens)) : {} })));
      }

      // Visão da loja: scan mais recente (ou o pedido) + o que o pipeline publicou depois dele.
      if (url.pathname === "/api/visao" && request.method === "GET") {
        const pedido = url.searchParams.get("run");
        const { rows } = pedido
          ? await db.query("SELECT id, scan_json, status, modo, origem FROM execucoes WHERE id = ? AND scan_json IS NOT NULL", [pedido])
          : await db.query("SELECT id, scan_json, status, modo, origem FROM execucoes WHERE scan_json IS NOT NULL ORDER BY iniciado_em DESC LIMIT 1", []);
        if (!rows.length) return json({ run: null });
        const run = JSON.parse(String(rows[0].scan_json)) as RunPayload;
        const itens = await db.query(
          "SELECT id, handle, formato, status, motivo, flags_json, tentativas, tokens, conteudo_id, atualizado_em FROM itens WHERE run_id = ? ORDER BY prioridade, formato",
          [run.run_id],
        );
        // Publicações depois do scan: a loja já mudou desde a foto, e a cobertura precisa mostrar isso.
        const pubs = await db.query(
          "SELECT handle, status, detalhe_json, criado_em FROM publicacoes WHERE loja = ? AND criado_em >= ? AND status IN ('publicado', 'parcial', 'revertido') ORDER BY id",
          [run.loja, run.iniciado_em],
        );
        const publicadosDepois: Record<string, { formatos: string[]; revertidos: string[] }> = {};
        for (const p of pubs.rows) {
          const d = JSON.parse(String(p.detalhe_json)) as PublicacaoProduto;
          const e = (publicadosDepois[String(p.handle)] ??= { formatos: [], revertidos: [] });
          if (p.status === "revertido") e.revertidos.push(...d.formatos_publicados);
          else e.formatos.push(...d.formatos_publicados);
        }
        return json({
          run: { ...run, status_execucao: rows[0].status, modo: rows[0].modo, origem: rows[0].origem },
          itens: itens.rows.map((i) => ({ ...i, flags: i.flags_json ? JSON.parse(String(i.flags_json)) : [] })),
          publicados_depois: publicadosDepois,
        });
      }

      // Log por produto: tudo o que o pipeline escreveu na loja, mais recente primeiro.
      if (url.pathname === "/api/alteracoes" && request.method === "GET") {
        const { rows } = await db.query(
          `SELECT p.id, p.run_id, p.loja, p.handle, p.product_gid, p.status, p.detalhe_json, p.criado_em, p.revertido_por, p.revertido_em,
             (SELECT title FROM itens WHERE itens.handle = p.handle ORDER BY atualizado_em DESC LIMIT 1) AS title
           FROM publicacoes p WHERE p.status != 'aplicando' ORDER BY p.criado_em DESC, p.id DESC LIMIT 300`,
          [],
        );
        return json(rows.map(({ detalhe_json, ...r }) => ({ ...r, detalhe: detalhe_json ? JSON.parse(String(detalhe_json)) : null })));
      }

      const mProduto = url.pathname.match(/^\/api\/produtos\/([a-z0-9-]+)(\/shopify)?$/);
      if (mProduto && request.method === "GET") {
        const handle = mProduto[1];
        if (mProduto[2]) return json(await estadoNoShopify(env, handle));
        const [itens, conteudos, pubs, eventos] = await Promise.all([
          db.query("SELECT * FROM itens WHERE handle = ? ORDER BY run_id DESC, formato", [handle]),
          db.query("SELECT id, item_id, run_id, formato, tentativa, content_md, payload_json, modelo, tokens, criado_em FROM conteudos WHERE handle = ? ORDER BY id DESC", [handle]),
          db.query("SELECT id, run_id, status, detalhe_json, criado_em, revertido_por, revertido_em, snapshot_json IS NOT NULL AS tem_snapshot FROM publicacoes WHERE handle = ? ORDER BY id DESC", [handle]),
          db.query("SELECT * FROM eventos WHERE handle = ? ORDER BY id DESC LIMIT 200", [handle]),
        ]);
        return json({
          handle,
          itens: itens.rows.map((i) => ({ ...i, flags: i.flags_json ? JSON.parse(String(i.flags_json)) : [] })),
          conteudos: conteudos.rows,
          publicacoes: pubs.rows.map(({ detalhe_json, ...p }) => ({ ...p, detalhe: detalhe_json ? JSON.parse(String(detalhe_json)) : null })),
          eventos: eventos.rows,
        });
      }

      const mReverter = url.pathname.match(/^\/api\/publicacoes\/(\d+)\/reverter$/);
      if (mReverter && request.method === "POST") {
        if (!usuario) return json({ erro: "login necessário" }, 401);
        const body = (await request.json().catch(() => ({}))) as { confirmar?: boolean };
        return json(await reverter(env, Number(mReverter[1]), usuario, !!body.confirmar));
      }

      const mEventosRun = url.pathname.match(/^\/api\/runs\/([\w-]+)\/eventos$/);
      if (mEventosRun && request.method === "GET") {
        const { rows } = await db.query("SELECT * FROM eventos WHERE run_id = ? ORDER BY id DESC LIMIT 500", [mEventosRun[1]]);
        return json(rows);
      }

      // Sync para o repo (pipeline/scripts/sync-conteudos.ts): conteúdos + publicações + snapshots.
      if (url.pathname === "/api/export" && request.method === "GET") {
        const desde = Number(url.searchParams.get("desde_conteudo") ?? 0);
        const desdePub = Number(url.searchParams.get("desde_publicacao") ?? 0);
        const [conteudos, pubs] = await Promise.all([
          db.query("SELECT c.*, i.loja FROM conteudos c JOIN itens i ON i.id = c.item_id WHERE c.id > ? ORDER BY c.id LIMIT 500", [desde]),
          db.query("SELECT * FROM publicacoes WHERE id > ? AND status != 'aplicando' ORDER BY id LIMIT 500", [desdePub]),
        ]);
        return json({ conteudos: conteudos.rows, publicacoes: pubs.rows });
      }

      return json({ erro: "não encontrado" }, 404);
    } catch (err) {
      console.error(err);
      return json({ erro: String(err) }, 500);
    }
  },
};

/** Estado atual do produto no Shopify × última publicação do pipeline (detecta edição no admin). */
async function estadoNoShopify(env: Env, handle: string) {
  const db = env.DB;
  const pubs = await db.query("SELECT id, loja, product_gid, status, detalhe_json, criado_em FROM publicacoes WHERE handle = ? AND detalhe_json IS NOT NULL ORDER BY id", [handle]);
  const it = await db.query("SELECT loja, product_gid FROM itens WHERE handle = ? LIMIT 1", [handle]);
  const base = pubs.rows[0] ?? it.rows[0];
  let productGid = base ? String(base.product_gid) : null;
  const marca = base ? String(base.loja) : LOJA_PADRAO;
  const loja = getLoja(CONFIG, marca);
  const vars = Object.fromEntries(Object.entries(env).filter(([, v]) => typeof v === "string")) as Record<string, string>;
  const client = new ShopifyReadClient(loja.shop_domain, tokenProvider(loja.shop_domain, loja.credenciais_env_leitura, vars), CONFIG.shopify_api_version);
  if (!productGid) {
    const r = await client.query<{ productByHandle: { id: string } | null }>(`query P($h: String!) { productByHandle(handle: $h) { id } }`, { h: handle });
    productGid = r.productByHandle?.id ?? null;
    if (!productGid) return { erro: "produto não encontrado no Shopify" };
  }
  const contrato = CONTRATOS[marca];
  const atual = await lerMetafields(client, productGid, contrato.pdp.map((f) => f.metafield));
  // Último valor que o pipeline escreveu em cada metafield (e se ainda está lá).
  const escrito = new Map<string, { valor: string; publicacao_id: number; em: string; revertido: boolean }>();
  for (const p of pubs.rows) {
    const d = JSON.parse(String(p.detalhe_json)) as PublicacaoProduto;
    for (const m of d.metafields ?? []) escrito.set(m.metafield, { valor: m.depois, publicacao_id: Number(p.id), em: String(p.criado_em), revertido: p.status === "revertido" });
  }
  return {
    handle,
    product_gid: productGid,
    lido_em: new Date().toISOString(),
    product_updated_at: atual.updatedAt,
    formatos: contrato.pdp.map((f) => {
      const v = atual.valores[f.metafield];
      const e = escrito.get(f.metafield);
      const preenchido = !!v?.value && v.value !== "[]";
      const situacao = !e || e.revertido
        ? preenchido ? (e?.revertido ? "preenchido_apos_reversao" : "preenchido_fora_do_pipeline") : "vazio"
        : v?.value === e.valor ? "igual_ao_publicado" : preenchido ? "editado_no_admin" : "apagado_no_admin";
      return { formato: f.formato, metafield: f.metafield, preenchido, situacao, publicacao_id: e?.publicacao_id ?? null, publicado_em: e?.em ?? null };
    }),
  };
}
