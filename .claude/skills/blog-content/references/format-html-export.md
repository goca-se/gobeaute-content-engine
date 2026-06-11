# HTML Export — Shopify Blog Ready

HTML semântico + rico pronto pra colar no editor de blog do Shopify OU import via API. Inclui `<style>` block escopo pra que os **blocos ricos** (`format-rich-blocks.md`) renderizem mesmo em themes que não tenham CSS pra eles.

> 🚨 **SEO checklist completo (20 pontos) em [`seo-playbook.md`](./seo-playbook.md)** — alt text, schema JSON-LD, CWV, cover constraint media query, etc. Este arquivo cobre apenas a estrutura HTML + CSS escopo.

## 🎯 Boilerplate mínimo (com SEO baseline)

Todo HTML exportado **deve** começar com este boilerplate:

```html
<!-- 1. Cover image desktop constraint (resolve cover gigante no desktop, mantém mobile fluido) -->
<style>
@media (min-width:992px){
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
</style>

<!-- 2. Wrapper com tipografia base 18px + max-width -->
<div style="max-width:740px;margin:0 auto;font-family:Georgia,serif;color:#1a1a1a;line-height:1.75;font-size:18px">

  <!-- 3. Body editorial (lead → seções H2 → blocos ricos → galeria → CTA) -->
  ...

</div>

<!-- 4. JSON-LD BlogPosting (sempre no final do body) -->
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BlogPosting","headline":"...","description":"...","image":["..."],"datePublished":"...","dateModified":"...","author":{"@type":"Organization","name":"...","url":"..."},"publisher":{"@type":"Organization","name":"..."},"mainEntityOfPage":{"@type":"WebPage","@id":"..."}}
</script>
```

## Inputs

- ✅ `article.json` já gerado (estrutura completa, com `body` em array de blocos)
- ✅ Imagens já geradas (paths relativos)
- ✅ Schema.org JSON-LD gerado

---

## 📐 Estrutura geral

```html
<style>/* CSS escopo dos blocos ricos — ver bloco completo abaixo */</style>

<article class="blog-post">

  <figure class="blog-post__cover">
    <img src="imagens/generated/cover.png"
         alt="[ALT_TEXT da capa]"
         loading="eager"
         width="1920" height="1080" />
  </figure>

  <p class="blog-post__lead">[Lead]</p>

  <!-- BODY: emitido em ordem a partir de article.value.body[] -->
  <!-- Cada item vira <section> (se type=section) ou um bloco rico -->

  <section class="blog-post__conclusion">
    <h2>Conclusão</h2>
    <p>[Conclusão]</p>
  </section>

</article>

<script type="application/ld+json">[schema.json]</script>
```

---

## 🔄 Renderizador — mapping de `body[]` para HTML

Cada item de `body[]` no `article.json` é renderizado conforme seu `type`:

| `type` | Tag HTML raiz |
|---|---|
| `section` | `<section class="blog-post__section">` |
| `product-cta-card` | `<aside class="rb rb-product-card">` |
| `highlight-dark` | `<aside class="rb rb-highlight-dark">` |
| `benefit-grid` | `<section class="rb rb-benefit-grid">` |
| `pill-list` | `<section class="rb rb-pill-list">` |
| `callout-soft` | `<aside class="rb rb-callout-soft">` |
| `comparison-table` | `<section class="rb rb-comparison">` |
| `direct-answer` | `<section class="rb rb-direct-answer">` |
| `faq-block` | `<section class="rb rb-faq">` |

Para os HTMLs detalhados de cada bloco rico, ver `format-rich-blocks.md`.

### Seção comum (`type: section`)

```html
<section class="blog-post__section">
  <h2>[h2]</h2>
  <p>[content — pode ser multi-paragraph, splittar por \n\n]</p>

  <!-- se illustration_after presente -->
  <figure class="blog-post__illustration">
    <img src="imagens/generated/illustration-XX.png"
         alt="[ALT]"
         loading="lazy" width="800" height="1000" />
  </figure>
</section>
```

---

## 🎨 `<style>` block escopo (incluir SEMPRE no topo do HTML)

O `<style>` usa CSS variables com fallback para cores neutras. **Antes de emitir o HTML**, substituir as variables `--brand-*` com os valores do brandbook da marca atual.

