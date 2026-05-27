# Formato: Ingredientes

3-6 ingredientes destacados com **imagem + título + descrição**, mais texto comercial de fechamento.

## ⚠️ Inputs CRÍTICOS

- ✅ Marca + produto confirmados
- ✅ **Lista de ingredientes destacados** (3-6 — PERGUNTAR quais)
- ✅ **Composição/INCI** oficial (não inventar)
- ✅ Origem dos ingredientes (se diferencial)
- ✅ Brandbook visual

🚨 **Sem lista oficial → PERGUNTAR. Não inventar.**

---

## 📐 Estrutura

Para **cada ingrediente** (3-6, recomendo 4):

```
[IMAGEM]
[Título — nome popular]
[Descrição — máximo 3 linhas]
```

E ao final:

```
[Texto comercial de fechamento — sinergia do conjunto]
```

---

## 📝 Anatomia

### Imagem
- Foto comercial alta qualidade do ingrediente real
- Estilo: clean still life ou lifestyle
- 1:1 (1024x1024+)
- Coerente com brandbook

### Título
- Nome popular (não INCI): "Óleo de Coco" ✅ / "Cocos Nucifera Oil" ❌
- 1-3 palavras
- Capitalize

### Descrição
- Máximo 3 linhas curtas (~30-40 palavras)
- Tom comercial, não técnico
- Estrutura sugerida:
  - Linha 1: o que é / origem
  - Linha 2: o que faz no produto
  - Linha 3: benefício final

### Fechamento
- 2-4 linhas
- Sinergia do conjunto
- Tom da marca

---

## 📝 Exemplo (Auá — Creme Capilar)

```markdown
## Ingredientes que fazem a diferença

### 🥥 Óleo de Coco
Extraído da polpa fresca do coco brasileiro, é rico em ácidos graxos que penetram no fio.
Atua na nutrição profunda, devolvendo maciez e brilho natural.
Perfeito para cabelos ressecados que pedem hidratação intensa.

### 🌳 Murumuru da Amazônia
Fruto nativo da floresta amazônica, colhido de forma sustentável.
Sua textura cremosa cria uma película protetora que sela a hidratação.
Resulta em cachos definidos e com toque amanteigado.

### 🌿 Pantenol (Provitamina B5)
Aliado clássico da saúde capilar, penetra na cutícula e reforça a estrutura.
Promove força e elasticidade, reduzindo a aparência de quebra.
Essencial para um cabelo com mais resistência ao dia a dia.

### 🍯 Mel Silvestre
Adoçante natural com propriedades emolientes, atua como umectante.
Ajuda a manter a hidratação interna do fio mesmo em climas secos.
Para cabelos macios, brilhantes e com vitalidade.

---

A combinação de ingredientes da nossa floresta com ativos clinicamente reconhecidos entrega
o melhor dos dois mundos: a riqueza ancestral da Amazônia e a eficácia moderna que seu cabelo
precisa todo dia.
```

---

## 🎨 Geração via piapp-image-gen

`purpose`: `pdp-ingredient`
`tool`: **`generate_image_batch`** (3-6 prompts juntos pra consistência)
`aspect_ratio`: `1:1`
`quality`: `high`

### Template prompt (1 por ingrediente)

```
Photorealistic high-quality commercial product photography of [INGREDIENT_NAME].

Subject: [INGREDIENT_DETAIL].
Composition: still life, clean, centered, 3/4 view.
Lighting: soft natural daylight from side. Subtle highlights.
Mood: fresh, natural, premium.

Background: [BRAND_BACKGROUND].
Color palette: [BRAND_PALETTE].

Aspect ratio: 1:1. High resolution.

NO text. NO labels. NO brand names. NO packaging.
NO human hands or faces.

Style consistent with [BRAND_NAME]: [BRAND_VISUAL_DNA].
```

---

## 🚨 Guardrails

- ❌ Inventar ingrediente não presente no INCI
- ❌ Atribuir benefício médico ("cura caspa")
- ❌ Citar % de concentração sem fonte
- ❌ "Extraído de comunidades sustentáveis" sem confirmação
- ❌ Imagem de produto/embalagem (são os INGREDIENTES)
- ❌ Texto técnico-farmacêutico
- ✅ Validar todos contra composição oficial
- ✅ Descrição em 3 linhas máximo
- ✅ Tom comercial, não bula
- ✅ Estilo visual consistente entre as imagens (mesmo BG, mesma luz, mesmo ângulo)

