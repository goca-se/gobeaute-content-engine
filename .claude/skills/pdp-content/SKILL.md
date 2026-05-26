---
name: pdp-content
description: Generate enriched Product Detail Page (PDP) content for Gobeaute brands. Handles 7 PDP content formats: descricao (description/composition/usage), bullets (short description + 5 bullets), icones (3 benefit icons), antes-depois (before/after visual or stats), faq (6 Q&A), como-usar (5-8 steps + image), and ingredientes (3-6 ingredients with images). Always consults brand-context skill first to get brand voice, product data, and compliance rules. Delegates image generation to piapp-image-gen skill. Saves output to conteudos/[marca]/produtos/[produto-slug]/[metafield]/{textos,imagens,prompts}/. Triggers when user asks for PDP content, product description, FAQ, ingredients section, before/after, how to use, benefit icons, bullet points, or any product page enrichment for a Gobeaute brand product.
---

# PDP Content — Enriquecimento de Páginas de Produto

Skill especializada em gerar os 7 formatos de conteúdo de PDP das marcas Gobeaute.

## 🎯 Quando esta skill ativa

- Usuário pede conteúdo de página de produto
- Orchestrator delega depois de identificar intent=PDP
- Formatos: descrição, composição, modo de uso, bullets, ícones, antes/depois, FAQ, como usar, ingredientes

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

Identifique qual reference carregar:

| Formato pedido | Reference |
|---|---|
| Descrição, Composição, Modo de uso | `references/format-descricao.md` |
| Descrição curta + Bullets | `references/format-bullets.md` |
| Ícones de benefício | `references/format-icones.md` |
| Antes/Depois | `references/format-antes-depois.md` |
| FAQ | `references/format-faq.md` |
| Como Usar | `references/format-como-usar.md` |
| Ingredientes | `references/format-ingredientes.md` |

Carregue também:
- `references/output-paths.md` (estrutura de pastas)
- `references/output-formats.md` (MD/JSON/Liquid)

### Etapa 4 — Gerar conteúdo

Siga rigorosamente o reference carregado. Aplique:
- Tom de voz da marca (do bundle)
- Compliance ANVISA (consultar `brand-context/_shared/compliance-anvisa.md`)
- Validação de claims (sem fonte → `[VALIDAR]`)

### Etapa 5 — Se formato precisa imagem → piapp-image-gen

Formatos com imagem: `icones`, `antes-depois` (variante A), `como-usar`, `ingredientes`.

Delegar pra `piapp-image-gen` passando:
- `purpose`: `pdp-icon` / `pdp-before` / `pdp-after` / `pdp-how-to-use` / `pdp-ingredient`
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

Metafields disponíveis (use exatamente estes slugs em paths):
- `descricao`
- `composicao`
- `modo-de-uso`
- `descricao-curta` (bullets)
- `icones`
- `antes-depois`
- `faq`
- `como-usar`
- `ingredientes`

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
- Ambiguidade entre Modo de Uso (texto simples) e Como Usar (rica com imagem)
- Se Antes/Depois é variante A (visual) ou B (números)
- Para ícones: paleta + estilo (linha/flat/3D)
- Para ingredientes: quais 3-6 destacar
- Para FAQ: se tem perguntas reais do SAC pra usar

## 📚 References disponíveis

- `references/format-descricao.md`
- `references/format-bullets.md`
- `references/format-icones.md`
- `references/format-antes-depois.md`
- `references/format-faq.md`
- `references/format-como-usar.md`
- `references/format-ingredientes.md`
- `references/output-paths.md`
- `references/output-formats.md`

## 🎯 SEO técnico

> 🚨 Seguir o playbook completo em **`../blog-content/references/seo-playbook.md`** — adaptado pra PDP:
> - `<h1>` único = nome do produto (vem do `product.title`, não duplicar no body)
> - Hierarquia H2 → H3 nas seções (descrição → benefícios → como usar → ingredientes → FAQ)
> - **Product schema JSON-LD** em vez de BlogPosting (já gerado pelo Shopify, mas se o tema não emitir, injetar inline com `name`, `image`, `description`, `brand`, `offers`, `aggregateRating` quando houver reviews)
> - **FAQPage schema** quando incluir seção FAQ (Google mostra rich snippet)
> - Alt text descritivo nas imagens do PDP (especialmente `como-usar` e `ingredientes`)
> - Internal linking pra blog posts educativos relacionados ao produto
> - Fonte body ≥18px, CTAs (Add to Cart já é tratado pelo tema) com tap target ≥48px
