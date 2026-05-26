# Formato: Thumbnail — Collection Card

Imagem 1:1 usada em cards/grids de collections (homepage, navegação, etc.).

## Inputs

- ✅ Brand + collection
- ✅ Conceito visual (pode reaproveitar do hero ou ser variação mais "stilllife")

---

## 📐 Estrutura

- Aspect: 1:1
- Quality: high
- Composição: foco central, leitura clara em tamanho pequeno (300x300px)
- Pode ter espaço pra overlay de texto (nome da collection) ou ser puramente imagética

---

## 🎨 Geração via piapp-image-gen

`purpose`: `collection-thumb`
`tool`: `generate_image`
`aspect_ratio`: `1:1`
`quality`: `high`

### Template prompt

```
Photorealistic high-quality commercial photography.

Subject: [COLLECTION_CONCEPT — produtos arranjados / hero scene em crop 1:1 / ingrediente icônico].

Composition: centered, balanced, readable at small thumbnail size (300x300px).
Lighting: [BRAND_LIGHTING].
Color palette: [BRAND_PALETTE].

Aspect ratio: 1:1. Quality: high.

Mood: [COLLECTION_MOOD aligned with hero].

NO text. NO logos.

Style consistent with [BRAND_NAME]: [BRAND_VISUAL_DNA].
```

---

## 🚨 Guardrails

- ❌ Composição complexa que não lê em 300x300
- ❌ Texto na imagem
- ❌ Variar paleta da hero (devem combinar visualmente)
- ✅ Composição simples, foco claro
- ✅ Mesma paleta do hero

---

## 📁 Output

```
conteudos/[marca]/collections/[slug]/
├── textos/
│   └── thumbnail-meta.json
└── imagens/
    ├── generated/
    │   └── thumbnail.png
    └── prompts/
        ├── thumbnail.txt
        └── thumbnail.meta.json
```

### JSON

```json
{
  "type": "collection-thumbnail",
  "brand": "apice",
  "collection_handle": "linha-cachos",
  "value": {
    "image_path": "imagens/generated/thumbnail.png",
    "prompt_path": "imagens/prompts/thumbnail.txt",
    "aspect_ratio": "1:1"
  }
}
```

## ✅ Checklist

- [ ] Lê bem em 300x300px?
- [ ] Mesma paleta do hero?
- [ ] Sem texto/logo?
