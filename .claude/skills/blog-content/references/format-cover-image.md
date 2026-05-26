# Cover Image — Blog

Capa do blog post. Aparece no card do blog, no topo do post e no preview de redes sociais.

> 🚨 **REGRA INVIOLÁVEL — Cover é LIFESTYLE, não produto.**
>
> A cover de um blog editorial é **sempre** uma cena lifestyle institucional da marca: modelo real, ambiente, mood. **NUNCA** é uma foto de produto recortada em fundo branco/transparente — isso é foto de catálogo de e-commerce, não de capa editorial.
>
> **Referência visual**: blogs Sallve, Glossier, Granado, Sephora editorial — cover sempre traz pessoa, cena ou ambiente; produto aparece **dentro do artigo** integrado ao texto, nunca como capa.
>
> ❌ ERRADO: PNG do shampoo recortado sobre fundo branco
> ✅ CERTO: Mulher cacheada sorrindo com luz natural, modelo em rotina capilar real, still life de ingredientes botânicos
>
> Se a marca ainda não tem banco de imagens lifestyle, **gere via PiApp** com o prompt template abaixo. Não use foto de produto como fallback — deixe a cover vazia até que a lifestyle esteja pronta.

## Inputs

- ✅ Brand visual DNA + paleta (do bundle)
- ✅ Tema do post
- ✅ Mood (educativo/inspiracional/promocional)
- ✅ Cena visual proposta (perguntar se não claro)

---

## 📐 Specs

- Aspect: **16:9** (1920x1080)
- Quality: **high**
- Tool: **`generate_image`** (single)

### Por que 16:9?
- Funciona como capa de post (Shopify Blog padrão)
- Funciona como og:image pra link preview em redes sociais
- Funciona como banner no card de blog

---

## 🎨 Template prompt (passar pra piapp-image-gen)

```
Photorealistic high-quality editorial photography.

Subject: [BLOG_TOPIC_VISUAL — described concretely].

Setting: [LIFESTYLE_SCENE matching blog theme].
Lighting: [WARM_NATURAL_LIGHTING aligned with brand].
Composition: editorial wide shot, room for title overlay (top or bottom third clear).

Aspect ratio: 16:9. Quality: high.

Mood: [BLOG_MOOD — inviting, informative, brand-aligned].

NO text. NO logos. NO product packaging with visible labels.

Style consistent with [BRAND_NAME]: [BRAND_VISUAL_DNA].
```

---

## 📝 Exemplos de "subject" por tema

### Hair Care no verão (Ápice)
> "Brazilian woman in her 30s with type 3B/3C curly hair, smiling softly, outdoor warm light, sun-kissed natural setting, beach or tropical vegetation in soft focus"

### Skincare matinal (Lescent)
> "Soft morning light scene of skincare routine, close-up of dropper bottle in feminine hand near vanity, fresh airy atmosphere, no visible labels"

### Bem-estar ritual (Rituária)
> "Serene wellness scene, hands cradling a ceramic cup of herbal tea on linen surface, soft golden hour light, dried flowers and natural textures in background"

### Grooming masculino (Barbour's)
> "Confident Brazilian man in his 30s in clean bathroom setting, fresh after grooming routine, warm professional lighting, monochrome aesthetic with wood accent"

### Skincare K-beauty (Kokeshi)
> "Delicate skincare flat lay with pastel pink and ivory tones, ceramic dish with glossy skincare textures, soft natural light, glass-skin glow aesthetic"

### Lifestyle premium (By Samia)
> "Aspirational lifestyle scene, woman in linen robe at sun-drenched window with herbal supplement, sophisticated neutral palette with gold accents"

### Brasilidade Amazônica (Auá)
> "Natural Brazilian setting with botanical elements from the Amazon rainforest, organic textures, earth tones, golden brazilian sunlight"

---

## 🚨 Guardrails

- ❌ Texto/letra dentro da imagem (overlay é frontend)
- ❌ Embalagem com logo visível
- ❌ Pessoas reais identificáveis (celebridades)
- ❌ Composição que não deixa espaço pra overlay de título
- ❌ Mood divergente do tom do artigo
- ✅ Negative space pra título (topo ou base do terço)
- ✅ Paleta da marca
- ✅ Mood coerente com o tom editorial

---

## 📁 Output

```
conteudos/[marca]/blogs/[slug]/
├── imagens/
│   ├── generated/
│   │   └── cover.png
│   └── prompts/
│       ├── cover.txt
│       └── cover.meta.json
```

### Metadata (cover.meta.json)

```json
{
  "purpose": "blog-cover",
  "brand": "apice",
  "blog_slug": "cuidados-com-cachos-no-verao",
  "tool": "generate_image",
  "aspect_ratio": "16:9",
  "quality": "high",
  "job_id": "...",
  "output_url": "...",
  "generated_at": "2026-XX-XX",
  "title_overlay_position": "bottom-third"
}
```

## ✅ Checklist

- [ ] 16:9?
- [ ] Espaço pra overlay de título?
- [ ] Sem texto/logo na imagem?
- [ ] Mood alinhado com o artigo?
- [ ] Paleta da marca?
