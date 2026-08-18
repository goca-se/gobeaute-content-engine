# Especificação de Metafields da PDP — `gogroup-shopify-theme` (Goshop)

> **Fonte**: definições reais de metafield/metaobject extraídas da loja **Rituária** (`rituaria.com.br`) via Admin API em 2026-06-09. Estes são os contratos que o tema deve consumir. Convenção Goshop.
>
> **Como o tema consome**: campos `metaobject_reference` / `list.metaobject_reference` precisam ser **resolvidos** (`reference`/`references`) pra ler os `fields` internos do metaobject. Campos de texto (`single_line_text_field`, `multi_line_text_field`, `rich_text_field`) são lidos direto. `rich_text_field` vem como JSON (schema `{type:"root",children:[...]}`) e precisa ser renderizado pra HTML.
>
> **Compliance**: todo campo de conteúdo (descrição, benefícios, eficácia, FAQ) é regido por `brand-context/_shared/compliance-anvisa.md`. Ver §9.

---

## 0. Mapa visual da PDP → metafield

```
┌─ CARD (listagem/coleção) ─────────────────┐
│  [Card] Tags  ······· custom.product_card_tags   (acima do título / sobre a imagem)
│  imagem + título + preço
└───────────────────────────────────────────┘

┌─ PDP (página do produto) ─────────────────┐
│  [Info] Tags ········ custom.product_tags        (bloco ACIMA do título)
│  TÍTULO DO PRODUTO
│  [Info] Subtítulo ··· custom.subtitulo           (bloco ABAIXO do título)
│  [Info] Descrição+Bullets · custom.product_info_benefits  (bloco ACIMA do preço)
│  PREÇO + [ COMPRAR ]
│  [Section] Trust Icons · custom.trust_icons      (bloco ABAIXO do botão)
│  ───────── sections (ordem definida no template) ─────────
│  [Section] Barras de Eficácia ··· custom.efficacy_results_list
│  [Section] Ativos / Ingredientes · custom.ativo
│  [Section] Como usar ············ custom.como_usar_session_pdp
│  [Section] FAQ PDP ·············· custom._faq_pdp_*  (campos fixos)
│  [Section] Blogs relacionados ··· (A CRIAR — ver §8)
└───────────────────────────────────────────┘
```

---

## 1. [Card] Tags — selo no card do produto

| Atributo | Valor |
|---|---|
| **Onde aparece** | Topo do **card** do produto (listagem/coleção), acima do título ou sobre a imagem (por setting do tema) |
| **Metafield** | `custom.product_card_tags` |
| **Type** | `metaobject_reference` (**1 único** — limite de 1 por produto) |
| **Metaobject** | `product_card_tags` (def `gid://shopify/MetaobjectDefinition/8682406179`) |
| **Nome no admin** | `[Card] Tags` |

**Campos do metaobject `product_card_tags`:**

| key | tipo | obrigatório | descrição |
|---|---|---|---|
| `content` | single_line_text_field | ✅ | texto do selo (ex: "MAIS VENDIDO") |
| `background_color` | color | ✅ | cor de fundo (hex) |
| `text_color` | color | ✅ | cor do texto (hex) |

> ℹ️ Existem metaobjects irmãos (`tag_de_card`, `tag_customizada`) com a mesma forma `texto + cor_fundo + cor_texto` — usados por features alternativas. O contrato oficial do card é **`product_card_tags`**.

---

## 2. [Info] Tags — tag(s) no topo da PDP (acima do título)

| Atributo | Valor |
|---|---|
| **Onde aparece** | Bloco na PDP **acima do título** |
| **Metafield** | `custom.product_tags` |
| **Type** | `list.metaobject_reference` (lista) |
| **Metaobject** | `product_tag` → nome admin "Product bullet point" (def `gid://shopify/MetaobjectDefinition/8585576739`) |
| **Nome no admin** | `[Info] Tags` |

**Campos do metaobject `product_tag`:**

| key | tipo | obrigatório | descrição |
|---|---|---|---|
| `content` | single_line_text_field | ✅ | texto da tag |
| `background_color` | color | ✅ | cor de fundo |
| `text_color` | color | ✅ | cor do texto |

---

## 3. [Info] Subtítulo — linha abaixo do título

| Atributo | Valor |
|---|---|
| **Onde aparece** | Bloco na PDP **abaixo do título** |
| **Metafield** | `custom.subtitulo` |
| **Type** | `single_line_text_field` (texto direto, sem metaobject) |
| **Nome no admin** | `[Info] Subtítulo` |
| **Conteúdo** | uma feature curta do produto (ex: "4 magnésios quelados numa só fórmula") |

