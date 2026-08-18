# Lescent — Contexto Mestre para Enriquecimento em Massa

> **Documento de contexto para múltiplas sessões.** Leia este arquivo INTEIRO antes de gerar qualquer conteúdo pra Lescent.
> Coletado em **2026-07-30/31** direto da loja Shopify conectada (`LESCENT` / `568499-ef.myshopify.com` / www.lescent.com.br), analytics dos últimos 90 dias (mai–jul/2026) e do site público.
>
> ## 🎯 TEMA-ALVO: `lescent-theme/develop`
>
> **Decisão tomada (2026-07-31): todo o enriquecimento é escrito contra o tema `lescent-theme/develop`** — GID `gid://shopify/OnlineStoreTheme/186949861683`, hoje `UNPUBLISHED`.
>
> O tema publicado (`lescent-theme/main`, GID `179492028723`) é **Prestige e está em fim de vida**. O develop é uma reconstrução completa em **Horizon** (blocos de tema em `blocks/`, `closest.product`, seção `product-information`) — **não é uma cópia**, os dois consomem metafields diferentes.
>
> - **§4.1–4.2** = o que o develop lê no PDP e na collection (a referência pra escrever conteúdo)
> - **§4.6** = anatomia das tags e do products benefits
> - **§4.7** = o schema que precisa ser CRIADO antes de preencher
> - **§4.8** = o que o MAIN lê (só pra contexto/legado — não priorizar)
> - **`docs/lescent-plano-pdp-top30.md`** = plano de execução dos top 30 produtos
>
> Fontes complementares no repo: `brand-context/lescent/brandbook.md` (tom de voz — **use como fonte de tom**), `brand-context/lescent/blog-themes.md` (45 temas aprovados), `brand-context/lescent/produtos.csv` (**DEFASADO — ver §8**).

---

## 0. TL;DR — o que está furado e onde está o dinheiro

### Bloqueadores de infraestrutura (precisam vir ANTES do conteúdo)

| # | Achado | Severidade | Ação |
|---|---|---|---|
| 1 | O develop lê **7 metafields + 6 metaobjetos que NÃO EXISTEM na loja** → 5 seções do PDP renderizam vazias | 🔴 Bloqueia | **Criar o schema** — spec completa em §4.6 |
| 2 | `collection_tags` / pills de collection **não existe na Lescent** — nem schema, nem renderizador no develop | 🔴 Bloqueia | **Vamos fazer**: criar schema + pedir bloco ao dev (§4.7.3) |
| 3 | No develop, os blocos de **título (h1) e descrição da collection estão `disabled: true`** no `templates/collection.json` | 🟠 Alto | Habilitar antes de escrever descrições (collection sem H1 = problema de SEO) |
| 4 | Blocos `jump-product-info-benefits` e `jump-product-tag` existem no develop mas **não estão no `block_order`** | 🟠 Alto | Adicionar no editor de tema (é preset, 1 clique) |
| 5 | `produtos.csv` local tem handles errados/vazios e faltam **19 fragrâncias** do catálogo real | 🟠 Alto | Regerar a partir da §6.2 |
| 6 | Handles são um campo minado: `-copy`, `-copia`, `-copy-copy`, títulos que não batem com o handle | 🔴 Crítico | **Sempre resolver handle via Shopify antes de escrever CTA** (§8) |

### Conteúdo faltando (o trabalho em si)

| # | Achado | Severidade | Ação |
|---|---|---|---|
| 7 | `custom._v2_descri_o` — corpo do "SOBRE O PRODUTO", lido pelo develop **e** pelo MAIN, **vazio em 100%** | 🔴 Crítico | Preencher — maior bloco de texto do PDP |
| 8 | `custom.composicao` ("COMPOSIÇÃO") faltando em vários best-sellers (inclusive **Nº 13**, campeão masculino) | 🟠 Alto | Completar (exige INCI do time) |
| 9 | `custom.notas_e_ess_ncias` ausente em **todos os kits** — e os 2 maiores SKUs da loja são kits | 🟠 Alto | Concatenar as notas dos números do kit |
| 10 | **Todas as 21 collections de navegação têm `description` vazia**; `seo.title` `null` em todas as 21 | 🟠 Alto | Escrever (depois do item 3) |
| 11 | Blog `news` existe com **0 artigos**. Zero conteúdo editorial publicado | 🟠 Alto | 45 temas já aprovados, repriorizados em §9.3 |
| 12 | Valores de `custom.badges` inconsistentes ("Feminino" vs "Femininos", "Best- Seller" com espaço) | 🟡 Médio | Padronizar vocabulário (§4.5) |
| 13 | Site expõe "+50.000 clientes" na home e "+100.000" no PDP do MAIN (o develop já corrigiu pra 50.000) | 🟡 Médio | Confirmar número oficial antes de usar em copy |
| 14 | Frete grátis: home e collection do develop dizem R$109; ícone do PDP diz R$249 | 🟡 Médio | Confirmar valor real |

**Receita 90d:** R$ 12,1M net (top 50 SKUs). **AOV:** R$ 106,91 (caindo: 113 → 108 → 98). **Pedidos:** 137,5k. **Recompra:** ~25,5%. **Mobile:** ~97% das sessões.

---

## 1. Identidade da loja e stack

| Item | Valor |
|---|---|
| Loja | LESCENT |
| Domínio | www.lescent.com.br |
| Myshopify | 568499-ef.myshopify.com |
| E-mail | sac@lescent.com.br |
| Moeda / TZ / País | BRL / UTC-3 / Brasil |
| Plano | Shopify |
| Tema publicado | `lescent-theme/main` — GID `gid://shopify/OnlineStoreTheme/179492028723` |
| Base do tema | **Prestige** (Maestrooo) customizado + seções Goshop/Gogroup enxertadas |
| Reviews | **Judge.me** (`reviews.rating` / `reviews.rating_count`) |
| Back-in-stock | Mini Waitlist + Stok Back-in-Stock |
| Atendimento | GoConnect360 (help center) + WhatsApp `5517991162579` |
| Rastreio | rastreamento.lescent.com.br |
| Trocas | lescent.troque.app.br |

**⚠️ Temas não publicados relevantes:** `lescent-theme-new/main`, `lescent-theme-new/barbours-duplicate`, `new-product-structure`, `lescent-theme/develop`. Existe um esforço de migração pro padrão Barbour's/Goshop em andamento — **isso explica os metafields definidos e vazios (§4)**. Antes de um batch grande, confirmar com o time de dev qual tema vai virar MAIN.

---

## 2. Identidade visual e comunicação (validado no site em 2026-07-30)

### Paleta real observada
| Cor | HEX | Uso |
|---|---|---|
| Cobre Lescent | `#8C5E3C` | Cor institucional (logo, âncora de identidade) |
| Preto Profundo | `#1A1A1A` / `#1C1C1C` | Tipografia, accordion "Sobre o Produto" (fundo), botões |
| Cinza Claro | `#F3F3F3` / `#F5F5F5` | Fundo de seções alternadas, bloco "Você vai amar!" |
| Texto secundário | `#272727` / `#555` | Corpo de texto de seções |
| Branco | `#FFFFFF` | Fundo padrão (base do site) |

> Os valores `#1C1C1C`, `#F3F3F3`, `#272727` foram extraídos direto do `templates/product.json` — são os que **de fato** aparecem no PDP. Use-os em qualquer HTML de blog/collection pra manter coerência.

### Linguagem visual
- Base **branco/off-white**, tipografia preta, sans-serif moderna.
- Destaques promocionais em **dourado/rose gold** nos badges.
- Fotografia de produto: frasco isolado, fundo neutro, luz difusa, sem cenografia.
- Lifestyle/UGC: pessoas reais (não modelos aspiracionais). ⚠️ **As 3 fotos de "clientes satisfeitos" no PDP são imagens de banco (Freepik/Dreamstime) hardcoded no Liquid** — não são clientes reais. Não construir copy que afirme serem clientes reais.
- Banners: layout clean, tipografia grande, composição simétrica.

### Embalagem dos produtos
- **25ml** — frasco compacto, formato de bolso/viagem, rótulo minimalista com `Nº X • Nome`. É o formato de experimentação e a espinha dorsal dos kits.
- **100ml** — frasco principal, mesma linguagem de rótulo.
- **Kits** — 2 a 6 frascos de 25ml (ou combinações 100ml+25ml) apresentados juntos; existe SKU separado "Caixa de Presente" e variações "Caixa + Kit ..." pra presenteáveis.
- **Linha Corpo** — Body Splash Glow Nº 1 (200ml, esgotado) e Creme Desodorante para Mãos Nº 1 (usado como brinde).
- Embalagem geral: branca/minimalista, design clean. Detalhes metálicos (cobre/dourado) no frasco.

### Nomenclatura oficial de produto (padrão real na loja)
```
Nº {número} • {Nome Fantasia} - {volumetria}
Ex.: "Nº 2 • Délicate Londres - 100ml"
```
Subtítulo (metafield `custom.inspiracao`):
```
fragrância inspirada por {Referência} de {Marca}®️
```
Seguido SEMPRE do disclaimer: *"Não somos endossados ou afiliados a nenhuma das marcas mencionadas"*.

> ⚠️ Inconsistências reais de caixa nos títulos: `Nº 26 •  ÉLEGANCE VIENNA`, `Nº 22 •  MYSTIQUE VENEZA` (caps + espaço duplo), `Nº 31 • AUTHENTIC MILANO - 25mL` (`mL` minúsculo). Não replicar em conteúdo novo — usar Title Case e `25ml`/`100ml`.

### Provas sociais em uso
| Prova | Onde | Observação |
|---|---|---|
| "+50.000 clientes satisfeitos" | Home | Valor do brandbook |
| "+100.000 clientes satisfeitos" | PDP (Liquid hardcoded) | **Conflita com a home** |
| "4.382 avaliações verificadas" | Home | Confirmar valor atual |
| Selo RA1000 Reclame Aqui | Home + PDP | 4,5 estrelas renderizadas |
| Judge.me por produto | PDP | Ratings reais na §8 |

### Ícones de confiança do PDP (hardcoded no tema, não metafield)
1. Em até **3x sem juros!**
2. **Matéria Prima** importada de alto padrão.
3. **Frete Grátis** nas compras acima de R$249. ⚠️ *A home anuncia "FRETE GRÁTIS A PARTIR DE R$109" — divergência real no site.*
4. **Envio Rápido Nacional** — sem burocracias e tarifas alfandegárias.

### Barra de topo (home)
- "KITS A PARTIR DE R$69,90"
- "FRAGRÂNCIAS A PARTIR DE R$39"
- "FRETE GRÁTIS A PARTIR DE R$109*"

### Compliance de contratipo (página `/pages/nao-somos-endossados`)
Pontos oficiais a respeitar em 100% do conteúdo:
1. A Lescent não possui vínculos com quaisquer outras marcas.
2. Produtos não são fabricados conforme especificações de terceiros.
3. Referências a outras marcas servem apenas para **contextualização olfativa**.
4. As marcas mencionadas pertencem a seus respectivos fabricantes.
5. Menção de "inspiração olfativa" **não constitui promessa de resultados idênticos**.

