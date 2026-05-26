# Product Resolver — Dados reais a partir do handle

🚨 **Regra de ouro**: NUNCA inventar imagem, preço, título ou descrição de produto. Tudo vem do Shopify via handle.

Essa reference define como resolver `product_handle` (slug do produto) ou `collection_handle` em **dados reais** do Shopify para popular `product-cta-card`.

---

## 🎯 Quando aplicar

Toda vez que um `product-cta-card` for renderizado, o renderizador DEVE:
1. Receber `product_handle` OU `collection_handle` (não ambos) no schema do bloco
2. Consultar Shopify Admin GraphQL para obter dados reais
3. Usar **a imagem real do produto** (`featuredImage.url` ou primeira de `images`) — nunca gerar via PiApp

Se o resolver falhar (produto não existe, sem imagem, sem preço), **NÃO renderizar o card** — substituir por um placeholder de texto com flag `[FALTA PRODUTO: handle]` para revisão humana.

---

## 📦 Resolver Product → dados reais

### GraphQL query

```graphql
query ResolveProduct($handle: String!) {
  productByHandle(handle: $handle) {
    id
    handle
    title
    descriptionHtml
    onlineStoreUrl
    vendor
    productType
    tags
    featuredImage {
      url
      altText
      width
      height
    }
    priceRangeV2 {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    compareAtPriceRange {
      minVariantCompareAtPrice { amount currencyCode }
      maxVariantCompareAtPrice { amount currencyCode }
    }
    variants(first: 1) {
      edges {
        node {
          id
          title
          availableForSale
          inventoryQuantity
          price
          compareAtPrice
        }
      }
    }
    metafield(namespace: "global", key: "trust_line") { value }
  }
}
```

### Mapping Shopify → schema `product-cta-card`

| Campo do card | Origem no Shopify | Fallback |
|---|---|---|
| `image_url` | `featuredImage.url` | Se vazio → flag `[FALTA IMAGEM: handle]`, não renderizar card |
| `image_alt` | `featuredImage.altText` | `"<title> da <vendor>"` |
| `eyebrow` | `"<vendor> · <productType>"` em caps | `vendor` em caps |
| `title` | `title` | obrigatório |
| `description` | Brand-context do produto OU `descriptionHtml` truncado em 200 chars | `descriptionHtml` |
| `price_current` | `priceRangeV2.minVariantPrice` formatado | obrigatório |
| `price_original` | `compareAtPriceRange.minVariantCompareAtPrice` se > price_current | omitir |
| `discount_badge` | calcular `(1 - current/original) * 100`% | omitir |
| `cta_url` | `/products/<handle>` | obrigatório |
| `cta_label` | `"Conhecer <title>"` ou `"Comprar agora"` | configurável |
| `trust_line` | metafield `global.trust_line` se existir | fallback do brandbook |

### Formatação de preço (BR)

```
amount: "69.90", currencyCode: "BRL"  →  "R$ 69,90"
amount: "129.00", currencyCode: "BRL"  →  "R$ 129,00"
```

Sempre vírgula como separador decimal, 2 casas, prefixo `R$ ` com espaço.

---

## 📚 Resolver Collection → dados reais

Para `collection_handle` ao invés de `product_handle`:

```graphql
query ResolveCollection($handle: String!) {
  collectionByHandle(handle: $handle) {
    id
    handle
    title
    descriptionHtml
    image {
      url
      altText
    }
    productsCount { count }
    products(first: 4) {
      edges {
        node {
          id
          title
          featuredImage { url }
          priceRangeV2 { minVariantPrice { amount currencyCode } }
        }
      }
    }
  }
}
```

### Mapping Collection → `product-cta-card`

- `image_url`: `collection.image.url` OU monta um collage 2x2 dos `products[0..3].featuredImage` via piapp-image-gen com `purpose: collection-collage` (refs = essas 4 URLs reais)
- `eyebrow`: `"<brand> · <collection.title>"`
- `title`: `collection.title`
- `description`: 1ª frase de `descriptionHtml` ou primeiro elemento de brand-context da collection
- `price_current`: faixa de preço (`R$ X – R$ Y`) ou preço médio
- `cta_url`: `/collections/<handle>`
- `cta_label`: `"Explorar <collection.title>"`

