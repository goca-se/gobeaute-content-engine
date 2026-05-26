# PiApp Style Presets — DNA Visual por Marca

Presets que `piapp-image-gen` aplica automaticamente nos prompts. Cada preset é um "snippet" que vai no campo `style` + `mood` do prompt PiApp.

> ⚠️ **Estes são presets BASE**. O DNA visual definitivo de cada marca está no `brand-context/[marca]/brandbook.md`. Se brandbook estiver populado, ele tem precedência.

## 🌿 Ápice

```yaml
visual_dna: "modern, technical-yet-warm, premium minimal, brazilian curl culture aesthetic"
palette:
  primary: "#C97D60"     # terracotta
  secondary: "#F5E6D3"   # cream
  accent: "#2C2C2C"      # charcoal
lighting_default: "soft natural daylight, warm tones, gentle shadows"
photo_style: "Photorealistic high-quality commercial beauty photography"
icon_style: "minimalist line art, 2px stroke, organic curves"
mood: "empowering, scientific yet caring"
```

## 🧔 Barbour's

```yaml
visual_dna: "masculine, confident, monochrome with bold accents, clean grooming aesthetic, no fluff"
palette:
  primary: "#1A1A1A"     # near-black
  secondary: "#F2F2F2"   # off-white
  accent: "#8B6F47"      # warm wood/tobacco
lighting_default: "studio key light + soft fill, low contrast, cool tones"
photo_style: "Editorial men's grooming photography, premium magazine quality"
icon_style: "bold geometric flat icons, strong lines, monochrome"
mood: "confident, direct, masculine without aggression"
```

## 🌸 Rituária

```yaml
visual_dna: "ritualistic, sensorial, retro-mystical, sage green and mustard gold palette, apothecary-meets-modern, transformation through ritual"
palette:
  primary: "#9CAF88"     # sage green (cor base da marca)
  secondary: "#AE8547"   # mostarda/ouro (detalhes, destaques)
  accent: "#000000"      # preto (contraste, tipografia título)
lighting_default: "soft natural daylight, warm golden hour tones, serene ritualistic mood"
photo_style: "Editorial lifestyle photography, brazilian diverse women, authentic self-care moments, soft and serene"
icon_style: "hand-drawn organic line art with mystical touches (stylized rays/sun), thin-medium stroke, mustard or black"
mood: "ritualistic, transformative, magical, accessible, brazilian apothecary"
```

## 💧 Lescent

```yaml
visual_dna: "friendly approachable, soft glow, light and bright, gen-Z friendly skincare"
palette:
  primary: "#F4B4C4"     # soft pink
  secondary: "#FFFBF5"   # ivory white
  accent: "#5A7A9E"      # soft blue
lighting_default: "bright soft natural daylight, fresh airy feel"
photo_style: "Modern skincare photography, bright and clean, social-media friendly"
icon_style: "rounded soft icons, friendly, slightly playful, pastel"
mood: "approachable, fresh, optimistic"
```

## 🌷 Kokeshi

```yaml
visual_dna: "delicate, sensorial, K-beauty inspired, soft pinks and ivory, glass-skin glow"
palette:
  primary: "#F8D7DA"     # blush pink
  secondary: "#FFF8F0"   # warm ivory
  accent: "#B08D57"      # rose gold
lighting_default: "soft pink-hued daylight, dewy luminous quality"
photo_style: "K-beauty editorial style, glass-skin glow, premium asian-inspired beauty"
icon_style: "delicate line illustrations, asian-inspired aesthetic motifs"
mood: "delicate, sensorial, sophisticated"
```

## 🌺 By Samia

```yaml
visual_dna: "premium aspirational, sophisticated, neutral elegance with gold accents, lifestyle luxury"
palette:
  primary: "#C9A961"     # champagne gold
  secondary: "#F5F0E8"   # bone white
  accent: "#3D3D3D"      # rich black
lighting_default: "cinematic warm lighting, soft golden glow, luxurious feel"
photo_style: "Luxury lifestyle editorial, magazine-grade, aspirational"
icon_style: "refined thin-line icons, sophisticated, gold-tinted"
mood: "aspirational, premium, sophisticated"
```

## 🌱 Auá

```yaml
visual_dna: "natural brazilian, organic, earth tones, sustainable craftsmanship, amazonian heritage"
palette:
  primary: "#6B8E3D"     # forest green
  secondary: "#E8D9B0"   # natural beige
  accent: "#8B4513"      # rich earth brown
lighting_default: "warm natural daylight, golden hour, brazilian sun"
photo_style: "Natural lifestyle photography, brazilian craftsmanship aesthetic, authentic"
icon_style: "hand-drawn organic, brazilian folk-art inspired, natural textures"
mood: "natural, ancestral, brazilian, authentic"
```

## Como o piapp-image-gen usa estes presets

1. Recebe `brand_slug` do contexto
2. Lê seção da marca neste arquivo
3. Aplica `visual_dna`, `palette`, `lighting_default`, etc. no prompt
4. Se brandbook da marca tiver overrides → usa override (brandbook vence)
