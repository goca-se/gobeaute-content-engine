# Schema Shopify Goshop — extração da Barbour's e replicação

Fonte: `www.thebarboursbeauty.com.br` (Barbour's Beauty) · extraído em **2026-07-29**
Destino planejado: **By Samia** (`brand-context/bysamia/`)
Payload de replicação: [`barbours-schema.json`](./barbours-schema.json)

> **Escopo deste doc: só estrutura.** Definições de metaobjeto e de metafield — `type`, `key`, `name`, `description`, `required`, validações, capabilities, pin. **Nenhum conteúdo** (as 121 instâncias de upsell, os 96 itens de eficácia, as 21 pills de collection etc. ficam de fora de propósito — conteúdo da By Samia será criado depois, com brandbook e paleta próprios).
>
> Complementa — não substitui — os specs de conteúdo por loja: [`../pdp-metafields-spec-gogroup-theme.md`](../pdp-metafields-spec-gogroup-theme.md) e [`../pdp-metafields-spec-apice.md`](../pdp-metafields-spec-apice.md).

---

## 1. O que existe hoje na Barbour's

**26 definições de metaobjeto** = 18 custom (tema Goshop) + 8 nativas de taxonomia Shopify.
**Metafields**: 23 em `custom` no PRODUCT (16 apontam pra metaobjeto) + 2 no COLLECTION. Nada em ARTICLE, BLOG ou PAGE.

### 1.1 Metaobjetos custom — o que cada um alimenta

| # | `type` | Nome | Instâncias | Metafield que aponta pra ele | Onde renderiza |
|---|---|---|---:|---|---|
| 1 | `upsell_banner` | Upsell Banner | 44 | `product.custom._all_fields_upsell_banner_` | Banner de upsell na PDP |
| 2 | `upsell_vertical_list` | Upsell em lista vertical | 121 | `product.custom.info_lista_vertical_de_upsell` (lista) | Lista vertical de upsell |
| 3 | `barra_de_estoque` | Barra de Estoque | 2 | `product.custom.barra_de_estoque` | Barra de escassez |
| 4 | `temporizador_promocional` | Temporizador Promocional | 1 | `product.custom.temporizador_promocional` | Countdown |
| 5 | `notify_me_request` | Mini Coming Soon Waitlist | 1 | — (tem URL própria) | Página de waitlist |
| 6 | `tag_customizada` | Tag Customizada | 16 | `product.custom.tag_customizada` (lista) | Selo no card de produto |
| 7 | `kit_or_single` | Kit ou unitário | 1 | `product.custom.kit_or_single` | Filtro de collection |
| 8 | `product_category_type` | Categoria/Tipo de produto | 5 | `product.custom.product_category_type` (lista) | Filtro de collection |
| 9 | `kit_builder` | Kit builder | 10 | `product.custom.kit_builder` | Section "Monte seu kit" |
| 10 | `product_benefit` | Benefício de produto | 31 | `product.custom.product_info_benefits` | Bloco descrição curta + bullets |
| 11 | `product_icon` | Ícone de produto | 1 | `product.custom.product_icons` (lista, máx 3) | Ícones da PDP |
| 12 | `faq_item` | Item de FAQ | 36 | `product.custom.section_faq` (lista) | Section FAQ da PDP |
| 13 | `eficiencia_do_produto` | Eficiência do Produto | 1 | `product.custom.eficiencia_do_produto` | Antes/depois |
| 14 | `como_usar` | Como usar | 2 | `product.custom.como_usar_session_pdp` | Goshop How to Use PDP |
| 15 | `product_ingredients` | Product Ingredients | 1 | `product.custom.product_ingredients_metafield` (lista) | Section Ingredientes |
| 16 | `video_tutorial_how_to_use` | Vídeo e tutorial - Como usar | 4 | `product.custom.how_to_use_pdp` | Section Como Usar (vídeo) |
| 17 | `section_efficacy_item` | Section Efficacy Item | 96 | `product.custom.section_efficacy` (lista) | Section Eficácia da PDP |
| 18 | `collection_tags` | Collection Tags | 21 | `collection.custom.tags_collection` | Pills da collection |

### 1.2 Particularidades que precisam ser respeitadas na cópia

- **`section_efficacy_item`** é a única com `publishable: false` **e** `translatable: false`. Se você habilitar `publishable` na loja destino, cada item nasce em DRAFT e a section some.
- **`collection_tags`** tem `storefront: NONE` (o tema lê via Liquid, não via Storefront API) e `translatable: false`.
- **`notify_me_request`** é a única com `renderable` + `onlineStore` habilitados (`urlHandle: notify_me_request`). Só criar se a loja destino for usar a waitlist.
- **`como_usar` e `upsell_vertical_list`** não têm `displayNameKey` — na lista do admin aparecem como "Metaobjeto #id". A Barbour's contornou isso com o campo `index` em `upsell_vertical_list`.
- **Duplicação existente na origem**: há dois caminhos de "Como usar" (`como_usar` #14 e `video_tutorial_how_to_use` #16) e dois de composição/ingredientes (`custom.composi_o` texto plano vs `custom.composicao` rich text vs `custom.ingredients`). Vale decidir se a loja destino replica os dois ou só o caminho novo — **replicar exatamente significa levar a duplicação junto**.
- **Duas "eficácias"**: `eficiencia_do_produto` (antes/depois, 1 instância, praticamente morto) e `section_efficacy_item` (96 instâncias, é o que roda).

### 1.3 Fora do payload de propósito

**Taxonomia nativa** (`shopify--fragrance`, `season`, `occasion`, `color-pattern`, `suitable-for-skin-type`, `bag-case-material`, `bag-case-storage-features`, `marker-text-color`): a Shopify cria sozinha quando você ativa os metafields padrão de categoria. Criar na mão dá conflito.

**Apps** (`intelipost.*`, `mm-google-shopping.*`, `reviews.*`, `rbrfb.fastbundleconf`, `shopify--discovery--*`): vêm com a instalação do app na loja destino.

---

## 2. Como replicar

A ordem importa: o metafield valida contra o **GID do metaobjeto**, que é diferente em cada loja. Por isso o payload usa placeholders `{{MOD:<type>}}`.

### Fase 1 — criar as definições de metaobjeto

```graphql
mutation CreateMOD($definition: MetaobjectDefinitionCreateInput!) {
  metaobjectDefinitionCreate(definition: $definition) {
    metaobjectDefinition { id type }
    userErrors { field code message }
  }
}
```

Variables, por item de `phase1_metaobject_definitions`:

```jsonc
{
  "definition": {
    "type": "faq_item",
    "name": "Item de FAQ",
    "description": "",
    "displayNameKey": "question",
    "access": { "admin": "PUBLIC_READ_WRITE", "storefront": "PUBLIC_READ" },
    "capabilities": { "publishable": { "enabled": true }, "translatable": { "enabled": true } },
    "fieldDefinitions": [
      { "key": "question", "name": "Pergunta", "description": "", "required": false,
        "type": "single_line_text_field", "validations": [] },
      { "key": "answer", "name": "Resposta", "description": "", "required": false,
        "type": "rich_text_field", "validations": [] }
    ]
  }
}
```

Anotar o `id` retornado de cada `type` — é ele que entra na fase 2.

### Fase 2 — criar os metafields que referenciam metaobjeto

```graphql
mutation CreateMFD($definition: MetafieldDefinitionInput!) {
  metafieldDefinitionCreate(definition: $definition) {
    createdDefinition { id namespace key }
    userErrors { field code message }
  }
}
```

```jsonc
{
  "definition": {
    "ownerType": "PRODUCT",
    "namespace": "custom",
    "key": "section_faq",
    "name": "[Gogroup] [Section] [PDP] FAQ",
    "type": "list.metaobject_reference",
    "validations": [
      { "name": "metaobject_definition_id", "value": "<GID novo de faq_item>" }
    ],
    "pin": false,
    "access": { "storefront": "PUBLIC_READ" }
  }
}
```

### Fase 3 — metafields simples

`phase3_plain_metafield_definitions` não depende de nada; pode rodar em paralelo à fase 1.

### Ordem do pin

`pin: true` só marca como fixado — não define posição. Para reproduzir a ordem da Barbour's (`pin_order` no JSON), criar as definições fixadas **nessa sequência**, ou reordenar depois no admin. Ordem de origem: `isen_o_de_direitos_autorais` (1) → `composi_o` (2) → `notas_da_fragr_ncia` (3) → `modo_de_uso` (4) → `sobre_o_produto` (5) → `ocultar_para_brinde_` (6) → `[v2] Descrição curta` (7) … `[v2] Itens Inclusos` (14) → `cheiro_inspirado` (15) → `Upsell Banner` (16) → `Lista vertical de upsell` (17) → `Tag Customizada` (18) → `Monte seu kit` (19) → `Short Description + Bullet Points` (20) → `Como Usar - PDP` (21) → `Eficácia — PDP` (22) → `compras_no_mes` (23).

---

## 3. Armadilhas conhecidas

1. **`metaobjectCreate` nasce DRAFT.** Toda definição com `publishable` habilitada cria instâncias em rascunho. Ao popular conteúdo depois, passar `capabilities: { publishable: { status: ACTIVE } }` — senão o metaobjeto existe no admin e não renderiza no storefront.
2. **`MetafieldAdminAccessInput` não aceita `PUBLIC_READ_WRITE`.** Na origem todos estão nesse valor, que é o default — por isso o payload omite `access.admin` e declara só `storefront`.
3. **`type` de metaobjeto é imutável.** Errou o slug, tem que apagar e recriar — e apagar a definição apaga todas as instâncias.
4. **O tema precisa existir na loja destino.** Criar o schema não faz a PDP renderizar: as sections do Goshop têm que estar publicadas e apontadas pros metafields. Schema sem tema = campos órfãos no admin.
5. **Este payload leva só a estrutura, não o conteúdo.** As 21 instâncias de `collection_tags`, os 96 `section_efficacy_item` etc. são conteúdo da Barbour's e não devem ser copiados literalmente — cores, textos e claims mudam por marca.

---

## 4. Destino: By Samia — pré-voo

Ainda **não executado**. Antes de rodar qualquer mutation na By Samia:

- [ ] `switch-shop` → By Samia (⚠️ revoga o token da Barbour's; há trabalho de blog pendente naquela loja)
- [ ] `get-shop-info` para confirmar o domínio
- [ ] Auditar o que **já existe** na By Samia: `metaobjectDefinitions` e `metafieldDefinitions(ownerType: PRODUCT|COLLECTION)`. Só criar o delta — `metaobjectDefinitionCreate` com `type` repetido falha, e `metafieldDefinitionCreate` com `namespace.key` repetido também.
- [ ] Confirmar se o tema Goshop está publicado na By Samia. Sem tema, o schema vira campo órfão no admin.
- [ ] Decidir os 3 pontos de duplicação herdados da Barbour's (ver §1.2): dois caminhos de "Como usar", duas "eficácias", e `custom.composi_o` (texto) vs `custom.composicao` (rich text) vs `custom.ingredients`.

Contagem se replicar tudo: **18 metaobjetos** (fase 1) + **17 metafields de referência** (fase 2) + **22 metafields simples** (fase 3) = 57 mutations.

Registro dos GIDs novos: preencher `by-samia-gid-map.json` após a fase 1 (o arquivo não existe ainda — criar na execução).