---

## 4. [Info] Descrição curta + Bullet points — bloco acima do preço

> É o bloco da imagem de referência (lead + título destacado + bullets com emoji). **Já preenchido para os top 30 produtos da Rituária.**

| Atributo | Valor |
|---|---|
| **Onde aparece** | Bloco de info **acima do preço** |
| **Metafield** | `custom.product_info_benefits` |
| **Type** | `metaobject_reference` (**1 único**) |
| **Metafield def** | `gid://shopify/MetafieldDefinition/214846800163` |
| **Metaobject** | `product_benefit` (def `gid://shopify/MetaobjectDefinition/17684332835`) |
| **Nome no admin** | `[Info] Short Description + Bullet Points` |

**Campos do metaobject `product_benefit`:**

| key | tipo | obrigatório | descrição |
|---|---|---|---|
| `descricao` | rich_text_field | — | lead editorial de 1-2 frases |
| `titulo_destacado` | rich_text_field | — | título com destaque (bold) + emoji |
| `beneficios` | list.single_line_text_field | — | até 5 bullets, cada um com emoji semântico no início |
| `cor_bullet_point` | color | — | **convenção Goshop: deixar vazio** — o emoji carrega o visual |

**Exemplo (real, 4Mag 90 dias):**
```json
{
  "descricao": "{rich_text} Quatro formas de magnésio quelado numa só fórmula...",
  "titulo_destacado": "{rich_text bold} Magnésio completo num só ritual 🌙",
  "beneficios": [
    "💪 Músculos e nervos: auxilia no funcionamento muscular e do sistema nervoso",
    "⚡ Mais disposição: auxilia no metabolismo energético",
    "😌 Ritual de relaxar: promove a sensação de relaxamento",
    "💎 4 magnésios quelados: Malato, Bisglicinato, Citrato e Taurato",
    "🌿 Vegano e limpo: sem glúten, amido ou açúcar, em cápsula vegetal"
  ]
}
```

> ⚠️ Render: `beneficios` é lista de strings; o tema deve renderizar cada item como linha com check/emoji. `descricao` e `titulo_destacado` são rich_text JSON.

---

## 5. [Section] Trust Icons — selos abaixo do botão de compra

| Atributo | Valor |
|---|---|
| **Onde aparece** | Bloco **abaixo do botão de compra** (section "Brand features") |
| **Metafield** | `custom.trust_icons` |
| **Type** | `list.metaobject_reference` (lista; recomendado 3-4) |
| **Metaobject** | `trust_icons` (def `gid://shopify/MetaobjectDefinition/8863973667`) |
| **Nome no admin** | `[Section] Trust Icons` |

**Campos do metaobject `trust_icons`:**

| key | tipo | obrigatório | descrição |
|---|---|---|---|
| `icon` | file_reference | ✅ | ícone (imagem) |
| `title` | single_line_text_field | ✅ | título curto (ex: "Vegano") |
| `description` | single_line_text_field | ✅ | linha de apoio |

---

## 6. Sections de conteúdo

### 6.1 [Section] Barras de Eficácia (efficacy)

| Atributo | Valor |
|---|---|
| **Metafield** | `custom.efficacy_results_list` |
| **Type** | `list.metaobject_reference` |
| **Metaobject** | `efficacy_result` (def `gid://shopify/MetaobjectDefinition/8699085091`) |
| **Nome no admin** | `[Section] Barras de Eficácia` |

**Campos do metaobject `efficacy_result`:**

| key | tipo | obrigatório | descrição |
|---|---|---|---|
| `content` | single_line_text_field | ✅ | texto do resultado (ex: "Hidratação da pele") |
| `percentage` | number_integer | ✅ | valor 0-100 da barra |

> 🚨 **ANVISA**: `percentage` implica claim com **%** → exige fonte/comprovação. Não preencher sem laudo (ver §9).
>
> ℹ️ Existe também o metaobject `eficiencia_do_produto` (antes/depois + 3 números + 3 textos rich) para um layout de eficácia mais rico — usado por templates específicos.

### 6.2 [Section] Ativos / Ingredientes (ingredients)

| Atributo | Valor |
|---|---|
| **Metafield** | `custom.ativo` |
| **Type** | `metaobject_reference` (1 único) |
| **Metaobject** | `sess_o_ativos` (def `gid://shopify/MetaobjectDefinition/8930066723`) |
| **Nome no admin** | `[Section] Ativos` |

