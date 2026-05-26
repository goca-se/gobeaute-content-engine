# Rich Blocks — Blocos Editoriais Ricos

Blocos visuais ricos que enriquecem o blog post além de parágrafo + imagem. **Toda página de blog deve usar pelo menos 3-4 destes blocos** — caso contrário a leitura fica "seca" e o engajamento despenca.

## 🎯 Quando usar cada bloco

| Bloco | Quando usar | Frequência ideal por post |
|---|---|---|
| `product-cta-card` | CTA de produto (substitui link seco) | 1-2 (meio + fim) |
| `highlight-dark` | Insight forte / "aha moment" / pull-quote | 1-2 |
| `benefit-grid` | Listar 4-6 benefícios/usos/aplicações | 1 |
| `pill-list` | Persona-fit ("isso é pra você se…") / checklist leve | 0-1 |
| `callout-soft` | Disclaimer, aviso ANVISA, dica leve | 1-2 |
| `comparison-table` | Diferencial do produto vs. concorrentes/alternativas | 0-1 |

**Regra de ouro**: alternar parágrafo → bloco rico → parágrafo → bloco rico. Nunca empilhar 3 blocos ricos seguidos.

---

## 1️⃣ `product-cta-card` — Card de CTA de produto

**Substitui** o CTA de texto puro / link seco. Sempre usar quando o objetivo for converter pra um produto específico.

🚨 **PRINCÍPIO INVIOLÁVEL**: o card é **product-handle-driven**. Todo o conteúdo (imagem, título, preço, descrição, URL) vem do **Shopify real via handle** — nunca inventado. Ver `format-product-resolver.md` para o pipeline de resolução.

### Anatomia

- Imagem **real** do produto (esquerda, ~30%) — vem de `productByHandle(handle).featuredImage.url`
- Eyebrow: `MARCA · CATEGORIA` resolvido de `vendor + productType` do Shopify
- Title: `product.title` real
- Description: 1-2 frases — combina brand-context com `product.descriptionHtml`
- Price block: `priceRangeV2` + `compareAtPriceRange` reais (badge de desconto calculado)
- Botão CTA: full-width, com seta "→", `cta_url = /products/<handle>`
- Trust line: metafield `global.trust_line` OU fallback do brandbook

### Schema (input — apenas handle + overrides opcionais)

```json
{
  "type": "product-cta-card",
  "props": {
    "product_handle": "formula-nac",
    "description_override": "600 mg de N-Acetil L-Cisteína + Selênio + Molibdênio. Precursor da glutationa com ação detox, imunidade e suporte à saúde mental.",
    "cta_label_override": "Conhecer a Fórmula NAC",
    "trust_line_override": "🔒 Garantia de 60 dias · Sem risco"
  }
}
```

OU para collections:

```json
{
  "type": "product-cta-card",
  "props": {
    "collection_handle": "linha-onduladas-nutri-waves",
    "cta_label_override": "Explorar a Linha Nutri Waves"
  }
}
```

### Schema (resolvido — após product-resolver)

O bloco resolvido (preenchido automaticamente):

```json
{
  "type": "product-cta-card",
  "props": {
    "_handle": "formula-nac",
    "_resolved_from": "shopify",
    "image_url": "https://cdn.shopify.com/s/files/.../formula-nac.png",
    "image_alt": "Fórmula NAC da Rituária",
    "eyebrow": "RITUÁRIA · ANTIOXIDANTE & DETOX",
    "title": "Fórmula NAC",
    "description": "600 mg de N-Acetil L-Cisteína...",
    "price_current": "R$ 69,90",
    "price_original": "R$ 129,00",
    "discount_badge": "46% OFF",
    "cta_label": "Conhecer a Fórmula NAC",
    "cta_url": "/products/formula-nac",
    "trust_line": "🔒 Garantia de 60 dias · Sem risco"
  }
}
```

### HTML

```html
<aside class="rb rb-product-card" role="complementary">
  <figure class="rb-product-card__media">
    <img src="imagens/generated/product-card.png"
         alt="Pote da Fórmula NAC da Rituária"
         loading="lazy" />
  </figure>
  <div class="rb-product-card__body">
    <p class="rb-product-card__eyebrow">RITUÁRIA · ANTIOXIDANTE &amp; DETOX</p>
    <h3 class="rb-product-card__title">Fórmula NAC</h3>
    <p class="rb-product-card__desc">
      600 mg de N-Acetil L-Cisteína + Selênio + Molibdênio. Precursor da glutationa
      com ação detox, imunidade e suporte à saúde mental.
    </p>
    <div class="rb-product-card__price">
      <span class="rb-product-card__price-current">R$ 69,90</span>
      <span class="rb-product-card__price-original">R$ 129,00</span>
      <span class="rb-product-card__price-badge">46% OFF</span>
    </div>
    <a href="/products/formula-nac" class="rb-product-card__cta">
      Conhecer a Fórmula NAC →
    </a>
    <p class="rb-product-card__trust">🔒 Garantia de 60 dias · Sem risco</p>
  </div>
</aside>
```

