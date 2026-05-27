---
name: pdp-content
description: Generate enriched Product Detail Page (PDP) content for Gobeaute brands. Handles 7 PDP content formats mapped 1:1 to Shopify metafields/metaobjects of the Goshop theme — descricao (composition/usage/warnings via rich_text metafields), bullets (descricao-curta via product_benefit metaobject), icones (product_icon trust badges), section-efficacy (eficiencia_item cards numeric+badge), faq (faq_item Q&A list), como-usar (como_usar steps+image metaobject), and ingredientes (product_ingredients metaobject list). Always consults brand-context skill first to get brand voice, product data, and compliance rules. Delegates image generation to piapp-image-gen skill. Saves output to conteudos/[marca]/produtos/[produto-slug]/[metafield]/{textos,imagens,prompts}/. Triggers when user asks for PDP content, product description, FAQ, ingredients section, efficacy cards, how to use, benefit icons, bullet points, or any product page enrichment for a Gobeaute brand product.
---

# PDP Content — Enriquecimento de Páginas de Produto

> 🔒 **REGRA INVIOLÁVEL #0 — PERSISTIR LOCAL ANTES DE QUALQUER MUTATION SHOPIFY.**
>
> **NUNCA** chame `metaobjectCreate`, `metaobjectUpdate`, `metafieldsSet`, `fileCreate`, `productUpdate` ou qualquer mutation do Shopify ANTES de ter salvo o conteúdo em disco em `conteudos/[marca]/produtos/[produto-slug]/[metafield]/`.
>
> **Ordem obrigatória** (sem exceção):
> 1. `Write` → `conteudos/[marca]/produtos/[slug]/[metafield]/textos/content.md` (markdown humano)
> 2. `Write` → `conteudos/[marca]/produtos/[slug]/[metafield]/textos/content.json` (estruturado)
> 3. `Write` → `conteudos/[marca]/produtos/[slug]/[metafield]/textos/shopify-payload.json` (variables prontas pras mutations)
> 4. **Só depois** disparar `metaobjectCreate`/`metafieldsSet`/etc.
> 5. Após sucesso: `Write` → `conteudos/[marca]/produtos/[slug]/[metafield]/shopify-result.json` com GIDs criados + timestamp
>
> **Por quê é inviolável**: Shopify não tem trash/restore de metaobjetos deletados. Se o usuário deletar (ou bug apagar), o disco local é a ÚNICA cópia. Padrão estabelecido após perda de 12+ blogs Kokeshi em mai/2026 por refactor em batch que pulou esse passo.
>
> **Sub-agents**: ao delegar via `Agent`, o prompt **DEVE** repetir essa ordem. Não delegue "popula metafield X" sem mandar "salva em `conteudos/` primeiro".
>
> **Verificação obrigatória antes da mutation**: confira via `Read`/`Glob` que `conteudos/[marca]/produtos/[slug]/[metafield]/textos/content.md` existe e tem conteúdo. Se não existe → STOP, salve antes.

Skill especializada em gerar os 7 formatos de conteúdo de PDP das marcas Gobeaute.

## 🎯 Quando esta skill ativa

- Usuário pede conteúdo de página de produto
- Orchestrator delega depois de identificar intent=PDP
- Formatos: descrição, composição, modo de uso, bullets, ícones, eficiência (cards), FAQ, como usar, ingredientes

## 🚦 Workflow

### Etapa 1 — Receber input do orchestrator

Input esperado (context bundle):
```yaml
brand: { slug, name, voice, visual_dna, palette, ... }
product: { slug, name, composition, claims, benefits, ... }
formats_requested: [faq, ingredientes, ...]   # ou null se ambíguo
output_formats: [markdown, json, ...]          # ou null se ambíguo
```

### Etapa 2 — Validar inputs

Se faltar:
- **Formato solicitado** (qual dos 7?) → PERGUNTAR oferecendo a lista
- **Dados do produto** (composição/INCI/benefícios) → PERGUNTAR ou marcar `[VALIDAR]`
- **Output format** → PERGUNTAR (Markdown / JSON / Liquid / múltiplos)

### Etapa 3 — Carregar reference do formato

Identifique qual reference carregar — **cada formato mapeia 1:1 a um metafield/metaobjeto do tema Goshop** (já cadastrados no Shopify das marcas, exemplo de referência: produto `Hidratante Facial Pele de Porcelana` da Kokeshi).

