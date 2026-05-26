# Formato: Hero Banner — Collection

Banner principal da página de collection. Imagem cinematográfica + headline + subhead + CTA.

## Inputs

- ✅ Brand + collection do bundle
- ✅ Big idea da collection (do `collections/[slug].md` ou perguntar)
- ✅ Tema visual (estação, ocasião)
- ✅ Mood específico
- ✅ Headline preferida ou autorização pra gerar

---

## 📐 Estrutura

```
[IMAGEM CINEMATOGRÁFICA — 21:9 ou 16:9]

[HEADLINE — 4-6 palavras]
[SUBHEAD — até 15 palavras]
[CTA — 2-3 palavras]
```

### Headline
- 4-6 palavras (máximo 8)
- Impacto emocional + clareza
- Tom da marca

### Subhead
- Até 15 palavras
- Contextualiza a promessa do headline
- Comercial mas honesto

### CTA
- Verbo de ação curto: "Descubra", "Explore", "Comprar Agora", "Ver Coleção"

---

## 📝 Exemplos por marca

### Ápice — Linha Cachos

```
[Imagem: mulher brasileira 30s com cachos definidos em setting natural cream/terracotta]

HEADLINE: Cachos com identidade
SUBHEAD: A rotina completa que valoriza cada onda, curva e espiral do seu cabelo
CTA: Conheça a linha
```

### Rituária — Black Friday

```
[Imagem: still life ritualístico com produtos em paleta dusty terracotta + sage]

HEADLINE: Bem-estar em ritual
SUBHEAD: Toda a coleção Rituária com até 40% off no Black Friday
CTA: Aproveitar agora
```

### Auá — Linha Amazônia

```
[Imagem: ingredientes amazônicos em arranjo natural com folhagem]

HEADLINE: A floresta no seu cabelo
SUBHEAD: Murumuru, copaíba e açaí em fórmulas que celebram nossa terra
CTA: Ver a coleção
```

---

## 🎨 Imagem via piapp-image-gen

`purpose`: `collection-hero`
`tool`: `generate_image`
`aspect_ratio`: `21:9` (ou `16:9` se for mais comum no theme)
`quality`: `4k`

### Template prompt (passar pra piapp-image-gen)

```
Photorealistic high-quality fashion/beauty editorial photography.

Subject: [COLLECTION_HERO_CONCEPT].

Setting: [BRAND_SETTING premium aligned].
Lighting: [BRAND_LIGHTING cinematic].
Composition: wide cinematic shot, room for headline text overlay (centered or left-aligned negative space).

Aspect ratio: 21:9. Quality: 4k.

Mood: [COLLECTION_MOOD — aspirational, evocative].

NO text in image (text overlay added separately by frontend).
NO visible product logos.

Style consistent with [BRAND_NAME]: [BRAND_VISUAL_DNA].
```

### 🚨 Importante

Sempre deixar espaço de **negative space** pra overlay de texto. Pedir explicitamente no prompt:
- "left-aligned negative space" ou
- "centered composition with breathing room" ou
- "bottom third clear for text overlay"

---

## 🚨 Guardrails

- ❌ Texto dentro da imagem (gera no overlay HTML/CSS)
- ❌ Logo visível no hero
- ❌ Conceito visual sem aprovação do usuário
- ❌ CTA genérico ("Clique aqui")
- ✅ Espaço pra overlay de texto
- ✅ Mood evocativo da collection
- ✅ Headline em até 6 palavras

---

## 📁 Output

```
conteudos/[marca]/collections/[slug]/
├── textos/
│   ├── hero.md
│   └── hero.json
└── imagens/
    ├── generated/
    │   └── hero.png
    └── prompts/
        ├── hero.txt
        └── hero.meta.json
```

### JSON

```json
{
  "type": "collection-hero",
  "brand": "apice",
  "collection_handle": "linha-cachos",
  "value": {
    "headline": "Cachos com identidade",
    "subhead": "A rotina completa que valoriza cada onda, curva e espiral do seu cabelo",
    "cta": {
      "label": "Conheça a linha",
      "url": "/collections/linha-cachos"
    },
    "image": {
      "path": "imagens/generated/hero.png",
      "prompt_path": "imagens/prompts/hero.txt",
      "aspect_ratio": "21:9"
    },
    "overlay_position": "left"
  }
}
```

## ✅ Checklist

- [ ] Headline ≤ 6 palavras?
- [ ] Subhead ≤ 15 palavras?
- [ ] CTA com verbo de ação?
- [ ] Imagem tem espaço pra overlay?
- [ ] Tom da marca?
- [ ] Sem texto na imagem?
