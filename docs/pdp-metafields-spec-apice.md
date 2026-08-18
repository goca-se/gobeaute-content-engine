# Especificação de Metafields da PDP — Ápice (Goshop / convenção Gobeaute)

> **Fonte**: definições reais de metafield/metaobject extraídas da loja **Apice Cosmeticos** (`apicecosmeticos.com.br`) via Admin API em **2026-06-10**. Estes são os contratos que o tema da Ápice consome.
>
> **⚠️ Diferente da Rituária**: o doc `pdp-metafields-spec-gogroup-theme.md` foi extraído da Rituária e **NÃO se aplica à Ápice** — as keys, os metaobjects e até a forma dos campos divergem na maioria dos componentes. Use **este** doc pra Ápice.
>
> **Convenção compartilhada**: a Ápice usa a mesma convenção de metafields/metaobjects da **Kokeshi** (padrão de grupo Gobeaute — note o metaobject `gobeaute_vs_concorrente`, não `rituaria_vs_*`). Os **def GIDs de metaobject variam por loja**; namespaces/keys/types tendem a coincidir entre Ápice e Kokeshi. Sempre revalidar GIDs por loja antes de mutation.
>
> **Como o tema consome**: campos `metaobject_reference` / `list.metaobject_reference` precisam ser **resolvidos** (`reference`/`references`) pra ler os `fields` internos. Texto (`single_line_text_field`, `multi_line_text_field`) é lido direto. `rich_text_field` vem como JSON (`{type:"root",children:[...]}`) e precisa ser renderizado pra HTML.
>
> **Compliance**: todo campo de conteúdo é regido por `brand-context/_shared/compliance-anvisa.md`. Ver §9.

---

## 0. Mapa visual da PDP → metafield (Ápice)

```
┌─ CARD (listagem/coleção) ─────────────────┐
│  [Card] Tags ··········· custom.product_tags        → product_card_tags
│  [Card] Tag Customizada · custom.tag_customizada    → tag_customizada (com cores)
│  [Card] Short Desc ····· custom.short_description   (single_line, texto)
│  imagem + título + preço
└───────────────────────────────────────────┘

┌─ PDP (página do produto) ─────────────────┐
│  [Info] Tags ··········· custom.product_bullet_point_metafield → product_bullet_point
│  TÍTULO DO PRODUTO
│  [Info] Subtítulo ······ custom.subtitulo           (single_line, texto)
│  [Info] Desc+Bullets ··· custom.product_info_benefits → product_benefit
│  PREÇO + [ COMPRAR ]
│  [Section] Trust Icons · custom.trust_icons         → trust_icons
│  [Product Info] Ícones · custom.product_icons       → product_icon (máx 3)
│  ───────── sections (ordem definida no template) ─────────
│  [Info] Descrição ······ custom.descricao           (rich_text, direto)
│  [Info] Composição ····· custom.composicao          (multi_line, direto)
│  [Info] Modo de Uso ···· custom.modo-de-uso         (multi_line, direto)
│  [Section] Eficácia ···· custom.section_efficacy    → section_efficacy_item
│  [Section] Ingredientes  custom.product_ingredients_metafield → product_ingredients
│  [Section] Como Usar ··· custom.how_to_use_pdp      → video_tutorial_how_to_use
│  [Section] FAQ ········· custom.section_faq         → faq_item   (CANÔNICO)
└───────────────────────────────────────────┘
```

---

## 1. Mapa dos 7 formatos do `pdp-content` → contrato Ápice

| Formato (skill) | Metafield (`namespace.key`) | Nome no admin | Type | Metaobject (def GID) |
|---|---|---|---|---|
| **descricao** | `custom.descricao` | [Info] Descrição | `rich_text_field` | — (texto direto) |
| **descricao** (composição) | `custom.composicao` | [Info] Composição | `multi_line_text_field` | — (texto direto) |
| **descricao** (uso) | `custom.modo-de-uso` | [Info] Modo de Uso | `multi_line_text_field` | — (texto direto) |
| **bullets** | `custom.product_info_benefits` | [Info] Short Description + Bullet Points | `metaobject_reference` (1) | `product_benefit` (**12314738910**) |
| **icones** | `custom.product_icons` | [Product Info] Ícones de produto | `list.metaobject_reference` (máx 3) | `product_icon` (**13642531038**) |
| **section-efficacy** | `custom.section_efficacy` | [Section] Eficácia — PDP | `list.metaobject_reference` | `section_efficacy_item` (**14452523230**) |
| **faq** | `custom.section_faq` | [Section] FAQ | `list.metaobject_reference` | `faq_item` (**12728139998**) |
| **como-usar** | `custom.how_to_use_pdp` | [Section] Como Usar - PDP | `metaobject_reference` (1) | `video_tutorial_how_to_use` (**12640944350**) |
| **ingredientes** | `custom.product_ingredients_metafield` | [Section] Ingredientes | `list.metaobject_reference` | `product_ingredients` (**4237787358**) |