| Formato pedido | Reference | Metafield Shopify | Metaobjeto |
|---|---|---|---|
| Composição (INCI) | `references/format-descricao.md` | `custom.caracteristicas` (rich_text) | — |
| Modo de uso (texto simples) | `references/format-descricao.md` | `custom.how_to_use` (rich_text) | — |
| Precauções / Advertências | `references/format-descricao.md` | `custom.como_usar` (rich_text — confusamente nomeado) | — |
| Descrição curta + bullets | `references/format-bullets.md` | `custom.product_info_benefits` (metaobject_ref) | `product_benefit` |
| Ícones de benefício (trust) | `references/format-icones.md` | `custom.product_icons` (list.metaobject_ref) | `product_icon` |
| **[Section] Eficiência do Produto** (cards flexíveis numérico+badge — padrão Goshop atual) | `references/format-section-efficacy.md` | `custom.section_efficacy` (list.metaobject_ref) | `eficiencia_item` |
| FAQ | `references/format-faq.md` | `custom.section_faq` (list.metaobject_ref) | `faq_item` |
| Como Usar (passos + imagem/vídeo) | `references/format-como-usar.md` | `custom.como_usar_session_pdp` (metaobject_ref) | `como_usar` |
| Ingredientes destacados (com imagem) | `references/format-ingredientes.md` | `custom.product_ingredients_metafield` (list.metaobject_ref) | `product_ingredients` |

Carregue também:
- `references/output-paths.md` (estrutura de pastas)
- `references/output-formats.md` (MD/JSON/Liquid)

### Etapa 4 — Gerar conteúdo

Siga rigorosamente o reference carregado. Aplique:
- Tom de voz da marca (do bundle)
- Compliance ANVISA (consultar `brand-context/_shared/compliance-anvisa.md`)
- Validação de claims (sem fonte → `[VALIDAR]`)

### Etapa 5 — Se formato precisa imagem → piapp-image-gen

Formatos com imagem: `icones`, `section-efficacy` (cards numéricos+badges com ícone opcional), `como-usar`, `ingredientes`.

Delegar pra `piapp-image-gen` passando:
- `purpose`: `pdp-icon` / `pdp-section-efficacy-icon` / `pdp-section-efficacy-bg` / `pdp-how-to-use` / `pdp-ingredient`
- `output_path`: `conteudos/[marca]/produtos/[produto-slug]/[metafield]/imagens/`
- `brand_visual_dna`, `brand_palette` (do bundle)
- Prompts específicos

### Etapa 6 — Salvar output

Caminho base: `conteudos/[marca]/produtos/[produto-slug]/[metafield]/`

Estrutura:
```
[metafield]/
├── textos/
│   ├── content.md          # Markdown sempre
│   ├── content.json        # JSON sempre
│   └── shopify-liquid.html # se solicitado
├── imagens/                # se aplicável
│   ├── generated/
│   │   └── image-NN.png
│   └── prompts/
│       ├── prompt-NN.txt
│       └── prompt-NN.meta.json
```

Slugs de pasta local (`[metafield]` no path do output) — **mapeados ao metafield do Shopify pra rastreabilidade**:

| Slug local (pasta) | Metafield Shopify | Tipo Shopify |
|---|---|---|
| `composicao` | `custom.caracteristicas` | rich_text |
| `modo-de-uso` | `custom.how_to_use` | rich_text |
| `precaucoes` | `custom.como_usar` | rich_text (legado, nome confuso — guarda advertências) |
| `descricao-curta` | `custom.product_info_benefits` | metaobject_ref → `product_benefit` |
| `icones` | `custom.product_icons` | list.metaobject_ref → `product_icon` |
| `section-efficacy` | `custom.section_efficacy` | list.metaobject_ref → `eficiencia_item` |
| `faq` | `custom.section_faq` | list.metaobject_ref → `faq_item` |
| `como-usar` | `custom.como_usar_session_pdp` | metaobject_ref → `como_usar` |
| `ingredientes` | `custom.product_ingredients_metafield` | list.metaobject_ref → `product_ingredients` |

### Etapa 7 — Apresentar resultado

