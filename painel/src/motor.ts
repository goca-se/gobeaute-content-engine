/**
 * Motor do content pipeline rodando no GoDeploy (sem máquina de ninguém).
 *
 * - `iniciarRun`: scan + gate (read-only no Shopify) e cria os itens do lote do dia.
 * - `avancar`: disparado pelo cron a cada minuto; executa os próximos passos dentro de um
 *   orçamento de tempo, um produto por vez: gerar (1 chamada por formato) → validar → publicar.
 *
 * Regra #0: conteúdo gerado vai para `conteudos` antes de qualquer coisa; o snapshot do Shopify vai
 * para `publicacoes` antes da primeira mutation. Rollback usa esse snapshot.
 */
import { getLoja, type Contrato, type LojaConfig, type PipelineConfig } from "../../pipeline/core/config.js";
import { catalogoParaPrompt, gerarFormato, type ContextoMarca } from "../../pipeline/core/gerar.js";
import { publicarProduto, reverterPublicacao, type Snapshot } from "../../pipeline/core/publicar.js";
import { escanear, novoRunId } from "../../pipeline/core/scan.js";
import { validarProduto } from "../../pipeline/core/validar.js";
import type { DadosFontes } from "../../pipeline/lib/fontes/index.js";
import { ShopifyReadClient, ShopifyWriteClient, tokenProvider } from "../../pipeline/lib/shopify/client.js";
import type { MetaobjetoReuso } from "../../pipeline/lib/shopify/queries.js";
import type { FichaContexto, FlagValidacao, PublicacaoProduto, RunPayload } from "../../pipeline/lib/types.js";
import { PayloadV1 } from "../../pipeline/validator/regras.js";
import { adquirirTrava, evento, gravarEstado, inserirEmLotes, lerEstado, liberarTrava, type DB } from "./db";
import { CONFIG, CONTEXTOS, CONTRATOS, FONTES, RESULTADOS_MANUAIS } from "./gen/bundle";

export type Env = { DB: DB; [secret: string]: unknown };

const ROBO = "robô";
/** Trava do motor: maior que o orçamento de um tick + a chamada LLM mais longa. */
const TRAVA_S = 240;
/** Orçamento de tempo de um tick: depois disso não começa passo novo. */
const ORCAMENTO_MS = 45_000;
/** Lease de um item em geração: se o worker cair, o item volta para a fila depois disso. */
const LEASE_GERACAO_S = 200;
const MAX_TENTATIVAS_VALIDACAO = 3;

type Item = {
  id: string;
  run_id: string;
  handle: string;
  product_gid: string;
  title: string;
  formato: string;
  metafield: string;
  prioridade: number;
  status: string;
  motivo: string | null;
  flags_json: string | null;
  feedback: string | null;
  tentativas: number;
  tentativas_validacao: number;
  conteudo_id: number | null;
  lease_ate: string | null;
};

type Ctx = { env: Env; db: DB; config: PipelineConfig; loja: LojaConfig; contrato: Contrato; contexto: ContextoMarca; dados: DadosFontes };

function contextoLoja(env: Env, marca: string): Ctx {
  const loja = getLoja(CONFIG, marca);
  return { env, db: env.DB, config: CONFIG, loja, contrato: CONTRATOS[marca], contexto: CONTEXTOS[marca], dados: FONTES[marca] };
}

function segredo(env: Env, nome: string): string {
  const v = env[nome];
  if (typeof v !== "string" || !v) throw new Error(`secret ${nome} não configurado no app`);
  return v;
}

const vars = (env: Env) => Object.fromEntries(Object.entries(env).filter(([, v]) => typeof v === "string")) as Record<string, string>;
const leitura = (c: Ctx) => new ShopifyReadClient(c.loja.shop_domain, tokenProvider(c.loja.shop_domain, c.loja.credenciais_env_leitura, vars(c.env)), c.config.shopify_api_version);
const escrita = (c: Ctx) => new ShopifyWriteClient(c.loja.shop_domain, tokenProvider(c.loja.shop_domain, c.loja.credenciais_env_escrita, vars(c.env)), c.config.shopify_api_version);

