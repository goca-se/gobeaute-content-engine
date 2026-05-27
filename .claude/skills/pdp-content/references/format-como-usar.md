# Formato: Como Usar

**5 a 8 passos** + **1 imagem** ilustrando. Versão rica do Modo de Uso textual.

## Inputs necessários

- ✅ Marca + produto confirmados
- ✅ Modo de aplicação real
- ✅ Quantidade recomendada
- ✅ Frequência de uso

Pra imagem:
- ✅ Tipo de mídia (foto única, sequência, ou GIF — esta versão suporta só foto única)
- ✅ Estilo (mãos aplicando, autoaplicação, modelo)
- ✅ Brandbook visual

---

## 📐 Estrutura

### Texto — 5 a 8 passos

- Mínimo 5, máximo 8
- 1 linha cada (~10-15 palavras)
- Numerados
- Imperativo direto ("Aplique...", "Massageie...")
- Tom comercial (não bula)

### Imagem — 1 foto ilustrativa

Single shot via `generate_image` (não batch).

---

## 📝 Exemplos

### Hair Care (Ápice — Shampoo)

```markdown
## Como usar

1. Molhe completamente os cabelos com água morna.
2. Aplique uma porção do shampoo nas mãos e espalhe no couro cabeludo.
3. Massageie em movimentos circulares por 30 segundos.
4. Distribua a espuma pelo comprimento, sem esfregar.
5. Enxágue até remover todo o produto.
6. Repita se sentir necessidade.
7. Finalize com o Condicionador Cachos Ápice.

**Frequência:** 2-3x por semana.
```

### Skincare (Lescent — Sérum)

```markdown
1. Comece com a pele limpa e seca.
2. Aplique 2-3 gotas do sérum na ponta dos dedos.
3. Espalhe suavemente no rosto, evitando a área dos olhos.
4. Faça movimentos ascendentes do queixo até a testa.
5. Toque suave no pescoço e colo.
6. Aguarde 30s antes de aplicar o hidratante.

**Frequência:** 2x ao dia.
```

---

## 🎨 Geração da imagem via piapp-image-gen

`purpose`: `pdp-how-to-use`
`tool`: `generate_image`
`aspect_ratio`: `4:5` ou `1:1`
`quality`: `high`

### Template prompt (passar pra piapp-image-gen)

```
Photorealistic high-quality beauty product photography.
Showing [APPLICATION_ACTION — hands massaging shampoo / fingertips applying serum].

Subject: [SUBJECT_DESCRIPTION — pessoa, mãos, contexto].
Setting: [BRAND_SETTING — bathroom / vanity / lifestyle].

Lighting: soft natural daylight, [BRAND_LIGHTING_STYLE].
Color palette: [BRAND_PALETTE].

Aspect ratio: 4:5.
Mood: aspirational but accessible. Authentic.

NO text. NO logos. NO visible labels.

Style consistent with [BRAND_NAME]: [BRAND_VISUAL_DNA].
```

---

## 🚨 Guardrails

- ❌ Mais de 8 ou menos de 5 passos
- ❌ Passos com mais de 1 ação
- ❌ Tom de bula
- ❌ Esquecer frequência
- ❌ Inventar quantidade exata
- ❌ Citar produtos complementares sem confirmar existência
- ❌ Imagens com texto/logo
- ✅ Passos sequenciais, imperativos
- ✅ Frequência clara ao final

---

## 📁 Output

```
conteudos/[marca]/produtos/[slug]/como-usar/
├── textos/
│   ├── content.md
│   └── content.json
└── imagens/
    ├── generated/
    │   └── image-01.png
    └── prompts/
        ├── prompt-01.txt
        └── prompt-01.meta.json
```

### JSON

```json
{
  "metafield_key": "como-usar",
  "value": {
    "steps": [
      "Molhe completamente os cabelos com água morna.",
      "Aplique uma porção do shampoo nas mãos..."
    ],
    "frequency": "2-3x por semana",
    "media": {
      "type": "image",
      "path": "imagens/generated/image-01.png",
      "prompt_path": "imagens/prompts/prompt-01.txt"
    }
  }
}
```

## ✅ Checklist

- [ ] 5 a 8 passos?
- [ ] Cada passo em imperativo direto, 1 ação?
- [ ] Frequência clara?
- [ ] Tom de voz da marca?
- [ ] Produtos complementares (se citados) existem?
- [ ] Imagem sem texto/logo?