---

## 📁 Output

```
conteudos/[marca]/produtos/[slug]/ingredientes/
├── textos/
│   ├── content.md
│   └── content.json
└── imagens/
    ├── generated/
    │   ├── image-01-coco.png
    │   ├── image-02-murumuru.png
    │   └── ... (3-6)
    └── prompts/
        ├── prompt-01-coco.txt
        ├── prompt-01-coco.meta.json
        └── ... (3-6 pares)
```

### JSON

```json
{
  "metafield_key": "ingredientes",
  "value": {
    "items": [
      {
        "name": "Óleo de Coco",
        "image_path": "imagens/generated/image-01-coco.png",
        "prompt_path": "imagens/prompts/prompt-01-coco.txt",
        "description": "Extraído da polpa fresca do coco brasileiro, é rico em ácidos graxos..."
      },
      {
        "name": "Murumuru da Amazônia",
        "image_path": "imagens/generated/image-02-murumuru.png",
        "prompt_path": "imagens/prompts/prompt-02-murumuru.txt",
        "description": "Fruto nativo da floresta amazônica..."
      }
    ],
    "closing_text": "A combinação de ingredientes da nossa floresta com ativos..."
  }
}
```

## ✅ Checklist (conteúdo)

- [ ] 3-6 ingredientes destacados?
- [ ] Cada ingrediente está no INCI oficial?
- [ ] Descrição em 3 linhas?
- [ ] Sem claims médicos?
- [ ] Estilo visual consistente entre as imagens?
- [ ] Texto de fechamento presente?
- [ ] Sem texto/logo nas imagens?

---

## 🔌 Publicação no Shopify — metaobjeto `product_ingredients` + metafield `custom.product_ingredients_metafield`

> O tema da loja consome essa seção via metafield de produto **`custom.product_ingredients_metafield`** (label visível: `[Section] Ingredientes`). Tipo `list.metaobject_reference` que aponta pra uma lista ordenada de metaobjetos do tipo **`product_ingredients`** — cada ingrediente é um metaobjeto separado.

> ⚠️ **Não confundir** com `custom.ingredients` (`[Info] Ingredientes`), que é `rich_text_field` puro — esse é pro INCI completo / declaração legal, não pra ingredientes destacados com imagem.

### Esquemas (autoritativos)

**Metafield definition** (no produto):
```yaml
namespace: custom
key: product_ingredients_metafield
name: "[Section] Ingredientes"
type: list.metaobject_reference
metaobject_definition_id: gid://shopify/MetaobjectDefinition/5429264591
```

**Metaobject definition** `product_ingredients`:
```yaml
type: product_ingredients
display_name_key: ingredient_title
fields:
  - key: ingredient_title         # nome popular do ativo
    type: single_line_text_field
  - key: ingredient_image         # foto do ingrediente — File (image)
    type: file_reference
    validations: { file_type_options: ["Image"] }
  - key: ingredient_url           # link pra blog post / página educativa (opcional)
    type: url
  - key: ingredient_description   # rich_text — descrição comercial
    type: rich_text_field
```

> Todos os campos opcionais. Mínimo viável: `ingredient_title` + `ingredient_description`. Ideal: os 4 (com imagem + link pra blog post relacionado).

### Workflow de publicação (4 passos)

**1) Gerar as N imagens dos ingredientes via PiApp**

`generate_image_batch` com prompts pareados (mesma luz/fundo/ângulo) — ver seção "Geração via piapp-image-gen" acima. Coletar URLs assinadas dos outputs.

**2) Upload das N imagens pra Shopify Files**

```graphql
mutation UploadIngredientImages($files: [FileCreateInput!]!) {
  fileCreate(files: $files) {
    files { id fileStatus alt }
    userErrors { field message code }
  }
}
```

Variables — passar `originalSource` com a URL assinada do PiApp, `alt` descritivo:
```json
{
  "files": [
    { "contentType": "IMAGE", "alt": "Óleo de Farelo de Arroz — ingrediente do Hidratante Pele de Porcelana", "originalSource": "https://...piapp.png" },
    { "contentType": "IMAGE", "alt": "...", "originalSource": "..." }
  ]
}
```

