# Lescent — Auditoria de execução, 2026-07-31

Loja `LESCENT` / `568499-ef.myshopify.com` · Tema-alvo `lescent-theme/develop` (GID `186949861683`).
Números de preenchimento conferidos via `metafieldDefinitions(ownerType: PRODUCT).metafieldsCount` **após** a execução — não são estimativas.

---

## 1. Schema criado (não existia nada disso na loja)

### 1.1 Definições de metaobjeto — 7 novas

| Type | Nome | Campos | GID |
|---|---|---|---|
| `product_bullet_point` | Product Bullet Point | `point_text`, `point_color`, `point_background_color` | `MetaobjectDefinition/20079051059` |
| `ativos` | Ativo / Nota (item) | `title`, `description` | `MetaobjectDefinition/20079149363` |
| `trust_icons` | Trust Icon | `icon`, `title`, `description` | `MetaobjectDefinition/20079182131` |
| `highlight_section` | Product Highlight | `title`, `description`, `image` | `MetaobjectDefinition/20079214899` |
| `how_to_use` | Como Usar | `file`, `steps` | `MetaobjectDefinition/20079247667` |
| `comparison_item` | Comparison Item | `for_brand`, `text` | `MetaobjectDefinition/20079280435` |
| `sess_o_ativos` | Seção Ativos / Construção da Fragrância | `image`, `ativo` (→ `ativos`) | `MetaobjectDefinition/20079313203` |

Todos com **Storefront API access: PUBLIC_READ**. Nenhum com `capabilities.publishable` — decisão deliberada para as entradas nascerem utilizáveis, sem o problema de metaobjeto em DRAFT.

### 1.2 Definições de metafield de PRODUTO — 7 novas

| Namespace.key | Tipo | Seção que ativa | GID |
|---|---|---|---|
| `custom.product_bullet_point_metafield` | list.metaobject_reference | bloco `jump-product-tag` | `MetafieldDefinition/230475759923` |
| `custom.subtitulo` | single_line_text_field | bloco `product-subtitle` | `MetafieldDefinition/230475792691` |
| `custom.trust_icons` | list.metaobject_reference | seção `product-features` | `MetafieldDefinition/230477955379` |
| `custom.ativo` | metaobject_reference | seção `active-ingredients` | `MetafieldDefinition/230477988147` |
| `custom.highlight_section` | metaobject_reference | seção `product-highlight` | `MetafieldDefinition/230478020915` |
| `custom.how_to_use` | metaobject_reference | seção `product-how-to-use` | `MetafieldDefinition/230478053683` |
| `custom.brand_comparison` | list.metaobject_reference | seção `product-comparison` | `MetafieldDefinition/230478086451` |

→ **O schema do tema develop está 100% completo.** Nenhuma seção do PDP do develop lê metafield inexistente agora.

---

## 2. Entradas de metaobjeto criadas — 48

| Grupo | Qtd | Reaproveitamento |
|---|---|---|
| Chips de **ocasião** (`product_bullet_point`) | 4 | TRABALHO / DIA A DIA · DATE / ROMÂNTICO · BALADA · EVENTO ESPECIAL |
| Chips de **conselho de uso** | 3 | DIA · NOITE · DIA E NOITE |
| Chips de **família olfativa** | 9 | FLORAL · CÍTRICO · FRUTADO · AMADEIRADO · AQUÁTICO · AROMÁTICO · GOURMAND · ALMISCARADO · ESPECIADO |
| **Tags de card** (`tag_customizada`) | 5 | BEST-SELLER · KIT COMPLETO · MAIS AMADO · TAMANHO VIAGEM · 100ML |
| **Ícones de confiança** (`trust_icons`) | 4 | universais — servem o catálogo inteiro |
| **Como usar** (`how_to_use`) | 2 | 1 para fragrância avulsa, 1 para kit |
| **Comparativo** (`comparison_item`) | 8 | 4 Lescent + 4 mercado, universais |
| **FAQ** (`faq_item`) | 8 | 6 universais + 2 específicas de kit |
| **Benefits** (`product_benefit`) | 5 | arquétipos: 25ml · 100ml · trilogia · quarteto/sexteto · dueto |

**Nada é one-off.** Uma entrada "FLORAL" serve 12 produtos; os 4 ícones de confiança e as 8 linhas de comparativo servem os 30 SKUs e escalam para o catálogo todo. Trocar um texto num lugar reflete em todos os produtos.

---

## 3. Preenchimento — contagem real após execução

