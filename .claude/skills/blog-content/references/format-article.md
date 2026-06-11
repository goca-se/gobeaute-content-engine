# Estrutura do Artigo

Padrão editorial pra blog Gobeaute. Funciona em todas as marcas (ajustando tom).

> 🚨 **SEO técnico:** este arquivo cobre estrutura editorial. Pra checklist SEO completo (estrutura HTML, headings, schema markup, performance/CWV, alt text, links, conteúdo E-E-A-T), ver **[`seo-playbook.md`](./seo-playbook.md)** — é mandatório seguir antes de publicar.
>
> 🤖 **AI SEO (blogs novos):** todo blog NOVO segue também o **[`ai-seo-playbook.md`](./ai-seo-playbook.md)** — H2s em formato de pergunta (≥50%), bloco `direct-answer` após o lead, `faq-block` + `FAQPage` JSON-LD antes da conclusão, fontes citadas, linguagem factual. NÃO aplicar retroativamente em blogs já publicados sem pedido explícito.

> 🚨 **Princípio editorial #1 — Lead-first, sempre.**
> O blog é uma peça **editorial**, não um catálogo. Primeira coisa visível ao leitor é **texto** (H1 + lead engatando o problema). NUNCA: imagem, CTA-box, lista de produtos, galeria, banner. O leitor precisa **se reconhecer no problema** antes de ver qualquer produto.
>
> **Padrão de referência**: blogs Sallve, Glossier, Granado — abrem com pergunta retórica, contexto pessoal ou insight inesperado. Produtos aparecem **integrados ao narrative** (mid-body como solução para o problema discutido), nunca em "atalho rápido" no topo.
>
> **Cover image**: imagem **lifestyle institucional** (mulher real, cena de uso, ambiente da marca). NUNCA imagem com embalagem de produto recortada em fundo branco — isso é foto de catálogo, não de capa editorial.

## Inputs

- ✅ Brand do bundle
- ✅ Tema validado contra `blog-themes.md`
- ✅ Word count target (default 600-900)
- ✅ Persona-alvo (perguntar se não claro)
- ✅ Keyword-foco SEO (perguntar se não dada)
- ✅ CTA final (perguntar se não claro)

---

## 📐 Estrutura padrão (5 blocos)

### 1. Título (H1)

- 50-65 caracteres ideal (pra SEO)
- Inclui keyword-foco naturalmente
- Tom da marca
- Promete valor concreto

✅ "Como cuidar de cachos no verão sem ressecar"
❌ "Dicas de cabelo"

**Padrões úteis**:
- "Como [fazer X] sem [problema comum]"
- "[N] dicas pra [resultado] em [contexto]"
- "Guia completo: [tema]"
- "[Pergunta da persona]?"
- "Por que [insight inesperado]"

**🤖 AI SEO (blogs novos)**: preferir títulos nos 5 formatos que a IA mais cita — guia de compra ("Como escolher..."), guia de custo ("Quanto custa... em 2026"), roundup ("Top 5..."), comparativo de categorias, glossário. Derivar o título do **prompt research** (a pergunta que o usuário faria a uma IA). Ver `ai-seo-playbook.md`.

### 2. Lead (1 parágrafo, 50-80 palavras)

- Engata o leitor em 2-3 frases
- Reforça o problema/contexto
- Promete o que o artigo entrega
- Inclui keyword-foco no primeiro parágrafo

**🤖 AI SEO (blogs novos)**: logo após o lead, inserir bloco `direct-answer` (2-4 frases factuais que respondem a pergunta central do artigo por completo, sem produto/CTA). É o trecho que AI Overviews e LLMs extraem. Schema em `format-rich-blocks.md` (7️⃣).

### 3. Body (4-6 seções com H2/H3) + blocos ricos

