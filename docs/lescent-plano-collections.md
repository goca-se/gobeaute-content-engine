# Lescent — Plano de Enriquecimento de Collections (banner + título + descrição + tags)

> Gerado em **2026-07-31** contra a loja `LESCENT` / `568499-ef.myshopify.com`, tema MAIN `lescent-theme/main` (GID `179492028723`) e tema `lescent-theme/develop` (GID `186949861683`).
> Contexto mestre: `docs/lescent-contexto-enriquecimento.md`. Tom de voz: `brand-context/lescent/brandbook.md` §4. Compliance: §8 + `brand-context/_shared/compliance-anvisa.md`.
> Schema de chips de PDP já criado em 2026-07-31: `conteudos/lescent/_schema/shopify-result.json`.

---

## 0. Auditoria de renderização — 3 correções ao contexto mestre

Varri o tema MAIN inteiro (`sections/*`, `snippets/*`) e o `develop`. **Três afirmações do `lescent-contexto-enriquecimento.md` §4.3 estão erradas** e mudam o plano:

### 🔴 Correção 1 — `collection.description` NÃO renderiza hoje (o doc diz que renderiza no banner)

`templates/collection.json` do MAIN:
```json
"show_collection_title": false,
"show_collection_description": false,
"overlay_opacity": 0
```

O código de render existe em `sections/collection-banner.liquid`, mas está atrás desses dois toggles:
```liquid
{%- if section.settings.show_collection_description and collection.description != blank -%}
  <div class="prose">{{- collection.description -}}</div>
{%- endif -%}
```

Varredura de `collection.description` no tema MAIN: **1 única ocorrência**, a de cima. `main-collection.liquid` (27KB) não referencia `collection.description`, `collection.title` nem `collection.metafields`. `collection-list.liquid`, `main-list-collections.liquid` e `featured-collection.liquid` só leem `collection.title`. `microdata-schema.liquid` emite só `BreadcrumbList` com o title — **não há schema `CollectionPage` e a descrição não entra em structured data**.

No `develop` os blocos existem no `templates/collection.json` como `text` blocks (`{{ closest.collection.title }}` e `{{ closest.collection.description }}`) mas ambos com `"disabled": true`.

→ **Conclusão: hoje a descrição é conteúdo dormente nos dois temas.** Ela é publicada, fica versionada e acende no dia em que o dev virar o toggle. Isso é uma decisão aceita (ver §6), não um bug do plano.

### 🔴 Correção 2 — o banner É o `custom.banner_cole_o` (o doc §4.3 item 3 diz o contrário)

O template passa o metafield como dynamic source pro setting de imagem da seção:
```json
"image": "{{ collection.metafields.custom.banner_cole_o.value }}"
```
E o snippet resolve com prioridade pro setting:
```liquid
{%- assign desktop_image = section.settings.image | default: collection.image -%}
```

→ **`custom.banner_cole_o` ganha; `collection.image` é fallback.** Os dois renderizam. O doc dizia "não use `banner_cole_o` pra hero de navegação" — errado.

### 🔴 Correção 3 — tags/pills de collection não têm renderizador em NENHUM tema

- MAIN: não existe `snippets/collection-tags.liquid` nem nada equivalente. Os únicos arquivos de collection são `collection-banner`, `collection-list`, `main-collection`, `main-list-collections`, `goshop-collection-blocks`, `collection-top-bar`.
- `develop`: também não existe. A tag colorida foi reimplementada só no escopo de **produto** (`blocks/jump-product-tag.liquid` → `custom.product_bullet_point_metafield`).
- Loja: `metafieldDefinitions(ownerType: COLLECTION)` retorna **1 definição** — `custom.banner_cole_o`. Não existe `custom.tags_collection`.
- `metaobjectDefinitions` (23) — não existe `collection_tags`.

→ **Decisão do usuário: criar o schema e preencher agora**, aceitando que fica invisível até o dev adicionar o snippet. Spec do snippet em §5.3.

### Outros achados de produção

| # | Achado | Severidade |
|---|---|---|
| 1 | `overlay_opacity: 0` — se o dev ligar título/descrição, texto branco cai sobre banner claro sem escurecimento = **ilegível**. Precisa subir pra ~35% junto do toggle | 🔴 |
| 2 | Os 14 banners existentes são **peças de campanha com texto embutido** (`PROMO_NOVA_EXCETO_N13_DESKTOP.png`, `KITS-PP-DESKTOP79_kits.png`, `BRINDES-LESCENT-DESKTOP.png`). Se o overlay ligar, o texto novo colide com o texto do JPG | 🟠 |
| 3 | `mobile_image` existe como setting da seção mas **não está no template** → a mesma arte 1400×525 (2,67:1) é servida pros 97% de mobile | 🟠 |
| 4 | `BRINDES-LESCENT-DESKTOP.png` é o banner de `25ml-femininos`, `25ml-masculinos` e `vitrine-home-mais-vendidos` — banner de *brindes* em collection de volumetria | 🟡 |
| 5 | `seo.title` é **null em 100%** das 23 collections do escopo | 🟠 |
| 6 | Famílias olfativas com sortimento inconsistente: **Nº 13 está em 4 famílias** (amadeirados, cítrico-fresco, aquáticos, aquáticos-1) e Nº 20 em 3 | 🟠 |
| 7 | `lancamentos-masculinos` (23 produtos): 20 são masters DRAFT do Nº 12–21, que **não são lançamentos** | 🟠 |
| 8 | `citrico-fresco` e `aquaticos-1` têm produtos **UNLISTED** de teste (`Nº 22 • Novo perfume`, `Nº 20 • Brise Amalfi (TEST)`) | 🟡 |
| 9 | `florais` (14) não inclui Nº 2, Nº 7, Nº 26, Nº 28 — florais óbvios do catálogo | 🟡 |
| 10 | 2 collections de família que o contexto mestre não achou: **`citrico-fresco`** (23 prod — é o "Frescos" da home) e **`oriental`** (8 prod) | ✅ resolvido aqui |

