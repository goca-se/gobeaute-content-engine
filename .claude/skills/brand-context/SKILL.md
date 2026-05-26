---
name: brand-context
description: Central source-of-truth consultor for Gobeaute brand context. Use this skill whenever ANY content generation needs brand voice, product data, collection data, compliance rules, or visual identity for one of the 7 Gobeaute brands (Ápice, Barbour's, Rituária, Lescent, Kokeshi, By Samia, Auá). Reads brandbook.md, produtos.csv, individual product/collection .md files, and validates against ANVISA compliance rules. Returns a structured context bundle for other content skills (pdp-content, collection-content, blog-content, component-content, piapp-image-gen) to consume. NEVER generates final content — only consults and consolidates. Triggers on phrases like "consulta a marca X", "qual o tom de voz de Y", "lista produtos da [marca]", "ficha do produto Z", or as an internal call from other content skills.
---

# Brand-Context — Consultoria Central

Skill consultora (não geradora). Lê fontes oficiais do Gobeaute e retorna contexto consolidado.

## 🎯 Quando esta skill ativa

- Outra skill precisa de contexto de marca antes de gerar conteúdo
- Usuário pergunta diretamente sobre uma marca/produto ("qual o tom de voz da Ápice?", "lista produtos da Auá")
- Validação de slugs/paths antes de gerar conteúdo

## 📚 Fontes que esta skill consulta

```
brand-context/
├── _shared/
│   ├── compliance-anvisa.md       # Regras gerais ANVISA
│   └── piapp-style-presets.md     # Presets visuais por marca
├── [marca]/
│   ├── brandbook.md               # Tom de voz, DNA visual
│   ├── produtos.csv               # CSV índice de produtos
│   ├── produtos/[slug].md         # Ficha detalhada do produto
│   ├── collections.csv            # CSV índice de collections
│   ├── collections/[slug].md      # Ficha detalhada da collection
│   ├── blog-themes.md             # Temas autorizados pra blog
│   └── visual-references/         # Assets visuais (logos, paleta)
```

## 🚦 Workflow

### Fluxo 1 — Consulta de marca (sem entidade específica)

Input: `marca=apice`

1. Verificar se `brand-context/apice/brandbook.md` existe
   - Se não → **PERGUNTAR** ao usuário: "Brandbook da Ápice não encontrado. Quer (a) popular agora, (b) prosseguir com placeholders, ou (c) abortar?"
2. Ler `brandbook.md`
3. Ler `_shared/compliance-anvisa.md`
4. Ler `_shared/piapp-style-presets.md` (seção da marca)
5. Retornar bundle:

```yaml
brand:
  slug: apice
  name: Ápice
  brandbook_path: brand-context/apice/brandbook.md
  voice:
    tone: [adjetivos]
    vocabulary_key: [palavras]
    vocabulary_banned: [palavras]
  visual_dna: "..."
  palette:
    primary: "#XXXXXX"
    secondary: "#XXXXXX"
    accent: "#XXXXXX"
  piapp_preset: "..."             # do piapp-style-presets.md
compliance:
  general_rules: brand-context/_shared/compliance-anvisa.md
  brand_specific: [...]
```

### Fluxo 2 — Consulta de produto

Input: `marca=apice, produto=condicionador-nutri-waves-500ml`

1. Executar Fluxo 1 (carregar marca)
2. Ler `brand-context/apice/produtos.csv`
3. **Validar slug**: o slug `condicionador-nutri-waves-500ml` existe no CSV?
   - Se não → **PERGUNTAR**: "Produto não encontrado no CSV. Quer (a) ver lista de produtos disponíveis, (b) adicionar este produto ao CSV, ou (c) prosseguir sem ficha detalhada?"
4. Buscar linha do produto → obter caminho do `.md`
5. Ler `brand-context/apice/produtos/condicionador-nutri-waves-500ml.md`
6. Retornar bundle estendido com seção `product:`

```yaml
brand: {...}                       # do Fluxo 1
product:
  slug: condicionador-nutri-waves-500ml
  name: Condicionador Nutri Waves 500ml
  line: Nutri
  category: hair
  detail_path: brand-context/apice/produtos/condicionador-nutri-waves-500ml.md
  composition:
    highlighted: [...]
    full_inci: "..."
  claims_approved: [...]
  benefits: [...]
  modo_de_uso: "..."
compliance_flags: [...]
```

### Fluxo 3 — Consulta de collection

Input: `marca=apice, collection=linha-cachos`

Análogo ao Fluxo 2, mas lendo `collections.csv` e `collections/[slug].md`.

### Fluxo 4 — Listagem

Input: `marca=apice, listar=produtos` (ou `collections`)

1. Ler `produtos.csv` (ou `collections.csv`)
2. Retornar lista formatada com slug, nome, linha, status

## 🚨 Guardrails

- ❌ **Nunca gerar conteúdo final** — só consultar
- ❌ **Nunca inventar dados** se fonte não existe → perguntar
- ❌ **Nunca prosseguir com brandbook vazio** sem confirmação explícita
- ✅ **Sempre validar slug** no CSV antes de tentar ler `.md`
- ✅ **Sempre retornar bundle estruturado** (não texto livre)
- ✅ **Sempre incluir compliance** no bundle

## 📋 Validação macro (sem schema rígido)

Antes de retornar bundle, validar:

1. **Slug está em lowercase, sem acento, kebab-case?**
   - `condicionador-nutri-waves-500ml` ✅
   - `Condicionador Nutri Waves` ❌
2. **Caminhos relativos batem?**
   - `brand-context/[marca]/produtos/[slug].md` deve existir se referenciado no CSV
3. **CSV tem header correto?**
   - Mínimo: `slug, name, detail_md`

Se algo falhar → **PERGUNTAR** ao usuário antes de prosseguir.

## 📚 References

- `references/csv-schema.md` — estrutura esperada do CSV
- `references/brand-voice-base.md` — tom de voz padrão das 7 marcas (fallback)
- `references/consult-workflow.md` — detalhes de cada fluxo