Pollar até `fileStatus: READY` (Shopify rehospeda na CDN). Coletar `MediaImage.id` de cada um.

**3) Criar N metaobjetos `product_ingredients` (1 mutation com aliases)**

```graphql
mutation CreateIngredients(
  $i1: MetaobjectCreateInput!
  $i2: MetaobjectCreateInput!
  # ... até iN
) {
  ing1: metaobjectCreate(metaobject: $i1) { metaobject { id handle } userErrors { field message code } }
  ing2: metaobjectCreate(metaobject: $i2) { metaobject { id handle } userErrors { field message code } }
  # ...
}
```

Variables (exemplo de 1 ingrediente):
```json
{
  "metaobject": {
    "type": "product_ingredients",
    "fields": [
      { "key": "ingredient_title", "value": "Óleo de Farelo de Arroz" },
      { "key": "ingredient_image", "value": "gid://shopify/MediaImage/<ID_DA_IMAGEM>" },
      { "key": "ingredient_url",   "value": "https://kokeshi.com.br/blogs/news/poder-do-arroz-na-skincare" },
      { "key": "ingredient_description", "value": "{\"type\":\"root\",\"children\":[{\"type\":\"paragraph\",\"children\":[{\"type\":\"text\",\"value\":\"Rico em gama-orizanol e vitamina E, atua como antioxidante natural protegendo a pele dos radicais livres. Hidrata profundamente sem deixar oleosidade.\"}]}]}" }
    ]
  }
}
```

Coletar GIDs retornados (formato `gid://shopify/Metaobject/...`) na ordem desejada.

**4) Anexar a lista de GIDs ao produto via `metafieldsSet`**

```graphql
mutation SetIngredients($metafields: [MetafieldsSetInput!]!) {
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
    "key": "product_ingredients_metafield",
    "type": "list.metaobject_reference",
    "value": "[\"gid://shopify/Metaobject/<GID_1>\",\"gid://shopify/Metaobject/<GID_2>\",\"...\"]"
  }]
}
```

> Como é `list.metaobject_reference`, o `value` é uma string JSON com array de GIDs na ordem que serão exibidos na PDP.

### 🔒 Shopify safety

- ✅ Tocar apenas `custom.product_ingredients_metafield` do produto pedido
- ❌ Nunca tocar `custom.ingredients` (`[Info] Ingredientes` — declaração INCI legal — só atualizar quando explicitamente pedido)
- ❌ Nunca tocar outros metafields/title/status
- ✅ Se já existem metaobjetos `product_ingredients` linkados: perguntar ao usuário **substitui** (cria novos) ou **atualiza in-place** (`metaobjectUpdate`) ou **estende**

### 🚨 Guardrail regulatório

- ✅ Cada `ingredient_title` deve corresponder a um ingrediente real do INCI oficial do produto
- ✅ `ingredient_description` segue tom comercial — sem claim médico, sem "cura X", sem % concentração sem fonte
- ✅ Imagem é do **ingrediente** (matéria-prima/origem natural), não da embalagem do produto
- ✅ Alt text descritivo populado em cada `MediaImage` no upload (acessibilidade + SEO)
- ✅ Se `ingredient_url` apontar pra blog post — confirmar que o post existe e está publicado

---

## 📝 Exemplo concreto — Hidratante Facial Pele de Porcelana (Kokeshi)