```markdown
✅ Conteúdo gerado: [Formato] pro [Produto] da [Marca]

📁 Arquivos:
- conteudos/apice/produtos/condicionador-nutri-waves-500ml/faq/textos/content.md
- conteudos/apice/produtos/condicionador-nutri-waves-500ml/faq/textos/content.json

🚩 Flags pra revisão:
- [VALIDAR] [...] (se houver)
- [REGULATÓRIO] [...] (se houver)

## ✅ Checklist de revisão humana
- [ ] Tom de voz coerente com brandbook da [marca]?
- [ ] Claims compatíveis com ANVISA?
- [ ] Composição bate com produto real?
- [ ] Imagens refletem ID visual (se aplicável)?
- [ ] Placeholders [VALIDAR] resolvidos?

🔄 Próximos passos sugeridos:
- Gerar outro formato pra este produto? (lista os disponíveis)
- Gerar mesmo formato pra outro produto?
- Iterar neste conteúdo?
```

## 🔁 Convenções Goshop (estabelecidas 2026-05-27)

Aplicar SEMPRE em **qualquer** metaobjeto criado pra qualquer produto/marca:

### 1. Status default: **ACTIVE** (nunca DRAFT)

Pra metaobjetos com capability `publishable` (`eficiencia_item`, `como_usar`, etc.), sempre criar com:

```json
"capabilities": { "publishable": { "status": "ACTIVE" } }
```

Tema só renderiza ACTIVE — DRAFT exige aprovação manual no admin. Antes de fechar tarefa, **auditar** via query e dar `metaobjectUpdate` se restar algum DRAFT.

### 2. Handle naming: `<product-slug>-<purpose>`

Metaobjetos **específicos** de produto: sempre prefixar com slug do produto.
- ✅ `kit-pele-plena-nota-judgeme`, `rosa-mosqueta-100-toque-seco`
- ❌ `nota-judgeme` (genérico — confunde entre produtos)

Metaobjetos **universais reusáveis**: handle simples (ex: `vegano-e-cruelty-free`, `ingredientes-naturais`).

### 3. Bullets sem cor — emoji semântico

No `product_benefit`, **NÃO** preencher `cor_bullet_point` (passar `""` vazio). Cada bullet começa com emoji semântico que representa o benefício (💧 hidratação, ✨ glow, 🌹 regeneração, 🌸 pele oleosa, 💪 firmeza, 🐰 cruelty-free, 👁️ olhos, 🌱 vegano, 🌿 antioxidante, ❄️ refrescância, 👘 K-beauty, 💎 ritual/kit). Ver `format-bullets.md`.

### 4. Reuso > criação — **REGRA OBRIGATÓRIA**

**Antes de criar qualquer novo metaobjeto, OBRIGATÓRIO**: query existentes do mesmo `type` e procurar se já existe um com o mesmo claim/ingrediente/conceito. Se sim → REUSAR GID. Só criar novo se realmente único (numérico específico, claim diferente, ingrediente novo).

#### Procedimento "check-before-create"

```graphql
query CheckReusable {
  existing: metaobjects(type: "<TYPE>", first: 50, query: "<KEYWORD>") {
    edges { node { id handle fields { key value } } }
  }
}
```

Se `text` ou `ingredient_title` ou `question` bate semanticamente → REUSAR.

#### Universais Kokeshi (catálogo de reuso — 2026-05-27)

**Eficiencia (`eficiencia_item`):**

| GID | Handle | Texto | Quando usar |
|---|---|---|---|
| `53738537167` | `vegano-e-cruelty-free` | "vegano e cruelty-free" + ícone | Produtos veganos (sem mel) |
| `53776285903` | `cruelty-free` | "cruelty-free" | Kits com Olhos de Gueixa (mel) — não-veganos |
| `53738602703` | `ingredientes-naturais` | "100% feito de ingredientes naturais" + ícone | Universal — quase todos produtos Kokeshi |
| `53776318671` | `livre-de-petrolatos-e-parabenos` | "livre de petrolatos e parabenos" + ícone | Universal — fórmula limpa Kokeshi |

**FAQ (`faq_item`):**

| GID | Handle | Pergunta | Quando usar |
|---|---|---|---|
| `53733294287` | `e-vegano-e-cruelty-free` | "É vegano e cruelty-free?" | Produtos veganos (sem mel) |
| `53776384207` | `cruelty-free-kit-com-mel` | "É cruelty-free?" | Kits com Olhos de Gueixa (mel) |

**Ingredientes (`product_ingredients`):** Pele de Porcelana (5), Creme Gel (4), Olhos de Gueixa (3 — Chá Verde, Sálvia, Mel), Rosa Mosqueta (1 — reusa do Pele de Porcelana). Catálogo completo no `_kits-population-report.json`.

#### Quando NÃO reusar (criar novo)

