# SEO Playbook — Blog Posts Gobeaute

> **Source of truth de SEO técnico pra todos os blog posts das marcas Gobeaute.** Toda skill que gera conteúdo de blog (single, batch, retroativo) deve seguir os 20 pontos abaixo. Validação obrigatória antes de publicar.

---

## 🏗️ 1. Estrutura HTML & Hierarquia

### 1.1 Apenas um `<h1>` por página
- O H1 deve conter o **título do artigo** + a **keyword principal**
- O H1 vem do field `article.title` no Shopify — o tema renderiza, o body **não deve duplicar** o H1
- ⚠️ Se o body precisar de H1 (raro), validar que o tema não está duplicando

### 1.2 Hierarquia lógica H1 → H2 → H3 → H4
- **Nunca pular níveis** (não vá de H2 direto pra H4)
- H2 = seções principais | H3 = subseções | H4 = detalhes
- Use headings pra **escaneabilidade**, não estilização. Tag `<h2>` SEMPRE é `<h2>`, mesmo que estilizado inline pra forçar tamanho contra o tema

### 1.3 HTML semântico
- `<article>` envolve o post inteiro
- `<section>` pra blocos com heading próprio
- `<aside>` pra blocos complementares (product cards, callouts, highlights)
- `<figure>` + `<figcaption>` pra mídia
- `<nav>` se houver índice / TOC
- `<header>` / `<footer>` se aplicável

---

## 🏷️ 2. Meta Tags

### 2.1 Title Tag
- **50-65 caracteres**
- Keyword principal **no início**
- Pode incluir marca ao final: `[Título do Post] | Ápice`
- Controlado via `article.title` no Shopify (o tema concatena `| Brand` automaticamente em alguns casos — validar)

### 2.2 Meta Description
- **140-160 caracteres**
- Estrutura: **[CTA implícito] + [keyword] + [benefício concreto]**
- Não afeta ranking direto, mas impacta CTR (que impacta ranking)
- Vai no `article.summary` no Shopify

### 2.3 Canonical (rel="canonical")
- Shopify auto-gera `<link rel="canonical">` apontando pra URL principal
- Crítico em Shopify pra evitar duplicação por `?variant=`, filtros, paginação
- Validar via View Source da página publicada

### 2.4 Open Graph + Twitter Cards
- `og:title`, `og:description`, `og:image`, `og:url`, `og:type="article"` — Shopify gera automaticamente a partir de title + summary + image
- `twitter:card="summary_large_image"`, `twitter:title`, `twitter:description`, `twitter:image` — Shopify gera
- Garantir `article.image` setado: vira `og:image` e `twitter:image`

---

## 🖼️ 3. Imagens

### 3.1 Alt text descritivo em todas as imagens
- Descreva o que tá na imagem + contexto + keyword natural (sem stuffing)
- Imagens decorativas: `alt=""`
- Exemplo bom: `alt="Mulher brasileira com cachos 3B sorrindo aplicando creme de pentear Ápice"` 
- Exemplo ruim: `alt="cabelo"`

### 3.2 Otimização de imagens
- ✅ Formatos modernos: WebP ou AVIF preferido (Shopify converte por padrão)
- ✅ `loading="lazy"` em imagens dentro do body (Shopify aplica)
- ✅ `loading="eager"` na capa (LCP)
- ✅ Atributos `width` + `height` declarados em **todas as imagens** (evita CLS)
- ✅ Filenames descritivos: `mascara-cachos-hidratante-apice.png`, não `IMG_2847.png`
- ✅ Cover image gerada pelo PiApp já vai em 16:9 (1920x1080)
- ✅ Product images: usar `featuredImage.url` direto do Shopify Admin GraphQL (CDN otimizado)

---

## 🤖 4. Indexação & Crawling

### 4.1 Robots meta tag
- Posts públicos: `<meta name="robots" content="index, follow">` — Shopify default
- Páginas de tag/autor com pouco conteúdo: opcional `noindex` (decisão estratégica)

### 4.2 Sitemap XML
- Shopify gera automaticamente em `/sitemap.xml` (raiz da loja)
- **Submeter no Google Search Console**
- Verificar se posts novos aparecem em até 24h da publicação

### 4.3 robots.txt
- Bloqueie áreas administrativas e checkout
- **Não bloqueie `/blogs/`** nem recursos CSS/JS (afeta renderização)

---

## 🔗 5. Links & Estrutura de URL

### 5.1 URLs limpas e descritivas
- ✅ `/blogs/novidades/como-fazer-umectacao-cabelo`
- ❌ `/blogs/news/post-2847?id=xyz`
- Use hífens, lowercase, sem acentos ou caracteres especiais
- Slug ≤ 60 caracteres
- Slug contém a keyword principal