### Regras

- ✅ **Imagem SEMPRE vem do Shopify CDN** — `featuredImage.url` real. NUNCA gerar via PiApp para o slot do card.
- ✅ Resolver `product_handle` / `collection_handle` via Shopify Admin GraphQL antes de renderizar (ver `format-product-resolver.md`)
- ✅ Se `featuredImage` for null no Shopify → flag `[FALTA IMAGEM: handle]` + omitir o card (renderiza placeholder de texto)
- ✅ Se `product_handle` não existe no Shopify → ABORTAR o post (single) ou pular (batch)
- ✅ Preços formatados em BRL: `R$ X,YZ` com vírgula
- ✅ Discount badge calculado: `Math.round((1 - current/original) * 100)%` — nunca inventado
- ✅ Eyebrow em CAIXA ALTA: `<vendor> · <productType>` direto do Shopify
- ❌ NUNCA inventar imagem, preço, título ou descrição
- ❌ NUNCA usar `image_url` que não seja `cdn.shopify.com/...`
- ❌ NUNCA renderizar card com dados parcialmente resolvidos — tudo-ou-nada

---

## 2️⃣ `highlight-dark` — Bloco de destaque escuro

Para o **insight central** do artigo — o "aha moment" que o leitor precisa absorver. Fundo escuro destaca visualmente.

### Anatomia

- Fundo escuro (quase preto com tonalidade da marca)
- Eyebrow com emoji + texto uppercase (cor de destaque da marca)
- Headline (serif, grande, claro/branco)
- Body (1-2 parágrafos, cinza claro)

### JSON

```json
{
  "type": "highlight-dark",
  "props": {
    "eyebrow_emoji": "🫧",
    "eyebrow_text": "POR QUE SUPLEMENTAR GLUTATIONA DIRETO NÃO FUNCIONA BEM",
    "headline": "NAC é precursor — e funciona melhor do que glutationa em cápsula",
    "body": "A glutationa oral tem absorção intestinal muito limitada — a maior parte é degradada antes de chegar às células. O NAC contorna esse problema ao entrar nas células como cisteína e ser convertido em glutationa no interior delas. É o jeito que o corpo realmente reconhece e utiliza."
  }
}
```

### HTML

```html
<aside class="rb rb-highlight-dark">
  <p class="rb-highlight-dark__eyebrow">
    <span class="rb-highlight-dark__emoji" aria-hidden="true">🫧</span>
    POR QUE SUPLEMENTAR GLUTATIONA DIRETO NÃO FUNCIONA BEM
  </p>
  <h3 class="rb-highlight-dark__headline">
    NAC é precursor — e funciona melhor do que glutationa em cápsula
  </h3>
  <p class="rb-highlight-dark__body">
    A glutationa oral tem absorção intestinal muito limitada — a maior parte é
    degradada antes de chegar às células. O NAC contorna esse problema ao entrar
    nas células como cisteína e ser convertido em glutationa no interior delas.
    É o jeito que o corpo realmente reconhece e utiliza.
  </p>
</aside>
```

### Regras

- ✅ Usar 1-2x por artigo, sempre no momento de revelação/insight
- ✅ Eyebrow curto (≤ 60 caracteres)
- ✅ Headline ≤ 90 caracteres
- ✅ Emoji coerente com o tema (não decorativo aleatório)
- ❌ Não usar para definições básicas — usar para insights diferenciadores

---

## 3️⃣ `benefit-grid` — Grid de benefícios/usos

Para listar **4-6 frentes de atuação, benefícios, ou aplicações** em formato escaneável.

### Anatomia

- Heading (h2 fora do bloco, antes)
- Intro paragraph (1-2 frases, antes do grid)
- Grid 3 colunas x 2 linhas (ou 2x2 / 2x3 dependendo de N)
- Cada card:
  - Emoji ícone grande (top)
  - Title (bold)
  - Description curta (≤ 25 palavras)

### JSON

