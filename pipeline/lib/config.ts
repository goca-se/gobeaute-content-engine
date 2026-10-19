import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { Contrato, PipelineConfig } from "../core/config.js";

export const PIPELINE_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const REPO_ROOT = resolve(PIPELINE_DIR, "..");

// Local: credenciais vêm do .env da raiz (gitignored). No CI vêm dos secrets do GitHub.
const ENV_FILE = resolve(REPO_ROOT, ".env");
if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

export { getLoja } from "../core/config.js";
export type { Contrato, FonteProdutoConfig, FormatoContrato, LlmConfig, LojaConfig, PipelineConfig } from "../core/config.js";

export function loadPipelineConfig(path = resolve(PIPELINE_DIR, "config/pipeline.yaml")): PipelineConfig {
  return PipelineConfig.parse(parse(readFileSync(path, "utf8")));
}

export function loadContrato(marca: string): Contrato {
  return Contrato.parse(parse(readFileSync(resolve(PIPELINE_DIR, `config/contrato/${marca}.yaml`), "utf8")));
}

export function assertEnabled(config: PipelineConfig): void {
  if (!config.enabled) {
    console.error("pipeline desabilitado (enabled: false em pipeline.yaml) — abortando");
    process.exit(3);
  }
}

// `npm run check-config`: valida pipeline.yaml e o contrato de cada loja.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const config = loadPipelineConfig();
  for (const loja of config.lojas) {
    const contrato = loadContrato(loja.marca);
    const gerados = contrato.pdp.filter((f) => f.gerar).map((f) => f.formato);
    console.log(`✓ ${loja.marca}: ${contrato.pdp.length} formatos no contrato, ${gerados.length} gerados (${gerados.join(", ")})`);
  }
  console.log(`✓ pipeline.yaml ok (enabled=${config.enabled}, dry_run=${config.dry_run})`);
}
