---
name: blog-content
description: Generate rich, visually engaging blog content for Gobeaute brands — single posts OR batch of N posts at once. Produces SEO-optimized articles with title, lead, body interleaving prose and rich editorial blocks (product CTA cards driven by real Shopify product handles with real CDN images + real prices, dark highlight pull-quotes, benefit grids, persona-fit pill lists, soft callouts with ANVISA disclaimers, comparison tables vs. unnamed competitors), conclusion, and CTA. Resolves all product/collection data from Shopify Admin GraphQL via handle — never invents image, price, title or description. Generates cover (16:9) and supporting illustrations (4:5) via piapp-image-gen (NOT product card images — those come from Shopify CDN). Produces SEO meta (slug, meta description, og tags, Schema.org Article JSON-LD) and exports Shopify-ready HTML with a scoped <style> block carrying brand colors. Auto-publishes to Shopify as UNPUBLISHED by default for human review. Built-in retries for PiApp (failed jobs → regenerate) and Shopify (file failed → re-upload via staged) with exponential backoff. Batch mode supports N posts with fail-soft (1 fails, rest continue) and only 2 approval gates total (validation + execution). Always consults brand-context first and validates theme against brand-context/[brand]/blog-themes.md. Saves output to conteudos/[marca]/blogs/[slug]/{textos,imagens,conteudo-html,prompts}/. Triggers when user asks for blog post, article, content marketing, editorial piece, calendário de blogs, or any long-form content for a Gobeaute brand.
---

# Blog Content — Artigos Editoriais

Skill especializada em produzir blog posts completos: texto + imagens + HTML + publicação Shopify como `unpublished` pra validação humana. Modo single (1 blog) ou batch (N blogs). Mínimo de gates de aprovação, retries built-in.

## 🎯 Quando esta skill ativa

- Usuário pede blog/artigo/matéria/post (single mode)
- Usuário pede "N blogs", "calendário", "esvazia fila de temas" (batch mode)
- Orchestrator delega depois de identificar intent=blog
- Output completo: texto Markdown + imagens + HTML + Article no Shopify (`unpublished`)

## 🔑 Princípios

1. **Dados reais sempre**: imagem/preço/título/descrição de produto vêm do **Shopify via handle**, nunca inventados (`format-product-resolver.md`)
2. **Mínimo de gates**: 1 brief inicial → 1 validação consolidada → 1 confirmação de execução → roda tudo end-to-end
3. **Unpublished por default**: artigos criados como `isPublished: false` pra revisão humana
4. **Fail-soft em batch**: 1 post falhar não para os outros
5. **Retries automáticos**: PiApp (3x com prompt ajustado), Shopify files (3x com staged upload), Shopify rate limit (exp backoff)
6. **Escalável**: mesma skill atende 1 post ou 20 posts sem mudar lógica

## 🚦 Workflow

### Etapa 1 — Detectar modo + receber brief

**Single mode** (default):
```yaml
brand: apice
blog:
  theme: "Por que ondulado pede nutrição"
  angle: b                              # opcional
  product_cta_handle: kit-nutri-waves   # OBRIGATÓRIO se quiser product-cta-card
  collection_cta_handle: null
  keyword_focus: "cabelo ondulado"      # opcional
  word_count: 900                       # default
  n_illustrations: 3                    # default
  is_published: false                   # 🚨 DEFAULT FALSE
```

**Batch mode**: ver `references/format-batch-mode.md` para input contract.

Detectar batch quando: "N blogs", "calendário", lista de temas, arquivo CSV/YAML.

### Etapa 2 — Validação consolidada (1º gate único)

Rodar **todos** os checks abaixo em paralelo e apresentar resultado consolidado:

| Check | Como |
|---|---|
| Brand context existe | `brand-context/<marca>/{brandbook.md, blog-themes.md, produtos.csv}` |
| Tema autorizado | tema está em `blog-themes.md` (ou flag pra incluir) |
| Slug único | query Shopify `articles(query:"handle:<slug>")` |
| Product/Collection handle existe | `productByHandle()` / `collectionByHandle()` retornam não-null |
| Product tem `featuredImage` | resolver retorna `image.url` real |
| Shopify staging conectado | `get-shop-info()` |
| Blog handle válido | query `blogs` → escolher 1º ou `blog_handle` do input |
| Créditos PiApp suficientes | `check_credits()` ≥ 80 × N posts |
| Compliance ANVISA do tema | check inicial contra `_shared/compliance-anvisa.md` |