---

## 1. Escopo — 23 collections

Critério: **collections de navegação/SEO com demanda real**, medida por `FROM sessions GROUP BY landing_page_path SINCE -90d` (única métrica por collection que a loja expõe — `collection_title` **não existe** em ShopifyQL, confirmei: `Column Not Found`).

### Onda 1 — 6 collections · ~2.463.000 sessões/90d

| # | Handle | GID | Prod. | Sessões 90d | Banner | `desc` | `seo.title` | `seo.desc` |
|---|---|---|---|---|---|---|---|---|
| 1 | `femininos` | `493463666995` | 81 | **1.479.121** | ✅ image | ❌ | ❌ | ✅ **preservar** |
| 2 | `masculinos` | `493462847795` | 75 | **845.029** | ✅ image | ❌ | ❌ | ✅ **preservar** |
| 3 | `kits-masculinos` | `497980473651` | 43 | 53.874 | ✅ image | ❌ | ❌ | ❌ |
| 4 | `outlet-lescent` | `500194771251` | 34 | 51.003 | ✅ image | ❌ | ❌ | ❌ |
| 5 | `kits-femininos` | `493464060211` | 69 | 32.755 | ✅ image | ❌ | ❌ | ❌ |
| 6 | `kits` | `492401525043` | 79 | nav interna | ✅ image | ❌ | ❌ | ✅ **preservar** |

### Onda 2 — 11 collections (nav de cauda longa)

| # | Handle | GID | Prod. | Banner | `seo.desc` |
|---|---|---|---|---|---|
| 7 | `fragrancias-de-25ml` | `499736052019` | 36 | ✅ image | ✅ **preservar** |
| 8 | `25ml-femininos` | `500187758899` | 24 | ✅ image | ❌ |
| 9 | `25ml-masculinos` | `500187791667` | 22 | ✅ image | ❌ |
| 10 | `fragrancias-de-100ml` | `500184285491` | 23 | 🔴 **nenhum** | ✅ **preservar** |
| 11 | `100ml-femininos` | `500187988275` | 13 | 🔴 **nenhum** | ❌ |
| 12 | `100ml-masculinos` | `500187693363` | 13 | 🔴 **nenhum** | ❌ |
| 13 | `lancamentos` | `500724924723` | 23 | ✅ image | ✅ **preservar** |
| 14 | `lancamentos-femininos` | `500923138355` | 10 | ✅ image | ❌ |
| 15 | `lancamentos-masculinos` | `500923400499` | 23 | ✅ image | ❌ |
| 16 | `kits-presenteaveis` | `500936540467` | 54 | ✅ `banner_cole_o` | ❌ |
| 17 | `vitrine-home-mais-vendidos` | `493908066611` | 95 | ✅ image | ❌ |

### Onda 3 — 6 famílias olfativas (todas sem banner, todas vazias)

| # | Handle | GID | Prod. | ACTIVE reais |
|---|---|---|---|---|
| 18 | `amadeirados` | `499973128499` | 31 | Nº 12, 13, 14, 15, 16, 17, 18, 20 (25/100ml) |
| 19 | `citrico-fresco` | `499973292339` | 23 | Nº 13, 15, 16, 17, 18, 20, 21 |
| 20 | `florais` | `499897794867` | 14 | Nº 5, 6, 8, 10, 11 |
| 21 | `aquaticos-1` | `499973259571` | 14 | Nº 13, 15, 18, 20 |
| 22 | `adocicados` | `499898089779` | 8 | Nº 1, 9, 11 |
| 23 | `oriental` | `499973325107` | 8 | Nº 17, 19, 21 |

### Fora do escopo (com motivo)

| Handle | Sessões | Motivo |
|---|---|---|
| `aquaticos` (`499898155315`) | — | **Duplicata subset** de `aquaticos-1` (9 vs 14 prod; não tem o Nº 20). Recomendo arquivar + redirect 301 → `aquaticos-1`. Não escrever conteúdo. |
| `freesia` (`493277446451`) | 14.243 | 12 dos 14 produtos em DRAFT — só Nº 2 25ml/100ml visíveis. É collection de teste A/B de kits antigos. **14k sessões chegando numa página com 2 produtos** — problema de sortimento, não de conteúdo. |
| `promo-100ml`, `expresso-25ml`, `todos-os-perfumes-browse` | 39.109 | CRM/campanha. `expresso-25ml` já tem `description: "crm"` — **preexistente, não sobrescrever**. |
| 24 collections de CRM (`necessaire-*`, `welcome-*`, `15poff`, `pos-compra`, `campanha-*`, …) | ~470k | Landing pages de performance com template próprio. Escopo separado (contexto mestre §5.3). |

---

## 2. Regra de não-sobrescrita

Toda mutation deste plano é **aditiva**. Nada preexistente é tocado.

| Campo | Regra |
|---|---|
| `title` | ❌ **nunca alterado** (mesmo com caps inconsistentes — ver §7 flag 3) |
| `handle` | ❌ nunca alterado |
| `descriptionHtml` | ✅ escrito **só onde está vazio** — vazio em 23/23 |
| `seo.title` | ✅ escrito **só onde é null** — null em 23/23 |
| `seo.description` | ✅ escrito **só nas 17 vazias**. As **6 existentes** (`femininos`, `masculinos`, `kits`, `lancamentos`, `fragrancias-de-25ml`, `fragrancias-de-100ml`) são **preservadas na íntegra** |
| `custom.banner_cole_o` | ✅ escrito **só nas 9 sem banner nenhum**. Onde existe `collection.image`, não mexo |
| `collection.image` | ❌ **nunca tocado** — as 14 artes de campanha permanecem |
| `custom.tags_collection` | ✅ metafield novo, vazio em 100% por definição |
| produtos da collection | ❌ nenhum `productsAdd`/`productsRemove` |
| `sortOrder`, `rules`, publicação | ❌ nunca alterados |