---

## 2. Card / topo da PDP

### 2.1 [Card] Tags
| Atributo | Valor |
|---|---|
| **Metafield** | `custom.product_tags` (def `1182...`→ id `48704258270`) |
| **Type** | `list.metaobject_reference` |
| **Metaobject** | `product_card_tags` (**4287955166**) |

**Campos de `product_card_tags`:**

| key | tipo | obrig. | descrição |
|---|---|---|---|
| `tag_name` | single_line_text_field | ✅ | texto do selo (ex: "MAIS VENDIDO") |

> ⚠️ Na Ápice o `product_card_tags` **não tem cores** (só `tag_name`). Pra selo com cor de fundo/texto, usar `custom.tag_customizada`.

### 2.2 [Card] Tag Customizada (acima do título)
| Atributo | Valor |
|---|---|
| **Metafield** | `custom.tag_customizada` (id `138309796062`) |
| **Type** | `list.metaobject_reference` |
| **Metaobject** | `tag_customizada` (**12211192030**) |

**Campos de `tag_customizada`:**

| key | tipo | obrig. | descrição |
|---|---|---|---|
| `texto` | single_line_text_field | ✅ | texto da tag |
| `cor_do_texto` | color | — | hex do texto |
| `cor_de_fundo` | color | — | hex de fundo |
| `tamanho_da_fonte` | number_integer | — | tamanho da fonte |

### 2.3 [Card] Short Description
| Metafield | Type |
|---|---|
| `custom.short_description` (id `48800825566`) | `single_line_text_field` — texto direto |

### 2.4 [Info] Tags (acima do título, na PDP)
| Atributo | Valor |
|---|---|
| **Metafield** | `custom.product_bullet_point_metafield` (id `49682514142`) |
| **Type** | `list.metaobject_reference` |
| **Metaobject** | `product_bullet_point` (**4405526750**) |

**Campos de `product_bullet_point`:**

| key | tipo | obrig. | descrição |
|---|---|---|---|
| `point_text` | single_line_text_field | ✅ | texto da tag |
| `point_color` | color | — | cor do texto |
| `point_background_color` | color | — | cor de fundo |

### 2.5 [Info] Subtítulo
| Metafield | Type |
|---|---|
| `custom.subtitulo` (id `1093927134`) | `single_line_text_field` — texto direto, abaixo do título |

---

## 3. [Info] Descrição + Bullet points (bloco acima do preço)

| Atributo | Valor |
|---|---|
| **Metafield** | `custom.product_info_benefits` (id `139456479454`) |
| **Type** | `metaobject_reference` (**1 único**) |
| **Metaobject** | `product_benefit` (**12314738910**) |
| **Nome no admin** | [Info] Short Description + Bullet Points |

**Campos de `product_benefit`:**

| key | tipo | obrig. | descrição |
|---|---|---|---|
| `descricao` | rich_text_field | — | lead editorial de 1-2 frases |
| `titulo_destacado` | rich_text_field | — | título com destaque (bold) + emoji |
| `beneficios` | list.single_line_text_field | — | até 5 bullets, emoji semântico no início |
| `cor_bullet_point` | color | — | **convenção Goshop: deixar vazio** — emoji carrega o visual |

> ✅ Mesma forma da Rituária. **GID do metaobject difere** (Ápice = 12314738910; Rituária = 17684332835).

---

## 4. [Section] Trust Icons (abaixo do botão)

