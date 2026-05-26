# Gobeaute Content Engine

Engine de geração de conteúdo das marcas Gobeaute (Ápice, Barbour's, Rituária, Lescent, Kokeshi, By Samia, Auá), construído como conjunto de skills do Claude Code com integração ao MCP interno do PiApp pra geração de imagens.

## 🎯 O que faz

Gera com qualidade comercial, respeitando brandbook e compliance ANVISA:

- **PDP Content**: descrição, bullets, ícones de benefício, antes/depois, FAQ, como usar, ingredientes
- **Collection Content**: hero banner, descrição, SEO meta
- **Blog Content**: artigo completo + capa + ilustrativas + HTML pronto pra Shopify
- **Component Content**: home banners, depoimentos, USPs, newsletter CTA

## 🏗️ Arquitetura

```
┌────────────────────────────────────────────────┐
│  USUÁRIO                                       │
└────────────┬───────────────────────────────────┘
             │ "Cria FAQ pro produto X da Ápice"
             ▼
┌────────────────────────────────────────────────┐
│  ORCHESTRATOR (.claude/skills/orchestrator)    │
│  → Detecta intent, marca, entidade             │
│  → Delega pra skill especialista               │
└────────────┬───────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────┐
│  BRAND-CONTEXT (.claude/skills/brand-context)  │
│  → Lê brandbook + produtos.csv + ficha .md     │
│  → Valida compliance                            │
│  → Retorna context bundle                       │
└────────────┬───────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────┐
│  SKILL ESPECIALISTA                            │
│  (pdp-content / collection-content / etc.)     │
│  → Gera texto                                   │
│  → Se precisar imagem → piapp-image-gen        │
│  → Salva em conteudos/[marca]/[tipo]/[ent]/    │
└────────────────────────────────────────────────┘
                         │
                         ▼ (se imagem)
                  ┌──────────────────────┐
                  │ PIAPP-IMAGE-GEN      │
                  │ → Constrói prompt    │
                  │ → Confirma c/ user   │
                  │ → MCP PiApp call     │
                  │ → Polling + download │
                  └──────────────────────┘
```

## 📁 Estrutura

```
gobeaute-content-engine/
├── .claude/skills/         # Skills do Claude Code
├── brand-context/          # Source of truth (versionado)
│   ├── _shared/           # Compliance + presets compartilhados
│   ├── _templates/        # Templates para copiar
│   └── [marca]/           # 7 marcas
├── conteudos/             # Output gerado (não versionado)
├── .mcp.json.example      # Config do MCP PiApp
├── .env.example
└── CLAUDE.md              # Instruções pro Claude Code
```

## 🚦 Setup

### 1. Configurar MCP do PiApp

```bash
cp .mcp.json.example .mcp.json
# Editar .mcp.json com a config real do MCP PiApp Gobeaute
```

### 2. Configurar variáveis

```bash
cp .env.example .env
# Editar com PIAPP_API_KEY
```

### 3. Popular brand-context

Pra cada marca que vai usar:

```bash
mkdir -p brand-context/apice/{produtos,collections,visual-references}

# Copiar templates
cp brand-context/_templates/brandbook.md brand-context/apice/brandbook.md
cp brand-context/_templates/produtos.csv brand-context/apice/produtos.csv
cp brand-context/_templates/produto.md brand-context/apice/produtos/EXEMPLO-PRODUTO.md
cp brand-context/_templates/collection.md brand-context/apice/collections/EXEMPLO-COLLECTION.md

# Editar com dados reais da Ápice
```

### 4. Verificar skills carregadas

No Claude Code, rode:
```
/skills
```

Deve listar: orchestrator, brand-context, piapp-image-gen (+ pdp-content, collection-content, blog-content, component-content após prompts 2-5).

## 🚀 Como usar

Basta pedir no Claude Code:

```
"Gera FAQ pro Shampoo Cachos RA1000 da Ápice"
"Cria hero banner pra collection Linha Cachos da Auá"
"Escreve blog sobre cuidados com cachos no verão pra Ápice, com capa e 3 imagens"
"Faz banner intermediário pra home da Rituária com tema bem-estar"
```

O orchestrator vai:
1. Identificar o tipo de conteúdo
2. Consultar brand-context (perguntar se faltar info)
3. Delegar pra skill especialista
4. Salvar tudo em `conteudos/[marca]/[tipo]/[entidade]/`

## 🚨 Comportamento crítico

A skill **NUNCA alucina**:
- Se faltar marca → PERGUNTA
- Se faltar produto → PERGUNTA
- Se brandbook vazio → PERGUNTA
- Se claim sem fonte → marca como `[VALIDAR]`
- Se termo proibido por ANVISA → substitui ou flagra `[REGULATÓRIO]`

E **NUNCA gera imagem sem aprovação** — mostra prompt completo antes.

## 🔄 Status de construção

Este repositório é construído em 5 prompts encadeados pro Claude Code:

- [x] **Prompt 1**: Base + orchestrator + brand-context + piapp-image-gen
- [x] **Prompt 2**: pdp-content (7 formatos de PDP)
- [x] **Prompt 3**: collection-content
- [x] **Prompt 4**: blog-content
- [ ] **Prompt 5**: component-content

Para continuar, execute os prompts seguintes na mesma pasta.

## 📚 Documentação

- `CLAUDE.md` — instruções pro Claude Code
- `.claude/skills/orchestrator/SKILL.md` — fluxo de roteamento
- `.claude/skills/brand-context/SKILL.md` — fluxo de consulta
- `.claude/skills/piapp-image-gen/SKILL.md` — integração PiApp

## 📝 Versão

v1.0 — Prompt 1 de 5