| Metafield | Antes | Depois | Cobertura do top 30 |
|---|---|---|---|
| `custom.trust_icons` | 0 | **30** | 100% ✅ |
| `custom.how_to_use` | 0 | **30** | 100% ✅ |
| `custom.brand_comparison` | 0 | **30** | 100% ✅ |
| `custom.section_faq` | 0 | **30** | 100% ✅ |
| `custom.product_info_benefits` | 2 | **32** | 100% ✅ (30 novos) |
| `custom._v2_descri_o` | 0 | **5** | 17% ⚠️ |
| `custom.subtitulo` | 0 | **5** | 17% ⚠️ |
| `custom.product_bullet_point_metafield` | 0 | **5** | 17% ⚠️ |
| `custom.tag_customizada` | 0 | **5** | 17% ⚠️ |
| `custom.notas_e_ess_ncias` | 144 | **147** | +3 kits |
| `custom.ativo` | — | **0** | schema criado, não preenchido |
| `custom.highlight_section` | — | **0** | schema criado, não preenchido |
| `custom.composicao` | 39 | **39** | ⛔ bloqueado — falta INCI |

**Total de mutations:** 173 metafields gravados (23 do piloto + 150 dos universais), **zero `userErrors`** em todos os lotes.

---

## 4. O que já renderiza vs. o que espera o dev

| Campo | Renderiza hoje no develop? |
|---|---|
`custom._v2_descri_o` | ✅ seção `about-faq` "SOBRE O PRODUTO"
`custom.subtitulo` | ✅ bloco `product-subtitle`, já no `block_order`
`custom.notas_e_ess_ncias` | ✅ acordeão "NOTAS E ESSÊNCIAS"
`custom.tag_customizada` | ✅ pill no card (nunca no PDP — guard `request.page_type != 'product'`)
`custom.trust_icons` | ✅ seção `product-features`, já no template
`custom.how_to_use` | ✅ seção `product-how-to-use`, já no template
`custom.brand_comparison` | ✅ seção `product-comparison`, já no template
`custom.section_faq` | ⚠️ seção `goshop-product-faq` **não está no template**
`custom.product_info_benefits` | ⚠️ bloco `jump-product-info-benefits` **não está no `block_order`**
`custom.product_bullet_point_metafield` | ⚠️ bloco `jump-product-tag` **não está no `block_order`**

### Pedido ao time de dev (tema `lescent-theme/develop`, 4 ajustes de editor)
1. Adicionar bloco **`jump-product-tag`** ao `block_order` de `templates/product.json` → liga os chips
2. Adicionar bloco **`jump-product-info-benefits`** ao `block_order` → liga os bullets de benefício
3. Adicionar seção **`goshop-product-faq`** → liga a FAQ
4. Apontar o `content` do bloco `offer` para `{{ product.metafields.custom._v2_descri_o_curta | metafield_tag }}` (hoje vazio)

Bônus (collection): habilitar os blocos `text` "Title" e "Description" em `templates/collection.json`, hoje `disabled: true` — a collection está **sem H1**.

Renomear o heading da seção `active-ingredients` de "O poder da fórmula" para algo como "A construção da fragrância" — o texto atual é de cosmético, não de perfumaria.

---

## 5. Compliance — o que foi aplicado

Todo texto passou por esta régua (brandbook §4 e §8 + `_shared/compliance-anvisa.md`):

- ✅ Nome Lescent protagonista; referência de luxo só no 2º parágrafo, sempre "inspirado por … ®️"
- ✅ Disclaimer de fixação presente onde há claim de fixação: *"A duração pode variar conforme tipo de pele, temperatura e região de aplicação."* — aparece no chip `trust-alta-fixacao`, na FAQ de fixação, nos 5 arquétipos de benefits e nos 2 "como usar"
- ✅ Comparativo usa **concorrentes NÃO NOMEADOS** e só afirma práticas da própria Lescent
- ✅ Nenhuma duração em horas · nenhum "exclusivo/raro/milagre/transforma" · nenhum claim de saúde, pele ou efeito dermatológico
- ✅ Nenhum número de clientes ou de avaliações usado em copy nova (pendente de confirmação)
- ✅ Nenhuma comparação de preço com a referência de luxo
- ✅ Nenhuma nota olfativa inventada — todas transcritas de `custom.notas_e_ess_ncias` já publicado

