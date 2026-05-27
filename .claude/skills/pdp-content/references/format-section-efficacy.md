# Formato: [Section] Eficiência do Produto (`section_efficacy`)

> **Padrão Goshop moderno.** Substitui o esquema antigo `custom.eficiencia_do_produto` (1 metaobjeto com 3 números fixos + 2 imagens). Aqui cada card é um metaobjeto independente — fica fácil reordenar, ativar/desativar, adicionar quantos quiser, misturar claims numéricos com badges de atributo.

Cards de prova de eficácia + atributos da fórmula exibidos na PDP abaixo de Ingredientes. Cada card pode ser:
- **Numérico**: claim em destaque (ex: `4x`, `92%`, `+38%`, `24h`) + texto descritivo + **footnote obrigatória** com fonte verificável
- **Badge de atributo**: sem número, com **ícone** + texto curto (ex: "Vegano e cruelty-free", "Dermatologicamente testado")

Recomendado: 3-6 cards, balanceando claims numéricos e badges.

## ⚠️ Inputs CRÍTICOS

- ✅ Marca + produto confirmados
- ✅ Pra cada claim numérico: **fonte verificável** (laudo de instituto, autoavaliação Trustvox com n disclosed, painel sensorial, estudo clínico)
- ✅ Pra cada badge: certificação ou diferencial confirmado pelo brandbook (não inventar "vegano" se não tiver certificação)
- ✅ Brand visual DNA (pra ícones e background images coerentes)

🚨 **Sem fonte real pro número → NÃO criar o card.** Substitui por badge de atributo ou marca `state: Inactive` até validar.

---

## 📐 Esquemas (autoritativos)

### Metafield definition (no produto)

```yaml
namespace: custom
key: section_efficacy
name: "[Section] Eficiência do Produto"
type: list.metaobject_reference
metaobject_definition_id: gid://shopify/MetaobjectDefinition/5602607311   # eficiencia_item
```

### Metaobject definition `eficiencia_item`

```yaml
type: eficiencia_item
display_name_key: text
capabilities:
  publishable: true              # Active/Draft nativo do Shopify
fields:
  - key: number                  # single_line_text, opcional, max 12 chars
    description: "Claim numérico em destaque (ex: '4x', '92%', '+38%', '24h'). Vazio = card de badge com ícone."
  - key: text                    # single_line_text, REQUIRED, max 80 chars
    description: "Texto que acompanha o número ou ícone. Recomendado até 40 chars."
  - key: icon                    # file_reference (image), opcional
    description: "Aparece quando 'number' está vazio. SVG/PNG transparente, outline, 1:1, ~64px."
  - key: background_image        # file_reference (image), opcional
    description: "Fundo decorativo. 4:3, 1200x900+, JPG. CSS aplica overlay."
  - key: footnote                # single_line_text, opcional, max 200 chars
    description: "Asterisco + fonte do claim no rodapé. OBRIGATÓRIO para claim numérico."
  - key: state                   # single_line_text, REQUIRED, choices: ["Active","Inactive"]
    description: "Active = renderiza. Inactive = oculta sem deletar. Padrão Goshop."
```

---

## 📝 Anatomia de um card

### Cards numéricos (com `number`)

- `number`: 1-6 caracteres (`92%`, `+38%`, `4x`, `24h`, `1625+`)
- `text`: até 40 chars idealmente — frase descritiva curta ("notaram pele mais hidratada")
- `footnote`: **OBRIGATÓRIA**, no formato `*Fonte: <metodologia>, <instituto/origem>, <ano>`
- `icon`: opcional (o `number` já é o herói visual)
- `background_image`: opcional pra cards-hero
- `state`: `Active`

### Cards-badge (sem `number`)

- `number`: vazio
- `text`: badge curta ("Vegano e cruelty-free", "Hipoalergênico")
- `icon`: **obrigatório** (substitui o `number` como elemento visual)
- `footnote`: opcional (só se houver certificação a citar)
- `state`: `Active`

### Tabela de claims tipicos por categoria

| Categoria | Cards numéricos | Cards-badge |
|---|---|---|
| Skincare facial | % hidratação, % uniformização, 4.x/5 nota Trustvox, 24h hidratação | Não-comedogênico, Dermatologicamente testado, Vegano, Cruelty-free |
| Hair care | % redução frizz, % brilho, % definição, +N% volume | Vegano, Sem sulfato, Sem parabeno, Cruelty-free |
| Grooming masc. | % redução oleosidade, % hidratação | Hipoalergênico, Cruelty-free |
| Suplementos | % bem-estar autoavaliado, dias até notar | Vegano, Sem glúten, Sem lactose, Selo ANVISA |
| Fragrâncias | h fixação, m projeção, % aprovação painel | Vegano, Sem álcool, Aprovação dermatológica |

---

## 🎨 Geração de assets via piapp-image-gen

### Ícones (`icon` field)