async function sha256(partes: string[]): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(partes.join("")));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Sem registro conta como pausado: um banco novo nunca publica antes de alguém dar "Retomar" no painel. */
export async function pausado(db: DB): Promise<boolean> {
  return (await lerEstado(db, "pausado")) !== "0";
}

// ─────────────────────────────── scan / início do run ───────────────────────────────

export async function iniciarRun(env: Env, marca: string, modo: "completo" | "scan", origem: string): Promise<{ id: string } | { pulado: string }> {
  const c = contextoLoja(env, marca);
  if (!CONFIG.enabled) return { pulado: "pipeline desabilitado (enabled: false)" };
  if (modo === "completo" && (await pausado(c.db))) return { pulado: "pipeline pausado no painel" };
  const ativo = await c.db.query("SELECT id FROM execucoes WHERE loja = ? AND status IN ('escaneando', 'em_andamento')", [marca]);
  if (ativo.rows.length) return { pulado: `já existe um run em andamento (${ativo.rows[0].id})` };
  if (!(await adquirirTrava(c.db, `scan:${marca}`, 180, origem))) return { pulado: "outro scan começou agora" };

  const iniciadoEm = new Date();
  const runId = novoRunId(marca, iniciadoEm);
  await c.db.exec("INSERT INTO execucoes (id, loja, modo, origem, status, etapa, iniciado_em) VALUES (?, ?, ?, ?, 'escaneando', 'lendo o Shopify', ?)", [
    runId, marca, modo, origem, iniciadoEm.toISOString(),
  ]);
  await evento(c.db, { run_id: runId, tipo: "run_iniciado", detalhe: `${modo} · ${origem}`, autor: origem });

  try {
    // Publicações do pipeline já feitas: o gate não confunde com rodada manual.
    const pubs = await c.db.query("SELECT handle, status, detalhe_json FROM publicacoes WHERE loja = ?", [marca]);
    const porHandle = new Map<string, { status: string; formatos_publicados: string[] }[]>();
    for (const r of pubs.rows) {
      const d = r.detalhe_json ? (JSON.parse(String(r.detalhe_json)) as PublicacaoProduto) : null;
      const lista = porHandle.get(String(r.handle)) ?? [];
      lista.push({ status: String(r.status), formatos_publicados: d?.formatos_publicados ?? [] });
      porHandle.set(String(r.handle), lista);
    }
    const manuais = RESULTADOS_MANUAIS[marca] ?? {};

    const scan = await escanear({
      client: leitura(c),
      config: c.config,
      loja: c.loja,
      contrato: c.contrato,
      dados: c.dados,
      deps: {
        brandbook: c.contexto.brandbook,
        publicacoes: (h) => porHandle.get(h) ?? [],
        resultadoManual: (h) => manuais[h] ?? null,
        hash: sha256,
      },
      runId,
      iniciadoEm,
    });

    await c.db.exec("UPDATE execucoes SET scan_json = ?, catalogo_json = ?, etapa = ?, atualizado_em = datetime('now') WHERE id = ?", [
      JSON.stringify(scan.run), JSON.stringify(scan.catalogo), "scan concluído", runId,
    ]);
    await inserirEmLotes(c.db, "fichas", ["run_id", "handle", "json"], Object.entries(scan.fichas).map(([h, f]) => [runId, h, JSON.stringify(f)]));

    if (modo === "scan") {
      await finalizar(c.db, runId, "concluido", null);
      return { id: runId };
    }

    // Lote do dia: itens liberados dos produtos selecionados. Feedback do último reprovado/erro do mesmo formato.
    const selecionados = scan.run.produtos.filter((p) => p.selecionado);
    const anteriores = await c.db.query(
      `SELECT handle, formato, flags_json, motivo FROM itens WHERE loja = ? AND status IN ('reprovado', 'erro') ORDER BY atualizado_em DESC`,
      [marca],
    );
    const feedbackDe = new Map<string, string>();
    for (const r of anteriores.rows) {
      const k = `${r.handle}|${r.formato}`;
      if (feedbackDe.has(k)) continue;
      const flags = r.flags_json ? (JSON.parse(String(r.flags_json)) as FlagValidacao[]).filter((f) => f.severidade === "erro") : [];
      const txt = flags.map((f) => `${f.codigo} — ${f.detalhe}`).join(" | ") || String(r.motivo ?? "");
      if (txt) feedbackDe.set(k, txt);
    }
    const linhas = scan.run.items
      .filter((i) => i.status === "detectado" && selecionados.some((p) => p.handle === i.handle))
      .map((i) => {
        const p = selecionados.find((x) => x.handle === i.handle)!;
        return [i.id, runId, marca, i.handle, i.product_gid, p.title, i.formato, i.metafield, p.prioridade ?? 999, "pendente", null, feedbackDe.get(`${i.handle}|${i.formato}`) ?? null];
      });
    await inserirEmLotes(c.db, "itens", ["id", "run_id", "loja", "handle", "product_gid", "title", "formato", "metafield", "prioridade", "status", "motivo", "feedback"], linhas);
    await c.db.exec("UPDATE execucoes SET status = 'em_andamento', etapa = ?, atualizado_em = datetime('now') WHERE id = ?", [
      `lote: ${selecionados.length} produtos, ${linhas.length} formatos`, runId,
    ]);
    await evento(c.db, { run_id: runId, tipo: "lote_definido", detalhe: `${selecionados.length} produtos · ${linhas.length} formatos`, autor: ROBO });
    if (!linhas.length) await finalizar(c.db, runId, "concluido", null);
    return { id: runId };
  } catch (err) {
    await finalizar(c.db, runId, "erro", String(err).slice(0, 1000));
    throw err;
  } finally {
    await liberarTrava(c.db, `scan:${marca}`);
  }
}