**Verificação obrigatória imediatamente antes de cada `collectionUpdate`**: re-query de `description`, `seo`, `metafield(custom.banner_cole_o)` da collection-alvo. Se qualquer campo do escopo tiver virado não-vazio desde este plano → **pular aquele campo** e registrar no `shopify-result.json`.

---

## 3. Contrato de formato

### 3.1 `collection.description` (o que o doc chama de "descrição")

- **≤ 200 caracteres**, 1–2 frases. Dimensionada pro overlay do banner (branco sobre foto, mobile).
- 1 único `<p>` — o tema injeta em `<div class="prose">{{ collection.description }}</div>`.
- **Produto Lescent como protagonista**, referência de luxo fora (ela vive no `seo.description`).
- Sem número de produtos ("81 fragrâncias") — os counts incluem DRAFT e mudam toda semana.
- Sem preço — descrição não tem TTL e o AOV está caindo 13%/mês.

### 3.2 `seo.title`

- **40–60 caracteres**, termo de busca primeiro, `| Lescent` no fim.
- Substitui o `<title>` inteiro (não é sufixo) → a marca tem que estar no string.

### 3.3 `seo.description`

- **135–155 caracteres**. Replica o padrão das 6 que já existem e funcionam:
  `[Benefício/sortimento] + "Aromas inspirados em [marcas]" + [CTA]`

### 3.4 `custom.tags_collection` (pills)

- `label` sentence case, 2–4 palavras. `tags`: 4–6 itens, Title Case, 1–3 palavras.
- **Cada tag ancorada em produto ACTIVE real da collection** (grounding registrado em `tags.json`).
- **Cores** — reaproveitam o sistema de chips criado em 2026-07-31 (`lescent-chips-schema-e-onda1`):

| Grupo | Fundo | Texto | Contraste | Racional |
|---|---|---|---|---|
| Ondas 1 e 2 (navegação) | `#8C5E3C` Cobre Lescent | `#FFFFFF` | **5.55:1** AA | Cor institucional do brandbook §5. Distingue pill de navegação do chip de PDP |
| Onda 3 (famílias olfativas) | `#F5F5F5` Cinza Claro | `#1A1A1A` Preto Profundo | **15.96:1** AAA | Mesmo par já usado nos chips de *família olfativa* do PDP → a pill da collection casa visualmente com o chip do produto |

Cálculo de luminância relativa (WCAG 2.1) para `#8C5E3C`: L = 0.2126·0.26214 + 0.7152·0.11193 + 0.0722·0.04519 = **0.13905** → vs branco (L=1.0): (1.05)/(0.18905) = **5.55:1** ✅ AA texto normal.

### 3.5 Banner (9 collections)

- **1400 × 525 px** — casa com as 14 artes existentes e com o `image_size: "auto"` da seção.
- **Sem texto embutido** — assim o título/descrição do overlay funciona quando o dev ligar os toggles (as artes atuais têm texto e vão colidir).
- Estilo do brandbook §5: frasco isolado, fundo branco/off-white ou cinza claro, luz difusa, detalhe metálico cobre, **sem cenografia de luxo, sem modelo em pose aspiracional**.
- Área de respiro central para overlay de texto.
- Publicado em `custom.banner_cole_o` (que tem prioridade de render), **não** em `collection.image`.

---

## 4. Conteúdo redigido — 23 collections

> `desc` = `collection.description` · `T` = `seo.title` · `D` = `seo.description` · `pills` = `custom.tags_collection`
> ✅ **PRESERVAR** = campo já preenchido na loja, não sobrescrito.

### ONDA 1

---
#### 1. `femininos` — 1.479.121 sessões

- **T** `Perfumes Femininos Inspirados em Marcas de Luxo | Lescent` (57)
- **D** ✅ **PRESERVAR**: *"Descubra a coleção Lescent de perfumes femininos! Aromas inspirados em fragrâncias de luxo como Jo Malone, Chanel e Delina. Encontre o seu!"*
- **desc** (147 car. de texto) — `<p>Do frescor do Nº 2 • Délicate Londres ao floral marcante do Nº 6 • Gracieuse Cannes. Descubra a fragrância feminina que é a sua — em 25ml ou 100ml.</p>`
- **pills** label `Perfumes femininos` · `["Florais", "Adocicados", "Best-Sellers", "Kits Femininos", "25ml", "100ml"]`
  - grounding: Florais → Nº 5/6/8/10/11 · Adocicados → Nº 1/9/11 · Best-Sellers → Nº 2 25ml · Kits Femininos → Kit Trilogia Essencial 2+6+10 · 25ml/100ml → SKUs por volumetria

#### 2. `masculinos` — 845.029 sessões

- **T** `Perfumes Masculinos Inspirados em Marcas de Luxo | Lescent` (58)
- **D** ✅ **PRESERVAR**: *"Encontre o seu perfume masculino ideal na Lescent! Aromas inspirados em fragrâncias de luxo como Sauvage, Bleu e Giò. Elegância e poder."*
- **desc** (139 car. de texto) — `<p>Do aquático Nº 20 • Brise Amalfi ao marcante Nº 13 • Féroce Provence. Descubra o perfume masculino que combina com você — em 25ml ou 100ml.</p>`
- **pills** label `Perfumes masculinos` · `["Aquáticos", "Amadeirados", "Cítricos e Frescos", "Best-Sellers", "Kits Masculinos", "25ml"]`
  - grounding: Aquáticos → Nº 20/18 · Amadeirados → Nº 12/14/17 · Cítricos e Frescos → Nº 13/15/16 · Best-Sellers → Nº 27 25ml · Kits Masculinos → Kit Trilogia Essencial Masculina

#### 3. `kits-masculinos` — 53.874 sessões