`purpose`: `pdp-section-efficacy-icon`
`tool`: `generate_image_batch` (N ícones pareados pra estilo unificado)
`aspect_ratio`: `1:1`
`quality`: `high`

Template prompt:
```
Minimalist outline icon illustration of [SYMBOL — ex: leaf, droplet, rabbit, shield, hourglass].
Single weight stroke, monochromatic black on pure white background (will be recolored via CSS).
Clean geometric shapes, no fills, no shading, no gradients.
Centered composition, 1:1 ratio, plenty of negative space (icon occupies ~60% of frame).
Style: modern flat outline iconography, consistent line weight, friendly rounded corners.
NO text. NO labels. NO photorealistic elements. NO color (must work as alpha mask).
```

> Ícones devem ter estilo consistente entre todos os cards do produto.

### Background images (`background_image` field)

`purpose`: `pdp-section-efficacy-bg`
`aspect_ratio`: `4:3`
`quality`: `high`

Template prompt:
```
Photorealistic abstract texture photography of [SUBJECT — ex: water droplets on skin, rice grains close-up, soft silk fabric, glowing serum, dewy rose petals].
Composition: macro detail, shallow depth of field, soft natural lighting.
Background: blurred, low-contrast, must work with text overlay (avoid busy patterns).
Style: editorial brand-coherent — [BRAND_VISUAL_DNA, BRAND_PALETTE].
Mood: premium, calm, sensorial.
Aspect ratio: 4:3. High resolution (minimum 1200x900px).
NO text. NO logos. NO product packaging. NO people. NO sharp distracting elements.
```

---

## 🔌 Publicação no Shopify — workflow

**1) Pra cada card, criar um metaobjeto `eficiencia_item`** (numa única mutation com aliases)

```graphql
mutation CreateEfficacyItems(
  $c1: MetaobjectCreateInput!
  $c2: MetaobjectCreateInput!
  # ... até cN
) {
  card1: metaobjectCreate(metaobject: $c1) { metaobject { id handle } userErrors { field message code } }
  card2: metaobjectCreate(metaobject: $c2) { metaobject { id handle } userErrors { field message code } }
  # ...
}
```

Variables (card numérico):
```json
{
  "metaobject": {
    "type": "eficiencia_item",
    "fields": [
      { "key": "number",   "value": "92%" },
      { "key": "text",     "value": "notaram pele mais hidratada na 1ª semana" },
      { "key": "footnote", "value": "*Autoavaliação Trustvox com n=320 clientes, 2025" },
      { "key": "state",    "value": "Active" }
    ]
  }
}
```

Variables (card-badge):
```json
{
  "metaobject": {
    "type": "eficiencia_item",
    "fields": [
      { "key": "text",  "value": "Vegano e cruelty-free" },
      { "key": "icon",  "value": "gid://shopify/MediaImage/<ICONE_FOLHA>" },
      { "key": "state", "value": "Active" }
    ]
  }
}
```

**2) Se usar imagens (icon / background_image)** — upload prévio via `fileCreate` → pollar `fileStatus: READY` → coletar `MediaImage.id` antes do passo 1.

**3) Anexar a lista de GIDs ao produto via `metafieldsSet`**

```graphql
mutation SetSectionEfficacy($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields { id namespace key type value }
    userErrors { field message code }
  }
}
```

Variables:
```json
{
  "metafields": [{
    "ownerId": "gid://shopify/Product/<PRODUCT_GID>",
    "namespace": "custom",
    "key": "section_efficacy",
    "type": "list.metaobject_reference",
    "value": "[\"gid://shopify/Metaobject/<C1>\",\"gid://shopify/Metaobject/<C2>\",\"...\"]"
  }]
}
```

> Ordem importa — define ordem de exibição na PDP.

---

## 🔒 Shopify safety

- ✅ Tocar apenas `custom.section_efficacy` do produto pedido
- ❌ Nunca tocar `custom.eficiencia_do_produto` (esquema antigo) — pode ser deprecado mas não deletar sem instrução
- ❌ Nunca tocar outros metafields/title/status/variants
- ✅ Se já existem `eficiencia_item` linkados: perguntar se **substitui** lista, **apenda** novos ou **toggle** `state` dos existentes (`metaobjectUpdate`)
- ✅ Pra esconder card sem deletar: `metaobjectUpdate` com `state: Inactive` — mantém histórico

---

## 🚨 Guardrails regulatórios (CRÍTICO)

- ❌ Card numérico sem `footnote` → **bloquear publicação**
- ❌ Footnote vazia ou genérica ("estudo interno") → **bloquear**
- ❌ Claim médico ("trata acne", "elimina manchas", "cura") → encaminhar pra ANVISA
- ✅ Footnote precisa de: **metodologia + origem (instituto/n amostral) + ano**
  - Ex aceito: `*Autoavaliação Trustvox com n=320 clientes, 2025`
  - Ex aceito: `*Laudo IPCLIN nº 12345/2024, n=30, corneometria após 28 dias`
  - Ex rejeitado: `*Comprovado em testes`