**Apresentar consolidado**:
```
✅ Brand: apice (brandbook OK, blog-themes OK)
✅ Tema "Por que ondulado pede nutrição": autorizado
✅ Slug "por-que-ondulado-pede-nutricao": único no Shopify
✅ Handle "kit-nutri-waves": resolvido (imagem real + preço R$ 219,90)
✅ Shopify: staging-gogroup.myshopify.com
✅ Blog: novidades
✅ Créditos: 12.796 (precisa ~80)
✅ Compliance ANVISA: 0 termos proibidos detectados

[Modo batch] N=8 posts, ~640 créditos previstos, ~10min execução

Confirma execução? (responder "go" pra rodar end-to-end)
```

Se algum check falhar → listar erros e perguntar 1 vez como resolver (skipar / abortar / ajustar).

### Etapa 3 — Carregar references

| Etapa | Reference |
|---|---|
| Estrutura do artigo | `references/format-article.md` |
| **SEO Playbook (20 pontos — OBRIGATÓRIO)** | **`references/seo-playbook.md`** |
| **Blocos ricos editoriais** | `references/format-rich-blocks.md` |
| **Resolver Shopify (produto/collection)** | `references/format-product-resolver.md` |
| **Batch mode** (se N ≥ 2) | `references/format-batch-mode.md` |
| **Retry policies** | `references/format-retries.md` |
| Cover image | `references/format-cover-image.md` |
| Ilustrações | `references/format-illustrations.md` |
| SEO meta tags | `references/format-seo-meta.md` |
| HTML export + boilerplate | `references/format-html-export.md` |
| Output paths | `references/output-paths.md` |

> 🚨 **`seo-playbook.md` é source-of-truth de SEO** — qualquer post gerado **deve** passar pelos 20 checks antes da publicação (estrutura HTML, headings, schema BlogPosting JSON-LD, performance/CWV, cover constraint desktop, CTAs button-style, alt text, internal/external links, conteúdo E-E-A-T).

### Etapa 4 — Resolver produtos/collections (Shopify GraphQL)

Para CADA `product_handle` ou `collection_handle` referenciado:

```graphql
query { productByHandle(handle: "...") { id title featuredImage { url altText } priceRangeV2 { minVariantPrice { amount currencyCode } } compareAtPriceRange { ... } vendor productType descriptionHtml } }
```

Cachear resultados em `conteudos/_cache/shopify-resolver/products/<handle>.json` (TTL 24h).

Ver `format-product-resolver.md` para detalhes completos.

🚨 **Se produto não existir ou não tiver `featuredImage` → abortar single OU pular batch**, com flag clara.

### Etapa 5 — Gerar texto + outline + blocos ricos (sem perguntar)

Aplicar template padrão de outline (5 H2 + 7 blocos ricos) — ver `format-article.md` seção "Outline padrão". Não pedir aprovação do outline; o brief já é suficiente.

Cada `product-cta-card` referencia o handle resolvido (image_url, eyebrow, title, description, price_current, price_original, discount_badge, cta_url, trust_line — TODOS preenchidos a partir do resolver).

Aplicar:
- Tom de voz da marca
- Compliance ANVISA em CADA bloco
- Validação de claims (sem stats sem fonte)

### Etapa 6 — Gerar SEO meta

Slug, meta_title, meta_description, og tags, Schema.org. Ver `format-seo-meta.md`.

### Etapa 7 — Gerar imagens via piapp-image-gen (sem perguntar)

Em **single**: usar prompts padronizados por purpose + brand visual DNA (sem apresentar pra aprovação caso a única aprovação inicial já tenha sido dada).

Em **batch**: gerar TODAS as imagens de TODOS os posts em paralelo (até 10 por batch call, repetir se N×4 > 10).

**Imagens geradas via PiApp**:
- `cover.png` 16:9 quality `high` (1 por post)
- `illustration-XX.png` 4:5 quality `standard` (2-4 por post)

**Imagens NÃO geradas via PiApp**:
- ❌ Product card images — vêm do **Shopify CDN** (`featuredImage.url` real)

**Retries** (ver `format-retries.md`):
- Job FAILED → regenerar com prompt levemente ajustado (max 3x)
- Polling timeout > 180s → marcar como faltando, seguir
- Imagem faltando → flag `[IMAGEM FALTANDO]` no JSON, NÃO renderizar `<figure>` correspondente

### Etapa 8 — Upload das imagens PiApp pro Shopify CDN

Em **single**: 1 mutation `fileCreate` com todas as imagens do post.
Em **batch**: 1 mutation `fileCreate` com todas as imagens de todos os posts.

**Retries**:
- `fileStatus: FAILED` → re-download local + re-upload via `stagedUploadsCreate` (max 3x)
- URL JWT-signed do PiApp > 50min → re-upload direto via staged
- Rate limit → backoff exponencial respeitando `Retry-After`