- **T** `Kits de Perfumes Masculinos: Trilogias e Sextetos | Lescent` (59)
- **D** (148) — `Kits de perfumes masculinos Lescent: duetos, trilogias e sextetos de 25ml. Aromas inspirados em Sauvage, Acqua di Giò e Baccarat Rouge. Monte o seu.`
- **desc** (137 car. de texto) — `<p>Do Dueto Essencial Nº 13 + Nº 20 ao Sexteto Masculino com 6 fragrâncias. Experimente os masculinos mais vendidos antes de escolher o seu.</p>`
- **pills** label `Kits masculinos` · `["Duetos", "Trilogias", "Quartetos", "Sextetos", "Trilogia Gold", "25ml"]`
  - grounding: todos confirmados ACTIVE — Kit Dueto Essencial Masculino 13+20 · Kit Trilogia Essencial Masculina 12+13+20 · Kit Quarteto Hits Masculinos 12+13+19+20 · Kit Sexteto Masculino · Kit Trilogia Gold 23+25+27

#### 4. `outlet-lescent` — 51.003 sessões

- **T** `Outlet Lescent: Perfumes em Oferta | 25ml e 100ml` (49)
- **D** (142) — `Outlet Lescent: fragrâncias femininas e masculinas selecionadas com desconto, em 25ml e 100ml. Aromas inspirados em marcas de luxo. Aproveite.`
- **desc** (120 car. de texto) — `<p>Uma seleção de fragrâncias em 25ml e 100ml com preço especial. Mesma matéria-prima importada, mesma fixação — por menos.</p>`
- **pills** label `Outlet Lescent` · `["Femininos", "Masculinos", "Best-Sellers", "25ml", "100ml"]`
  - grounding: Nº 26/5/6/3/10/11/8 25ml (F) · Nº 31 25ml, Nº 20 100ml (M) · Nº 7 100ml

#### 5. `kits-femininos` — 32.755 sessões

- **T** `Kits de Perfumes Femininos: Trilogias e Sextetos | Lescent` (58)
- **D** (148) — `Kits de perfumes femininos Lescent: trilogias, quartetos e sextetos de 25ml. Aromas inspirados em Jo Malone, Chanel e Parfums de Marly. Monte o seu.`
- **desc** (143 car. de texto) — `<p>Trilogias, quartetos e sextetos com as femininas mais amadas — Nº 2, Nº 6 e Nº 10 lideram. Experimente várias antes de escolher a sua favorita.</p>`
- **pills** label `Kits femininos` · `["Duetos", "Trilogias", "Quartetos", "Sextetos", "Hits Femininos", "25ml"]`
  - grounding: Kit Dueto Elegância 2+20 · Kit Trilogia Essencial 2+6+10 · Kit Quarteto Hits Femininos 2+6+7+8 · Kit Sexteto Feminino 2+5+9+11+26+30 · Kit Trilogia Hit Feminino 22+24+28

#### 6. `kits` — nav interna

- **T** `Kits de Perfumes: Duetos, Trilogias e Sextetos | Lescent` (56)
- **D** ✅ **PRESERVAR**: *"Kits Lescent com os melhores perfumes femininos e masculinos! Aromas inspirados em Dior, Chanel, Jo Malone e mais. Presenteie ou experimente!"*
- **desc** (142 car. de texto) — `<p>Dueto, trilogia, quarteto ou sexteto: monte seu repertório com 2 a 6 fragrâncias em um só kit. A porta de entrada para descobrir o seu cheiro.</p>`
- **pills** label `Kits de perfumes` · `["Duetos", "Trilogias", "Quartetos", "Sextetos", "Kits Femininos", "Kits Masculinos"]`

### ONDA 2

#### 7. `fragrancias-de-25ml`

- **T** `Perfumes de 25ml: Tamanho de Bolso e Viagem | Lescent` (53)
- **D** ✅ **PRESERVAR**
- **desc** (128 car. de texto) — `<p>O formato de bolso para experimentar sem compromisso. Fragrâncias femininas e masculinas em 25ml — cabe na bolsa e vai com você.</p>`
- **pills** label `Fragrâncias de 25ml` · `["Femininos", "Masculinos", "Best-Sellers", "Lançamentos"]`
  - grounding: F → Nº 2/5/6/7/10/22/24/26 · M → Nº 13/20/27 · Lançamentos → Nº 22/24/26/27

#### 8. `25ml-femininos`

- **T** `Perfumes Femininos de 25ml: Tamanho de Bolso | Lescent` (54)
- **D** (137) — `Perfumes femininos de 25ml Lescent: Nº 2, Nº 6, Nº 26 e mais. Aromas inspirados em Jo Malone, Chanel e Dior no tamanho que cabe na bolsa.`
- **desc** (138 car. de texto) — `<p>As femininas mais pedidas no formato de 25ml — Nº 2 • Délicate Londres, Nº 6 • Gracieuse Cannes e Nº 26 • Élegance Vienna lideram a lista.</p>`
- **pills** label `25ml femininos` · `["Florais", "Adocicados", "Best-Sellers", "Lançamentos"]`
  - grounding: Nº 2/5/6/7/10/11 (florais) · Nº 22/24/26/28 (lançamentos, todos ACTIVE 25ml)

#### 9. `25ml-masculinos`

- **T** `Perfumes Masculinos de 25ml: Tamanho de Bolso | Lescent` (55)
- **D** (145) — `Perfumes masculinos de 25ml Lescent: Nº 13, Nº 20, Nº 27 e mais. Aromas inspirados em Sauvage, Acqua di Giò e Baccarat Rouge em tamanho de bolso.`
- **desc** (121 car. de texto) — `<p>Os masculinos mais vendidos em 25ml — Nº 13 • Féroce Provence, Nº 20 • Brise Amalfi e Nº 27 • Golden Dubai abrem a lista.</p>`
- **pills** label `25ml masculinos` · `["Aquáticos", "Amadeirados", "Cítricos e Frescos", "Best-Sellers", "Lançamentos"]`
  - grounding: todos ACTIVE — Nº 20/18 · Nº 12/14 · Nº 13/23/25 · Nº 27/29/31/35

