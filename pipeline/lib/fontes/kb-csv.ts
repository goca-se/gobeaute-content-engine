import { parse } from "csv-parse/sync";
import type { Ficha } from "./index.js";

/**
 * Adapter da "Base de Conhecimento de Produtos" (planilha exportada em CSV).
 * Layout: 3 linhas de título/instrução, cabeçalho na 4ª linha, 1 produto por linha.
 */
const COLUNAS = {
  collection: "Collection",
  nome: "Produto",
  handle: "SKU / Handle",
  categoria: "Categoria",
  ativos: "Ingredientes / Ativos",
  paraQuem: "Para quem é",
  beneficios: "Benefícios",
  provaEficacia: "Prova de eficácia",
  modoUso: "Modo de uso",
  faq: "Perguntas frequentes (FAQ)",
  claims: "Claims / Selos",
  doNotSay: "Observações / Do not say",
} as const;

export function parseKbCsv(texto: string, path = "base CSV"): Map<string, Ficha> {
  const linhas: string[][] = parse(texto, { relax_column_count: true, bom: true });
  const idxHeader = linhas.findIndex((l) => l.includes(COLUNAS.handle) && l.includes(COLUNAS.nome));
  if (idxHeader < 0) throw new Error(`${path}: cabeçalho com "${COLUNAS.handle}" não encontrado`);

  const header = linhas[idxHeader];
  const col = Object.fromEntries(
    Object.entries(COLUNAS).map(([campo, nome]) => {
      const i = header.indexOf(nome);
      if (i < 0) throw new Error(`${path}: coluna "${nome}" ausente`);
      return [campo, i];
    }),
  ) as Record<keyof typeof COLUNAS, number>;

  const fichas = new Map<string, Ficha>();
  for (const linha of linhas.slice(idxHeader + 1)) {
    const get = (campo: keyof typeof COLUNAS) => (linha[col[campo]] ?? "").trim();
    const handle = get("handle");
    if (!handle || !get("nome")) continue;
    if (fichas.has(handle)) throw new Error(`${path}: handle duplicado "${handle}"`);
    fichas.set(handle, {
      handle,
      nome: get("nome"),
      origem: "kb_csv",
      collection: get("collection"),
      categoria: get("categoria"),
      descricao: "",
      ativos: get("ativos"),
      // A base lista ativos destacados, não a fórmula completa: INCI fica null até haver fonte própria.
      inci: null,
      paraQuem: get("paraQuem"),
      beneficios: get("beneficios"),
      provaEficacia: get("provaEficacia"),
      modoUso: get("modoUso"),
      advertencias: "",
      faq: get("faq"),
      claims: get("claims"),
      doNotSay: get("doNotSay"),
      raw: JSON.stringify(linha),
    });
  }
  return fichas;
}