- ✅ Badges (vegano, cruelty-free, hipoalergênico): só publicar se tiver **certificação oficial** (Coelho Azul/IBD, etc.) confirmada no brandbook
- ✅ Disclaimer "resultados podem variar" — sugerir adicionar via último card-badge ou texto separado fora do metaobjeto

---

## 📁 Output

```
conteudos/[marca]/produtos/[slug]/section-efficacy/
├── textos/
│   ├── content.md            # lista dos N cards em markdown
│   ├── content.json          # estruturado por card (number/text/footnote/icon_brief/bg_brief/state)
│   └── shopify-payload.json  # variables prontas pras 3 mutations
├── imagens/                  # opcional
│   ├── generated/
│   │   ├── icon-01-<slug>.png
│   │   ├── bg-01-<slug>.png
│   │   └── ...
│   └── prompts/
│       ├── icon-01-<slug>.txt
│       ├── icon-01-<slug>.meta.json
│       └── ...
└── shopify-result.json       # GIDs criados após publicar
```

### JSON

```json
{
  "metafield_key": "section_efficacy",
  "value": {
    "cards": [
      {
        "kind": "numeric",
        "number": "92%",
        "text": "notaram pele mais hidratada na 1ª semana",
        "footnote": "*Autoavaliação Trustvox com n=320 clientes, 2025",
        "icon": null,
        "background_image": null,
        "state": "Active"
      },
      {
        "kind": "badge",
        "number": null,
        "text": "Vegano e cruelty-free",
        "footnote": null,
        "icon": "imagens/generated/icon-02-vegano.png",
        "background_image": null,
        "state": "Active"
      }
    ]
  }
}
```

---

## 📝 Exemplo concreto — Hidratante Facial Pele de Porcelana (Kokeshi)

### Mix recomendado (4 cards: 2 numéricos + 2 badges)

| # | Tipo | number | text | footnote / icon |
|---|---|---|---|---|
| 1 | Numérico | `4.8/5` | nota média dos clientes Kokeshi | `*Base: 1625+ avaliações Trustvox verificadas, 2025` |
| 2 | Numérico | `1625+` | clientes já avaliaram | `*Trustvox, snapshot mai/2025` |
| 3 | Badge | — | Vegano e cruelty-free | icon: folha + coelho (gerar via PiApp) |
| 4 | Badge | — | Textura leve, não-comedogênica | icon: gota com pena (gerar via PiApp) |

### Texto pronto

```markdown
## Por que funciona

**4.8/5** — nota média dos clientes Kokeshi  
*Base: 1625+ avaliações Trustvox verificadas, 2025

**1625+** — clientes já avaliaram o Hidratante Facial Pele de Porcelana  
*Trustvox, snapshot mai/2025

🌿 **Vegano e cruelty-free** — fórmula sem ingredientes animais, não testada em animais

💧 **Textura leve** — não-comedogênica, indicada pra todos os tipos de pele
```

### Checklist de publicação

- [ ] Pra cada card numérico: `footnote` populada com metodologia + origem + ano?
- [ ] Pra cada card-badge: ícone gerado e uploaded em `fileStatus: READY`?
- [ ] Estilo dos ícones consistente entre todos os cards (mesmo weight, mesmo stroke)?
- [ ] `state: Active` em todos os cards a serem exibidos?
- [ ] Ordem dos GIDs no `metafieldsSet` reflete a ordem desejada na PDP?
- [ ] `ownerId` confirmado bate com produto pedido?
- [ ] Verificado se já existe `section_efficacy` linkado? (decisão: substituir/apendar/toggle state)
- [ ] PDP renderiza N cards na ordem correta com footnotes legíveis?
- [ ] `shopify-result.json` salvo com GIDs pra rastreabilidade?

---

## 🔄 Relação com o esquema antigo (`eficiencia_do_produto`)

| Aspecto | Antigo (`eficiencia_do_produto`) | Novo (`section_efficacy`) |
|---|---|---|
| Metafield type | `metaobject_reference` (1 só) | `list.metaobject_reference` (N) |
| Cards | Fixo: 3 números + 2 imagens (antes/depois) | Flexível: N cards independentes |
| Mistura numérico + badge | ❌ | ✅ |
| Soft delete (esconder sem perder) | ❌ | ✅ via `state: Inactive` |
| Footnote por card | ❌ (footnote única no objeto) | ✅ obrigatória em cada card numérico |
| Padrão Goshop | Legado | **Atual — usar este** |

**Migração**: pra produto novo, sempre usar `section_efficacy`. Pra produtos antigos com `eficiencia_do_produto`, criar `section_efficacy` em paralelo e (quando o tema render dos dois) deprecar o antigo via instrução explícita do usuário.