- ✅ Claims numéricos específicos do produto (nota Judge.me, % count) — sempre product-specific
- ✅ Texto/título com referência ao produto ("ritual K-beauty completo desse kit")
- ✅ Ingrediente exclusivo do produto

#### Sinal de alerta

Se você está criando 4+ metaobjetos com mesmo `text` ou mesma `question`, **PARE** — provavelmente devia ser 1 universal. Considere consolidar.

## 🚨 Guardrails

- ❌ Nunca alucinar composição/INCI/claims
- ❌ Nunca prosseguir sem brand-context bundle
- ❌ Nunca gerar imagem sem delegar pra piapp-image-gen
- ❌ Nunca esquecer compliance ANVISA
- ✅ Sempre salvar Markdown E JSON
- ✅ Sempre seguir hierarquia de pastas
- ✅ Sempre apresentar checklist + próximos passos

## 🤔 Quando perguntar

- Formato não especificado → ofereça lista dos 7
- Dados do produto insuficientes → peça composição/benefícios
- Output format não especificado → ofereça opções
- Ambiguidade entre Modo de Uso (texto simples → `custom.how_to_use`) e Como Usar (rica com passos + imagem → `custom.como_usar_session_pdp`)
- Para Eficiência: mistura ideal de cards numéricos (com footnote ANVISA) e badges (com ícone)
- Para ícones: paleta + estilo (linha/flat/3D)
- Para ingredientes: quais 3-6 destacar
- Para FAQ: se tem perguntas reais do SAC pra usar

## 📚 References disponíveis

| Reference | Metafield Shopify (Goshop) |
|---|---|
| `references/format-descricao.md` | `custom.caracteristicas` + `custom.how_to_use` + `custom.como_usar` (3 rich_text) |
| `references/format-bullets.md` | `custom.product_info_benefits` → metaobjeto `product_benefit` |
| `references/format-icones.md` | `custom.product_icons` → metaobjeto `product_icon` |
| `references/format-section-efficacy.md` ← **padrão Goshop atual** | `custom.section_efficacy` → metaobjeto `eficiencia_item` |
| `references/format-faq.md` | `custom.section_faq` → metaobjeto `faq_item` |
| `references/format-como-usar.md` | `custom.como_usar_session_pdp` → metaobjeto `como_usar` |
| `references/format-ingredientes.md` | `custom.product_ingredients_metafield` → metaobjeto `product_ingredients` |
| `references/output-paths.md` | (utility — sem metafield) |
| `references/output-formats.md` | (utility — sem metafield) |

## 🔒 Shopify safety (INVIOLÁVEL)

> **Princípio do menor escopo**: mutations no Shopify tocam **apenas** o produto/metafield explicitamente pedido.

- ❌ **NUNCA** tocar produtos fora do escopo (ID/handle não no pedido)
- ❌ **NUNCA** mudar `title`, `vendor`, `productType`, `status`, `tags`, `variants`, `price` se a tarefa é "enriquecer PDP" (apenas metafields do conteúdo)
- ❌ **NUNCA** mexer em outros metafields que não os solicitados (ex: pedido "atualiza FAQ" não toca "descricao")
- ❌ **NUNCA** chamar `bulk-update-product-status`, `productUpdate` fora do produto explicitado
- ❌ **NUNCA** alterar estoque, inventário, variantes
- ❌ **NUNCA** publicar/despublicar produto sem instrução explícita
- ✅ Antes de cada mutation: validar ID e campo no pedido — se não estão, parar e perguntar
- ✅ Reportar (não corrigir) inconsistências achadas em outros produtos durante a tarefa

## 🎯 SEO técnico

> 🚨 Seguir o playbook completo em **`../blog-content/references/seo-playbook.md`** — adaptado pra PDP:
> - `<h1>` único = nome do produto (vem do `product.title`, não duplicar no body)
> - Hierarquia H2 → H3 nas seções (descrição → benefícios → como usar → ingredientes → FAQ)
> - **Product schema JSON-LD** em vez de BlogPosting (já gerado pelo Shopify, mas se o tema não emitir, injetar inline com `name`, `image`, `description`, `brand`, `offers`, `aggregateRating` quando houver reviews)
> - **FAQPage schema** quando incluir seção FAQ (Google mostra rich snippet)
> - Alt text descritivo nas imagens do PDP (especialmente `como-usar` e `ingredientes`)
> - Internal linking pra blog posts educativos relacionados ao produto
> - Fonte body ≥18px, CTAs (Add to Cart já é tratado pelo tema) com tap target ≥48px