### Claims quantitativos usados e sua base
| Claim | Base |
|---|---|
"Três fragrâncias por menos que dois frascos avulsos" | Kit trilogia R$ 89,90 vs. 2× R$ 49,90 = R$ 99,80 ✅
"Duas fragrâncias por menos que dois frascos avulsos" | Kit dueto R$ 69,90 vs. 2× R$ 49,90 = R$ 99,80 ✅
"Melhor custo por ml do catálogo" (100ml) | 100ml ≈ R$ 1,00/ml vs. 25ml ≈ R$ 2,00/ml ✅
"Selo RA1000 no Reclame Aqui" | Certificação pública, brandbook §7 ✅
"Essências importadas de alto padrão" | Posicionamento oficial, brandbook §7 ✅

---

## 6. Problemas encontrados na base atual

| # | Problema | Onde | Ação |
|---|---|---|---|
| 1 | 🔴 `notas_e_ess_ncias` do **Nº 2, Nº 3, Nº 5 e Nº 6** termina com **"uma recriação de X"** — termo proibido pelo brandbook §8 | conteúdo já publicado | trocar por "Fragrância inspirada por X®️" |
| 2 | 🟠 `produtos.csv` não registra que o **Nº 3 • Vivante Capri é Light Blue de Dolce & Gabbana** | `brand-context/lescent/produtos.csv` | corrigir junto da regeneração do CSV |
| 3 | 🟠 `para_quem` do **Nº 5** ainda chama o produto de "Douce Fleur" (nome antigo de Douce Paris) | metafield publicado | corrigir |
| 4 | 🟠 Meta description do Nº 2 tem tag HTML vazada: `"Délicate Londres Nº 2pPerfume feminino…"` | `seo.description` | corrigir |
| 5 | 🟠 **`no-7-sublime-versailles-copy-copy` (rank 12) está com estoque 0** e é o PDP mais acessado do top 30 (77.971 sessões/90d) | operação | repor ou redirecionar |
| 6 | 🟠 Handle do **Kit Sexteto Masculino** cita Nº 14/27/33 mas o título diz Nº 12+13+19+20+29+33 | dado | alinhar título e handle |
| 7 | 🟡 `custom.badges` com vocabulário inconsistente: "Feminino"/"Femininos", "Masculino"/"Masculinos", "Best-Seller"/"Best- Seller" (com espaço), "Lançamento"/"Lançamentos" | 213 produtos | padronizar |
| 8 | 🟡 Nº 19, Nº 29 e Nº 33 **não têm `notas_e_ess_ncias`** — por isso o texto do Kit Sexteto só cita a família deles | conteúdo | preencher as notas |
| 9 | ⛔ `composicao` presente em só **39 produtos**; falta no Nº 13 (campeão masculino) e no Nº 31 | conteúdo | **exige INCI do time — não invento** |

---

## 7. O que ficou de fora, e por quê

| Item | Motivo |
|---|---|
`custom.ativo` (pirâmide olfativa) | Schema criado, **fill não executado de propósito**: duplicaria o acordeão "NOTAS E ESSÊNCIAS" que já renderiza com o mesmo conteúdo. Faz sentido só se o dev trocar o heading da seção e o objetivo for repetir a informação em formato visual.
`custom.highlight_section` | Schema criado, fill pendente. É o bloco "história da fragrância" — 11 entradas (uma por número) e ganha muito com imagem, que não existe ainda.
`_v2_descri_o` / `subtitulo` / chips / tag nos ranks 6–30 | 25 SKUs precisam de prosa única (não é reaproveitável como os universais). Próxima onda.
`custom.product_ingredients_metafield` / `section_efficacy` | Redundantes com `ativo` e sem uso claro em perfumaria. Decidir na definição Goshop vs. Horizon (contexto §4.7.5).
Imagens | **Nenhuma necessária nesta onda.** As seções `product-features`, `product-highlight`, `active-ingredients` e `product-how-to-use` renderizam com texto só; a imagem é opcional em todas. Se quiser avançar: 4 ícones de confiança reaproveitados no catálogo inteiro.

---

## 8. Rastro em disco (REGRA INVIOLÁVEL #0)

```
conteudos/lescent/
├── _schema/
│   ├── schema-payload.json          ← definições + entradas planejadas
│   └── shopify-result.json          ← GIDs de tudo que foi criado
└── produtos/
    ├── _onda1-piloto-top5/
    │   ├── textos/conteudo.md        ← prosa legível dos 5 SKUs
    │   ├── textos/shopify-payload.json
    │   └── shopify-result.json
    └── _onda1-universais-top30/
        ├── textos/shopify-payload.json  ← mapa de atribuição dos 30
        └── shopify-result.json
```

Tudo replayável. Nada foi mutado sem payload gravado antes.