### 5.2 Internal linking estratégico
- Cada post linka pelo menos **3 produtos** + **1 collection** da marca (anchor text descritivo)
- Quando relevante, linkar pra outro post do blog (transfere autoridade entre posts relacionados, aumenta tempo de sessão)
- Anchor text descritivo: ✅ "Shampoo Cachos Nutritivo" | ❌ "clique aqui"

### 5.3 External links
- Fontes autoritativas (estudos científicos, INCI, ANVISA): `rel="noopener"` se `target="_blank"`
- Links afiliados/pagos: `rel="sponsored"`
- Quando não quiser passar autoridade: `rel="nofollow"`

---

## 📊 6. Schema & Dados Estruturados

### 6.1 Schema Markup JSON-LD (obrigatório)

Cada post **deve** ter `<script type="application/ld+json">` no final do body com `BlogPosting`:

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "[título do post — mesma string do article.title]",
  "description": "[summary do post]",
  "image": ["[URL absoluta da cover image, CDN Shopify]"],
  "datePublished": "[ISO 8601 — data de publicação]",
  "dateModified": "[ISO 8601 — última atualização]",
  "author": {
    "@type": "Organization",
    "name": "[Nome da Marca, ex: Ápice Cosméticos]",
    "url": "https://www.[marca].com.br"
  },
  "publisher": {
    "@type": "Organization",
    "name": "[Nome da Marca]",
    "logo": {
      "@type": "ImageObject",
      "url": "[URL do logo da marca]"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://www.[marca].com.br/blogs/[blog-handle]/[article-handle]"
  }
}
```

### 6.2 BreadcrumbList (recomendado)
Quando aplicável, adicionar:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type":"ListItem","position":1,"name":"Home","item":"https://..."},
    {"@type":"ListItem","position":2,"name":"Blog","item":"https://.../blogs/..."},
    {"@type":"ListItem","position":3,"name":"[Título]","item":"https://.../blogs/.../[handle]"}
  ]
}
```

### 6.3 Product schema (quando o post menciona produtos específicos)
Para posts product-heavy, anexar `Product` schema com `aggregateRating` se houver reviews.

