# Lescent — Plano de criação de imagens do PDP

> **Status: aguardando aprovação. Nada foi gerado, nenhum crédito PiApp consumido.**
> Criado 2026-07-31 · Tema-alvo `lescent-theme/develop` · Contexto: `docs/lescent-contexto-enriquecimento.md`
> Receita de fidelidade ao produto: memória `capa-lifestyle-fiel-ao-produto` (acertou 3/3 na primeira na Lescent).

---

## 0. Diagnóstico — três seções sem ícone, três causas diferentes

| Seção no editor | Lê | Tipo do campo | Precisa gerar imagem? |
|---|---|---|---|
| **"Icon With Text"** | `blocks/goshop-icon-with-text.liquid` — settings do bloco | `select` com **25 ícones nativos** + `image_picker` opcional | ❌ **NÃO** |
| **"Diferenciais do produto"** | `custom.trust_icons` → `trust_icons.icon` | `file_reference` — **sem alternativa nativa** | ✅ **SIM — 4 ícones** |
| **"Como usar"** | `custom.how_to_use` → `how_to_use.file` | `file_reference` (imagem **ou** vídeo) | ✅ **SIM — 2 imagens** |

### 0.1 🔴 "Icon With Text" não precisa de PiApp — resolve em 4 cliques

O bloco tem `icon_1` a `icon_4` como **select de 25 ícones SVG nativos** do tema: `apple, arrow, bottle, box, chat_bubble, check_box, clipboard, dairy_free, eye, fire, gluten_free, heart, leaf, lock, map_pin, nut_free, paw_print, plant, price_tag, question_mark, recycle, return, ruler, snowflake`. Default é `"none"` — é por isso que aparece vazio.

**Mapeamento recomendado** (zero geração, zero crédito):

| Item | Heading atual | Ícone nativo |
|---|---|---|
| 1 | MATÉRIA-PRIMA IMPORTADA | `plant` |
| 2 | ALTA FIXAÇÃO | `fire` |
| 3 | ENVIO RÁPIDO NACIONAL | `box` |
| 4 | SATISFAÇÃO GARANTIDA | `check_box` |

⚠️ **Checar também `icon_size`** — o default do bloco é `0`, o que esconde o ícone mesmo com o select preenchido. Subir para **22px desktop / 18px mobile**.

### 0.2 ⚠️ As duas seções estão duplicadas hoje

"Diferenciais do produto" e "Icon With Text" estão exibindo **exatamente o mesmo conteúdo** (os 4 títulos que preenchi em `trust_icons`). No PDP isso é redundância.

**Recomendação:** manter **"Diferenciais do produto"** como o bloco de diferenciais (tem título + descrição, é mais rico e é alimentado por metafield reaproveitável) e reaproveitar o "Icon With Text" para o que ele fazia antes — **pagamento e frete**: `Em até 3x sem juros` (`price_tag`) · `Frete grátis acima de R$109` (`box`) · `Compra segura` (`lock`) · `Trocas e devoluções` (`return`). Sem duplicar.

Decisão sua. Se preferir desativar o "Icon With Text", também resolve.

---

## 1. LOTE 1 — 4 ícones de "Diferenciais do produto" ⭐ prioridade

### Especificação técnica

Extraída do código de `sections/product-features.liquid`:

| Item | Valor |
|---|---|
| Campo | `trust_icons.icon` (file_reference, `file_type_options: ["Image"]`) |
| Render | `image_url: width: 180` · `image_tag` com `widths: '60, 90, 120, 180'` · `sizes: '80px'` |
| CSS aplicado | `height: 80px; width: auto; object-fit: contain` |
| Container | `min-height: 80px`, flex centralizado |
| Grid | 4 colunas desktop · 2 colunas mobile · gap 16px |
| Fundo da seção | `color_scheme: scheme-2` |
| **Conclusão** | ícone é renderizado a **80px de altura**. Precisa ser **line art simples com fundo transparente** — qualquer detalhe fino desaparece. |

### Parâmetros PiApp

| Item | Valor |
|---|---|
| purpose | `pdp-icon` |
| tool | **`generate_image_batch`** (batch único de 4, garante consistência de traço) |
| aspect_ratio | `1:1` |
| quality | `standard` |
| reference_image_urls | ❌ nenhuma — são ícones abstratos |
| output_path | `conteudos/lescent/_assets/trust-icons/imagens/` |

