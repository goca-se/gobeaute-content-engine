# By Samia — Planejamento editorial + plano de subida dos 7 metafields de PDP (top 40 em vendas)

Loja: `www.bysamia.com.br` (`gcpf8a-ki.myshopify.com`)
Tema de destino: **`by-samia-theme/develop`** (`gid://shopify/OnlineStoreTheme/198616481873`, UNPUBLISHED)
Data: **2026-07-29**
Base de vendas: **últimos 365 dias**, `FROM sales SHOW net_sales GROUP BY product_title` (net_sales = bruto − descontos − devoluções)

Referências: [`bysamia-auditoria-2026-07-29.md`](shopify-schema/bysamia-auditoria-2026-07-29.md) · [`bysamia-padronizacao-7-metafields.json`](shopify-schema/bysamia-padronizacao-7-metafields.json) · `brand-context/bysamia/brandbook.md` · `brand-context/_shared/compliance-anvisa.md`

---

## 1. Escopo

Preencher os **7 metafields de PDP** que o `templates/product.json` do develop realmente monta, nos **top 40 produtos por receita líquida**:

| # na PDP | Metafield | Tipo | Metaobjeto | Arquivo do tema |
|---|---|---|---|---|
| 1 | `custom.product_info_benefits` | `metaobject_reference` | `product_benefit` (36550705233) | `snippets/jump-product-info-benefits.liquid` |
| 2 | `custom.trust_icons` | `list.metaobject_reference` | `trust_icons` (10343317585) | `snippets/goshop-icon-with-text.liquid` + `sections/product-features.liquid` |
| 3 | `custom.composicao` | `rich_text_field` | — | `snippets/jump-info-faq.liquid` |
| 4 | `custom['modo-de-uso']` | `rich_text_field` | — | `snippets/jump-info-faq.liquid` |
| 5 | `custom.faq` | `list.metaobject_reference` | `faq_point` (41224765521) | `snippets/jump-info-faq.liquid` |
| 6 | `custom.how_to_use_pdp` | `metaobject_reference` | `video_tutorial_how_to_use` (40808284241) | `sections/goshop-how-to-use-pdp.liquid` |
| 7 | `custom.product_ingredients_metafield` | `list.metaobject_reference` | `product_ingredients` (37269897297) | `sections/goshop-product-ingredients.liquid` |

### Estado inicial (medido, não estimado)

| Metafield | Produtos preenchidos hoje | Instâncias de metaobjeto |
|---|---|---|
| `product_info_benefits` | 1 (Duo Ar Puro) | 2 — **as duas com copy da Ápice** ("tratamento dos cachos", "Tecnologia SuperWave") |
| `trust_icons` | 43 | 52+ — **conteúdo não-compliant, ver §3.2** |
| `composicao` | 2 | — |
| `modo-de-uso` | 2 | — |
| `faq` | 0 | 0 |
| `how_to_use_pdp` | 1 | 1 ("Seu ritual em 3 passos") |
| `product_ingredients_metafield` | 1 | 2 (Lavandula angustifolia, Pureza garantida) |

Ou seja: **é campo aberto**, exceto `trust_icons`, que está populado e é justamente o que precisa de reescrita.

---

## 2. Os top 40 (receita líquida 365d)

Arquétipos: **OE** = óleo essencial puro · **BL** = blend · **RO** = roll-on · **OV** = óleo vegetal · **KIT** · **RS** = room spray · **COS** = cosmético Spa Basics