Cada seção:
- H2 descritivo, sem clickbait
- **150-250 palavras** (não menos — blog editorial é denso, não bullet-point seco)
- 1 ideia central por seção
- Bullets/listas SÓ quando agregam — não trocar prosa por bulletismo
- Posicionar ilustrações entre seções (uma a cada 2-3 seções)

**🤖 AI SEO (blogs novos) — estrutura FAQ nos subheadings**:
- **≥ 50% dos H2 em formato de pergunta** ("Por que os cachos ressecam no verão?" em vez de "Ressecamento no verão"), sem forçar onde ficar artificial
- Abaixo de cada H2-pergunta, a **primeira frase responde direto** (1-2 frases factuais e autocontidas), depois desenvolve
- Linguagem simples e factual (padrão Wikipedia): especificar concentrações, frequências, tempos, tipos de cabelo/pele. A voz da marca vive nos exemplos e no ritmo — os fatos, em frases declarativas
- **2-3 dados concretos com fonte citada** por artigo (link externo autoritativo) — artigos que citam fontes têm +30% de chance de serem citados pela IA

**🚨 Princípio editorial #2 — Contexto antes de produto.**

A **primeira metade do artigo** (até 50% do word count) é **EDUCACIONAL puro**: explicar o problema, a ciência, o porquê. Sem links de produto, sem CTAs hard-sell. O leitor precisa **confiar na profundidade** antes de receber recomendação comercial.

Produtos aparecem **a partir da metade do artigo**, **integrados ao narrative** — ex: "Pra quem está começando, o [Produto X](url) traz o ativo Y com a concentração que estudos indicam ideal..." e não "🛒 Atalho rápido — compre agora".

**Estrutura preferida (não rígida)**:
1. Lead engatando o problema (sem produto)
2. `direct-answer` — resposta extraível pela IA (blogs novos)
3. H2: O que é / por que acontece (educacional puro, com data/science)
4. H2: Quem sofre mais (persona fit, ainda sem produto)
5. H2: Como resolver (entra o primeiro produto, inline no texto)
6. H2: Ingredientes / mecanismo (mais ciência, mais 1-2 produtos inline)
7. H2: Rotina prática (menciona produtos no contexto da ação)
8. Galeria final ("Os produtos deste guia") — opcional, ao FIM
9. `faq-block`: H2 "Perguntas frequentes sobre [tema]" com 4-6 Q&As autocontidas (blogs novos) + `FAQPage` JSON-LD
10. Conclusão + CTA soft inline

**🚨 Obrigatório — blocos ricos**: o body **DEVE** intercalar seções com pelo menos **3-4 blocos ricos** (ver `format-rich-blocks.md`):

- 1+ `product-cta-card` (CTA com imagem do produto, eyebrow, preço) — **sempre mid-body ou fim**, nunca topo
- 1-2 `highlight-dark` (insight central em fundo escuro)
- 0-1 `benefit-grid` (4 ou 6 cards com emoji + título + descrição)
- 0-1 `pill-list` (persona-fit "isso é pra você se…")
- 1+ `callout-soft` (disclaimer ANVISA quando tema toca saúde)
- 0-1 `comparison-table` (diferencial vs. concorrentes sem nomear)
- 0-1 `product-gallery` (grid de 3-5 produtos com imagens reais Shopify CDN) — **AO FIM, antes da conclusão**
- 1 `direct-answer` (após o lead) — **obrigatório em blogs novos** (AI SEO)
- 1 `faq-block` (antes da conclusão, com `FAQPage` JSON-LD) — **obrigatório em blogs novos** (AI SEO)
- `pill-list` passa a ser **obrigatório em blogs novos** (casos de uso explícitos = long-tail pra IA)

Regra: alternar **parágrafo de seção → bloco rico → parágrafo de seção → bloco rico**.

**Padrões de organização**:

**Padrão "Problema → Solução"** (educativo)
- O que é [tema]
- Por que [problema acontece]
- Como [resolver]
- Quais ativos/ingredientes ajudam
- Rotina prática

