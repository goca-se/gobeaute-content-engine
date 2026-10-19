/**
 * SQLite do app (env.DB). É a fonte da verdade do pipeline na nuvem: tudo o que o motor faz
 * fica aqui antes de tocar o Shopify (regra #0), e o painel só lê daqui e do Shopify ao vivo.
 */
export type DB = {
  query(sql: string, params: unknown[]): Promise<{ columns: string[]; rows: Record<string, unknown>[] }>;
  exec(sql: string, params: unknown[]): Promise<{ rowsWritten: number }>;
};

const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS execucoes (
    id TEXT PRIMARY KEY,
    loja TEXT NOT NULL,
    modo TEXT NOT NULL,             -- completo | scan
    origem TEXT NOT NULL,           -- cron | manual:<email> | importado
    status TEXT NOT NULL,           -- escaneando | em_andamento | concluido | abortado | erro
    etapa TEXT,
    iniciado_em TEXT NOT NULL,
    finalizado_em TEXT,
    scan_json TEXT,                 -- RunPayload do scan (produtos, contagens, formatos, kits)
    catalogo_json TEXT,
    tokens INTEGER NOT NULL DEFAULT 0,
    erro TEXT,
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS execucoes_status ON execucoes(status, iniciado_em)`,
  `CREATE TABLE IF NOT EXISTS fichas (
    run_id TEXT NOT NULL,
    handle TEXT NOT NULL,
    json TEXT NOT NULL,
    PRIMARY KEY (run_id, handle)
  )`,
  `CREATE TABLE IF NOT EXISTS itens (
    id TEXT PRIMARY KEY,            -- <run_id>:<handle>:<formato>
    run_id TEXT NOT NULL,
    loja TEXT NOT NULL,
    handle TEXT NOT NULL,
    product_gid TEXT NOT NULL,
    title TEXT NOT NULL,
    formato TEXT NOT NULL,
    metafield TEXT NOT NULL,
    prioridade INTEGER NOT NULL,
    status TEXT NOT NULL,           -- pendente | gerando | gerado | validado | reprovado | bloqueado | publicado | erro | pulado | revertido
    motivo TEXT,
    flags_json TEXT,
    feedback TEXT,
    tentativas INTEGER NOT NULL DEFAULT 0,
    tentativas_validacao INTEGER NOT NULL DEFAULT 0,
    tokens INTEGER NOT NULL DEFAULT 0,
    conteudo_id INTEGER,
    lease_ate TEXT,
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS itens_run ON itens(run_id, prioridade)`,
  `CREATE INDEX IF NOT EXISTS itens_handle ON itens(handle)`,
  `CREATE TABLE IF NOT EXISTS conteudos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id TEXT NOT NULL,
    run_id TEXT NOT NULL,
    handle TEXT NOT NULL,
    formato TEXT NOT NULL,
    tentativa INTEGER NOT NULL,
    content_md TEXT NOT NULL,
    content_json TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    modelo TEXT,
    tokens INTEGER NOT NULL DEFAULT 0,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS conteudos_handle ON conteudos(handle, formato)`,
  `CREATE TABLE IF NOT EXISTS publicacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id TEXT NOT NULL,
    loja TEXT NOT NULL,
    handle TEXT NOT NULL,
    product_gid TEXT NOT NULL,
    status TEXT NOT NULL,           -- aplicando | publicado | parcial | nao_publicado | erro | interrompido | revertido
    detalhe_json TEXT,              -- PublicacaoProduto
    snapshot_json TEXT,             -- gravado ANTES da primeira mutation
    criado_em TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
    revertido_por TEXT,
    revertido_em TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS publicacoes_handle ON publicacoes(handle, id)`,
  `CREATE TABLE IF NOT EXISTS eventos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id TEXT,
    handle TEXT,
    formato TEXT,
    tipo TEXT NOT NULL,
    detalhe TEXT,
    autor TEXT NOT NULL,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS eventos_handle ON eventos(handle, id)`,
  `CREATE INDEX IF NOT EXISTS eventos_run ON eventos(run_id, id)`,
  `CREATE TABLE IF NOT EXISTS estado (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL,
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_por TEXT
  )`,
];

let pronto: Promise<void> | null = null;
export function migrar(db: DB): Promise<void> {
  pronto ??= (async () => {
    for (const sql of MIGRATIONS) await db.exec(sql, []);
  })().catch((err) => {
    pronto = null;
    throw err;
  });
  return pronto;
}

/** O SQLite do GoDeploy aceita no máximo 100 parâmetros por statement. */
const MAX_PARAMS = 100;

export async function inserirEmLotes(db: DB, tabela: string, colunas: string[], linhas: unknown[][], conflito = "INSERT OR REPLACE"): Promise<void> {
  const porLote = Math.max(1, Math.floor(MAX_PARAMS / colunas.length));
  const ph = `(${colunas.map(() => "?").join(", ")})`;
  for (let i = 0; i < linhas.length; i += porLote) {
    const lote = linhas.slice(i, i + porLote);
    await db.exec(`${conflito} INTO ${tabela} (${colunas.join(", ")}) VALUES ${lote.map(() => ph).join(", ")}`, lote.flat());
  }
}

export async function evento(
  db: DB,
  e: { run_id?: string | null; handle?: string | null; formato?: string | null; tipo: string; detalhe?: string | null; autor: string },
): Promise<void> {
  await db.exec("INSERT INTO eventos (run_id, handle, formato, tipo, detalhe, autor) VALUES (?, ?, ?, ?, ?, ?)", [
    e.run_id ?? null,
    e.handle ?? null,
    e.formato ?? null,
    e.tipo,
    e.detalhe ?? null,
    e.autor,
  ]);
}

export async function lerEstado(db: DB, chave: string): Promise<string | null> {
  const { rows } = await db.query("SELECT valor FROM estado WHERE chave = ?", [chave]);
  return rows.length ? String(rows[0].valor) : null;
}

export async function gravarEstado(db: DB, chave: string, valor: string, por: string | null): Promise<void> {
  await db.exec(
    `INSERT INTO estado (chave, valor, atualizado_por) VALUES (?, ?, ?)
     ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor, atualizado_por = excluded.atualizado_por, atualizado_em = datetime('now')`,
    [chave, valor, por],
  );
}

/**
 * Trava do motor com prazo (lease): dois disparos do cron nunca processam ao mesmo tempo.
 * Se o worker cair no meio, a trava expira sozinha.
 */
export async function adquirirTrava(db: DB, nome: string, segundos: number, dono: string): Promise<boolean> {
  const agora = new Date();
  const ate = new Date(agora.getTime() + segundos * 1000).toISOString();
  await db.exec(
    `INSERT INTO estado (chave, valor, atualizado_por) VALUES (?, ?, ?)
     ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor, atualizado_por = excluded.atualizado_por, atualizado_em = datetime('now')
     WHERE estado.valor < ?`,
    [`trava:${nome}`, ate, dono, agora.toISOString()],
  );
  return (await lerEstado(db, `trava:${nome}`)) === ate;
}

export async function liberarTrava(db: DB, nome: string): Promise<void> {
  await db.exec("UPDATE estado SET valor = ? WHERE chave = ?", [new Date(0).toISOString(), `trava:${nome}`]);
}