| # | Produto | Net sales (R$) | Arq. | Handle | Product GID (numérico) |
|---:|---|---:|:--:|---|---|
| 1 | Óleo Essencial de Lavanda 10 ml | 584.934 | OE | `oleo-essencial-de-lavanda-10-ml` | 7816507785297 |
| 2 | Kit Trilogia Essencial | 269.209 | KIT | `kit-trilogia-essencial` | 15614885920849 |
| 3 | Óleo Essencial de Alecrim 10 ml | 261.096 | OE | `oleo-essencial-alecrim-10-ml` | 7816506736721 |
| 4 | Óleo essencial de Laranja 10 ml | 250.880 | OE | `oleo-essencial-de-laranja-10-ml` | 7816507752529 |
| 5 | Óleo Essencial de Tea Tree 10 ml | 230.160 | OE | `oleo-essencial-de-tea-tree-melaleuca-10ml` | 7816508112977 |
| 6 | Óleo Essencial de Hortelã Pimenta 10 ml | 218.063 | OE | `oleo-essencial-de-hortela-pimenta-10-ml` | 7816507686993 |
| 7 | Óleo Vegetal de Rosa Mosqueta 30 ml | 213.274 | OV | `oleo-vegetal-de-rosa-mosqueta-30ml` | 7816508768337 |
| 8 | Kit 3 Óleos Trio Básico | 180.910 | KIT | `kit-3-oleos-essenciais-trio-basico-by-samia` | 7816517877841 |
| 9 | Blend de Óleos Bem Estar 15ml | 128.328 | BL | `blend-de-oleos-bem-estar-15ml` | 7816510505041 |
| 10 | Óleo Essencial de Eucalipto Globulos 10ml | 118.506 | OE | `oleo-essencial-eucalipto-globulos` | 7816507392081 |
| 11 | Blend de Óleos Relaxante 15ml | 108.090 | BL | `blend-de-oleos-relaxante-15ml` | 7816509816913 |
| 12 | Óleo Essencial de Ylang-Ylang 5 ml | 76.083 | OE | `oleo-essencial-de-ylang-ylang-5mls` | 7816513454161 |
| 13 | Óleo Essencial de Limão Siciliano 10 ml | 73.738 | OE | `oleo-essencial-de-limao-siciliano-10ml` | 7816507883601 |
| 14 | Óleo Vegetal de Semente de Uva 100 ml | 71.888 | OV | `oleo-vegetal-de-semente-de-uva-100ml` | 7816508899409 |
| 15 | Óleo Essencial de Copaíba 10 ml | 70.075 | OE | `oleo-essencial-de-copaiba-10ml` | 7816507195473 |
| 16 | Óleo Essencial de Lemongrass 10 ml | 69.104 | OE | `oleo-essencial-de-lemongrass-10ml` | 7816507818065 |
| 17 | Blend de Óleos Mulher 15ml | 59.996 | BL | `blend-de-oleos-mulher-15ml` | 7837980164177 |
| 18 | Óleo Essencial de Patchouli 5ml | 55.142 | OE | `oleo-essencial-de-patchouli-5ml` | 7816518172753 |
| 19 | Kit Noite Perfeita | 54.059 | KIT | `kit-noite-perfeita` | 15706970128465 |
| 20 | Óleo Vegetal de Semente de Uva 1Lt Nacional | 52.181 | OV | `oleo-vegetal-de-semente-de-uva-1lt-nacional` | 7816513028177 |
| 21 | Óleo Essencial de Hortelã do Brasil 10 ml | 52.180 | OE | `oleo-essencial-de-hortela-do-brasil-10ml` | 7816507588689 |
| 22 | Roll On Sensual 10ml | 51.030 | RO | `roll-on-oleos-essencias-sensual` | 7816511455313 |
| 23 | ⚠️ Óleo Vegetal de Jojoba 30 ml | 43.017 | OV | `oleo-vegetal-de-jojoba-30ml` | 7816508735569 — **DRAFT** |
| 24 | Blend de Óleos Energizante 15ml | 42.780 | BL | `blend-de-oleos-energizante-15ml` | 7816509849681 |
| 25 | ⚠️ Blend de Óleos Zen 15ml | 38.675 | BL | `blend-de-oleos-zen-15-ml` | 7816510537809 — **DRAFT** |
| 26 | ⚠️ Óleo Essencial de Vetiver 5 ml | 37.262 | OE | `oleo-essencial-de-vetiver-5ml` | 7816508637265 — **DRAFT** |
| 27 | Roll On Zen 10ml | 36.502 | RO | `roll-on-oleos-essencias-zen` | 7816516862033 |
| 28 | Óleo Essencial de Gerânio Bourbon 5 ml | 36.013 | OE | `oleo-essencial-de-geranio-bourbom-5ml` | 7816508211281 |
| 29 | Kit Corpo & Mente | 35.770 | KIT | `kit-corpo-mente` | 15706970521681 |
| 30 | Kit Sensualidade & Autoestima | 35.721 | KIT | `kit-sensualidade-autoestima` | 15706970587217 |
| 31 | Anex Emoliente Natural 15ml | 35.542 | COS | `anex-anestesico-natural-podologia` | 7816512733265 |
| 32 | Room Spray Bem Estar 120ml | 35.306 | RS | `room-spray-bem-estar` | 7816510701649 |
| 33 | Óleo Essencial de Bergamota 5 ml | 35.114 | OE | `oleo-essencial-de-bergamota-05ml` | 7816517976145 |
| 34 | Óleo Essencial de Cravo 10 ml | 35.105 | OE | `oleo-essencial-de-cravo-10ml` | 7816507293777 |
| 35 | Óleo Essencial de Cedro 10 ml | 33.444 | OE | `oleo-essencial-de-cedro-10ml` | 7816506966097 |
| 36 | Roll On Relaxante 10ml | 31.579 | RO | `roll-on-oleos-essencias-relaxante` | 7816511389777 |
| 37 | Roll On Energizante 10ml | 31.365 | RO | `roll-on-oleos-essencias-energizante` | 7816516763729 |
| 38 | Óleo Essencial de Citronela 10 ml | 29.753 | OE | `oleo-essencial-de-citronela-10ml` | 7816507129937 |
| 39 | Óleo Vegetal de Amêndoa Doce 100 ml | 29.026 | OV | `oleo-vegetal-de-amendoa-doce-100ml` | 7816508801105 |
| 40 | Blend de Óleos Refrescante 15ml | 26.978 | BL | `blend-de-oleos-refrescante-bysamia-aromaterapia-15ml` | 7816510472273 |

**Distribuição por arquétipo:** OE 17 · BL 6 · RO 4 · OV 5 · KIT 5 · RS 1 · COS 1 · (3 dos acima estão em DRAFT)

**Concentração:** os 10 primeiros = R$ 2,50 mi de R$ 4,31 mi do top 60 → **58% da receita**. É onde o conteúdo paga primeiro.

---

## 3. Bandeiras críticas (achadas no levantamento)

### 3.1 🔴 Três produtos do top 26 em receita estão em DRAFT — invisíveis na loja

| Produto | Receita 365d | Status |
|---|---:|---|
| Óleo Vegetal de Jojoba 30 ml | R$ 43.017 | DRAFT |
| Blend de Óleos Zen 15ml | R$ 38.675 | DRAFT |
| Óleo Essencial de Vetiver 5 ml | R$ 37.262 | DRAFT (e há um 2º duplicado também DRAFT) |

**R$ 118.954/ano fora do ar.** Não é escopo desta tarefa mexer em `status` de produto (regra de menor escopo), então **não vou publicar**. Mas o conteúdo dos três será gerado e subido — se o time reativar, a PDP já nasce completa.

Há também **duplicatas em DRAFT** de dezenas de produtos (série de GIDs `78477307…` e `78477321…`) com handles quase iguais. Risco de subir metafield no produto errado — por isso o plano fixa o **Product GID numérico** de cada item, não o título.

### 3.2 🔴 Os `trust_icons` que já estão no ar violam o próprio brandbook e a ANVISA

43 produtos carregam ícones cujo `title`/`description` usa exatamente o vocabulário que o brandbook lista como **banido** e que a RDC 07/2015 não permite para cosmético. Amostra real do que está publicado:

