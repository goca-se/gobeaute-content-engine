# Cover Image — Blog

Capa do blog post. Aparece no card do blog, no topo do post e no preview de redes sociais.

> 🚨 **REGRA INVIOLÁVEL #1 — Cover SEMPRE gerada por IA (PiApp), SEMPRE lifestyle institucional adaptada AO BRAND CONTEXT.**
>
> Toda blog cover **DEVE** ser uma imagem **gerada pelo PiApp** (`generate_image`) com prompt **construído dinamicamente a partir do bundle do brand-context** da marca em questão. **NUNCA** hardcoded pra uma marca específica.
>
> ❌ NÃO USAR:
> - Foto de produto recortada em fundo branco/transparente (catálogo, não editorial)
> - URL de imagem de produto da Shopify CDN (`cdn.shopify.com/.../files/produto.png`)
> - Imagem genérica de stock photo
> - Foto de produto em mesa simulando lifestyle
> - Composição com embalagem visível
> - **Prompt hardcoded** (ex: "Brazilian woman with curly hair") sem consultar o brand-context da marca pedida
>
> ✅ SEMPRE:
> - Imagem gerada via PiApp `generate_image` com aspect 16:9 (1920×1080)
> - Cena **lifestyle institucional** alinhada ao brand DNA **da marca específica**
> - Prompt construído a partir de **3 inputs do brand-context**: (1) `prompt_guidelines` da marca, (2) `colors` da paleta oficial, (3) `negative_prompts`
> - Aprovação de prompt antes de gerar (custo de crédito)
> - Salvar prompt + metadata pra rastreabilidade

---

## 🚦 Workflow obrigatório (brand-adaptive)

### Passo 1 — Carregar brand-context da marca

**Antes de qualquer coisa**, consultar a skill `brand-context` ou chamar `mcp__piapp__get_brand_profile(brand_id)` pra puxar:

| Campo | O que é | Como usar no prompt |
|---|---|---|
| `prompt_guidelines` | Descrição rica de subject/setting/lighting/casting pré-aprovada | Subject + Setting base do prompt |
| `colors` | Paleta hex oficial (primary, accent, photo background, etc.) | Cores literais no prompt (ex: "solid background #2E7D60") |
| `negative_prompts` | Lista do que NÃO incluir | Anexar ao final do prompt como exclusões |
| `tone_of_voice` | Tom da marca | Define o **mood** da cena |
| `target_audience` | Persona-alvo | Define gênero/idade/etnia do modelo se aplicável |
| `styles[]` | Brand styles registrados (ex: "Crespo Power", "NUTRI WAVES") | Se houver style relevante ao tema do blog, usar `prompt_modifiers` daquele style |

### Passo 2 — Detectar marca + selecionar style apropriado

- Brand vem do contexto do blog post (`brand-context/[marca]/`)
- Se a marca tem múltiplos `styles` (Ápice tem "Crespo Power" e "NUTRI WAVES"), escolher o style que **combina com o tema do blog post**:
  - Blog sobre cabelo cacheado/crespo → style "Crespo Power"
  - Blog sobre cabelo ondulado → style "NUTRI WAVES"
  - Blog genérico sem foco em curvatura → usar `prompt_guidelines` base
- Para outras marcas (Barbours, Kokeshi, etc.) → usar `prompt_guidelines` da marca + styles da marca quando existir

### Passo 3 — Construir prompt do template universal

```
Editorial high-quality photography.

Subject: [BLOG_SUBJECT — derivado do tema do post + persona da marca].

Setting: [SETTING — pego do prompt_guidelines da marca: ambiente, fundo, superfície, cor de fundo se aplicável].

Casting (if person): [CASTING — pego do prompt_guidelines da marca: etnia/gênero/idade/expressão típicas da marca].

Lighting: [LIGHTING — pego do prompt_guidelines da marca: tipo de luz que a marca usa].

Composition: editorial wide shot 16:9, negative space on [top OR bottom third] for title overlay, [composição típica da marca].

Mood: [BLOG_MOOD — derivado do tom do post + tone_of_voice da marca].

Brand palette: [hex codes da paleta da marca, ex: primary + photo_bg do colors].

[Opcional: prompt_modifiers do style escolhido (ex: para Ápice Crespo Power)]

NEGATIVE: no text overlay, no logos, no product packaging with visible labels, [negative_prompts da marca].
```