#### 10. `fragrancias-de-100ml` — 🔴 precisa banner

- **T** `Perfumes de 100ml: Femininos e Masculinos | Lescent` (51)
- **D** ✅ **PRESERVAR**
- **desc** (140 car. de texto) — `<p>O frasco principal, para quem já sabe qual é o seu cheiro. Fragrâncias femininas e masculinas em 100ml, com a fixação que a Lescent entrega.</p>`
- **pills** label `Fragrâncias de 100ml` · `["Femininos", "Masculinos", "Florais", "Amadeirados", "Best-Sellers"]`
  - grounding: Nº 2/5/6/7/10 (F, florais) · Nº 12/13/14/17/19/20 (M, amadeirados)

#### 11. `100ml-femininos` — 🔴 precisa banner

- **T** `Perfumes Femininos de 100ml: Frasco Principal | Lescent` (55)
- **D** (141) — `Perfumes femininos de 100ml Lescent: Nº 2, Nº 6, Nº 10 e mais. Aromas inspirados em Jo Malone, Chanel e Parfums de Marly no frasco principal.`
- **desc** (132 car. de texto) — `<p>Suas favoritas no frasco de 100ml — Nº 2 • Délicate Londres, Nº 6 • Gracieuse Cannes e Nº 10 • Belle Grasse para usar todos os dias.</p>`
- **pills** label `100ml femininos` · `["Florais", "Adocicados", "Best-Sellers", "Duetos 100ml"]`
  - grounding: Nº 5/6/8/10/11 (florais) · Nº 1/9 (adocicados) · **Kit Dueto Délicate Londres Nº 2 100ml + Nº 2 25ml** ✅ ACTIVE nesta collection

#### 12. `100ml-masculinos` — 🔴 precisa banner

- **T** `Perfumes Masculinos de 100ml: Frasco Principal | Lescent` (56)
- **D** (137) — `Perfumes masculinos de 100ml Lescent: Nº 13, Nº 20, Nº 12 e mais. Aromas inspirados em Sauvage e Acqua di Giò no frasco para o dia a dia.`
- **desc** (133 car. de texto) — `<p>Os masculinos no frasco de 100ml — Nº 13 • Féroce Provence e Nº 20 • Brise Amalfi lideram, com duetos que já vêm com o 25ml de bolso.</p>`
- **pills** label `100ml masculinos` · `["Aquáticos", "Amadeirados", "Best-Sellers", "Duetos 100ml"]`
  - grounding: **Kit Dueto Féroce Provence** e **Kit Dueto Brise Amalfi** ✅ ACTIVE nesta collection

#### 13. `lancamentos`

- **T** `Lançamentos: Novos Perfumes Lescent | 25ml e 100ml` (50)
- **D** ✅ **PRESERVAR**
- **desc** (118 car. de texto) — `<p>Os números mais novos do catálogo — do Nº 22 ao Nº 35. Fragrâncias recém-chegadas em 25ml para você conhecer primeiro.</p>`
- **pills** label `Lançamentos` · `["Femininos", "Masculinos", "Trilogia Gold", "25ml"]`
  - grounding: Nº 22/24/26/28/30 (F) · Nº 23/25/27/29/31/35 (M) · Kit Trilogia Gold 23+25+27 ✅

#### 14. `lancamentos-femininos`

- **T** `Lançamentos Femininos: Novos Perfumes | Lescent` (47)
- **D** (148) — `Novos perfumes femininos Lescent: Nº 22 • Mystique Veneza, Nº 24, Nº 26 e Nº 28. Aromas inspirados em Prada, Dior e Lancôme. Conheça os lançamentos.`
- **desc** (141 car. de texto) — `<p>Nº 22 • Mystique Veneza, Nº 24 • Essence Bordeaux, Nº 26 • Élegance Vienna e Nº 28 • Icon Copenhague: as femininas mais novas, também em kit.</p>`
- **pills** label `Lançamentos femininos` · `["Florais", "Adocicados", "Duetos", "Para Presentear"]`
  - grounding: Nº 26/28 (florais) · Nº 30 (adocicado/gourmand) · Kit Dueto Hit Feminino 22+24 · **Presente pra Ela Nº 26 + Nº 28** ✅ ACTIVE nesta collection

#### 15. `lancamentos-masculinos` — ⚠️ ver flag 7

- **T** `Lançamentos Masculinos: Novos Perfumes | Lescent` (48)
- **D** (142) — `Novos perfumes masculinos Lescent: Nº 27 • Golden Dubai, Nº 29 • Royal Nottingham e Nº 23 • Legacy Lisboa. Aromas inspirados em MFK e Xerjoff.`
- **desc** (131 car. de texto) — `<p>Os masculinos recém-chegados — Nº 27 • Golden Dubai, Nº 29 • Royal Nottingham e Nº 23 • Legacy Lisboa, também no Kit Trilogia Gold.</p>`
- **pills** label `Lançamentos masculinos` · `["Amadeirados", "Orientais", "Trilogia Gold", "25ml"]`

#### 16. `kits-presenteaveis`

- **T** `Kits de Perfume para Presentear: Ela, Ele e Casal | Lescent` (59)
- **D** (140) — `Kits de perfume Lescent para presentear: duetos, trilogias e a Caixa de Presente. Aromas inspirados em marcas de luxo. Escolha e presenteie.`
- **desc** (95 car. de texto) — `<p>Kits pensados para dar de presente — trilogias, duetos e a Caixa de Presente para montar o seu.</p>`
- **pills** label `Kits para presentear` · `["Caixa de Presente", "Duetos", "Trilogias", "Quartetos", "Para Casal"]`
  - grounding: **Caixa de Presente** ✅ ACTIVE · Caixa + Kit Trilogia Gold ✅ · 12 duetos ACTIVE · Kit Quarteto Clássico Masculinos ✅ · **KIT CASAL DIA DOS NAMORADOS Nº 2 + Nº 13 100ml** + Kit Dueto Essencial Unissex ✅

