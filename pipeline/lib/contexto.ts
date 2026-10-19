/** Lê do disco os textos de referência da marca e da skill pdp-content (CLI e build do painel). */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ContextoMarca } from "../core/gerar.js";
import { REPO_ROOT } from "./config.js";

export function carregarContextoMarca(marca: string): ContextoMarca {
  const ler = (p: string) => (existsSync(resolve(REPO_ROOT, p)) ? readFileSync(resolve(REPO_ROOT, p), "utf8") : "");
  const dirRefs = resolve(REPO_ROOT, ".claude/skills/pdp-content/references");
  return {
    marca,
    brandbook: ler(`brand-context/${marca}/brandbook.md`),
    compliance: ler("brand-context/_shared/compliance-anvisa.md"),
    skillPdp: ler(".claude/skills/pdp-content/SKILL.md"),
    referencias: Object.fromEntries(readdirSync(dirRefs).filter((f) => f.endsWith(".md")).map((f) => [f, readFileSync(resolve(dirRefs, f), "utf8")])),
  };
}