### Passo 4 — Apresentar prompt + aprovação

Mostrar pro usuário:
```
🎨 Prompt cover blog "[título]" (marca: [marca], style: [style ou "base"])

Model: gemini-2.5-flash-image
Aspect: 16:9 (1920x1080)
Quality: high
Cost: ~3 créditos

[PROMPT COMPLETO]

Confirma? (sim/ajustar/abortar)
```

### Passo 5 — Gerar via PiApp

Após aprovação explícita:
```python
mcp__piapp__generate_image(
  prompt=PROMPT_FINAL,
  aspect_ratio="16:9",
  quality="high",
  model="gemini-2.5-flash-image"  # ou null pra auto-select
)
```

### Passo 6 — Pollar + atualizar

- `check_jobs` até status=completed
- `articleUpdate(article: {image: {url, altText}})` na Shopify
- Salvar `cover.meta.json` em `conteudos/[marca]/blogs/[slug]/imagens/prompts/`

---

## 📐 Specs

- Aspect: **16:9** (1920×1080)
- Quality: **high**
- Tool: **`generate_image`** (single, nunca batch pra cover)

---

## 🎨 Como o prompt fica adaptado por marca (exemplos derivados de `prompt_guidelines`)

> ⚠️ Os exemplos abaixo são DERIVADOS dinamicamente dos `prompt_guidelines` de cada marca no PiApp. Não são hardcoded — eles refletem o que o `get_brand_profile()` retorna pra cada marca hoje. Se o brandbook mudar, o prompt muda automaticamente.

### Ápice (slug: `apice`)
- **DNA visual da marca**: "mulher brasileira com curvatura natural (crespo 3A-4C ou cacheado), volume generoso, ombros à mostra sem roupas visíveis, expressão de alegria genuína, fundo sólido unicolor de alto contraste (verde esmeralda #2E7D60 OU amarelo âmbar #F5C518), luz de estúdio difusa e frontal com preenchimento quente, energia celebratória"
- **Style "Crespo Power"** (cabelo crespo 3A-4C) → coils volumosas, modelo ébano-médio, energia empoderada
- **Style "NUTRI WAVES"** (cabelo ondulado 2A-2C) → ondas naturais com movimento, leveza, fundo branco com toques laranja
- **Cover exemplo**: blog sobre frizz → "mulher brasileira sorrindo com cachos 3B/3C, fundo verde esmeralda sólido, luz difusa quente, espaço inferior pra título"

### Barbours (slug: `barbours`)
- **DNA**: grooming masculino brasileiro, ambiente bathroom limpo, mood profissional/confiante, paleta monocrome com acento de madeira
- **Cover exemplo**: blog sobre barba → "homem brasileiro confiante em ambiente bathroom limpo após rotina de grooming, luz profissional quente, paleta monochrome com madeira em foco, ombros enquadrados"

### Rituária (slug: `rituaria`)
- **DNA**: serenidade ritualística, still life com elementos naturais (chá, flores secas, linho), paleta verde/dourado, luz golden hour
- **Cover exemplo**: blog sobre ritual matinal → "cena serena de bem-estar, mãos segurando xícara cerâmica de chá sobre superfície de linho, luz golden hour, flores secas em desfoque, paleta verde mineral + dourado"

### Lescent (slug: `lescent`)
- **DNA**: skincare matinal feminino, ambiente fresco/airy, paleta rosa/ivory, luz da janela suave
- **Cover exemplo**: blog sobre sérum → "cena de skincare matinal com luz suave de janela, close-up de frasco com conta-gotas em mão feminina sobre vanity, atmosfera fresca e airy, paleta rosa + ivory"

