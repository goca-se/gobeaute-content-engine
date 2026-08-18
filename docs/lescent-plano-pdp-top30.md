# Lescent — Plano de enriquecimento de PDP: top 30 produtos

> **Tema-alvo: `lescent-theme/develop`** (GID `gid://shopify/OnlineStoreTheme/186949861683`).
> Contexto completo e auditoria de metafields: `docs/lescent-contexto-enriquecimento.md`.
> Tom de voz e compliance: `brand-context/lescent/brandbook.md` §4 e §8 + `brand-context/_shared/compliance-anvisa.md`.
> Criado 2026-07-31.

---

## 1. Top 30 produtos — ranking por receita (net_sales 90d) cruzado com tráfego

Critério: **produtos `status: ACTIVE`** ordenados por `net_sales` dos últimos 90 dias (mai–jul/2026). Os SKUs "mestres" em DRAFT foram excluídos mesmo tendo receita alta — não se compra neles (ver contexto §6.1). Coluna de sessões vem de `FROM sessions GROUP BY landing_page_path`.

| # | Produto | Handle (ACTIVE) | Net sales 90d | Sessões 90d | Tipo |
|---|---|---|---|---|---|
| 1 | Kit Trilogia Essencial Nº 2+6+10 \| 25ml | `kit-nº-2-nº-6-nº-10-25ml` | R$ 1.882.102 | 34.785 | Kit F |
| 2 | Kit Trilogia Essencial Masculina Nº 12+13+20 \| 25ml | `kit-trilogia-essencial-masculina-nº-12-nº-13-nº-20-25ml` | R$ 1.796.212 | 46.807 | Kit M |
| 3 | Nº 2 • Délicate Londres - 25ml | `nº-2-delicate-londres-copy` | R$ 457.598 | 46.040 | Single F |
| 4 | Nº 2 • Délicate Londres - 100ml | `nº-2-delicate-londres` | R$ 416.281 | 20.061 | Single F |
| 5 | Kit Sexteto Masculino Nº 12+13+19+20+29+33 | `kit-sexteto-masculino-nº-12-nº-13-nº-14-nº-20-nº-27-nº-33-25ml` | R$ 368.499 | 10.382 | Kit M |
| 6 | Nº 20 • Brise Amalfi - 100ml | `nº-20-brise-amalfi-copia-copia` | R$ 322.052 | 23.277 | Single M |
| 7 | Kit Sexteto Feminino Nº 2+5+9+11+26+30 | `kit-sexteto-feminino-nº-1-nº-5-nº-9-nº-11-nº-26-nº-30-25ml` | R$ 305.401 | 9.434 | Kit F |
| 8 | Kit Trilogia Gold Nº 23+25+27 \| 25ml | `kit-trilogia-gold-n-23-n-25-n-27-25ml` | R$ 299.243 | 11.881 | Kit M |
| 9 | Nº 13 • Féroce Provence - 100ml | `nº-13-feroce-provence-copy-copy` | R$ 297.592 | 30.103 | Single M |
| 10 | Kit Trilogia Essencial Masculina \| 100ml | `kit-trilogia-essencial-masculina-nº-12-nº-13-nº-20-100ml` | R$ 224.345 | 22.605 | Kit M |
| 11 | Nº 27 • Golden Dubai - 25ml | `nº-27-golden-dubai-25-ml` | R$ 219.957 | 26.228 | Single M |
| 12 | Nº 7 • Sublime Versailles - 25ml ⚠️ estoque 0 | `no-7-sublime-versailles-copy-copy` | R$ 212.811 | 77.971 | Single F |
| 13 | Nº 6 • Gracieuse Cannes - 100ml | `nº-6-gracieuse-cannes-copy` | R$ 208.130 | 10.171 | Single F |
| 14 | Nº 7 • Sublime Versailles - 100ml | `nº-7-sublime-versailles-copy` | R$ 203.551 | 25.003 | Single F |
| 15 | Kit Trilogia Essencial Nº 2+6+10 \| 100ml | `kit-trilogia-essencial-nº-2-nº-6-nº-10-100ml` | R$ 190.271 | 17.110 | Kit F |
| 16 | Nº 26 • Élegance Vienna - 25ml | `nº-26-elegance-vienna-25-ml` | R$ 183.183 | 11.610 | Single F |
| 17 | Kit Quarteto Hits Femininos Nº 2+6+7+8 | `kit-trilogia-essencial-nº-2-nº-6-nº-10-25ml-copy` | R$ 173.226 | — | Kit F |
| 18 | Nº 20 • Brise Amalfi - 25ml | `nº-20-brise-amalfi-copia` | R$ 171.309 | 35.359 | Single M |
| 19 | Nº 10 • Belle Grasse - 100ml | `nº-10-belle-grasse-100ml` | R$ 160.911 | 9.957 | Single F |
| 20 | Kit Quarteto Hits Masculinos Nº 12+13+19+20 | `kit-trilogia-essencial-masculina-nº-12-nº-13-nº-20-25ml-copy-3` | R$ 147.288 | 15.407 | Kit M |
| 21 | Nº 5 • Douce Paris - 25ml | `nº-5-douce-paris-copy-copy` | R$ 137.844 | — | Single F |
| 22 | Nº 12 • Noble Nice - 100ml | `nº-12-noble-nice-copy-copy` | R$ 135.297 | 15.821 | Single M |
| 23 | Nº 13 • Féroce Provence - 25ml | `nº-13-feroce-provence-copy` | R$ 113.528 | 93.089 | Single M |
| 24 | Kit Trilogia Essencial Nº 2\|100ml + Nº 6+10\|25ml | `kit-trilogia-essencial-nº-2-100ml-nº-6-nº-10-25ml` | R$ 112.918 | — | Kit F |
| 25 | Nº 6 • Gracieuse Cannes - 25ml | `nº-6-gracieuse-cannes-copy-copy` | R$ 112.535 | — | Single F |
| 26 | Nº 31 • Authentic Milano - 25ml | `nº-31-authentic-milano-25ml` | R$ 104.333 | 13.986 | Single M |
| 27 | Kit Dueto Essencial Masculino Nº 13+20 | `kit-dueto-essencial-masculino-nº-13-nº-20-25ml` | R$ 104.308 | — | Kit M |
| 28 | Nº 3 • Vivante Capri - 25ml | `nº-3-vivante-capri-copy` | R$ 99.104 | — | Single U |
| 29 | Kit Trilogia Ess. Masc. Nº 20\|100ml + 12+13\|25ml | `kit-trilogia-essencial-masculina-nº-20-100ml-nº-12-nº-13-25ml` | R$ 97.858 | — | Kit M |
| 30 | Nº 10 • Belle Grasse - 25ml | `nº-10-belle-grasse-25ml` | R$ 91.365 | — | Single F |