Poll `nodes(ids: [...])` até `fileStatus: READY` ou max 60s.

### Etapa 9 — Renderizar HTML com URLs reais

Para cada post:
1. Substituir `{{COVER_URL}}` pela URL real do Shopify CDN
2. Substituir `{{ILLUSTRATION_XX_URL}}` pelas URLs CDN
3. Substituir `{{product-cta-card.image_url}}` pela URL **real do produto** (do resolver, não PiApp)
4. Inserir `<style>` escopo com cores da marca
5. Validar HTML (sem inline styles em elementos, alt em todas as imagens)

Ver `format-html-export.md`.

### Etapa 10 — Criar Article no Shopify (`isPublished: false`)

```graphql
mutation ArticleCreate($article: ArticleCreateInput!) {
  articleCreate(article: $article) { article { id handle isPublished } userErrors { ... } }
}
```

Variables:
```yaml
article:
  blogId: gid://shopify/Blog/<id>
  title: ...
  handle: ...
  body: <HTML completo>
  summary: <1 parágrafo>
  isPublished: false       # 🚨 DEFAULT — SEMPRE
  tags: [...]
  image: { url: <cover CDN>, altText: ... }
  author: { name: "Equipe <Marca>" }
  metafields:
    - { namespace: global, key: title_tag, type: single_line_text_field, value: <meta_title> }
    - { namespace: global, key: description_tag, type: single_line_text_field, value: <meta_description> }
```

**Retries**:
- Handle duplicado → append `-2`, `-3` ao slug (max 3x)
- userErrors validation → abortar com erro claro
- Rate limit → backoff exp

### Etapa 11 — Salvar output local

```
conteudos/<marca>/blogs/<slug>/
├── textos/article.md + article.json
├── imagens/generated/ (cover.png + illustration-XX.png — NÃO mais product-card)
├── imagens/prompts/ (.txt + .meta.json)
├── conteudo-html/article.html + schema.json
└── prompts/article-brief.md

conteudos/_batch-logs/<batch-id>.json  (se batch)
conteudos/_cache/shopify-resolver/{products,collections}/<handle>.json
```

### Etapa 12 — Reportar resultado

**Single**:
```markdown
✅ Blog "<título>" criado no Shopify staging como UNPUBLISHED
   👉 Admin URL: https://staging-gogroup.myshopify.com/admin/articles/<id>
   👉 Preview: <storeUrl>/blogs/<blog>/<slug>

📊 Stats: ~XXX palavras · 5 seções · N blocos ricos · M imagens
🚩 Flags: [se houver]
⏭️ Próximo: revisar no admin → publicar manualmente
```

**Batch**: ver `format-batch-mode.md` para report consolidado.

## 🚨 Guardrails

### 🔒 Shopify safety (INVIOLÁVEL)

> **Princípio do menor escopo**: cada mutation no Shopify toca **apenas** o que foi solicitado, nunca mais. Loja em produção = qualquer write não autorizado é incidente.

#### Escopo permitido por ação

| Ação solicitada | Pode tocar | NÃO pode tocar |
|---|---|---|
| "Cria blog post" | `articleCreate` com `body`, `title`, `summary`, `author`, `tags`, `image`, `isPublished: false` | Outros artigos, produtos, collections, theme, settings |
| "Atualiza blog X" | `articleUpdate(id: X)` apenas nos campos pedidos | Outros artigos, qualquer outro recurso |
| "Publica blog X" | `articleUpdate(id: X, isPublished: true)` | Qualquer outro campo do mesmo artigo (a menos que explícito) |
| "Refatora N blogs" | `articleUpdate` em **apenas** os IDs listados | Qualquer artigo fora da lista |
| "Cria PDP" / "atualiza produto" | Recursos do produto especificado | Outros produtos, blogs, collections |

#### Regras NÃO-NEGOCIÁVEIS

- ❌ **NUNCA** rodar mutation em recurso fora do escopo explícito do pedido
- ❌ **NUNCA** "limpar" / "organizar" / "padronizar" outros recursos por iniciativa própria
- ❌ **NUNCA** deletar artigos, produtos, collections, files mesmo que pareçam órfãos/duplicados — flagar pro usuário decidir
- ❌ **NUNCA** mudar `title`, `image`, `handle`, `summary`, `tags`, `publishedAt`, `isPublished` se a tarefa for só "atualizar body" (preservar tudo o resto)
- ❌ **NUNCA** mudar `isPublished` (publicar/despublicar) sem instrução explícita textual do usuário
- ❌ **NUNCA** mudar `handle` de artigo já publicado (quebra URL + SEO + backlinks)
- ❌ **NUNCA** rodar `bulk-update-product-status`, `update-collection`, `update-product` sem solicitação explícita por nome do recurso
- ❌ **NUNCA** mexer em theme files, settings, navigation, app embeds
- ❌ **NUNCA** chamar mutations destrutivas (`*Delete`, `*Bulk*`, `themeFilesUpsert` em theme MAIN) sem instrução explícita

