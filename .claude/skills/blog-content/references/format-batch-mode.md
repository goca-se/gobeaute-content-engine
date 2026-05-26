# Batch Mode — Geração em Massa

Gerar N blogs em sequência para uma marca, com um único brief e UMA única aprovação. Pensado pra calendários editoriais (ex: "gera 10 blogs pra Ápice baseados em `blog-themes.md`").

---

## 🎯 Quando ativar batch mode

Detectar batch quando o usuário pedir qualquer um destes:

- `"gera N blogs pra <marca>"` (N ≥ 2)
- `"calendário de blogs <marca>"`
- `"X posts mensais"`
- `"esvazia a fila de temas autorizados"`
- Lista explícita: `"blog 1: X, blog 2: Y, blog 3: Z"`
- Caminho para um YAML/CSV: `"usa esse calendário: <path>"`

Senão, modo single (1 brief = 1 blog).

---

## 📋 Input contract

### Forma 1 — Inline

```yaml
mode: batch
brand: apice
posts:
  - theme: "Por que ondulado pede nutrição"
    angle: b       # mesmo enum do single mode (a/b/c/d livre)
    product_cta_handle: kit-nutri-waves
    keyword_focus: "cabelo ondulado nutrição"
  - theme: "Proteína do Arroz na rotina capilar"
    product_cta_handle: shampoo-nutri-waves-300ml
  - theme: "Como cuidar de cachos no verão"
    collection_cta_handle: linha-cachos
defaults:
  word_count: 900
  n_illustrations: 3
  is_published: false        # 🚨 default em batch
  cover_image: true
  cta_position: middle_and_end
  tags_extra: [calendario-2026-q2]
```

### Forma 2 — Auto-gerar a partir do blog-themes.md

```yaml
mode: batch
brand: apice
source: blog-themes.md
filter:
  category: ["Cuidados por curvatura", "Ingredientes e ciência cosmética"]
  exclude_already_published: true   # consultar blog-themes.md → "Posts já produzidos"
  limit: 6
defaults: {...}
```

Quando a skill detecta auto-gen, ela:
1. Lê `brand-context/<marca>/blog-themes.md`
2. Filtra pela categoria
3. Remove temas em "Posts já produzidos"
4. Auto-mapeia cada tema → produto/collection mais relevante consultando `produtos.csv` por palavra-chave (heurística simples)
5. Apresenta a lista resolvida pro usuário (1 gate de aprovação) e prossegue

### Forma 3 — Arquivo CSV

```yaml
mode: batch
brand: apice
source_csv: input/calendario-q2.csv
defaults: {...}
```

CSV format:
```csv
theme,angle,product_cta_handle,collection_cta_handle,keyword_focus,word_count
Por que ondulado pede nutrição,b,kit-nutri-waves,,cabelo ondulado nutrição,900
Proteína do Arroz na rotina,a,shampoo-nutri-waves-300ml,,proteína do arroz cabelo,800
```

---

## 🚦 Workflow (batch)

### Etapa 1 — Validação prévia (FAIL FAST)

Antes de gerar 1 byte:

1. **Brand existe?** `brand-context/<marca>/brandbook.md` carregável? ANVISA carregável?
2. **Todos os temas estão em `blog-themes.md`?** Senão, listar quais NÃO estão e PERGUNTAR uma vez: (a) prosseguir flagando, (b) abortar os fora-da-lista, (c) abortar tudo.
3. **Todos os handles existem no Shopify?** Batch-resolve via GraphQL (ver `format-product-resolver.md`). Lista os inválidos. PERGUNTAR uma vez: (a) skipar posts com handle inválido, (b) abortar.
4. **Blog handle do Shopify confirmado?** Default: usar o primeiro blog. Se houver múltiplos, usar `blog_handle` no input ou perguntar uma vez.
5. **Slugs únicos?** Conferir cada slug proposto contra os já existentes no Shopify (`blog.articles(query: "handle:xxx")`) e contra slugs do próprio batch.
6. **PiApp tem créditos?** N posts × ~80 créditos = estimativa. Se passar de 50% do saldo, avisar e PERGUNTAR.

**Uma única lista consolidada de validação** apresentada ao usuário. Aprovação única para todo o batch.

### Etapa 2 — Loop principal (FAIL-SOFT por post)

```
for post in posts:
  try:
    gerar_outline(post)
    gerar_texto(post)
    gerar_imagens(post)           # com retries — ver format-retries.md
    montar_html(post)
    upload_imagens_shopify(post)  # com retries
    criar_article(post, isPublished=False)
    log(post, status="success")
  except Exception as e:
    log(post, status="failed", error=e)
    continue   # ⚠️ NÃO para o batch — segue pro próximo
```

🚨 **Princípio fail-soft**: 1 post falhar NÃO pode parar os outros. Cada post é uma unidade independente.

### Etapa 3 — Report consolidado final

```markdown
✅ Batch concluído — 8 de 10 posts publicados como unpublished

📊 Resumo:
- ✅ Sucesso: 8 posts
- ❌ Falha: 2 posts
- 🪙 Créditos PiApp consumidos: ~720 / 18000

📄 Posts criados (unpublished — revisar antes de publicar):
1. ✅ por-que-ondulado-pede-nutricao        | /admin/articles/564803764378
2. ✅ proteina-do-arroz-rotina-capilar      | /admin/articles/...
3. ❌ cachos-no-verao                        | erro: product-handle "kit-cachos-verao" não existe
4. ✅ ...
5. ❌ ...
...

🚩 Falhas detalhadas:
- Post 3 "Cachos no verão": handle `kit-cachos-verao` não existe no Shopify. Sugestão: usar `kit-cachos-completo` (encontrado por similaridade).
- Post 5 "...": PiApp job falhou após 3 retries. Job IDs: [...]. Tentar de novo: `gera blog "..." pra <marca>`.

📁 Arquivos:
- Logs: conteudos/_batch-logs/<batch-id>.json
- Cada post em: conteudos/<marca>/blogs/<slug>/
```