### Kokeshi (slug: `kokeshi`)
- **DNA**: skincare K-beauty/J-beauty, flat lay delicado, paleta pastel rosa + ivory, glass-skin glow, estética kute/kawaii com personalidade brasileira
- **Cover exemplo**: blog sobre rotina coreana → "flat lay delicado de skincare com tons pastel rosa e ivory, prato cerâmico com texturas brilhantes de skincare, luz natural suave, estética glass-skin"

### By Samia (slug: `bysamia`)
- **DNA**: lifestyle aspiracional premium, mulher em ambiente sofisticado, paleta neutra com acentos dourados
- **Cover exemplo**: blog sobre suplemento → "cena lifestyle aspiracional, mulher em robe de linho em janela ensolarada, paleta neutra sofisticada com acentos dourados, atmosfera matinal premium"

### Auá (slug: `aua`)
- **DNA**: brasilidade amazônica, elementos botânicos da Amazônia, texturas orgânicas, paleta de tons terrosos, luz brasileira dourada
- **Cover exemplo**: blog sobre ingrediente amazônico → "ambiente brasileiro natural com elementos botânicos da Amazônia, texturas orgânicas, paleta de tons terrosos, luz dourada brasileira, sem pessoas"

---

## 🚨 Fallback se PiApp indisponível

Se PiApp MCP desconectado/sem créditos:
- ❌ **NÃO** usar foto de produto da Shopify CDN como substituta
- ❌ **NÃO** usar foto stock genérica
- ❌ **NÃO** pegar imagem de cover de outra marca
- ✅ **SIM**: criar artigo com `image: null` + flag de pendência
- ✅ Avisar usuário: "PiApp indisponível, cover pendente — gerar antes de publicar"
- ✅ Report final: `⚠️ Cover pendente — PiApp indisponível`

---

## 🚨 Guardrails

- ❌ Hardcoded prompt sem ler brand-context primeiro
- ❌ Usar prompt da marca X pra cover da marca Y
- ❌ Texto/letra dentro da imagem (overlay é frontend)
- ❌ Logo da marca visível
- ❌ Embalagem de produto com label visível
- ❌ Pessoas reais identificáveis (celebridades)
- ❌ Composição sem negative space pra título
- ❌ Mood divergente do tom do artigo
- ❌ Cores fora da paleta oficial da marca
- ✅ Sempre carregar brand-context bundle ANTES de construir prompt
- ✅ Sempre incluir `negative_prompts` da marca no final do prompt
- ✅ Sempre usar hex codes literais da paleta da marca
- ✅ Negative space pra título (topo ou base do terço)
- ✅ Mood coerente com tom editorial + tone_of_voice da marca

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
  "brand": "[marca]",
  "brand_style_used": "[Crespo Power | NUTRI WAVES | null se base]",
  "blog_slug": "[slug do post]",
  "tool": "generate_image",
  "model": "gemini-2.5-flash-image",
  "aspect_ratio": "16:9",
  "quality": "high",
  "prompt": "[prompt completo enviado]",
  "brand_context_version": "[hash ou data do brandbook.md usado]",
  "negative_prompts_applied": "[negative_prompts da marca]",
  "palette_applied": "[hex codes usados]",
  "job_id": "...",
  "output_url": "...",
  "generated_at": "[ISO datetime]",
  "title_overlay_position": "bottom-third"
}
```

A inclusão do `brand_context_version` garante traceability: se mudar o brandbook, fica óbvio quais covers foram geradas com qual versão.

---

## ✅ Checklist

- [ ] `brand-context` consultado ANTES de construir o prompt?
- [ ] Prompt usa `prompt_guidelines` da marca (não hardcoded)?
- [ ] Paleta hex literal da marca no prompt?
- [ ] `negative_prompts` da marca aplicados?
- [ ] Style apropriado ao tema selecionado (se a marca tem múltiplos)?
- [ ] 16:9?
- [ ] Espaço pra overlay de título?
- [ ] Sem texto/logo/produto recortado?
- [ ] Mood alinhado com tom do artigo + tom da marca?
- [ ] Aprovação explícita antes de gastar créditos?
- [ ] Metadata salva com `brand_context_version`?