---

## 🔌 Publicação no Shopify — metaobjeto `como_usar` + metafield `custom.como_usar_session_pdp`

> O tema consome este formato via metafield **`custom.como_usar_session_pdp`** (label: `[Section] Como usar`). Tipo `metaobject_reference` (**singular**) apontando pra UM metaobjeto `como_usar`.

> ⚠️ **Não confundir** com `custom.como_usar` (rich_text de Precauções — outro metafield, outro propósito; ver `format-descricao.md`).

### Esquemas (autoritativos)

**Metafield definition**:
```yaml
namespace: custom
key: como_usar_session_pdp
name: "[Section] Como usar"
type: metaobject_reference
metaobject_definition_id: gid://shopify/MetaobjectDefinition/5423562959
```

**Metaobject definition** `como_usar`:
```yaml
type: como_usar
display_name_key: steps
description: "Conteúdo que será utilizado no metafield 'Como usar (session)' e renderizado na section Goshop How to Use PDP"
capabilities:
  publishable: true   # Active/Draft nativo
fields:
  - key: file    # imagem OU vídeo demonstrativo
    type: file_reference
    required: false
  - key: steps   # lista de passos (strings)
    type: list.single_line_text_field
    required: false
```

> ⚠️ `displayNameKey: steps` é list → **handle auto-gerado concatena todos os passos** e estoura 255 chars. **SEMPRE** passar `handle` explícito no `metaobjectCreate` (ex: `como-usar-<slug-do-produto>`).

### Workflow (4 passos)

1. [Opcional] Gerar imagem via `piapp-image-gen` com `purpose: pdp-how-to-use`, aspect 1:1, brand-aligned
2. Upload pra Shopify Files via `fileCreate` → pollar até READY → coletar `MediaImage` GID
3. Criar metaobjeto `como_usar` com `handle` explícito + `publishable.status: ACTIVE`:

```json
{
  "metaobject": {
    "type": "como_usar",
    "handle": "como-usar-<product-slug>",
    "capabilities": { "publishable": { "status": "ACTIVE" } },
    "fields": [
      { "key": "file",  "value": "gid://shopify/MediaImage/<ID>" },
      { "key": "steps", "value": "[\"Lave o rosto\",\"Aplique o tônico\",\"Coloque uma pequena quantidade\",\"Massageie em movimentos circulares\",\"Use à noite\"]" }
    ]
  }
}
```

4. Anexar ao produto:

```json
{
  "metafields": [{
    "ownerId": "<PRODUCT_GID>",
    "namespace": "custom",
    "key": "como_usar_session_pdp",
    "type": "metaobject_reference",
    "value": "<METAOBJECT_GID>"
  }]
}
```

### 🔒 Safety
- ✅ Tocar apenas `custom.como_usar_session_pdp`
- ❌ Nunca tocar `custom.como_usar` (precauções legais) ou `custom.how_to_use` (modo de uso texto simples)
- ✅ Steps: 5-8 passos idealmente, ação clara primeiro, contexto depois
- ✅ Se já existe metaobjeto linkado: `metaobjectUpdate` no GID existente (preserva histórico)
- ✅ Linguagem ANVISA-safe: "aplique", "massageie", "espalhe" — não "trata", "cura", "elimina"

### 📐 Reference do produto Hidratante Pele de Porcelana
Tem 6 passos populados — use como template de tom + escopo + estilo.

---

## 🔁 Convenções Goshop (estabelecidas 2026-05-27)

### Status default: ACTIVE (não DRAFT)

**Sempre** criar metaobjeto `como_usar` com `capabilities.publishable.status: "ACTIVE"`. Não deixar em DRAFT.

```json
{
  "metaobject": {
    "type": "como_usar",
    "handle": "<product-slug>-como-usar",
    "capabilities": { "publishable": { "status": "ACTIVE" } },
    "fields": [...]
  }
}
```

### Handle naming: `<product-slug>-como-usar`

Como `displayNameKey: steps` gera handle longo (concatenação das steps que estoura 255 chars), **sempre passar handle explícito** com slug do produto. Ex: `kit-pele-plena-como-usar`, `rosa-mosqueta-100-como-usar`.
