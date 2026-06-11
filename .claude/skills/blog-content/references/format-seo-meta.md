# SEO Meta — Blog Post

Tags SEO + Schema.org Article JSON-LD pra otimizar o post no Google e em redes sociais.

> 🚨 **Este arquivo cobre os campos específicos de meta tags.** Pro playbook SEO completo (20 pontos — estrutura HTML, schema, performance, links, conteúdo, CWV), ver **[`seo-playbook.md`](./seo-playbook.md)**. É o source of truth.
>
> 🤖 **Blogs novos**: além do `BlogPosting`, emitir JSON-LD **`FAQPage`** (espelho do `faq-block`) e preencher `seo.ai_prompts_targeted[]` — ver **[`ai-seo-playbook.md`](./ai-seo-playbook.md)**.

## Inputs

- ✅ Título do artigo + keyword-foco
- ✅ Lead (será base da meta description)
- ✅ Slug proposto
- ✅ Capa gerada (pra og:image)

---

## 📐 Campos

### Slug
- **Kebab-case**, sem acento, lowercase
- Inclui keyword-foco
- Máximo ~60 caracteres
- Validar não duplicado (se Shopify acessível, checar; senão flagar)

✅ `cuidados-com-cachos-no-verao`
❌ `Cuidados com Cachos no Verão` ou `cuidados_cachos_verao_2026`

### Meta title
- **50-60 caracteres**
- Geralmente = título do artigo (se couber)
- Pode adicionar marca ao final se sobrar: `[Título] | [Marca]`

### Meta description
- **150-160 caracteres**
- Resumo do post + benefício pro leitor + keyword
- Estrutura: [contexto/problema] + [o que o post entrega] + [convite implícito]

### Open Graph (og:)
- `og:title` = meta title (ou versão mais "social")
- `og:description` = meta description
- `og:image` = path da capa (PNG 1200x630 ideal)
- `og:type` = "article"
- `og:locale` = "pt_BR"

### Twitter Card
- `twitter:card` = "summary_large_image"
- `twitter:title` = og:title
- `twitter:description` = og:description
- `twitter:image` = og:image

### Schema.org Article (JSON-LD)
- `@type`: "Article" ou "BlogPosting"
- `headline`, `description`, `image`, `author`, `publisher`, `datePublished`

---

## 📝 Exemplo (Ápice — Cachos no verão)

```json
{
  "seo": {
    "slug": "cuidados-com-cachos-no-verao",
    "meta_title": "Como cuidar de cachos no verão sem ressecar",
    "meta_title_length": 47,
    "meta_description": "Sol, mar e piscina não precisam ser inimigos dos seus cachos. Guia completo Ápice com rotina, ingredientes e gestos práticos pra atravessar o verão.",
    "meta_description_length": 157,
    "keyword_focus": "cachos no verão",
    "keywords_secondary": ["hidratação cabelo verão", "cuidados cabelo cacheado", "cachos definidos"],
    "ai_prompts_targeted": [
      "Como cuidar de cabelo cacheado no verão?",
      "Qual a melhor rotina pra cachos que vão ao mar e piscina?",
      "Cabelo cacheado pode pegar sol todos os dias?"
    ],
    "og": {
      "title": "Como cuidar de cachos no verão sem ressecar",
      "description": "Guia completo de hidratação e proteção pros seus cachos no verão.",
      "image": "imagens/generated/cover.png",
      "type": "article",
      "locale": "pt_BR"
    },
    "twitter": {
      "card": "summary_large_image",
      "title": "Como cuidar de cachos no verão sem ressecar",
      "description": "Guia Ápice de cachos no verão.",
      "image": "imagens/generated/cover.png"
    }
  }
}
```

### Schema.org JSON-LD (separado em `schema.json`)

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Como cuidar de cachos no verão sem ressecar",
  "description": "Guia completo de hidratação e proteção pros seus cachos no verão.",
  "image": "https://[shopify-cdn]/blogs/cuidados-com-cachos-no-verao/cover.png",
  "author": {
    "@type": "Organization",
    "name": "Ápice"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Ápice",
    "logo": {
      "@type": "ImageObject",
      "url": "[VALIDAR: logo URL]"
    }
  },
  "datePublished": "[VALIDAR: data de publicação]",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "[VALIDAR: URL final do post]"
  }
}
```

### Schema.org FAQPage JSON-LD (blogs novos — espelho do `faq-block`)

Emitir em `<script type="application/ld+json">` separado, junto do `BlogPosting` no final do body. As strings de pergunta/resposta devem ser **idênticas** às renderizadas no HTML do `faq-block` (Google penaliza divergência).

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Posso molhar o cabelo no mar todos os dias?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Pode, desde que enxágue com água doce logo depois e mantenha hidratação 2-3x por semana. O sal em contato prolongado desidrata o fio, mas o enxágue imediato remove a maior parte do resíduo antes que isso aconteça."
      }
    },
    {
      "@type": "Question",
      "name": "Leave-in com proteção UV substitui a máscara de hidratação?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Não. O leave-in protege o fio da agressão externa (UV, calor), enquanto a máscara repõe água e nutrientes já perdidos. No verão, os dois são complementares."
      }
    }
  ]
}
```

> URLs absolutas (CDN Shopify, logo, página) ficam como `[VALIDAR]` — o usuário substitui no momento da publicação ou via script de import.

---

## 🚨 Guardrails

- ❌ Meta title > 60 caracteres
- ❌ Meta description > 160 caracteres
- ❌ Keyword stuffing
- ❌ Slug com acento, espaço ou maiúscula
- ❌ Inventar data de publicação
- ✅ Validar comprimento de cada campo
- ✅ Keyword no meta title + meta description + slug
- ✅ Marcar URLs absolutas como `[VALIDAR]`

---

## 📁 Output

Incluído no `article.json` (campo `seo`) E em `schema.json` separado:

```
conteudos/[marca]/blogs/[slug]/
├── textos/
│   └── article.json          # contém seção "seo"
└── conteudo-html/
    └── schema.json           # JSON-LD standalone
```

## ✅ Checklist

- [ ] Slug kebab-case sem acento?
- [ ] Meta title 50-60 caracteres?
- [ ] Meta description 150-160 caracteres?
- [ ] Keyword no title + description + slug?
- [ ] og:image aponta pra capa?
- [ ] Schema.org Article completo (com `[VALIDAR]` em URLs absolutas)?
- [ ] [Blogs novos] `FAQPage` JSON-LD com strings idênticas ao `faq-block`?
- [ ] [Blogs novos] `ai_prompts_targeted[]` preenchido (prompt research)?