### DNA visual aplicado (do brandbook §5)

> "Bronze quente e fundo neutro — elegância democrática que convida à descoberta sem criar distância."
> Cobre Lescent `#8C5E3C` · Preto `#1A1A1A` · Cinza claro `#F5F5F5` · Branco

Traço em **Cobre Lescent `#8C5E3C`** sobre transparente — funciona sobre o `scheme-2` claro da seção e mantém a âncora de identidade da marca.

---

### Prompt 1 — Matéria-prima importada

```
A minimalist line-art icon representing "imported high-grade fragrance essence" for a perfume brand.

Subject: a single elegant rectangular glass perfume flacon with a cylindrical cap, drawn as a clean continuous outline, with three small droplets rising above the neck to suggest concentrated essence.

Visual style: minimal line art, uniform stroke weight, geometric and symmetrical, instantly readable at 80px height. No fine detail.
Color: solid copper #8C5E3C strokes on a fully transparent background. No fills, no gradients, no shadows.

Composition: centered, square 1:1 canvas, generous even padding on all four sides.
Mood: quiet sophistication, accessible elegance.

NO text. NO letters. NO numbers. NO logos. NO country flags. NO packaging labels. NO photorealism.

Style consistent with Lescent brand identity: warm bronze on neutral ground, democratic elegance that invites discovery without creating distance.
```

### Prompt 2 — Alta fixação

```
A minimalist line-art icon representing "long-lasting fragrance hold" for a perfume brand.

Subject: a single fragrance droplet at the center with three concentric arcs radiating outward and upward from it, suggesting a scent trail that persists.

Visual style: minimal line art, uniform stroke weight, geometric and symmetrical, instantly readable at 80px height. No fine detail.
Color: solid copper #8C5E3C strokes on a fully transparent background. No fills, no gradients, no shadows.

Composition: centered, square 1:1 canvas, generous even padding on all four sides.
Mood: quiet sophistication, accessible elegance.

NO text. NO letters. NO numbers. NO clock face. NO hourglass. NO logos. NO photorealism.

Style consistent with Lescent brand identity: warm bronze on neutral ground, democratic elegance that invites discovery without creating distance.
```

> 🔒 **Compliance:** relógio e ampulheta estão **proibidos no prompt de propósito**. Ambos sugerem duração medida em horas, e o brandbook §8 veta claim de fixação em horas. Arcos concêntricos comunicam persistência sem quantificar.

### Prompt 3 — Envio rápido nacional

```
A minimalist line-art icon representing "fast nationwide shipping" for a perfume brand.

Subject: a simple rectangular parcel box in three-quarter view with two short horizontal motion lines trailing behind it to suggest speed.

Visual style: minimal line art, uniform stroke weight, geometric and symmetrical, instantly readable at 80px height. No fine detail.
Color: solid copper #8C5E3C strokes on a fully transparent background. No fills, no gradients, no shadows.

Composition: centered, square 1:1 canvas, generous even padding on all four sides.
Mood: quiet sophistication, accessible elegance.

NO text. NO letters. NO numbers. NO logos. NO courier company marks. NO map of Brazil. NO flags. NO photorealism.

Style consistent with Lescent brand identity: warm bronze on neutral ground, democratic elegance that invites discovery without creating distance.
```

### Prompt 4 — Satisfação garantida

```
A minimalist line-art icon representing "satisfaction guaranteed" for a perfume brand.

Subject: a simple shield outline with a clean checkmark centered inside it.

Visual style: minimal line art, uniform stroke weight, geometric and symmetrical, instantly readable at 80px height. No fine detail.
Color: solid copper #8C5E3C strokes on a fully transparent background. No fills, no gradients, no shadows.

Composition: centered, square 1:1 canvas, generous even padding on all four sides.
Mood: quiet sophistication, accessible elegance.

NO text. NO letters. NO numbers. NO logos. NO third-party certification seals. NO resemblance to the Reclame Aqui RA1000 badge. NO stars. NO photorealism.

Style consistent with Lescent brand identity: warm bronze on neutral ground, democratic elegance that invites discovery without creating distance.
```