async function finalizar(db: DB, runId: string, status: string, erro: string | null): Promise<void> {
  await db.exec("UPDATE execucoes SET status = ?, erro = ?, etapa = ?, finalizado_em = ?, atualizado_em = datetime('now') WHERE id = ?", [
    status, erro, status === "concluido" ? "concluído" : status, new Date().toISOString(), runId,
  ]);
  await evento(db, { run_id: runId, tipo: `run_${status}`, detalhe: erro, autor: ROBO });
}

// ─────────────────────────────── avanço (cron) ───────────────────────────────

export async function avancar(env: Env, origem: string): Promise<{ passos: string[]; motivo?: string }> {
  const db = env.DB;
  // Batimento do cron: o painel mostra quando o motor rodou pela última vez.
  await gravarEstado(db, "ultimo_tick", new Date().toISOString(), origem);
  if (!CONFIG.enabled) return { passos: [], motivo: "pipeline desabilitado" };
  if (await pausado(db)) return { passos: [], motivo: "pausado" };
  if (!(await adquirirTrava(db, "motor", TRAVA_S, origem))) return { passos: [], motivo: "motor ocupado (outro disparo em andamento)" };
  const inicio = Date.now();
  const passos: string[] = [];
  try {
    while (Date.now() - inicio < ORCAMENTO_MS) {
      const { rows } = await db.query("SELECT id, loja, tokens FROM execucoes WHERE status = 'em_andamento' ORDER BY iniciado_em LIMIT 1", []);
      if (!rows.length) break;
      const run = { id: String(rows[0].id), loja: String(rows[0].loja), tokens: Number(rows[0].tokens) };
      const c = contextoLoja(env, run.loja);
      const feito = await proximoPasso(c, run);
      if (!feito) {
        await finalizar(db, run.id, "concluido", null);
        passos.push(`${run.id}: concluído`);
        continue;
      }
      passos.push(feito);
      if (await pausado(db)) break;
    }
  } finally {
    await liberarTrava(db, "motor");
  }
  return { passos };
}