**Campos de `sess_o_ativos`:**

| key | tipo | obrigatório | descrição |
|---|---|---|---|
| `image` | file_reference | ✅ | imagem da seção |
| `ativo` | list.metaobject_reference → `ativos` | ✅ | lista de ativos |

**Campos de `ativos`:**

| key | tipo | obrigatório | descrição |
|---|---|---|---|
| `title` | single_line_text_field | ✅ | nome do ativo (ex: "Magnésio Bisglicinato") |
| `description` | multi_line_text_field | ✅ | o que comunica |

**Alternativas de ingredientes suportadas pelo tema:**
- `custom.ingredients` (`multi_line_text_field`, `[Info] Ingredientes`) — texto simples em collapsible.
- Metaobject `product_ingredients` (`ingredient_title`, `ingredient_image`, `ingredient_url`, `ingredient_description`) — cards de ingrediente. *(Confirmar binding de metafield de produto antes de usar; presente como definição de metaobject.)*

### 6.3 [Section] Como usar (how to use)

| Atributo | Valor |
|---|---|
| **Metafield** | `custom.como_usar_session_pdp` |
| **Type** | `metaobject_reference` (1 único) |
| **Metaobject** | `como_usar` (def `gid://shopify/MetaobjectDefinition/8929902883`) |
| **Nome no admin** | `[Section] Como usar` |

**Campos de `como_usar`:**

| key | tipo | obrigatório | descrição |
|---|---|---|---|
| `file` | file_reference | ✅ | imagem/vídeo do passo a passo |
| `steps` | list.single_line_text_field | ✅ | passos (1 string por passo) |

> Alternativa simples: `custom.how_to_use` (`multi_line_text_field`, `[Info] Modo de uso (short)`) em collapsible.

### 6.4 [Section] FAQ PDP (faq)

Padrão **atual** = campos fixos `rich_text_field` por pergunta (section "Goshop FAQ PDP"):

| Metafield (key) | Pergunta (nome admin) |
|---|---|
| `custom._faq_pdp_indicaco` | Qual o tamanho do frasco? Quanto dura? |
| `custom._faq_pdp_tecnologia` | Lactante pode usar? |
| `custom._faq_pdp_beneficios` | Gestante pode usar? |
| `custom._faq_pdp_resultados` | Quanto tempo para ver resultados? |
| `custom._faq_pdp_itens_inclusos` | Contraindicação |
| `custom.faq_pdp_essa_formula_quebra_o_jejum` | Essa fórmula quebra o jejum? |

> ⚠️ As **keys não batem com o rótulo** (legado): `_indicaco` = tamanho/duração, `_tecnologia` = lactante, `_beneficios` = gestante, `_itens_inclusos` = contraindicação. O tema deve mapear pela key, não pelo nome.
>
> **Alternativa dinâmica**: metaobject `faq_item` (`question` single_line, `answer` rich_text) para uma lista de perguntas livre. *(Requer um metafield `list.metaobject_reference` de produto apontando para `faq_item` — confirmar/criar binding.)*

### 6.5 [Section] Blogs relacionados (blogs) — **A CRIAR**

Não existe metafield de produto pra blogs relacionados hoje. **Proposta de contrato** pro tema:

| Atributo | Valor proposto |
|---|---|
| **Metafield** | `custom.pdp_related_articles` |
| **Type** | `list.metaobject_reference` |
| **Metaobject (novo)** | `pdp_article_card` |

**Campos propostos de `pdp_article_card`:**

| key | tipo | obrigatório | descrição |
|---|---|---|---|
| `title` | single_line_text_field | ✅ | título do artigo |
| `url` | url | ✅ | link `/blogs/novidades/<handle>` |
| `image` | file_reference | — | capa (16:9) |
| `eyebrow` | single_line_text_field | — | tag/categoria (ex: "Guia de compra") |
| `excerpt` | single_line_text_field | — | chamada curta |

> Alternativa mais simples (sem metaobject): `custom.pdp_related_article_handles` (`list.single_line_text_field`) com os handles dos artigos, e o tema resolve via Storefront/Liquid `articles`. Decisão de arquitetura pendente do time de tema.

---

## 7. Tabela de referência rápida

