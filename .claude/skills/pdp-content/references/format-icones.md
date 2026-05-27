# Formato: Ícones de Benefício

3 ícones PNG (transparente) + 3 títulos de benefício. **Requer geração de imagem via piapp-image-gen.**

## ⚠️ Inputs CRÍTICOS — bloquear se faltar

- ✅ Marca + produto confirmados
- ✅ DNA visual da marca (do bundle)
- ✅ Paleta (do bundle)
- ✅ **3 benefícios principais** (PERGUNTAR se não explícito)
- ✅ Estilo de ícone (linha / flat / 3D / hand-drawn) → PERGUNTAR se não definido no brandbook

---

## 📐 Estrutura

```
[ÍCONE 1]    [ÍCONE 2]    [ÍCONE 3]
[Título 1]   [Título 2]   [Título 3]
```

### Títulos
- 2-4 palavras
- Concretos e diferenciados
- Tom da marca

### Ícones
- PNG transparente
- 1:1 (1024x1024)
- Mesmo estilo entre os 3 (CRÍTICO pra consistência)

---

## 🎨 Geração via piapp-image-gen

Delegar para `piapp-image-gen` com:
- `purpose`: `pdp-icon`
- `tool`: `generate_image_batch` (3 prompts numa chamada — garante consistência)
- `aspect_ratio`: `1:1`
- `quality`: `standard`
- `background`: transparent (se PiApp suportar; senão flagar pra remoção)
- `output_path`: `conteudos/[marca]/produtos/[slug]/icones/imagens/`

### Template de prompt (passar pra piapp-image-gen)

```
A minimalist [STYLE: line art / flat / 3D rendered] icon representing
"[BENEFIT_TITLE]" for a beauty product.

Visual style: [BRAND_VISUAL_DNA].
Color palette: [BRAND_PRIMARY_HEX] on transparent background.

Background: transparent. Square 1:1.
NO text. NO letters. NO numbers. NO logos.
Centered composition. Simple geometry, recognizable at 32x32px.

The icon should clearly communicate [BENEFIT_DESCRIPTION].

Style consistent with [BRAND_NAME]: [BRAND_VISUAL_DNA].
```

---

## 🚨 Guardrails

- ❌ Não gerar ícones com estilos diferentes entre si
- ❌ Não incluir texto/letras
- ❌ Não usar fotos realistas (são ÍCONES)
- ❌ Não inventar benefícios não validados
- ✅ Mesmo estilo + paleta + stroke entre os 3
- ✅ Salvar prompts antes de gerar
- ✅ Apresentar prompts pra aprovação do usuário

---

## 📁 Output

```
conteudos/[marca]/produtos/[slug]/icones/
├── textos/
│   └── content.json
└── imagens/
    ├── generated/
    │   ├── image-01.png
    │   ├── image-02.png
    │   └── image-03.png
    └── prompts/
        ├── prompt-01.txt
        ├── prompt-01.meta.json
        └── ... (2 e 3)
```

### JSON

```json
{
  "metafield_key": "icones",
  "value": {
    "items": [
      {
        "title": "Definição Duradoura",
        "icon_path": "imagens/generated/image-01.png",
        "prompt_path": "imagens/prompts/prompt-01.txt"
      },
      {
        "title": "Hidratação Profunda",
        "icon_path": "imagens/generated/image-02.png",
        "prompt_path": "imagens/prompts/prompt-02.txt"
      },
      {
        "title": "Vegano e Cruelty-Free",
        "icon_path": "imagens/generated/image-03.png",
        "prompt_path": "imagens/prompts/prompt-03.txt"
      }
    ]
  }
}
```

## ✅ Checklist

- [ ] 3 ícones mesmo estilo visual?
- [ ] Paleta reflete a marca?
- [ ] Reconhecível em 32x32px?
- [ ] Sem texto nos ícones?
- [ ] Títulos concretos e diferenciados?

---

## 🔌 Publicação no Shopify — metaobjeto `product_icon` + metafield `custom.product_icons`

> O tema da loja consome trust icons via metafield **`custom.product_icons`** (label: `[Product Info] Trust Icons` — recomenda máximo 3). Tipo `list.metaobject_reference` apontando pra metaobjetos `product_icon`.

### Esquemas (autoritativos)

**Metafield definition**:
```yaml
namespace: custom
key: product_icons
name: "[Product Info] Trust Icons"
description: "Quantidade sugerida: máximo 3"
type: list.metaobject_reference
metaobject_definition_id: gid://shopify/MetaobjectDefinition/4836917455
```

**Metaobject definition** `product_icon`:
```yaml
type: product_icon
display_name_key: texto
fields:
  - key: imagem    # ícone — SVG/PNG transparente, 1:1, recomendado outline
    type: file_reference
    validations: { file_type_options: ["Image"] }
  - key: texto     # label curto (ex: "Poder do Arroz", "Cuidado Facial", "Cruelty Free")
    type: single_line_text_field
```

### Workflow (4 passos)

1. Gerar 3 ícones via `piapp-image-gen` com `purpose: pdp-icon` (estilo outline minimal, 1:1)
2. Upload pra Shopify Files via `fileCreate` (originalSource = URL PiApp), pollar até `fileStatus: READY`, coletar `MediaImage` GIDs
3. Criar 3 metaobjetos `product_icon` (1 mutation com 3 aliases):

```json
{
  "metaobject": {
    "type": "product_icon",
    "handle": "<slug>-icon-1",
    "fields": [
      { "key": "imagem", "value": "gid://shopify/MediaImage/<ID>" },
      { "key": "texto",  "value": "Poder do Arroz" }
    ]
  }
}
```

4. Anexar lista ao produto:

```json
{
  "metafields": [{
    "ownerId": "<PRODUCT_GID>",
    "namespace": "custom",
    "key": "product_icons",
    "type": "list.metaobject_reference",
    "value": "[\"gid://shopify/Metaobject/<G1>\",\"gid://shopify/Metaobject/<G2>\",\"gid://shopify/Metaobject/<G3>\"]"
  }]
}
```

### 🔒 Safety
- ✅ Máximo 3 icons (regra do tema)
- ✅ Texto ≤ 20 chars idealmente (2 palavras)
- ✅ Ícones com mesmo estilo/peso de stroke entre os 3 (consistência visual)
- ❌ Não tocar outros metafields/title/status do produto
- ✅ Se já existem icons linkados: substituir lista (criar novos) ou atualizar in-place via `metaobjectUpdate`

### 📐 Reference do produto Hidratante Pele de Porcelana
Tem 3 icons populados: "Poder do Arroz", "Cuidado Facial", "Cruelty Free" — use como modelo de tom + escopo.