async function itensDoRun(db: DB, runId: string): Promise<Item[]> {
  const { rows } = await db.query("SELECT * FROM itens WHERE run_id = ? ORDER BY prioridade, handle, formato", [runId]);
  return rows as unknown as Item[];
}

/** Executa um passo do run. Retorna a descrição do passo, ou null se não há mais nada a fazer. */
async function proximoPasso(c: Ctx, run: { id: string; loja: string; tokens: number }): Promise<string | null> {
  const itens = await itensDoRun(c.db, run.id);
  const agora = new Date().toISOString();
  const handles = [...new Set(itens.map((i) => i.handle))];

  for (const handle of handles) {
    const doProduto = itens.filter((i) => i.handle === handle);
    // Geração que caiu no meio (lease vencido) volta para a fila.
    const travados = doProduto.filter((i) => i.status === "gerando" && (!i.lease_ate || i.lease_ate < agora));
    for (const t of travados) {
      await c.db.exec("UPDATE itens SET status = 'pendente', lease_ate = NULL WHERE id = ?", [t.id]);
      t.status = "pendente";
    }
    if (doProduto.some((i) => i.status === "gerando")) return `${handle}: aguardando geração em andamento`;

    const pendente = doProduto.find((i) => i.status === "pendente");
    if (pendente) {
      if (run.tokens >= c.loja.max_tokens_por_run) {
        await c.db.exec("UPDATE itens SET status = 'pulado', motivo = 'teto_tokens_do_run' WHERE run_id = ? AND status = 'pendente'", [run.id]);
        await evento(c.db, { run_id: run.id, tipo: "teto_tokens", detalhe: `${run.tokens} tokens`, autor: ROBO });
        return `teto de tokens atingido (${run.tokens})`;
      }
      return gerar(c, run, pendente);
    }
    const gerados = doProduto.filter((i) => i.status === "gerado");
    if (gerados.length) return validar(c, run, handle, gerados);
    const validados = doProduto.filter((i) => i.status === "validado");
    if (validados.length) return publicar(c, run, handle, doProduto);
  }
  return null;
}

async function fichaDoRun(db: DB, runId: string, handle: string): Promise<FichaContexto> {
  const { rows } = await db.query("SELECT json FROM fichas WHERE run_id = ? AND handle = ?", [runId, handle]);
  if (!rows.length) throw new Error(`ficha de ${handle} ausente no run ${runId}`);
  return JSON.parse(String(rows[0].json));
}

const catalogoCache = new Map<string, Record<string, MetaobjetoReuso[]>>();
async function catalogoDoRun(db: DB, runId: string): Promise<Record<string, MetaobjetoReuso[]>> {
  if (!catalogoCache.has(runId)) {
    const { rows } = await db.query("SELECT catalogo_json FROM execucoes WHERE id = ?", [runId]);
    catalogoCache.set(runId, JSON.parse(String(rows[0]?.catalogo_json ?? "{}")));
  }
  return catalogoCache.get(runId)!;
}

const handlesCache = new Map<string, string[]>();
async function handlesDaLoja(db: DB, runId: string): Promise<string[]> {
  if (!handlesCache.has(runId)) {
    const { rows } = await db.query("SELECT json_extract(value, '$.handle') AS h FROM execucoes, json_each(json_extract(scan_json, '$.produtos')) WHERE execucoes.id = ?", [runId]);
    handlesCache.set(runId, rows.map((r) => String(r.h)));
  }
  return handlesCache.get(runId)!;
}

async function somarTokens(db: DB, runId: string, itemId: string | null, tokens: number): Promise<void> {
  if (!tokens) return;
  await db.exec("UPDATE execucoes SET tokens = tokens + ?, atualizado_em = datetime('now') WHERE id = ?", [tokens, runId]);
  if (itemId) await db.exec("UPDATE itens SET tokens = tokens + ? WHERE id = ?", [tokens, itemId]);
}