**Composição do top 30:** 17 singles (11 números distintos: 2, 3, 5, 6, 7, 10, 12, 13, 20, 26, 27, 31) + 13 kits.
**Cobertura de receita:** R$ 9,0M dos R$ 12,1M net do período (~74%).

> ⚠️ **#12 (`no-7-sublime-versailles-copy-copy`) está com estoque 0** e é o produto com mais sessões do top 30 (77.971). Vale checar reposição — enriquecer um PDP esgotado converte pouco.

**O ganho de escala está nos 11 números distintos.** Cada número aparece em até 4 SKUs (25ml, 100ml e os kits que o contêm) → o conteúdo de fragrância é escrito **uma vez por número** e reaproveitado. Ver §3.

---

## 2. Taxonomia reaproveitável — os chips de atributo

Baseado na referência enviada (colunas OCASIÃO / DIA-NOITE / NOTAS), estendida para cobrir o catálogo real.

### 2.1 Mecanismo escolhido

Metaobjeto **`product_bullet_point`** referenciado por **`custom.product_bullet_point_metafield`** (`list.metaobject_reference`), renderizado por `snippets/jump-product-tag.liquid` como pills com cor de texto e de fundo por entrada.

```liquid
{% for tag in product.metafields.custom.product_bullet_point_metafield.value %}
  <div style="background-color: {{ tag.point_background_color }}; color: {{ tag.point_color }};">
    {{ tag.point_text }}
  </div>
{% endfor %}
```

**Por que esse e não outro:** é o único mecanismo do develop que aceita **lista de entradas reaproveitáveis com cor própria**. Uma entrada "FLORAL" é criada uma vez e referenciada por 12 produtos. `badges` não tem cor nem ordem; `tag_customizada` é pill único e só renderiza em card, não no PDP.

