# Tool Mapping — purpose × PiApp tool/params

## Tabela de mapeamento

| Purpose | Tool PiApp | Aspect | Quality | Notas |
|---|---|---|---|---|
| `pdp-icon` (ícones de benefício) | `generate_image_batch` | 1:1 | standard | Batch de 3, estilo minimal icon |
| `pdp-before` | `generate_image` | 1:1 ou 4:5 | high | Pareado com pdp-after |
| `pdp-after` | `generate_image` | 1:1 ou 4:5 | high | Pareado com pdp-before |
| `pdp-ingredient` | `generate_image_batch` | 1:1 | high | Batch de 3-6, still life |
| `pdp-how-to-use` | `generate_image` | 4:5 ou 1:1 | high | Mãos/aplicação |
| `collection-hero` | `generate_image` | 16:9 ou 21:9 | 4k | Banner principal |
| `collection-thumb` | `generate_image` | 1:1 | high | Thumbnail/card |
| `blog-cover` | `generate_image` | 16:9 | high | Capa do artigo |
| `blog-illustration` | `generate_image_batch` | 4:5 | standard | 2-4 imagens internas |
| `component-home-hero` | `generate_image` | 21:9 ou 16:9 | 4k | Hero da home |
| `component-home-banner-mid` | `generate_image` | 16:9 | high | Banner intermediário |
| `component-testimonial-avatar` | `generate_image_batch` | 1:1 | standard | Avatares (se sintético) |
| `component-usp-icon` | `generate_image_batch` | 1:1 | standard | Mesmo padrão de pdp-icon |

## Templates de prompt por purpose

### `pdp-icon`

```
A minimalist [STYLE: line art / flat / 3D rendered] icon representing
"[BENEFIT_TITLE]" for a beauty product.

Visual style: [BRAND_VISUAL_DNA — keep clean, organic, recognizable at 32x32px].
Color palette: [BRAND_PRIMARY_COLOR_HEX] on transparent background.

Background: transparent. Square 1:1 aspect ratio.
NO text. NO letters. NO numbers. NO logos.
Centered composition. Simple geometry.

The icon should clearly communicate the concept of [BENEFIT_DESCRIPTION_SHORT].

Style consistent with [BRAND_NAME] brand identity: [BRAND_VISUAL_DNA].
```

> **Batch tip**: gerar os 3 ícones do produto em UMA chamada `generate_image_batch` pra garantir consistência visual.

### `pdp-before` / `pdp-after`

**ANTES:**
```
Photorealistic high-quality beauty photography.
Close-up portrait of [MODEL_DESCRIPTION].

Showing: [PROBLEM_STATE — ex: hair with visible frizz, undefined curls, dryness].

Lighting: [BRAND_LIGHTING — ex: soft natural daylight from the left, warm tones].
Background: [BRAND_BACKGROUND].

Aspect ratio: 1:1 (or 4:5).
Mood: HONEST and REALISTIC, NOT exaggerated. Authentic texture.
NO heavy filters. NO text. NO logos. NO product packaging.

Style consistent with [BRAND_NAME] visual identity: [BRAND_VISUAL_DNA].
```

**DEPOIS:**
```
[EXACT SAME MODEL_DESCRIPTION, LIGHTING, BACKGROUND from "ANTES"]

Showing: [RESULT_STATE — same subject, condition visibly improved REALISTICALLY].

Same person, same outfit, same setting, same framing.
ONLY the [hair/skin condition] improved in a believable way.

NO dramatic transformations. NO unrealistic perfection.
NO heavy filters. NO text. NO logos.
```

> **Crítico**: gerar como **batch de 2** com `image_assignments` pra garantir consistência absoluta entre antes/depois.

### `pdp-ingredient`

```
Photorealistic high-quality commercial product photography of [INGREDIENT_NAME].

Subject: [INGREDIENT_DETAIL — ex: a coconut cracked open with droplets / wooden bowl of murumuru butter / glass jar of honey with honeycomb].

Composition: still life, clean, centered, slightly elevated angle (3/4 view).

Lighting: soft natural daylight from the side. Subtle highlights, soft shadows.
Mood: fresh, natural, premium.

Background: [BRAND_BACKGROUND — warm cream linen / wooden surface / marble].
Color palette: [BRAND_PALETTE].

Aspect ratio: 1:1. High resolution. Commercial product quality.

NO text. NO labels. NO brand names. NO packaging.
NO human hands or faces. Just the ingredient itself.

Style consistent with [BRAND_NAME] visual identity: [BRAND_VISUAL_DNA].
```

> **Batch de 3-6**: ingredientes do mesmo produto via `generate_image_batch` pra consistência da campanha.

### `pdp-how-to-use`