→ Todas as restrições de vocabulário estão em `brandbook.md` §8 e `blog-themes.md`. **Regra de ouro: "inspirado por", nunca "igual/idêntico/réplica/clone".**

---

## 3. Perfil do comprador (dados reais 90d)

### Dispositivo — a loja é mobile-only na prática
| Dispositivo | Sessões | Share |
|---|---|---|
| Mobile | ~4,68M | **~97%** |
| Desktop | ~135k | ~3% |

→ **Implicação direta pra conteúdo:** parágrafos curtos, headings escaneáveis, tabelas com scroll horizontal, blocos de no máximo 3–4 linhas. Nada de tabela comparativa de 6 colunas.

### Geografia (sessões mobile, 90d)
| UF | Sessões |
|---|---|
| São Paulo | 1.710.891 |
| Rio de Janeiro | 520.358 |
| Minas Gerais | 471.788 |
| Rio Grande do Sul | 237.924 |
| Paraná | 227.822 |
| Bahia | 197.569 |
| Santa Catarina | 185.488 |
| Distrito Federal | 164.287 |
| Pernambuco | 139.917 |
| Ceará | 125.528 |

Cobertura nacional real, com eixo SP–RJ–MG concentrando ~56%. Nordeste relevante (BA+PE+CE+MA+PB+RN+PI+AL+SE ≈ 710k).

### Comportamento comercial
| Métrica | Mai/26 | Jun/26 | Jul/26 |
|---|---|---|---|
| AOV | R$ 113,64 | R$ 108,72 | **R$ 98,36** |
| Pedidos | 40.325 | 41.691 | **55.449** |
| Net sales | R$ 4,51M | R$ 4,49M | **R$ 5,42M** |
| Taxa de recompra | 26,2% | 25,9% | 25,4% |

**Leitura:** volume subindo forte (+33% pedidos em jul) com AOV caindo (-13%) — mix migrando pra ticket baixo (25ml a R$39–49 e promoções agressivas). Recompra estável em ~1/4.

### Persona operacional (síntese brandbook + dados)
- **Mulher/homem 22–35, classe B/C, mobile, comprando por promoção e por kit.**
- Ponto de entrada dominante: **kit de 3× 25ml a R$89,90** (os 2 maiores SKUs da loja).
- Sensível a preço: reage a "% OFF", "5% no Pix", "3x sem juros", frete grátis.
- Descobre pelo TikTok/Instagram (@lescentfragrancias); usa a referência de luxo como bússola de escolha.
- Precisa de **orientação** — o catálogo tem 35+ números e a navegação é só Feminino/Masculino. **Aqui está a maior oportunidade de conteúdo: guias de escolha.**
- Rejeita: elitismo, falta de transparência sobre contratipo, fixação ruim.

### Personas secundárias (do brandbook, confirmadas pelo mix)
1. **Presenteador** — Kits Presenteáveis, "Presente pra Ela/Ele/Casal", Caixa de Presente. 54 SKUs presenteáveis ativos.
2. **Colecionador de repertório** — Sextetos (R$169,99), recompra alta.
3. **Iniciante em perfumaria** — trilogias como porta de entrada.

---

## 4. Auditoria de metafields — tema-alvo `lescent-theme/develop`

> Tudo nesta seção foi lido do código do tema, não inferido. Arquivos consultados: `templates/product.json`, `templates/collection.json`, `sections/product-features.liquid`, `sections/active-ingredients.liquid`, `sections/product-highlight.liquid`, `sections/product-how-to-use.liquid`, `sections/product-comparison.liquid`, `blocks/product-badges.liquid`, `blocks/product-subtitle.liquid`, `blocks/product-title.liquid`, `blocks/jump-product-tag.liquid`, `blocks/jump-product-info-benefits.liquid`, `snippets/product-subtitle.liquid`, `snippets/jump-product-tag.liquid`, `snippets/jump-product-info-benefits.liquid`, `blocks/collection-title.liquid`, `blocks/_collection-info.liquid`.

### 4.1 O que o develop renderiza no PDP — mapa completo

Ordem real de `templates/product.json` (seção `product-information` → bloco estático `_product-details`, depois seções irmãs):

| # | Bloco / seção | Metafield que lê | Schema existe? | Preenchido? |
|---|---|---|---|---|
| 1 | `product-badges` → `snippets/product-badges.liquid` (`surface: 'pdp'`) | `custom.badges` | ✅ | ✅ ~100% (vocabulário inconsistente) |
| 2 | grupo "Header" → `text` | `product.title` | — | ✅ |
| 3 | └ `product-inspiration` | `custom.inspiracao` + disclaimer hardcoded | ✅ | ✅ ~100% |
| 4 | └ `product-subtitle` | **`custom.subtitulo`** | ❌ **criar** | 🔴 |
| 5 | └ `price` (com badge Pix + parcelas) | nativo | — | ✅ |
| 6 | `_divider` · `installment-price` · `variant-picker` · `buy-buttons` (CTA "COMPRAR") | nativo | — | ✅ |
| 7 | `goshop-product-upsell` — "LEVE MAIS E PAGUE MENOS" (tag "POPULAR") | `custom.info_lista_vertical_de_upsell` → `upsell_vertical_list` | ✅ | ⚠️ parcial |
| 8 | `offer` — "Você vai amar!" (`picto-heart`, fundo `#f3f3f3`) | **`content` está VAZIO no develop** (no MAIN aponta pra `_v2_descri_o_curta`) | ✅ | ⚠️ **reapontar setting** |
| 9 | `goshop-icon-with-text` (4 ícones de confiança) | hardcoded no template | — | ✅ |
| 10 | `social-proof` | hardcoded: "+50.000 clientes satisfeitos", "4.382 avaliações verificadas", RA1000 | — | ✅ |
| 11 | `text` — descrição nativa do produto | `product.description` | — | ⛔ `disabled: true` |
| 12 | `product-accordion` (labels "Modo de uso" / "Ingredientes") | provável `custom.modo-de-uso` / `custom.ingredients` | ✅ | 🔴 vazios — **confirmar mapeamento** |
| 13 | seção `product-features` — grid de ícones de confiança | **`custom.trust_icons`** → list de metaobjeto `{icon, title, description}` | ❌ **criar** | 🔴 |
| 14 | seção `active-ingredients` — "O poder da fórmula" | **`custom.ativo`** → `sess_o_ativos {image, ativo: list de 'ativos' {title, description}}` | ❌ **criar (2 metaobjetos aninhados)** | 🔴 |
| 15 | seção `product-highlight` | **`custom.highlight_section`** → metaobjeto `{title, description, image}` | ❌ **criar** | 🔴 |
| 16 | seção `product-how-to-use` — "Como usar" | **`custom.how_to_use`** → metaobjeto `{file, steps}` | ❌ **criar** | 🔴 |
| 17 | seção `product-comparison` — marca vs "Concorrentes" | **`custom.brand_comparison`** → list de `comparison_item {for_brand, text}` | ❌ **criar** | 🔴 |
| 18 | seção `about-faq` — **"SOBRE O PRODUTO"** (corpo) | **`custom._v2_descri_o`** | ✅ | 🔴 **VAZIO EM 100%** |
| 19 | └ acordeão "PRA QUEM É?" | `custom.para_quem_essa_fragr_ncia_` | ✅ | ✅ 100% |
| 20 | └ acordeão "NOTAS E ESSÊNCIAS" | `custom.notas_e_ess_ncias` | ✅ | ✅ singles / ❌ **kits** |
| 21 | └ acordeão "COMPOSIÇÃO" | `custom.composicao` | ✅ | ⚠️ faltando em vários |
| 22 | seção `product-recommendations` — "VOCÊ TAMBÉM VAI AMAR" | algorítmico (`related`) + card com `product-title` | — | ✅ |
| 23 | Judge.me review widget | app — `review_data: "real_data"` ✅ | — | ✅ |

**Blocos disponíveis no tema mas FORA do `block_order`** (adicionar no editor, são presets):

| Bloco | Metafield | Schema existe? |
|---|---|---|
| `jump-product-info-benefits` — "Short Description + Bullet Points" | `custom.product_info_benefits` → `product_benefit` | ✅ **e o tipo bate** |
| `jump-product-tag` — lista de pills de bullet | **`custom.product_bullet_point_metafield`** → `{point_text, point_color, point_background_color}` | ❌ **criar** |
| `jump-info-faq` · `jump-complementary-products` · `product-custom-property` · `product-description` · `product-inventory` | vários | — |

