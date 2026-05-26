---
name: orchestrator
description: Main router for Gobeaute content generation requests. Detects intent (PDP, collection, blog, component) and brand, then delegates to the appropriate specialized skill. Always consults brand-context skill first to load brand voice, product data, and compliance rules. Use this skill when the user asks for ANY content generation related to Gobeaute brands (Ápice, Barbour's, Rituária, Lescent, Kokeshi, By Samia, Auá) — product descriptions, FAQs, collection banners, blog posts, homepage components, ingredient sections, before/after content, how-to-use sections, or any beauty/cosmetic e-commerce content. Triggers on phrases like "gera conteúdo de [tipo]", "cria PDP", "monta blog", "preciso de banner pra collection", "enriquece produto", or any mention of content creation for a Gobeaute brand.
---

# Orchestrator — Gobeaute Content Engine

Skill mãe que recebe qualquer pedido de geração de conteúdo das marcas Gobeaute e delega pra skill especialista correta.

## 🎯 Quando esta skill ativa

Qualquer pedido que envolva criação/enriquecimento de conteúdo pra:
- PDP (Product Detail Page) — descrição, FAQ, ingredientes, etc.
- Collections — hero banner, descrição, SEO
- Blogs — artigos completos com imagens
- Components — banners de home, depoimentos, USPs, etc.

E que mencione (ou implicite) uma das 7 marcas: **Ápice, Barbour's, Rituária, Lescent, Kokeshi, By Samia, Auá**.

## 🚦 Workflow de roteamento

### Etapa 1 — Detectar intent

Identifique qual TIPO de conteúdo o usuário quer:

| Sinais no pedido | Skill a delegar |
|---|---|
| "FAQ", "descrição", "ingredientes", "antes/depois", "modo de uso", "ícones", "bullets", "PDP" | `pdp-content` |
| "collection", "coleção", "categoria", "hero banner", "linha de produtos" | `collection-content` |
| "blog", "artigo", "post", "matéria" | `blog-content` |
| "home", "banner", "depoimento", "componente", "USP", "newsletter CTA" | `component-content` |

**Se ambíguo → PERGUNTAR ao usuário:**
> "Você quer conteúdo de: PDP, Collection, Blog, ou Componente do site?"

### Etapa 2 — Detectar marca

Identifique a marca mencionada. Slugs aceitos:
- `apice` (Ápice)
- `barbours` (Barbour's)
- `rituaria` (Rituária)
- `lescent` (Lescent)
- `kokeshi` (Kokeshi)
- `bysamia` (By Samia)
- `aua` (Auá)

**Se marca não foi mencionada → PERGUNTAR.** Não assuma.

### Etapa 3 — Detectar entidade

Conforme o tipo:
- **PDP** → produto específico (nome ou slug)
- **Collection** → coleção específica (nome ou slug)
- **Blog** → tema do post + título (se já existir)
- **Component** → qual área (home/checkout/etc.) + qual componente

**Se entidade não estiver clara → PERGUNTAR**, oferecendo:
- "Quer que eu liste os produtos disponíveis da [marca]?" (consultar `brand-context/[marca]/produtos.csv`)
- "Posso listar as collections existentes?"

### Etapa 4 — Consultar brand-context (OBRIGATÓRIO)

ANTES de delegar pra skill especialista, **sempre invoque mentalmente** a skill `brand-context` pra obter:
- Tom de voz da marca
- Ficha do produto/collection (se aplicável)
- Compliance flags
- DNA visual (pra imagens)

Se `brand-context/[marca]/brandbook.md` não existir ou estiver vazio → **PERGUNTAR** ao usuário se quer:
1. Popular o brandbook agora
2. Prosseguir com placeholders `[VALIDAR]`
3. Abortar

### Etapa 5 — Delegar

Acione a skill especialista passando o **context bundle** consolidado:

```yaml
brand:
  slug: apice
  name: Ápice
  brandbook_path: brand-context/apice/brandbook.md
  visual_dna: "..."
  palette: {...}
entity:
  type: product  # ou collection, blog, component
  slug: condicionador-nutri-waves-500ml
  detail_path: brand-context/apice/produtos/condicionador-nutri-waves-500ml.md
output_format:
  - markdown
  - json
output_paths:
  base: conteudos/apice/produtos/condicionador-nutri-waves-500ml/
```

## 🚨 Guardrails

- ❌ **Nunca gere conteúdo diretamente** — sempre delegue
- ❌ **Nunca pule consulta a brand-context**
- ❌ **Nunca assuma marca/produto/formato** — pergunte se ambíguo
- ✅ **Sempre confirme o entendimento** antes de delegar:
  > "Vou gerar [tipo] pra [marca] / [entidade]. Output em [formato]. Confirma?"

## 📚 Skills neste projeto

| Skill | Responsabilidade |
|---|---|
| `orchestrator` | (esta) Roteamento de pedidos |
| `brand-context` | Consultoria central de contexto de marca |
| `pdp-content` | Conteúdo de PDP (7 formatos) |
| `collection-content` | Conteúdo de coleções |
| `blog-content` | Blogs (texto + HTML + imagens) |
| `component-content` | Componentes do site |
| `piapp-image-gen` | Wrapper do MCP PiApp para imagens |

## 🤔 Quando perguntar

Sempre pergunte se faltar:
- Tipo de conteúdo (PDP/Collection/Blog/Component)
- Marca específica
- Entidade específica (qual produto, qual collection, qual tema)
- Formato de output (Markdown, JSON, Liquid, HTML)
- Brandbook não disponível
- Mais de 1 entidade match no contexto (qual delas?)

**Limite**: 3 perguntas por turno, no máximo.