```html
<style>
  /* CSS variables — DEFAULT (substituir conforme marca) */
  .blog-post {
    --brand-primary: #2f6850;      /* verde mineral (Rituária default) */
    --brand-primary-soft: #e6f0ea; /* fundo de callout */
    --brand-dark: #0f1614;         /* fundo do highlight escuro */
    --brand-dark-accent: #5fc0a0;  /* texto eyebrow no highlight */
    --brand-text: #1a1a1a;
    --brand-muted: #6b6b6b;
    --brand-bg-soft: #faf7f1;      /* fundo geral suave */
    --brand-warn: #b54848;         /* X do comparison */
    --brand-warn-soft: #fbe7e7;
    --rb-radius: 16px;
    --rb-radius-sm: 999px;
  }

  /* TIPOGRAFIA do blog */
  .blog-post { color: var(--brand-text); line-height: 1.65; }
  .blog-post h2 { font-family: Georgia, "Times New Roman", serif; font-size: 1.75rem; margin: 2rem 0 0.75rem; }
  .blog-post h3 { font-family: Georgia, "Times New Roman", serif; font-size: 1.3rem; margin: 1.25rem 0 0.5rem; }
  .blog-post p { margin: 0.75rem 0; }
  .blog-post__lead { font-size: 1.15rem; color: var(--brand-muted); font-style: italic; margin: 1rem 0 2rem; }
  .blog-post__cover img,
  .blog-post__illustration img { max-width: 100%; height: auto; border-radius: var(--rb-radius); }

  /* ============ RICH BLOCKS ============ */
  .rb { margin: 2rem 0; }

  /* 1. PRODUCT CTA CARD */
  .rb-product-card { display: flex; gap: 1.5rem; padding: 1.5rem; border: 1px solid #e8e3d8; border-radius: var(--rb-radius); background: #fff; align-items: center; }
  .rb-product-card__media { flex: 0 0 30%; max-width: 220px; margin: 0; }
  .rb-product-card__media img { width: 100%; height: auto; border-radius: 12px; }
  .rb-product-card__body { flex: 1; }
  .rb-product-card__eyebrow { font-size: 0.75rem; letter-spacing: 0.08em; color: var(--brand-primary); font-weight: 700; margin: 0 0 0.5rem; }
  .rb-product-card__title { font-family: Georgia, serif; font-size: 1.6rem; margin: 0 0 0.5rem; color: var(--brand-text); }
  .rb-product-card__desc { color: var(--brand-muted); margin: 0 0 1rem; font-size: 0.95rem; }
  .rb-product-card__price { display: flex; gap: 0.75rem; align-items: center; margin: 0 0 1rem; flex-wrap: wrap; }
  .rb-product-card__price-current { font-size: 1.5rem; font-weight: 700; color: var(--brand-text); }
  .rb-product-card__price-original { text-decoration: line-through; color: var(--brand-muted); font-size: 1rem; }
  .rb-product-card__price-badge { background: #fde8c4; color: #8a5a00; font-size: 0.8rem; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: var(--rb-radius-sm); }
  .rb-product-card__cta { display: block; background: var(--brand-primary); color: #fff !important; text-align: center; padding: 1rem 1.5rem; border-radius: var(--rb-radius-sm); text-decoration: none; font-weight: 600; margin: 0 0 0.75rem; transition: opacity 0.2s; }
  .rb-product-card__cta:hover { opacity: 0.9; }
  .rb-product-card__trust { font-size: 0.85rem; color: var(--brand-muted); text-align: center; margin: 0; }
  @media (max-width: 600px) {
    .rb-product-card { flex-direction: column; text-align: center; }
    .rb-product-card__media { max-width: 160px; }
    .rb-product-card__price { justify-content: center; }
  }

  /* 2. HIGHLIGHT DARK */
  .rb-highlight-dark { background: var(--brand-dark); color: #f5f5f5; padding: 2rem; border-radius: var(--rb-radius); }
  .rb-highlight-dark__eyebrow { font-size: 0.75rem; letter-spacing: 0.08em; font-weight: 700; color: var(--brand-dark-accent); margin: 0 0 0.75rem; }
  .rb-highlight-dark__emoji { margin-right: 0.4rem; }
  .rb-highlight-dark__headline { font-family: Georgia, serif; font-size: 1.5rem; color: #fff; margin: 0 0 0.75rem; line-height: 1.3; }
  .rb-highlight-dark__body { color: #d8d8d8; margin: 0; font-size: 0.98rem; }

  /* 3. BENEFIT GRID */
  .rb-benefit-grid__heading { font-family: Georgia, serif; font-size: 1.6rem; margin: 0 0 0.5rem; }
  .rb-benefit-grid__intro { color: var(--brand-muted); margin: 0 0 1.5rem; }
  .rb-benefit-grid__items { display: grid; gap: 1rem; }
  .rb-benefit-grid__items[data-cols="2"] { grid-template-columns: repeat(2, 1fr); }
  .rb-benefit-grid__items[data-cols="3"] { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 700px) {
    .rb-benefit-grid__items[data-cols="2"],
    .rb-benefit-grid__items[data-cols="3"] { grid-template-columns: 1fr; }
  }
  .rb-benefit-grid__item { border: 1px solid #ece6d8; border-radius: var(--rb-radius); padding: 1.25rem; background: #fff; }
  .rb-benefit-grid__emoji { font-size: 2rem; display: block; margin: 0 0 0.5rem; }
  .rb-benefit-grid__title { font-size: 1.05rem; margin: 0 0 0.5rem; color: var(--brand-text); font-family: Georgia, serif; }
  .rb-benefit-grid__desc { font-size: 0.9rem; color: var(--brand-muted); margin: 0; line-height: 1.5; }

  /* 4. PILL LIST */
  .rb-pill-list__heading { font-family: Georgia, serif; font-size: 1.3rem; margin: 0 0 1rem; }
  .rb-pill-list__items { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.6rem; }
  @media (max-width: 600px) { .rb-pill-list__items { grid-template-columns: 1fr; } }
  .rb-pill-list__pill { border: 1px solid #d8d2c4; border-radius: var(--rb-radius-sm); padding: 0.7rem 1.1rem; font-size: 0.92rem; color: var(--brand-text); background: #fff; }
  .rb-pill-list__pill::before { content: "•"; color: var(--brand-primary); margin-right: 0.5rem; font-weight: 700; }

  /* 5. CALLOUT SOFT */
  .rb-callout-soft { background: var(--brand-primary-soft); border-left: 4px solid var(--brand-primary); padding: 1.1rem 1.3rem; border-radius: 8px; }
  .rb-callout-soft[data-variant="warning"] { background: #fff5db; border-left-color: #d4a017; }
  .rb-callout-soft[data-variant="regulatory"] { background: #eef1f4; border-left-color: #6a7280; }
  .rb-callout-soft__content { margin: 0; font-size: 0.95rem; }
  .rb-callout-soft__emoji { margin-right: 0.35rem; }
  .rb-callout-soft__label { color: var(--brand-text); margin-right: 0.25rem; }

  /* 6. COMPARISON TABLE */
  .rb-comparison__heading { font-family: Georgia, serif; font-size: 1.5rem; margin: 0 0 1.25rem; color: var(--brand-primary); }
  .rb-comparison__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  @media (max-width: 600px) { .rb-comparison__grid { grid-template-columns: 1fr; } }
  .rb-comparison__col { padding: 1.5rem; border-radius: var(--rb-radius); }
  .rb-comparison__col--ours { background: var(--brand-primary-soft); border: 1px solid color-mix(in srgb, var(--brand-primary) 30%, transparent); }
  .rb-comparison__col--theirs { background: var(--brand-warn-soft); border: 1px solid color-mix(in srgb, var(--brand-warn) 30%, transparent); }
  .rb-comparison__label { font-size: 0.85rem; letter-spacing: 0.08em; font-weight: 700; margin: 0 0 1rem; }
  .rb-comparison__col--ours .rb-comparison__label { color: var(--brand-primary); }
  .rb-comparison__col--theirs .rb-comparison__label { color: var(--brand-warn); }
  .rb-comparison__list { list-style: none; padding: 0; margin: 0; }
  .rb-comparison__item { padding: 0.4rem 0; font-size: 0.92rem; color: var(--brand-text); display: flex; align-items: flex-start; gap: 0.5rem; }
  .rb-comparison__check { color: var(--brand-primary); font-weight: 700; flex-shrink: 0; }
  .rb-comparison__x { color: var(--brand-warn); font-weight: 700; flex-shrink: 0; }

  /* 7. DIRECT ANSWER (AI SEO — blogs novos) */
  .rb-direct-answer { background: var(--brand-bg-soft); border: 1px solid #ece6d8; border-radius: var(--rb-radius); padding: 1.4rem 1.6rem; }
  .rb-direct-answer__label { font-size: 0.75rem; letter-spacing: 0.08em; font-weight: 700; color: var(--brand-primary); text-transform: uppercase; margin: 0 0 0.5rem; }
  .rb-direct-answer__body { margin: 0; font-size: 1.05rem; line-height: 1.6; }

  /* 8. FAQ BLOCK (AI SEO — blogs novos) */
  .rb-faq__heading { font-family: Georgia, serif; font-size: 1.6rem; margin: 0 0 1rem; }
  .rb-faq__item { border-top: 1px solid #ece6d8; padding: 1rem 0; }
  .rb-faq__item:last-child { border-bottom: 1px solid #ece6d8; }
  .rb-faq__question { font-family: Georgia, serif; font-size: 1.15rem; margin: 0 0 0.5rem; color: var(--brand-text); }
  .rb-faq__answer { margin: 0; font-size: 0.95rem; color: var(--brand-text); line-height: 1.6; }
</style>
```