async function gerar(c: Ctx, run: { id: string }, item: Item): Promise<string> {
  const tentativa = item.tentativas + 1;
  // Trava de segurança contra loop: além das tentativas do validator, no máximo 1 queda de worker.
  if (tentativa > c.config.llm.max_tentativas_geracao + 1) {
    await c.db.exec("UPDATE itens SET status = 'erro', motivo = 'tentativas_esgotadas' WHERE id = ?", [item.id]);
    await evento(c.db, { run_id: run.id, handle: item.handle, formato: item.formato, tipo: "erro", detalhe: "tentativas esgotadas", autor: ROBO });
    return `${item.handle}/${item.formato}: tentativas esgotadas`;
  }
  const lease = new Date(Date.now() + LEASE_GERACAO_S * 1000).toISOString();
  await c.db.exec("UPDATE itens SET status = 'gerando', tentativas = ?, lease_ate = ?, atualizado_em = datetime('now') WHERE id = ?", [tentativa, lease, item.id]);
  await c.db.exec("UPDATE execucoes SET etapa = ? WHERE id = ?", [`gerando ${item.formato} de ${item.title}`, run.id]);

  const formato = c.contrato.pdp.find((f) => f.formato === item.formato)!;
  const [ficha, catalogo, handles] = await Promise.all([fichaDoRun(c.db, run.id, item.handle), catalogoDoRun(c.db, run.id), handlesDaLoja(c.db, run.id)]);
  let r;
  try {
    r = await gerarFormato({
      llm: c.config.llm,
      token: segredo(c.env, c.config.llm.token_env),
      contexto: c.contexto,
      shop: c.loja.storefront_domain,
      formato,
      ficha,
      catalogo: catalogoParaPrompt(formato, catalogo, handles),
      feedback: item.feedback,
    });
  } catch (err) {
    // Proxy fora do ar: volta para a fila e tenta no próximo tick (a tentativa já foi contada).
    await c.db.exec("UPDATE itens SET status = 'pendente', lease_ate = NULL, motivo = ? WHERE id = ?", [String(err).slice(0, 300), item.id]);
    await evento(c.db, { run_id: run.id, handle: item.handle, formato: item.formato, tipo: "erro_llm", detalhe: String(err).slice(0, 300), autor: ROBO });
    return `${item.handle}/${item.formato}: erro no AI Proxy, tenta de novo`;
  }
  await somarTokens(c.db, run.id, item.id, r.tokens);

  if (!r.gerado) {
    const final = tentativa >= c.config.llm.max_tentativas_geracao;
    await c.db.exec("UPDATE itens SET status = ?, motivo = ?, lease_ate = NULL WHERE id = ?", [final ? "erro" : "pendente", r.erro ?? "erro", item.id]);
    await evento(c.db, { run_id: run.id, handle: item.handle, formato: item.formato, tipo: "erro_geracao", detalhe: r.erro, autor: ROBO });
    return `${item.handle}/${item.formato}: saída inválida (${final ? "erro" : "tenta de novo"})`;
  }
  if (r.gerado.status === "bloqueado") {
    await c.db.exec("UPDATE itens SET status = 'bloqueado', motivo = ?, lease_ate = NULL WHERE id = ?", [`generator:${r.gerado.motivo}`, item.id]);
    await evento(c.db, { run_id: run.id, handle: item.handle, formato: item.formato, tipo: "bloqueado", detalhe: `${r.gerado.motivo}: ${r.gerado.detalhe}`, autor: ROBO });
    return `${item.handle}/${item.formato}: bloqueado (${r.gerado.motivo})`;
  }

  // Regra #0: conteúdo persistido antes de seguir.
  await c.db.exec(
    "INSERT INTO conteudos (item_id, run_id, handle, formato, tentativa, content_md, content_json, payload_json, modelo, tokens) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [item.id, run.id, item.handle, item.formato, tentativa, r.gerado.content_md, JSON.stringify(r.gerado.content_json), JSON.stringify(r.gerado.payload), r.modelo, r.tokens],
  );
  const { rows } = await c.db.query("SELECT MAX(id) AS id FROM conteudos WHERE item_id = ?", [item.id]);
  await c.db.exec("UPDATE itens SET status = 'gerado', motivo = NULL, conteudo_id = ?, lease_ate = NULL, atualizado_em = datetime('now') WHERE id = ?", [rows[0].id, item.id]);
  await evento(c.db, { run_id: run.id, handle: item.handle, formato: item.formato, tipo: "gerado", detalhe: `tentativa ${tentativa} · ${r.tokens} tokens · ${r.modelo}`, autor: ROBO });
  return `${item.handle}/${item.formato}: gerado`;
}