> 🔒 **Compliance:** proibido gerar qualquer coisa parecida com o **selo RA1000 do Reclame Aqui** — é marca de terceiro. O selo real já é exibido no PDP como imagem oficial pelo bloco `social-proof`; um sósia gerado por IA seria uso indevido de marca.

---

## 2. LOTE 2 — 2 imagens de "Como usar"

### Especificação técnica

De `sections/product-how-to-use.liquid` + settings do template:

| Item | Valor |
|---|---|
| Campo | `how_to_use.file` (aceita `Image` **ou** `Video`) |
| Aspect no template hoje | `media_aspect_ratio: "1/1"` |
| CSS | `object-fit: cover` · `border-radius: 12px` · largura 50% no desktop |
| Render | `image_url: width: 1200`, `sizes: '(min-width: 750px) 50vw, 100vw'` |
| Posição | mídia à direita, passos numerados à esquerda |

São **2 imagens** porque existem 2 entradas reaproveitáveis de `how_to_use`: `como-usar-fragrancia` (18 SKUs single) e `como-usar-kit` (12 SKUs kit).

### Parâmetros PiApp

| Item | Valor |
|---|---|
| purpose | `pdp-how-to-use` |
| tool | **`generate_image_batch`** (batch de 2 com `image_assignments`) |
| aspect_ratio | `1:1` |
| quality | `high` |
| **reference_image_urls** | ✅ **obrigatório** — packshot real do CDN |
| output_path | `conteudos/lescent/_assets/how-to-use/imagens/` |

### Referências reais (URLs públicas do CDN, não precisa `upload_reference`)

| Prompt | Reference |
|---|---|
| 1 — fragrância avulsa | `https://cdn.shopify.com/s/files/1/0901/2386/2323/files/No_2_Delicate_Londres.png?v=1776197238` (Nº 2 • 25ml) |
| 2 — kit | `https://cdn.shopify.com/s/files/1/0901/2386/2323/files/Kit_Trilogia_Essencial_No_2_No_6_No_10_25ml.png?v=1775842904` (Kit Trilogia) |

Usar `image_assignments` para amarrar cada prompt ao seu reference. O PiApp auto-seleciona `wavespeed-gpt-image-2-edit` quando há reference — é o modelo que preserva o rótulo.

---

### Prompt 1 — Como usar: fragrância avulsa

```
Photorealistic high-quality beauty product photography.

Subject: a woman's hand holding the perfume flacon from the reference image and applying it to the inner wrist of her other arm. Natural unretouched Brazilian skin, medium tone, no jewelry, no nail polish.
Setting: minimal off-white surface, plain neutral background, no props.

Lighting: soft diffused natural daylight from the side. Gentle highlights on the glass, soft shadows, no hard studio light.
Composition: close-up of forearms and hands, flacon clearly visible and in focus, eye-level.
Color palette: off-white and light grey base with warm copper and gold accents on the metal cap.

Aspect ratio: 1:1. Quality: high.
Mood: accessible elegance, real and unstaged, Brazilian everyday.

NO text overlay. NO logos other than the real label on the reference bottle. NO heavy retouching. NO luxury set design.

PRODUCT LOCK — the flacon must match the reference image element by element:
clear rectangular glass body, straight shoulders, cylindrical gold-tone metal cap,
pale silver-white rectangular label centered on the front face,
label content exactly as in the reference.
Do not redesign, restyle, recolor or relabel. Do not invent any other product.

NEGATIVE: no invented bottle, no generic stock product, no altered label, no fantasy packaging, no brand logo other than the real label, no second bottle in frame.

Style consistent with Lescent brand identity: warm bronze on neutral ground, clean background, soft diffused light, the flacon as protagonist.
```

### Prompt 2 — Como usar: kit

