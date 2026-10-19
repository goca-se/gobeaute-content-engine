/**
 * Cliente do Gogroup AI Proxy (API compatível com OpenAI chat/completions).
 * O proxy ignora `response_format`, então a saída JSON é pedida no prompt e extraída aqui.
 */
import type { LlmConfig } from "./config.js";

export type MensagemLlm = { role: "system" | "user" | "assistant"; content: string };
export type RespostaLlm = { texto: string; tokens: number; modelo: string };

export class LlmError extends Error {}

const MAX_TENTATIVAS = 4;
const TIMEOUT_MS = 150_000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function chat(cfg: LlmConfig, token: string, modelo: string, mensagens: MensagemLlm[]): Promise<RespostaLlm> {
  for (let tentativa = 1; ; tentativa++) {
    let res: Response;
    try {
      res = await fetch(`${cfg.base_url.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: modelo, messages: mensagens }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (err) {
      if (tentativa >= MAX_TENTATIVAS) throw new LlmError(`AI Proxy indisponível: ${String(err)}`);
      await sleep(1000 * 2 ** tentativa);
      continue;
    }
    if (res.status === 429 || res.status >= 500) {
      if (tentativa >= MAX_TENTATIVAS) throw new LlmError(`AI Proxy HTTP ${res.status} após ${tentativa} tentativas: ${(await res.text()).slice(0, 300)}`);
      const retryAfter = Number(res.headers.get("Retry-After"));
      await sleep(retryAfter ? retryAfter * 1000 : 1000 * 2 ** tentativa);
      continue;
    }
    if (!res.ok) throw new LlmError(`AI Proxy HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const body = (await res.json()) as {
      model?: string;
      choices?: { message?: { content?: string } }[];
      usage?: { total_tokens?: number };
    };
    const texto = body.choices?.[0]?.message?.content;
    if (!texto) throw new LlmError("AI Proxy respondeu sem conteúdo");
    return { texto, tokens: body.usage?.total_tokens ?? 0, modelo: body.model ?? modelo };
  }
}

/** Extrai o primeiro objeto JSON de uma resposta (tolera cercas ```json e texto em volta). */
export function extrairJson(texto: string): unknown {
  const limpo = texto.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
  const ini = limpo.indexOf("{");
  const fim = limpo.lastIndexOf("}");
  if (ini < 0 || fim <= ini) throw new LlmError("resposta sem objeto JSON");
  return JSON.parse(limpo.slice(ini, fim + 1));
}
