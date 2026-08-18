# Schema Shopify — `custom.tags_collection` + metaobject `collection_tags`

> ⚠️ **GIDs são por loja.** Os GIDs abaixo são o snapshot da **Rituária** (2026-07-15). Em outra loja/marca, SEMPRE rode as queries de verificação antes — se as definições não existirem, PERGUNTE ao usuário antes de criá-las.

## Definições (autoritativas — snapshot Rituária)

**Metafield definition** (owner: COLLECTION):

```yaml
namespace: custom
key: tags_collection
name: "Tags Collection"
type: metaobject_reference          # referência ÚNICA, não list.
validations:
  metaobject_definition_id: gid://shopify/MetaobjectDefinition/18794250531
access: { admin: PUBLIC_READ_WRITE, storefront: PUBLIC_READ }
pinned: true
```

**Metaobject definition** `collection_tags` (`gid://shopify/MetaobjectDefinition/18794250531`):

```yaml
type: collection_tags
name: "Collection Tags"
display_name_key: label
capabilities: { publishable: { enabled: true } }   # ⚠️ cria em DRAFT por default!
fields:
  - { key: label,                type: single_line_text_field,      required: true }
  - { key: text_color,           type: color,                       required: false }
  - { key: tag_background_color, type: color,                       required: false }
  - { key: tags,                 type: list.single_line_text_field, required: true }
```

## Queries de verificação (rodar ANTES de gerar)

### 1. Definições existem nesta loja?

```graphql
query CheckDefs {
  metafieldDefinitions(first: 1, ownerType: COLLECTION, namespace: "custom", key: "tags_collection") {
    nodes { id type { name } validations { name value } }
  }
  metaobjectDefinitionByType(type: "collection_tags") { id type fieldDefinitions { key type { name } } }
}
```

### 2. Contexto da collection + tags atuais (CHECK-BEFORE-CREATE)

```graphql
query CollectionContext($handle: String!) {
  collectionByHandle(handle: $handle) {
    id title handle descriptionHtml
    metafield(namespace: "custom", key: "tags_collection") {
      id value
      reference { ... on Metaobject { id handle displayName fields { key value } } }
    }
    products(first: 20) { nodes { title handle tags } }
  }
}
```

### 3. Metaobjects `collection_tags` existentes (evitar duplicar handle)

```graphql
query ExistingTagGroups {
  metaobjects(type: "collection_tags", first: 50) {
    nodes { id handle displayName capabilities { publishable { status } } fields { key value } }
  }
}
```

## Mutations (rodar SÓ depois de salvar em `conteudos/`)

### 1. Criar o metaobject

```graphql
mutation CreateTagGroup($metaobject: MetaobjectCreateInput!) {
  metaobjectCreate(metaobject: $metaobject) {
    metaobject { id handle capabilities { publishable { status } } }
    userErrors { field message code }
  }
}
```

```json
{
  "metaobject": {
    "type": "collection_tags",
    "handle": "<collection-slug>",
    "capabilities": { "publishable": { "status": "ACTIVE" } },
    "fields": [
      { "key": "label", "value": "Saúde do intestino" },
      { "key": "text_color", "value": "#FFFFFF" },
      { "key": "tag_background_color", "value": "#BC4869" },
      { "key": "tags", "value": "[\"Digestão\",\"Inchaço e Gases\",\"Imunidade Intestinal\",\"Regularidade Intestinal\"]" }
    ]
  }
}
```

> ⚠️ `tags` é `list.single_line_text_field` → value é **string JSON** de array, não array nativo.
> ⚠️ `capabilities.publishable.status: "ACTIVE"` é obrigatório — sem isso o metaobject nasce DRAFT e o tema não renderiza nada.
> ⚠️ Validar as operations com `validate_graphql_codeblocks` (MCP Shopify) antes de executar.
> 📌 No `shopify-payload-tags.json`, a mutation 2 usa o placeholder `<METAOBJECT_GID_FROM_MUTATION_1>` — preencher com o GID retornado pela mutation 1 antes de rodar (replay cego do arquivo falha por design).

### 2. Anexar à collection

```graphql
mutation SetCollectionTags($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields { id key }
    userErrors { field message code }
  }
}
```

```json
{
  "metafields": [{
    "ownerId": "gid://shopify/Collection/<COLLECTION_GID>",
    "namespace": "custom",
    "key": "tags_collection",
    "type": "metaobject_reference",
    "value": "gid://shopify/Metaobject/<METAOBJECT_GID>"
  }]
}
```

### Editar in-place (collection já tem tags e usuário escolheu editar)

`metaobjectUpdate` no GID existente, alterando só os `fields` necessários — o metafield da collection já aponta pra ele, não precisa de `metafieldsSet`.

## Exemplo vivo em produção (Rituária, 2026-07-15)

| Item | Valor |
|---|---|
| Collection | "Saúde Do Intestino" (`saude-do-intestino`) |
| Metaobject | handle `teste` (⚠️ handle ruim — novos usam slug da collection), status ACTIVE |
| label | "Saúde do intestino" |
| tags | Digestão, Inchaço e Gases, Imunidade Intestinal, Regularidade Intestinal |
| cores | fundo `#C6BDC7`, texto `#FFFFFF` (⚠️ contraste 1.83:1 — NÃO replicar; ver color-intelligence.md) |

## Checklist pós-mutation

- [ ] `userErrors` vazio nas 2 mutations?
- [ ] `publishable.status` retornou `ACTIVE`?
- [ ] Re-query da collection confirma `metafield.reference.handle` esperado?
- [ ] `shopify-result-tags.json` salvo com GIDs + timestamp?