#### 17. `vitrine-home-mais-vendidos` — uso interno (vitrine da home)

- **T** `Os Perfumes e Kits Mais Vendidos | Lescent` (42)
- **D** (152) — `Os perfumes e kits mais vendidos da Lescent: Kit Trilogia Essencial, Nº 2 • Délicate Londres e Nº 27 • Golden Dubai. Veja o que todo mundo está levando.`
- **desc** (115 car. de texto) — `<p>O que mais sai da Lescent: Kit Trilogia Essencial, Nº 2 • Délicate Londres e Nº 27 • Golden Dubai no topo da lista.</p>`
- **pills** label `Mais vendidos` · `["Kits", "Femininos", "Masculinos", "25ml", "100ml"]`

### ONDA 3 — famílias olfativas

> ⚠️ **Princípio de redação desta onda**: as descrições são fiéis ao **sortimento que está de fato na collection**, não ao nome ideal da família. Ver flag 6 — o Nº 13 está em 4 famílias ao mesmo tempo. Não escrevi nenhuma nota olfativa que não esteja no `custom.notas_e_ess_ncias` publicado da loja.

#### 18. `amadeirados` — 🔴 precisa banner

- **T** `Perfumes Amadeirados Masculinos | Lescent` (41)
- **D** (136) — `Perfumes amadeirados Lescent: Nº 12 • Noble Nice, Nº 14 • Brave Manhattan e Nº 17 • Sublime Monte-Carlo. Fundo de madeira e boa fixação.`
- **desc** (139 car. de texto) — `<p>Fragrâncias com fundo de madeira, cedro e âmbar — profundas e de boa fixação. Nº 12 • Noble Nice e Nº 14 • Brave Manhattan abrem a família.</p>`
- **pills** label `Amadeirados` · `["Masculinos", "Best-Sellers", "25ml", "100ml"]`
- cor: `#F5F5F5` / `#1A1A1A`

#### 19. `citrico-fresco` — 🔴 precisa banner · é o "Frescos" da home

- **T** `Perfumes Cítricos e Frescos para o Dia a Dia | Lescent` (54)
- **D** (143) — `Perfumes cítricos e frescos Lescent: Nº 13 • Féroce Provence, Nº 20 • Brise Amalfi e Nº 18 • Essential Tokyo. Leves para o dia a dia. Descubra.`
- **desc** (138 car. de texto) — `<p>Notas cítricas e aromáticas para o dia — leves, limpas e fáceis de usar. Nº 13 • Féroce Provence e Nº 20 • Brise Amalfi lideram a família.</p>`
- **pills** label `Cítricos e frescos` · `["Masculinos", "Aquáticos", "Best-Sellers", "25ml", "100ml"]`
- cor: `#F5F5F5` / `#1A1A1A`

#### 20. `florais` — 🔴 precisa banner

- **T** `Perfumes Florais Femininos: 25ml e 100ml | Lescent` (50)
- **D** (141) — `Perfumes florais Lescent: Nº 6 • Gracieuse Cannes, Nº 10 • Belle Grasse e Nº 5 • Douce Paris. Aromas inspirados em Chanel e Parfums de Marly.`
- **desc** (145 car. de texto) — `<p>A família de maior aceitação — delicada, feminina e fácil de usar. Nº 6 • Gracieuse Cannes e Nº 10 • Belle Grasse abrem a lista, em 25ml e 100ml.</p>`
- **pills** label `Florais` · `["Femininos", "Best-Sellers", "25ml", "100ml"]`
- cor: `#F5F5F5` / `#1A1A1A`

#### 21. `aquaticos-1` — 🔴 precisa banner

- **T** `Perfumes Aquáticos Masculinos: Frescos e Leves | Lescent` (56)
- **D** (141) — `Perfumes aquáticos Lescent: Nº 20 • Brise Amalfi e Nº 18 • Essential Tokyo. Aroma marinho inspirado em Acqua di Giò. Leve, fresco e versátil.`
- **desc** (138 car. de texto) — `<p>Frescor marinho, leve e versátil — o tipo de cheiro que combina com qualquer hora do dia. Nº 20 • Brise Amalfi é o carro-chefe da família.</p>`
- **pills** label `Aquáticos` · `["Masculinos", "Cítricos e Frescos", "Best-Sellers", "25ml", "100ml"]`
- cor: `#F5F5F5` / `#1A1A1A`

#### 22. `adocicados` — 🔴 precisa banner

- **T** `Perfumes Adocicados e Gourmand Femininos | Lescent` (50)
- **D** (139) — `Perfumes adocicados Lescent: Nº 9 • Magnétique New York, Nº 1 • Jolie Provence e Nº 11 • Unique Lyon. Doces, alegres e marcantes. Descubra.`
- **desc** (136 car. de texto) — `<p>Doce sem ser enjoativo — a família de maior aceitação entre o público jovem. Nº 9 • Magnétique New York e Nº 1 • Jolie Provence lideram.</p>`
- **pills** label `Adocicados` · `["Femininos", "Gourmand", "25ml", "100ml"]`
  - grounding: brandbook §6.4 classifica Nº 9 como Floral Frutal/Gourmand ✅
- cor: `#F5F5F5` / `#1A1A1A`

#### 23. `oriental` — 🔴 precisa banner

- **T** `Perfumes Orientais: Intensos e de Longa Fixação | Lescent` (57)
- **D** (141) — `Perfumes orientais Lescent: Nº 17 • Sublime Monte-Carlo, Nº 19 • Brûlant Bordeaux e Nº 21 • Luxe Saint-Tropez. Intensos, quentes e marcantes.`
- **desc** (141 car. de texto) — `<p>Quentes, intensos e de longa fixação — para quem gosta de ser notado. Nº 17 • Sublime Monte-Carlo e Nº 19 • Brûlant Bordeaux abrem a família.</p>`
- **pills** label `Orientais` · `["Masculinos", "Amadeirados", "25ml", "100ml"]`
- cor: `#F5F5F5` / `#1A1A1A`

