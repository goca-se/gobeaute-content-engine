/**
 * Regra #0 na nuvem: puxa do painel (SQLite do GoDeploy) o que o motor gerou e publicou e grava em
 * conteudos/<marca>/produtos/<handle>/... no mesmo formato da CLI local. Idempotente.
 *
 *   PAINEL_URL=https://content-pipeline-gobeaute.devgogroup.com PAINEL_API_KEY=gdk_... npx tsx scripts/sync-conteudos.ts
 *
 * Depois, versionar: scripts/commit-conteudos.sh <marca> <run_id>.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadPipelineConfig, PIPELINE_DIR, REPO_ROOT } from "../lib/config.js";

const config = loadPipelineConfig();
const url = process.env[config.painel.url_env];
const key = process.env[config.painel.api_key_env];
if (!url || !key) throw new Error(`defina ${config.painel.url_env} e ${config.painel.api_key_env} (API key gdk_ do admin do GoDeploy)`);

const cursorPath = resolve(PIPELINE_DIR, "runs", "sync-cursor.json");
const cursor = existsSync(cursorPath) ? JSON.parse(readFileSync(cursorPath, "utf8")) : { conteudo: 0, publicacao: 0 };
let conteudos = 0;
let publicacoes = 0;

for (;;) {
  const res = await fetch(`${url.replace(/\/$/, "")}/api/export?desde_conteudo=${cursor.conteudo}&desde_publicacao=${cursor.publicacao}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`export falhou (HTTP ${res.status}): ${await res.text()}`);
  const lote = (await res.json()) as { conteudos: Record<string, unknown>[]; publicacoes: Record<string, unknown>[] };
  if (!lote.conteudos.length && !lote.publicacoes.length) break;

  for (const c of lote.conteudos) {
    const dir = resolve(REPO_ROOT, "conteudos", String(c.loja), "produtos", String(c.handle), String(c.formato), "textos");
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, "content.md"), String(c.content_md));
    writeFileSync(resolve(dir, "content.json"), JSON.stringify(JSON.parse(String(c.content_json)), null, 2));
    const payload = JSON.parse(String(c.payload_json)) as { descricao_html?: string };
    writeFileSync(resolve(dir, "shopify-payload.json"), JSON.stringify(payload, null, 2));
    // Regra #0: conteúdo que vai como HTML também fica em conteudo-html/.
    if (payload.descricao_html) {
      mkdirSync(resolve(dir, "..", "conteudo-html"), { recursive: true });
      writeFileSync(resolve(dir, "..", "conteudo-html", "descricao.html"), payload.descricao_html);
    }
    cursor.conteudo = Math.max(cursor.conteudo, Number(c.id));
    conteudos++;
  }
  for (const p of lote.publicacoes) {
    const dirProduto = resolve(REPO_ROOT, "conteudos", String(p.loja), "produtos", String(p.handle));
    mkdirSync(resolve(dirProduto, "snapshots"), { recursive: true });
    const detalhe = p.detalhe_json ? JSON.parse(String(p.detalhe_json)) : {};
    if (p.snapshot_json) {
      const snapPath = resolve(dirProduto, "snapshots", `${p.run_id}-pub${p.id}.json`);
      writeFileSync(snapPath, JSON.stringify(JSON.parse(String(p.snapshot_json)), null, 2));
      detalhe.snapshot_path = `conteudos/${p.loja}/produtos/${p.handle}/snapshots/${p.run_id}-pub${p.id}.json`;
    }
    const logPath = resolve(dirProduto, "pipeline-publicacoes.json");
    const log = (existsSync(logPath) ? JSON.parse(readFileSync(logPath, "utf8")) : []) as { run_id: string; publicacao_id?: number }[];
    if (!log.some((e) => e.publicacao_id === Number(p.id))) {
      log.push({ run_id: String(p.run_id), publicacao_id: Number(p.id), ...detalhe, status: p.status });
      writeFileSync(logPath, JSON.stringify(log, null, 2));
    }
    cursor.publicacao = Math.max(cursor.publicacao, Number(p.id));
    publicacoes++;
  }
  writeFileSync(cursorPath, JSON.stringify(cursor));
}
console.log(`✓ sync: ${conteudos} conteúdos · ${publicacoes} publicações (cursor ${JSON.stringify(cursor)})`);