```json
{
  "type": "benefit-grid",
  "props": {
    "heading": "NAC suplemento: para que serve na prática?",
    "intro": "O NAC acumula uma das bibliografias científicas mais extensas entre os suplementos. Seus benefícios documentados vão muito além do que um único rótulo consegue comunicar. Veja as principais frentes de atuação:",
    "columns": 3,
    "items": [
      {
        "emoji": "🛡️",
        "title": "Proteção antioxidante profunda",
        "description": "Neutraliza radicais livres via glutationa, protegendo DNA, proteínas e membranas celulares do dano oxidativo"
      },
      {
        "emoji": "🫁",
        "title": "Saúde respiratória",
        "description": "Fluidifica o muco, reduz inflamação das vias aéreas e é clinicamente usado em doenças pulmonares obstrutivas"
      },
      {
        "emoji": "❤️",
        "title": "Suporte hepático",
        "description": "Apoia a desintoxicação do fígado, aumenta a capacidade de metabolizar substâncias e protege hepatócitos"
      },
      {
        "emoji": "🧠",
        "title": "Equilíbrio da saúde mental",
        "description": "Regula glutamato e dopamina — neurotransmissores envolvidos em ansiedade, compulsões e humor"
      },
      {
        "emoji": "💪",
        "title": "Imunidade reforçada",
        "description": "Estimula linfócitos e macrófagos, aumenta a resposta imune adaptativa e reduz inflamação sistêmica"
      },
      {
        "emoji": "🔋",
        "title": "Recuperação celular",
        "description": "Protege mitocôndrias do estresse oxidativo, favorece regeneração celular e reduz marcadores de dano"
      }
    ]
  }
}
```

### HTML

```html
<section class="rb rb-benefit-grid">
  <h2 class="rb-benefit-grid__heading">NAC suplemento: para que serve na prática?</h2>
  <p class="rb-benefit-grid__intro">
    O NAC acumula uma das bibliografias científicas mais extensas entre os
    suplementos. Seus benefícios documentados vão muito além do que um único
    rótulo consegue comunicar. Veja as principais frentes de atuação:
  </p>
  <div class="rb-benefit-grid__items" data-cols="3">
    <article class="rb-benefit-grid__item">
      <span class="rb-benefit-grid__emoji" aria-hidden="true">🛡️</span>
      <h3 class="rb-benefit-grid__title">Proteção antioxidante profunda</h3>
      <p class="rb-benefit-grid__desc">Neutraliza radicais livres via glutationa, protegendo DNA, proteínas e membranas celulares do dano oxidativo</p>
    </article>
    <!-- ... outros 5 cards ... -->
  </div>
</section>
```

### Regras

- ✅ N de itens: 4 (2x2), 6 (3x2 ou 2x3) — não usar 5 (assimétrico)
- ✅ Emojis coerentes — usar a mesma "família" semântica
- ✅ Title ≤ 4 palavras
- ✅ Description ≤ 25 palavras (mantém grid visualmente equilibrado)
- ❌ Não citar % de eficácia sem fonte
- ✅ Validar claims contra `compliance-anvisa.md`

---

## 4️⃣ `pill-list` — Lista de pills (persona-fit)

Para "**isso é pra você se…**" ou "**casos de uso**". Visual leve, escaneável.

### Anatomia

- Heading opcional (h3, antes)
- Grid 2 colunas de pills
- Cada pill: borda arredondada, bullet `•`, texto curto (≤ 8 palavras)

### JSON

```json
{
  "type": "pill-list",
  "props": {
    "heading": "Isso é pra você se…",
    "items": [
      "Tem rotina com alto estresse crônico",
      "Busca proteção antioxidante e longevidade",
      "Quer apoiar a saúde do fígado",
      "Tem problemas recorrentes respiratórios",
      "Busca suporte emocional e equilíbrio mental",
      "Pratica exercícios intensos",
      "Tem exposição frequente a toxinas/poluição",
      "Quer reforçar imunidade preventivamente"
    ]
  }
}
```

### HTML

```html
<section class="rb rb-pill-list">
  <h3 class="rb-pill-list__heading">Isso é pra você se…</h3>
  <ul class="rb-pill-list__items">
    <li class="rb-pill-list__pill">Tem rotina com alto estresse crônico</li>
    <li class="rb-pill-list__pill">Busca proteção antioxidante e longevidade</li>
    <!-- ... -->
  </ul>
</section>
```

### Regras

- ✅ N de itens: 4, 6 ou 8 (par, pra fechar o grid 2 colunas)
- ✅ Cada pill: frase imperativa/declarativa curta, sem ponto final
- ✅ Pode ter heading ou ser standalone
- ❌ Não usar para conteúdo que precisa de hierarquia (use `benefit-grid`)

---

## 5️⃣ `callout-soft` — Caixa de aviso leve

Para **disclaimers, avisos ANVISA, dicas práticas, lembretes**. Visual suave, não-intrusivo.