async function conteudo(db: DB, id: number): Promise<{ content_md: string; content_json: string; payload_json: string }> {
  const { rows } = await db.query("SELECT content_md, content_json, payload_json FROM conteudos WHERE id = ?", [id]);
  if (!rows.length) throw new Error(`conteúdo ${id} não encontrado`);
  return rows[0] as { content_md: string; content_json: string; payload_json: string };
}

async function validar(c: Ctx, run: { id: string }, handle: string, itens: Item[]): Promise<string> {
  await c.db.exec("UPDATE execucoes SET etapa = ? WHERE id = ?", [`validando ${itens[0].title}`, run.id]);
  const [ficha, catalogo, handles] = await Promise.all([fichaDoRun(c.db, run.id, handle), catalogoDoRun(c.db, run.id), handlesDaLoja(c.db, run.id)]);
  const conteudos = await Promise.all(itens.map((i) => conteudo(c.db, i.conteudo_id!)));
  const v = await validarProduto({
    llm: c.config.llm,
    token: segredo(c.env, c.config.llm.token_env),
    contexto: c.contexto,
    contrato: c.contrato,
    ficha,
    itens: itens.map((i, k) => ({ formato: i.formato, content_md: conteudos[k].content_md, payload: JSON.parse(conteudos[k].payload_json) })),
    catalogo,
    outrosHandles: handles,
  });
  await somarTokens(c.db, run.id, null, v.tokens);

  if (v.erroLlm) {
    // Sem revisão LLM nada é publicado: tenta de novo no próximo tick, até o limite.
    const tent = Math.max(...itens.map((i) => i.tentativas_validacao)) + 1;
    const final = tent >= MAX_TENTATIVAS_VALIDACAO;
    for (const i of itens) {
      await c.db.exec("UPDATE itens SET tentativas_validacao = ?, status = ?, motivo = ? WHERE id = ?", [tent, final ? "erro" : "gerado", `llm_indisponivel: ${v.erroLlm}`, i.id]);
    }
    await evento(c.db, { run_id: run.id, handle, tipo: "erro_validacao", detalhe: v.erroLlm, autor: ROBO });
    return `${handle}: revisão LLM indisponível (${final ? "erro" : "tenta de novo"})`;
  }

  const resumo: string[] = [];
  for (const i of itens) {
    const flags = v.flags[i.formato] ?? [];
    const erros = flags.filter((f) => f.severidade === "erro");
    const tokensItem = Math.round(v.tokens / itens.length);
    await c.db.exec("UPDATE itens SET tokens = tokens + ? WHERE id = ?", [tokensItem, i.id]);
    if (!erros.length) {
      await c.db.exec("UPDATE itens SET status = 'validado', motivo = NULL, flags_json = ?, atualizado_em = datetime('now') WHERE id = ?", [JSON.stringify(flags), i.id]);
      await evento(c.db, { run_id: run.id, handle, formato: i.formato, tipo: "validado", detalhe: flags.length ? `${flags.length} observação(ões)` : null, autor: ROBO });
      resumo.push(`${i.formato}=ok`);
      continue;
    }
    const feedback = erros.map((f) => `${f.codigo} — ${f.detalhe}`).join(" | ");
    const retry = i.tentativas < c.config.llm.max_tentativas_geracao;
    await c.db.exec("UPDATE itens SET status = ?, motivo = ?, flags_json = ?, feedback = ?, atualizado_em = datetime('now') WHERE id = ?", [
      retry ? "pendente" : "reprovado", erros.map((e) => e.codigo).join(","), JSON.stringify(flags), feedback, i.id,
    ]);
    await evento(c.db, { run_id: run.id, handle, formato: i.formato, tipo: retry ? "reprovado_retry" : "reprovado", detalhe: feedback.slice(0, 1000), autor: ROBO });
    resumo.push(`${i.formato}=${retry ? "retry" : "reprovado"}`);
  }
  return `${handle}: validação ${resumo.join(" ")}`;
}