| Atributo | Valor |
|---|---|
| **Metafield** | `custom.trust_icons` (id `143256223966`) |
| **Type** | `list.metaobject_reference` (ideal 3-4) |
| **Metaobject** | `trust_icons` (**12639273182**) |

**Campos de `trust_icons`:**

| key | tipo | obrig. | descrição |
|---|---|---|---|
| `icon` | file_reference | ✅ | ícone (imagem) |
| `title` | single_line_text_field | ✅ | título curto (ex: "Vegano") |
| `description` | **rich_text_field** | ✅ | linha de apoio (na Ápice é rich_text, ≠ Rituária que era single_line) |

---

## 5. [Product Info] Ícones de produto (`icones`)

| Atributo | Valor |
|---|---|
| **Metafield** | `custom.product_icons` (id `153798770910`) |
| **Type** | `list.metaobject_reference` (**máx 3** — `list.max=3`) |
| **Metaobject** | `product_icon` (**13642531038**) |

**Campos de `product_icon`:**

| key | tipo | obrig. | descrição |
|---|---|---|---|
| `imagem` | file_reference | ✅ | ícone (imagem) |
| `texto` | single_line_text_field | ✅ | label curto do ícone |

---

## 6. Sections de conteúdo

### 6.1 [Section] Eficácia — PDP (`section-efficacy`)
| Atributo | Valor |
|---|---|
| **Metafield** | `custom.section_efficacy` (id `161850261726`) |
| **Type** | `list.metaobject_reference` |
| **Metaobject** | `section_efficacy_item` (**14452523230**) |

**Campos de `section_efficacy_item`:**

| key | tipo | obrig. | descrição |
|---|---|---|---|
| `number` | **single_line_text_field** | ✅ | o número/destaque (ex: "92%", "2x") — **texto livre, não numérico** |
| `text` | single_line_text_field | ✅ | descrição do resultado |
| `footnote` | single_line_text_field | — | rodapé/fonte do dado |
| `icon` | file_reference | — | ícone do card |
| `background_image` | file_reference | — | imagem de fundo do card |
| `state` | single_line_text_field | — | flag de estado/visibilidade |

> 🚨 **ANVISA**: `number` aceita string livre, mas qualquer **%** ou claim de eficácia exige fonte/laudo no `footnote`. Sem comprovação → não publicar (ver §9). Diferente da Rituária, não há campo `percentage` numérico que force a barra.

### 6.2 [Section] Ingredientes (`ingredientes`)
| Atributo | Valor |
|---|---|
| **Metafield** | `custom.product_ingredients_metafield` (id `48298361054`) |
| **Type** | `list.metaobject_reference` |
| **Metaobject** | `product_ingredients` (**4237787358**) |

**Campos de `product_ingredients`:**

| key | tipo | obrig. | descrição |
|---|---|---|---|
| `ingredient_title` | single_line_text_field | ✅ | nome do ativo |
| `ingredient_description` | rich_text_field | ✅ | o que comunica |
| `ingredient_image` | file_reference | — | imagem do ativo |
| `ingredient_url` | url | — | link (ex: PDP de fonte) |

> ⚠️ Diferente da Rituária (`custom.ativo` → `sess_o_ativos`→`ativos`). Na Ápice é a lista `product_ingredients` direto.

### 6.3 [Section] Como Usar (`como-usar`)
| Atributo | Valor |
|---|---|
| **Metafield** | `custom.how_to_use_pdp` (id `143278145758`) |
| **Type** | `metaobject_reference` (1 único) |
| **Metaobject** | `video_tutorial_how_to_use` (**12640944350**) |

**Campos de `video_tutorial_how_to_use`:**

| key | tipo | obrig. | descrição |
|---|---|---|---|
| `titulo` | single_line_text_field | ✅ | título da seção |
| `topicos` | list.single_line_text_field | ✅ | passos (1 string por passo) |
| `media` | file_reference | — | vídeo/imagem do passo a passo |

> ⚠️ Diferente da Rituária (`como_usar`: file+steps). Na Ápice o metaobject é `video_tutorial_how_to_use` (titulo + topicos + media). Alternativa simples em texto: `custom.modo-de-uso` (multi_line).

### 6.4 [Section] FAQ (`faq`)
| Atributo | Valor |
|---|---|
| **Metafield (CANÔNICO)** | `custom.section_faq` (id `155390279902`) |
| **Type** | `list.metaobject_reference` |
| **Metaobject** | `faq_item` (**12728139998**) |