### Anatomia

- Fundo verde-claro (tom da marca)
- Borda esquerda colorida (verde mais escuro)
- Emoji + label em bold + body inline
- 1-3 linhas no máximo

### JSON

```json
{
  "type": "callout-soft",
  "props": {
    "variant": "info",
    "emoji": "💡",
    "label": "Importante",
    "body": "o NAC é um suplemento alimentar, não um medicamento. Para condições de saúde diagnosticadas (respiratórias, hepáticas, psiquiátricas), consulte sempre um profissional de saúde antes de iniciar a suplementação."
  }
}
```

**Variantes**:
- `info` (verde claro — default): dica/info
- `warning` (amarelo claro): aviso importante
- `regulatory` (cinza-azulado): disclaimer ANVISA obrigatório

### HTML

```html
<aside class="rb rb-callout-soft" data-variant="info" role="note">
  <p class="rb-callout-soft__content">
    <span class="rb-callout-soft__emoji" aria-hidden="true">💡</span>
    <strong class="rb-callout-soft__label">Importante:</strong>
    o NAC é um suplemento alimentar, não um medicamento. Para condições de saúde
    diagnosticadas (respiratórias, hepáticas, psiquiátricas), consulte sempre um
    profissional de saúde antes de iniciar a suplementação.
  </p>
</aside>
```

### Regras

- ✅ Sempre usar `variant: regulatory` para disclaimers ANVISA obrigatórios
- ✅ Posicionar antes do CTA final, sempre que houver claim de saúde
- ✅ Body ≤ 50 palavras
- ❌ Não usar para conteúdo central — só para avisos/dicas suplementares

---

## 6️⃣ `comparison-table` — Tabela comparativa

Para mostrar o **diferencial do produto vs. concorrentes** (sem citar marca específica concorrente).

### Anatomia

- Heading (h2, antes)
- 2 colunas lado-a-lado:
  - Esquerda: caixa verde-clara, header "✦ MARCA" (cor da marca), items com "✓" verde
  - Direita: caixa rosa/vermelho-clara, header "CONCORRENTES COMUNS" (vermelho), items com "✗" vermelho

### JSON

```json
{
  "type": "comparison-table",
  "props": {
    "heading": "Fórmula NAC da Rituária vs. concorrentes",
    "ours": {
      "label": "✦ RITUÁRIA",
      "items": [
        "600 mg de NAC por cápsula — dose eficaz",
        "Selênio e molibdênio como cofatores",
        "Sem dióxido de titânio",
        "Cápsula 100% vegana (HPMC)",
        "Sem amido de enchimento",
        "Garantia incondicional 60 dias"
      ]
    },
    "theirs": {
      "label": "CONCORRENTES COMUNS",
      "items": [
        "Dosagem fraca ou não informada",
        "Sem cofatores para potencializar",
        "Pode conter dióxido de titânio",
        "Cápsula com gelatina animal",
        "Enchimento de amido",
        "Sem garantia de resultado"
      ]
    }
  }
}
```

### HTML

```html
<section class="rb rb-comparison">
  <h2 class="rb-comparison__heading">Fórmula NAC da Rituária vs. concorrentes</h2>
  <div class="rb-comparison__grid">
    <article class="rb-comparison__col rb-comparison__col--ours">
      <h3 class="rb-comparison__label">✦ RITUÁRIA</h3>
      <ul class="rb-comparison__list">
        <li class="rb-comparison__item"><span class="rb-comparison__check" aria-hidden="true">✓</span> 600 mg de NAC por cápsula — dose eficaz</li>
        <li class="rb-comparison__item"><span class="rb-comparison__check" aria-hidden="true">✓</span> Selênio e molibdênio como cofatores</li>
        <!-- ... -->
      </ul>
    </article>
    <article class="rb-comparison__col rb-comparison__col--theirs">
      <h3 class="rb-comparison__label">CONCORRENTES COMUNS</h3>
      <ul class="rb-comparison__list">
        <li class="rb-comparison__item"><span class="rb-comparison__x" aria-hidden="true">✗</span> Dosagem fraca ou não informada</li>
        <!-- ... -->
      </ul>
    </article>
  </div>
</section>
```

### Regras

- ✅ **NUNCA nomear marca concorrente** — usar "concorrentes comuns" / "alternativas no mercado"
- ✅ Items ≤ 60 caracteres cada (cabem em uma linha)
- ✅ Mesmo número de items dos dois lados (paralelismo)
- ✅ Cada par de items deve ser oposto direto (paralelo semântico)
- ❌ Não usar adjetivos pejorativos contra concorrentes ("ruim", "porcaria")
- ✅ Diferenciais devem ser checáveis (composição, certificações, materiais)

