const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const utc = (iso) => (iso && !/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? `${iso.replace(" ", "T")}Z` : iso); // datetime('now') do SQLite é UTC sem fuso
const fmtData = (iso) => (iso ? new Date(utc(iso)).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "");
const fmtTokens = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)} M` : n >= 1e3 ? `${Math.round(n / 1e3)} mil` : String(n ?? 0));
function haQuanto(iso) {
  if (!iso) return "nunca";
  const s = Math.round((Date.now() - new Date(utc(iso)).getTime()) / 1000);
  if (s < 60) return `há ${s}s`;
  if (s < 3600) return `há ${Math.round(s / 60)} min`;
  if (s < 86400) return `há ${Math.round(s / 3600)} h`;
  return `há ${Math.round(s / 86400)} dias`;
}

const MOTIVOS = {
  falta_ficha: "Sem ficha (fonte pobre ou ausente)",
  falta_inci: "Sem INCI completo",
  falta_brandbook: "Brandbook não populado",
  kit_nao_confirmado: "Kit: composição proposta, falta confirmar",
  kit_sem_composicao: "Kit: composição não identificada",
  kit_componente_sem_ficha: "Kit: componente sem ficha",
  status_draft: "Rascunho (draft)",
  status_unlisted: "Não listado",
  status_archived: "Arquivado",
  fora_loja_online: "Fora da loja online",
  gift: "Brinde",
  gift_preco: "Brinde (preço ≤ R$ 1)",
  tag_waitlist: "Waitlist",
  tag_gowaitlist: "Waitlist",
  exclusao_manual: "Exclusão manual",
};
const rotuloMotivo = (m) => (m ? MOTIVOS[m.split(":")[0]] ?? m : "");
const ORIGEM = { kb_csv: "Base CSV", kit: "Kit", shopify: "Shopify" };

/** Status de um formato no lote → [classe do chip, rótulo]. */
const STATUS_ITEM = {
  pendente: ["liberado", "na fila do robô"],
  gerando: ["revisao", "escrevendo agora"],
  gerado: ["revisao", "escrito, validando"],
  validado: ["revisao", "validado, publicando"],
  publicado: ["preenchido", "publicado pelo robô"],
  reprovado: ["bloqueado", "reprovado no verificador"],
  erro: ["bloqueado", "erro"],
  bloqueado: ["bloqueado", "bloqueado pelo robô"],
  pulado: ["fora_piloto", "pulado"],
  revertido: ["fora_piloto", "desfeito"],
};

const STATUS_PUB = {
  publicado: ["aprovado", "Publicado"],
  parcial: ["revisao", "Publicado em parte"],
  nao_publicado: ["bloqueado", "Não publicado"],
  erro: ["bloqueado", "Erro na publicação"],
  interrompido: ["bloqueado", "Interrompido"],
  revertido: ["fora_piloto", "Desfeito"],
};

const SITUACAO = {
  igual_ao_publicado: ["preenchido", "na loja, igual ao que o robô publicou"],
  editado_no_admin: ["revisao", "editado no Shopify depois da publicação"],
  apagado_no_admin: ["bloqueado", "apagado no Shopify depois da publicação"],
  preenchido_fora_do_pipeline: ["preenchido anterior", "preenchido fora do robô"],
  preenchido_apos_reversao: ["preenchido anterior", "preenchido depois de desfeito"],
  vazio: ["fora_piloto", "vazio na loja"],
};

const TABS = [
  { id: "agora", nome: "Lote" },
  { id: "alteracoes", nome: "Alterações" },
  { id: "fila", nome: "Fila", filtro: (p) => p.elegibilidade === "elegivel" && !completoAgora(p) },
  { id: "bloqueados", nome: "Bloqueados", filtro: (p) => p.elegibilidade === "bloqueado" },
  { id: "kits", nome: "Kits a revisar" },
  { id: "completos", nome: "Completos", filtro: (p) => p.elegibilidade === "completo" || completoAgora(p) },
  { id: "excluidos", nome: "Excluídos", filtro: (p) => p.elegibilidade === "excluido" },
  { id: "runs", nome: "Execuções" },
];

let estado = null;
let visao = null; // { run, itens, publicados_depois }
let alteracoes = [];
let runs = [];
let runEscolhido = null;
let tabAtual = "agora";
let busca = "";
let itensPorChave = new Map();
let timer = null;

async function api(path, opts) {
  const res = await fetch(path, { credentials: "same-origin", ...opts });
  const corpo = await res.json().catch(() => ({}));
  if (!res.ok && res.status !== 409) throw new Error(corpo.erro ?? `${path}: HTTP ${res.status}`);
  return corpo;
}
const post = (path, body) => api(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) });

async function carregar() {
  try {
    const q = runEscolhido ? `?run=${encodeURIComponent(runEscolhido)}` : "";
    [estado, visao, alteracoes, runs] = await Promise.all([api("/api/estado"), api(`/api/visao${q}`), api("/api/alteracoes"), api("/api/runs")]);
    $("erro").innerHTML = "";
    itensPorChave = new Map((visao.itens ?? []).map((i) => [`${i.handle}|${i.formato}`, i]));
    renderEstado();
    if (!visao.run) {
      $("run-info").textContent = "Nenhuma foto da loja ainda. Use “Atualizar foto da loja”.";
      return;
    }
    renderCabecalho();
    renderKpis();
    renderCobertura();
    renderMotivos();
    renderTabs();
    renderTabela();
  } catch (err) {
    $("erro").innerHTML = `<p class="erro">${esc(err.message)}</p>`;
  } finally {
    clearTimeout(timer);
    // Run em andamento: atualiza a cada 15 s; parado, a cada minuto.
    timer = setTimeout(carregar, estado?.run_ativo ? 15_000 : 60_000);
  }
}

// ---------- estado do robô ----------

function renderEstado() {
  const e = estado;
  const tick = e.ultimo_tick;
  const tickVelho = !tick || Date.now() - new Date(utc(tick)).getTime() > 5 * 60_000;
  let linha;
  if (!e.config.enabled) linha = `<span class="pill bad">● Desligado</span> <span>enabled: false no pipeline.yaml</span>`;
  else if (e.pausado) linha = `<span class="pill warn">⏸ Pausado</span> <span>${e.pausado_por === "nunca iniciado" ? "ainda não foi ligado" : `por ${esc(e.pausado_por)} ${haQuanto(e.pausado_em)}`}. Nada é gerado nem publicado até alguém retomar.</span>`;
  else if (e.run_ativo) {
    const p = e.run_ativo.progresso ?? {};
    const total = Object.values(p).reduce((s, n) => s + n, 0);
    const feitos = (p.publicado ?? 0) + (p.reprovado ?? 0) + (p.erro ?? 0) + (p.bloqueado ?? 0) + (p.pulado ?? 0);
    linha = `<span class="pill ok pulsa">● Trabalhando</span> <span><b>${esc(e.run_ativo.etapa ?? e.run_ativo.status)}</b> · ${feitos}/${total} formatos resolvidos · ${fmtTokens(e.run_ativo.tokens)} tokens</span>`;
  } else {
    const u = e.ultimo_run;
    linha = `<span class="pill">● Ocioso</span> <span>Próximo lote: todo dia às 06:00 (horário de Brasília).${u ? ` Último run ${haQuanto(u.finalizado_em ?? u.iniciado_em)} (${esc(u.status)}).` : ""}</span>`;
  }
  const batimento = `<span class="sub ${tickVelho && e.config.enabled && !e.pausado ? "alerta" : ""}">motor ${tick ? `verificado ${haQuanto(tick)}` : "ainda não rodou"}${tickVelho && e.config.enabled && !e.pausado ? " ⚠ o cron pode estar parado" : ""}</span>`;
  const botoes = `
    <button id="b-pausa" class="${e.pausado ? "primario" : ""}">${e.pausado ? "▶ Retomar robô" : "⏸ Pausar robô"}</button>
    <button id="b-lote" ${e.pausado || e.run_ativo ? "disabled" : ""} title="${e.pausado ? "Retome o robô primeiro" : e.run_ativo ? "Já existe um run em andamento" : "Escaneia a loja e gera/publica o lote de hoje"}">Rodar lote agora</button>
    <button id="b-scan" ${e.run_ativo ? "disabled" : ""} title="Só lê o Shopify e atualiza os números; não gera nada">Atualizar foto da loja</button>`;
  $("estado").innerHTML = `<div class="estado-linha">${linha}</div><div class="estado-acoes">${batimento}${botoes}</div>`;
  $("b-pausa").onclick = async () => {
    if (!e.pausado && !confirm("Pausar o robô? Ele termina o passo atual e para de gerar e publicar.")) return;
    if (e.pausado && !confirm(`Retomar o robô? Ele vai gerar e PUBLICAR direto na loja até ${e.config.lojas[0].max_produtos_por_run} produtos por dia.`)) return;
    await acao(() => post("/api/pausa", { pausado: !e.pausado }));
  };
  $("b-lote").onclick = async () => {
    if (!confirm("Rodar o lote agora? O robô escaneia a loja e começa a gerar e publicar os próximos produtos da fila.")) return;
    await acao(() => post("/api/runs", { modo: "completo" }), "Lendo a loja (até 1 min)…");
  };
  $("b-scan").onclick = () => acao(() => post("/api/runs", { modo: "scan" }), "Lendo a loja (até 1 min)…");
}

async function acao(fn, aguarde) {
  for (const b of document.querySelectorAll(".estado-acoes button")) b.disabled = true;
  if (aguarde) $("erro").innerHTML = `<p class="aviso">${esc(aguarde)}</p>`;
  try {
    const r = await fn();
    if (r?.pulado) alert(r.pulado);
    if (r?.id) runEscolhido = null;
  } catch (err) {
    alert(err.message);
  }
  await carregar();
}

// ---------- visão da loja ----------

function renderCabecalho() {
  const r = visao.run;
  $("loja").textContent = r.loja.charAt(0).toUpperCase() + r.loja.slice(1);
  $("run-select").innerHTML = runs
    .filter((x) => x.contagens)
    .map((x) => `<option value="${esc(x.id)}" ${x.id === r.run_id ? "selected" : ""}>${fmtData(x.iniciado_em)} · ${x.modo === "scan" ? "foto da loja" : "lote"}${x.origem === "importado" ? " (local)" : ""}</option>`)
    .join("");
  $("run-select").onchange = (e) => {
    runEscolhido = e.target.value === runs.find((x) => x.contagens)?.id ? null : e.target.value;
    carregar();
  };
  $("run-info").innerHTML =
    `Foto da loja de <b>${fmtData(r.iniciado_em)}</b> (${haQuanto(r.iniciado_em)}) · <code>${esc(r.shop_domain)}</code> · ` +
    `publicações feitas depois da foto já estão somadas` +
    (estado.config.dry_run ? ` · <span class="badge dry">dry-run</span>` : "");
}

/** Formatos publicados pelo robô depois da foto (e não desfeitos). */
function publicadoDepois(handle, formato) {
  const d = visao.publicados_depois?.[handle];
  return !!d && d.formatos.includes(formato) && d.revertidos.lastIndexOf(formato) < d.formatos.lastIndexOf(formato);
}

/** Estado real do formato agora: foto do scan + o que o robô fez depois. */
function estadoFormato(p, formato) {
  if (publicadoDepois(p.handle, formato)) return ["preenchido", "publicado pelo robô"];
  const e = p.formatos[formato];
  if (e === "preenchido") return ["preenchido", p.rodada_anterior?.formatos.includes(formato) ? "preenchido antes do robô" : "preenchido"];
  if (e === "fora_piloto") return ["fora_piloto", "fora do robô (depende de imagem)"];
  const item = itensPorChave.get(`${p.handle}|${formato}`);
  if (item) return STATUS_ITEM[item.status] ?? ["bloqueado", item.status];
  const doScan = visao.run.items.find((i) => i.handle === p.handle && i.formato === formato);
  return doScan?.status === "detectado" ? ["liberado", "na fila"] : ["bloqueado", rotuloMotivo(doScan?.motivo) || "bloqueado"];
}

function completoAgora(p) {
  return visao.run.formatos.filter((f) => f.gerar).every((f) => estadoFormato(p, f.formato)[0] === "preenchido");
}

function renderKpis() {
  const r = visao.run;
  const c = r.contagens;
  const base = r.produtos.filter((p) => p.elegibilidade !== "excluido");
  const completos = base.filter((p) => p.elegibilidade === "completo" || completoAgora(p)).length;
  const fila = r.produtos.filter((p) => p.elegibilidade === "elegivel" && !completoAgora(p)).length;
  const lote = new Set((visao.itens ?? []).map((i) => i.handle)).size;
  const publicadosLote = new Set((visao.itens ?? []).filter((i) => i.status === "publicado").map((i) => i.handle)).size;
  const kits = r.produtos.filter((p) => p.is_kit && p.elegibilidade === "bloqueado").length;
  const kpis = [
    ["Lote desta execução", lote ? `${publicadosLote}/${lote}` : "—", lote ? "produtos publicados" : "foto da loja, sem lote", true],
    ["Na fila", fila, "sem conteúdo, robô consegue escrever"],
    ["Bloqueados", c.bloqueados, `${kits} são kits a revisar`],
    ["Completos", completos, "todos os formatos do robô"],
    ["Ativos", c.ativos, `${c.produtos_escaneados} na loja`],
    ["Excluídos", c.excluidos, "rascunho, brinde, waitlist…"],
  ];
  $("kpis").innerHTML = kpis
    .map(([nome, valor, sub, destaque]) => `<div class="kpi${destaque ? " destaque" : ""}"><small>${nome}</small><b>${valor}</b><small>${sub}</small></div>`)
    .join("");
}

function renderCobertura() {
  const base = visao.run.produtos.filter((p) => p.elegibilidade !== "excluido");
  $("cobertura").innerHTML = visao.run.formatos
    .filter((f) => f.gerar)
    .map((f) => {
      const n = { ok: 0, warn: 0, bad: 0 };
      for (const p of base) {
        const [classe] = estadoFormato(p, f.formato);
        n[classe === "preenchido" ? "ok" : classe === "bloqueado" ? "bad" : "warn"]++;
      }
      const total = base.length || 1;
      const pct = (x) => `${(100 * x) / total}%`;
      return `<div class="barra" title="${n.ok} preenchidos · ${n.warn} na fila/em andamento · ${n.bad} bloqueados">
        <span>${esc(f.formato)}</span>
        <span class="trilho"><i class="c-ok" style="width:${pct(n.ok)}"></i><i class="c-warn" style="width:${pct(n.warn)}"></i><i class="c-bad" style="width:${pct(n.bad)}"></i></span>
        <span class="num">${Math.round((100 * n.ok) / total)}%</span>
      </div>`;
    })
    .join("");
}

function renderMotivos() {
  const cont = new Map();
  for (const p of visao.run.produtos.filter((p) => p.elegibilidade === "bloqueado")) {
    const k = rotuloMotivo(p.motivo);
    cont.set(k, (cont.get(k) ?? 0) + 1);
  }
  const lista = [...cont].sort((a, b) => b[1] - a[1]);
  const max = lista[0]?.[1] ?? 1;
  $("motivos").innerHTML = lista.length
    ? lista.map(([m, n]) => `<div class="motivo"><span class="rot">${esc(m)}<em style="width:${(100 * n) / max}%"></em></span><span class="num">${n}</span></div>`).join("")
    : `<p class="sub">Nada bloqueado.</p>`;
}

function produtosDoLote() {
  const handles = [...new Set((visao.itens ?? []).map((i) => i.handle))];
  return handles.map((h) => visao.run.produtos.find((p) => p.handle === h)).filter(Boolean);
}

function kitsPendentes() {
  const propostas = new Map(visao.run.kits_propostos.map((k) => [k.handle, k]));
  return visao.run.produtos.filter((p) => p.is_kit && p.elegibilidade === "bloqueado").map((p) => ({ ...p, proposta: propostas.get(p.handle) }));
}

function renderTabs() {
  const contar = (t) =>
    t.filtro ? visao.run.produtos.filter(t.filtro).length : t.id === "kits" ? kitsPendentes().length : t.id === "agora" ? produtosDoLote().length : t.id === "runs" ? runs.length : alteracoes.length;
  $("tabs").innerHTML =
    TABS.map((t) => `<button role="tab" aria-selected="${t.id === tabAtual}" data-tab="${t.id}">${t.nome} <span class="tag">${contar(t)}</span></button>`).join("") +
    `<span class="busca"><input type="search" id="busca" placeholder="Buscar produto…" value="${esc(busca)}"></span>`;
  for (const b of $("tabs").querySelectorAll("button")) b.onclick = () => { tabAtual = b.dataset.tab; renderTabs(); renderTabela(); };
  $("busca").oninput = (e) => { busca = e.target.value; renderTabela(); };
}

function filtrarBusca(lista, titulo = (p) => p.title, handle = (p) => p.handle) {
  const q = busca.trim().toLowerCase();
  return q ? lista.filter((p) => (titulo(p) ?? "").toLowerCase().includes(q) || (handle(p) ?? "").includes(q)) : lista;
}

function linkProduto(handle, titulo) {
  return `<a href="#" class="abre" data-handle="${esc(handle)}">${esc(titulo ?? handle)}</a>`;
}

function celulaProduto(p) {
  const mv = p.tags.includes("Mais Vendido") ? ` <span class="badge">Mais Vendido</span>` : "";
  const loja = p.url ? ` <a class="h" href="${esc(p.url)}" target="_blank" rel="noopener" title="Abrir na loja">↗</a>` : "";
  return `${linkProduto(p.handle, p.title)}${mv}${loja}<div class="h">${esc(p.handle)}</div>${seloRodadaAnterior(p)}`;
}

function seloRodadaAnterior(p) {
  const ra = p.rodada_anterior;
  if (!ra) return "";
  const quando = ra.publicado_em ? ` · ${new Date(ra.publicado_em).toLocaleDateString("pt-BR")}` : "";
  return `<div><span class="badge anterior" title="Preenchido fora do robô: ${esc(ra.formatos.join(", "))}">Conteúdo anterior ao robô${quando}</span></div>`;
}

function chips(p) {
  return `<div class="chips">${visao.run.formatos
    .map((f) => {
      const [classe, rotulo] = estadoFormato(p, f.formato);
      return `<span class="chip ${classe}" title="${esc(f.metafield)}: ${esc(rotulo)}">${esc(f.formato)}</span>`;
    })
    .join("")}</div>`;
}

function ligarLinks(raiz = document) {
  for (const a of raiz.querySelectorAll("a.abre")) a.onclick = (e) => { e.preventDefault(); abrirProduto(a.dataset.handle); };
}

function renderTabela() {
  const tab = TABS.find((t) => t.id === tabAtual);
  if (tab.id === "agora") renderLote();
  else if (tab.id === "alteracoes") renderAlteracoes();
  else if (tab.id === "kits") renderKits();
  else if (tab.id === "runs") renderRuns();
  else {
    const lista = filtrarBusca(visao.run.produtos.filter(tab.filtro));
    const comFila = tab.id === "fila";
    $("thead").innerHTML = `<tr>${comFila ? "<th>#</th>" : ""}<th>Produto</th><th>Ficha</th><th>Formatos</th>${comFila ? "" : "<th>Motivo</th>"}</tr>`;
    $("tbody").innerHTML = lista.length
      ? lista
          .map(
            (p) => `<tr>
            ${comFila ? `<td class="n">${p.prioridade ?? ""}</td>` : ""}
            <td>${celulaProduto(p)}</td>
            <td>${esc(ORIGEM[p.ficha_origem] ?? "—")}</td>
            <td>${chips(p)}</td>
            ${comFila ? "" : `<td>${esc(rotuloMotivo(p.motivo))}${p.motivo?.includes(":") ? `<div class="h">${esc(p.motivo.split(":").slice(1).join(":"))}</div>` : ""}</td>`}
          </tr>`,
          )
          .join("")
      : `<tr><td colspan="5" class="vazio">Nenhum produto aqui.</td></tr>`;
  }
  ligarLinks($("tbody"));
}

function renderLote() {
  const lista = filtrarBusca(produtosDoLote());
  $("thead").innerHTML = `<tr><th>#</th><th>Produto</th><th>Formatos deste lote</th><th>Tokens</th></tr>`;
  if (!lista.length) {
    $("tbody").innerHTML = `<tr><td colspan="4" class="vazio">${visao.run.modo === "scan" ? "Esta execução foi só uma foto da loja (sem lote)." : "Nenhum produto neste lote."}</td></tr>`;
    return;
  }
  $("tbody").innerHTML = lista
    .map((p) => {
      const itens = visao.itens.filter((i) => i.handle === p.handle);
      const tok = itens.reduce((s, i) => s + (i.tokens ?? 0), 0);
      const fmts = itens
        .map((i) => {
          const [classe, rotulo] = STATUS_ITEM[i.status] ?? ["bloqueado", i.status];
          const motivo = i.motivo && !["publicado", "validado"].includes(i.status) ? `: ${i.motivo}` : "";
          return `<span class="chip ${classe}${i.status === "gerando" ? " pulsa" : ""}" title="${esc(rotulo + motivo)}${i.tentativas > 1 ? ` · ${i.tentativas} tentativas` : ""}">${esc(i.formato)} · ${esc(rotulo)}</span>`;
        })
        .join("");
      return `<tr><td class="n">${p.prioridade ?? ""}</td><td>${celulaProduto(p)}</td><td><div class="chips">${fmts}</div></td><td class="n">${fmtTokens(tok)}</td></tr>`;
    })
    .join("");
}

