# Schema canônico do `shopify-payload.json` — `pdp-payload/v1`

Formato que o **publisher do content pipeline** (`pipeline/publisher/`) reaplica de forma determinística.
Obrigatório quando a skill roda em modo headless (pipeline). No modo interativo é recomendado, porque deixa o replay possível.

Um arquivo por formato: `conteudos/[marca]/produtos/[slug]/[formato]/textos/shopify-payload.json`.

```json
{
  "schema": "pdp-payload/v1",
  "shop": "kokeshi.com.br",
  "product_gid": "gid://shopify/Product/7336439152847",
  "product_handle": "creme-hidratante-para-o-corpo-kokeshi",
  "formato": "faq",
  "metaobjects": [
    {
      "type": "faq_item",
      "handle": "creme-hidratante-para-o-corpo-kokeshi-faq-1",
      "status": "ACTIVE",
      "fields": [
        { "key": "question", "value": "Posso usar todos os dias?" },
        { "key": "answer", "value": "{\"type\":\"root\",\"children\":[{\"type\":\"paragraph\",\"children\":[{\"type\":\"text\",\"value\":\"Pode e deve! ...\"}]}]}" }
      ]
    }
  ],
  "reuse": [
    { "gid": "gid://shopify/Metaobject/53733294287", "handle": "e-vegano-e-cruelty-free", "type": "faq_item" }
  ],
  "metafield": {
    "namespace": "custom",
    "key": "section_faq",
    "type": "list.metaobject_reference",
    "value_refs": ["<GID:creme-hidratante-para-o-corpo-kokeshi-faq-1>", "gid://shopify/Metaobject/53733294287"]
  }
}
```

## Regras

- `metaobjects[]`: metaobjetos **novos**. O publisher faz `metaobjectUpsert` por `type` + `handle` (idempotente). Handle sempre `<product-slug>-<purpose>`. `status` sempre `ACTIVE`.
- `reuse[]`: metaobjetos **existentes** (do catálogo de reuso). Nunca são alterados nem removidos no rollback.
- `metafield.value_refs`: obrigatório em `metaobject_reference` (1 item) e `list.metaobject_reference` (lista ordenada). `<GID:handle>` aponta para um item de `metaobjects[]` e é resolvido pelo publisher. GID literal aponta para um item de `reuse[]`.
- `metafield.value`: obrigatório em tipos de texto (`rich_text_field`, `multi_line_text_field`, `single_line_text_field`). Em `rich_text_field` é a string JSON `{"type":"root","children":[...]}`.
- `value_refs` e `value` são mutuamente exclusivos.
- Os campos de imagem (`file_reference`) ficam **fora** do payload no pipeline v1 (imagem fora do piloto).
- Nada de placeholder `[VALIDAR]` no payload: se existir, o validator reprova.