| Metaobjeto | Texto no ar | Problema |
|---|---|---|
| `acao-anti-inflamatoria` | "Ação anti-inflamatória — útil em dores articulares, contusões e lesões musculares" | claim farmacêutico |
| `analgesico-dor-de-dente` | "Analgésico (dor de dente) — antibacteriano e antifúngico" | claim de medicamento |
| `cicatrizante-e-antisseptico-de-feridas` | "Cicatrizante e antisséptico de feridas" | claim terapêutico |
| `natal` | "Redução de estresse, ansiedade e insônia" | 3 claims terapêuticos (e o handle é "natal") |
| `equilibrio-emocional-1` | "Ansiolítico leve, ajuda na insônia" | termo explicitamente banido |
| `repelente-natural` | "eficaz contra insetos (como dengue)" | claim sanitário/registro MS |
| `util-em-dores-cronicas-e-fibromialgia` | "Útil em dores crônicas e fibromialgia" | nomeia doença |
| `acao-drenante-e-desintoxicante` | "útil em tratamentos corporais e celulite" | claim terapêutico |
| `antifungico-e-antibacteriano-potente` | "micoses, caspa, acnes" | nomeia patologia |

Os **ícones (MediaImage) em si estão ótimos** e são reutilizáveis — o problema é 100% textual. Plano: **manter os arquivos de ícone, reescrever título e descrição** num pool novo e compliant, e re-apontar os top 40 para ele (§6.2).

### 3.3 🟠 As `description` dos produtos (que viram a aba "Descrição") também estão não-compliant

A aba 1 da PDP renderiza `product.description` cru. Textos hoje no ar:

- Lavanda: *"auxilia no combate à insônia"*, *"Ação antisséptica e antibacteriana"*
- Alecrim: *"propriedades antioxidantes, anti-inflamatórias"*, *"Efeito anti-inflamatório e analgésico"*, *"Ajuda em tratamentos de saúde mental"*
- Blend Mulher: *"Reduz os sintomas da TPM e menopausa"*
- Rosa Mosqueta: *"propriedades curativas"*, *"Propriedades anti-inflamatórias"*
- Kits: *"suporte terapêutico"*, *"combater o estresse"*, *"estimula a libido"*

**Fora do escopo dos 7 metafields** — `descriptionHtml` é outro campo. Reportado, não corrigido. Vale uma tarefa separada, porque não faz sentido a aba "Composição" estar compliant ao lado de uma aba "Descrição" que não está.

### 3.4 🟠 Bug em aberto: `custom.how_to_use` (≠ `how_to_use_pdp`)

Já registrado na auditoria de 29/07: `sections/product-how-to-use.liquid` espera `metaobject_reference → como_usar`, mas a chave está criada como `multi_line_text_field`. A section nunca renderiza. **Não afeta este plano** — o que o `product.json` monta é `goshop-how-to-use-pdp` lendo `how_to_use_pdp`, que está correto. Continua pendente de decisão do time do tema.

---

## 4. Restrições técnicas do tema que mudam a redação

Li os dois snippets do develop. Quatro achados que ditam o formato do texto — ignorar qualquer um deles gera PDP quebrada, não só feia.

### 4.1 `modo-de-uso` é quebrado em passos numerados **por ponto final**

```liquid
assign modo_de_uso = modo_plain_text | strip | escape
assign sentences = modo_de_uso | split: '.'
{% for sentence in sentences %}<p>{{ forloop.index }}. {{ sentence }}</p>{% endfor %}
```

**Regras que isso impõe:**
- ❌ Nenhuma abreviação com ponto: `Dr.`, `aprox.`, `etc.`, `ml.`, `Obs.`
- ❌ Nenhum decimal com ponto: `2.5 ml` → escrever `2 a 3 gotas`
- ❌ Nada de reticências
- ✅ 3 a 5 frases, cada uma um passo completo e autossuficiente
- ✅ Dois-pontos são seguros: `Difusor: pingue 3 a 5 gotas na água`
- ⚠️ Rich text é **descartado** (`strip_html`) — negrito/lista não sobrevivem. O campo é `rich_text_field` por definição, mas na prática **escreva como texto corrido em um único parágrafo.**

### 4.2 Cada item de `faq` vira **uma aba própria**, lado a lado com Descrição/Composição/Modo de uso

```liquid
{% for item in product.metafields.custom.faq.value %}
  <label class="jump-faq-tab-label" ...>{{ item.faq_question }}</label>
```

com `white-space: nowrap` na label. Consequência:

- ✅ **Máximo 2 FAQs por produto** → 5 abas no total (Descrição · Composição · Modo de uso · FAQ1 · FAQ2). Cabe no mobile com scroll horizontal.
- ✅ `faq_question` é **rótulo de aba, não frase**: 2 a 4 palavras. `"É 100% puro?"` ✅ · `"Este produto é vegano e cruelty-free?"` ❌ (estoura a barra)
- ✅ `faq_answer` é `multi_line_text_field` impresso cru dentro de um `<p>` — **texto puro, sem HTML, sem markdown**
- ❌ Não usar 6+ FAQs "porque cabe no acordeão": no layout `tabs` (default do bloco) fica uma régua horizontal ilegível

### 4.3 `cor_bullet_point` **é usada** — e o check é preto

```liquid
<circle cx="10" cy="10" r="10" fill="{{ benefits_data.cor_bullet_point }}"/>
<path d="M6 10l3 3 5-5" stroke="black" stroke-width="2" .../>
```

O bullet é um círculo colorido com um ✓ **preto** por cima.

- ✅ Usar **`#F6DF88`** (amarelo pastel By Samia) — check preto sobre pastel = contraste alto, e é cor de paleta
- ❌ Deixar vazio → `fill=""`, círculo transparente, check preto solto no branco
- ❌ `#FFCE20` puro satura demais numa lista de 4 bullets (o brandbook pede o amarelo forte como destaque **pontual**)
- ❌ **Não usar emoji nos bullets** (convenção Kokeshi/Goshop): aqui já existe o ✓ no SVG, emoji vira ruído duplicado. **Esta é uma divergência deliberada da convenção da skill `pdp-content` §3, específica da By Samia.**
- ⚠️ Os 2 `product_benefit` existentes usam `#698b6f` (verde Ápice) — herança de teste, não seguir