**Padrão "Lista numerada"** (5-7 dicas)
- 1. Dica 1
- 2. Dica 2
- ...
- Conclusão

**Padrão "Storytelling"** (mais inspiracional)
- Contexto/cena
- Insight/aprendizado
- Como aplicar

### 4. Conclusão (1 parágrafo, 50-80 palavras)

- Recapitula a promessa entregue
- Reforça o tom da marca
- Conecta com o CTA

### 5. CTA contextual

Sempre referenciar produto/linha real da marca. **Validar contra `produtos.csv`/`collections.csv`.**

Padrões:
- "Quer começar? Conheça o [produto] →"
- "Toda a rotina em um lugar: explore a Linha [nome] →"
- "Receba conteúdos como esse no email →" (se newsletter ativa)

---

## 📝 Tom por marca (resumo, brandbook tem o detalhado)

| Marca | Tom no blog |
|---|---|
| **Ápice** | Técnico-caloroso, empoderador, explicativo |
| **Barbour's** | Direto, prático, sem floreio |
| **Rituária** | Acolhedor, ritualístico, sensorial |
| **Lescent** | Amigável, didático, descomplicado |
| **Kokeshi** | Delicado, sensorial, sofisticado |
| **By Samia** | Aspiracional, premium, sofisticado |
| **Auá** | Natural, brasileiro, ancestral |

---

## 📝 Exemplo de estrutura (Ápice — Cachos no verão)

```markdown
# Como cuidar de cachos no verão sem ressecar

[LEAD]
Sol forte, mar, piscina e calor não precisam ser inimigos dos seus cachos. Com a rotina certa,
dá pra aproveitar o verão mantendo definição, hidratação e fios saudáveis. Neste guia, reunimos
o que importa pra você passar a estação com os cachos no ponto — desde a escolha dos ativos até
gestos práticos do dia a dia.

## Por que os cachos sofrem mais no verão

[100-180 palavras explicando: ressecamento, raios UV, cloro/sal, falta de proteção térmica]

## Hidratação é a base — e não é só uma vez por semana

[Hidratação contínua. Pode mencionar máscaras + leave-ins]

[ILUSTRAÇÃO 1 — close de cachos hidratados com brilho natural]

## Proteção térmica e solar

[Filtros, leave-in com proteção UV, chapéu, etc]

## Pós-mar e pós-piscina: o ritual rápido

[Enxágue, máscara express, condicionador leave-in]

[ILUSTRAÇÃO 2 — mãos aplicando produto no cabelo]

## Os ingredientes que fazem diferença

[Murumuru, manteigas vegetais, óleos leves, pantenol]

[ILUSTRAÇÃO 3 — still life de ingredientes]

## Rotina mínima de 3 passos pra adotar agora

1. Shampoo suave 2-3x na semana
2. Condicionador + máscara semanal
3. Leave-in com proteção térmica antes do sol/calor

## Conclusão

Cuidar dos cachos no verão é mais sobre constância do que esforço. Com poucos gestos certos,
você passa a estação com fios definidos, brilhantes e saudáveis. E o melhor: sem abrir mão
de aproveitar o sol.

---

**[CTA] Comece pela base: conheça a Linha Cachos Ápice →**
```

---

## 🎯 SEO + Performance Checklist (obrigatório por blog)

### Estrutura HTML semântica
- ✅ **1 único `<h1>`** na página (título do post, com keyword principal)
- ✅ Hierarquia lógica `<h1>` → `<h2>` → `<h3>` (nunca pular níveis)
- ✅ Headings com **tags semânticas reais** (não usar `<div>` com font grande pra simular heading — Google não lê)
- ✅ Wrapper em `<article>`, seções principais em `<section>`, blocos auxiliares em `<aside>`
- ✅ Inline styles SÃO permitidos pra forçar tipografia (Shopify themes geralmente sobrescrevem `<style>` global), mas a tag continua sendo `<h2>`, não `<div>` estilizado