---

## 🛒 Validação de existência (pre-flight)

Antes de gerar o body do artigo, fazer **batch resolve** de TODOS os handles que aparecem no outline:

```graphql
query BatchResolve($handles: [String!]!) {
  products: nodes(ids: []) { id }
  productByHandle1: productByHandle(handle: $handle1) { id handle featuredImage { url } }
  productByHandle2: productByHandle(handle: $handle2) { id handle featuredImage { url } }
  ...
}
```

(Ou um loop sequencial — Shopify rate limit permite ~40 req/s).

**Resultado da validação**:
- ✅ Todos existem + têm imagem → prosseguir
- ⚠️ Algum não tem imagem → flag `[FALTA IMAGEM: handle]` no JSON do artigo + omitir card
- ❌ Algum handle não existe → ABORTAR e retornar erro pro usuário com lista de handles inválidos

---

## 🖼️ Imagem do produto no card — sempre Shopify CDN

```html
<img src="{{shopify_cdn_url_resolved}}"
     alt="{{title}} da {{vendor}}"
     loading="lazy" />
```

**Nunca** gerar imagem via PiApp para o slot do `product-cta-card`. A imagem do PiApp foi um pattern do v1 — agora SOMENTE imagens reais do catálogo.

A skill `piapp-image-gen` continua sendo usada para:
- `cover.png` (16:9)
- `illustration-XX.png` (4:5)
- `collection-collage.png` (1:1, se collection sem imagem própria — usa fotos reais dos produtos como refs)

Mas **NÃO** mais para `product-card-XX.png`.

---

## 🔗 Validação de URLs internas (CTA links)

Toda URL de CTA em qualquer bloco do artigo (não só `product-cta-card`) deve apontar para uma rota válida no Shopify. Antes de publicar, validar:

- `/products/<handle>` → existe `productByHandle(handle)`?
- `/collections/<handle>` → existe `collectionByHandle(handle)`?
- `/pages/<handle>` → existe `pageByHandle(handle)`?
- `/blogs/<blog>/<article>` → existe?

Se a URL for inválida, flag `[CTA INVÁLIDO: <url>]` e usar fallback `/collections/all` ou abortar — configurável.

---

## 📁 Cache local (opcional, recomendado para batch)

Para evitar re-query no batch mode, salvar resolvidos em:

```
conteudos/_cache/shopify-resolver/
├── products/
│   ├── <handle>.json           # último resolve (TTL 24h)
│   └── ...
└── collections/
    └── <handle>.json
```

Antes de cada resolve, checar cache. Se TTL não expirou, reusar. Senão, re-query.

---

## 🚨 Guardrails

- ❌ Inventar imagem, preço, descrição de produto
- ❌ Gerar imagem via PiApp para `product-cta-card`
- ❌ Usar URL `/products/xxx` sem validar que o produto existe
- ❌ Renderizar card sem `featuredImage` — flag + omitir
- ✅ Sempre `productByHandle` ou `collectionByHandle` antes de renderizar
- ✅ Sempre formatar preço como `R$ X,YZ` (BR)
- ✅ Sempre `image_alt` descritivo
- ✅ Cache local para batch (evita N×Shopify calls)

---

## ✅ Checklist do resolver

- [ ] Todos os handles do outline foram resolvidos antes de gerar texto?
- [ ] Todos os produtos referenciados existem no Shopify?
- [ ] Todas as imagens dos cards vêm do `featuredImage.url`?
- [ ] Preços formatados corretamente em BRL?
- [ ] Discount badge calculado a partir de `compareAtPrice` (não inventado)?
- [ ] Cache local atualizado (se em batch)?
- [ ] Flags de produto faltante registradas no JSON do artigo?