function renderKits() {
  const lista = filtrarBusca(kitsPendentes());
  $("thead").innerHTML = `<tr><th>Kit</th><th>Composição proposta</th><th>Situação</th></tr>`;
  $("tbody").innerHTML = lista.length
    ? lista
        .map(
          (k) => `<tr>
          <td>${celulaProduto(k)}</td>
          <td>${k.proposta ? k.proposta.componentes.map((c) => `<div class="h">${esc(c)}</div>`).join("") : `<span class="sub">nenhum item identificado na descrição</span>`}</td>
          <td>${esc(rotuloMotivo(k.motivo))}${k.proposta && k.proposta.componentes.length < 2 ? `<div class="tag">proposta parcial: só 1 item achado</div>` : ""}</td>
        </tr>`,
        )
        .join("") +
      `<tr><td colspan="3" class="sub">Para liberar um kit: revise em <code>brand-context/kokeshi/kits.yaml</code>, marque <code>confirmado: true</code> e faça o deploy do painel.</td></tr>`
    : `<tr><td colspan="3" class="vazio">Nenhum kit pendente.</td></tr>`;
}

function renderRuns() {
  $("thead").innerHTML = `<tr><th>Início</th><th>Tipo</th><th>Quem</th><th>Situação</th><th>Formatos</th><th>Tokens</th></tr>`;
  $("tbody").innerHTML = runs.length
    ? runs
        .map((r) => {
          const itens = Object.entries(r.itens ?? {}).map(([s, n]) => `<span class="chip ${(STATUS_ITEM[s] ?? ["bloqueado"])[0]}">${n} ${esc((STATUS_ITEM[s] ?? [0, s])[1])}</span>`).join("");
          const quem = r.origem === "cron" ? "agendado" : r.origem === "importado" ? "run local (importado)" : r.origem.replace("manual:", "");
          return `<tr>
            <td>${fmtData(r.iniciado_em)}<div class="h">${esc(r.id)}</div></td>
            <td>${r.modo === "scan" ? "foto da loja" : "lote"}</td>
            <td>${esc(quem)}</td>
            <td>${esc(r.status)}${r.etapa && r.status !== "concluido" ? `<div class="h">${esc(r.etapa)}</div>` : ""}${r.erro ? `<div class="flag erro">${esc(r.erro)}</div>` : ""}</td>
            <td><div class="chips">${itens || "—"}</div></td>
            <td class="n">${fmtTokens(r.tokens)}</td>
          </tr>`;
        })
        .join("")
    : `<tr><td colspan="6" class="vazio">Nenhuma execução.</td></tr>`;
}