### Meta tags (controladas via Shopify article fields)
- ✅ `title`: 50-65 caracteres, keyword no início, formato "Título do post"
- ✅ `summary`: 140-160 caracteres, CTA claro + keyword + benefício
- ✅ Canonical: Shopify auto-gera
- ✅ Open Graph: Shopify auto-gera a partir de title + summary + image
- ✅ Cover image (article.image): **lifestyle institucional**, NUNCA produto recortado

### Imagens
- ✅ `alt=""` descritivo em todas as imagens (keyword natural + contexto)
- ✅ `loading="lazy"` (Shopify aplica por padrão em imagens dentro do body)
- ✅ Cover image com `width`/`height` declarados quando possível (evita CLS)
- ✅ Filenames descritivos: `mascara-cachos-hidratante-apice.png`, não `IMG_2847.png`

### Schema markup (JSON-LD)
- ✅ **OBRIGATÓRIO**: incluir `<script type="application/ld+json">` no final do body com `BlogPosting` schema:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "[título]",
    "description": "[summary]",
    "image": ["[cover_url]"],
    "datePublished": "[ISO date]",
    "author": {"@type":"Organization","name":"Ápice Cosméticos","url":"https://www.apicecosmeticos.com.br"},
    "publisher": {"@type":"Organization","name":"Ápice Cosméticos","logo":{"@type":"ImageObject","url":"[logo_url]"}},
    "mainEntityOfPage":{"@type":"WebPage","@id":"https://www.apicecosmeticos.com.br/blogs/[blog]/[handle]"}
  }
  ```

### Performance / Core Web Vitals
- ✅ **Cover image constraint no desktop**: o template do tema renderiza cover full-width que fica grande demais em telas >992px. Injetar no `<style>` do topo do body:
  ```css
  @media (min-width: 992px) {
    .article-template__hero img,
    .article__hero img,
    .article__hero-image img,
    main article > header img,
    article > img:first-child {
      max-width: 900px !important;
      margin-left: auto !important;
      margin-right: auto !important;
      display: block !important;
      border-radius: 8px;
    }
  }
  ```
- ✅ Body font 18px (legibilidade)
- ✅ CTAs com `font-size: 1.15rem` + button-style (background + padding)
- ✅ Tap targets mínimo 48px (links e botões)

### Internal linking
- ✅ Cada post linka pelo menos **3 produtos** + **1 collection** da marca (anchor text descritivo)
- ✅ Quando relevante, linkar pra outro post do blog (transfere autoridade)
- ✅ External links com `rel="noopener"` se `target="_blank"`
- ✅ External para fontes científicas: `rel="nofollow"` opcional

### Word count / E-E-A-T
- ✅ Mínimo 1.200 palavras pra posts informacionais competitivos
- ✅ Tom de marca consistente (referenciar brandbook)
- ✅ Disclaimer ANVISA quando tema toca saúde
- ✅ Atualizar `dateModified` ao revisar posts antigos

---

## 🚨 Guardrails

- ❌ **Cover image com produto recortado em fundo branco** — sempre lifestyle (modelo, cena, ambiente)
- ❌ **Imagem (qualquer) como primeira coisa visível** — H1 + lead vem antes
- ❌ **"Atalho rápido / Produtos que resolvem" no topo** — abre com problema, não com loja
- ❌ **Galeria de produtos antes de 50% do word count** — gallery vai ao fim
- ❌ **Links de produto no primeiro parágrafo** — só após contexto educacional
- ❌ Mais de 6 ou menos de 4 seções H2
- ❌ Parágrafos > 200 palavras (quebrar)
- ❌ Mais de 1 ideia por seção
- ❌ Citar % ou estatística sem `[VALIDAR: fonte]`
- ❌ Recomendar produtos inexistentes
- ❌ Tom inconsistente entre seções
- ❌ **Word count < 1000 palavras pra blog principal** — editorial pede densidade
- ✅ Keyword-foco no H1 + primeiro parágrafo + 1-2x no body (natural)
- ✅ CTA com produto/linha REAL **integrado inline ao body**
- ✅ Validar compliance ANVISA em CADA seção
- ✅ Cover lifestyle institucional (modelo real, ambiente brand-aligned, sem produtos com label visível)
- ✅ Primeiros 2-3 parágrafos = puro contexto/storytelling/educacional
- ✅ Produtos aparecem mid-body em diante, **integrados ao texto narrativo**
- ✅ Galeria de produtos (se usar) **só após 60-70% do conteúdo**

---

## 📁 Output

```
conteudos/[marca]/blogs/[slug]/textos/
├── article.md
└── article.json
```

### JSON (article.json)

O `body` é um **array ordenado** que mistura `section` (texto comum) com blocos ricos (`product-cta-card`, `highlight-dark`, `benefit-grid`, `pill-list`, `callout-soft`, `comparison-table`). Schema de cada bloco em `format-rich-blocks.md`.

```json
{
  "type": "blog-article",
  "brand": "apice",
  "blog_handle": "cuidados-com-cachos-no-verao",
  "value": {
    "title": "Como cuidar de cachos no verão sem ressecar",
    "lead": "Sol forte, mar, piscina e calor...",
    "body": [
      {
        "type": "section",
        "h2": "Por que os cachos sofrem mais no verão",
        "content": "..."
      },
      {
        "type": "highlight-dark",
        "props": {
          "eyebrow_emoji": "☀️",
          "eyebrow_text": "POR QUE O VERÃO ESTRESSA OS CACHOS",
          "headline": "Não é o sol — é o conjunto de UV + cloro + sal",
          "body": "..."
        }
      },
      {
        "type": "section",
        "h2": "Hidratação é a base",
        "content": "...",
        "illustration_after": "illustration-01"
      },
      {
        "type": "benefit-grid",
        "props": {
          "heading": "O que cada gesto entrega",
          "intro": "...",
          "columns": 3,
          "items": [ /* 6 cards */ ]
        }
      },
      {
        "type": "section",
        "h2": "Os ingredientes que fazem diferença",
        "content": "...",
        "illustration_after": "illustration-02"
      },
      {
        "type": "callout-soft",
        "props": {
          "variant": "info",
          "emoji": "💡",
          "label": "Dica",
          "body": "..."
        }
      },
      {
        "type": "product-cta-card",
        "props": {
          "image": "imagens/generated/product-card.png",
          "image_alt": "...",
          "eyebrow": "ÁPICE · CACHOS",
          "title": "Máscara Cachos Definidos",
          "description": "...",
          "price_current": "R$ 79,90",
          "cta_label": "Conhecer a Máscara",
          "cta_url": "/products/mascara-cachos-definidos",
          "trust_line": "🔒 Garantia de 30 dias"
        }
      }
    ],
    "conclusion": "...",
    "cta": {
      "label": "Conheça a Linha Cachos Ápice",
      "url": "/collections/linha-cachos",
      "context": "linha-cachos"
    },
    "word_count": 820,
    "reading_time_min": 4,
    "keyword_focus": "cachos no verão",
    "rich_blocks_count": 4
  },
  "seo": {
    "...": "ver format-seo-meta.md"
  }
}
```

## ✅ Checklist

- [ ] H1 com keyword + 50-65 caracteres?
- [ ] Lead engata + tem keyword?
- [ ] 4-6 seções H2 bem distribuídas?
- [ ] Tom da marca consistente?
- [ ] Conclusão recapitula?
- [ ] CTA com produto/linha real?
- [ ] Compliance ANVISA em todas as seções?
- [ ] Ilustrações posicionadas?
- [ ] [Blogs novos] Checklist AI SEO completo (`ai-seo-playbook.md`): ≥50% H2-pergunta, `direct-answer`, `faq-block` + `FAQPage`, fontes citadas, `pill-list`?