### Variáveis CSS por marca (substituir antes de emitir)

| Marca | `--brand-primary` | `--brand-primary-soft` | `--brand-dark` | `--brand-dark-accent` | `--brand-bg-soft` |
|---|---|---|---|---|---|
| Rituária | `#2f6850` | `#e6f0ea` | `#0f1614` | `#5fc0a0` | `#faf7f1` |
| Ápice | `#1e4936` | `#e3ebe5` | `#0a1410` | `#7ec4a0` | `#f7f3ea` |
| Barbour's | `#1c2e4d` | `#e1e6ee` | `#0a121f` | `#8fb4d8` | `#f0f1f4` |
| Lescent | `#c97a8c` | `#f5e6ea` | `#2b1418` | `#f0b8c4` | `#fdf6f3` |
| Kokeshi | `#d96690` | `#fae0ea` | `#1f1014` | `#f7a6c0` | `#fdf3f6` |
| By Samia | `#a78650` | `#f0e6d2` | `#0f0d08` | `#dbb878` | `#faf5e8` |
| Auá | `#a8542f` | `#f3dccf` | `#1a0f08` | `#e5a07a` | `#f9eee5` |

⚠️ Se brandbook tiver paleta diferente, **usar a do brandbook** — esta tabela é fallback.

---

## 📝 Regras gerais