---

## 🤔 Quando perguntar (gates de aprovação)

**Máximo de 2 gates por batch:**

### Gate 1 — Validação consolidada (sempre)
Listar todos os 6 checks de validação prévia. Se algum falhar, perguntar o que fazer pro batch inteiro (não por post).

### Gate 2 — Confirmar geração (sempre)
Mostrar:
- N posts a gerar
- N imagens totais a serem geradas (cover + illustrations)
- Custo estimado em créditos PiApp
- Confirmação que serão criados como `unpublished` para validação

Aprovação única → roda end-to-end.

**Nenhum outro gate**:
- ❌ NÃO apresentar prompts de imagem individuais pra aprovação (usa templates por marca + por purpose)
- ❌ NÃO apresentar outline de cada post (usa pattern padrão de 5 H2 + 7 blocos ricos)
- ❌ NÃO confirmar publicação (já é unpublished)
- ❌ NÃO confirmar upload de cada imagem (faz tudo em batch via fileCreate)

---

## 🖼️ Imagens em batch — otimização

### Estratégia "shared illustrations" (opcional)

Posts da mesma marca + tema próximo podem **compartilhar ilustrações** quando fizer sentido visual:
- Macro de cabelo (1 ilustração serve pra qualquer post de cuidado capilar Ápice)
- Still life de ingredientes (1 imagem cobre vários posts sobre o ativo)

Em batch mode, antes de gerar, perguntar se quer:
- **Modo unique**: 1 capa + 3 ilustrações novas por post (padrão — visual rico)
- **Modo shared**: 1 capa única por post + biblioteca compartilhada de 4–6 ilustrações genéricas reusadas (economia ~50% de créditos)

### Geração em paralelo

Em vez de 1 post por vez, gerar **todas as imagens do batch em paralelo** quando possível:
- Disparar N×(1 cover + 3 illustrations) = N×4 jobs no PiApp (até 10 por batch call)
- Polling em uma única chamada `check_jobs` com todos os job IDs
- 10 jobs paralelos = ~60-120s total ao invés de N×60s

### Upload Shopify em paralelo

`fileCreate` aceita N URLs em uma única chamada. Subir TODAS as imagens do batch em 1 mutation, depois poll todos com `nodes()` em 1 query.

---

## 📁 Output (batch)

```
conteudos/<marca>/blogs/
├── <slug-1>/
│   ├── textos/article.md + article.json
│   ├── imagens/generated/ + imagens/prompts/
│   ├── conteudo-html/article.html + schema.json
│   └── prompts/article-brief.md
├── <slug-2>/
│   └── ...
└── ...

conteudos/_batch-logs/
└── 2026-05-15-apice-batch-001.json     # log completo do batch
```

Log batch:
```json
{
  "batch_id": "2026-05-15-apice-batch-001",
  "brand": "apice",
  "started_at": "2026-05-15T18:30:00Z",
  "completed_at": "2026-05-15T18:42:31Z",
  "config": { /* defaults */ },
  "posts": [
    {
      "theme": "...",
      "slug": "...",
      "shopify_article_id": "gid://shopify/Article/...",
      "is_published": false,
      "status": "success",
      "credits_used_piapp": 78,
      "duration_seconds": 71,
      "warnings": [],
      "errors": []
    },
    {
      "theme": "...",
      "status": "failed",
      "errors": ["product_handle_not_found: kit-cachos-verao"]
    }
  ],
  "totals": {
    "success": 8,
    "failed": 2,
    "credits_used": 720,
    "duration_seconds": 751
  }
}
```

---

## 🚨 Guardrails

- ❌ Parar o batch inteiro se 1 post falhar — NUNCA, sempre fail-soft
- ❌ Publicar (`isPublished: true`) em batch sem confirmação explícita — default sempre `false`
- ❌ Pedir aprovação por post — bate o objetivo do batch
- ❌ Inventar produto/handle quando o input estava errado — sempre usar resolver
- ❌ Iniciar batch sem `check_credits` quando N×imagens ≥ 5
- ✅ Validação prévia fail-fast (1 gate)
- ✅ Confirmação única de execução (1 gate)
- ✅ Log estruturado de cada post (sucesso ou falha)
- ✅ Report final consolidado com link admin de cada post
- ✅ Slugs únicos garantidos antes de gerar (Shopify + dentro do batch)

---

## ✅ Checklist batch

- [ ] Mode `batch` detectado corretamente?
- [ ] Validação prévia rodou nos 6 checks?
- [ ] Apenas 2 gates de aprovação (validação + execução)?
- [ ] Imagens geradas em paralelo (até 10 por batch call)?
- [ ] Upload Shopify em uma única mutation `fileCreate`?
- [ ] Cada post é independente (1 falha não para os outros)?
- [ ] Todos os posts criados como `isPublished: false`?
- [ ] Log batch salvo em `conteudos/_batch-logs/`?
- [ ] Report final lista cada post com status + link admin?