```
Photorealistic high-quality beauty product photography.

Subject: the three perfume flacons from the reference image standing side by side on a minimal surface, with a woman's hand reaching in to lift the middle one. Natural unretouched Brazilian skin, medium tone, no jewelry.
Setting: minimal off-white surface, plain neutral background, no props.

Lighting: soft diffused natural daylight from the side. Gentle reflections on the glass, soft shadows, no hard studio light.
Composition: three-quarter view, all three flacons clearly visible and in focus, slightly elevated angle.
Color palette: off-white and light grey base with warm copper and gold accents on the metal caps.

Aspect ratio: 1:1. Quality: high.
Mood: discovery and curation, accessible elegance, unstaged.

NO text overlay. NO logos other than the real labels on the reference bottles. NO heavy retouching. NO luxury set design.

PRODUCT LOCK — the three flacons must match the reference image element by element:
identical clear rectangular glass bodies, cylindrical gold-tone metal caps,
pale silver-white rectangular labels centered on the front faces,
same three labels and same order as in the reference, same relative proportions.
Do not redesign, restyle, recolor or relabel. Do not add or remove bottles. Do not invent any other product.

NEGATIVE: no invented bottle, no generic stock product, no altered label, no fantasy packaging, no brand logo other than the real label, no fourth bottle in frame.

Style consistent with Lescent brand identity: warm bronze on neutral ground, clean background, soft diffused light, the flacons as protagonists.
```

> ⚠️ **Pré-flight obrigatório do lote 2:** baixar os 2 packshots e **abrir com o Read tool antes de gerar**. A memória `capa-lifestyle-fiel-ao-produto` registra que na Lescent o **25ml tem tampa dourada cilíndrica** e o **100ml tem tampa acrílica transparente com bomba dourada dentro** — trocar isso passa despercebido e invalida a imagem. O bloco de trava acima está escrito para o **25ml**; se for gerar variação de 100ml, reescrever a trampa da tampa.

---

## 3. LOTE 3 — "Destaque" (`highlight_section`) — fase 2, opcional

Seção `product-highlight` já está no template e o metafield `custom.highlight_section` já existe — **mas está com 0 preenchimentos**. É o bloco "história da fragrância": imagem + título + texto, 50/50.

| Item | Valor |
|---|---|
| purpose | `pdp-ingredient` (still life de nota olfativa) |
| tool | `generate_image_batch` (2 batches de 6 — o limite do batch é 10) |
| aspect_ratio | `4:5` |
| quality | `high` |
| Volume | **11 imagens** — uma por número de fragrância do top 30 (Nº 2, 3, 5, 6, 7, 10, 12, 13, 20, 26, 27, 31 → 12 na verdade) |
| reference | ❌ nenhuma — still life de matéria-prima, sem produto |

Conceito: cada imagem retrata a **nota-assinatura** da fragrância, em still life sobre superfície neutra. Sem frasco, sem rótulo, sem pessoa. Isso dá à seção um papel próprio (o universo olfativo) sem repetir o packshot que já está na galeria.

| Nº | Nota-assinatura (das notas publicadas) | Sujeito da imagem |
|---|---|---|
| 2 | pera + frésia | pera verde cortada ao meio com uma haste de frésia branca |
| 3 | limão siciliano + maçã verde | limão siciliano cortado e uma maçã verde inteira |
| 5 | peônia + rosa | uma peônia rosa aberta e pétalas de rosa soltas |
| 6 | laranja + jasmim + patchouli | meia laranja, flores de jasmim e folhas de patchouli |
| 7 | magnólia + baunilha | flor de magnólia branca e favas de baunilha |
| 10 | lichia + rosa turca | lichias descascadas e uma rosa turca |
| 12 | toranja + menta + sândalo | meia toranja, folhas de menta e lascas de sândalo |
| 13 | bergamota + pimenta + cedro | bergamota cortada, grãos de pimenta e lascas de cedro |
| 20 | limão + notas marinhas + alecrim | limão siciliano, ramo de alecrim e sal marinho grosso |
| 26 | lírio-do-vale + íris + baunilha | lírio-do-vale, raiz de íris e favas de baunilha |
| 27 | açafrão + jasmim + âmbar | fios de açafrão, jasmim e resina de âmbar |
| 31 | bergamota da Calábria + flor de laranjeira | bergamota cortada e flores de laranjeira |

**Template de prompt (aplicar a cada linha):**

```
Photorealistic high-quality commercial still life photography of fragrance raw materials.

Subject: [SUJEITO DA TABELA].
Composition: still life, clean, centered, slightly elevated three-quarter angle.

Lighting: soft diffused natural daylight from the side. Subtle highlights, soft shadows.
Background: plain off-white surface, light grey seamless backdrop.
Color palette: off-white and light grey base with warm copper accents.

Aspect ratio: 4:5. Quality: high. Commercial product quality.

Mood: fresh, natural, quietly premium.

NO text. NO labels. NO brand names. NO packaging. NO perfume bottle.
NO human hands or faces. Just the raw materials themselves.

Style consistent with Lescent brand identity: warm bronze on neutral ground, clean background, soft diffused light, no ostentatious luxury set design.
```