| # | Componente | Metafield (`namespace.key`) | Type | Metaobject | Def GID (metaobject) |
|---|---|---|---|---|---|
| 1 | [Card] Tags | `custom.product_card_tags` | metaobject_reference | `product_card_tags` | 8682406179 |
| 2 | [Info] Tags | `custom.product_tags` | list.metaobject_reference | `product_tag` | 8585576739 |
| 3 | [Info] Subtítulo | `custom.subtitulo` | single_line_text_field | — | — |
| 4 | [Info] Descrição+Bullets | `custom.product_info_benefits` | metaobject_reference | `product_benefit` | 17684332835 |
| 5 | [Section] Trust Icons | `custom.trust_icons` | list.metaobject_reference | `trust_icons` | 8863973667 |
| 6.1 | [Section] Eficácia | `custom.efficacy_results_list` | list.metaobject_reference | `efficacy_result` | 8699085091 |
| 6.2 | [Section] Ativos | `custom.ativo` | metaobject_reference | `sess_o_ativos` → `ativos` | 8930066723 / 8930... |
| 6.3 | [Section] Como usar | `custom.como_usar_session_pdp` | metaobject_reference | `como_usar` | 8929902883 |
| 6.4 | [Section] FAQ | `custom._faq_pdp_*` (6 campos) | rich_text_field | — (ou `faq_item`) | — |
| 6.5 | [Section] Blogs | `custom.pdp_related_articles` *(criar)* | list.metaobject_reference | `pdp_article_card` *(criar)* | — |

### Sections adjacentes já suportadas (fora do pedido, úteis pra PDP)
| Componente | Metafield | Metaobject |
|---|---|---|
| Destaque do produto | `custom.highlight_section` | `highlight_section` (title, description rich, image) |
| Rituária vs Concorrentes | `custom.rituaria_vs_concorrentes` | `rituaria_vs_concorrente` (content, boolean) |
| Composição do Kit | `custom.product_kit_list` | `product_kit` |
| Sugestões de produtos | `custom.horizontal_product_kit_list` | `product_with_bullet_points` |
| Checks de Qualidade | `custom.checks_de_qualidades` | `checks_de_qualidades_do_produto` |
| Overview | `custom.product_overview` | — (multi_line_text) |
| Vídeos (profissionais/clientes) | `custom.section_videos_*` | `carrossel_de_videos_*` |
| Prazos e entregas | `custom._info_prazos_e_entregas` | `prazos_e_entregas` |

---

## 8. Notas de implementação pro tema

1. **Resolução**: para todo `metaobject_reference`, o Liquid/Storefront deve acessar `product.metafields.custom.<key>.value` e resolver os `fields`. Em `list.metaobject_reference`, iterar `.value` (array de GIDs resolvidos).
2. **Rich text**: `descricao`, `titulo_destacado`, `answer`, `description` (highlight), `text_*` (eficiência), FAQ — vêm como JSON rich text. Usar o helper de render de rich text → HTML.
3. **Cores**: campos `color` retornam hex. Quando vazio (ex: `cor_bullet_point`), aplicar fallback do brandbook (Verde Sage `#9CAF88`, Mostarda `#AE8547`).
4. **Render condicional**: cada section só renderiza se o metafield tiver valor (degradar graciosamente quando ausente).
5. **Limites**: `product_card_tags` = 1; `product_info_benefits` = 1 metaobject; `beneficios` ≤ 5; `trust_icons` ideal 3-4.
6. **Imagens**: `file_reference` → resolver `image.url` (CDN). Card de produto/CTA usa a `featuredImage` do produto, nunca imagem gerada.

---

## 9. Compliance ANVISA (campos de conteúdo)

Regido por `brand-context/_shared/compliance-anvisa.md`. Aplica-se a `product_info_benefits`, `efficacy_result`, FAQ, `ativos`, `highlight_section`, `product_overview`.

- **Suplementos**: só alegação oficial do nutriente + substitutos aprovados. Sem "cura/trata/previne/emagrece", sem % ou tempo sem laudo.
- **Cosméticos**: "uniformiza o tom", "ação antissinais", "hidratação intensa"; nunca "clareia/remove/regenera/penetra na derme".
- **`efficacy_result.percentage`**: qualquer % exige comprovação. Sem fonte → não publicar.
- O tema **renderiza** o que vier; a responsabilidade do claim é de quem preenche o metafield. Ver memória `rituaria-compliance-airtight`.

---

*Gerado em 2026-06-09 a partir das definições reais da loja Rituária. Para outras marcas Gobeaute no mesmo tema, validar que namespaces/keys e def GIDs coincidem (metaobject definition IDs variam por loja; namespaces/keys/types tendem a ser padronizados).*