---

## 5. Execução

### 5.1 Ordem obrigatória (REGRA INVIOLÁVEL #0 de `CLAUDE.md`)

Por collection, **sem exceção**:

1. `Write` → `conteudos/lescent/collections/[handle]/textos/description.md` + `.json`
2. `Write` → `conteudos/lescent/collections/[handle]/textos/seo.json`
3. `Write` → `conteudos/lescent/collections/[handle]/textos/tags.json`
4. `Write` → `conteudos/lescent/collections/[handle]/textos/shopify-payload.json` (variables prontas pra replay)
5. `Write` → `conteudos/lescent/collections/[handle]/textos/shopify-payload-tags.json`
6. `Read`/`Glob` confirmando que 1–5 existem e estão populados
7. Re-query de não-sobrescrita (§2)
8. **Só então** as mutations
9. `Write` → `conteudos/lescent/collections/[handle]/shopify-result.json` + `shopify-result-tags.json` (GIDs + timestamp)

### 5.2 Passo 0 — schema de tags (uma vez, antes de tudo)

```graphql
# a) metaobjeto
mutation {
  metaobjectDefinitionCreate(definition: {
    name: "Collection Tags"
    type: "collection_tags"
    fieldDefinitions: [
      { key: "label", name: "Label", type: "single_line_text_field" }
      { key: "tags", name: "Tags", type: "list.single_line_text_field" }
      { key: "tag_background_color", name: "Tag background color", type: "color" }
      { key: "text_color", name: "Text color", type: "color" }
    ]
  }) { metaobjectDefinition { id type } userErrors { field message } }
}

# b) metafield de collection
mutation {
  metafieldDefinitionCreate(definition: {
    name: "[Gogroup][Collection] Tags"
    namespace: "custom"
    key: "tags_collection"
    ownerType: COLLECTION
    type: "metaobject_reference"
    validations: [{ name: "metaobject_definition_id", value: "<GID_do_passo_a>" }]
  }) { createdDefinition { id key } userErrors { field message } }
}
```

⚠️ Se a definição sair **publishable**, todo `metaobjectCreate` precisa de `capabilities: { publishable: { status: ACTIVE } }` (memória `metaobject-create-defaults-draft`). O schema de chips de PDP de 2026-07-31 foi criado **sem** publishable de propósito — vou seguir a mesma escolha aqui e verificar no primeiro create.

### 5.3 Spec do snippet que o dev precisa criar (tags não renderizam sem isso)

`snippets/collection-tags.liquid` — a portar de Barbour's/By Samia:
```liquid
{%- assign group = collection.metafields.custom.tags_collection.value -%}
{%- if group != blank and group.tags != blank -%}
  <div class="collection-tags">
    {%- if group.label != blank -%}<p class="collection-tags__label">{{ group.label }}</p>{%- endif -%}
    <ul class="collection-tags__list">
      {%- for tag in group.tags.value -%}
        <li class="collection-tags__pill"
            style="background-color: {{ group.tag_background_color | default: '#8C5E3C' }};
                   color: {{ group.text_color | default: '#FFFFFF' }};">{{ tag }}</li>
      {%- endfor -%}
    </ul>
  </div>
{%- endif -%}
```
Chamar de `sections/collection-banner.liquid` (logo após `collection_header`) ou de `main-collection.liquid` acima do grid.

### 5.4 Pedido pro time de dev (2 toggles + 1 seção) — sem isso, título/descrição/tags ficam invisíveis

No **tema MAIN**, `templates/collection.json`, seção `banner`:
| Setting | Hoje | Precisa | Por quê |
|---|---|---|---|
| `show_collection_title` | `false` | `true` | H1 da página — hoje a collection não tem heading nenhum |
| `show_collection_description` | `false` | `true` | libera as 23 descrições |
| `overlay_opacity` | `0` | `~35` | texto branco sobre banner claro é ilegível com overlay 0 |
| `mobile_image` | ausente | avaliar | 97% mobile recebendo arte 2,67:1 |

⚠️ **Ressalva de sequenciamento**: as 14 collections que já têm banner usam **arte de campanha com texto embutido**. Ligar o overlay nelas faz o texto novo colidir com o texto do JPG. Sugestão: ligar os toggles **primeiro nas 9 collections que vão receber banner limpo** (não é possível por collection no mesmo template — então: ou o dev cria um `collection.familia.json` alternativo, ou trocamos as 14 artes por versões sem texto numa segunda rodada).

No **tema `develop`**, `templates/collection.json`: os blocos `text_tqQTNE` (Title) e `text_twGGkJ` (Description) estão `"disabled": true` → remover a flag.

> Mutations em arquivo do tema MAIN são bloqueadas pelo MCP (`themeFilesUpsert` só em tema não publicado). **Esses 4 toggles têm que ser feitos por humano no editor de tema.**

### 5.5 Banners — 9 collections via `piapp-image-gen`

Alvos: `fragrancias-de-100ml`, `100ml-femininos`, `100ml-masculinos`, `amadeirados`, `citrico-fresco`, `florais`, `aquaticos-1`, `adocicados`, `oriental`.

Fluxo obrigatório (`CLAUDE.md`):
1. `check_credits` (batch ≥ 5) → **antes de gerar**
2. Apresentar **os 9 prompts completos** pra aprovação — nenhuma geração sem OK
3. Gerar 1400×525, salvar em `conteudos/lescent/collections/[handle]/imagens/generated/` + prompt e metadata em `imagens/prompts/`
4. `fileCreate` → `metafieldsSet` em `custom.banner_cole_o`
5. `collection.image` **não é tocado**