> Deixei como fase 2 porque o lote 1 e 2 destravam seções que **já estão no template e já têm conteúdo de texto**. O lote 3 destrava uma seção que ainda está 100% vazia — mais trabalho, menos urgência.

---

## 4. O que decidi NÃO gerar, e por quê

| Item | Motivo |
|---|---|
| Ícones do "Icon With Text" | O bloco tem 25 ícones SVG nativos. Gerar imagem para isso é desperdício de crédito. |
| `sess_o_ativos.image` (Construção da Fragrância) | A seção duplicaria o acordeão "NOTAS E ESSÊNCIAS" que já renderiza o mesmo conteúdo. Schema criado, uso não recomendado. |
| Vídeo de "Como usar" | Geração de vídeo está fora do escopo do módulo `piapp-image-gen`. Se quiser vídeo, é produção externa. |
| Avatares de "clientes satisfeitos" | O `social-proof` do develop já usa 3 imagens no CDN da loja. Gerar rostos sintéticos para posar como clientes reais é vetado — só entraria com rótulo explícito de ilustrativo. |
| Ícones por produto | `trust_icons` é reaproveitável: **4 ícones servem o catálogo inteiro**, não 4 por SKU. |

---

## 5. Resumo para aprovação

| Lote | O que | Qtd | Tool | Aspect | Quality | Reference | Prioridade |
|---|---|---|---|---|---|---|---|
| **1** | Ícones de "Diferenciais do produto" | **4** | `generate_image_batch` | 1:1 | standard | — | ⭐ alta |
| **2** | Mídia de "Como usar" | **2** | `generate_image_batch` | 1:1 | high | ✅ CDN | ⭐ alta |
| **3** | Imagens de "Destaque" | **12** | `generate_image_batch` ×2 | 4:5 | high | — | fase 2 |
| — | "Icon With Text" | **0** | — | — | — | — | 4 cliques no editor |

**Total do lote 1 + 2 = 6 imagens.** Total com fase 3 = 18.

### Pré-flight quando você aprovar
1. `check_credits` (obrigatório, batch ≥ 5)
2. `list_models` para confirmar custo
3. Baixar e **abrir com Read** os 2 packshots de referência do lote 2 antes de gerar
4. Gerar → `check_jobs` até `completed`
5. **Inspecionar visualmente cada imagem** — rótulo ilegível ou tampa errada = regerar
6. Salvar imagem + prompt + metadata em `conteudos/lescent/_assets/`
7. `fileCreate` no Shopify → `metaobjectUpdate` para plugar o `icon` / `file` nas entradas existentes

### Entradas de metaobjeto que recebem os arquivos

| Entrada | Campo | GID |
|---|---|---|
| `trust-materia-prima-importada` | `icon` | `gid://shopify/Metaobject/232418541875` |
| `trust-alta-fixacao` | `icon` | `gid://shopify/Metaobject/232418574643` |
| `trust-envio-nacional` | `icon` | `gid://shopify/Metaobject/232418607411` |
| `trust-satisfacao-garantida` | `icon` | `gid://shopify/Metaobject/232418640179` |
| `como-usar-fragrancia` | `file` | `gid://shopify/Metaobject/232418672947` |
| `como-usar-kit` | `file` | `gid://shopify/Metaobject/232418705715` |

**Zero produto precisa ser tocado depois** — as entradas já estão referenciadas pelos 30 SKUs. Plugar o arquivo na entrada propaga para todos.

---

## 6. Decisões que preciso de você

1. **Aprova os lotes 1 e 2** (6 imagens)? Ou quer ajustar algum conceito antes?
2. **"Icon With Text"**: mapear os 4 ícones nativos com o conteúdo atual, ou reaproveitar para pagamento/frete e deixar os diferenciais só no `product-features`?
3. **Lote 3** (12 imagens de nota olfativa) entra agora ou fica para depois?
4. Cor do traço dos ícones: **Cobre `#8C5E3C`** (minha recomendação, âncora da marca) ou **Preto `#1A1A1A`** (mais neutro, some no fundo claro da seção)?