**Contexto do produto:**
- 5 ativos principais: Óleo de Farelo de Arroz, Farinha de Arroz, Rosa Mosqueta, Pantenol, Óleo de Amêndoa Doce
- Tom Kokeshi: K-beauty, glass-skin, delicado, kute
- Paleta: pastel rosa (#F8D7DA) + ivory (#FFF5EF)

### Os 5 ingredientes (briefing)

| # | Ingrediente | INCI | Benefício comercial (3 linhas máx) |
|---|---|---|---|
| 1 | Óleo de Farelo de Arroz | Oryza Sativa Bran Oil | Rico em gama-orizanol e vitamina E. Antioxidante natural que protege a pele dos radicais livres. Hidrata profundamente sem deixar oleosidade. |
| 2 | Farinha de Arroz | Oryza Sativa Powder | Fonte natural de ácido ferúlico. Atua na uniformização do tom e luminosidade. Ideal pra quem busca o efeito glass-skin. |
| 3 | Rosa Mosqueta | Rosa Canina Fruit Oil | Óleo extraído da semente da rosa selvagem, rico em vitamina A natural. Regenera a pele e suaviza marquinhas com o tempo. |
| 4 | Pantenol | Panthenol | Provitamina B5 reconhecida na dermocosmética. Hidratação profunda e ação calmante. Reduz a sensação de pele repuxada. |
| 5 | Óleo de Amêndoa Doce | Prunus Amygdalus Dulcis Oil | Emoliente clássico, rico em ácidos graxos essenciais. Nutre e amacia mantendo a barreira de proteção da pele. |

### Texto de fechamento (sinergia)

> A combinação do poder do arroz (Farelo + Farinha) com Rosa Mosqueta, Pantenol e Amêndoa Doce traz o melhor da skincare oriental e brasileira — hidratação profunda, antioxidação e efeito glass-skin numa fórmula leve, ideal pra rotina noturna.

### Variables prontas pra `metaobjectCreate` (exemplo do item 1 — replicar pros 5)

```json
{
  "metaobject": {
    "type": "product_ingredients",
    "fields": [
      { "key": "ingredient_title", "value": "Óleo de Farelo de Arroz" },
      { "key": "ingredient_image", "value": "gid://shopify/MediaImage/<ID_IMG_FARELO_ARROZ>" },
      { "key": "ingredient_description", "value": "{\"type\":\"root\",\"children\":[{\"type\":\"paragraph\",\"children\":[{\"type\":\"text\",\"value\":\"Rico em gama-orizanol e vitamina E. Antioxidante natural que protege a pele dos radicais livres. Hidrata profundamente sem deixar oleosidade.\"}]}]}" }
    ]
  }
}
```

### Variables prontas pra `metafieldsSet` (após criar os 5)

```json
{
  "metafields": [{
    "ownerId": "gid://shopify/Product/7312644931791",
    "namespace": "custom",
    "key": "product_ingredients_metafield",
    "type": "list.metaobject_reference",
    "value": "[\"gid://shopify/Metaobject/<GID_1>\",\"gid://shopify/Metaobject/<GID_2>\",\"gid://shopify/Metaobject/<GID_3>\",\"gid://shopify/Metaobject/<GID_4>\",\"gid://shopify/Metaobject/<GID_5>\"]"
  }]
}
```

### Output a salvar no repo

```
conteudos/kokeshi/produtos/hidratante-facial-pele-de-porcelana/ingredientes/
├── textos/
│   ├── content.md            # 5 ativos + sinergia em markdown
│   ├── content.json          # estruturado
│   └── shopify-payload.json  # variables prontas pras 3 mutations
├── imagens/
│   ├── generated/
│   │   ├── image-01-farelo-arroz.png
│   │   ├── image-02-farinha-arroz.png
│   │   ├── image-03-rosa-mosqueta.png
│   │   ├── image-04-pantenol.png
│   │   └── image-05-amendoa-doce.png
│   └── prompts/
│       ├── prompt-01-farelo-arroz.txt
│       ├── prompt-01-farelo-arroz.meta.json
│       └── ... (5 pares)
└── shopify-result.json       # GIDs criados após publicar
```

### Checklist de publicação Shopify

- [ ] 5 imagens geradas e aprovadas (mesma luz/fundo/composição — consistência)?
- [ ] 5 imagens uploadeadas com alt text descritivo, todas em `fileStatus: READY`?
- [ ] 5 metaobjetos `product_ingredients` criados sem `userErrors`?
- [ ] `ingredient_description` em todos os 5 é Rich Text JSON válido (não string crua)?
- [ ] `ownerId` confirmado bate com produto pedido?
- [ ] Verificado se já existem `product_ingredients` linkados (substituir/atualizar)?
- [ ] Mutation `metafieldsSet` rodou com lista ordenada dos 5 GIDs?
- [ ] PDP renderiza os 5 ingredientes com imagem + título + descrição?
- [ ] `shopify-result.json` salvo com GIDs pra rastreabilidade?
