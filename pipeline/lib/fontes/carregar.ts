/** Leitura das fontes de ficha do disco (só CLI e build do painel; o worker recebe os dados prontos). */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";
import type { LojaConfig } from "../../core/config.js";
import { REPO_ROOT } from "../config.js";
import type { DadosFontes } from "./index.js";
import { parseKbCsv } from "./kb-csv.js";
import { parseKits, type KitsConfig } from "./kit.js";

export function carregarKits(path: string): KitsConfig {
  if (!existsSync(path)) return { kits: {} };
  return parseKits(parse(readFileSync(path, "utf8")));
}

export function carregarFontes(loja: LojaConfig): DadosFontes {
  const dados: DadosFontes = { kbCsv: [], kits: null };
  for (const fonte of loja.fontes_produto) {
    if (fonte.tipo === "kb_csv") {
      const path = resolve(REPO_ROOT, fonte.path);
      dados.kbCsv.push(...parseKbCsv(readFileSync(path, "utf8"), path).values());
    }
    if (fonte.tipo === "kit") dados.kits = carregarKits(resolve(REPO_ROOT, fonte.path));
  }
  return dados;
}