**Campos de `faq_item`:**

| key | tipo | obrig. | descrição |
|---|---|---|---|
| `titulo` | single_line_text_field | ✅ | pergunta |
| `conteudo` | rich_text_field | ✅ | resposta (rich text) |
| `state` | single_line_text_field | — | flag de estado/visibilidade |

> ℹ️ **3 metafields de FAQ existem na Ápice** — usar **`custom.section_faq`** (decisão do time):
> - `custom.section_faq` "[Section] FAQ" → `faq_item` ← **CANÔNICO da PDP**
> - `custom.faq_pdp` "[Section - PDP] FAQ" → `faq_item` (mesmo metaobject; legado/duplicado — **não usar**)
> - `custom.faq` "FAQ" → `faq_point` (metaobject antigo: `faq_question`/`faq_answer`/`faq_image` — **não usar**)

---

## 7. Sections adjacentes já suportadas (fora dos 7 formatos)

| Componente | Metafield | Metaobject (def GID) |
|---|---|---|
| Ápice vs Concorrente | *(sem binding de produto visto)* | `gobeaute_vs_concorrente` (**12748325086**): identificador, gobeaute (list), concorrente (list) |
| Composição do Kit | `custom.product_kit_composition` | `kit_composition` (12684263646) / `product_kit_composition_metaobject` (4364697822) |
| Goshop Composição de Kit | `custom.goshop_product_kit_composition` | — |
| Lista vertical de upsell | `custom.info_lista_vertical_de_upsell` | `upsell_em_lista_vertical` (8557330654) |
| Upsell Banner | `custom._all_fields_upsell_banner_` | `upsell_banner` (6636437726) |
| Temporizador Promocional | `custom.temporizador_promocional` | `temporizador_promocional` (10618503390): titulo, final (date) |
| Barra de Estoque | `custom.barra_de_estoque` | `barra_de_estoque` (10618568926) |
| Tamanho | `custom.size` | `product_size` (4827316446) |
| [FILTRO] Tipo de produto | `custom.product_type` | `product_type` (7732789470) |
| [FILTRO] Linha de produtos | `custom.product_line` | `product_line` (12924289246) |
| [FILTRO] Tipo de cabelo | `custom.hair_type` | `hair_type` (12058525918) |
| [FILTRO] Kit ou unitário | `custom.kit_or_single` | `kit_or_single` (12058689758) |
| Condição Capilar | `custom.condi_o_capilar` | `condicao_capilar` (4866113758) |
| Pré-lançamento | `custom.pre_lancamento` | — (number_integer) |
| Estoque mínimo | `custom.estoque_minimo` | — (number_integer) |
| Estoque reposto | `custom.was_restocked` | — (boolean) |

---

## 8. Tabela de referência rápida (Ápice)

| # | Componente | Metafield (`namespace.key`) | Type | Metaobject | Def GID |
|---|---|---|---|---|---|
| 1 | [Card] Tags | `custom.product_tags` | list.metaobject_reference | `product_card_tags` | 4287955166 |
| 2 | [Card] Tag Customizada | `custom.tag_customizada` | list.metaobject_reference | `tag_customizada` | 12211192030 |
| 3 | [Info] Tags | `custom.product_bullet_point_metafield` | list.metaobject_reference | `product_bullet_point` | 4405526750 |
| 4 | [Info] Subtítulo | `custom.subtitulo` | single_line_text_field | — | — |
| 5 | [Info] Descrição | `custom.descricao` | rich_text_field | — | — |
| 6 | [Info] Composição | `custom.composicao` | multi_line_text_field | — | — |
| 7 | [Info] Modo de Uso | `custom.modo-de-uso` | multi_line_text_field | — | — |
| 8 | [Info] Desc+Bullets | `custom.product_info_benefits` | metaobject_reference | `product_benefit` | 12314738910 |
| 9 | [Section] Trust Icons | `custom.trust_icons` | list.metaobject_reference | `trust_icons` | 12639273182 |
| 10 | [Product Info] Ícones | `custom.product_icons` | list.metaobject_reference (máx 3) | `product_icon` | 13642531038 |
| 11 | [Section] Eficácia | `custom.section_efficacy` | list.metaobject_reference | `section_efficacy_item` | 14452523230 |
| 12 | [Section] Ingredientes | `custom.product_ingredients_metafield` | list.metaobject_reference | `product_ingredients` | 4237787358 |
| 13 | [Section] Como Usar | `custom.how_to_use_pdp` | metaobject_reference | `video_tutorial_how_to_use` | 12640944350 |
| 14 | [Section] FAQ | `custom.section_faq` | list.metaobject_reference | `faq_item` | 12728139998 |