> 🔴 **Pré-requisito de tema:** o bloco `jump-product-tag` existe no develop com preset mas **não está no `block_order` do `templates/product.json`**. Schema e conteúdo podem ser criados agora; as pills só aparecem depois de adicionar o bloco no editor de tema (1 clique). Registrado em `docs/lescent-contexto-enriquecimento.md` §4.7.4.

### 2.2 Paleta dos chips (validada contra a paleta da marca, contraste ≥ AA)

Todas as cores saem da paleta oficial (contexto §2) ou dos tokens que o develop já usa (`#6B5B4E`, `#E6BD8A`, `#C8A96E`).

| Grupo | Fundo | Texto | Contraste | Racional |
|---|---|---|---|---|
| **Ocasião** | `#F3EDE7` | `#6B5B4E` | ~5,3:1 ✅ | Bege quente + marrom do tema — dimensão "quando usar" |
| **Dia** | `#FBF3E4` | `#8C5E3C` | ~5,6:1 ✅ | Cobre Lescent sobre creme — luz |
| **Noite** | `#1A1A1A` | `#E6BD8A` | ~10,1:1 ✅ | Preto profundo + dourado do tema — contraste dia/noite explícito |
| **Família olfativa** | `#F5F5F5` | `#1A1A1A` | ~15,9:1 ✅ | Cinza claro neutro da paleta — a informação técnica não compete com as outras |

Decisão de design: **só a dimensão dia/noite muda de cor entre si.** Ocasião e família mantêm estilo constante — coerente com o DNA "bronze quente e fundo neutro", sem virar semáforo colorido.

### 2.3 Entradas a criar (16, reaproveitáveis)

**Ocasião (4)** — literal da referência:
| Handle | `point_text` |
|---|---|
| `ocasiao-trabalho-dia-a-dia` | TRABALHO / DIA A DIA |
| `ocasiao-date-romantico` | DATE / ROMÂNTICO |
| `ocasiao-balada` | BALADA |
| `ocasiao-evento-especial` | EVENTO ESPECIAL |

**Conselho de uso — dia/noite (3)**:
| Handle | `point_text` |
|---|---|
| `uso-dia` | DIA |
| `uso-noite` | NOITE |
| `uso-dia-e-noite` | DIA E NOITE |

**Família olfativa (9)** — 4 da referência + 5 necessárias pro catálogo real:
| Handle | `point_text` | Da referência? |
|---|---|---|
| `familia-floral` | FLORAL | ✅ |
| `familia-citrico` | CÍTRICO | ✅ |
| `familia-frutado` | FRUTADO | ✅ |
| `familia-amadeirado` | AMADEIRADO | ✅ |
| `familia-aquatico` | AQUÁTICO | ➕ Nº 18, Nº 20 |
| `familia-aromatico` | AROMÁTICO | ➕ Nº 13, Nº 25, Nº 31 |
| `familia-gourmand` | GOURMAND | ➕ Nº 9, Nº 23, Nº 30 |
| `familia-almiscarado` | ALMISCARADO | ➕ Nº 22, Nº 23, Nº 27 |
| `familia-especiado` | ESPECIADO | ➕ Nº 13, Nº 27, Nº 35 |

**Regra de aplicação por produto:** 1 ocasião (máx 2) + 1 conselho de uso + 2 a 3 famílias = **4 a 6 chips**. Mais que isso polui no mobile (97% do tráfego).

### 2.4 Mapa de chips por número de fragrância

Derivado de `custom.notas_e_ess_ncias` (já preenchido na loja) + `brand-context/lescent/produtos.csv`. **Nada inventado** — as notas vêm do texto que já está publicado.