Base de prompt (varia por família/volumetria):
> Banner horizontal 1400×525 para collection de e-commerce de perfumaria. [Composição do frasco]. Fundo off-white liso com leve gradiente para cinza claro (#F5F5F5), luz difusa de estúdio suave, sem sombras duras. Detalhe metálico cor de cobre (#8C5E3C) no frasco. Amplo espaço negativo no centro para sobreposição de texto. Fotografia de produto realista, minimalista, sem cenografia, sem pessoas, **sem nenhum texto, logo ou marca d'água na imagem**.

### 5.6 Sequenciamento

| Passo | Escopo | Depende de |
|---|---|---|
| 0 | Schema `collection_tags` (2 mutations) | — |
| 1 | Onda 1 — 6 collections × (desc + T + D + pills) | passo 0 |
| 2 | Onda 2 — 11 collections | passo 1 verificado |
| 3 | Onda 3 — 6 collections | passo 2 |
| 4 | 9 banners (aprovação de prompt → geração → `banner_cole_o`) | pode rodar em paralelo a 1–3 |
| 5 | Pedido de toggles pro dev (§5.4) + spec do snippet (§5.3) | entregável, não mutation |

Total de mutations: **2** (schema) + **23** `collectionUpdate` + **23** `metaobjectCreate` + **23** `metafieldsSet` (tags) + **9** `fileCreate` + **9** `metafieldsSet` (banner) = **89**.

---

## 6. Decisões tomadas nesta sessão

| # | Decisão | Escolha |
|---|---|---|
| 1 | Descrição não renderiza — o que fazer? | **Escrever curta (≤200 car.) agora** + entregar o pedido de toggle pro dev. Conteúdo é lido pelos dois temas quando acender; nada se perde na migração |
| 2 | Tags sem renderizador em nenhum tema | **Criar schema e preencher já**, com spec do snippet (§5.3) entregue ao dev |
| 3 | 9 collections sem banner | **Gerar via PiApp** 1400×525, sem texto embutido, prompts aprovados antes |
| 4 | `aquaticos` vs `aquaticos-1` | Enriquecer **`aquaticos-1`** (14 prod, superset). `aquaticos` (9, subset sem o Nº 20) → recomendar arquivar + 301 |
| 5 | `freesia` (14k sessões) | **Fora do escopo** — 12/14 produtos em DRAFT. É problema de sortimento |
| 6 | Cor das pills | Cobre `#8C5E3C`/branco (5.55:1) nas ondas 1–2; `#F5F5F5`/`#1A1A1A` (15.96:1) na onda 3, casando com os chips de família olfativa do PDP |

---

## 7. Flags — reportadas, NÃO corrigidas

Nenhum destes itens é tocado por este plano (princípio do menor escopo do skill `collection-content`).

1. **`overlay_opacity: 0`** + banners com texto embutido → colisão visual quando o overlay ligar. §5.4
2. **`mobile_image` ausente** no template — 97% do tráfego recebe arte desktop 2,67:1
3. **Títulos inconsistentes**: `Kits masculinos` vs `Kits Femininos` (caixa), `OUTLET LESCENT` (caps), `freesia` / `promo 100ml` (minúsculas), duas collections chamadas `Aquáticos`. **Não alterados** — mudar `title` exige pedido explícito
4. **Sortimento das famílias**: Nº 13 em 4 famílias, Nº 20 em 3. `florais` sem Nº 2/7/26/28. Merece sessão de curadoria
5. **`lancamentos-masculinos`**: 20 dos 23 são masters DRAFT do Nº 12–21, que não são lançamentos
6. **Produtos UNLISTED de teste** em `citrico-fresco` (`Nº 22 • Novo perfume`) e `aquaticos-1` (`Nº 20 • Brise Amalfi (TEST)`)
7. **`BRINDES-LESCENT-DESKTOP.png`** como banner de `25ml-femininos`, `25ml-masculinos` e `vitrine-home-mais-vendidos`
8. **`freesia`** recebe 14.243 sessões/90d e mostra 2 produtos
9. **Divergência de frete grátis**: R$109 (home + template de collection do develop) vs R$249 (ícone do PDP no MAIN). Por isso **nenhuma descrição deste plano cita valor de frete**
10. **`custom.banner_cole_o`** está preenchido em `kits-presenteaveis` e `vitrine-home-mais-vendidos`, mas o `vitrine` também tem `collection.image` → o metafield **ganha**, e a arte que aparece pode não ser a esperada pelo time de CRM

## 8. Compliance aplicado

- ✅ Produto Lescent protagonista em 100% das descrições; referência de luxo só no `seo.description` (bridge de busca), sempre como "inspirados em/por"
- ✅ Zero uso de "igual", "idêntico", "réplica", "clone", "imitação"
- ✅ Zero claim de duração em horas; "boa fixação" / "excelente fixação" são claims aprovados do brandbook §6.5
- ✅ Zero "exclusivo", "raro", "só para quem entende" (elitismo banido, brandbook §4)
- ✅ Zero claim terapêutico ou dermatológico
- ✅ Nenhum número de clientes citado (50.000 vs 100.000 segue não resolvido — contexto mestre §9.4)
- ✅ Nenhuma nota olfativa que não esteja no `custom.notas_e_ess_ncias` publicado da loja
- ✅ Marcas de referência restritas às confirmadas no brandbook §6.2 + notas publicadas: Jo Malone (Nº 2), Chanel (Nº 6), Parfums de Marly (Nº 10), Dior (Nº 13, Nº 26), Giorgio Armani (Nº 20), Prada (Nº 22), Xerjoff (Nº 23), MFK (Nº 27), Lancôme (Nº 28). **Aventus/Creed para o Nº 29 foi deliberadamente evitado** — só aparece em `blog-themes.md`, não confirmado no brandbook
- ⚠️ Disclaimer de não-afiliação: não cabe em 200 caracteres de overlay. Já existe na página `/pages/nao-somos-endossados` e no PDP. **Recomendo que o dev adicione o disclaimer no footer da página de collection** junto do toggle de descrição
