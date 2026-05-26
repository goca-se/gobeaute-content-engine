# Illustrations — Blog (imagens internas de apoio)

2-4 imagens que aparecem no meio do artigo, ilustrando conceitos específicos das seções.

## Inputs

- ✅ Brand visual DNA + paleta
- ✅ Conceitos a ilustrar (1 por imagem) — perguntar se não claro
- ✅ Posicionamento no artigo (após qual seção)

---

## 📐 Specs

- Aspect: **4:5** (portrait, encaixa bem na coluna de texto)
- Quality: **standard** (não precisa 4k pra ilustração interna)
- Tool: **`generate_image_batch`** (se ≥ 2 imagens — garante consistência visual)

### Quantidade recomendada

| Word count | Ilustrações |
|---|---|
| 500 palavras | 1-2 |
| 800 palavras | 2-3 |
| 1200+ palavras | 3-4 |

---

## 🎨 Template prompt

```
Photorealistic supporting illustration for a blog article.

Subject: [SPECIFIC_CONCEPT_BEING_ILLUSTRATED — described concretely].

Setting: [BRAND_SETTING].
Lighting: [BRAND_LIGHTING].
Composition: [3/4 view OR close-up macro OR mid-shot].

Aspect ratio: 4:5 (portrait). Quality: standard.

Mood: editorial, supporting the article narrative.

NO text. NO logos.

Style consistent with [BRAND_NAME]: [BRAND_VISUAL_DNA].
```

---

## 📝 Exemplos de "subject" por contexto

### Conceito: hidratação de cachos
> "Close-up macro of healthy defined curls with natural shine, water droplets visible, soft warm light"

### Conceito: aplicação de produto
> "Hands gently applying cream to hair section, warm natural light, no visible product labels"

### Conceito: ingrediente natural
> "Still life of murumuru butter in wooden bowl on linen surface, soft side light, organic textures"

### Conceito: rotina de skincare
> "Top-down view of skincare products arranged on ceramic tray, soft pink ambient light, fresh feel"

### Conceito: bem-estar
> "Serene scene of person practicing self-care, soft profile silhouette, warm golden hour"

---

## 🚨 Guardrails

- ❌ Imagens com texto
- ❌ Estilo inconsistente entre as ilustrações do mesmo post
- ❌ Cor/luz divergindo da capa
- ❌ Pessoas reais identificáveis
- ✅ **Consistência visual** entre as ilustrações (mesma luz, paleta, mood)
- ✅ Paleta + DNA da marca aplicados
- ✅ Cada ilustração com conceito CLARO e diferente

### Crítico: batch para consistência

Quando ≥ 2 ilustrações → SEMPRE usar `generate_image_batch` em uma chamada só. Isso garante coerência visual entre as imagens (mesma luz, paleta, mood).

---

## 📁 Output

```
conteudos/[marca]/blogs/[slug]/imagens/
├── generated/
│   ├── illustration-01.png
│   ├── illustration-02.png
│   └── illustration-03.png
└── prompts/
    ├── illustration-01.txt
    ├── illustration-01.meta.json
    ├── illustration-02.txt
    ├── illustration-02.meta.json
    ├── illustration-03.txt
    └── illustration-03.meta.json
```

### Metadata (illustration-NN.meta.json)

```json
{
  "purpose": "blog-illustration",
  "brand": "apice",
  "blog_slug": "cuidados-com-cachos-no-verao",
  "tool": "generate_image_batch",
  "aspect_ratio": "4:5",
  "quality": "standard",
  "job_id": "...",
  "output_url": "...",
  "concept": "close-up de cachos hidratados",
  "position_in_article": "after-section-2",
  "generated_at": "2026-XX-XX"
}
```

## ✅ Checklist

- [ ] 4:5 portrait?
- [ ] Batch usado se ≥ 2?
- [ ] Consistência visual entre todas?
- [ ] Cada uma com conceito único?
- [ ] Mesma paleta da capa?
- [ ] Sem texto/logo?
