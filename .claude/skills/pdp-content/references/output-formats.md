# Output Formats — PDP Content

A skill suporta múltiplos formatos de output. **PERGUNTAR ao usuário** ou gerar Markdown + JSON por default.

## 📄 Formato 1 — Markdown (`content.md`)

Default. Pra revisão humana.

```markdown
# [Nome do Produto] — [Nome da Marca]

## [Nome do Metafield]

[Conteúdo]

---
**Brand**: [marca]
**Product**: [slug]
**Metafield**: [metafield]
**Generated**: [ISO date]
```

## 🔌 Formato 2 — JSON (`content.json`)

Default. Pra import via API Shopify.

```json
{
  "brand": "apice",
  "product_handle": "condicionador-nutri-waves-500ml",
  "metafield_namespace": "info",
  "metafield_key": "faq",
  "metafield_type": "json",
  "generated_at": "2026-XX-XX",
  "needs_review": [],
  "value": {...}
}
```

Pra metafields complexos (arrays), `value` contém estrutura específica:

**FAQ**:
```json
{
  "value": {
    "items": [
      { "category": "adequacao", "question": "...", "answer": "..." }
    ]
  }
}
```

**Bullets**:
```json
{
  "value": {
    "short_description": "...",
    "bullets": [
      { "anchor": "Definição duradoura", "text": "cachos marcados por mais tempo" }
    ]
  }
}
```

**Ícones**:
```json
{
  "value": {
    "items": [
      { "title": "...", "icon_path": "imagens/generated/image-01.png", "prompt_path": "imagens/prompts/prompt-01.txt" }
    ]
  }
}
```

**Antes/Depois (B - números)**:
```json
{
  "value": {
    "variant": "B",
    "stats": [
      { "value": "92", "unit": "%", "label": "redução de frizz", "source": "[VALIDAR]" }
    ],
    "disclaimer": "..."
  }
}
```

**Como Usar**:
```json
{
  "value": {
    "steps": ["Passo 1", "Passo 2", ...],
    "frequency": "...",
    "media": { "type": "image", "path": "imagens/generated/image-01.png" }
  }
}
```

**Ingredientes**:
```json
{
  "value": {
    "items": [
      {
        "name": "Óleo de Coco",
        "image_path": "imagens/generated/image-01.png",
        "prompt_path": "imagens/prompts/prompt-01.txt",
        "description": "..."
      }
    ],
    "closing_text": "..."
  }
}
```

## 🛍️ Formato 3 — Shopify Liquid (`shopify-liquid.html`)

Opcional. Snippet pronto pra theme se a renderização for customizada.

```liquid
{%- comment -%} FAQ Section — Gobeaute {%- endcomment -%}
{%- assign faq_items = product.metafields.info.faq.value.items -%}
<div class="pdp-faq">
  {%- for item in faq_items -%}
    <details class="pdp-faq__item">
      <summary>{{ item.question }}</summary>
      <p>{{ item.answer }}</p>
    </details>
  {%- endfor -%}
</div>
```

## 📝 Naming de metafields Shopify (sugestão)

| Formato (interno) | Namespace.Key Shopify |
|---|---|
| Descrição | `info.descricao` |
| Composição | `info.composicao` |
| Modo de uso | `info.modo_de_uso` |
| Descrição curta | `info.descricao_curta` |
| Ícones | `product_info.icones` |
| Antes/Depois | `section.antes_depois` |
| FAQ | `section.faq` |
| Como Usar | `section.como_usar` |
| Ingredientes | `info.ingredientes` |

> ⚠️ **Confirmar com o usuário** antes de assumir namespace/key — pode variar conforme estrutura real do Shopify dele.
