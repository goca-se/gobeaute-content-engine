# Lescent — Plano Editorial de 30 Blogs (SEO + GEO/AEO)

> **Documento de execução.** Construído em 2026-07-31 a partir de `docs/lescent-contexto-enriquecimento.md`, do manifesto PiApp da marca (v3.2), do `blog-themes.md` (45 temas aprovados) e de dados reais lidos da loja Shopify `LESCENT` / `568499-ef.myshopify.com` na mesma data.
>
> Todo preço, handle, rating e URL de imagem neste documento foi **resolvido via Shopify Admin GraphQL**, não inferido.

---

## 0. TL;DR

| Item | Valor |
|---|---|
| Posts planejados | **30** |
| Blog de destino | `gid://shopify/Blog/112857219379` (`news`) — **0 artigos hoje** |
| Status de publicação | `isPublished: false` (revisão humana antes de publicar) |
| Clusters temáticos | 6 (Fundamentos, Aplicação, Rankings, Escolha, Referências, Presentes) |
| Formato dominante | Guia de compra · Roundup · Comparativo · Guia de custo · Glossário (os 5 formatos que LLM mais cita) |
| Imagens por post | 1 capa 16:9 (**com produto real**) + 2 ilustrações 4:5 (perfumaria genérica) |
| Custo PiApp estimado | ~180 créditos · **saldo hoje: 297** ⚠️ |
| Onda piloto | 3 posts (#07, #12, #16) — validação antes da massa |

---

## 1. Premissas travadas

### 1.1 O que este plano NÃO faz
- Não toca PDP, collection, metafield ou tema. Escopo é **exclusivamente artigos do blog**.
- Não gera conteúdo pra **Linha Elixir** nem **Linha Árabe** — não existem no catálogo ativo (`contexto §6.3`). Isso invalida os temas #40–#45 do `blog-themes.md`.
- Não publica nada. Todos os 30 nascem `unpublished`.

### 1.2 Regra inviolável #0 (de `CLAUDE.md`)
Ordem obrigatória por post, sem exceção:
1. `Write` → `conteudos/lescent/blogs/<slug>/textos/article.md`
2. `Write` → `conteudos/lescent/blogs/<slug>/textos/article.json`
3. `Write` → `conteudos/lescent/blogs/<slug>/conteudo-html/article.html`
4. **Só então** `articleCreate`
5. `Write` → `conteudos/lescent/blogs/<slug>/shopify-result.json`

> A pasta `conteudos/lescent/` não existia antes desta sessão.

### 1.3 Compliance — as 6 travas absolutas
1. ✅ Sempre `inspirado por [Fragrância]®️ de [Marca]®️` — **nunca** "igual", "idêntico", "réplica", "clone", "imitação", "dupe" no corpo do texto em português.
2. ✅ Disclaimer de não-afiliação em **todo** post que citar marca de referência: *"A Lescent não é endossada nem afiliada às marcas mencionadas. A referência serve exclusivamente para contextualização olfativa."*
3. ✅ Disclaimer de fixação em todo post que fale de duração: *"A duração pode variar conforme tipo de pele, temperatura e região de aplicação."*
4. ❌ Nunca quantificar fixação em horas sem teste registrado ("dura 8h" é proibido).
5. ❌ Nunca comparar preço de forma depreciativa nem atacar luxo/massa. A postura é **alternativa**, não "anti".
6. ❌ Nunca claim terapêutico/dermatológico. Nunca "conquista garantida"/feromônio.

### 1.4 Como as marcas concorrentes entram (a pergunta central do briefing)

O pedido é "comparar diferentes marcas e citar a Lescent de forma sutil". A leitura compliant disso:

| ✅ Permitido | ❌ Proibido |
|---|---|
| Descrever casas de perfumaria como **material cultural e olfativo** (história da maison, acorde-assinatura, por que virou ícone) | Tabela "Marca X R$700 vs Lescent R$49" |
| Ranking de marcas famosas por **perfil olfativo**, tratado com respeito | Adjetivo pejorativo contra qualquer marca |
| Lescent aparecendo **1 vez no corpo** + 1 `product-cta-card`, como opção nacional na mesma família olfativa | Lescent como protagonista de post que promete ser "sobre" a marca de luxo |
| `Inspirado por X®️ de Y®️` em sub-texto | "É o X da Y" / "mesma coisa que" |

O bloco `comparison-table` **nunca** compara marcas nomeadas. Só compara **categorias** (25ml vs 100ml, EDP vs EDT, importado vs nacional vs árabe).

---

## 2. Arquitetura de SEO — 6 clusters, 1 pilar cada

Blog com 0 artigos = folha em branco. A arquitetura escolhida é **topic cluster**: cada cluster tem 1 post-pilar (guia longo, keyword de cabeça) que linka pros satélites, e cada satélite linka de volta pro pilar. Isso constrói autoridade temática — que é exatamente o que os LLMs premiam (princípio 8 do `ai-seo-playbook.md`: hiper-foco temático).

```
        ┌─────────────────── A. FUNDAMENTOS ───────────────────┐
        │  PILAR #01 Famílias olfativas: guia completo         │
        │  #02 pirâmide · #03 EDP/EDT · #04 fixação/sillage    │
        │  #05 referência olfativa · #06 R$40 vs R$700         │
        └───────────────────────┬──────────────────────────────┘
                                │
   ┌────────────────────────────┼────────────────────────────┐
   │                            │                            │
┌──┴─── B. APLICAÇÃO ───┐  ┌────┴─── C. RANKINGS ───┐  ┌─────┴─── D. ESCOLHA ────┐
│ PILAR #07 como passar │  │ PILAR #12 15 marcas    │  │ PILAR #19 método 5      │
│ #08 pontos de pulso   │  │ #13 top10 fem mundo    │  │     passos              │
│ #09 durar mais        │  │ #14 top10 masc mundo   │  │ #20 25ml vs 100ml       │
│ #10 layering          │  │ #15 marcas do Brasil   │  │ #21 trabalho            │
│ #11 como guardar      │  │ #16 top10 fem Lescent  │  │ #22 noite               │
└───────────────────────┘  │ #17 top10 masc Lescent │  │ #23 verão x inverno     │
                           │ #18 import/nac/árabe   │  │ #24 montar acervo       │
                           └────────────────────────┘  └─────────────────────────┘
   ┌─── E. REFERÊNCIAS ────┐   ┌─── F. PRESENTES ───┐
   │ #25 Jo Malone         │   │ #29 presentear     │
   │ #26 Sauvage           │   │ #30 Dia dos Pais   │
   │ #27 Baccarat R540     │   └────────────────────┘
   │ #28 Acqua di Giò      │
   └───────────────────────┘
```

### Regras de internal linking (obrigatórias por post)
- **2 links** pro pilar do próprio cluster (ou, se for o pilar, pros satélites)
- **1 link** cruzado pra outro cluster
- **1 link** pra collection real da loja (`/collections/femininos`, `/collections/masculinos`, `/collections/kits`, `/collections/fragrancias-de-25ml`…)
- Anchor text descritivo — nunca "clique aqui"

### Regras de link externo (autoridade E-E-A-T + efeito-cascata do AI SEO)
Cada post cita **2–3 fontes externas autoritativas** com `target="_blank" rel="noopener"`. Fontes válidas pra este nicho: Fragrantica (base olfativa), IFRA (regulação de matéria-prima), ANVISA/RDC de cosméticos, Statista/Euromonitor (mercado), site oficial da maison citada. **Sem fonte → sem número.**

---

## 3. Padrão de CAPA — a parte crítica do briefing

> **Requisito do cliente: capa 100% fiel ao produto real, lifestyle, com pessoa usando. Zero placeholder genérico.**
> Isto **sobrescreve** o guardrail padrão do `format-cover-image.md` (que proíbe embalagem visível). O manifesto PiApp da Lescent, aliás, exige o oposto: *"a paleta nas embalagens deve ser fiel ao bottle real — sempre preservar a embalagem original"* e lista *"foto sem o frasco visível"* como movimento criativo proibido. Os dois pedidos convergem.

### 3.1 O frasco real — DNA verificado nas fotos de catálogo

Auditado lendo as imagens reais do CDN (`No_2_Delicate_Londres.png`, `n13_….png`, `Kit_Trilogia_Essencial_….png`):

| Elemento | 25ml | 100ml |
|---|---|---|
| Corpo | Vidro transparente retangular, arestas verticais levemente arredondadas, base grossa | Idem, mais alto e mais largo |
| Tampa | **Cilíndrica, metal dourado polido**, ~1/3 da altura total | **Retangular chata, acrílico transparente**, com bomba dourada visível dentro |
| Rótulo | Quadrado, moldura fina dourada | Idem, proporcionalmente maior |
| Cor do rótulo | **Feminino: cinza-greige claro** · **Masculino: preto** | Idem |
| Tipografia do rótulo | Monograma "S" + `LESCENT` na 1ª linha; `Nº X`; primeiro nome em peso leve; **SEGUNDO NOME EM BOLD**; volume no rodapé — tudo em **dourado** | Idem |
| Detalhe interno | Tubo de sucção visível através do vidro | Idem |

### 3.2 Como a fidelidade é garantida tecnicamente

1. **Reference image obrigatória**: toda chamada `generate_image` da capa passa `reference_image_urls: [<URL do packshot real no CDN Shopify>]`. A URL do CDN é pública — não precisa de `upload_reference`.
2. **Prompt com trava de preservação**: cada prompt de capa termina com o bloco literal:
   > `The perfume bottle must be reproduced EXACTLY as in the reference image — identical rectangular clear glass flacon, identical polished gold cylindrical cap, identical square label with thin gold keyline, identical gold "S LESCENT" monogram and "Nº XX / NAME" gold lettering, identical proportions. Do not redesign, restyle, recolor or relabel the bottle. Do not invent any other product.`
3. **Negative literal**: `NEGATIVE: no invented perfume bottle, no generic stock perfume, no altered label, no fantasy packaging, no visible brand logo other than the real Lescent label, no text overlay, no watermark, no plastic-retouched skin, no white clinical background.`
4. **Verificação visual humana-no-loop**: cada capa é baixada e **inspecionada** antes do upload pro Shopify. Rótulo ilegível, número errado, tampa errada ou frasco inventado = **regerar** (até 3x). Se falhar 3x → post sobe sem capa com flag `⚠️ cover pendente`, nunca com placeholder.

### 3.3 Os 3 arquétipos de capa (todos 16:9, negative space pra overlay de título)

| # | Arquétipo | Quando usar | Cena |
|---|---|---|---|
| **A** | **Gesto** | Posts de aplicação/fixação (cluster B) | Close/médio de pessoa real aplicando no pulso ou pescoço, frasco real nítido em primeiro plano, rosto parcial ou fora de quadro |
| **B** | **Rotina** | Fundamentos, escolha, referências (A, D, E) | Pessoa real na cômoda/banheiro/escritório/saindo de casa; frasco real em primeiro plano nítido, pessoa em segundo plano com foco suave |
| **C** | **Coleção na mão** | Rankings e presentes (C, F) | Pessoa escolhendo entre 3–6 frascos reais alinhados; mão pegando um deles |

### 3.4 Casting e mundo estético (do manifesto Lescent v3.2)

- **Idade 28–45.** Adulto, nunca 20-something. Diversidade real brasileira.
- **Expressão:** confiante quieta, meio sorriso, olhar lateral. ❌ *"modelo segurando perfume sorrindo pra câmera"* é clichê explicitamente banido.
- **Pele:** textura real, poros visíveis. ❌ retoque plástico.
- **Mundo estético emerge da fragrância** — nunca sorteado:
  - **Soft Domestic** (`#F4ECE0` ivory / linho / madeira clara / luz de janela) → florais quietos, cítricos, frescos. Ex.: Nº 2, Nº 6, Nº 20.
  - **Bloom Maximalist** (`#F3D9D3` blush / cetim rosa / luz difusa quente) → florais vibrantes, gourmand rosado. Ex.: Nº 10, Nº 30, Nº 26.
  - **Warm Souk** (`#0C0C0E` onyx / `#B89968` âmbar / spot dramático) → orientais, amadeirados, especiarias. Ex.: Nº 27, Nº 13, Nº 23.
  - ⛔ Nunca cruzar Soft com Warm no mesmo frame.
- ⛔ Proibido: fundo branco chapado, modelo de banco de imagem, pétalas voando, glitter, cenário de balada, cinematografia estilo campanha Dior.

### 3.5 Ilustrações internas (2 por post, 4:5, `standard`)
Perfumaria genérica é permitida aqui — **sem frasco Lescent inventado**. Temas seguros: matéria-prima olfativa (bergamota cortada, fava de baunilha, pau de cedro, resina âmbar, peônia), macro de pele/pulso sem produto, cômoda/vanity vazia com luz, textura de vidro e névoa. **Se aparecer um frasco na ilustração, ele tem que ser abstrato/sem rótulo** — nunca um Lescent falso.

---

## 4. Padrão editorial por post

### 4.1 Esqueleto fixo (aplica o `ai-seo-playbook.md` + `seo-playbook.md`)

```
[Lead — 2-3 frases, engata sem responder]
🔹 direct-answer            ← resposta extraível pela IA (2-4 frases, sem produto)
[H2 #1 em forma de pergunta] → resposta direta na 1ª frase
🔹 highlight-dark           ← insight central
[H2 #2 em forma de pergunta]
[ilustração 1]
🔹 benefit-grid (4 ou 6)
[H2 #3]
🔹 pill-list "Isso é pra você se…"   ← persona-fit, obrigatório (AI SEO)
[H2 #4]
[ilustração 2]
🔹 callout-soft (disclaimer de contratipo e/ou fixação)
🔹 product-cta-card         ← handle real, imagem/preço reais do Shopify
[H2 #5]
🔹 comparison-table (só quando comparar CATEGORIAS)
🔹 faq-block (4-6 Q&As, 40-80 palavras, autocontidas)
[Conclusão]
🔹 product-cta-card #2      ← kit ou collection
+ JSON-LD BlogPosting + FAQPage
```

### 4.2 Metas quantitativas
| Métrica | Alvo |
|---|---|
| Palavras | 1.100–1.600 (pilares: 1.800–2.200) |
| H2 em formato de pergunta | ≥ 50% |
| Blocos ricos | ≥ 6 |
| `product-cta-card` | 2 (meio + fim) |
| Fontes externas citadas | 2–3 |
| Links internos | 4 |
| Parágrafos | máx. 3–4 linhas (**97% do tráfego é mobile**) |
| Tabelas | máx. 3 colunas + `overflow-x:auto` |

### 4.3 Paleta do HTML (real da Lescent, não o fallback rosa do reference)
O `format-html-export.md` traz `#c97a8c` (rosa) como fallback pra Lescent — **está errado**. A paleta real, extraída do `templates/product.json` da loja:

```css
--brand-primary:      #8C5E3C;  /* cobre institucional */
--brand-primary-soft: #F3EDE6;  /* cobre lavado (callout) */
--brand-dark:         #1C1C1C;  /* preto profundo (highlight) */
--brand-dark-accent:  #C79A6B;  /* cobre claro sobre preto */
--brand-text:         #1C1C1C;
--brand-muted:        #6B6B6B;
--brand-bg-soft:      #F3F3F3;  /* cinza claro das seções alternadas */
```

### 4.4 Handle do blog — ✅ RESOLVIDO
Renomeado de `news` para **`guias`** em 2026-07-31 (`blogUpdate` em `gid://shopify/Blog/112857219379`, título passou a "Guias Lescent"). Feito com 0 artigos publicados, portanto sem quebra de URL.

URLs finais: `https://www.lescent.com.br/blogs/guias/<slug>`

---

## 5. Os 30 posts

Legenda: **Fmt** = formato AI-preferido (`G`uia de compra · `R`oundup · `C`omparativo · `$`guia de custo · `X`glossário).
Todos os handles e preços abaixo foram resolvidos no Shopify em 2026-07-31.

### Cluster A — Fundamentos de perfumaria (6)

| # | Título | Slug | Keyword-foco | Fmt | Âncora de capa (frasco real) | CTA principal |
|---|---|---|---|---|---|---|
| 01 | **Famílias olfativas: o guia completo para entender qualquer perfume** ⭐PILAR | `familias-olfativas-guia-completo` | famílias olfativas perfume | X | Kit Trilogia Essencial 2+6+10 (arquétipo C) | `kit-nº-2-nº-6-nº-10-25ml` |
| 02 | **Pirâmide olfativa: o que são notas de topo, coração e fundo** | `piramide-olfativa-notas-topo-coracao-fundo` | pirâmide olfativa notas perfume | X | Nº 2 25ml · Soft (B) | `nº-2-delicate-londres-copy` |
| 03 | **Eau de Parfum, Eau de Toilette e Parfum: qual a diferença real?** | `eau-de-parfum-eau-de-toilette-diferenca` | eau de parfum diferença | C | Nº 13 25ml · Warm (B) | `nº-13-feroce-provence-copy` |
| 04 | **Fixação, projeção e sillage: o que cada palavra significa** | `fixacao-projecao-sillage-perfume` | fixação perfume o que é | X | Nº 27 25ml · Warm (A) | `nº-27-golden-dubai-25-ml` |
| 05 | **O que é referência olfativa — e por que não é cópia** | `referencia-olfativa-o-que-e` | referência olfativa o que é | X | Nº 6 25ml · Soft (B) | `nº-6-gracieuse-cannes-copy-copy` |
| 06 | **Perfume barato é ruim? O que muda entre R$40 e R$700 em 2026** | `perfume-barato-e-ruim-o-que-muda-preco` | perfume barato é bom | $ | Nº 31 25ml · Warm (B) | `nº-31-authentic-milano-25ml` |

### Cluster B — Aplicação e uso (5)

| # | Título | Slug | Keyword-foco | Fmt | Âncora de capa | CTA principal |
|---|---|---|---|---|---|---|
| 07 | **Qual a melhor forma de passar perfume? O guia definitivo de aplicação** ⭐PILAR ⭐PILOTO | `melhor-forma-de-passar-perfume` | como passar perfume | G | Nº 2 25ml · Soft (A — pulso) | `nº-2-delicate-londres-copy` |
| 08 | **Onde aplicar perfume: os 7 pontos de pulso que funcionam** | `onde-aplicar-perfume-pontos-de-pulso` | onde passar perfume no corpo | R | Nº 10 25ml · Bloom (A — pescoço) | `nº-10-belle-grasse-25ml` |
| 09 | **Como fazer o perfume durar mais na pele: 9 técnicas** | `como-fazer-perfume-durar-mais` | como fazer perfume durar mais | R | Nº 13 100ml · Warm (A) | `nº-13-feroce-provence-copy-copy` |
| 10 | **Layering olfativo: como combinar dois perfumes sem errar** | `layering-olfativo-combinar-perfumes` | layering perfume como combinar | G | Kit Trilogia Masc 12+13+20 (C) | `kit-trilogia-essencial-masculina-nº-12-nº-13-nº-20-25ml` |
| 11 | **Como guardar perfume: 6 erros que estragam a fragrância** | `como-guardar-perfume-erros` | como guardar perfume | R | Nº 26 25ml · Bloom (B — cômoda) | `nº-26-elegance-vienna-25-ml` |

### Cluster C — Rankings e panorama de marcas (7)

> Cluster que atende diretamente ao pedido "comparar diferentes marcas". Tratamento editorial: **enciclopédico e respeitoso**, casa por casa, com perfil olfativo. Lescent entra 1x no corpo + 1 card.

| # | Título | Slug | Keyword-foco | Fmt | Âncora de capa | CTA principal |
|---|---|---|---|---|---|---|
| 12 | **As 15 marcas de perfume mais famosas do mundo (e o perfil olfativo de cada uma)** ⭐PILAR ⭐PILOTO | `marcas-de-perfume-mais-famosas-do-mundo` | melhores marcas de perfume | R | Kit Sexteto Feminino (C) | `kit-sexteto-feminino-nº-1-nº-5-nº-9-nº-11-nº-26-nº-30-25ml` |
| 13 | **Top 10 perfumes femininos mais vendidos do mundo em 2026** | `perfumes-femininos-mais-vendidos-do-mundo` | perfume feminino mais vendido do mundo | R | Nº 6 25ml · Soft (C) | `/collections/femininos` |
| 14 | **Top 10 perfumes masculinos mais vendidos do mundo em 2026** | `perfumes-masculinos-mais-vendidos-do-mundo` | perfume masculino mais vendido do mundo | R | Nº 13 25ml · Warm (C) | `/collections/masculinos` |
| 15 | **As melhores marcas de perfume do Brasil: panorama do mercado nacional** | `melhores-marcas-de-perfume-do-brasil` | melhores marcas de perfume nacional | R | Nº 30 25ml · Bloom (B) | `nº-30-provocateur-rio-25ml` |
| 16 | **Top 10 perfumes femininos mais amados da Lescent** ⭐PILOTO | `perfumes-femininos-mais-amados-lescent` | perfume feminino Lescent | R | Kit Sexteto Feminino (C) | `kit-nº-2-nº-6-nº-10-25ml` |
| 17 | **Top 10 perfumes masculinos mais amados da Lescent** | `perfumes-masculinos-mais-amados-lescent` | perfume masculino Lescent | R | Kit Sexteto Masculino (C) | `kit-trilogia-essencial-masculina-nº-12-nº-13-nº-20-25ml` |
| 18 | **Perfume importado, nacional ou árabe: qual escolher?** | `perfume-importado-nacional-ou-arabe` | perfume importado x nacional | C | Nº 27 25ml · Warm (B) | `nº-27-golden-dubai-25-ml` |

> **#16 e #17 usam ratings Judge.me reais** lidos da loja (ex.: Nº 30 = 4,73/26 · Nº 26 = 4,66/44 · Nº 10 = 4,54/65 · Nº 23 = 4,45/31 · Nº 31 = 4,49/37). Nenhuma nota inventada.
> **#13, #14 e #15** só listam produtos de terceiros descritos por perfil olfativo — sem preço, sem link, sem juízo de valor. Fonte obrigatória citada.

### Cluster D — Guias de escolha (6)

| # | Título | Slug | Keyword-foco | Fmt | Âncora de capa | CTA principal |
|---|---|---|---|---|---|---|
| 19 | **Como escolher o perfume ideal: método em 5 passos** ⭐PILAR | `como-escolher-o-perfume-ideal` | como escolher perfume | G | Kit Trilogia Essencial (C) | `kit-nº-2-nº-6-nº-10-25ml` |
| 20 | **25ml ou 100ml: qual tamanho de perfume compensa mais?** | `25ml-ou-100ml-qual-perfume-compensa` | 25ml ou 100ml perfume | $ | Nº 2 25ml + 100ml lado a lado (B) | `nº-2-delicate-londres` |
| 21 | **Perfume para o trabalho: ser lembrado sem incomodar** | `perfume-para-o-trabalho` | perfume para trabalho | G | Nº 12 25ml · Soft (B — escritório) | `nº-12-noble-nice-copy` |
| 22 | **Perfume para a noite: quando a intensidade faz sentido** | `perfume-para-a-noite` | perfume para noite | G | Nº 23 25ml · Warm (B) | `nº-23-legacy-lisboa-25ml` |
| 23 | **Perfume no verão x no inverno: por que o mesmo cheiro muda** | `perfume-verao-x-inverno` | perfume verão inverno | C | Nº 20 25ml · Soft (B) | `nº-20-brise-amalfi-copia` |
| 24 | **Como montar seu acervo de perfumes começando do zero** | `como-montar-acervo-de-perfumes` | como montar coleção de perfumes | G | Kit Sexteto Masculino (C) | `kit-sexteto-masculino-nº-12-nº-13-nº-14-nº-20-nº-27-nº-33-25ml` |

### Cluster E — Referências e grandes casas (4)

> Formato: história da maison → o acorde que a tornou icônica → como a família olfativa dela funciona → onde encontrar essa assinatura no catálogo nacional. Disclaimer de não-afiliação obrigatório.

| # | Título | Slug | Keyword-foco | Fmt | Âncora de capa | CTA principal |
|---|---|---|---|---|---|---|
| 25 | **Jo Malone e o universo English Pear & Freesia** | `jo-malone-english-pear-freesia` | english pear freesia jo malone | X | Nº 2 25ml · Soft (B) | `nº-2-delicate-londres-copy` |
| 26 | **Sauvage, da Dior: por que virou o masculino mais vendido do mundo** | `sauvage-dior-referencia-olfativa` | sauvage dior perfume | X | Nº 13 25ml · Warm (B) | `nº-13-feroce-provence-copy` |
| 27 | **Baccarat Rouge 540: por que virou obsessão global** | `baccarat-rouge-540-referencia-olfativa` | baccarat rouge 540 | X | Nº 27 25ml · Warm (B) | `nº-27-golden-dubai-25-ml` |
| 28 | **Acqua di Giò e a eterna família aquática** | `acqua-di-gio-familia-aquatica` | acqua di gio perfume aquático | X | Nº 20 25ml · Soft (B) | `nº-20-brise-amalfi-copia` |

### Cluster F — Presentes (2)

| # | Título | Slug | Keyword-foco | Fmt | Âncora de capa | CTA principal |
|---|---|---|---|---|---|---|
| 29 | **Como presentear com perfume sem errar: guia por perfil** | `como-presentear-com-perfume` | presente perfume como escolher | G | Kit Trilogia Gold (C) | `kit-trilogia-gold-n-23-n-25-n-27-25ml` |
| 30 | **Dia dos Pais 2026: os perfumes masculinos que acertam** 🗓️ | `dia-dos-pais-2026-perfumes-masculinos` | presente dia dos pais perfume | R | Kit Sexteto Masculino (C) | `kit-trilogia-essencial-masculina-nº-12-nº-13-nº-20-25ml` |

> **#30 é sazonal** — Dia dos Pais 2026 é 09/ago. Precisa sair primeiro na onda de massa e é o único candidato a publicação imediata.

---

## 6. Catálogo de âncoras — dados reais resolvidos (2026-07-31)

| Produto | Handle | Preço | De | Judge.me | Rótulo |
|---|---|---|---|---|---|
| Kit Trilogia Essencial 2+6+10 25ml | `kit-nº-2-nº-6-nº-10-25ml` | R$ 89,90 | R$ 169,90 | 4,22 (650) | greige |
| Kit Trilogia Masculina 12+13+20 25ml | `kit-trilogia-essencial-masculina-nº-12-nº-13-nº-20-25ml` | R$ 89,90 | R$ 169,90 | 3,90 (960) | preto |
| Kit Trilogia Gold 23+25+27 25ml | `kit-trilogia-gold-n-23-n-25-n-27-25ml` | R$ 89,90 | R$ 329,90 | 4,12 (68) | preto |
| Kit Sexteto Feminino | `kit-sexteto-feminino-nº-1-nº-5-nº-9-nº-11-nº-26-nº-30-25ml` | R$ 169,99 | R$ 659,90 | 4,52 (23) | greige |
| Kit Sexteto Masculino | `kit-sexteto-masculino-nº-12-nº-13-nº-14-nº-20-nº-27-nº-33-25ml` | R$ 169,99 | R$ 599,90 | 3,74 (46) | preto |
| Nº 2 Délicate Londres 25ml | `nº-2-delicate-londres-copy` | R$ 49,90 | R$ 69,00 | 3,74 (228) | greige |
| Nº 2 Délicate Londres 100ml | `nº-2-delicate-londres` | R$ 89,90 | R$ 119,00 | 4,21 (85) | greige |
| Nº 6 Gracieuse Cannes 25ml | `nº-6-gracieuse-cannes-copy-copy` | R$ 49,90 | R$ 69,00 | 4,33 (75) | greige |
| Nº 10 Belle Grasse 25ml | `nº-10-belle-grasse-25ml` | R$ 49,90 | R$ 69,00 | 4,54 (65) | greige |
| Nº 12 Noble Nice 25ml | `nº-12-noble-nice-copy` | R$ 49,90 | R$ 69,00 | 3,97 (29) | preto |
| Nº 13 Féroce Provence 25ml | `nº-13-feroce-provence-copy` | R$ 44,90 | R$ 69,00 | 3,99 (73) | preto |
| Nº 13 Féroce Provence 100ml | `nº-13-feroce-provence-copy-copy` | R$ 99,90 | R$ 119,00 | 4,40 (58) | preto |
| Nº 20 Brise Amalfi 25ml | `nº-20-brise-amalfi-copia` | R$ 44,90 | R$ 69,00 | 4,11 (79) | preto |
| Nº 23 Legacy Lisboa 25ml | `nº-23-legacy-lisboa-25ml` | R$ 49,90 | R$ 69,00 | 4,45 (31) | preto |
| Nº 26 Élegance Vienna 25ml | `nº-26-elegance-vienna-25-ml` | R$ 49,90 | R$ 69,00 | 4,66 (44) | greige |
| Nº 27 Golden Dubai 25ml | `nº-27-golden-dubai-25-ml` | R$ 39,90 | R$ 69,00 | 3,68 (113) | preto |
| Nº 28 Icon Copenhague 25ml | `no-28-icon-copenhague-25-ml` | R$ 54,90 | R$ 69,00 | 4,24 (38) | greige |
| Nº 29 Royal Nottingham 25ml | `nº-29-royal-nottingham-25ml` | R$ 39,90 | R$ 69,00 | 3,91 (46) | preto |
| Nº 30 Provocateur Rio 25ml | `nº-30-provocateur-rio-25ml` | R$ 39,90 | R$ 69,00 | 4,73 (26) | greige |
| Nº 31 Authentic Milano 25ml | `nº-31-authentic-milano-25ml` | R$ 39,90 | R$ 69,00 | 4,49 (37) | preto |

> ⚠️ **Revalidar handles no início de cada onda.** A loja duplica produtos com frequência (`-copy`, `-copia`, `-copy-copy`). Nunca montar URL a partir do título.

---

## 7. Execução em ondas

| Onda | Posts | Objetivo | Créditos PiApp | Status |
|---|---|---|---|---|
| **Piloto** | #07, #12, #16 | Validar: fidelidade da capa · tom em post de marcas · uso de rating real | ~18 | ✅ **CONCLUÍDA 2026-07-31** |
| **Onda 1** | #30 (sazonal), #01, #19, #20, #06, #13, #14 | Pilares + sazonal + cabeça de cauda | ~32 | ⏳ aguardando validação |
| **Onda 2** | #02–#05, #08–#11, #17, #18 | Fundamentos + aplicação completos | ~45 | ⏳ |
| **Onda 3** | #15, #21–#29 | Escolha + referências + presentes | ~45 | ⏳ |

Piloto cobriu um post de **cada arquétipo de risco**: how-to puro (capa arquétipo A, gesto), panorama de marcas (o tema mais sensível em compliance), e ranking próprio com dado real (Judge.me).

### 7.1 Resultado do piloto (2026-07-31)

| # | Slug | Article GID | Status | Capa — verificação de fidelidade |
|---|---|---|---|---|
| 07 | `melhor-forma-de-passar-perfume` | `gid://shopify/Article/617539600691` | `unpublished` | ✅ PASS — Nº 2 25ml: frasco, tampa dourada cilíndrica e rótulo `S LESCENT / Nº 2 / DÉLICATE / LONDRES / 25ml` corretos e legíveis |
| 12 | `marcas-de-perfume-mais-famosas-do-mundo` | `gid://shopify/Article/617539633459` | `unpublished` | ✅ PASS — Nº 2 100ml: tampa acrílica retangular com bomba dourada visível (correta, não trocada por dourada) + rótulo `100ml` |
| 16 | `perfumes-femininos-mais-amados-lescent` | `gid://shopify/Article/617539666227` | `unpublished` | ✅ PASS — 3 frascos com os 3 rótulos corretos: `Nº 2 DÉLICATE LONDRES`, `Nº 6 GRACIEUSE CANNES`, `Nº 10 BELLE GRASSE` |

**Taxa de retry de capa no piloto: 0/3.** A técnica de `reference_image_urls` apontando para o packshot real do CDN Shopify, combinada com o bloco de trava de preservação no prompt (§3.2), reproduziu o frasco e o texto do rótulo corretamente na primeira tentativa nas três capas. O modelo auto-selecionado pelo PiApp foi `wavespeed-gpt-image-2-edit`.

→ **Consequência para o orçamento de imagem:** com 0% de retry medido, os 27 restantes devem custar ~81 créditos de capa + ~41 de ilustração ≈ **122 créditos**, contra 279 disponíveis. Folga confortável.

### 7.1b Estado da Onda 1 (2026-07-31)

**Imagens: 100% prontas.** As 14 imagens da onda (7 capas + 7 ilustrações) foram geradas, verificadas visualmente, salvas em `conteudos/lescent/blogs/<slug>/imagens/generated/` e subidas para o CDN da Shopify. As pastas dos 7 posts já existem.

| # | Slug | Capa (fidelidade) | Ilustração | Conteúdo + publicação |
|---|---|---|---|---|
| 30 | `dia-dos-pais-2026-perfumes-masculinos` | ✅ PASS — 6 rótulos do sexteto masculino corretos e na ordem | ✅ | ✅ **`gid://shopify/Article/617543205171`** |
| 01 | `familias-olfativas-guia-completo` | ⚠️ PASS com ressalva — `ÉLÉGANCE` com acento extra (real: `ÉLEGANCE`); nº, tampa, cor e layout corretos | ✅ | ⏳ pendente |
| 19 | `como-escolher-o-perfume-ideal` | ✅ PASS (2ª geração) — `GRACIEUSE` sem acento, corrigido | ✅ | ⏳ pendente |
| 20 | `25ml-ou-100ml-qual-perfume-compensa` | ✅ PASS — 25ml com tampa dourada e 100ml com tampa acrílica transparente, ambos corretos no mesmo frame | ✅ | ⏳ pendente |
| 06 | `perfume-barato-e-ruim-o-que-muda-preco` | ✅ PASS — Nº 31 rótulo preto correto | ✅ | ⏳ pendente |
| 13 | `perfumes-femininos-mais-vendidos-do-mundo` | ✅ PASS — Nº 10 Belle Grasse correto | ✅ | ⏳ pendente |
| 14 | `perfumes-masculinos-mais-vendidos-do-mundo` | ✅ PASS — Nº 13 Féroce Provence rótulo preto correto | ✅ | ⏳ pendente |

**Taxa de retry acumulada de capa: 2 em 10** (ambas por acento extra no nome francês do rótulo — ver §7.3). Créditos PiApp consumidos até aqui: ~45 dos 297.

### 7.3 Achado: o modelo "afrancesa" acentos no rótulo

Nas capas de `Nº 6` e `Nº 26` o modelo escreveu `GRACIÈUSE` e `ÉLÉGANCE` — acentos que **não existem** no rótulo real (`GRACIEUSE`, `ÉLEGANCE`). Geometria, tampa, cor do rótulo e número saíram corretos; só a acentuação foi inventada.

**Mitigação que funcionou** (validada em `Nº 6`): adicionar ao prompt um bloco de spelling literal, linha por linha, com negativa explícita da grafia errada:

```
LABEL TEXT — SPELL EXACTLY, character for character:
line 1 'S LESCENT', line 2 'Nº 6', line 3 'GRACIEUSE', line 4 'CANNES', line 5 '25ml'.
The word is 'GRACIEUSE' with NO accent on any letter — plain G-R-A-C-I-E-U-S-E.
Do NOT write 'GRACIÈUSE'. Do NOT write 'GRACIÉUSE'.
```

→ **Aplicar esse bloco preventivamente em toda capa cujo nome de fragrância tenha acento ou possa receber um**: Nº 2 Délicate, Nº 6 Gracieuse, Nº 13 Féroce, Nº 26 Élegance, Nº 22 Mystique, Nº 24 Essence. Economiza a segunda geração.

### 7.2 🔴 Gargalo real do batch: `articleCreate` via MCP

O custo dominante da massa **não é crédito de imagem — é o payload**. Cada post exige colar ~30–36 KB de HTML inline na mutation `articleCreate`, porque o MCP da Shopify não aceita referência a arquivo. Nos 3 pilotos isso consumiu ~100 KB. Para os 27 restantes seriam ~900 KB.

**Solução (mesma da Barbour's, ver memória `barbours-blog-pipeline-custo-mcp`):** criar um Custom App na loja LESCENT com escopo `write_content` e gravar o token em `.env` (o repo tem `.env.example`, mas **não existe `.env`**). Com o token local, o pipeline vira:

```bash
curl -s -X POST "https://568499-ef.myshopify.com/admin/api/2025-07/graphql.json" \
  -H "X-Shopify-Access-Token: $SHOPIFY_LESCENT_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @payload.json
```

com o `payload.json` montado por script a partir de `conteudo-html/article.html` — **zero HTML passando pelo modelo**. Reduz o custo da onda de massa em cerca de 30x e ainda garante que o que sobe é byte-idêntico ao arquivo local (reforçando a regra #0).

---

## 8. Riscos e decisões pendentes

| # | Item | Estado |
|---|---|---|
| 1 | **Créditos PiApp** — eram 297; piloto consumiu ~18. Com retry medido em 0%, os 27 restantes cabem em ~122. | ✅ Resolvido — escopo definido em 1 ilustração/post |
| 2 | **Handle do blog** | ✅ Resolvido — renomeado para `guias` em 2026-07-31 |
| 3 | **Fidelidade de rótulo em IA generativa** | ✅ Validado — 3/3 capas corretas na 1ª tentativa via reference image + trava de prompt (§3.2). Verificação visual continua obrigatória por capa. |
| 3b | **Custo de `articleCreate` via MCP** — ~30 KB inline por post, ~900 KB para os 27 restantes | 🔴 **Novo bloqueador de throughput** — resolver com token local (§7.2) |
| 3c | **Interlinking de cluster** — os posts se linkam entre si, mas 27 dos 30 ainda não existem. Os 3 pilotos linkam só para collections reais. | 🟠 Passada final de interlinking depois dos 30 |
| 4 | Número oficial de clientes (50.000 na home vs 100.000 no PDP) | 🟠 Não usar em copy até confirmar |
| 5 | Frete grátis: R$109 (home) vs R$249 (ícone PDP) | 🟠 Não usar em copy até confirmar |
| 6 | Linha Elixir / Árabe inexistentes | 🔴 Temas #40–#45 bloqueados |
| 7 | Menções a "+4.382 avaliações" | 🟠 Confirmar antes de usar |

---

📝 **Criado:** 2026-07-31 · **Dados da loja:** LESCENT, lidos em 2026-07-31
📝 **Revalidar antes de cada onda:** handles, status ACTIVE, preços, saldo PiApp