async function publicar(c: Ctx, run: { id: string }, handle: string, doProduto: Item[]): Promise<string> {
  const validados = doProduto.filter((i) => i.status === "validado");
  if (c.config.dry_run) {
    for (const i of validados) await c.db.exec("UPDATE itens SET status = 'pulado', motivo = 'dry_run' WHERE id = ?", [i.id]);
    await evento(c.db, { run_id: run.id, handle, tipo: "dry_run", detalhe: "dry_run: true no pipeline.yaml, nada publicado", autor: ROBO });
    return `${handle}: dry-run`;
  }
  await c.db.exec("UPDATE execucoes SET etapa = ? WHERE id = ?", [`publicando ${validados[0].title}`, run.id]);

  // Regra #0: só publica o que está persistido e válido.
  const planos = [];
  const pulados = doProduto
    .filter((i) => ["reprovado", "erro", "bloqueado", "pulado"].includes(i.status))
    .map((i) => ({ formato: i.formato, motivo: `${i.status}:${i.motivo ?? ""}` }));
  for (const i of validados) {
    const cont = i.conteudo_id ? await conteudo(c.db, i.conteudo_id).catch(() => null) : null;
    const parsed = cont ? PayloadV1.safeParse(JSON.parse(cont.payload_json)) : null;
    if (!cont || !cont.content_md || !cont.content_json || !parsed?.success) {
      pulados.push({ formato: i.formato, motivo: "regra0_conteudo_ausente_ou_invalido" });
      await c.db.exec("UPDATE itens SET status = 'erro', motivo = 'regra0_conteudo_ausente_ou_invalido' WHERE id = ?", [i.id]);
      continue;
    }
    planos.push({ formato: i.formato, payload: parsed.data });
  }
  if (!planos.length) return `${handle}: nada publicável`;

  const anteriores = await c.db.query("SELECT detalhe_json FROM publicacoes WHERE handle = ? AND loja = ? AND detalhe_json IS NOT NULL", [handle, c.loja.marca]);
  const jaPublicados = new Set(anteriores.rows.flatMap((r) => Object.keys((JSON.parse(String(r.detalhe_json)) as PublicacaoProduto).criados ?? {})));
  // Publicação interrompida deste produto neste run (worker caiu no meio): fica registrada como interrompida.
  await c.db.exec("UPDATE publicacoes SET status = 'interrompido', atualizado_em = datetime('now') WHERE run_id = ? AND handle = ? AND status = 'aplicando'", [run.id, handle]);

  let pubId: number | null = null;
  const pub = await publicarProduto({
    client: escrita(c),
    runId: run.id,
    shopDomain: c.loja.shop_domain,
    productGid: validados[0].product_gid,
    planos,
    pulados,
    jaPublicados,
    aplicar: true,
    antesDeEscrever: async (snapshot: Snapshot) => {
      await c.db.exec("INSERT INTO publicacoes (run_id, loja, handle, product_gid, status, snapshot_json) VALUES (?, ?, ?, ?, 'aplicando', ?)", [
        run.id, c.loja.marca, handle, validados[0].product_gid, JSON.stringify(snapshot),
      ]);
      const { rows } = await c.db.query("SELECT MAX(id) AS id FROM publicacoes WHERE run_id = ? AND handle = ?", [run.id, handle]);
      pubId = Number(rows[0].id);
      return `db:publicacoes/${pubId}`;
    },
  });
  const { snapshot: _, ...detalhe } = pub;
  if (pubId) {
    await c.db.exec("UPDATE publicacoes SET status = ?, detalhe_json = ?, atualizado_em = datetime('now') WHERE id = ?", [pub.status, JSON.stringify(detalhe), pubId]);
  } else {
    await c.db.exec("INSERT INTO publicacoes (run_id, loja, handle, product_gid, status, detalhe_json) VALUES (?, ?, ?, ?, ?, ?)", [
      run.id, c.loja.marca, handle, validados[0].product_gid, pub.status, JSON.stringify(detalhe),
    ]);
  }
  for (const i of validados) {
    if (pub.formatos_publicados.includes(i.formato)) {
      await c.db.exec("UPDATE itens SET status = 'publicado', motivo = NULL, atualizado_em = datetime('now') WHERE id = ?", [i.id]);
    } else {
      const pulado = pub.formatos_pulados.find((f) => f.formato === i.formato);
      await c.db.exec("UPDATE itens SET status = 'erro', motivo = ?, atualizado_em = datetime('now') WHERE id = ?", [pulado?.motivo ?? pub.erro ?? "nao_publicado", i.id]);
    }
  }
  await evento(c.db, {
    run_id: run.id,
    handle,
    tipo: pub.status === "erro" ? "erro_publicacao" : `publicacao_${pub.status}`,
    detalhe: pub.erro ?? `${pub.formatos_publicados.join(", ") || "nenhum formato"}${pub.formatos_pulados.length ? ` · fora: ${pub.formatos_pulados.map((f) => f.formato).join(", ")}` : ""}`,
    autor: ROBO,
  });
  return `${handle}: ${pub.status}`;
}

