# By Samia — auditoria dos 7 metafields de PDP contra o tema `develop`

Loja: `www.bysamia.com.br`
Tema auditado: **`by-samia-theme/develop`** (`gid://shopify/OnlineStoreTheme/198616481873`, UNPUBLISHED, v3.5.1, atualizado 2026-07-29T20:14Z)
Data: **2026-07-29**

> Auditado contra o **develop**, não contra o MAIN. O develop tem sections novas (`product-features`, `product-how-to-use`, `active-ingredients`, blocos `jump-*`) que não existem no MAIN e que leem chaves diferentes.

## Resultado — cada metafield vs. o que o Liquid realmente acessa

| # | Metafield | Existe? | Arquivo do tema que lê | Chaves que o tema acessa | Metaobjeto ligado | Bate? |
|---|---|:--:|---|---|---|:--:|
| 1 | `custom.product_info_benefits` | ✅ | `snippets/jump-product-info-benefits.liquid` | `.descricao`, `.titulo_destacado`, `.beneficios`, `.cor_bullet_point` | `product_benefit` (36550705233) | ✅ |
| 2 | `custom.trust_icons` | ✅ | `sections/product-features.liquid` | `item.icon`, `item.title`, `item.description` | `trust_icons` (10343317585) | ⚠️ |
| 3 | `custom.how_to_use_pdp` | ✅ | `sections/goshop-how-to-use-pdp.liquid` | `.media`, `.topicos`, `.titulo` | `video_tutorial_how_to_use` (40808284241) | ✅ |
| 4 | `custom.product_ingredients_metafield` | ✅ | `sections/goshop-product-ingredients.liquid` | `.ingredient_title`, `.ingredient_image`, `.ingredient_url`, `.ingredient_description` | `product_ingredients` (37269897297) | ✅ |
| 5 | `custom.composicao` | ✅ | `snippets/jump-info-faq.liquid` | valor direto (`rich_text_field`) | — | ✅ |
| 6 | `custom['modo-de-uso']` | ✅ | `snippets/jump-info-faq.liquid` | valor direto (`rich_text_field`) | — | ⚠️ |
| 7 | `custom.faq` | ❌ **FALTAVA** | `snippets/jump-info-faq.liquid` | `item.faq_question`, `item.faq_answer`, `item.faq_image` | `faq_point` (**criado nesta sessão**) | ✅ |

**6 de 7 já existiam e batem.** Só o `custom.faq` faltava — foi criado (ver §"O que foi criado").

### Notas por item

**#2 `trust_icons`** — funciona, mas o comentário do próprio arquivo documenta `description` como *Multi-line text* e o metaobjeto da By Samia tem `single_line_text_field`. O tema aplica `| escape | newline_to_br`, ou seja, espera quebras de linha que um campo single-line não consegue guardar. Ajuste opcional.

**#5/#6 `composicao` e `modo-de-uso`** — o snippet trata explicitamente os dois casos (texto puro *ou* `rich_text_field`), roteando rich text por `metafield_tag`. A By Samia tem os dois como `rich_text_field` → caminho correto.
Ressalva no `modo-de-uso`: o tema faz `metafield_tag | strip_html` e depois `split: '.'` para numerar os passos. Formatação rica é descartada, e qualquer abreviação com ponto ("Aplique 2 ml. na raiz" ou "Dr.") gera passo fantasma.

**#7 `custom.faq`** — o tema itera a lista e acessa `faq_question` / `faq_answer` / `faq_image`. O `faq_item` que já existia na By Samia (36911349841) tem `question`/`answer` — **não serve**, renderizaria vazio. O shape correto é o `faq_point`, convenção já registrada em [`../pdp-metafields-spec-apice.md`](../pdp-metafields-spec-apice.md) §6.4.

## 🚩 Bug encontrado fora da lista — `custom.how_to_use`

`sections/product-how-to-use.liquid` (section nova do develop) faz:

```liquid
assign data = product.metafields.custom.how_to_use.value
assign media_file = data.file.value
assign steps = data.steps.value
```

Espera um **`metaobject_reference` para um metaobjeto com `file` + `steps`** — que é exatamente o `como_usar` (10343415889, 47 instâncias).

Na By Samia, `custom.how_to_use` está criado como **`multi_line_text_field`** ("[Info] Modo de uso (short)", pin 3). **A section nunca vai renderizar.** O metaobjeto `como_usar` está amarrado em outra chave (`custom.como_usar_session_pdp`).

**Não corrigi**: type de metafield definition é imutável — exigiria `metafieldDefinitionDelete` + recriar, e o delete apaga os valores já preenchidos nos produtos. Decisão de vocês:
- **(a)** apagar `custom.how_to_use` e recriar como `metaobject_reference` → `como_usar` (perde os textos curtos já salvos), ou
- **(b)** o tema passar a ler `custom.como_usar_session_pdp`, que já está correto e populado.

A **(b)** é mais barata e não destrói dado.

## 🚩 Outras bandeiras (não corrigidas)

1. **`custom.section_faq` está órfão** — aponta pra `faq_item`, que tem **0 instâncias**, e nenhum arquivo do develop lê essa chave.
2. **Os 6 `custom._faq_pdp_*` estão órfãos** — `rich_text_field` com pergunta fixa no nome (`[FAQ-PDP] Lactante Pode Usar?` etc). A section `goshop-faq-pdp.liquid` monta o FAQ por blocos do editor, não por metafield.
3. **`custom.ativo` → `sess_o_ativos`** está correto e é o que `sections/active-ingredients.liquid` lê — não confundir com `product_ingredients_metafield`, que alimenta a section `goshop-product-ingredients.liquid`. **São duas sections de ingrediente diferentes, com dados diferentes.**
4. **Acesso storefront inconsistente** — `como_usar_session_pdp`, `ingredients` e vários outros estão com `storefront: NONE`. Liquid lê de qualquer forma; só afeta Storefront API/headless.
5. **`upsell_banner` da By Samia diverge da Barbour's** (`titulo_descricao` vs `bullet_points_title`) — conteúdo não é portável direto entre as duas.

## O que foi criado nesta sessão

Payload em `bysamia-faq-payload.json`, GIDs resultantes em `bysamia-faq-result.json`.

### `faq_point` (metaobject definition)

| key | tipo | obrigatório | por quê |
|---|---|:--:|---|
| `faq_question` | `single_line_text_field` | ✅ | vira o `<label>` do acordeão / a aba |
| `faq_answer` | `multi_line_text_field` | ✅ | impresso cru dentro de `<p>` |
| `faq_image` | `file_reference` (Image) | — | thumb 35×35 opcional ao lado da pergunta |

`displayNameKey: faq_question` · `publishable: true` · `translatable: true` · storefront `PUBLIC_READ`.

> **Por que `multi_line_text_field` e não `rich_text_field`:** o tema imprime `{{ item.faq_answer }}` cru — sem `.value` e sem `metafield_tag`. O próprio arquivo avisa em comentário que rich text impresso pelo caminho errado despeja a árvore de nós (`{"type"=>"root", ...}`) na tela. Texto puro renderiza igual pelos dois caminhos, então é a escolha à prova de falha. Se o time do tema trocar para `{{ item.faq_answer | metafield_tag }}`, dá pra migrar o campo pra rich text e ganhar negrito/link.

### `custom.faq` (metafield definition, PRODUCT)

`list.metaobject_reference` → `faq_point` · nome **[Info] FAQ** · fixado · storefront `PUBLIC_READ`.
