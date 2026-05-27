# Instruções pro Claude Code — Gobeaute Content Engine

## 🎯 O que é este projeto

Este repositório é o **engine de geração de conteúdo** das marcas Gobeaute. Contém 7 skills especializadas que geram conteúdo textual e visual pra PDPs, collections, blogs e componentes de site.

## 🧭 Como navegar

### Skills (em `.claude/skills/`)

Quando um usuário pedir conteúdo:
1. **orchestrator** vai rotear pro especialista certo
2. **brand-context** será consultado SEMPRE antes de gerar
3. Skill especialista (`pdp-content`, `collection-content`, `blog-content`, `component-content`) gera o texto
4. Se precisar imagem → delega pra `piapp-image-gen`

### Fontes de verdade (em `brand-context/`)

- `brand-context/[marca]/brandbook.md` — tom de voz, DNA visual, paleta
- `brand-context/[marca]/produtos.csv` — índice de produtos
- `brand-context/[marca]/produtos/[slug].md` — ficha detalhada
- `brand-context/[marca]/collections.csv` — índice de collections
- `brand-context/_shared/compliance-anvisa.md` — regras ANVISA

### Output (em `conteudos/`)

```
conteudos/[marca]/[tipo]/[entidade]/[formato]/{textos,imagens,prompts}/
```

Hierarquia:
- `produtos/[slug]/[metafield]/` — PDPs
- `collections/[slug]/` — collections
- `blogs/[slug]/` — blog posts
- `components/[area]/[componente]/` — componentes

## 🚨 Regras de comportamento INVIOLÁVEIS

### 🔒 #0 — Persistir local ANTES de qualquer mutation Shopify

**REGRA GLOBAL** que se aplica a TODA skill que toca Shopify (`blog-content`, `pdp-content`, `collection-content`, `component-content`, qualquer skill futura).

**NUNCA** chame mutation do Shopify (`articleCreate`, `articleUpdate`, `metaobjectCreate`, `metaobjectUpdate`, `metafieldsSet`, `productUpdate`, `collectionUpdate`, `fileCreate`, etc.) ANTES de ter salvo o conteúdo em `conteudos/[marca]/[tipo]/[entidade]/`.

**Ordem obrigatória** (sem exceção):
1. `Write` → `conteudos/[marca]/[tipo]/[entidade]/textos/*.{md,json}` (markdown + estruturado)
2. `Write` → `conteudos/[marca]/[tipo]/[entidade]/conteudo-html/*.html` (se a mutation manda HTML, ex: blog body)
3. `Write` → `conteudos/[marca]/[tipo]/[entidade]/textos/shopify-payload.json` (variables prontas pras mutations — útil pra replay)
4. **Só depois** dispare as mutations
5. Após sucesso: `Write` → `conteudos/[marca]/[tipo]/[entidade]/shopify-result.json` com IDs/GIDs + timestamp + handles

**Por quê é inviolável**:
- Shopify **não tem trash/restore** de articles, metaobjects ou metafields deletados
- O disco local em `conteudos/` é a ÚNICA cópia recuperável
- Em mai/2026 perdemos 12+ blogs da Kokeshi por refactor em batch que pulou esse passo

**Sub-agents (Agent tool)**: ao delegar trabalho que envolva Shopify, o prompt **DEVE** repetir essa ordem explicitamente. Não delegue "atualiza no Shopify" sem mandar "salva em `conteudos/` primeiro".

**Verificação obrigatória antes da mutation**: usar `Read`/`Glob` pra confirmar que `conteudos/[marca]/[tipo]/[entidade]/textos/` existe e está populado. Se não existe → STOP, salve antes.

Cada SKILL.md das skills de conteúdo carrega essa regra como REGRA INVIOLÁVEL #0 — leia lá pros paths específicos do tipo (blogs vs pdp vs collection).

### Quando faltar informação → PERGUNTAR

Se em qualquer ponto faltar:
- Marca
- Produto/Collection/Tema específico
- Formato de output desejado
- Brandbook populado
- Composição/INCI
- Fonte de claim

→ **PERGUNTAR ao usuário antes de gerar**. Nunca inventar.

Limite: 3 perguntas por turno, no máximo.

### Nunca alucinar

- ❌ Não inventar ingredientes, composição, claims
- ❌ Não inventar % de eficácia sem fonte
- ❌ Não misturar tom de voz entre marcas

### Sempre validar

- ✅ Slug em kebab-case lowercase
- ✅ Claim contra `compliance-anvisa.md`
- ✅ Marca está na lista oficial (7 marcas)
- ✅ Caminho de output segue a hierarquia padrão

### Antes de chamar PiApp MCP

- ✅ Sempre apresentar prompt completo pra aprovação
- ✅ Sempre fazer `check_credits` em batch ≥ 5
- ✅ Sempre salvar metadata + prompt junto da imagem

## 📚 Skills neste projeto

| Skill | Função |
|---|---|
| `orchestrator` | Roteia pedidos pra skill certa |
| `brand-context` | Consulta fontes oficiais (não gera) |
| `pdp-content` | Gera conteúdo de PDP (7 formatos) — *será criado no Prompt 2* |
| `collection-content` | Gera conteúdo de collection — *Prompt 3* |
| `blog-content` | Gera blogs (texto + HTML + imagens) — *Prompt 4* |
| `component-content` | Gera componentes (banners, etc.) — *Prompt 5* |
| `piapp-image-gen` | Gera imagens via MCP PiApp |

## 🛠️ Setup inicial (usuário humano faz)

1. Renomear `.mcp.json.example` → `.mcp.json` e preencher
2. Renomear `.env.example` → `.env` e preencher
3. Popular `brand-context/[marca]/brandbook.md` (copiar template)
4. Popular `brand-context/[marca]/produtos.csv` (copiar template)
5. Popular `brand-context/[marca]/produtos/[slug].md` por produto
6. Repetir pra outras marcas conforme necessário

## 🔄 Status do projeto

- [x] Prompt 1: Base + orchestrator + brand-context + piapp-image-gen
- [x] Prompt 2: pdp-content
- [x] Prompt 3: collection-content
- [x] Prompt 4: blog-content ← **ATUAL**
- [ ] Prompt 5: component-content