---

## 🎨 Estilo visual — paleta por marca

Os blocos devem **adaptar cores ao DNA da marca**. Consultar `brandbook.md` da marca pra:

- Cor primária (usada em eyebrows, checks, header do card "ours")
- Cor escura (usada no `highlight-dark`)
- Cor accent suave (usada em `callout-soft` fundo)

| Marca | Primária | Escura | Soft |
|---|---|---|---|
| Rituária | verde mineral | preto-esverdeado | verde-água claro |
| Ápice | verde-pinho | preto-quente | bege-creme |
| Barbour's | azul-marinho | grafite | azul-pó |
| Lescent | rosa-pó | café-escuro | rosa-leite |
| Kokeshi | rosa-japonês | cinza-grafite | sakura-leite |
| By Samia | dourado-fosco | preto-puro | champanhe |
| Auá | terracota | marrom-amazônia | areia-leve |

**O CSS escopo do bloco usa CSS variables** que mapeiam pra essas cores — veja `format-html-export.md` para o `<style>` block completo.

---

## 🎯 Onde posicionar cada bloco no artigo

Padrão recomendado para artigo com `n_sections=5`:

```
[H1]
[Lead]

[H2 — Seção 1: Definição/Contexto]
[Parágrafo]

🔹 [highlight-dark]   ← insight central, cedo no artigo

[H2 — Seção 2: Mecanismo/Como funciona]
[Parágrafo]
[Ilustração 1]

🔹 [benefit-grid]   ← benefícios escaneáveis

[H2 — Seção 3: Aplicações práticas]
[Parágrafo]

🔹 [pill-list]   ← persona-fit

[H2 — Seção 4: Dosagem/Como usar]
[Parágrafo]
[Ilustração 2]

🔹 [callout-soft variant=regulatory]   ← disclaimer ANVISA

🔹 [product-cta-card]   ← CTA principal, antes da conclusão

[H2 — Seção 5: Diferencial]
[Parágrafo]

🔹 [comparison-table]   ← reforço final

[Conclusão]

🔹 [product-cta-card]   ← CTA fechamento (pode repetir ou usar outro produto)
```

**Mínimo absoluto** por post: 1 `product-cta-card` + 2 outros blocos ricos.

---

## 🚨 Guardrails

- ❌ Empilhar 3+ blocos ricos seguidos sem parágrafo entre
- ❌ Mais de 2 `highlight-dark` por post (perde força)
- ❌ Mais de 1 `comparison-table` por post
- ❌ Nomear marca concorrente em `comparison-table`
- ❌ **Inventar imagem, preço, título ou descrição de produto** — sempre via product-resolver
- ❌ **Usar `image_url` que não seja Shopify CDN** em `product-cta-card`
- ❌ Pular `callout-soft variant=regulatory` quando o tema toca saúde diagnosticada
- ✅ Todo `product-cta-card` é **product-handle-driven** (ver `format-product-resolver.md`)
- ✅ Todo claim de saúde dentro de blocos deve passar pelo check de `compliance-anvisa.md`
- ✅ Validar `product_handle` / `collection_handle` no Shopify antes de renderizar
- ✅ Adaptar cores ao DNA da marca

---

## 📁 Output JSON do artigo (extensão)

O `article.json` ganha um array `body` que mistura `section` (texto comum) e blocos ricos:

```json
{
  "value": {
    "title": "...",
    "lead": "...",
    "body": [
      { "type": "section", "h2": "...", "content": "..." },
      { "type": "highlight-dark", "props": { ... } },
      { "type": "section", "h2": "...", "content": "..." },
      { "type": "benefit-grid", "props": { ... } },
      { "type": "section", "h2": "...", "content": "..." },
      { "type": "callout-soft", "props": { ... } },
      { "type": "product-cta-card", "props": { ... } },
      { "type": "comparison-table", "props": { ... } }
    ],
    "conclusion": "...",
    "cta": { ... }
  }
}
```

O renderizador HTML lê o array em ordem e emite o HTML correspondente a cada bloco.

## ✅ Checklist final dos blocos ricos

- [ ] Pelo menos 3 blocos ricos no post?
- [ ] Pelo menos 1 `product-cta-card`?
- [ ] Cores adaptadas à marca?
- [ ] Nenhum concorrente nomeado em `comparison-table`?
- [ ] Disclaimer ANVISA presente se tema toca saúde?
- [ ] Todos os CTAs apontam pra produto/collection real?
- [ ] JSON do article tem `body` em array (não objeto)?
