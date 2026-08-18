---
name: collection-tags
description: Use when the user asks to fill, create or update collection tags/pills/chips for a Gobeaute brand collection — the Shopify collection metafield custom.tags_collection backed by the collection_tags metaobject (label + tags list + text/background colors). Triggers on "tags da collection", "pills da collection", "chips de navegação", "preenche tags_collection", "collection tags", or when collection-content/orchestrator detect a tags request for a collection.
---

# Collection Tags — Pills de navegação da collection

Preenche o metafield de collection **`custom.tags_collection`** (referência única a um metaobject **`collection_tags`**) que o tema Goshop renderiza como grupo de pills/chips no topo da página de collection: um título de grupo (`label`) + lista de tags, com cor de texto e cor de fundo configuráveis.

> 🔒 **REGRA INVIOLÁVEL #0 — PERSISTIR LOCAL ANTES DE QUALQUER MUTATION SHOPIFY.**
>
> **NUNCA** chame `metaobjectCreate`, `metaobjectUpdate`, `metafieldsSet` ou qualquer mutation ANTES de salvar em `conteudos/[marca]/collections/[collection-slug]/`.
>
> **Ordem obrigatória** (sem exceção):
> 1. `Write` → `conteudos/[marca]/collections/[slug]/textos/tags.json` (conteúdo estruturado + racional de cor)
> 2. `Write` → `conteudos/[marca]/collections/[slug]/textos/shopify-payload-tags.json` (variables prontas pras mutations — replay)
> 3. **Só depois** disparar as mutations
> 4. Após sucesso: `Write` → `conteudos/[marca]/collections/[slug]/shopify-result-tags.json` com GIDs + timestamp
>
> **Verificação obrigatória antes da mutation**: `Read`/`Glob` confirma que os arquivos do passo 1-2 existem. Se não → STOP, salve antes.

## 🎯 Quando esta skill ativa

- Usuário pede tags/pills/chips pra uma collection de marca Gobeaute
- `orchestrator` ou `collection-content` delegam formato `tags`
- Batch: preencher tags de várias collections de uma marca

## 🚦 Workflow

### Etapa 1 — Confirmar marca + collection + loja

1. Marca e collection (handle/slug) definidos? Se não → PERGUNTAR.
2. `get-shop-info` no Shopify MCP: a loja conectada é a da marca pedida? Se não → `switch-shop` ou avisar o usuário. **Nunca** rodar mutation na loja errada.

### Etapa 2 — Carregar contexto (OBRIGATÓRIO, nesta ordem)

1. **brand-context**: `brand-context/[marca]/brandbook.md` → paleta de cores (seção Identidade visual), tom de voz; `collections.csv` / ficha da collection se existir. Se não existir ficha/CSV da collection, NÃO travar nem perguntar — o Shopify é a fonte de verdade do sortimento (passo 2).
2. **Shopify (fonte de verdade do sortimento)**: query da collection — título, `descriptionHtml`, e os primeiros ~20 produtos (título + tags de produto). As tags DEVEM ter lastro nos produtos reais.
3. **Schema da loja**: verificar que a definição do metaobject `collection_tags` e do metafield `custom.tags_collection` existem NESTA loja (GIDs variam por loja — ver `references/schema-shopify.md`). Se não existem → PERGUNTAR antes de criar definições.
4. **CHECK-BEFORE-CREATE**: query `metaobjects(type: "collection_tags")` + metafield atual da collection. Se a collection já tem tags → mostrar o atual e PERGUNTAR se substitui ou edita in-place.

### Etapa 3 — Gerar conteúdo (inteligência de tags)

**`label`** (título do grupo): o tema da collection em linguagem da marca — normalmente o próprio título da collection ou versão curta dele. Sentence case: só a primeira palavra maiúscula, rebaixando preposições/conjunções que o título Shopify capitalizou (ex: "Saúde Do Intestino" → "Saúde do intestino"; "Sono E Antiestresse" → "Sono e antiestresse"). 2-4 palavras.

**`tags`** (3 a 6 itens): sub-temas/sub-benefícios REAIS da collection, derivados dos produtos que estão nela. Regras:

- 1-3 palavras cada, Title Case pt-BR (ex: "Digestão", "Inchaço e Gases", "Imunidade Intestinal")
- Cada tag mapeia pra pelo menos 1 produto da collection — sem lastro, sem tag
- Mutuamente distintas (não repetir o mesmo benefício com sinônimos)
- Ordenadas da mais central ao tema da collection pra mais adjacente
- Tom de voz da marca (consultar brandbook)
- **Compliance ANVISA**: tags são rótulos de navegação, NUNCA claims terapêuticos.
  - ✅ "Digestão", "Regularidade Intestinal", "Uniformização", "Hidratação Profunda"
  - ❌ "Cura Gastrite", "Elimina Melasma", "Emagrece", "Trata Ansiedade"
  - Se o próprio tema da collection beira claim (ex: "Antiestresse", "Emagrecimento"), mapear pro conceito seguro equivalente ("Relaxamento", "Desinchaço") em vez de usá-lo como tag
  - Na dúvida, validar contra `brand-context/_shared/compliance-anvisa.md`

