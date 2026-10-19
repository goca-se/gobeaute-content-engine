/**
 * Cliente Shopify Admin GraphQL.
 * Read-only por construção: `query()` rejeita qualquer documento com `mutation`.
 * O cliente de escrita (publisher, Fase 3) vai ser um módulo separado com token separado.
 */

type ThrottleStatus = { maximumAvailable: number; currentlyAvailable: number; restoreRate: number };
type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string; extensions?: { code?: string } }[];
  extensions?: { cost?: { requestedQueryCost: number; throttleStatus: ThrottleStatus } };
};

export class ShopifyError extends Error {}

const MAX_TENTATIVAS = 5;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Fornece o access token: fixo (shpat_) ou obtido via client credentials (apps do Dev Dashboard). */
type TokenProvider = () => Promise<string>;

export function tokenProviderFromEnv(shopDomain: string, prefixo: string): TokenProvider {
  // `process` só existe no Node (CLI); no worker as variáveis vêm de `env` via tokenProvider().
  const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};
  return tokenProvider(shopDomain, prefixo, env);
}

/** Igual ao fromEnv, mas com as variáveis passadas explicitamente (worker: `env` dos secrets do app). */
export function tokenProvider(shopDomain: string, prefixo: string, vars: Record<string, string | undefined>): TokenProvider {
  const fixo = vars[`${prefixo}_TOKEN`];
  if (fixo) return async () => fixo;

  const clientId = vars[`${prefixo}_CLIENT_ID`];
  const clientSecret = vars[`${prefixo}_CLIENT_SECRET`];
  if (!clientId || !clientSecret) {
    throw new ShopifyError(`defina ${prefixo}_TOKEN ou ${prefixo}_CLIENT_ID + ${prefixo}_CLIENT_SECRET`);
  }

  let cache: { token: string; expiraEm: number } | null = null;
  return async () => {
    // Renova com 5 min de folga antes de expirar.
    if (cache && Date.now() < cache.expiraEm - 5 * 60_000) return cache.token;
    const res = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "client_credentials", client_id: clientId, client_secret: clientSecret }),
    });
    if (!res.ok) throw new ShopifyError(`client credentials falhou (HTTP ${res.status}): ${await res.text()}`);
    const body = (await res.json()) as { access_token: string; scope: string; expires_in: number };
    cache = { token: body.access_token, expiraEm: Date.now() + body.expires_in * 1000 };
    console.error(`[shopify] token obtido para ${shopDomain} · escopos: ${body.scope} · expira em ${Math.round(body.expires_in / 3600)}h`);
    return cache.token;
  };
}

export class ShopifyReadClient {
  private endpoint: string;
  /** chamadas HTTP feitas por este cliente (o worker tem limite de subrequests por request) */
  chamadas = 0;
  private disponivel = Infinity;
  private restoreRate = 50;

  constructor(
    shopDomain: string,
    private token: TokenProvider,
    apiVersion: string,
  ) {
    this.endpoint = `https://${shopDomain}/admin/api/${apiVersion}/graphql.json`;
  }

  static fromEnv(shopDomain: string, prefixo: string, apiVersion: string): ShopifyReadClient {
    return new ShopifyReadClient(shopDomain, tokenProviderFromEnv(shopDomain, prefixo), apiVersion);
  }

  /** Só o ShopifyWriteClient (usado exclusivamente pelo publisher) desliga esta trava. */
  protected somenteLeitura = true;

  async query<T>(document: string, variables: Record<string, unknown> = {}, custoEstimado = 100): Promise<T> {
    if (this.somenteLeitura && /^\s*mutation\b/m.test(document)) throw new ShopifyError("ShopifyReadClient não executa mutations");

    for (let tentativa = 1; ; tentativa++) {
      // Espera o bucket encher o suficiente pro custo estimado da query.
      if (this.disponivel < custoEstimado) {
        await sleep(Math.ceil(((custoEstimado - this.disponivel) / this.restoreRate) * 1000));
      }

      let res: Response;
      this.chamadas++;
      try {
        res = await fetch(this.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": await this.token() },
          body: JSON.stringify({ query: document, variables }),
        });
      } catch (err) {
        if (tentativa >= MAX_TENTATIVAS) throw err;
        await sleep(backoff(tentativa));
        continue;
      }

      if (res.status === 429 || res.status >= 500) {
        if (tentativa >= MAX_TENTATIVAS) throw new ShopifyError(`HTTP ${res.status} após ${tentativa} tentativas`);
        const retryAfter = Number(res.headers.get("Retry-After"));
        await sleep(retryAfter ? retryAfter * 1000 : backoff(tentativa));
        continue;
      }
      if (!res.ok) throw new ShopifyError(`HTTP ${res.status}: ${await res.text()}`);

      const body = (await res.json()) as GraphQLResponse<T>;
      const throttle = body.extensions?.cost?.throttleStatus;
      if (throttle) {
        this.disponivel = throttle.currentlyAvailable;
        this.restoreRate = throttle.restoreRate;
      }

      if (body.errors?.some((e) => e.extensions?.code === "THROTTLED")) {
        if (tentativa >= MAX_TENTATIVAS) throw new ShopifyError("THROTTLED após retries");
        this.disponivel = 0;
        continue;
      }
      if (body.errors?.length) throw new ShopifyError(body.errors.map((e) => e.message).join("; "));
      if (!body.data) throw new ShopifyError("resposta sem data");
      return body.data;
    }
  }

  /** Itera uma connection paginada. `pick` extrai a connection de `data`. */
  async *paginate<T, N>(
    document: string,
    pick: (data: T) => { nodes: N[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } },
    variables: Record<string, unknown> = {},
    custoEstimado?: number,
  ): AsyncGenerator<N> {
    let after: string | null = null;
    do {
      const data: T = await this.query<T>(document, { ...variables, after }, custoEstimado);
      const conn = pick(data);
      yield* conn.nodes;
      after = conn.pageInfo.hasNextPage ? conn.pageInfo.endCursor : null;
    } while (after);
  }
}

function backoff(tentativa: number): number {
  return Math.min(30_000, 500 * 2 ** tentativa) + Math.random() * 250;
}

/**
 * Cliente com escrita. Uso exclusivo do publisher, com as credenciais de escrita
 * (credenciais_env_escrita). `mutate` lança erro se houver userErrors.
 */
export class ShopifyWriteClient extends ShopifyReadClient {
  protected somenteLeitura = false;

  static fromEnv(shopDomain: string, prefixo: string, apiVersion: string): ShopifyWriteClient {
    return new ShopifyWriteClient(shopDomain, tokenProviderFromEnv(shopDomain, prefixo), apiVersion);
  }

  async mutate<T>(document: string, variables: Record<string, unknown>, campo: string): Promise<T> {
    const data = await this.query<Record<string, T & { userErrors?: { field?: string[]; message: string; code?: string }[] }>>(document, variables, 50);
    const r = data[campo];
    if (r?.userErrors?.length) {
      throw new ShopifyError(`${campo}: ${r.userErrors.map((e) => `${(e.field ?? []).join(".")} ${e.message}${e.code ? ` (${e.code})` : ""}`).join("; ")}`);
    }
    return r;
  }
}
