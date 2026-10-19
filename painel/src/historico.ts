/**
 * Importa para o SQLite os runs feitos localmente antes do pipeline ir para a nuvem
 * (run.json + conteúdos + log de publicações + snapshots), para o painel mostrar tudo o que
 * já foi publicado. Roda uma vez por versão do histórico embutido no bundle.
 */
import type { PublicacaoProduto, RunPayload } from "../../pipeline/lib/types.js";
import { evento, gravarEstado, inserirEmLotes, lerEstado, type DB } from "./db";
import { HISTORICO } from "./gen/historico";

export type RunHistorico = {
  run: RunPayload;
  fichas: Record<string, unknown>;
  conteudos: { handle: string; formato: string; content_md: string; content_json: string; payload_json: string; criado_em: string }[];
  publicacoes: { handle: string; product_gid: string; detalhe: PublicacaoProduto & { run_id: string }; snapshot_json: string | null }[];
};

const STATUS: Record<string, string> = {
  publicado: "publicado",
  em_revisao: "validado",
  aprovado: "validado",
  reprovado_validacao: "reprovado",
  erro: "erro",
  bloqueado: "bloqueado",
  revertido: "revertido",
};

export async function importarHistorico(db: DB): Promise<void> {
  if ((await lerEstado(db, "historico_versao")) === HISTORICO.versao) return;
  for (const h of HISTORICO.runs as unknown as RunHistorico[]) {
    const run = h.run;
    const existe = await db.query("SELECT id FROM execucoes WHERE id = ?", [run.run_id]);
    if (existe.rows.length) continue;
    await db.exec(
      "INSERT INTO execucoes (id, loja, modo, origem, status, etapa, iniciado_em, finalizado_em, scan_json, catalogo_json) VALUES (?, ?, 'completo', 'importado', 'concluido', 'importado do run local', ?, ?, ?, '{}')",
      [run.run_id, run.loja, run.iniciado_em, run.finalizado_em, JSON.stringify(run)],
    );
    await inserirEmLotes(db, "fichas", ["run_id", "handle", "json"], Object.entries(h.fichas).map(([handle, f]) => [run.run_id, handle, JSON.stringify(f)]));

    const selecionados = new Map(run.produtos.filter((p) => p.selecionado).map((p) => [p.handle, p]));
    const itens = run.items.filter((i) => selecionados.has(i.handle) && !(i.status === "bloqueado" && !i.motivo?.startsWith("generator:")));
    await inserirEmLotes(
      db,
      "itens",
      ["id", "run_id", "loja", "handle", "product_gid", "title", "formato", "metafield", "prioridade", "status", "motivo", "flags_json"],
      itens.map((i) => {
        const p = selecionados.get(i.handle)!;
        return [i.id, run.run_id, run.loja, i.handle, i.product_gid, p.title, i.formato, i.metafield, p.prioridade ?? 999, STATUS[i.status] ?? "pulado", i.motivo, JSON.stringify(i.flags ?? [])];
      }),
    );
    for (const c of h.conteudos) {
      await db.exec(
        "INSERT INTO conteudos (item_id, run_id, handle, formato, tentativa, content_md, content_json, payload_json, modelo, criado_em) VALUES (?, ?, ?, ?, 1, ?, ?, ?, 'claude (local)', ?)",
        [`${run.run_id}:${c.handle}:${c.formato}`, run.run_id, c.handle, c.formato, c.content_md, c.content_json, c.payload_json, c.criado_em],
      );
      const { rows } = await db.query("SELECT MAX(id) AS id FROM conteudos WHERE item_id = ?", [`${run.run_id}:${c.handle}:${c.formato}`]);
      await db.exec("UPDATE itens SET conteudo_id = ? WHERE id = ?", [rows[0].id, `${run.run_id}:${c.handle}:${c.formato}`]);
    }
    for (const p of h.publicacoes) {
      const { run_id: _, ...detalhe } = p.detalhe;
      await db.exec(
        "INSERT INTO publicacoes (run_id, loja, handle, product_gid, status, detalhe_json, snapshot_json, criado_em, atualizado_em) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [run.run_id, run.loja, p.handle, p.product_gid, detalhe.status, JSON.stringify(detalhe), p.snapshot_json, detalhe.publicado_em ?? run.finalizado_em, detalhe.publicado_em ?? run.finalizado_em],
      );
      await db.exec(
        "INSERT INTO eventos (run_id, handle, tipo, detalhe, autor, criado_em) VALUES (?, ?, ?, ?, 'robô (local)', ?)",
        [run.run_id, p.handle, `publicacao_${detalhe.status}`, detalhe.formatos_publicados.join(", "), detalhe.publicado_em ?? run.finalizado_em],
      );
    }
    await evento(db, { run_id: run.run_id, tipo: "run_importado", detalhe: `${selecionados.size} produtos do run local`, autor: "importação" });
  }
  await gravarEstado(db, "historico_versao", HISTORICO.versao, "importação");
}
