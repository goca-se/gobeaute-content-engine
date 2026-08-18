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

---

## 🎨 Sub-skill: Geração de Trust Icons (estabelecida 2026-05-27)

Esta seção atua como **skill interna** específica pra geração e gestão dos Trust Icons (`[Product Info] Trust Icons` — `custom.product_icons`).

### 🚨 Ordem de operação (CHECK-BEFORE-CREATE)

Antes de gerar imagem nova ou criar metaobjeto, **SEMPRE**:

1. **Query catálogo existente**:
```graphql
query CheckIcons {
  icons: metaobjects(type: "product_icon", first: 50) {
    edges { node { id handle fields { key value } } }
  }
}
```

2. **Buscar match semântico** pelo `texto` do icon — se há um ícone com mesma intenção, REUSAR GID. Não gerar nova imagem.

3. **Só gerar novo** se:
   - Conceito único que não existe (ex: ingrediente novo, claim novo)
   - Style atual não bate (set de ícones evolui em batches — pode preciar regenerar)

### 🌐 Skill brand-agnostic

Este procedimento funciona pra **qualquer marca Gobeauté** (Apice, Barbour's, Rituária, Kokeshi, Lescent, By Samia, Auá). Cada marca tem seu próprio catálogo de metaobjetos `product_icon` na sua loja Shopify — o **procedimento é o mesmo**: query → match → reusar OU gerar.

**Padrão universal pra trust seals de cruelty-free** (vale em qualquer marca):

| Composição do produto | Texto do icon | Imagem |
|---|---|---|
| 100% vegano (sem mel, cera, lanolina, queratina animal, colágeno animal, etc.) | "vegano e cruelty-free" | leaf + bunny outline |
| Contém ingrediente de origem animal (ex: mel do Olhos de Gueixa) | "cruelty-free" | bunny-only outline |

⚠️ **Mesma imagem do `product_icon` deve ser reusada no `eficiencia_item` correspondente** (`section_efficacy`) — coerência visual entre topo da PDP (Trust Icons) e corpo (Efficacy badges).

### 📐 Catálogo Kokeshi (snapshot 2026-05-27)

**Trust seals universais (reuso direto):**

| GID | Handle | Texto | Imagem | Quando usar |
|---|---|---|---|---|
| `52920942799` | `cruelty-free-1` | "vegano e cruelty free" | folha + coelho | Produtos veganos (sem mel/origem animal) |
| `53776941263` | `cruelty-free-bunny-only` | "cruelty-free" | coelho puro | Kits/produtos com Olhos de Gueixa (mel) — não-veganos |
| `52920910031` | `firmeza-e-colageno` | "firmeza e colágeno" | — | Produtos com colágeno |
| `52921565391` | `cuidado-facial-1` | "hidratação facial" | — | Hidratantes faciais |
| `52922450127` | `poder-do-arroz-1` | "poder do arroz" | — | Produtos da linha arroz (Pele de Porcelana, Olhos de Gueixa) |
| `52922745039` | `glass-skin-glow` | "Glass Skin Glow" | — | Hidratantes com efeito glass-skin |
| `52922351823` | `olhar-descansado` | "Olhar descansado" | — | Produtos pra área dos olhos |
| `52921303247` | `fps-diario` | "FPS Diário" | — | Protetores solares |
| `52924809423` | `limpeza-facial` | "Limpeza Facial" | — | Sabonetes/cleansers |

> Lista completa de 22+ ícones disponíveis — query do catálogo é mandatória antes de criar novo.

### 🧠 Style guide pros NOVOS ícones (manter consistência com set existente)

Estilo "outline minimalista" Kokeshi:
- **Aspect**: `1:1` (1024×1024)
- **Cor**: monocrome black on white (vai ser recolorido via CSS pelo tema)
- **Stroke**: single weight, consistent thickness
- **Fills**: zero — só outline
- **Sombra/gradiente**: zero
- **Corners**: rounded, friendly, kawaii-inspired
- **Frame**: ícone ocupa ~60% do frame, com negative space generoso
- **Sem**: texto, labels, photorealism, cores

### 📝 Template prompt PiApp pra novos ícones

```
Minimalist outline icon illustration of [SYMBOL — ex: leaf, droplet, rabbit, shield, hourglass].
Single weight stroke, monochromatic black on pure white background (will be recolored via CSS).
Clean geometric shapes with friendly rounded corners, no fills, no shading, no gradients.
Centered composition, 1:1 ratio, icon occupies ~60% of frame with plenty of negative space.
Style: modern flat outline iconography, consistent line weight, kawaii-inspired softness.
Same visual style as the existing Kokeshi icon set.
NO text. NO labels. NO color. NO photorealistic elements.
```

### 🔄 Workflow completo pra adicionar trust icons a UM produto

1. **Decidir 3 ícones** baseados no perfil do produto:
   - Ingrediente protagonista (ex: poder-do-arroz pra produtos da linha arroz)
   - Benefício/categoria (ex: hidratação facial, firmeza, glass-skin)
   - Trust seal (cruelty-free OU vegano+cruelty-free dependendo se tem mel)

2. **Pra cada um dos 3**:
   - Query catálogo → tem match? REUSAR GID, pular pro passo 5
   - Sem match → gerar imagem nova via `mcp__piapp__generate_image_batch` (prompt template acima)
   - Upload pra Shopify Files via `fileCreate` → pollar até `READY`
   - Criar `product_icon` metaobjeto com:
     ```json
     {
       "type": "product_icon",
       "handle": "<descritivo-curto>",
       "capabilities": { "publishable": { "status": "ACTIVE" } },
       "fields": [
         { "key": "imagem", "value": "gid://shopify/MediaImage/<ID>" },
         { "key": "texto", "value": "<label 2-3 palavras>" }
       ]
     }
     ```

3. **Set metafield no produto**:
```json
{
  "metafields": [{
    "ownerId": "gid://shopify/Product/<GID>",
    "namespace": "custom",
    "key": "product_icons",
    "type": "list.metaobject_reference",
    "value": "[\"gid://shopify/Metaobject/<I1>\",\"gid://shopify/Metaobject/<I2>\",\"gid://shopify/Metaobject/<I3>\"]"
  }]
}
```

### 🚨 Compliance — vegano vs cruelty-free

- **Vegano**: produto SEM ingredientes de origem animal (sem mel, sem cera de abelha, etc.)
- **Cruelty-free**: não testado em animais (vale pra qualquer produto Kokeshi)
- ⚠️ **Kits com Olhos de Gueixa** (que contém extrato de mel) **NÃO** são veganos — usar `cruelty-free-bunny-only` (sem leaf/folha)
- ⚠️ Produtos sem mel ou ingredientes animais → usar `cruelty-free-1` (vegano + cf, com leaf+bunny)

### ✅ Checklist final

- [ ] Exatamente **3 ícones** (recomendação do tema)?
- [ ] Texto ≤ 20 chars (idealmente 2 palavras)?
- [ ] Style consistente entre os 3 (mesma "geração" do set)?
- [ ] Trust seal correto (vegano-cf OU cruelty-free puro conforme composição)?
- [ ] Todos `publishable.status: ACTIVE`?
- [ ] Handles com slug do produto quando específico, OU descritivos curtos quando universais?
- [ ] Audit pós-set: render no PDP do produto bate com expectativa?