// ---------- Alterações (log por produto) ----------

function resumoValor(v) {
  if (!v) return "vazio";
  if (v.startsWith("[")) {
    try { return `${JSON.parse(v).length} itens`; } catch { /* segue */ }
  }
  if (v.startsWith("gid://")) return "1 item";
  return "texto";
}

function renderAlteracoes() {
  const lista = filtrarBusca(alteracoes, (a) => a.title, (a) => a.handle);
  $("thead").innerHTML = `<tr><th>Quando</th><th>Produto</th><th>Situação</th><th>O que mudou</th><th></th></tr>`;
  $("tbody").innerHTML = lista.length
    ? lista
        .map((a) => {
          const d = a.detalhe ?? {};
          const [classe, rotulo] = STATUS_PUB[a.status] ?? ["bloqueado", a.status];
          const mudou = (d.metafields ?? []).map((m) => `<div><b>${esc(m.formato)}</b> <span class="h">${esc(resumoValor(m.antes))} → ${esc(resumoValor(m.depois))}</span></div>`).join("");
          const fora = (d.formatos_pulados ?? []).map((f) => `<div class="h fora">✕ ${esc(f.formato)}: ${esc(f.motivo)}</div>`).join("");
          const editar = d.admin_url ? `<a class="botao" href="${esc(d.admin_url)}" target="_blank" rel="noopener">Editar no Shopify ↗</a>` : "";
          return `<tr>
            <td>${fmtData(d.publicado_em ?? a.criado_em)}<div class="h">${esc(a.run_id)}</div></td>
            <td>${linkProduto(a.handle, a.title)}<div class="h">${esc(a.handle)}</div></td>
            <td><span class="chip ${classe}">${esc(rotulo)}</span>${a.revertido_por ? `<div class="h">por ${esc(a.revertido_por)} · ${fmtData(a.revertido_em)}</div>` : ""}${d.erro ? `<div class="flag erro">${esc(d.erro)}</div>` : ""}</td>
            <td>${mudou || "—"}${fora}</td>
            <td>${editar}</td>
          </tr>`;
        })
        .join("")
    : `<tr><td colspan="5" class="vazio">O robô ainda não publicou nada.</td></tr>`;
}