### Imagens (capa + ilustrações)
- Sempre `<figure>` + `<img>`
- `alt` text descritivo
- `loading="eager"` na capa, `loading="lazy"` no resto
- `width` + `height` explícitos
- Paths relativos

### Tags semânticas
- `<article>` envolve tudo
- `<section>` pra blocos com heading próprio
- `<aside>` pra blocos complementares (cards, callouts, highlights)
- `<figure>` pra mídia

### Estilo
- ✅ `<style>` escopo no topo (necessário pros blocos ricos renderizarem)
- ✅ Classes BEM (`rb`, `rb-product-card`, `blog-post__section`)
- ❌ Inline `style="..."` em elementos individuais — usar SEMPRE classes
- ✅ Theme do Shopify pode sobrescrever via especificidade

### Acessibilidade
- Hierarquia H1 → H2 → H3 sem pular
- H1 NÃO entra no HTML do body (theme injeta via `{{ article.title }}`)
- Alt text em TODAS as imagens
- `aria-hidden="true"` em emojis decorativos dentro de blocos
- `role="note"` / `role="complementary"` em callouts/asides quando faz sentido

---

## 🚨 Guardrails

- ❌ Esquecer o `<style>` no topo (blocos ricos vão renderizar quebrados)
- ❌ Esquecer a `@media (min-width:992px)` constraint da cover (cover gigante no desktop)
- ❌ Esquecer `<script type="application/ld+json">` BlogPosting no final
- ❌ Inline `style="..."` em elementos **decorativos** (mas inline style É permitido em headings pra forçar tamanho contra theme override — a tag continua sendo `<h2>` semântico)
- ❌ H1 no body (theme injeta via `{{ article.title }}`)
- ❌ Imagens sem alt OU sem width/height (causa CLS — fere CWV)
- ❌ Body font < 18px desktop
- ❌ CTAs sem background colorido + padding ≥0.7rem
- ❌ `<div>` quando há tag semântica certa (`<article>`, `<section>`, `<aside>`, `<figure>`)
- ❌ Links externos sem `rel="noopener"`
- ❌ Anchor text genérico ("clique aqui", "saiba mais")
- ✅ HTML válido
- ✅ Schema.org `BlogPosting` JSON-LD no final
- ✅ Paths absolutos (CDN Shopify) — não relativos no body publicado
- ✅ Alt descritivo + width/height em todas imagens
- ✅ Pelo menos 3 blocos ricos por post + 1 product gallery final
- ✅ Cover constraint media query no topo

---

## 📁 Output

```
conteudos/[marca]/blogs/[slug]/conteudo-html/
├── article.html
└── schema.json
```

## ✅ Checklist

- [ ] `<style>` block presente e com cores da marca?
- [ ] Pelo menos 3 blocos ricos renderizados?
- [ ] Pelo menos 1 `product-cta-card` no post?
- [ ] HTML válido (passar em validator)?
- [ ] Sem inline `style="..."` em elementos?
- [ ] Alt text em todas as imagens?
- [ ] Hierarquia H2 → H3 sem pular?
- [ ] Schema.org JSON-LD presente?
- [ ] Imagens em paths relativos?
- [ ] Disclaimer ANVISA presente se tema toca saúde?