#### Antes de cada mutation, validar

1. **O recurso (ID/handle) está no pedido do usuário?** Se não → não tocar
2. **O campo a alterar está no pedido?** Se não → não tocar (mesmo que pareça "uma melhoria")
3. **Se a mutation muda mais de 1 recurso de uma vez** (`bulk*`) → exige confirmação explícita
4. **Se for `isPublished: true`** → confirmar que o usuário disse "publica" / "deixa público" / "ativa" — não inferir de "ok" / "go" / "continua"

#### Em caso de dúvida

- "O usuário pediu X em todos os blogs. Devo aplicar nos blogs com tag Y também?" → **PERGUNTAR**. Não inferir escopo.
- "Vejo um produto duplicado/inativo enquanto rodo a tarefa." → **REPORTAR**, não corrigir.
- "O handle Z não existe mas Z-1 existe." → **PERGUNTAR**, não substituir.

### Dados reais
- ❌ Inventar imagem, preço, título ou descrição de produto
- ❌ Gerar imagem via PiApp para `product-cta-card` (sempre Shopify CDN)
- ❌ Renderizar card de produto sem resolver primeiro
- ❌ Continuar se handle de produto não existe no Shopify

### Workflow
- ❌ Mais de 2 gates de aprovação (validação + execução)
- ❌ Pedir aprovação de prompts de imagem após o brief inicial
- ❌ Pedir aprovação de outline (template padrão funciona)
- ❌ Publicar (`isPublished: true`) sem instrução explícita do usuário
- ❌ Em batch: parar tudo quando 1 post falha
- ❌ Retry cego sem diagnóstico

### Conteúdo
- ❌ Tema fora de `blog-themes.md` sem flag
- ❌ Citar pesquisas/estatísticas sem fonte
- ❌ Termos proibidos ANVISA (cura, trata, elimina)
- ❌ Comparações com concorrentes nomeados
- ❌ Blog com menos de 3 blocos ricos
- ❌ CTA final como link de texto puro

### Sempre
- ✅ Default `isPublished: false`
- ✅ Validação prévia fail-fast (1 gate consolidado)
- ✅ Resolver Shopify antes de renderizar `product-cta-card`
- ✅ Imagens de cover/illustrations via PiApp; imagens de produto via Shopify CDN
- ✅ Retries com diagnóstico e exp backoff
- ✅ Fail-soft em batch (1 falha não para os outros)
- ✅ Cache local do resolver pra economizar Shopify API calls
- ✅ Log estruturado de cada post (status, retries, créditos)

## 🤔 Quando perguntar (e quando NÃO)

### SEMPRE perguntar uma vez (single OU batch):
1. **Validação falhou** em ≥ 1 check → "Handle X não existe. Skipar / sugerir alternativa / abortar?"
2. **Tema fora da lista** → "Adicionar à lista / prosseguir com flag / sugerir alternativo?"

### NUNCA perguntar (com brief inicial completo):
- ❌ Outline / estrutura do post
- ❌ Prompts individuais de imagem
- ❌ Cores da marca (vêm do brandbook)
- ❌ Confirmar upload de cada imagem
- ❌ Confirmar publicação (já é unpublished)

### Brief mínimo necessário (perguntar SE faltar):
- Marca
- Tema
- Product/Collection handle para o CTA principal

Outros parâmetros têm defaults sensatos (word_count=900, n_illustrations=3, etc).

**Limite absoluto**: 3 perguntas por turno. Em batch: 1 pergunta consolidada de validação.

## 📚 References

### Core
- `references/format-article.md` — estrutura do artigo + outline padrão
- `references/format-rich-blocks.md` — 6 tipos de blocos ricos
- `references/format-html-export.md` — HTML Shopify-ready + `<style>` escopo
- `references/format-seo-meta.md` — SEO meta + Schema.org

### Novas (v2)
- `references/format-product-resolver.md` — resolver dados reais via Shopify
- `references/format-batch-mode.md` — geração em massa N posts
- `references/format-retries.md` — políticas de retry PiApp + Shopify

### Imagens
- `references/format-cover-image.md`
- `references/format-illustrations.md`

### Output
- `references/output-paths.md`