// ---------- detalhe do produto ----------

/** Markdown mínimo do content.md (títulos, negrito, itálico). Escapa tudo antes. */
function md(texto) {
  return esc(texto)
    .replace(/^### (.*)$/gm, "<h4>$1</h4>")
    .replace(/^## (.*)$/gm, "<h4>$1</h4>")
    .replace(/^# (.*)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|\s)\*(\S.+?)\*(?=\s|$)/g, "$1<em>$2</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^---$/gm, "<hr>");
}

const TIPO_EVENTO = {
  gerado: "escreveu",
  validado: "verificador aprovou",
  reprovado_retry: "verificador reprovou, vai reescrever",
  reprovado: "verificador reprovou (sem nova tentativa)",
  bloqueado: "robô bloqueou (falta informação)",
  erro_llm: "AI Proxy falhou",
  erro_geracao: "resposta inválida do modelo",
  erro_validacao: "verificador indisponível",
  publicacao_publicado: "publicou na loja",
  publicacao_parcial: "publicou em parte",
  publicacao_nao_publicado: "não publicou",
  erro_publicacao: "erro ao publicar",
  revertido: "publicação desfeita",
  erro: "erro",
};

async function abrirProduto(handle) {
  const dlg = $("produto");
  $("produto-corpo").innerHTML = `<p class="sub">Carregando…</p>`;
  dlg.showModal();
  const p = visao.run.produtos.find((x) => x.handle === handle);
  try {
    const [det, loja] = await Promise.all([api(`/api/produtos/${handle}`), api(`/api/produtos/${handle}/shopify`).catch((e) => ({ erro: e.message }))]);
    const titulo = p?.title ?? det.itens[0]?.title ?? handle;
    const ultimaPub = det.publicacoes.find((x) => ["publicado", "parcial"].includes(x.status));
    const admin = det.publicacoes.find((x) => x.detalhe?.admin_url)?.detalhe.admin_url;

    const naLoja = loja.erro
      ? `<p class="erro">Não consegui ler o Shopify agora: ${esc(loja.erro)}</p>`
      : `<table><tbody>${loja.formatos
          .map((f) => {
            const [classe, rotulo] = SITUACAO[f.situacao] ?? ["bloqueado", f.situacao];
            return `<tr><td><b>${esc(f.formato)}</b><div class="h">${esc(f.metafield)}</div></td><td><span class="chip ${classe}">${esc(rotulo)}</span>${f.publicado_em ? `<div class="h">robô publicou em ${fmtData(f.publicado_em)}</div>` : ""}</td></tr>`;
          })
          .join("")}</tbody></table><div class="sub">lido do Shopify agora (${fmtData(loja.lido_em)}) · produto alterado no admin em ${fmtData(loja.product_updated_at)}</div>`;

    // Última versão escrita de cada formato (mais recente primeiro na API).
    const vistos = new Set();
    const ultimos = det.conteudos.filter((c) => (vistos.has(c.formato) ? false : vistos.add(c.formato)));
    const itemDe = (c) => det.itens.find((i) => i.id === c.item_id);
    const conteudos = ultimos
      .map((c) => {
        const it = itemDe(c);
        const [classe, rotulo] = it ? STATUS_ITEM[it.status] ?? ["bloqueado", it.status] : ["fora_piloto", "—"];
        const flags = (it?.flags ?? [])
          .map((f) => `<li class="flag ${f.severidade}"><b>${f.severidade === "erro" ? "Erro" : "Observação"}</b> · ${esc(f.camada === "llm" ? "revisor IA" : "regras")}: ${esc(f.detalhe)}</li>`)
          .join("");
        const versoes = det.conteudos.filter((x) => x.formato === c.formato).length;
        return `<details class="item">
          <summary><span class="chip ${classe}">${esc(rotulo)}</span> <b>${esc(c.formato)}</b> <span class="h">${fmtData(c.criado_em)} · ${esc(c.modelo ?? "")}${versoes > 1 ? ` · ${versoes} versões` : ""}</span></summary>
          ${flags ? `<ul class="flags">${flags}</ul>` : ""}
          <div class="preview">${md(c.content_md)}</div>
        </details>`;
      })
      .join("");

    const linha = det.eventos
      .map((e) => `<li><span class="h">${fmtData(e.criado_em)}</span> ${e.formato ? `<b>${esc(e.formato)}</b> · ` : ""}${esc(TIPO_EVENTO[e.tipo] ?? e.tipo)}${e.detalhe ? ` <span class="h">${esc(e.detalhe)}</span>` : ""} <span class="h">· ${esc(e.autor)}</span></li>`)
      .join("");

    const pubs = det.publicacoes
      .map((x) => {
        const [classe, rotulo] = STATUS_PUB[x.status] ?? ["bloqueado", x.status];
        const pode = ["publicado", "parcial"].includes(x.status) && x.tem_snapshot;
        return `<li><span class="chip ${classe}">${esc(rotulo)}</span> ${fmtData(x.detalhe?.publicado_em ?? x.criado_em)} · ${esc((x.detalhe?.formatos_publicados ?? []).join(", ") || "—")}
          ${pode ? `<button class="desfazer" data-id="${x.id}">Desfazer</button>` : ""}${x.revertido_por ? ` <span class="h">desfeito por ${esc(x.revertido_por)}</span>` : ""}</li>`;
      })
      .join("");

    $("produto-corpo").innerHTML = `
      <div class="rev-cabecalho">
        <div><h2>${esc(titulo)}</h2><div class="h">${esc(handle)}</div></div>
        <div class="lado">${p?.url ? `<a class="botao" href="${esc(p.url)}" target="_blank" rel="noopener">Ver na loja ↗</a>` : ""}${admin ? `<a class="botao" href="${esc(admin)}" target="_blank" rel="noopener">Editar no Shopify ↗</a>` : ""}</div>
      </div>
      <h4 class="secao">Na loja agora</h4>${naLoja}
      <h4 class="secao">O que o robô escreveu</h4>${conteudos || `<p class="sub">O robô ainda não escreveu nada para este produto.</p>`}
      <h4 class="secao">Publicações</h4>${pubs ? `<ul class="historico">${pubs}</ul>` : `<p class="sub">Nenhuma.</p>`}
      ${ultimaPub ? `<p class="sub">Desfazer devolve os campos ao que eram antes (foto salva na hora da publicação) e apaga os itens que o robô criou. Se alguém editou no Shopify depois, o robô não mexe.</p>` : ""}
      <h4 class="secao">Linha do tempo</h4>${linha ? `<ul class="historico">${linha}</ul>` : `<p class="sub">Sem eventos.</p>`}`;
    for (const b of $("produto-corpo").querySelectorAll("button.desfazer")) b.onclick = () => desfazer(Number(b.dataset.id), handle);
  } catch (err) {
    $("produto-corpo").innerHTML = `<p class="erro">${esc(err.message)}</p>`;
  }
}

async function desfazer(id, handle) {
  const teste = await post(`/api/publicacoes/${id}/reverter`, { confirmar: false });
  if (!teste.ok) return alert(teste.editados?.length ? `Não dá para desfazer: ${teste.editados.join(", ")} foi editado no Shopify depois da publicação.` : teste.erro);
  if (!confirm("Desfazer esta publicação? Os campos voltam a ficar como estavam antes do robô.")) return;
  const r = await post(`/api/publicacoes/${id}/reverter`, { confirmar: true });
  alert(r.ok ? "Publicação desfeita." : `Não foi possível: ${r.erro}`);
  await carregar();
  abrirProduto(handle);
}

$("produto-fechar").onclick = () => $("produto").close();
$("produto").addEventListener("click", (e) => { if (e.target === $("produto")) $("produto").close(); });

carregar();

// Guia aberto na primeira visita; depois lembra a escolha (só neste navegador).
(() => {
  const guia = document.getElementById("guia");
  try {
    const salvo = localStorage.getItem("guia-aberto-v2");
    guia.open = salvo === null ? true : salvo === "1";
    guia.addEventListener("toggle", () => {
      try { localStorage.setItem("guia-aberto-v2", guia.open ? "1" : "0"); } catch { /* sem storage */ }
    });
  } catch {
    guia.open = true;
  }
})();
