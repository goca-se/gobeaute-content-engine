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

## ✅ Checklist

- [ ] 3-6 ingredientes destacados?
- [ ] Cada ingrediente está no INCI oficial?
- [ ] Descrição em 3 linhas?
- [ ] Sem claims médicos?
- [ ] Estilo visual consistente entre as imagens?
- [ ] Texto de fechamento presente?
- [ ] Sem texto/logo nas imagens?
