---
name: collection-content
description: Generate content for Gobeaute brand collections (product groupings/categories). Handles hero banner (image + headline + subhead + CTA), full collection description, SEO meta tags, and optional thumbnail/card image. Always consults brand-context skill first to get brand voice, collection data from collections.csv, and visual identity. Delegates image generation to piapp-image-gen with purpose=collection-hero or collection-thumb. Saves output to conteudos/[marca]/collections/[collection-slug]/{textos,imagens,prompts}/. Triggers when user asks for collection content, category page, hero banner for collection, collection description, SEO for category, or any content related to a collection of products for a Gobeaute brand.
---

# Collection Content — Conteúdo de Coleções

> 🔒 **REGRA INVIOLÁVEL #0 — PERSISTIR LOCAL ANTES DE QUALQUER MUTATION SHOPIFY.**
>
> **NUNCA** chame `collectionUpdate`, `metafieldsSet`, `fileCreate` ou qualquer mutation do Shopify ANTES de ter salvo o conteúdo em disco em `conteudos/[marca]/collections/[collection-slug]/`.
>
> **Ordem obrigatória** (sem exceção):
> 1. `Write` → `conteudos/[marca]/collections/[slug]/textos/{hero,description,seo,thumbnail-meta}.{md,json}` conforme aplicável
> 2. `Write` → `conteudos/[marca]/collections/[slug]/textos/shopify-payload.json` (variables prontas pras mutations)
> 3. **Só depois** disparar `collectionUpdate`/`metafieldsSet`/etc.
> 4. Após sucesso: `Write` → `conteudos/[marca]/collections/[slug]/shopify-result.json` com IDs + timestamp
>
> **Por quê é inviolável**: Shopify não tem trash/restore. Disco local é a ÚNICA cópia recuperável. Padrão estabelecido após perda de 12+ blogs Kokeshi em mai/2026 por refactor que pulou esse passo.
>
> **Sub-agents**: ao delegar via `Agent`, o prompt **DEVE** repetir essa ordem. Não delegue "atualiza descrição da collection X" sem mandar "salva em `conteudos/` primeiro".
>
> **Verificação obrigatória antes da mutation**: confira via `Read`/`Glob` que `conteudos/[marca]/collections/[slug]/textos/` existe com os arquivos do escopo. Se não existe → STOP, salve antes.

Skill especializada em conteúdo de páginas de collection (agrupamentos/categorias de produtos).

## 🎯 Quando esta skill ativa

- Usuário pede conteúdo de collection/categoria
- Orchestrator delega depois de identificar intent=collection
- Formatos: hero banner, description, SEO meta, thumbnail

## 🚦 Workflow

### Etapa 1 — Receber input do orchestrator

```yaml
brand: { slug, name, voice, visual_dna, palette }
collection: { slug, name, description_short, products_included, ... }
formats_requested: [hero, description, seo, thumbnail] | null
output_formats: [markdown, json] | null
```

### Etapa 2 — Validar inputs

Se faltar:
- **Collection não está no CSV** → PERGUNTAR: "Não encontrei essa collection. Quer (a) ver lista, (b) adicionar nova, (c) prosseguir sem ficha?"
- **Formato solicitado** → PERGUNTAR: "Quer (a) hero banner, (b) descrição, (c) SEO meta, (d) thumbnail, ou (e) tudo?"
- **Conceito visual do hero** (se hero) → PERGUNTAR
- **Headline/CTA** preferidos → PERGUNTAR ou gerar opções

### Etapa 3 — Carregar reference

| Formato | Reference |
|---|---|
| Hero banner | `references/format-hero-banner.md` |
| Description | `references/format-description.md` |
| SEO meta | `references/format-seo-meta.md` |
| Thumbnail | `references/format-thumbnail.md` |

Carregar também `references/output-paths.md`.

> 🚨 **SEO técnico (estrutura HTML, headings, alt text, performance/CWV, internal linking, schema):** seguir o playbook completo em **`../blog-content/references/seo-playbook.md`**. Pra Collection, usar schema `CollectionPage` ou `ItemList` em vez de `BlogPosting`. Aplicar todas as outras 20 boas práticas — cover image lifestyle, fonte ≥18px, CTAs button-style, alt text descritivo, width/height em imagens.

## 🔒 Shopify safety (INVIOLÁVEL)

> **Princípio do menor escopo**: mutations tocam **apenas** a collection pedida.

- ❌ **NUNCA** tocar collections fora do escopo
- ❌ **NUNCA** alterar `productsAdd`/`productsRemove` (não mexer em quais produtos estão na collection — só conteúdo editorial)
- ❌ **NUNCA** mudar `title`, `handle`, `sortOrder`, `rules` (smart collections) sem solicitação explícita
- ❌ **NUNCA** publicar/despublicar collection sem instrução explícita
- ✅ Por default, atualizar apenas: `descriptionHtml`, `image` (banner), e metafields do hero/SEO solicitados
- ✅ Validar handle/ID no pedido antes de qualquer mutation
- ✅ Reportar inconsistências em outras collections sem corrigir

### Etapa 4 — Gerar conteúdo

Aplicar tom de voz, validar com compliance.

### Etapa 5 — Imagens via piapp-image-gen

Pra `hero` → delegar com `purpose: collection-hero`
Pra `thumbnail` → delegar com `purpose: collection-thumb`

### Etapa 6 — Salvar output

Caminho base: `conteudos/[marca]/collections/[collection-slug]/`

```
[collection-slug]/
├── textos/
│   ├── hero.md             # se hero
│   ├── hero.json
│   ├── description.md      # se description
│   ├── description.json
│   ├── seo.json            # se SEO
│   └── thumbnail-meta.json # se thumbnail
├── imagens/
│   ├── generated/
│   │   ├── hero.png
│   │   └── thumbnail.png
│   └── prompts/
│       ├── hero.txt
│       ├── hero.meta.json
│       ├── thumbnail.txt
│       └── thumbnail.meta.json
```

### Etapa 7 — Apresentar resultado

Igual pdp-content (paths + flags + checklist + próximos passos).

## 🚨 Guardrails

- ❌ Não inventar produtos na collection
- ❌ Não criar collection sem confirmar que existe ou usuário quer criar
- ❌ Não gerar hero sem aprovação de conceito visual
- ✅ Validar produtos referenciados existem em `produtos.csv` da marca
- ✅ SEO meta dentro dos limites (title 50-60, description 150-160)
- ✅ Hero com espaço pra overlay de texto

## 🤔 Quando perguntar

- Collection não encontrada
- Conceito visual do hero não claro
- Headline/CTA não fornecidos (oferecer opções)
- Lista de produtos da collection incompleta
- Disclaimers sazonais (se collection é Black Friday, Dia das Mães, etc.)