**Exemplo vivo (Rituária)**: collection `saude-do-intestino` → label "Saúde do intestino", tags `["Digestão", "Inchaço e Gases", "Imunidade Intestinal", "Regularidade Intestinal"]`.

### Etapa 4 — Decidir cores (inteligência de cor)

Seguir `references/color-intelligence.md`. Resumo do contrato:

1. `tag_background_color` vem da **paleta do brandbook**, escolhida por **match semântico** entre o tema da collection e a cor (ex: Rituária tem cor por fórmula/linha — collection de intestino → cor da linha Prebiótica).
2. `text_color` é decidido por **contraste WCAG calculado, nunca por intuição**: rodar o cálculo de luminância, texto ink escuro sobre pastéis, branco sobre cores profundas. Alvo ≥ 4.5:1 (piso absoluto 3:1 — abaixo disso, trocar o fundo).
3. Registrar o racional + ratio calculado no `tags.json`.

### Etapa 5 — Apresentar pra aprovação

Mostrar ao usuário ANTES das mutations: label, tags, cores (com ratio de contraste) e swatch textual (`■ #BC4869 + texto #FFFFFF — 4.92:1`). Ajustar conforme feedback.

### Etapa 6 — Salvar local + publicar

1. Salvar os 2 arquivos da REGRA #0.
2. Mutations conforme `references/schema-shopify.md`:
   - `metaobjectCreate` tipo `collection_tags` — **SEMPRE** com `capabilities: { publishable: { status: "ACTIVE" } }` (a definição é publishable; sem isso nasce DRAFT e **não renderiza** na loja)
   - `metafieldsSet` na collection: `custom.tags_collection`, tipo `metaobject_reference`, value = GID do metaobject
3. Salvar `shopify-result-tags.json`.

## 📁 Output

```
conteudos/[marca]/collections/[collection-slug]/
├── textos/
│   ├── tags.json                  # conteúdo + racional de cor + contraste
│   └── shopify-payload-tags.json  # variables prontas pras 2 mutations
└── shopify-result-tags.json       # GIDs + timestamp (pós-sucesso)
```

### `tags.json`

```json
{
  "metafield": "custom.tags_collection",
  "collection_handle": "saude-do-intestino",
  "value": {
    "label": "Saúde do intestino",
    "tags": ["Digestão", "Inchaço e Gases", "Imunidade Intestinal", "Regularidade Intestinal"],
    "tag_background_color": "#BC4869",
    "text_color": "#FFFFFF"
  },
  "color_rationale": {
    "background_source": "brandbook Rituária — linha Prebiótica (match semântico: intestino/prebióticos)",
    "text_candidates": { "#FFFFFF": 4.92, "#1C1C1C": 3.46 },
    "chosen_text": "#FFFFFF",
    "contrast_ratio": 4.92,
    "wcag": "AA"
  },
  "tag_grounding": {
    "Digestão": ["formula-prebiotica"],
    "Inchaço e Gases": ["formula-prebiotica", "4mag"]
  }
}
```

Campos extras informativos (`collection_gid`, `compliance_notes`, `check_before_create`) são bem-vindos — o schema acima é o mínimo, não o teto.

## 🚨 Guardrails

- ❌ Não inventar tag sem produto correspondente na collection
- ❌ Não usar claim terapêutico como tag (ANVISA)
- ❌ Não escolher `text_color` sem calcular contraste (o exemplo vivo em produção tem branco sobre `#C6BDC7` = 1.83:1 — ilegível; não replicar)
- ❌ Não usar cor fora da paleta do brandbook sem justificar (variações tint/shade da paleta são OK se documentadas)
- ❌ Não criar metaobject sem `publishable.status: ACTIVE`
- ❌ Não tocar `title`, `handle`, `descriptionHtml`, produtos ou outros metafields da collection
- ✅ Máximo 6 tags (pills quebram layout mobile acima disso)
- ✅ Handle do metaobject = slug da collection (ex: `saude-do-intestino`), não "teste"
- ✅ Se a marca não tem sistema cromático por linha, usar paleta secundária/institucional do brandbook

## 🤔 Quando perguntar

- Marca ou collection ausentes/ambíguas
- Definições de schema não existem na loja da marca (criar definitions é mudança estrutural)
- Collection já tem tags (substituir ou editar?)
- Brandbook sem paleta populada
- Collection sazonal/promocional (tags de campanha têm vida curta — confirmar intenção)

**Limite**: 3 perguntas por turno.

## 📚 References

| Arquivo | Conteúdo |
|---|---|
| `references/schema-shopify.md` | Schemas autoritativos, queries de verificação, mutations prontas |
| `references/color-intelligence.md` | Algoritmo de escolha de cor + contraste WCAG + exemplos por marca |