// ─────────────────────────────── rollback (painel) ───────────────────────────────

export async function reverter(env: Env, publicacaoId: number, autor: string, aplicar: boolean): Promise<{ ok: boolean; editados?: string[]; erro?: string }> {
  const { rows } = await env.DB.query("SELECT * FROM publicacoes WHERE id = ?", [publicacaoId]);
  if (!rows.length) return { ok: false, erro: "publicação não encontrada" };
  const row = rows[0];
  if (!["publicado", "parcial"].includes(String(row.status))) return { ok: false, erro: `não dá para desfazer uma publicação "${row.status}"` };
  if (!row.snapshot_json) return { ok: false, erro: "publicação sem snapshot (não dá para desfazer com segurança)" };
  const c = contextoLoja(env, String(row.loja));
  const pub = JSON.parse(String(row.detalhe_json)) as PublicacaoProduto;
  const r = await reverterPublicacao({ client: escrita(c), pub, snapshot: JSON.parse(String(row.snapshot_json)), aplicar });
  if (r.ok && aplicar) {
    await env.DB.exec("UPDATE publicacoes SET status = 'revertido', revertido_por = ?, revertido_em = ?, atualizado_em = datetime('now') WHERE id = ?", [autor, new Date().toISOString(), publicacaoId]);
    await env.DB.exec(
      `UPDATE itens SET status = 'revertido', motivo = ? WHERE run_id = ? AND handle = ? AND status = 'publicado'`,
      [`revertido por ${autor}`, row.run_id, row.handle],
    );
    await evento(env.DB, { run_id: String(row.run_id), handle: String(row.handle), tipo: "revertido", detalhe: `publicação #${publicacaoId}: ${pub.formatos_publicados.join(", ")}`, autor });
  }
  return r;
}