### 6.4 Validação
Validar em [search.google.com/test/rich-results](https://search.google.com/test/rich-results) antes de publicar (mínimo: 1 post por marca por trimestre).

---

## ⚡ 7. Performance & Core Web Vitals

### 7.1 Targets
- **LCP** < 2.5s (Largest Contentful Paint)
- **INP** < 200ms (Interaction to Next Paint — substituiu o FID em 2024)
- **CLS** < 0.1 (Cumulative Layout Shift)

### 7.2 Práticas obrigatórias no body do post
- ✅ `width` + `height` explícitos em **todas as imagens** (evita CLS)
- ✅ Cover image com `loading="eager"` (LCP)
- ✅ Imagens inline do body com `loading="lazy"`
- ✅ Sem JavaScript bloqueante injetado no body
- ✅ Inline styles ok pra forçar tipografia contra tema, mas evitar abusar (parsing custo)

### 7.3 Cover image constraint desktop
Tema Shopify renderiza cover full-width que fica grande demais em telas >992px. Injetar no `<style>` do topo do body:

```css
@media (min-width: 992px) {
  .article-template__hero img,
  .article__hero img,
  .article__hero-image img,
  main article > header img,
  article > img:first-child,
  .article-image,
  .blog-article-image,
  .article__featured-image {
    max-width: 900px !important;
    margin-left: auto !important;
    margin-right: auto !important;
    display: block !important;
    border-radius: 8px;
  }
}
```

### 7.4 Mobile-first
- Google indexa mobile primeiro
- Fonte body mínimo **18px** desktop, 16px mobile mínimo
- Tap targets mínimo **48px** (CTAs, links em listas)
- Testar responsividade no Chrome DevTools antes de publicar

---

## ✍️ 8. Conteúdo (E-E-A-T)

### 8.1 Profundidade
- **Mínimo 1.200 palavras** pra posts informacionais competitivos
- E-E-A-T: Experience, Expertise, Authoritativeness, Trustworthiness
- Linguagem técnica acessível (explicar pH, INCI sem alienar leitor)
- Citar estudos quando aplicável (Active Shine Amazon, K-OIL Blend, etc.)

### 8.2 Autor
- Assinar com **autor real** ou Organization
- Schema `author` Organization aceitável pra começar; ideal evoluir pra `Person` com bio em página separada
- Field `author` no Shopify article = `{"name":"Equipe Ápice"}` por default

### 8.3 Freshness
- Google valoriza posts atualizados
- Atualizar `dateModified` no JSON-LD ao revisar posts antigos
- Revisitar posts top-trafego a cada 6 meses

### 8.4 Keyword research + intenção de busca
- Identificar tipo de query: **informacional**, **navegacional**, **comercial**, **transacional**
- Keyword principal no:
  - H1 (article.title)
  - Primeiros 100 caracteres do lead
  - URL (slug)
  - Meta description
  - 2-3x no body (natural, não forçar)
- Usar **variações semânticas e LSI** — não force a keyword exata 50 vezes
- Brand context (`brand-context/[marca]/blog-themes.md`) deve listar keywords aprovadas

---

## 🎯 9. CTAs (priorização visual + UX)

### 9.1 Hierarquia de CTAs
- **Inline product card** (mid-body): produto integrado ao narrativo. Background suave, button-style com bg colorido
- **Soft CTA inline** (final de seção): "→ Conheça o [Produto]" em prosa
- **Product gallery** (antes da conclusão): grid de 3-5 produtos com imagem
- **Mega CTA final**: botão grande centralizado pra collection ou linha completa

### 9.2 Estilo dos CTAs (inline para garantir contra theme override)
```html
<!-- Soft inline CTA -->
<a href="..." style="color:#688D65;font-weight:700;text-decoration:underline;font-size:1.05rem">Texto âncora descritivo →</a>

<!-- Button-style inline product card CTA -->
<a href="..." style="display:inline-block;background:#688D65;color:#fff;padding:.7rem 1.2rem;border-radius:6px;font-size:1rem;font-weight:700;text-decoration:none">Ver produto →</a>

<!-- Mega CTA final -->
<a href="..." style="display:inline-block;background:#688D65;color:#fff;padding:1rem 2rem;border-radius:8px;font-size:1.15rem;font-weight:700;text-decoration:none;letter-spacing:.02em">Explorar a Linha [X] →</a>
```

### 9.3 Tap targets
- Mínimo 48px de altura efetiva em mobile (já garantido com padding ≥0.7rem)

---

## ✅ 10. Validation Checklist (por post, antes de publicar)

Estrutura:
- [ ] 1 único `<h1>` (vem do article.title)
- [ ] Hierarquia H1→H2→H3 sem pular
- [ ] Tags semânticas (`<article>`, `<section>`, `<aside>`, `<figure>`)

Meta:
- [ ] Title 50-65 chars, keyword no início
- [ ] Summary 140-160 chars, CTA + keyword + benefício
- [ ] article.image setada (lifestyle, não produto recortado)
- [ ] Slug kebab-case, lowercase, ≤60 chars, com keyword

Imagens:
- [ ] Alt text descritivo em TODAS imagens (keyword natural)
- [ ] width + height declarados
- [ ] `loading="lazy"` em imagens inline do body

Schema:
- [ ] `<script type="application/ld+json">` com `BlogPosting` no final do body
- [ ] Headline, description, image, datePublished, author, publisher, mainEntityOfPage
- [ ] Validado em rich-results test

Performance:
- [ ] `@media (min-width:992px)` constraint na cover (≤900px desktop)
- [ ] Body font ≥18px desktop, 16px mobile
- [ ] CTAs com font-size ≥1rem, tap target ≥48px

Conteúdo:
- [ ] ≥1.200 palavras
- [ ] Keyword principal: H1 + primeiro parágrafo + 2-3x no body (natural)
- [ ] ≥3 produtos linkados + 1 collection
- [ ] ≥3 blocos ricos (product card, highlight, callout, etc.)
- [ ] Disclaimer ANVISA quando tema toca saúde

Links:
- [ ] Anchor text descritivo (nada "clique aqui")
- [ ] External links com `rel="noopener"` se `target="_blank"`

---

## 🛠️ Como validar tudo isso (ferramentas)

| Ferramenta | Pra que |
|---|---|
| **Google Rich Results Test** | Valida JSON-LD `BlogPosting` |
| **Google Search Console** | Monitora impressions/CTR por post, identifica oportunidades |
| **PageSpeed Insights / Lighthouse** | Core Web Vitals (LCP, INP, CLS) |
| **Screaming Frog** | Crawl completo do blog: headings duplicados, alt texts faltando, broken links |
| **Shopify CLI + Claude Code** | Audita templates `article.liquid` e `main-article.liquid` |
| **Mobile Friendly Test** | Validates mobile usability |

---

## 🚨 Guardrails (não-negociável)

- ❌ Mais de um `<h1>` na página
- ❌ Pular níveis de heading (H2 → H4)
- ❌ Imagens sem alt
- ❌ Imagens sem width/height (causa CLS)
- ❌ Cover image com produto recortado em fundo branco
- ❌ Cover full-width no desktop sem constraint
- ❌ Posts < 1000 palavras pra temas competitivos
- ❌ Keyword stuffing
- ❌ Body font < 16px
- ❌ Tap target < 48px
- ❌ Sem JSON-LD `BlogPosting`
- ❌ External link sem `rel="noopener"` em target=\_blank
- ❌ Inline links com "clique aqui" / "saiba mais" (anchor genérico)
- ❌ Slug com acento, espaço ou maiúscula