**Biblioteca Goshop presente no develop mas fora do template:** `sections/goshop-product-ingredients.liquid` (32KB) · `goshop-product-faq.liquid` (16KB) · `goshop-product-efficacy.liquid` (24KB) · `goshop-how-to-use-pdp.liquid` (29KB) · `goshop-product-blog.liquid` (20KB). São as seções padrão do repo (equivalentes Barbour's) e casam com `product_ingredients_metafield`, `section_faq` e `section_efficacy`, que **já existem na loja**.

> ⚠️ **Decisão de arquitetura pendente com o dev:** o template do develop optou pelas seções nativas Horizon (`active-ingredients`, `about-faq`, `product-how-to-use`), que exigem schema novo, em vez das Goshop, que reusam o schema existente. Escolher um dos dois caminhos evita criar metafields em duplicidade — ver §4.7.

### 4.2 O que o develop renderiza na collection

`templates/collection.json` do develop tem 3 seções:

| Seção | Conteúdo | Estado |
|---|---|---|
| `section` "Collection heading" (full-width, `background_media: image`, `color_scheme: scheme-5`, altura small) | bloco `text` "Title" → `<h1>{{ closest.collection.title }}</h1>` | 🔴 **`disabled: true`** |
| | bloco `text` "Description" → `<p>{{ closest.collection.description }}</p>` | 🔴 **`disabled: true`** |
| `main` = `main-collection` | filtros verticais + grid 4 col (24/pág) com card: gallery quadrada → `product-title` (`show_subtitle: true`, bg `#6b5b4e`, texto branco, uppercase) → `price` → `installment-price` | ✅ |
| `section_EiJtCA` | 4 `icon-with-text` hardcoded: "Frete grátis acima de R$109*", "ENVIO RÁPIDO", "ATÉ 3X SEM JUROS", "Compra Segura" | ✅ |

**Três consequências práticas:**
1. 🔴 **Escrever `collection.description` hoje não aparece no develop** — o bloco está desabilitado. Habilitar antes de rodar o batch (1 clique no editor).
2. 🔴 **A collection não tem H1** (título desabilitado também). Problema de SEO a corrigir junto.
3. Quando habilitados, título e descrição vão **sobre a imagem de fundo** (`background_media: image`, seção full-width, altura small) → descrição precisa ser **curta** (~180 caracteres) e legível sobre foto. Mesma restrição do MAIN.

**Não existe renderizador de pills/tags de collection em nenhum lugar do develop.** Varri `blocks/*` e `sections/*`: existem `_collection-card`, `_collection-card-image`, `_collection-image`, `_collection-info` (só wrapper de carrossel), `collection-card`, `collection-title`, `collection-blocks`, `collection-links`, `collection-list`, `collection-story-slider`, `main-collection`, `main-collection-list` — **nenhum lê metafield de tags**. Ver §4.7.3.

### 4.3 Metafields de PRODUTO — inventário completo (34 definições em `custom`)

**✅ EM USO (renderizam no tema MAIN):**
| Namespace.key | Nome | Tipo | Preenchimento |
|---|---|---|---|
| `custom.inspiracao` | [Info] Inspiração | rich_text_field | ✅ ~100% |
| `custom.para_quem_essa_fragr_ncia_` | [Info] Para quem é essa fragrância? | multi_line_text | ✅ 100% |
| `custom.notas_e_ess_ncias` | [Info] Notas e Essências | multi_line_text | ✅ singles / ❌ kits |
| `custom.composicao` | [Info] Composição | multi_line_text | ⚠️ parcial |
| `custom.badges` | [Info] Badges | list.single_line_text | ✅ ~100% |
| `custom._v2_descri_o` | [v2] Descrição | rich_text_field | 🔴 0% |
| `custom._v2_descri_o_curta` | [v2] Descrição curta | rich_text_field | 🔴 0% |
| `custom.product_ingredients_metafield` | [Gogroup][PDP][Section] Ingredientes | list.metaobject_reference | 🔴 0% |
| `custom.info_lista_vertical_de_upsell` | [Info] Lista vertical de upsell | list.metaobject_reference | ⚠️ parcial |
| `custom._all_fields_upsell_banner_` | [All Fields] Upsell Banner | metaobject_reference | ⚠️ parcial |
| `reviews.rating` / `reviews.rating_count` | Judge.me | rating / integer | ✅ |

**⛔ DEFINIDOS SEM RENDERIZADOR EM NENHUM DOS DOIS TEMAS (0% preenchidos) — órfãos, não preencher:**
`custom.descricao` · `custom.notas_da_fragr_ncia` · `custom.isen_o_de_direitos_autorais` · `custom.cheiro_inspirado` · `custom._v2_indica_o` · `custom._v2_tecnologia` · `custom._v2_benef_cios` · `custom._v2_modo_de_uso` · `custom._v2_resultado` · `custom._v2_itens_inclusos` · `custom.tamanho` · `custom.estoque_minimo` · `custom.was_restocked` · `seo.hidden`

**⚠️ DEFINIDOS COM RENDERIZADOR MAS FORA DO TEMPLATE — viram utilizáveis com 1 clique no editor:**
| Metafield | Renderizador no develop | O que falta |
|---|---|---|
| `custom.product_info_benefits` | `blocks/jump-product-info-benefits.liquid` (preset) | adicionar bloco ao `block_order` |
| `custom.tag_customizada` | `snippets/product-subtitle.liquid` via `blocks/product-title.liquid` | **nada — já está ativo no card** (§4.6) |
| `custom.product_ingredients_metafield` | `sections/goshop-product-ingredients.liquid` | adicionar seção (ou usar `active-ingredients` + schema novo) |
| `custom.section_faq` | `sections/goshop-product-faq.liquid` | adicionar seção |
| `custom.section_efficacy` | `sections/goshop-product-efficacy.liquid` | adicionar seção |
| `custom.product_icons` | — (no develop o equivalente é `product-features` + `trust_icons`) | decidir Goshop vs. Horizon (§4.7) |
| `custom.eficiencia_do_produto` | — (substituído por `section_efficacy`) | descontinuar |
| `custom.modo-de-uso` / `custom.ingredients` | prováveis fontes do bloco `product-accordion` | confirmar mapeamento com o dev |
| `custom.temporizador_promocional` / `custom.barra_de_estoque` | `goshop-promotional-timer` / `goshop-stock-bar` | blocos fora do template |
| `custom.variants` | `_product-card` e `variant-picker` | **em uso** quando preenchido (migração de volumetria) |

**Taxonomia Shopify (auto, irrelevante pra copy):** `shopify.target-gender`, `age-group`, `product-form`, `suitable-for-skin-type`, `skin-care-effect`, `package-type`, `constitutive-ingredients`, `cosmetic-function`, `occasion`, `season` · `shopify--discovery--*` · `mm-google-shopping.custom_product`

### 4.4 Metafields de COLLECTION — só existe UM

| Namespace.key | Nome | Tipo | Observação |
|---|---|---|---|
| `custom.banner_cole_o` | BANNER COLEÇÃO | file_reference | Preenchido em ~poucas collections (CRM). **Nenhum dos dois temas lê** — é legado. |

**Não existe na Lescent:** `custom.tags_collection` (pills), nenhum metafield de descrição longa ou hero de collection.

**Onde o conteúdo de collection realmente vive nos dois temas:**

| Campo | Develop (alvo) | MAIN (legado) |
|---|---|---|
| Título | bloco `text` → `closest.collection.title` — **`disabled`** | `<h1>` em `collection-banner.liquid` |
| Descrição | bloco `text` → `closest.collection.description` — **`disabled`** | `collection.description` dentro de `.prose`, sobre a imagem |
| Imagem de fundo | `background_media: "image"` na seção heading | `collection.image` (ou `section.settings.image`) com overlay preto 30% |
| Meta description | `collection.seo.description` (nativo, independente do tema) | idem |
| Pills / tags | ❌ **não existe renderizador** | ❌ não existe |

→ Em ambos os temas o texto de collection é **nativo** (`collection.description`), não metafield. Descrição longa de SEO não tem onde morar hoje.

### 4.5 Metaobjetos existentes (23)

**Goshop/Gogroup (herança Barbour's — prontos pra usar):**
`product_benefit` (`titulo_destacado`, `descricao`, `beneficios`, `cor_bullet_point`) · `product_icon` · `faq_item` · `product_ingredients` · `section_efficacy_item` · `eficiencia_do_produto` · **`tag_customizada`** (`texto`, `cor_do_texto`, `cor_de_fundo`)

**Nativos da Lescent (em uso):**
`upsell_banner` · `upsell_vertical_list` · `barra_de_estoque` · `temporizador_promocional` · `swatch_tamanho` · `notify_me_request`

**Taxonomia Shopify:** `shopify--target-gender`, `shopify--age-group`, `shopify--suitable-for-skin-type`, `shopify--product-form`, `shopify--skin-care-effect`, `shopify--cosmetic-function`, `shopify--constitutive-ingredients`, `shopify--package-type`, `shopify--season`, `shopify--occasion`

**❌ NÃO existem** (todos precisam ser criados — §4.7): `collection_tags` · `trust_icons` · `sess_o_ativos` · `ativos` · `highlight_section` · `how_to_use` · `comparison_item` · `product_bullet_point`

> Lembrete de `metaobjectCreate`: definição publishable cria em **DRAFT**. Passar `status: ACTIVE` ou o metaobjeto não renderiza. (Ver memória `metaobject-create-defaults-draft`.)
>
> Para `tag_customizada`, o próprio snippet do develop documenta: **Storefront API access: ON** no metaobjeto e no metafield. Vale pra todos os que vamos criar.

### 4.6 As "tags" e o "products benefits" — anatomia no develop

São **três mecanismos diferentes** que costumam ser confundidos. No develop:

| O que aparece | Onde | Metafield | Cor configurável? | Schema | Preenchido |
|---|---|---|---|---|---|
| **Badge** acima do título | PDP **e** card | `custom.badges` | ❌ não | ✅ existe | ✅ ~100% |
| **Pill colorido** acima do título | **só no card** (nunca no PDP) | `custom.tag_customizada` | ✅ por entrada | ✅ existe | 🔴 0% |
| **Subtítulo** de texto | só no PDP | `custom.subtitulo` | cor no bloco | ❌ criar | 🔴 |
| **Lista de pills de bullet** | bloco fora do template | `custom.product_bullet_point_metafield` | ✅ por entrada | ❌ criar | 🔴 |

#### 1. Badge — `custom.badges` (já funciona)

```liquid
{# blocks/product-badges.liquid #}
{% render 'product-badges', product: closest.product, surface: 'pdp' %}

{# snippets/product-badges.liquid, tipo 'custom' #}
{%- assign custom_badges = product.metafields.custom.badges.value | sort -%}
<span class="badge badge--primary">{{ custom_badge }}</span>
```

`list.single_line_text_field`. No develop o snippet foi centralizado (é fonte única pra PDP e card) com **toggles por superfície** em Theme settings → Badges, e estilos em `product-badges-styles.liquid`.

- ❌ **Sem controle de cor** — classe fixa `badge--primary`.
- ❌ **Sem controle de ordem** — `| sort` alfabético, "Best-Seller" sempre antes de "Feminino".
- ⚠️ **Vocabulário inconsistente hoje:** `"Feminino"` vs `"Femininos"`, `"Masculino"` vs `"Masculinos"`, `"Best-Seller"` vs `"Best- Seller"` (com espaço), `"Lançamento"` vs `"Lançamentos"`. O kit `kit-sexteto-masculino-...` está com `badges: null`. → **Padronizar é tarefa de enriquecimento por si só.**

#### 2. Pill colorido — `custom.tag_customizada` ✅ ATIVO no develop

**Correção importante:** no MAIN essa tag está praticamente morta (só o card de A/B test a chama, e com mismatch de tipo). **No develop ela está viva e sem bloqueio.**

```liquid
{# blocks/product-title.liquid — está no block_order do collection.json E do card de recomendações #}
{%- if block.settings.show_subtitle -%}
  {% render 'product-subtitle', product: closest.product,
     uppercase: ..., background_color: ..., text_color: ... %}
{%- endif -%}

{# snippets/product-subtitle.liquid #}
{%- if product != blank and request.page_type != 'product' -%}   {# ← nunca no PDP #}
  {%- assign raw_tag_value = product.metafields.custom.tag_customizada.value -%}
  {%- assign tag = raw_tag_value -%}
  {%- if tag.texto == blank -%}
    {%- assign tag = raw_tag_value | first -%}      {# ← aceita single OU list #}
  {%- endif -%}
  ...
  assign pill_bg = tag.cor_de_fundo | default: background_color | default: '#6B5B4E'
  assign pill_fg = tag.cor_do_texto | default: text_color | default: '#FFFFFF'
  assign pill_size = tag.tamanho_da_fonte | default: ''
```

| Aspecto | Realidade |
|---|---|
| Metafield | `custom.tag_customizada` — `metaobject_reference` (única) |
| **Tipo bate?** | ✅ **Sim.** O snippet tenta o valor direto e, se `texto` vier vazio, faz `\| first` — **funciona com single OU list**. O mismatch que trava o MAIN não existe aqui. |
| Metaobjeto | `tag_customizada` já existe com `texto`, `cor_do_texto`, `cor_de_fundo` — exatamente o que o snippet espera |
| Campo opcional não criado | `tamanho_da_fonte` (número, px) — o snippet lê se existir |
| Onde renderiza | **só em cards** — `request.page_type != 'product'` bloqueia o PDP |
| Já está no template? | ✅ `product-title` com `show_subtitle: true` está no `collection.json` (grid) e no card de "VOCÊ TAMBÉM VAI AMAR" |
| Fallback de cor | bloco define bg `#6b5b4e` / texto `#ffffff` / uppercase; a entrada do metaobjeto sobrescreve |
| Origem do padrão | o próprio `{%- doc -%}` diz: adotado do **rituaria-theme** |

→ **É o caminho recomendado pra tag colorida na Lescent.** Zero dependência de dev: criar as entradas do metaobjeto e apontar o metafield por produto.

#### 3. `custom.product_info_benefits` — renderizador existe e o tipo bate ✅

`snippets/jump-product-info-benefits.liquid` + `blocks/jump-product-info-benefits.liquid` (preset "Product Info Benefits", categoria produto):

```liquid
{% assign benefits_data = product.metafields.custom.product_info_benefits.value %}
{{ benefits_data.descricao | metafield_tag }}          {# rich_text #}
{{ benefits_data.titulo_destacado | metafield_tag }}   {# rich_text #}
{% for benefit in benefits_data.beneficios.value %}    {# list.single_line_text #}
  <circle fill="{{ benefits_data.cor_bullet_point }}"/> ✓ {{ benefit }}
{% endfor %}
```

Acesso **direto** (`benefits_data.descricao`), sem loop externo → compatível com `metaobject_reference` única. O metaobjeto `product_benefit` já tem os 4 campos. Tem opção `is_collapsible` com "Ver mais / Ver menos" e máscara de gradiente em 72px.

→ **Único pendente: adicionar o bloco ao `block_order`** (é preset, 1 clique no editor). **Pode preencher.**

#### 4. `custom.product_bullet_point_metafield` — a outra tag (schema não existe)

```liquid
{# snippets/jump-product-tag.liquid #}
{% for tag in product.metafields.custom.product_bullet_point_metafield.value %}
  <div style="background-color: {{ tag.point_background_color | default: '#89BCF640' }};
              color: {{ tag.point_color | default: '#111E4D' }};">{{ tag.point_text }}</div>
{% endfor %}
```

Lista de pills, defaults azulados. Bloco `jump-product-tag` existe com preset mas **não está no template** e o metafield **não existe na loja**. É complementar ao pill único do item 2 — decidir se vale ter os dois.

#### O que o card do develop também consome
- `custom.tag_customizada` → pill (item 2)
- `custom.badges` → badge (item 1)
- `reviews.rating` via `product-rating`
- Preço Pix via `show_pix_price_badge` no bloco `price` (nativo do bloco, não é o A/B test do MAIN)
- `custom.variants` → seletor 25ml/100ml; quando vazio, cai no fallback de variantes nativas

### 4.7 SCHEMA A CRIAR — spec de execução

> **Sessão de infraestrutura, roda ANTES de qualquer conteúdo.** Ordem: metaobjetos primeiro (com `capabilities.publishable` e Storefront access ON), depois os metafields que os referenciam.
>
> Base da verificação: `metafieldDefinitions(ownerType: PRODUCT, namespace: "custom")` = **34 definições, `hasNextPage: false`** · `metaobjectDefinitions` = **23, nenhuma bate**.

#### 4.7.1 Metaobjetos novos (6)

| Type / handle | Campos | Alimenta |
|---|---|---|
| `trust_icons` | `icon` (file_reference) · `title` (single_line) · `description` (multi_line) | seção `product-features` |
| `ativos` | `title` (single_line) · `description` (multi_line) | filho de `sess_o_ativos` |
| `sess_o_ativos` | `image` (file_reference) · `ativo` (**list.metaobject_reference → `ativos`**) | seção `active-ingredients` |
| `highlight_section` | `title` (single_line) · `description` (multi_line **ou** rich_text — o Liquid usa `\| metafield_tag`) · `image` (file_reference) | seção `product-highlight` |
| `how_to_use` | `file` (file_reference — aceita vídeo Shopify **ou** imagem) · `steps` (list.single_line_text) | seção `product-how-to-use` |
| `comparison_item` | `for_brand` (boolean) · `text` (single_line) | seção `product-comparison` |
| `product_bullet_point` | `point_text` (single_line) · `point_color` (color) · `point_background_color` (color) | bloco `jump-product-tag` *(opcional — ver §4.6 item 4)* |

⚠️ `sess_o_ativos` depende de `ativos` → criar `ativos` primeiro.

#### 4.7.2 Metafields de PRODUTO novos (7)

| Namespace.key | Tipo | Referencia | Seção que ativa |
|---|---|---|---|
| `custom.trust_icons` | `list.metaobject_reference` | `trust_icons` | `product-features` |
| `custom.ativo` | `metaobject_reference` (única) | `sess_o_ativos` | `active-ingredients` — "O poder da fórmula" |
| `custom.highlight_section` | `metaobject_reference` (única) | `highlight_section` | `product-highlight` |
| `custom.how_to_use` | `metaobject_reference` (única) | `how_to_use` | `product-how-to-use` — "Como usar" |
| `custom.brand_comparison` | `list.metaobject_reference` | `comparison_item` | `product-comparison` |
| `custom.subtitulo` | `single_line_text_field` | — | bloco `product-subtitle` (**já no block_order**) |
| `custom.product_bullet_point_metafield` | `list.metaobject_reference` | `product_bullet_point` | bloco `jump-product-tag` *(opcional)* |

**Campo opcional a adicionar num metaobjeto existente:** `tag_customizada.tamanho_da_fonte` (`number_integer`, px) — o `snippets/product-subtitle.liquid` já lê se existir.

#### 4.7.3 Collection tags / pills — **vamos fazer** 🔧

Confirmado que **não existe nada** na Lescent: nem metafield, nem metaobjeto, **nem renderizador no develop**. Diferente das outras marcas, aqui não é só criar schema — **precisa de trabalho de tema**.

**Padrão a replicar** (de Ápice / Barbour's / By Samia — ver memórias `apice-schema-e-top-nav-batch`, `barbours-schema-tags`, `bysamia-top30-collections-batch`):

| Item | Spec |
|---|---|
| Metaobjeto | `collection_tags` — `label` (single_line) · `tags` (list.single_line_text) · `cor_do_texto` (color) · `cor_de_fundo` (color) |
| Metafield | `custom.tags_collection` em COLLECTION — `list.metaobject_reference` → `collection_tags` |
| Renderizador | ❌ **não existe no develop** — pedir ao dev um bloco Horizon (`blocks/collection-tags.liquid`) que leia `closest.collection.metafields.custom.tags_collection` e renderize pills, no padrão do `snippets/product-subtitle.liquid` (cor por entrada, fallback nas settings do bloco) |
| Onde colocar | dentro da seção `section` "Collection heading" do `templates/collection.json`, junto com título e descrição |
| Contraste | validar WCAG AA de cada par cor-texto/cor-fundo contra a paleta da marca (§2) — o mapa de cores da Barbour's serve de referência |

→ **Ordem de execução:** (1) criar metaobjeto + metafield, (2) pedir o bloco ao dev, (3) só então gerar as pills por collection. Gerar conteúdo antes de (2) é seguro (fica armazenado, não renderiza), mas não dá pra validar visualmente.

#### 4.7.4 Ajustes de template no develop (trabalho de editor, não de código)

| # | Ajuste | Custo |
|---|---|---|
| 1 | Habilitar bloco `text` "Title" no `collection.json` (hoje `disabled`) — collection sem H1 | 1 clique |
| 2 | Habilitar bloco `text` "Description" no `collection.json` (hoje `disabled`) | 1 clique |
| 3 | Adicionar bloco `jump-product-info-benefits` ao `block_order` do `product.json` | 1 clique (preset) |
| 4 | Apontar o `content` do bloco `offer` pra `{{ product.metafields.custom._v2_descri_o_curta \| metafield_tag }}` (hoje vazio no develop) | 1 setting |
| 5 | Confirmar com o dev quais metafields o bloco `product-accordion` lê nos labels "Modo de uso" / "Ingredientes" | pergunta |
| 6 | Decidir Goshop vs. Horizon nas seções de ingredientes/FAQ/eficácia (§4.7.5) | decisão |
| 7 | Adicionar bloco `jump-product-tag` se optar pela lista de pills de bullet | 1 clique |

#### 4.7.5 Decisão de arquitetura: Goshop vs. Horizon nativo

O develop tem **duas famílias de seção pro mesmo trabalho**. Escolher uma evita schema duplicado:

| Função | Caminho Horizon (no template hoje) | Caminho Goshop (no tema, fora do template) | Schema |
|---|---|---|---|
| Ingredientes / ativos | `active-ingredients` → `custom.ativo` | `goshop-product-ingredients` → `custom.product_ingredients_metafield` | Horizon **exige criar**; Goshop **já existe** |
| FAQ | — | `goshop-product-faq` → `custom.section_faq` | Goshop **já existe** |
| Eficácia | — | `goshop-product-efficacy` → `custom.section_efficacy` | Goshop **já existe** |
| Como usar | `product-how-to-use` → `custom.how_to_use` | `goshop-how-to-use-pdp` | Horizon **exige criar** |
| Ícones de confiança | `product-features` → `custom.trust_icons` | `custom.product_icons` → `product_icon` | Horizon **exige criar**; Goshop **já existe** |

**Minha recomendação:** usar **Goshop onde o schema já existe** (ingredientes, FAQ, eficácia, ícones) e **Horizon só onde não há equivalente** (`product-highlight`, `product-comparison`, `product-subtitle`). Isso derruba de 7 pra 4 os metafields a criar e reaproveita os metaobjetos herdados da Barbour's. **Precisa do aval do dev**, porque troca seções no template.

### 4.8 LEGADO — o que o tema MAIN (`lescent-theme/main`, Prestige) renderiza

> Mantido só pra contexto. **Não priorizar conteúdo pra cá.** Os campos marcados 🔁 são lidos pelos dois temas — escrever pra eles serve nas duas arquiteturas.

| Ordem | Seção / bloco | Fonte | Estado |
|---|---|---|---|
| 1 | `main-product` → `badges` | 🔁 `custom.badges` | ✅ |
| 2–3 | `title` + `inspiration` | 🔁 `custom.inspiracao` | ✅ |
| 4–7 | price · installments · variant_picker · Mini Waitlist · CTA | nativo | ✅ |
| 8 | `multiple_products` — "LEVE MAIS E PAGUE MENOS" | 🔁 `custom.info_lista_vertical_de_upsell` | ⚠️ parcial |
| 9 | `upsell_banner` | `custom._all_fields_upsell_banner_` | ⚠️ parcial |
| 10 | `offer` — "Você vai amar!" | 🔁 `custom._v2_descri_o_curta` | 🔴 vazio |
| 11–13 | 4 ícones · "+100.000 clientes" · RA1000 | hardcoded | ✅ |
| 14 | `faq` — "Sobre o Produto" (corpo) | 🔁 `custom._v2_descri_o` | 🔴 vazio |
| 15–17 | └ PRA QUEM É / NOTAS E ESSÊNCIAS / COMPOSIÇÃO | 🔁 `para_quem_essa_fragr_ncia_` / `notas_e_ess_ncias` / `composicao` | ✅ / ✅ / ⚠️ |
| 18 | `jump-product-ingredients` — "Ingredientes Principais" (ATIVA) | `custom.product_ingredients_metafield` | 🔴 vazio |
| 19 | `goshop-how-to-use-pdp` | — | ⛔ `disabled` |
| 20–21 | related-products · Judge.me | app | ⚠️ `review_data: "sample_data"` |
| 22 | `go-faq-pdp` — "dúvidas" | `custom.section_faq` | ⛔ `disabled` + placeholder de cabelo |

**Diferenças do MAIN que NÃO valem pro develop:**
- A tag colorida no MAIN é `card-tag-customizada.liquid`, chamada só pelo `product-card-rebrand.liquid` (A/B test `settings.use_product_card_rebrand`), e **tem mismatch de tipo** (itera lista, definição é única). No develop isso está resolvido (§4.6 item 2).
- `custom.product_info_benefits` **não tem renderizador no MAIN** — a lista de `block.type` do `snippets/product-info.liquid` não inclui esse tipo. No develop tem.
- Collection no MAIN: `sections/collection-banner.liquid` renderiza `collection.title` (h1) + `collection.description` sobre `collection.image` com overlay preto 30%, **sem os blocos desabilitados** do develop.

**🚨 Dois riscos de produção no MAIN, reportar ao dev:** (a) Judge.me em `review_data: "sample_data"`; (b) a seção `go-faq-pdp` desativada carrega 2 FAQs de cuidado capilar herdadas da Barbour's — se alguém habilitar sem limpar, vai ao ar conteúdo errado. **O develop já corrige os dois**, além de trocar "+100.000 clientes" por "+50.000" e migrar os avatares do Freepik pro CDN da loja.

---

## 5. Top collections mais acessadas (90d) — e por que o "top 30" engana

**Achado importante:** o ranking de tráfego é dominado por **collections de CRM/campanha** (landing pages de e-mail, cupom, pós-compra, necessaire) que **não devem receber conteúdo de SEO**. Elas têm 274–286 produtos (o catálogo inteiro) e existem só pra segmentar oferta.

### 5.1 Collections de NAVEGAÇÃO / SEO — o alvo real do enriquecimento (21)

| # | Handle | Título | Produtos | Sessões 90d | `description` | `seo.description` | `collection.image` |
|---|---|---|---|---|---|---|---|
| 1 | `femininos` | Femininos | 81 | **1.487.581** | ❌ vazia | ✅ | ✅ |
| 2 | `masculinos` | Masculinos | 75 | **848.460** | ❌ vazia | ✅ | ✅ |
| 3 | `kits-masculinos` | Kits masculinos | 43 | 53.892 | ❌ vazia | ❌ | ✅ |
| 4 | `outlet-lescent` | OUTLET LESCENT | 34 | 50.999 | ❌ vazia | ❌ | ✅ |
| 5 | `kits-femininos` | Kits Femininos | 69 | 32.770 | ❌ vazia | ❌ | ✅ |
| 6 | `freesia` | (linha Nº 2) | — | 13.970 | — | — | — |
| 7 | `todos-os-perfumes-browse` | Browse geral | — | 11.722 | — | — | — |
| 8 | `expresso-25ml` | Expresso 25ml | — | 9.873 | — | — | — |
| 9 | `kits` | Kits | 79 | (nav) | ❌ vazia | ✅ | ✅ |
| 10 | `lancamentos` | Lançamentos | 23 | (nav) | ❌ vazia | ✅ | ✅ |
| 11 | `lancamentos-femininos` | Lançamentos Femininos | 10 | (nav) | ❌ vazia | ❌ | ✅ |
| 12 | `lancamentos-masculinos` | Lançamentos Masculinos | 23 | (nav) | ❌ vazia | ❌ | ✅ |
| 13 | `fragrancias-de-25ml` | Fragrâncias de 25ml | 36 | (nav) | ❌ vazia | ✅ | ✅ |
| 14 | `25ml-femininos` | 25ml - Femininos | 24 | (nav) | ❌ vazia | ❌ | ✅ |
| 15 | `25ml-masculinos` | 25ml - Masculinos | 22 | (nav) | ❌ vazia | ❌ | ✅ |
| 16 | `fragrancias-de-100ml` | Fragrâncias de 100ml | 23 | (nav) | ❌ vazia | ✅ | ❌ **sem imagem** |
| 17 | `100ml-femininos` | 100ml - Femininos | 13 | (nav) | ❌ vazia | ❌ | ❌ **sem imagem** |
| 18 | `100ml-masculinos` | 100ml - Masculinos | 13 | (nav) | ❌ vazia | ❌ | ❌ **sem imagem** |
| 19 | `kits-presenteaveis` | Kits Presenteáveis | 54 | (nav) | ❌ vazia | ❌ | ❌ **sem imagem** |
| 20 | `vitrine-home-mais-vendidos` | Vitrine Home Mais Vendidos | 95 | (home) | ❌ vazia | ❌ | ✅ |
| 21 | `promo-100ml` | Promo 100ml | — | 17.522 | — | — | — |

### 5.2 Collections de FAMÍLIA OLFATIVA (na home, ótimas pra SEO — todas vazias)

| Handle | Título | Produtos | `description` | Nota |
|---|---|---|---|---|
| `amadeirados` | Amadeirados | 31 | ❌ | |
| `florais` | Florais | 14 | ❌ | |
| `aquaticos` | Aquáticos | 9 | ❌ | ⚠️ **duplicata** |
| `aquaticos-1` | Aquáticos | 14 | ❌ | ⚠️ **duplicata — resolver antes de escrever** |
| `adocicados` | Adocicados | 8 | ❌ | |
| *(Frescos)* | aparece na home | — | — | handle não localizado — confirmar |

> A home exibe 5 famílias: **Frescos, Florais, Adocicados, Amadeirados, Aquáticos**. Duas collections "Aquáticos" existem — decidir qual é a canônica (a de 14 produtos, `aquaticos-1`, é a atualizada) e redirecionar/arquivar a outra.

### 5.3 Collections de CRM/campanha — NÃO enriquecer com SEO

`necessaire-acima59-copia` (144.314) · `expresso` (90.452) · `welcome-1` (45.347) · `carrinho-colecao` (28.653) · `15poff` (24.282) · `pos-compra` (21.223) · `campanha-email` (15.342) · `porcentagem-off` (15.246) · `18off` (15.170) · `necessaire-nova` (13.470) · `grupo-vip-1` (12.631) · `welcome-geral` (11.844) · `campanha-alternativa` (11.774) · `necessaire-acima59` (11.351) · `15-off` (10.326) · `amostra-gratis` (9.525) · `kits-perfumes-crm` (9.029) · `campanha-amostras` (8.740) · `checkout-whatsapp` (8.708) · `browse-cronometro` (8.376) · `cupom-surpresa` · `valorrelampago` · `gopromo-ordem-de-vendas` · `campanha-feminina-2`

O tema tem **23 templates `collection.*.json`** dedicados a essas campanhas (`collection.expresso`, `collection.welcome`, `collection.post-purchase`, `collection.cart-cashback`…). São landing pages de performance, com banner próprio via `custom.banner_cole_o`. **Escopo separado — não misturar com o batch de SEO.**

### 5.4 Prioridade sugerida pra enriquecimento de collection

**Onda 1 (impacto imediato — 6 collections, ~2,4M sessões/90d):**
`femininos`, `masculinos`, `kits-femininos`, `kits-masculinos`, `kits`, `outlet-lescent`

**Onda 2 (SEO de cauda longa — 10):**
`fragrancias-de-25ml`, `fragrancias-de-100ml`, `25ml-femininos`, `25ml-masculinos`, `100ml-femininos`, `100ml-masculinos`, `lancamentos`, `lancamentos-femininos`, `lancamentos-masculinos`, `kits-presenteaveis`

**Onda 3 (famílias olfativas — 5, alto valor de SEO informacional):**
`amadeirados`, `florais`, `aquaticos-1`, `adocicados`, *frescos*

**Tarefa paralela:** 4 collections de navegação sem `collection.image` (`fragrancias-de-100ml`, `100ml-femininos`, `100ml-masculinos`, `kits-presenteaveis`) → precisam de banner. Candidato a `piapp-image-gen`.

---

## 6. Top 40+ produtos por receita (net_sales, 90d) — com handle REAL resolvido

> ⚠️ **Nunca confie no título pra montar URL.** Handles têm sufixos `-copy`, `-copia`, `-copy-copy` e alguns não têm nenhuma relação com o título. Esta tabela é a fonte de verdade — mas **revalide via Shopify no início de cada sessão**, porque a loja duplica produtos com frequência.

| # | Produto | Net sales 90d | Pedidos | Handle (status) | Judge.me |
|---|---|---|---|---|---|
| 1 | Kit Trilogia Essencial: Nº 2+6+10 \| 25ml | R$ 1.882.102 | 20.788 | `kit-nº-2-nº-6-nº-10-25ml` ✅ | 4,22 (650) |
| 2 | Kit Trilogia Essencial Masculina Nº 12+13+20 \| 25ml | R$ 1.796.212 | 19.837 | `kit-trilogia-essencial-masculina-nº-12-nº-13-nº-20-25ml` ✅ | 3,90 (960) |
| 3 | Nº 2 • Délicate Londres *(SKU legado)* | R$ 1.110.349 | 14.681 | `poiret-et-fresia-inspirado-no-perfume-english-pear-freesia-de-jo-malone` ⛔ **DRAFT** | — |
| 4 | Nº 2 • Délicate Londres - 25ml | R$ 457.598 | 9.793 | `nº-2-delicate-londres-copy` ✅ | 3,74 (228) |
| 5 | Nº 2 • Délicate Londres - 100ml | R$ 416.281 | 4.373 | `nº-2-delicate-londres` ✅ | 4,21 (85) |
| 6 | Kit Sexteto Masculino 12+13+19+20+29+33 | R$ 368.499 | 2.199 | `kit-sexteto-masculino-nº-12-nº-13-nº-14-nº-20-nº-27-nº-33-25ml` ✅ ⚠️ *handle cita números errados* | 3,74 (46) |
| 7 | Nº 20 • Brise Amalfi - 100ml | R$ 322.052 | 3.489 | `nº-20-brise-amalfi-copia-copia` ✅ | 4,11 (70) |
| 8 | Kit Sexteto Feminino 2+5+9+11+26+30 | R$ 305.401 | 1.823 | `kit-sexteto-feminino-nº-1-nº-5-nº-9-nº-11-nº-26-nº-30-25ml` ✅ ⚠️ *handle cita Nº 1* | 4,52 (23) |
| 9 | Kit Trilogia Gold Nº 23+25+27 \| 25ml | R$ 299.243 | 3.493 | `kit-trilogia-gold-n-23-n-25-n-27-25ml` ✅ | 4,12 (68) |
| 10 | Nº 13 • Féroce Provence - 100ml | R$ 297.592 | 3.369 | `nº-13-feroce-provence-copy-copy` ✅ | 4,40 (58) |
| 11 | Nº 13 • Féroce Provence *(SKU legado)* | R$ 229.631 | 2.849 | `n13-feroce-provence` ⛔ **DRAFT** | — |
| 12 | Kit Trilogia Essencial Masculina 12+13+20 \| 100ml | R$ 224.345 | 853 | `kit-trilogia-essencial-masculina-nº-12-nº-13-nº-20-100ml` ✅ | 3,58 (26) |
| 13 | Nº 27 • Golden Dubai - 25ml | R$ 219.957 | 5.313 | `nº-27-golden-dubai-25-ml` ✅ | 3,68 (113) |
| 14 | Nº 7 • Sublime Versailles - 25ml | R$ 212.811 | 4.866 | `no-7-sublime-versailles-copy-copy` ✅ ⚠️ **estoque 0** | — |
| 15 | Nº 6 • Gracieuse Cannes - 100ml | R$ 208.130 | 2.272 | `nº-6-gracieuse-cannes-copy` ✅ | — |
| 16 | Nº 7 • Sublime Versailles - 100ml | R$ 203.551 | 2.556 | `nº-7-sublime-versailles-copy` ✅ | — |
| 17 | Kit Trilogia Essencial 2+6+10 \| 100ml | R$ 190.271 | 717 | `kit-trilogia-essencial-nº-2-nº-6-nº-10-100ml` ✅ | 4,45 (33) |
| 18 | Nº 26 • Élegance Vienna - 25ml | R$ 183.183 | 4.921 | `nº-26-elegance-vienna-25-ml` ✅ | 4,66 (44) |
| 19 | Kit Quarteto Hits Femininos 2+6+7+8 | R$ 173.226 | 1.254 | `kit-trilogia-essencial-nº-2-nº-6-nº-10-25ml-copy` ✅ ⚠️ *handle enganoso* | 4,52 (62) |
| 20 | Nº 20 • Brise Amalfi - 25ml | R$ 171.309 | 3.575 | `nº-20-brise-amalfi-copia` ✅ | 4,11 (79) |
| 21 | Nº 10 • Belle Grasse - 100ml | R$ 160.911 | 1.642 | `nº-10-belle-grasse-100ml` ✅ | 4,61 (23) |
| 22 | Kit Quarteto Hits Masculinos 12+13+19+20 | R$ 147.288 | 1.113 | `kit-trilogia-essencial-masculina-nº-12-nº-13-nº-20-25ml-copy-3` ✅ | 3,90 (42) |
| 23 | Nº 5 • Douce Paris - 25ml | R$ 137.844 | 3.533 | `nº-5-douce-paris-copy-copy` ✅ | — |
| 24 | Nº 12 • Noble Nice - 100ml | R$ 135.297 | 1.553 | `nº-12-noble-nice-copy-copy` ✅ | 3,68 (31) |
| 25 | Kit Trilogia Nº 2+8+28 \| 25ml | R$ 133.348 | 1.553 | `caixa-kit-trilogia-no-2-no-8-no-28-25ml` ⚠️ **confirmar** | 4,00 (1) |
| 26 | Nº 13 • Féroce Provence - 25ml | R$ 113.528 | 2.475 | `nº-13-feroce-provence-copy` ✅ | 3,99 (73) |
| 27 | Kit Trilogia Ess.: Nº 2 100ml + 6 + 10 25ml | R$ 112.918 | 726 | `kit-trilogia-essencial-nº-2-100ml-nº-6-nº-10-25ml` ✅ | 4,14 (167) |
| 28 | Nº 6 • Gracieuse Cannes - 25ml | R$ 112.535 | 2.498 | `nº-6-gracieuse-cannes-copy-copy` ✅ | — |
| 29 | Nº 31 • Authentic Milano - 25ml | R$ 104.333 | 2.777 | `nº-31-authentic-milano-25ml` ✅ | 4,49 (37) |
| 30 | Kit Dueto Essencial Masculino 13+20 | R$ 104.308 | 1.468 | `kit-dueto-essencial-masculino-nº-13-nº-20-25ml` ✅ | 4,02 (43) |
| 31 | Nº 3 • Vivante Capri - 25ml | R$ 99.104 | 2.592 | `nº-3-vivante-capri-copy` ✅ | 3,86 (36) |
| 32 | Kit Trilogia Ess. Masc.: Nº 20 100ml + 12 + 13 | R$ 97.858 | 611 | `kit-trilogia-essencial-masculina-nº-20-100ml-nº-12-nº-13-25ml` ✅ | 4,13 (45) |
| 33 | Nº 10 • Belle Grasse - 25ml | R$ 91.365 | 1.998 | `nº-10-belle-grasse-25ml` ✅ | 4,54 (65) |
| 34 | Kit Trilogia Hit Feminino 22+24+28 | R$ 88.978 | 943 | `kit-trilogia-hit-feminino-nº-22-nº-24-nº-28-25ml` ✅ | 4,75 (57) |
| 35 | Kit Dueto Délicate Londres 2\|100 + 2\|25 | R$ 88.262 | 695 | `kit-dueto-delicate-londres-nº-2-100ml-nº-2-25ml` ✅ | 4,71 (14) |
| 36 | Nº 24 • Essence Bordeaux - 25ml | R$ 86.648 | 1.775 | `nº-24-essence-bordeaux-25-ml` ✅ | 4,26 (46) |
| 37 | Nº 11 • Unique Lyon - 25ml | R$ 83.175 | 1.811 | `no-11-unique-lyon-25ml` ✅ | 4,32 (38) |
| 38 | Nº 5 • Douce Paris - 100ml | R$ 82.054 | 862 | `nº-5-douce-paris-copy` ✅ | — |
| 39 | Kit Trilogia Nº 6+26+30 \| 25ml | R$ 78.265 | 925 | `kit-trilogia-nº-6-nº-26-nº-30-25ml` ✅ | 4,78 (9) |
| 40 | Nº 28 • Icon Copenhague - 25ml | R$ 77.862 | 1.626 | `no-28-icon-copenhague-25-ml` ✅ | 4,24 (38) |
| 41 | Nº 1 • Jolie Provence - 25ml | R$ 77.856 | 1.902 | ⚠️ **handle não localizado entre ativos** — resolver | — |
| 42 | Nº 29 • Royal Nottingham - 25ml | R$ 76.046 | 1.872 | `nº-29-royal-nottingham-25ml` ✅ | 3,91 (46) |
| 43 | Nº 22 • Mystique Veneza - 25ml | R$ 74.198 | 1.923 | `desodorante-col-n22-mystique-veneza-25-ml` ✅ ⚠️ *handle legado* | 4,62 (66) |

### 6.1 O problema dos produtos DRAFT no ranking

Os SKUs **"mestres"** (sem sufixo de volumetria: `Nº 2 • Délicate Londres`, `Nº 13 • Féroce Provence`, `Nº 6`, `Nº 10`, `Nº 5`, `Nº 1`, `Nº 3`, `Nº 12`, `Nº 20`, `Nº 4`, `Nº 7`, `Nº 8`, `Nº 9`, `Nº 11`, `Nº 14`–`Nº 21`) estão em **status DRAFT** com estoque enorme (Nº 13 tem 37.963 un.). Eles faturaram muito nos 90d e depois foram despublicados — a loja migrou pra **um produto por volumetria** (`- 25ml` / `- 100ml`).

**Regra pra todas as sessões:** enriquecer **apenas produtos `status: ACTIVE`**. Os DRAFT concentram tráfego histórico e ainda recebem sessões (o handle `poiret-et-fresia-...` teve **133.216 sessões**!) — vale checar com o time se há redirect configurado, mas **não gastar conteúdo neles**.

### 6.2 Catálogo ATIVO completo (fragrâncias unitárias) — 44 SKUs

| Nº | Nome | Gênero | 25ml (handle) | 100ml (handle) |
|---|---|---|---|---|
| 1 | Jolie Provence | F | ⚠️ não localizado | `nº-1-jolie-provence-copy-copy` |
| 2 | Délicate Londres | F | `nº-2-delicate-londres-copy` | `nº-2-delicate-londres` |
| 3 | Vivante Capri | Unissex | `nº-3-vivante-capri-copy` | `nº-3-vivante-capri-copy-copy` |
| 4 | Festive Miami | F | `nº-4-festive-miami-copy-copy` | `nº-4-festive-miami-copy` *(estoque 0)* |
| 5 | Douce Paris | F | `nº-5-douce-paris-copy-copy` | `nº-5-douce-paris-copy` |
| 6 | Gracieuse Cannes | F | `nº-6-gracieuse-cannes-copy-copy` | `nº-6-gracieuse-cannes-copy` |
| 7 | Sublime Versailles | F | `no-7-sublime-versailles-copy-copy` *(estoque 0)* | `nº-7-sublime-versailles-copy` |
| 8 | Intense Toulouse | F | `nº-8-intense-toulouse-copia` | `nº-8-intense-toulouse-copia-copia` |
| 9 | Magnétique New York | F | `nº-9-magnetique-new-york-copia` | `nº-9-magnetique-new-york-copia-copia` |
| 10 | Belle Grasse | F | `nº-10-belle-grasse-25ml` | `nº-10-belle-grasse-100ml` |
| 11 | Unique Lyon | F | `no-11-unique-lyon-25ml` | `nº-11-unique-lyon-copy` |
| 12 | Noble Nice | M | `nº-12-noble-nice-copy` | `nº-12-noble-nice-copy-copy` |
| 13 | Féroce Provence | M | `nº-13-feroce-provence-copy` | `nº-13-feroce-provence-copy-copy` |
| 14 | Brave Manhattan | M | `nº-14-brave-manhattan-copy` | `nº-14-brave-manhattan-copy-copy` |
| 15 | Résolu Lyon | M | `nº-15-resolu-lyon-copy` | — |
| 16 | Dynamique Le Mans | M | `nº-16-dynamique-le-mans-copy` | — |
| 17 | Sublime Monte-Carlo | M | `nº-17-sublime-monte-carlo-copy` | `nº-17-sublime-monte-carlo-copy-copy` |
| 18 | Essential Tokyo | M | `nº-18-essential-tokyo-copia` | `nº-18-essential-tokyo-copia-copia` |
| 19 | Brûlant Bordeaux | M | `no-19-brulant-bordeaux-25ml` | `nº-19-brulant-bordeaux-copy` |
| 20 | Brise Amalfi | M | `nº-20-brise-amalfi-copia` | `nº-20-brise-amalfi-copia-copia` |
| 21 | Luxe Saint-Tropez | M | `nº-21-luxe-saint-tropez-copia` | — |
| 22 | Mystique Veneza | F | `desodorante-col-n22-mystique-veneza-25-ml` | — |
| 23 | Legacy Lisboa | M | `nº-23-legacy-lisboa-25ml` | — |
| 24 | Essence Bordeaux | F | `nº-24-essence-bordeaux-25-ml` | — |
| 25 | Athletic Barcelona | M | `nº-25-athletic-barcelona-25-ml` | — |
| 26 | Élegance Vienna | F | `nº-26-elegance-vienna-25-ml` | — |
| 27 | Golden Dubai | M | `nº-27-golden-dubai-25-ml` | — |
| 28 | Icon Copenhague | F | `no-28-icon-copenhague-25-ml` | — |
| 29 | Royal Nottingham | M | `nº-29-royal-nottingham-25ml` | — |
| 30 | Provocateur Rio | F | `nº-30-provocateur-rio-25ml` | — |
| 31 | Authentic Milano | M | `nº-31-authentic-milano-25ml` | — |
| 33 | Opulence Geneva | M | `nº-33-opulence-geneva-25-ml` | — |
| 35 | Valiant Roma | M | `nº-35-valiant-roma-25-ml` | — |

**Linha Corpo ativa:** `body-splash-n-1` (estoque 0), `creme-desodorante-para-maos-nº-1-jolie-provence-brinde` (brinde), `caixa-de-presente-trios-25ml` (estoque 0).

**Kits ativos:** ~50 SKUs (duetos, trilogias, quartetos, sextetos, "Presente pra Ela/Ele/Casal", "Caixa + Kit"). Lista completa disponível via `products(query:"status:active", sortKey:TITLE)`.

### 6.3 ⚠️ Linha Elixir e Linha Árabe NÃO EXISTEM no catálogo ativo

O brandbook descreve **Linha Elixir** (Midnight Manhattan, Rosé Monaco, Essenza Portofino, Blush Grasse, Noir Mojave) e **Linha Árabe** (Ivory Muscat, Creamy Dubai, Oud Sahara, Midnight Abu Dhabi, Halo of Oman, Tender Anatolia, Energy of Istambul) como "waitlist". **Nenhum desses produtos aparece entre os ativos nem entre os drafts consultados.** Os handles listados no `produtos.csv` não foram confirmados.

→ **Não gerar conteúdo, blog ou CTA pra Elixir/Árabe sem confirmar com o time comercial.** Isso invalida os temas de blog #40–#45 do `blog-themes.md` por enquanto.

---

## 7. Descrições atuais dos produtos — diagnóstico de qualidade

### `descriptionHtml` (descrição nativa) — praticamente inexistente
```html
<!-- Nº 2 • Délicate Londres - 25ml -->
<p>aroma inspirado<strong> English Pear &amp; Freesia </strong>de <strong>Jo Malone</strong></p>
<p> </p><p><span>®️</span></p>
```
```html
<!-- Nº 13 • Féroce Provence - 25ml -->
<p>aroma inspirado por <strong>Sauvage</strong> de <strong>Dior</strong></p>
```
```html
<!-- Kit Trilogia Essencial (2+6+10) -->
(vazio)
```
Uma linha só, com erros de português ("aroma inspirado English Pear"), `®️` solto em parágrafo separado. **O `descriptionHtml` não é usado como bloco principal no PDP** (o tema usa `custom._v2_descri_o`), mas alimenta Google Shopping, feeds e alguns apps → merece limpeza.

### `custom.para_quem_essa_fragr_ncia_` — bom, tom certo, reaproveitável
```
Nº 2: "A fragrância Nº 2 (inspirado no perfume English Pear & Freesia de Jo Malone) é uma
mistura encantadora de frescor e suavidade. É perfeito para quem busca algo sofisticado,
mas suave e fácil de usar no dia a dia, evocando a sensação de um pomar inglês no início
do outono."

Nº 13: "Feito para o homem que carrega a força da natureza. Selvagem, misterioso e livre,
Provence é puro magnetismo masculino, ideal para quem não aceita limites."
```
✅ Tom alinhado ao brandbook. ⚠️ Nº 2 tem concordância errada ("é perfeito" pra "a fragrância") e Nº 13 tem espaço inicial. Os kits têm textos longos e bons (o Kit Trilogia tem ~1.400 caracteres bem escritos) — **reaproveitar como matéria-prima pro `_v2_descri_o`**.

### `custom.notas_e_ess_ncias` — muito bom, estrutura consistente
```
Nº 2:  "Ela abre com uma nota de pera fresca e suculenta... Com o toque floral da frésia...
        notas de fundo de patchouli e âmbar... uma recriação de English Peer & Freesia de Jo Malone."
Nº 13: "Explosivo desde o início, abre com bergamota e pimenta. O coração combina lavanda e
        gerânio com um fundo marcante de ambroxan e cedro..."
Nº 27: "Inicia com a riqueza do Açafrão e o toque delicado do Jasmim. O corpo é intensificado
        pelo Âmbar-gris e notas de Madeira/Cedro. A base de Resina de Abeto e Almíscar..."
Nº 26: "Começa com o floral romântico de Lírio-do-vale, Peônia e Íris... inspirada em Miss Dior de DIOR®."
Nº 30: "Abre com a doçura marcante da Gardênia. O coração envolvente do Mel... inspirada em Scandal de JP Gaultier."
Nº 31: "Abre com um frescor vibrante e moderno da Bergamota da Calábria... inspirada em My Self de YSL."
```
✅ Padrão topo→coração→fundo + referência ao final. **Esta é a fonte olfativa mais confiável da loja — use-a como base factual pra blogs e para o `product_ingredients` (§9).**
⚠️ Erros a corrigir: "English **Peer**" (→ Pear), "recriação de" (termo sensível — preferir "inspirada por"), "JP **Gaultier**" vs "Gautier" no CSV, uso inconsistente de `®` / `®️` / sem símbolo.
❌ **Kits não têm `notas_e_ess_ncias`** — é um gap: os 2 maiores SKUs da loja não têm bloco de notas.

### `custom.composicao` — parcial
✅ Presente: Nº 2 (25/100ml), Nº 26, Nº 27, Nº 30
❌ Ausente: **Nº 13 (25 e 100ml)**, Nº 31, Kit Trilogia Essencial, Kit Trilogia Gold
→ O accordion "COMPOSIÇÃO" fica vazio nesses PDPs. Conteúdo é INCI bilíngue (PT/EN).

### `collection.seo.description` — as poucas que existem são boas
```
femininos:  "Descubra a coleção Lescent de perfumes femininos! Aromas inspirados em
             fragrâncias de luxo como Jo Malone, Chanel e Delina. Encontre o seu!"
masculinos: "Encontre o seu perfume masculino ideal na Lescent! Aromas inspirados em
             fragrâncias de luxo como Sauvage, Bleu e Giò. Elegância e poder."
kits:       "Kits Lescent com os melhores perfumes femininos e masculinos! Aromas inspirados
             em Dior, Chanel, Jo Malone e mais. Presenteie ou experimente!"
```
Padrão: benefício + "Aromas inspirados em [marcas]" + CTA. **Replicar esse padrão nas 15 collections sem meta description.**
⚠️ Meta description do Nº 2 tem bug de encoding: `"Délicate Londres Nº 2pPerfume feminino..."` (o `p` sobrando é tag HTML vazada).

---

## 8. `produtos.csv` local está DEFASADO — o que corrigir

O arquivo `brand-context/lescent/produtos.csv` (61 linhas) tem problemas que **vão gerar CTAs quebrados**:

1. **Coluna `handle-shopify` vazia em 40 das 60 linhas** — e vários dos handles que existem estão errados:
   - `no-2-delicate-londres` → handle vazio, mas o real é `nº-2-delicate-londres-copy` (25ml) / `nº-2-delicate-londres` (100ml)
   - `kit-quarteto-hits-femininos` → aponta pra `kit-trilogia-essencial-nº-2-nº-6-nº-10-25ml-copy` ✅ (esse está certo, por sorte)
   - `no-4-festive-miami` → `nº-4-festive-miami-copy-copy` ✅
2. **Falta 1 coluna essencial:** o CSV não distingue 25ml de 100ml como SKUs separados, mas **a loja tem produtos separados por volumetria**. Precisa de `handle-25ml` e `handle-100ml`.
3. **19 fragrâncias ausentes ou sem nome:** Nº 1 Jolie Provence, Nº 3 Vivante Capri, Nº 5 Douce Paris, Nº 9 Magnétique New York, Nº 11 Unique Lyon, Nº 12 Noble Nice, Nº 15 Résolu Lyon, Nº 16 Dynamique Le Mans, Nº 17 Sublime Monte-Carlo, Nº 18 Essential Tokyo, Nº 19 Brûlant Bordeaux, Nº 21 Luxe Saint-Tropez, Nº 24 Essence Bordeaux, Nº 25 Athletic Barcelona, Nº 26 Élegance Vienna, Nº 29 Royal Nottingham, Nº 30 Provocateur Rio, Nº 33 Opulence Geneva, Nº 35 Valiant Roma *(alguns constam como `no-X` sem nome preenchido)*.
4. **Nº 14 Brave Manhattan** consta com referência "212 VIP Black — Carolina Herrera"; confirmar (o `Nº 9` é "Good Girl" e existe um produto `aroma-inspirado-por-212-vip-black-de-carolina-herrera` com 17.743 sessões).
5. **Elixir e Árabe** listados como `waitlist` com handles que não existem na loja (§6.3).
6. **Nº 32 e Nº 34** não existem no catálogo — numeração tem buracos (32, 34). Confirmar se são descontinuados.

**Ação sugerida (sessão dedicada):** regerar `produtos.csv` a partir da §6.2 deste doc + query `products(query:"status:active")`, com schema:
```csv
numero,nome,genero,linha,familia-olfativa,inspiracao,marca-referencia,handle-25ml,handle-100ml,status,rating,rating-count
```

---

## 9. Plano de enriquecimento recomendado

### 9.1 PDP — Onda 1 (top 40, tema atual, sem depender de dev)

Pra cada produto ACTIVE, preencher nesta ordem de impacto:

| Prioridade | Metafield | Formato | Fonte de matéria-prima |
|---|---|---|---|
| **P0** | `custom._v2_descri_o` | rich_text — bloco "Sobre o Produto" | Expandir `para_quem` + `notas_e_ess_ncias` existentes. 2–3 parágrafos curtos (mobile!). |
| **P0** | `custom._v2_descri_o_curta` | rich_text — bloco "Você vai amar!" | 1 frase de gancho, ~90 caracteres. Sobre fundo `#f3f3f3`, texto `#1c1c1c`. |
| **P1** | `custom.composicao` | multi_line — accordion "COMPOSIÇÃO" | INCI bilíngue. **Pedir ao time — não inventar.** |
| **P1** | `custom.notas_e_ess_ncias` **para KITS** | multi_line | Concatenar as notas dos 3–6 números do kit. |
| **P2** | `custom.product_ingredients_metafield` | list de metaobjetos `product_ingredients` | 3–4 notas-chave por fragrância, com `ingredient_title` + `ingredient_description` + `ingredient_image`. **Ou desativar a seção.** |
| **P2** | `descriptionHtml` | HTML | Corrigir o one-liner + português + `®️` inline. Alimenta feeds. |
| **P3** | `custom.info_lista_vertical_de_upsell` | metaobjeto | Curadoria de bundle por produto (hoje parcial). |

**⚠️ Decisão pendente sobre "Ingredientes Principais":** perfume não tem "ingrediente ativo" no sentido cosmético. Duas saídas: (a) renomear a seção pra "Notas Principais" e usar as notas olfativas (pede 1 ajuste de settings, sem código); (b) desativar a seção. **Precisa da sua definição.**

### 9.2 Collections — Onda 1 (6 collections)

Pra cada uma:
- `collection.description` — **1–2 frases, máx ~180 caracteres** (renderiza em branco sobre o banner escurecido, no mobile). Não escrever bloco de SEO longo aqui.
- `collection.seo.title` (hoje `null` em TODAS as 21) + `collection.seo.description` seguindo o padrão que já funciona (§7).
- `collection.image` para as 4 sem banner.

### 9.3 Blog — do zero

Blog `news` (GID `gid://shopify/Blog/112857219379`), **0 artigos**. Handle `news` — considerar renomear pra algo com valor de SEO (`blog`, `perfumaria`, `guias`) antes do primeiro post, porque mudar depois quebra URLs.

**Os 45 temas de `blog-themes.md` estão aprovados.** Reordenei por potencial baseado nos dados reais:

**Tier 1 — resolve a dor real do comprador (catálogo grande + navegação pobre):**
| Tema | Por quê |
|---|---|
#22 O sistema numérico Lescent: o que cada número significa | 44 SKUs, nenhum guia. Keyword de marca. |
#14 Os perfumes femininos mais amados (ranking) | `femininos` = 1,49M sessões |
#15 Os perfumes masculinos mais amados (ranking) | `masculinos` = 848k sessões |
#16 25ml ou 100ml: qual faz mais sentido? | Navegação por volumetria existe e é confusa |
#13 Como montar seu acervo começando do zero | Kits de 3× são os 2 maiores SKUs |
#10 Como escolher sua família olfativa por personalidade | Home tem 5 collections de família, todas sem conteúdo |

**Tier 2 — famílias olfativas (casam 1:1 com as collections vazias):**
#1 Famílias olfativas: guia completo · #5 Florais · #6 Amadeirados · #7 Aromáticos · #8 Orientais e gourmands · #9 Aquáticos

**Tier 3 — educação (AEO/GEO, formato de pergunta direta):**
#2 Pirâmide olfativa · #3 Fixação, projeção e sillage · #4 EDP vs EDT vs Parfum · #11 Perfume no verão vs inverno · #12 Matéria-prima importada · #23 O que é referência olfativa

**Tier 4 — referências (alto volume de busca, exige rigor de compliance):**
#24 Jo Malone → Nº 2 · #25 Sauvage Dior → Nº 13 · #26 Acqua di Giò → Nº 20 · #27 Coco Mademoiselle → Nº 6 · #28 Baccarat Rouge 540 → Nº 27 · #29 Delina → Nº 10 · #30 Erba Pura → Nº 23 · #32 Aventus → Nº 29 Royal Nottingham

**Tier 5 — presentes (sazonal, ~54 SKUs presenteáveis):**
#33–#39. Priorizar por calendário. **Dia dos Pais (ago) é o próximo** → #36.

**⛔ BLOQUEADOS:** #40–#45 (Elixir e Árabe) — produtos não existem na loja (§6.3). #31 (perfumes árabes) só se for editorial puro, sem CTA de produto.

**Novos temas sugeridos a partir dos dados (não estão no blog-themes.md — pedem sua aprovação):**
- "Kit de perfume vale a pena? Como escolher entre dueto, trilogia, quarteto e sexteto" — o mix da loja é dominado por kits e não existe conteúdo explicando a escada.
- "Perfume barato é ruim? O que muda entre R$39 e R$400" — responde a objeção central da persona e é formato AEO.
- "Perfume 25ml: para quem faz sentido o tamanho de bolso" — `fragrancias-de-25ml` + os SKUs de R$39–49 puxam o volume.

### 9.4 O que precisa de decisão sua antes de rodar

1. **Caminho A ou B** no schema de PDP (§4.5)?
2. **"Ingredientes Principais"**: renomear pra "Notas Principais" e preencher, ou desativar?
3. **Número oficial de clientes**: 50.000 ou 100.000?
4. **Frete grátis**: R$109 (home) ou R$249 (ícone do PDP)?
5. **INCI/composição**: quem fornece? (não vou inventar composição)
6. **Handle do blog**: manter `news` ou renomear antes do primeiro post?
7. **Criar `collection_tags`** na Lescent pra paridade com as outras marcas?
8. **`aquaticos` vs `aquaticos-1`**: qual é a canônica?

---

## 10. Regras operacionais para TODAS as sessões de enriquecimento Lescent

### 🔒 Regra inviolável #0 — persistir local antes de qualquer mutation
Ordem obrigatória (de `CLAUDE.md`):
1. `Write` → `conteudos/lescent/[tipo]/[entidade]/textos/*.{md,json}`
2. `Write` → `conteudos/lescent/[tipo]/[entidade]/conteudo-html/*.html` (se a mutation manda HTML)
3. `Write` → `conteudos/lescent/[tipo]/[entidade]/textos/shopify-payload.json`
4. **Só então** disparar mutations
5. Após sucesso → `Write` → `conteudos/lescent/[tipo]/[entidade]/shopify-result.json`

> A pasta `conteudos/lescent/` **ainda não existe** — esta será a primeira sessão a criá-la.

### Checklist de início de sessão
- [ ] `get-shop-info` → confirmar que a loja conectada é **LESCENT** (não Barbour's/By Samia/Ápice)
- [ ] Confirmar que o tema MAIN ainda é `lescent-theme/main` (GID `179492028723`) — se mudou, **reauditar §4.1**
- [ ] Revalidar handles dos produtos-alvo (a loja duplica produtos com frequência)
- [ ] Confirmar `status: ACTIVE` de cada produto antes de escrever
- [ ] Ler `brand-context/lescent/brandbook.md` §4 (tom de voz) e §8 (compliance)

### Compliance obrigatório em 100% do conteúdo
- ✅ "inspirado por [Nome]®️ de [Marca]®️" — sempre com `®️`
- ✅ Disclaimer de não-afiliação em PDP, banner principal e blog
- ✅ Disclaimer de fixação: *"A duração pode variar conforme tipo de pele, temperatura e região de aplicação."*
- ❌ "igual", "idêntico", "réplica", "clone", "imitação", "você não vai sentir diferença"
- ❌ Referência de luxo como headline/protagonista — **o produto Lescent vem primeiro**
- ❌ Duração em horas sem ressalva
- ❌ "exclusivo", "raro", "só para quem entende" (elitismo é antitético à marca)
- ❌ Claim terapêutico ou dermatológico
- ➕ Cruzar sempre com `brand-context/_shared/compliance-anvisa.md`

### Regras de formato (ditadas pelo tema e por 97% mobile)
- `collection.description`: **máx ~180 caracteres**, renderiza em branco sobre imagem
- `_v2_descri_o_curta`: **1 frase, ~90 caracteres**, fundo `#f3f3f3`
- `_v2_descri_o`: 2–3 parágrafos de 2–3 linhas cada
- Accordions (`para_quem`, `notas_e_ess_ncias`, `composicao`): `multi_line_text_field` — **texto puro, sem HTML**
- `_v2_*`: `rich_text_field` — exige JSON rich text do Shopify, não HTML
- Cores em HTML de blog: `#1C1C1C` (texto), `#F3F3F3` (fundo alt), `#8C5E3C` (destaque/cobre), `#272727` (corpo)
- Tabelas comparativas: máx 3 colunas + `overflow-x: auto`

### Não inventar, nunca
Faltando composição/INCI, fonte de claim, número de clientes atualizado, disponibilidade de Elixir/Árabe → **perguntar** (máx 3 perguntas/turno).

---

## 11. Queries de referência (copiar e colar em sessões futuras)

```graphql
# Top vendas 90d (ShopifyQL — run-analytics-query)
FROM sales SHOW net_sales, gross_sales, orders
GROUP BY product_title ORDER BY net_sales DESC LIMIT 50 SINCE -90d UNTIL today
# ⚠️ ordered_product_quantity e net_quantity NÃO existem nesta loja

# Tráfego de collections
FROM sessions SHOW sessions GROUP BY landing_page_path
ORDER BY sessions DESC LIMIT 60 SINCE -90d UNTIL today

# Best-sellers de uma collection COM handle real
query {
  collection(id: "gid://shopify/Collection/493463666995") {   # femininos
    products(first: 20, sortKey: BEST_SELLING) {
      nodes { handle title status totalInventory }
    }
  }
}

# Auditoria dos metafields que REALMENTE renderizam
fragment PDP on Product {
  handle title status
  insp:      metafield(namespace:"custom", key:"inspiracao") { value }
  paraquem:  metafield(namespace:"custom", key:"para_quem_essa_fragr_ncia_") { value }
  notas:     metafield(namespace:"custom", key:"notas_e_ess_ncias") { value }
  comp:      metafield(namespace:"custom", key:"composicao") { value }
  v2desc:    metafield(namespace:"custom", key:"_v2_descri_o") { value }
  v2curta:   metafield(namespace:"custom", key:"_v2_descri_o_curta") { value }
  ingr:      metafield(namespace:"custom", key:"product_ingredients_metafield") { value }
  badges:    metafield(namespace:"custom", key:"badges") { value }
}
query { p: productByIdentifier(identifier:{handle:"nº-2-delicate-londres-copy"}) { ...PDP } }

# Reauditar o template do PDP (se o tema mudar)
query {
  theme(id: "gid://shopify/OnlineStoreTheme/179492028723") {
    files(first: 1, filenames: ["templates/product.json"]) {
      nodes { body { ... on OnlineStoreThemeFileBodyText { content } } }
    }
  }
}
```

### GIDs úteis
| Recurso | GID |
|---|---|
| Tema MAIN | `gid://shopify/OnlineStoreTheme/179492028723` |
| Blog `news` | `gid://shopify/Blog/112857219379` |
| Collection `femininos` | `gid://shopify/Collection/493463666995` |
| Collection `masculinos` | `gid://shopify/Collection/493462847795` |
| Collection `kits` | `gid://shopify/Collection/492401525043` |
| Collection `kits-femininos` | `gid://shopify/Collection/493464060211` |
| Collection `kits-masculinos` | `gid://shopify/Collection/497980473651` |
| Collection `lancamentos` | `gid://shopify/Collection/500724924723` |
| Collection `lancamentos-femininos` | `gid://shopify/Collection/500923138355` |
| Collection `lancamentos-masculinos` | `gid://shopify/Collection/500923400499` |
| Collection `fragrancias-de-25ml` | `gid://shopify/Collection/499736052019` |
| Collection `25ml-femininos` | `gid://shopify/Collection/500187758899` |
| Collection `25ml-masculinos` | `gid://shopify/Collection/500187791667` |
| Collection `fragrancias-de-100ml` | `gid://shopify/Collection/500184285491` |
| Collection `100ml-femininos` | `gid://shopify/Collection/500187988275` |
| Collection `100ml-masculinos` | `gid://shopify/Collection/500187693363` |
| Collection `kits-presenteaveis` | `gid://shopify/Collection/500936540467` |
| Collection `outlet-lescent` | `gid://shopify/Collection/500194771251` |
| Collection `vitrine-home-mais-vendidos` | `gid://shopify/Collection/493908066611` |
| Collection `florais` | `gid://shopify/Collection/499897794867` |
| Collection `adocicados` | `gid://shopify/Collection/499898089779` |
| Collection `aquaticos` (9 prod) | `gid://shopify/Collection/499898155315` |
| Collection `aquaticos-1` (14 prod) | `gid://shopify/Collection/499973259571` |
| Collection `amadeirados` | `gid://shopify/Collection/499973128499` |
| Página "Não somos endossados" | `gid://shopify/Page/141681557811` |
| Página "Quem Somos" | `gid://shopify/Page/140858425651` |
| Página "Quiz Lescent" | `gid://shopify/Page/147074974003` |

---

📝 **Coletado:** 2026-07-30 · **Janela de analytics:** 2026-05-01 a 2026-07-30 (90d)
📝 **Revalidar antes de cada onda:** handles de produto, status ACTIVE/DRAFT, tema MAIN, template `product.json`.
