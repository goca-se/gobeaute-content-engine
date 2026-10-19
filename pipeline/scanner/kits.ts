import type { ProdutoShopify } from "../lib/shopify/queries.js";
import { htmlParaTexto } from "../lib/fontes/shopify.js";
import { ehKit } from "../lib/fontes/kit.js";
import type { KitProposto } from "../lib/types.js";

const STOP = new Set(["de", "da", "do", "das", "dos", "e", "com", "para", "o", "a", "os", "as", "em", "kokeshi", "-"]);

function tokens(texto: string): string[] {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\b\d+([.,]\d+)?\s*(ml|g|gr|un|%)\b/g, " ")
    .split(/[^a-z0-9]+/)
    .filter((t) => t && !STOP.has(t));
}

function ngramas(toks: string[], min = 2, max = 4): string[] {
  const out: string[] = [];
  for (let n = min; n <= max; n++) for (let i = 0; i + n <= toks.length; i++) out.push(toks.slice(i, i + n).join(" "));
  return out;
}

/**
 * Propõe a composição de cada kit sem entrada no kits.yaml, cruzando a descrição do kit
 * com frases que identificam um único produto avulso ativo (n-gramas exclusivos do título).
 * É só proposta: entra no kits.yaml com `confirmado: false` para revisão humana.
 */
export function proporKits(produtos: ProdutoShopify[], jaMapeados: Set<string>): KitProposto[] {
  const avulsos = produtos.filter((p) => p.status === "ACTIVE" && !ehKit(p));

  // frase → produtos avulsos que a contêm no título
  const donos = new Map<string, Set<string>>();
  for (const p of avulsos) {
    for (const g of new Set(ngramas(tokens(p.title)))) {
      if (!donos.has(g)) donos.set(g, new Set());
      donos.get(g)!.add(p.handle);
    }
  }

  const propostas: KitProposto[] = [];
  for (const kit of produtos.filter((p) => p.status === "ACTIVE" && ehKit(p) && !jaMapeados.has(p.handle))) {
    const texto = ` ${tokens(`${kit.title} ${htmlParaTexto(kit.descriptionHtml)}`).join(" ")} `;
    const achados = new Map<string, string>();
    for (const [frase, hs] of donos) {
      if (hs.size !== 1 || !texto.includes(` ${frase} `)) continue;
      const [handle] = hs;
      // guarda a frase mais longa como evidência
      if (!achados.has(handle) || achados.get(handle)!.length < frase.length) achados.set(handle, frase);
    }
    if (achados.size === 0) continue;
    propostas.push({
      handle: kit.handle,
      title: kit.title,
      componentes: [...achados.keys()],
      evidencias: [...achados].map(([h, f]) => `${h} ← "${f}"`),
    });
  }
  return propostas;
}