### 4.4 `composicao` é o único campo onde rich text realmente renderiza

Roteado por `metafield_tag` quando `type == 'rich_text_field'`. Lista com marcadores e negrito funcionam. É onde vai o INCI estruturado.

`product_benefit.descricao` e `.titulo_destacado` também são rich text via `metafield_tag`. `beneficios` é `list.single_line_text_field` → texto puro.

---

## 5. Régua editorial By Samia para PDP

### 5.1 Estrutura canônica (brandbook §4, "Estrutura típica de copy")

1. **Convite sensorial** — o que se sente, não o que o produto é
2. **Benefício aromacológico** — o que o aroma favorece
3. **Ingrediente-âncora** — nome popular + científico
4. **Credencial de pureza** — 100% puro, vegano, cruelty-free, sem conservantes
5. **CTA acolhedor** — "Inclua no seu ritual", nunca urgência

### 5.2 Verbos permitidos vs. banidos

| ✅ Usar | ❌ Nunca |
|---|---|
| auxilia, favorece, promove sensação de, convida a, proporciona, contribui para | trata, cura, combate, elimina, alivia dores, reduz medidas, previne |

### 5.3 Tabela de substituição — aplicada em todo o batch

| Claim no ar hoje | Substituição compliant |
|---|---|
| "auxilia no combate à insônia" | "favorece um ambiente propício ao sono" |
| "combate a ansiedade" / "ansiolítico leve" | "promove sensação de calma" |
| "ação anti-inflamatória" | "sensação de conforto e alívio" (cosmético) |
| "analgésico" / "alivia dores musculares" | "proporciona sensação de relaxamento muscular" |
| "cicatrizante" / "antisséptico" / "antibacteriano" | "purifica e auxilia na limpeza natural da pele" |
| "reduz sintomas de TPM e menopausa" | "acolhe o corpo nos dias do ciclo" |
| "propriedades curativas" | "auxilia na renovação natural da pele" |
| "elimina edemas" / "drenante" | "auxilia na sensação de leveza" |
| "redução de medidas" | "promove sensação de firmeza aparente" |
| "eficaz contra insetos (dengue)" | "aroma que ajuda a afastar insetos" |
| "útil em fibromialgia / micose / acne / celulite" | remover a doença; falar da sensação |
| "estimula a libido" | "desperta a sensualidade e a autoestima" |

### 5.4 Disclaimers obrigatórios

- **Todo óleo essencial** (vai no fim de `modo-de-uso`): *"Não utilizar por via oral. Diluir em óleo vegetal antes do uso tópico"*
- **Cítricos** (Laranja, Limão Siciliano, Bergamota, Tangerina, Grapefruit): *"Não expor ao sol após a aplicação"*
- **FAQ de bem-estar**: *"Aromaterapia é prática complementar de bem-estar e não substitui orientação médica"*

---

## 6. Arquitetura de conteúdo — 7 arquétipos

Princípio: **reuso > criação** (skill `pdp-content` §4). `how_to_use_pdp` e `product_ingredients` são quase 100% reutilizáveis por arquétipo/botânico; `product_benefit` e `composicao` são sempre product-specific.

### 6.1 `product_info_benefits` → `product_benefit` — 1 por produto (40 novos)

Payload fixo em todos: `cor_bullet_point = "#F6DF88"`, 4 bullets, handle `<slug>-benefits`.