| Nº | Nome | Notas registradas na loja | Famílias | Uso | Ocasião |
|---|---|---|---|---|---|
| 2 | Délicate Londres | pera, frésia, patchouli, âmbar | FLORAL · FRUTADO | DIA | TRABALHO / DIA A DIA |
| 3 | Vivante Capri | cítricos | CÍTRICO · AROMÁTICO | DIA | TRABALHO / DIA A DIA |
| 5 | Douce Paris | floral (ref. Chloé) | FLORAL | DIA | TRABALHO / DIA A DIA |
| 6 | Gracieuse Cannes | floral oriental (ref. Coco Mademoiselle) | FLORAL · AMADEIRADO | DIA E NOITE | DATE / ROMÂNTICO |
| 7 | Sublime Versailles | floral (ref. J'adore) | FLORAL | DIA E NOITE | EVENTO ESPECIAL |
| 10 | Belle Grasse | floral (ref. Delina) | FLORAL · FRUTADO | DIA E NOITE | DATE / ROMÂNTICO |
| 12 | Noble Nice | aromático amadeirado (ref. Bleu de Chanel) | AROMÁTICO · AMADEIRADO · CÍTRICO | DIA E NOITE | TRABALHO / DIA A DIA |
| 13 | Féroce Provence | bergamota, pimenta, lavanda, gerânio, ambroxan, cedro | AROMÁTICO · ESPECIADO · AMADEIRADO | DIA E NOITE | TRABALHO / DIA A DIA |
| 20 | Brise Amalfi | aquático (ref. Acqua di Giò) | AQUÁTICO · CÍTRICO | DIA | TRABALHO / DIA A DIA |
| 26 | Élegance Vienna | lírio-do-vale, peônia, íris, rosa centifolia, baunilha, fava tonka, sândalo | FLORAL · AMADEIRADO | DIA E NOITE | DATE / ROMÂNTICO |
| 27 | Golden Dubai | açafrão, jasmim, âmbar-gris, cedro, resina de abeto, almíscar | AMADEIRADO · ALMISCARADO · ESPECIADO | NOITE | EVENTO ESPECIAL |
| 31 | Authentic Milano | bergamota da Calábria, flor de laranjeira, madeira, patchouli | CÍTRICO · AROMÁTICO · AMADEIRADO | DIA | TRABALHO / DIA A DIA |

**Números que aparecem só dentro de kits do top 30** (chips herdados na composição do kit): 9, 11, 19, 23, 25, 29, 30, 33.

### 2.5 Chips por kit

Kit recebe a **união das ocasiões** que cobre + `DIA E NOITE` + as **2–3 famílias dominantes** do conjunto. O argumento de venda do kit é justamente cobrir mais de uma situação.

| Kit | Números | Famílias | Uso | Ocasião |
|---|---|---|---|---|
| Trilogia Essencial F (2+6+10) | floral puxa tudo | FLORAL · FRUTADO · AMADEIRADO | DIA E NOITE | TRABALHO / DIA A DIA + DATE / ROMÂNTICO |
| Trilogia Essencial M (12+13+20) | aromático/aquático | AROMÁTICO · AQUÁTICO · AMADEIRADO | DIA E NOITE | TRABALHO / DIA A DIA |
| Trilogia Gold (23+25+27) | oriental/gourmand | AMADEIRADO · ALMISCARADO · GOURMAND | NOITE | EVENTO ESPECIAL + BALADA |
| Sexteto M (12+13+19+20+29+33) | repertório completo | AROMÁTICO · AMADEIRADO · AQUÁTICO | DIA E NOITE | TRABALHO / DIA A DIA + BALADA |
| Sexteto F (2+5+9+11+26+30) | repertório completo | FLORAL · FRUTADO · GOURMAND | DIA E NOITE | TRABALHO / DIA A DIA + DATE / ROMÂNTICO |
| Quarteto Hits F (2+6+7+8) | floral | FLORAL · FRUTADO | DIA E NOITE | DATE / ROMÂNTICO + EVENTO ESPECIAL |
| Quarteto Hits M (12+13+19+20) | aromático | AROMÁTICO · AMADEIRADO · AQUÁTICO | DIA E NOITE | TRABALHO / DIA A DIA |
| Dueto Essencial M (13+20) | aromático + aquático | AROMÁTICO · AQUÁTICO | DIA | TRABALHO / DIA A DIA |

---

## 3. Conteúdo por produto — o que escrever em cada metafield

### 3.1 Campos-alvo desta onda

| Metafield | Tipo | Renderiza hoje? | Escopo |
|---|---|---|---|
| `custom._v2_descri_o` | rich_text | ✅ seção `about-faq` "SOBRE O PRODUTO" | **30 SKUs** — 12 textos-base por número + 13 de kit |
| `custom.subtitulo` | single_line_text | ✅ bloco já no `block_order` | **30 SKUs** — 1 linha por SKU |
| `custom.tag_customizada` | metaobject_reference | ✅ pill no card | **30 SKUs** — reusa 5–6 entradas |
| `custom.product_bullet_point_metafield` | list.metaobject_reference | ⚠️ falta bloco no template | **30 SKUs** — reusa as 16 entradas |
| `custom.product_info_benefits` | metaobject_reference | ⚠️ falta bloco no template | **30 SKUs** — 1 entrada por número/kit |
| `custom.notas_e_ess_ncias` | multi_line | ✅ acordeão | **13 kits** (hoje vazio em todos) |
| `custom.composicao` | multi_line | ✅ acordeão | ⛔ **BLOQUEADO** — exige INCI do time, não invento |

### 3.2 Modelo de redação — `_v2_descri_o` (o bloco principal)

Estrutura fixa em 3 parágrafos curtos (2–3 linhas cada, por causa do mobile):

1. **Abertura sensorial** — o que o cheiro evoca, sem jargão. Nome do produto como protagonista.
2. **Construção olfativa** — topo → coração → fundo, reescrito a partir de `notas_e_ess_ncias`, com a referência declarada e `®️`.
3. **Encaixe na vida do cliente** — para quem é e quando usar, ecoando os chips. Fecha com convite de repertório.

**Exemplo aprovado (Nº 2 • Délicate Londres):**

> Tem cheiro de manhã limpa. O Nº 2 • Délicate Londres abre delicado e não pesa em nenhum momento do dia — é o tipo de fragrância que as pessoas percebem de perto, não do outro lado da sala.
>
> A pera fresca entra primeiro, suculenta e leve. A frésia dá o contorno floral, e o patchouli com âmbar sustentam tudo com um calor discreto no fim. Fragrância inspirada por English Pear & Freesia de Jo Malone®️.
>
> É pra quem quer sofisticação sem esforço no trabalho e no dia a dia. Se você está montando seu repertório, esse é um bom lugar pra começar.

**Checklist de redação (todo texto passa por isso):**
- ✅ Nome Lescent no primeiro parágrafo, referência de luxo só no segundo
- ✅ "inspirado por [Nome] de [Marca]®️" — nunca "igual", "idêntico", "réplica", "clone", "recriação"
- ✅ "você" · 2ª pessoa · sem "tu", sem formalidade distante
- ✅ Notas só as que já estão em `notas_e_ess_ncias` na loja
- ❌ Sem duração em horas, sem "fixação de X horas"
- ❌ Sem "exclusivo", "raro", "só para quem entende", "milagre", "transforma"
- ❌ Sem claim de saúde, pele, alergia ou efeito dermatológico
- ❌ Sem número de clientes/avaliações no corpo do PDP (está pendente de confirmação — contexto §0 item 13)

### 3.3 Modelo — `subtitulo` (1 linha, aparece sob o título no PDP)

Fórmula: `{família dominante} {sensação} · {volumetria} · {ocasião}` — máx ~60 caracteres.
Exemplos: `Floral fresco de uso diário · 25ml` · `Aromático marcante para dia e noite · 100ml` · `Três florais para montar seu repertório · 25ml`

### 3.4 Modelo — `product_info_benefits` (metaobjeto `product_benefit`)

| Campo | Conteúdo |
|---|---|
| `titulo_destacado` | "Por que o Nº X funciona" (rich_text) |
| `descricao` | 1 frase de contexto (rich_text) |
| `beneficios` | 3–4 bullets curtos — **só claims aprovados**: "Matéria-prima importada", "Excelente fixação", "Envio rápido direto do Brasil", "Satisfação garantida" |
| `cor_bullet_point` | `#8C5E3C` (Cobre Lescent) em todos — consistência |

Os 4 claims acima são os únicos universais aprovados no brandbook §7. **Não criar bullets novos sem fonte.**

### 3.5 Modelo — `tag_customizada` (pill único no card)

Entradas reaproveitáveis, não uma por produto:
| Handle | `texto` | `cor_de_fundo` | `cor_do_texto` |
|---|---|---|---|
| `tag-best-seller` | BEST-SELLER | `#8C5E3C` | `#FFFFFF` |
| `tag-kit-completo` | KIT COMPLETO | `#6B5B4E` | `#FFFFFF` |
| `tag-mais-amado` | MAIS AMADO | `#1A1A1A` | `#E6BD8A` |
| `tag-tamanho-viagem` | TAMANHO VIAGEM | `#F3EDE7` | `#6B5B4E` |
| `tag-frasco-100ml` | 100ML | `#F5F5F5` | `#1A1A1A` |

> Resolve de passagem o problema de vocabulário do `custom.badges` ("Feminino" vs "Femininos", "Best- Seller" com espaço) — a pill passa a ser a fonte controlada.

---

## 4. Imagens — o que precisa e o que não precisa

| Campo / seção | Precisa imagem? | Volume |
|---|---|---|
| `product_bullet_point_metafield` (chips) | ❌ **não** — texto + cor | 0 |
| `subtitulo` | ❌ não | 0 |
| `tag_customizada` | ❌ não | 0 |
| `product_info_benefits` | ❌ não — só `cor_bullet_point` | 0 |
| `_v2_descri_o` | ❌ não | 0 |
| `notas_e_ess_ncias` / `composicao` | ❌ não | 0 |
| seção `product-features` → `trust_icons` | ✅ sim — 1 ícone por item | **4 ícones, reaproveitados em 100% do catálogo** |
| seção `active-ingredients` → `sess_o_ativos.image` | ✅ sim — 1 por produto | 12 (por número) — **baixa prioridade** |
| seção `product-highlight` → `highlight_section.image` | ✅ sim — 1 por produto | 12 (por número) — **baixa prioridade** |
| seção `product-how-to-use` → `how_to_use.file` | ✅ vídeo ou imagem | 1 institucional reaproveitável |

**Conclusão: esta onda não depende de imagem nenhuma.** Todo o conteúdo de texto/chips/benefits roda sem PiApp.

Se quiser avançar nas seções visuais depois, o pedido mínimo é **4 ícones de confiança** (parcelamento, matéria-prima importada, frete grátis, envio nacional) — reaproveitados no catálogo inteiro, alinhados ao estilo do brandbook (fundo limpo, luz difusa, sem cenografia). Isso vira uma sessão de `piapp-image-gen` com 4 prompts, não 30.

---

## 5. Ordem de execução

| Fase | O que | Depende de |
|---|---|---|
| **0** | Persistir este plano + payloads em `conteudos/lescent/` | — |
| **1** | Criar metaobjeto `product_bullet_point` + metafield `custom.product_bullet_point_metafield` | — |
| **2** | Criar metafield `custom.subtitulo` | — |
| **3** | Criar as 16 entradas de chip (`status: ACTIVE`) + as 5 entradas de `tag_customizada` | Fase 1 |
| **4** | Escrever conteúdo dos 12 números + 13 kits em `conteudos/lescent/produtos/` | — |
| **5** | Aplicar em 5 SKUs (piloto) e conferir no preview do develop | Fases 1–4 |
| **6** | Aplicar nos 25 SKUs restantes | Fase 5 OK |
| **7** | Pedir ao dev: bloco `jump-product-tag` + bloco `jump-product-info-benefits` no template | paralelo |
| **8** | ⛔ `composicao` — aguardando INCI do time | externo |

> 🔒 **REGRA INVIOLÁVEL #0:** cada SKU tem `conteudos/lescent/produtos/[slug]/textos/*.md` + `shopify-payload.json` gravados **antes** da mutation, e `shopify-result.json` depois. Sem exceção.

---

## 6. Pendências que não bloqueiam esta onda

1. **`composicao` / INCI** — quem fornece? Sem isso o acordeão "COMPOSIÇÃO" fica vazio em vários best-sellers, inclusive Nº 13.
2. **Número de clientes** — 50.000 (home + develop) ou 100.000 (MAIN)? Não uso em copy até definir.
3. **Frete grátis** — R$109 ou R$249? Divergente entre home, collection do develop e ícone do PDP.
4. **`no-7-sublime-versailles-copy-copy` com estoque 0** — repor antes de investir no PDP mais acessado do top 30?
5. **Goshop vs. Horizon** nas seções de ingredientes/FAQ/eficácia — decisão de arquitetura (contexto §4.7.5).
