# Workflow de Consulta — Brand-Context

## Quando outra skill chama brand-context

Outras skills do projeto (orchestrator, pdp-content, collection-content, blog-content, component-content) sempre **consultam brand-context PRIMEIRO** antes de gerar conteúdo.

A consulta é mental (Claude carrega os arquivos lendo-os via `view` tool) e segue este protocolo:

## Protocolo de consulta

```
1. Receber inputs: marca (obrigatório) + entidade opcional (produto/collection)
2. Validar slug da marca (deve estar em: apice, barbours, rituaria, lescent, kokeshi, bysamia, aua)
3. Tentar ler brand-context/[marca]/brandbook.md
   - Se vazio/inexistente → PERGUNTAR ao usuário (fluxo abaixo)
4. Se entidade fornecida → ler CSV correspondente + .md detalhe
   - Se slug não existe → PERGUNTAR
5. Carregar _shared/compliance-anvisa.md
6. Carregar _shared/piapp-style-presets.md (seção da marca)
7. Montar context bundle
8. Retornar bundle pra skill chamadora
```

## Fluxo de pergunta quando brandbook está vazio

```
Brand-context detecta: brand-context/apice/brandbook.md NÃO existe ou está com placeholders

→ Brand-context pergunta:
   "O brandbook da Ápice não está populado. Como prosseguir?
    (a) Você cola o conteúdo do brandbook agora
    (b) Prosseguir com tom de voz base (de references/brand-voice-base.md) + flag [VALIDAR]
    (c) Abortar e popular depois"

→ Aguarda resposta do usuário antes de retornar bundle
```

## Fluxo de pergunta quando produto não existe no CSV

```
Brand-context detecta: slug 'shampoo-xyz' NÃO está em apice/produtos.csv

→ Brand-context pergunta:
   "Não encontrei 'shampoo-xyz' no CSV de produtos da Ápice. Como prosseguir?
    (a) Quero ver a lista de produtos disponíveis
    (b) Adicionar 'shampoo-xyz' ao CSV agora (vou pedir os dados)
    (c) Prosseguir sem ficha detalhada (só com brandbook + placeholders)"
```

## Context bundle final (output sempre neste formato)

```yaml
status: ok | needs_user_input | error
brand:
  slug: apice
  name: Ápice
  brandbook_path: brand-context/apice/brandbook.md
  voice:
    tone: [...]
    vocabulary_key: [...]
    vocabulary_banned: [...]
  visual_dna: "..."
  palette: {...}
  piapp_preset: "..."
product:                                 # se aplicável
  slug: ...
  name: ...
  detail_path: ...
  composition: {...}
  claims_approved: [...]
  benefits: [...]
collection:                              # se aplicável
  slug: ...
  name: ...
  detail_path: ...
compliance:
  general_rules_path: brand-context/_shared/compliance-anvisa.md
  brand_specific_flags: [...]
warnings: []                             # se houver missing data
```