**Molde OE** (exemplo real, Lavanda #1):

- `descricao` (rich): "Uma gota de lavanda no difusor e o ambiente muda de ritmo. Colhida das flores de *Lavandula angustifolia*, é o óleo mais versátil da aromaterapia — e a porta de entrada de quem está começando."
- `titulo_destacado` (rich): "Bem-estar em gotas, desde 2000"
- `beneficios`:
  1. "Promove sensação de calma e favorece um ambiente propício ao sono"
  2. "Auxilia no equilíbrio emocional nos dias de rotina intensa"
  3. "100% puro de Lavandula angustifolia, sem diluentes ou essências artificiais"
  4. "Vegano, cruelty-free e livre de conservantes"

**Molde BL** — bullet 1 = propósito do blend · 2 = os óleos que o compõem · 3 = pureza (não diluído) · 4 = selo
**Molde RO** — bullet 1 = propósito · 2 = pronto para usar, diluído em jojoba · 3 = toque seco/portátil · 4 = selo
**Molde OV** — bullet 1 = benefício de pele · 2 = uso como carreador de OE · 3 = 100% puro prensado a frio `[VALIDAR]` · 4 = selo
**Molde KIT** — bullet 1 = para quem é · 2 = o que vem dentro (itens + volume) · 3 = como se conectam num ritual · 4 = selo
**Molde RS** — bullet 1 = efeito no ambiente · 2 = onde usar · 3 = composição de OEs · 4 = selo
**Molde COS** — bullet 1 = benefício principal · 2 = benefício secundário · 3 = ativos-âncora · 4 = selo

### 6.2 `trust_icons` — política de reuso em 3 níveis

Levantamento completo: **91 instâncias** de `trust_icons` na loja. Antes de criar qualquer coisa, cada conceito foi confrontado com o catálogo existente. Resultado em 3 níveis:

#### Nível 1 — REUSAR como está (já compliant, 18 metaobjetos)

| GID | handle | title / description |
|---|---|---|
| 487714488401 | `vegano-e-livre-de-conservantes` | Vegano e Livre de Conservantes / cruelty-free e 100% puro — **4º ícone de todos os 40** |
| 491118461009 | `facilita-a-concentracao` | Facilita a concentração / em momentos de dispersão |
| 491118428241 | `promove-disposicao-imediata` | Promove disposição imediata / ideal para rotina intensa |
| 487736541265 | `estimulacao-suave-da-mente` | Estimulação Suave da Mente / Favorece foco sem agitação |
| 487736639569 | `ambiente-relaxante` | Ambiente Relaxante / Ótimo para inalações e difusores, inclusive em ambientes infantis |
| 488726036561 | `relaxante-ambiental` | Relaxante ambiental / Espaço Calmo e Acolhedor |
| 491111317585 | `pausa-consciente` | Pausa Consciente / Facilita momentos de pausa e respiração consciente |
| 491111252049 | `alivia-tensoes-emocionais-e-fisicas` | Alivia tensões emocionais e físicas / Suporte contra o Estresse Físico e Mental |
| 488729444433 | `apoio-emocional` | Apoio emocional / momentos de perda, luto e transições |
| 491112038481 | `aplicacao-pratica` | Aplicação prática / nos pulsos, têmporas e nuca — **os 4 roll-ons** |
| 491679383633 | `facilita-o-autocuidado` | Facilita o autocuidado / e o despertar dos sentidos |
| 491679547473 | `intensifica-o-magnetismo` | Intensifica o magnetismo / e a autoconfiança |
| 491683020881 | `ajuda-a-aliviar-o-cansaco` | Ajuda a aliviar o cansaço / mental e físico |
| 491021533265 | `pele-radiante` | Pele Radiante / Devolve a Vitalidade e a Luminosidade |
| 491020091473 | `controle-de-oleosidade` | Controle de Oleosidade / Regula e Equilibra a Oleosidade Natural |
| 491021500497 | `nutricao-capilar` | Nutrição Capilar / Recupera o Brilho e a Sedosidade |
| 491019534417 | `saude-capilar` | Saúde Capilar / Fortalece os Fios e Cuida do Couro Cabeludo |
| 1755521712209 · 1755525349457 · 1755529969745 | `100-puro` · `vegano` · `cruelty-free` | Selos do refresh, `description: "."` — reservados pro strip do tema novo, **não usar junto do 487714488401** (redundância) |

#### Nível 2 — CORRIGIR o texto e reusar (`metaobjectUpdate`, 3 metaobjetos)

Conceito certo, redação com problema. **Atualizar é melhor que duplicar** — o metaobjeto já está referenciado em produtos, e criar um gêmeo compliant deixaria os dois no admin.

| GID | handle | Texto atual | Correção |
|---|---|---|---|
| 491683217489 | `livre-respiracao` | "Auxilia no Descongestionar das Vias" | → "Frescor que abre o ambiente e o peito" (descongestionar = claim) |
| 491016257617 | `massagens-para-relaxamento` | "e melhora da circulação sanguínea" | → "Base ideal para massagens de relaxamento" (circulação = claim) |
| 488697462865 | `sensacao-de-resfrescancia` | title com typo "Resfrescância" | → "Sensação de refrescância" |

#### Nível 3 — CRIAR (conceito ausente no catálogo, 18 metaobjetos)

Cada um substitui um ou mais dos não-compliant de §3.2, **reaproveitando o MediaImage já no CDN** — zero custo de PiApp.

| Novo handle | title / description | MediaImage | Substitui |
|---|---|---|---|
| `calma-e-sono-tranquilo` | Calma e sono tranquilo / Favorece um ambiente propício ao descanso | 67792605282385 | `natal`, `promove-sono-leve…`, `calmante-profundo`, `estabilizador-emocional-profundo` |
| `equilibrio-emocional-seguro` | Equilíbrio emocional / Auxilia a atravessar dias de rotina intensa | 67777154056273 | `equilibrio-emocional`, `equilibrio-emocional-1`, `reducao-de-estresse…` |
| `alegria-e-leveza` | Alegria e leveza / Aroma cítrico que ilumina o ambiente | 67789065650257 | — |
| `pureza-da-pele` | Pureza da pele / Purifica e auxilia na limpeza natural | 67792566419537 | `antifungico-e-antibacteriano-potente`, `cicatrizante-e-antisseptico…`, `acao-antibacteriana…` |
| `pele-renovada` | Pele renovada / Auxilia na renovação natural da pele | 67789061881937 | `regenerador-celular`, `reduzir-inflamacoes-cutaneas`, `regeneracao-cicatrizacao` |
| `conforto-muscular` | Conforto muscular / Proporciona sensação de relaxamento após o esforço | 67777176141905 | `acao-anti-inflamatoria`, `relaxante-muscular`, `alivio-de-dores…`, `util-em-dores-cronicas-e-fibromialgia` |
| `respiracao-ampla` | Sensação de respiração ampla / Frescor que abre o ambiente e o peito | 67789715931217 | `suporte-respiratorio…`, `alivio-de-congestionamento`, `conforto-respiratorio` |
| `acolhimento-no-ciclo` | Acolhimento no ciclo / Cuidado nos dias que pedem mais gentileza | 67789152518225 | `equilibrio-hormonal-feminino` |
| `aterramento` | Aterramento / Aroma terroso que traz presença e estabilidade | 67789169426513 | `equilibrio-nervoso` |
| `aroma-quente-e-acolhedor` | Aroma quente e acolhedor / Envolve o ambiente nos dias frios | 67790270038097 | `analgesico-dor-de-dente` |
| `aroma-que-afasta-insetos` | Aroma que afasta insetos / Alternativa natural para varandas e quintais | 67793325064273 | `repelente-natural` ("eficaz contra dengue"), `barreira-natural` |
| `sensacao-de-leveza` | Sensação de leveza / Auxilia na sensação de leveza corporal | 67796324417617 | `acao-drenante-e-desintoxicante`, `fortalecedor-do-sistema-circulatorio…`, `acao-diuretica-e-urinaria` |
| `nutricao-profunda` | Nutrição profunda / Hidratação intensa para pele seca | 67777178042449 | `hidrata-e-regenera` |
| `toque-seco` | Toque seco / Absorção rápida, sem sensação oleosa | 67872146292817 | — |
| `carreador-ideal` | Carreador ideal / Base para diluir seus óleos essenciais | 67789349093457 | — |
| `pronto-para-usar` | Pronto para usar / Já diluído em óleo vegetal de jojoba | 67872366854225 | — |
| `curadoria-de-ritual` | Curadoria de ritual / Óleos escolhidos para funcionarem juntos | 67789004734545 | — |
| `porta-de-entrada` | Porta de entrada / Ideal para quem está começando na aromaterapia | 67789722386513 | — |

**Saldo: 18 reusos + 3 correções + 18 criações** — contra 26 criações do rascunho anterior. O pool antigo não-compliant **não é deletado** (Shopify não tem restore), só deixa de ser referenciado.

**Cobertura da remediação:** os 40 do top **mais** os ~15 fora dele que hoje apontam pro pool antigo. Ao fim, nenhum produto ativo da loja referencia claim proibido em `trust_icons`.

### 6.3 `how_to_use_pdp` → `video_tutorial_how_to_use` — 1 reuso + 6 novos

Um metaobjeto serve **todos** os produtos do arquétipo — é o maior ganho de reuso do batch (40 produtos, 7 metaobjetos). `media` fica vazio nesta rodada (`file_reference`, opcional) — vídeo/imagem entra na sessão de PiApp.

**Reuso por atualização:** já existe `seu-ritual-em-3-passos` (`gid://shopify/Metaobject/1754862878801`) com tópicos "Pingue 2 a 3 gotas no difusor com água / Respire fundo e deixe o aroma preencher o ambiente / Para uso tópico, dilua em óleo vegetal antes de aplicar". **É exatamente o how-to de óleo essencial puro** — recebe `metaobjectUpdate` (4º tópico de banho + disclaimer de via oral) em vez de virar um duplicado.

| Handle | `titulo` | `topicos` | Serve |
|---|---|---|---|
| `seu-ritual-em-3-passos` **(update)** | Como usar seu óleo essencial | 4 tópicos: difusor · inalação a seco · banho · pele diluída | 17 OE |
| `como-usar-blend` | Como usar seu blend | 4: difusor · massagem diluída · banho · lenço | 6 BL |
| `como-usar-roll-on` | Como usar seu roll-on | 3: pulsos e nuca · têmporas · respirar fundo | 4 RO |
| `como-usar-oleo-vegetal` | Como usar seu óleo vegetal | 4: pele limpa · como carreador · cabelo · massagem | 5 OV |
| `como-usar-kit-aromaterapia` | Como usar seu kit | 3: escolha a intenção do momento · difusor ou tópico · alterne pelos horários do dia | 5 KIT |
| `como-usar-room-spray` | Como usar seu room spray | 3: agite · borrife no ambiente · repita quando quiser | 1 RS |
| `como-usar-anex-unhas` | Como usar o Anex | 3: unhas e cutículas limpas · massageie até absorver · uso diário | 1 COS |

### 6.4 `product_ingredients_metafield` → `product_ingredients` — ~34 cards botânicos

2 a 4 cards por produto, **todos vindos de um pool botânico reusado**. `ingredient_image` é opcional e fica vazio nesta rodada → **sessão PiApp separada** para as ~34 imagens (§8, Onda 4).

**Reuso existente:** `lavandula-angustifolia` (1755825438801) e `pureza-garantida` (1755825569873).

Pool a criar — 1 card por botânico, com `ingredient_title` = nome científico e `ingredient_description` (rich) = origem + parte usada + o que promove:

Rosmarinus officinalis QT1 Cânfora · Citrus sinensis · Melaleuca alternifolia · Mentha piperita · Eucalyptus globulus · Cananga odorata · Citrus limon · Copaifera spp. · Cymbopogon citratus · Pogostemon cablin · Mentha arvensis · Pelargonium graveolens · Citrus bergamia · Syzygium aromaticum · Cedrus atlantica · Cymbopogon nardus · Vetiveria zizanioides · Santalum album · Citrus aurantium (Petitgrain) · Origanum majorana · Citrus reticulata · Salvia sclarea · Cymbopogon martinii · Rosa rubiginosa · Vitis vinifera · Prunus amygdalus dulcis · Simmondsia chinensis · Citrus latifolia · Cinnamomum verum · Myristica fragrans · Azadirachta indica · Calendula officinalis

**Ganho do pool:** ex. *Lavandula angustifolia* entra em Lavanda OE, Blend Bem Estar, Blend Relaxante, Blend Energizante, Roll On Relaxante, Kit Trilogia, Kit Trio Básico, Kit Noite Perfeita → **1 card, 8 produtos.**

### 6.5 `composicao` (rich text) — 40, product-specific

Formato: parágrafo de INCI + lista de componentes + linha de pureza.

**Dados reais já confirmados** (minerados das `description` da própria loja, não inventados):

| Produto | Composição confirmada |
|---|---|
| Lavanda 10ml | 100% puro *Lavandula angustifolia*, flores |
| Alecrim 10ml | 100% puro *Rosmarinus officinalis* L, quimiotipo **QT1 Cânfora** |
| Blend Bem Estar | Lemongrass + Lavanda + Laranja |
| Blend Relaxante | Lavanda + Laranja + Patchouli + Lemongrass |
| Blend Mulher | Patchouli + **Limão Tahiti** + Gerânio |
| Blend Energizante | Alecrim + Tangerina + Hortelã-pimenta + Lavanda + Cedro + Laranja + Palmarosa (**7 óleos**) |
| Blend Refrescante | Hortelã + Laranja + Lemongrass |
| Roll On Relaxante | Lavanda + Cedro + Manjerona **+ jojoba** |
| Roll On Zen | Sândalo + Petitgrain **+ jojoba** |
| Roll On Energizante | Alecrim + Hortelã-pimenta **+ jojoba** |
| Roll On Sensual | Ylang-Ylang + Rosa + Jasmim **+ jojoba** |
| Room Spray Bem Estar | Lemongrass + Lavanda + Laranja |
| Kit Trilogia Essencial | Lavanda 10ml + Alecrim 10ml + Laranja 10ml |
| Kit Trio Básico | Alecrim 10ml + Lavanda 10ml + Tea Tree 10ml |
| Kit Noite Perfeita | Roll On Relaxante + Roll On Zen + Roll On Mulher |
| Kit Corpo & Mente | Roll On Energizante + Roll On Zen + Roll On Relaxante |
| Kit Sensualidade & Autoestima | Roll On Sensual + Roll On Mulher |
| Rosa Mosqueta 30ml | *Rosa rubiginosa*, sementes — ~80% ácidos graxos poli-insaturados (linoleico 44–49%, linolênico 28–34%), vitaminas A e C |
| Semente de Uva 100ml / 1L | *Vitis vinifera*, semente — rico em vitamina E |
| Amêndoa Doce 100ml | *Prunus amygdalus dulcis*, **prensado a frio** — vitaminas A, B1, B2, B3, B5, B6, C, E; ferro, magnésio, potássio, zinco, cobre, cálcio |
| Anex Emoliente 15ml | Hortelã + Cravo + Canela + Palmarosa + Tea Tree + Noz-Moscada + Neem + Calêndula (**8 óleos**) |

**Correções de dado que o batch já resolve:** o `produtos.csv` diz Blend Mulher = "Gerânio + Patchouli" (a loja diz + Limão Tahiti) e Blend Energizante = "Alecrim + Tangerina + Hortelã Pimenta" (a loja diz 7 óleos). **A loja é a fonte mais completa** → uso a loja e corrijo o CSV.

### 6.6 `modo-de-uso` (texto corrido, split por ponto) — 40, por arquétipo

**Molde OE** (4 passos):
> "Difusor: pingue 3 a 5 gotas na água e ligue por 20 a 30 minutos. Inalação: pingue 1 gota em um lenço e respire fundo. Banho: dilua 3 gotas em uma colher de óleo vegetal antes de adicionar à água morna. Pele: dilua sempre em óleo vegetal, na proporção de 1 gota para cada 5 ml, e não utilize por via oral"

**Molde RO** (3 passos):
> "Aplique nos pulsos, na nuca e atrás das orelhas. Massageie suavemente com movimentos circulares. Aproxime os pulsos do rosto e respire fundo por três vezes"

**Molde OV** (4), **BL** (4), **KIT** (3), **RS** (3), **COS** (3) — mesmo princípio, todos sem abreviação com ponto.

Cítricos ganham 5º passo: "Não expor ao sol após a aplicação na pele"

### 6.7 `faq` → `faq_point` — 2 por produto (rótulos curtos)

Estrutura: **1 do pool do arquétipo + 1 product-specific.**

**Pool do arquétipo (10 novos, reusados):**

| Handle | `faq_question` (aba) | Serve |
|---|---|---|
| `e-100-puro` | É 100% puro? | OE, BL, OV |
| `pode-usar-na-pele` | Pode usar na pele? | OE, BL |
| `ja-vem-diluido` | Já vem diluído? | RO |
| `vegano-e-cruelty-free` | Vegano e cruelty-free? | todos |
| `serve-para-diluir` | Serve para diluir? | OV |
| `como-guardar` | Como guardar? | todos |
| `o-que-vem-no-kit` | O que vem no kit? | KIT |
| `pode-em-criancas` | Pode em crianças? | OE, BL, RS |
| `qual-a-validade` | Qual a validade? | todos |
| `onde-borrifar` | Onde borrifar? | RS |

**Product-specific (40):** rótulo de 2–4 palavras ligado ao produto. Ex.: Lavanda → `"Qual lavanda é?"` (angustifolia vs. Bulgária); Alecrim → `"Que quimiotipo?"`; cítricos → `"É fotossensível?"`; Tea Tree → `"Pode no rosto?"`; Rosa Mosqueta → `"Mancha a pele?"`; Anex → `"Serve em podologia?"`.

---

## 7. Volumetria — depois da política de reuso

| Objeto | Criar | Atualizar e reusar | Reusar como está | Referências totais |
|---|---:|---:|---:|---:|
| `product_benefit` | 39 | 1 | 0 | 40 |
| `trust_icons` | 18 | 3 | 18 | 160 (4 × 40) |
| `video_tutorial_how_to_use` | 6 | 1 | 0 | 40 |
| `product_ingredients` | 32 | 0 | 2 | ~110 (2–4 × 40) |
| `faq_point` | 10 pool + 40 específicos | 0 | 0 | 80 (2 × 40) |
| **Total metaobjetos** | **145** | **5** | **20** | — |
| `metafieldsSet` | — | — | — | **280** (7 × 40) + ~15 de remediação |

**Fator de reuso alcançado:** 430 referências saindo de 170 metaobjetos = **2,5× por objeto**. Os campeões: `seu-ritual-em-3-passos` (17 produtos), `vegano-e-livre-de-conservantes` (40), `Lavandula angustifolia` (8), `curadoria-de-ritual` (11).

**Sinal de alerta da skill (§4, "4+ metaobjetos com mesmo texto → PARE"):** aplicado. Foi ele que derrubou 8 criações do rascunho — `foco-e-clareza-mental` colidia com `facilita-a-concentracao`, `ambiente-em-pausa` com `relaxante-ambiental`, `frescor-imediato` com `sensacao-de-refrescancia`, `sensualidade-e-autoestima` com `intensifica-o-magnetismo`, `cabe-na-bolsa` com `aplicacao-pratica`, `equilibrio-da-oleosidade` com `controle-de-oleosidade`, `100-puro-prensado-a-frio` com os selos do refresh, `ritual-de-meditacao` com `pausa-consciente`.

**Chamadas MCP:** ~145 `metaobjectCreate` + 5 `metaobjectUpdate` (1 por chamada, payload pequeno) + ~12 `metafieldsSet` (25 metafields por chamada). Payload pequeno — não é o gargalo de 30 KB de HTML que travou o batch de blogs da Barbour's.

**Todo metaobjeto criado com `capabilities: { publishable: { status: ACTIVE } }`** — as 5 definições têm `publishable` habilitado e o tema só renderiza ACTIVE. Auditoria de DRAFT no fim de cada onda.

### 7.1 Regra anti-duplicata para as ondas seguintes

Antes de **cada** `metaobjectCreate` das Ondas 2 e 3:

```graphql
query CheckReusable($q: String!) {
  metaobjects(type: "trust_icons", first: 25, query: $q) {
    edges { node { id handle fields { key value } } }
  }
}
```

Match semântico no `title` → reusa o GID. Match parcial com texto ruim → `metaobjectUpdate`. Só cria se o conceito não existir. O catálogo de GIDs vivo fica em `docs/shopify-schema/bysamia-pool-reuso.json`, atualizado a cada onda — é ele que se consulta primeiro, antes até da query.

---

## 8. Plano de subida em ondas

**Regra inviolável #0 aplicada em toda onda:** grava em `conteudos/bysamia/produtos/[slug]/[metafield]/textos/` **antes** de qualquer mutation, e `shopify-result.json` com os GIDs depois.

### Onda 0 — Fundação reusável, **dimensionada pelo piloto**
Cria só o pool que os 5 produtos do piloto consomem — não os 145 de uma vez. Motivo: se o formato de bullet, aba ou passo estiver errado, o retrabalho é em 6 metaobjetos, não em 145. O pool cresce nas ondas seguintes, sempre passando pela regra anti-duplicata de §7.1.

| Objeto | Ação |
|---|---|
| `trust_icons` | criar 6 (`calma-e-sono-tranquilo`, `equilibrio-emocional-seguro`, `alegria-e-leveza`, `pureza-da-pele`, `curadoria-de-ritual`, `porta-de-entrada`) + reusar 5 já compliant |
| `video_tutorial_how_to_use` | **atualizar** `seu-ritual-em-3-passos` → OE + criar `como-usar-kit-aromaterapia` |
| `product_ingredients` | criar 3 (*Rosmarinus officinalis* QT1, *Citrus sinensis*, *Melaleuca alternifolia*) + reusar 2 (`lavandula-angustifolia`, `pureza-garantida`) |
| `faq_point` | criar 4 de pool (`e-100-puro`, `pode-usar-na-pele`, `vegano-e-cruelty-free`, `o-que-vem-no-kit`) |

= **13 criações + 1 atualização.** Saída: `docs/shopify-schema/bysamia-pool-reuso.json`.

### Onda 1 — Piloto: top 5 (58% da receita começa aqui)
Lavanda · Kit Trilogia · Alecrim · Laranja · Tea Tree.

| Objeto | Ação |
|---|---|
| `product_benefit` | **atualizar** 1754957381713 → Lavanda (já tem bullets By Samia, só a `descricao` é herança da Ápice) + criar 4 |
| `faq_point` específicos | criar 5 |
| `metafieldsSet` | 35 (7 × 5) |

Sobe os 7 metafields completos e **para para revisão visual no preview do develop** antes de seguir.

### Onda 2 — Restante dos OE (12 produtos)
Hortelã Pimenta · Eucalipto · Ylang-Ylang · Limão Siciliano · Copaíba · Lemongrass · Patchouli · Hortelã do Brasil · Gerânio · Bergamota · Cravo · Cedro · Citronela

### Onda 3 — BL + RO + OV + KIT + RS + COS (23 produtos)
Inclui os 3 em DRAFT (conteúdo pronto, produto não publicado por mim).

### Onda 4 — Imagens (sessão PiApp separada, sob aprovação de crédito)
~34 `ingredient_image` botânicas + 7 `media` de how-to-use. Regra da skill: apresentar prompt, `check_credits` em batch ≥ 5, salvar prompt + metadata.

### Onda 5 (opcional) — Remediação fora do top 40
Re-apontar os ~15 produtos restantes que carregam `trust_icons` não-compliant, e/ou reescrever as `description` (§3.3).

---

## 9. Lacunas de dado — `[VALIDAR]` antes de publicar

| Lacuna | Onde impacta | Como vou tratar |
|---|---|---|
| **País de origem e método de extração** de cada OE | `composicao`, `product_ingredients` | Escrevo a composição com o que é certo (INCI + pureza) e **omito** origem/método em vez de inventar. Slot pronto para o time preencher. |
| **"Prensado a frio"** só está confirmado para Amêndoa Doce | `trust_icons` `100-puro-prensado-a-frio`, `composicao` OV | Aplico só onde a loja confirma. Nos outros, "100% puro". |
| **Validade / prazo pós-abertura** | FAQ `qual-a-validade` | Resposta genérica ("consulte o lote impresso no frasco") até o time dar o número |
| **Composição do Blend Zen 15ml** | `composicao` | CSV diz Sândalo + Petitgrain + Laranja + Lavanda; produto está DRAFT, sem description para cruzar → marcado `[VALIDAR]` |
| **Roll On Sensual: "Rosa" e "Jasmim"** | `composicao`, `product_ingredients` | A loja não diz se é absoluto ou OE diluído — cito o nome popular, sem nome científico |
| **Sistema visual: clássico vs. refresh** | cor `#F6DF88`, futura sessão PiApp | Uso a paleta **clássica** (a única com HEX oficial). Pendência do brandbook §5. |

---

## 10. Checklist de revisão humana

- [ ] Nenhum termo da tabela §5.3 aparece no conteúdo subido
- [ ] `modo-de-uso` de cada produto renderiza o número certo de passos no preview (sem passo fantasma por ponto)
- [ ] Barra de abas cabe no mobile — máx. 5 abas, rótulos de FAQ curtos
- [ ] Bullets com círculo `#F6DF88` visível e ✓ preto legível
- [ ] `composicao` bate com o rótulo físico do produto
- [ ] Nenhum metaobjeto ficou em DRAFT (query de auditoria por tipo)
- [ ] Metafields subiram no Product GID correto (não na duplicata DRAFT de handle parecido)
- [ ] `[VALIDAR]` de origem/método/validade resolvidos ou conscientemente deixados de fora

---

📝 Gerado por `pdp-content` + `brand-context` · By Samia · 2026-07-29