```
Photorealistic high-quality beauty product photography.
Showing [APPLICATION_ACTION — ex: hands massaging shampoo into curly hair / fingertips applying serum to cheek].

Subject: [SUBJECT_DESCRIPTION].
Setting: [BRAND_SETTING — clean bathroom / lifestyle vanity / minimal table].

Lighting: soft natural daylight, [BRAND_LIGHTING_STYLE].
Color palette: [BRAND_PALETTE].

Aspect ratio: [4:5 OR 1:1].
Mood: aspirational but accessible. Authentic, NOT staged-corporate.

NO text. NO logos. NO brand names visible.

Style consistent with [BRAND_NAME] visual identity: [BRAND_VISUAL_DNA].
```

### `collection-hero`

```
Photorealistic high-quality fashion/beauty editorial photography.

Subject: [COLLECTION_HERO_CONCEPT — ex: 3 hair products arranged on stone surface with botanical elements / model with defined curls in natural setting].

Setting: [BRAND_SETTING — premium, brand-aligned].
Lighting: [BRAND_LIGHTING — cinematic, premium feel].
Composition: wide cinematic shot, room for headline text overlay (centered or left-aligned space).

Aspect ratio: 21:9 (or 16:9). Quality: 4k.

Mood: [COLLECTION_MOOD — aspirational, premium, evocative of the collection theme].

NO text in image (text overlay added separately).
NO visible product logos.

Style consistent with [BRAND_NAME] visual identity: [BRAND_VISUAL_DNA].
```

### `blog-cover`

```
Photorealistic high-quality editorial photography.

Subject: [BLOG_TOPIC_VISUAL — ex: woman in summer setting applying hair product / serene wellness scene with herbal tea].

Setting: [LIFESTYLE_SCENE matching blog theme].
Lighting: [WARM_NATURAL_LIGHTING].
Composition: editorial wide shot, room for title overlay (top or bottom third).

Aspect ratio: 16:9. Quality: high.

Mood: [BLOG_MOOD — inviting, informative, brand-aligned].

NO text. NO logos.

Style consistent with [BRAND_NAME] visual identity: [BRAND_VISUAL_DNA].
```

### `blog-illustration`

```
Photorealistic supporting illustration for a blog article.

Subject: [SPECIFIC_CONCEPT_BEING_ILLUSTRATED — ex: close-up of curly hair texture / hands holding cup of herbal tea].

Setting: [BRAND_SETTING].
Lighting: [BRAND_LIGHTING].
Composition: [3/4 view OR close-up macro OR mid-shot].

Aspect ratio: 4:5 (portrait, fits column). Quality: standard.

Mood: editorial, supporting the article narrative.

NO text. NO logos.

Style consistent with [BRAND_NAME] visual identity: [BRAND_VISUAL_DNA].
```

### `component-home-hero`

```
Photorealistic high-end commercial photography.

Subject: [HOME_HERO_CONCEPT — flagship product or aspirational lifestyle moment representing brand essence].

Setting: [PREMIUM_BRAND_SETTING].
Lighting: [CINEMATIC_BRAND_LIGHTING].
Composition: ultra-wide, leaves significant negative space for headline + CTA overlay.

Aspect ratio: 21:9. Quality: 4k.

Mood: aspirational, brand-defining moment.

NO text. NO logos.

Style consistent with [BRAND_NAME] visual identity: [BRAND_VISUAL_DNA].
```

### `component-home-banner-mid`

```
Photorealistic commercial lifestyle photography.

Subject: [MID_BANNER_CONCEPT — secondary message, ex: ingredient story, "knowing your hair type", seasonal promo theme].

Setting: [BRAND_SETTING].
Lighting: [BRAND_LIGHTING].
Composition: medium wide, balanced for split layout (image left/right + text other side).

Aspect ratio: 16:9. Quality: high.

Mood: editorial, supporting the brand narrative.

NO text. NO logos.

Style consistent with [BRAND_NAME] visual identity: [BRAND_VISUAL_DNA].
```

### `component-testimonial-avatar`

```
Photorealistic portrait photography of a customer.

Subject: [PERSONA_DESCRIPTION — Brazilian person, age range, natural appearance, friendly approachable expression].

Setting: neutral soft background.
Lighting: soft natural daylight.
Composition: square portrait, head-and-shoulders, eye-level.

Aspect ratio: 1:1. Quality: standard.

Mood: trustworthy, authentic, relatable.

⚠️ This avatar represents a fictional customer — NOT a real identifiable person.
NO text. NO logos. NO branded clothing.

Style consistent with [BRAND_NAME] visual identity: [BRAND_VISUAL_DNA].
```

> **Importante**: depoimentos sintéticos devem ser claramente identificados como ilustrativos no copy do componente, NUNCA passados como clientes reais. Se quiser depoimento real → usar foto real autorizada.

### `component-usp-icon` / `pdp-icon` (mesmo padrão)

Ver template em `pdp-icon` acima.
