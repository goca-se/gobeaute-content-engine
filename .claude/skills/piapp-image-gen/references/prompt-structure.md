# Anatomia do Prompt PiApp

Estrutura recomendada pelo PiApp pra geração de imagem:

```
[subject] + [setting] + [lighting] + [composition/camera angle] + [style] + [mood]
```

## Cada componente

### 1. SUBJECT — O que está na imagem

Descreva concretamente. Inclua:
- Pessoa: idade aproximada, etnia (pra representatividade), pose, expressão
- Objeto: tipo, formato, estado, detalhes
- Produto: descrição visual (se aplicável, sem mostrar embalagem com logo)

✅ "A Brazilian woman in her 30s with type 4A natural hair, neutral expression, looking softly off-camera"
❌ "A beautiful person with hair"

### 2. SETTING — Onde acontece

Ambientação que reflete a marca:
- Studio neutro (cream, gray, white)
- Lifestyle (banheiro, mesa de skincare, cozinha)
- Outdoor (golden hour, natureza, urbano)
- Abstract (background gradient, surface texture)

✅ "Clean cream-colored studio backdrop, minimal styling"
❌ "Somewhere nice"

### 3. LIGHTING — Iluminação

Crucial pra fotografia comercial:
- "Soft natural daylight from the left, gentle shadows"
- "Golden hour warm tones, glowing rim light"
- "Studio key light + soft fill, low contrast"
- "Diffused overhead light, no harsh shadows"

### 4. COMPOSITION / CAMERA ANGLE

- "Close-up portrait, eye level"
- "3/4 view, slightly elevated angle"
- "Top-down flat lay"
- "Wide shot, centered subject"
- "Macro detail of [X]"

### 5. STYLE — Estilo visual

Aqui entra o **BRAND VISUAL DNA**:
- "Photorealistic high-quality commercial photography"
- "Editorial fashion style, premium feel"
- "Minimalist line-art icon, flat design"
- "Hand-drawn organic illustration"
- "Cinematic, film grain, color graded"

### 6. MOOD — Sensação que a imagem transmite

- "Aspirational but accessible, authentic"
- "Calm, ritualistic, sensorial"
- "Confident, direct, masculine"
- "Fresh, energetic, natural"
- "Premium luxurious, sophisticated"

## Templates por purpose (carregar de `tool-mapping.md`)

Veja `tool-mapping.md` pra templates concretos por tipo de imagem (ícone, antes/depois, ingrediente, hero banner, blog cover, etc.).

## Regras universais (TODOS os prompts)

Sempre incluir no final:
- "NO text, NO letters, NO numbers in the image"
- "NO brand logos or product packaging with visible labels"
- "NO identifiable real people (celebrities, influencers)"
- "Aspect ratio: [X]:[Y]"
- "Style consistent with [BRAND NAME] visual identity: [BRAND VISUAL DNA]"