---

## 8b. Divergências Ápice ✗ Rituária (atenção ao migrar conteúdo)

| Componente | Rituária | Ápice |
|---|---|---|
| [Info] Tags | `custom.product_tags` → `product_tag` (com cores) | `custom.product_bullet_point_metafield` → `product_bullet_point` |
| [Card] Tags | `custom.product_card_tags` (texto+2 cores) | `custom.product_tags` → `product_card_tags` (só `tag_name`) |
| Eficácia | `custom.efficacy_results_list` → `content`+`percentage` (int) | `custom.section_efficacy` → `number` (texto)+`text`+`footnote` |
| FAQ | `custom._faq_pdp_*` (6 campos fixos rich) | `custom.section_faq` → `faq_item` (dinâmico) |
| Como usar | `custom.como_usar_session_pdp` → `como_usar` (file+steps) | `custom.how_to_use_pdp` → `video_tutorial_how_to_use` (titulo+topicos+media) |
| Ingredientes | `custom.ativo` → `sess_o_ativos`→`ativos` | `custom.product_ingredients_metafield` → `product_ingredients` |
| Trust icons `description` | single_line | rich_text |
| vs Concorrentes | `rituaria_vs_concorrente` | `gobeaute_vs_concorrente` |

---

## 9. Compliance ANVISA (campos de conteúdo)

Regido por `brand-context/_shared/compliance-anvisa.md`. Aplica-se a `product_info_benefits`, `section_efficacy_item`, `faq_item`, `product_ingredients`, `descricao`.

- **Cosméticos** (perfil Ápice): "uniformiza o tom", "ação antissinais", "hidratação intensa"; nunca "clareia/remove/regenera/penetra na derme".
- **Suplementos** (se houver): só alegação oficial do nutriente + substitutos aprovados. Sem "cura/trata/previne/emagrece", sem % ou tempo sem laudo.
- **`section_efficacy_item.number`**: aceita string livre — qualquer % ou claim de eficácia exige comprovação no `footnote`. Sem fonte → não publicar.
- O tema **renderiza** o que vier; a responsabilidade do claim é de quem preenche o metafield. Ver memória `rituaria-compliance-airtight`.

---

## 10. Notas de implementação

1. **Resolução**: para `metaobject_reference`, acessar `product.metafields.custom.<key>.value` e resolver os `fields`. Em `list.metaobject_reference`, iterar `.value` (array de GIDs).
2. **Rich text**: `descricao`, `titulo_destacado`, `conteudo` (faq), `description` (trust_icons), `ingredient_description` — vêm como JSON rich text → renderizar pra HTML.
3. **`state`**: vários metaobjects da Ápice (`faq_item`, `section_efficacy_item`) têm campo `state` — flag de visibilidade/estado; respeitar no render.
4. **Render condicional**: cada section só renderiza se o metafield tiver valor (degradar graciosamente quando ausente).
5. **Limites**: `product_info_benefits` = 1; `product_icons` ≤ 3; `beneficios` ≤ 5; `trust_icons` ideal 3-4.
6. **Imagens**: `file_reference` → resolver `image.url` (CDN). Card de produto/CTA usa a `featuredImage`, nunca imagem gerada.
7. **🔒 Regra inviolável #0**: salvar conteúdo em `conteudos/apice/...` ANTES de qualquer mutation Shopify (`metaobjectCreate`, `metafieldsSet`, etc.). Ver CLAUDE.md.

---

*Gerado em 2026-06-10 a partir das definições reais da loja Apice Cosmeticos. Contrato compartilhado com a Kokeshi (convenção Gobeaute/Goshop). Metaobject def GIDs variam por loja — revalidar por loja antes de mutation.*
