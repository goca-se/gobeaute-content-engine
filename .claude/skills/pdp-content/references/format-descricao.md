# Formato: Descrição / Composição / Modo de uso

3 metafields textuais. **PERGUNTAR ao usuário** qual ele quer (um, dois ou os três).

## Inputs necessários

- ✅ Marca confirmada (vem do bundle)
- ✅ Produto identificado (vem do bundle)
- ✅ Composição/INCI disponível (pra Composição)
- ✅ Modo de uso oficial (pra Modo de uso)
- ✅ Tom de voz da marca (vem do bundle)

Se faltar algo → PERGUNTAR.

---

## 1. Descrição

Texto corrido, 1-3 parágrafos curtos, comercial mas honesto.

### Estrutura

- **Parágrafo 1**: Promessa principal + ativo/diferencial chave
- **Parágrafo 2**: Para quem é + quando usar
- **Parágrafo 3** (opcional): Sensorial + complemento da rotina

### Tamanho

- Mínimo: ~60 palavras
- Ideal: 80-150 palavras
- Máximo: 200 palavras

### Guardrails

- ❌ Não incluir % de ativos sem fonte
- ❌ Não citar prêmios/certificações sem confirmação
- ❌ Não comparar com concorrentes diretos
- ✅ Tom de voz da marca
- ✅ Compliance ANVISA

### Output JSON

```json
{
  "metafield_key": "descricao",
  "value": "Texto da descrição aqui..."
}
```

---

## 2. Composição

**FACTUAL — não inventar.**

### Formato A — INCI puro

```
AQUA, SODIUM LAURETH SULFATE, COCAMIDOPROPYL BETAINE, [...]
```

### Formato B — Comercial (storytelling + INCI)

```markdown
**Ativos em destaque:**
- **Óleo de Murumuru** — nutrição profunda
- **Manteiga de Karité** — hidratação selada
- **Pantenol** — força e maciez

**INCI completo:**
AQUA, SODIUM LAURETH SULFATE, [...]
```

### Guardrails

- 🚨 NUNCA inventar INCI — se não tiver, PERGUNTAR
- 🚨 Se INCI fornecido tiver typo óbvio, sinalizar mas não corrigir sem confirmação
- ✅ Validar que ativos destacados estão na lista INCI completa

### Output JSON

```json
{
  "metafield_key": "composicao",
  "value": {
    "format": "comercial",
    "highlighted": [
      { "name": "Óleo de Murumuru", "benefit": "nutrição profunda" }
    ],
    "inci_full": "AQUA, [...]"
  }
}
```

---

## 3. Modo de uso

Texto corrido OU bullets curtos. Coexiste com "Como Usar" (que é mais rico visualmente).

### Estrutura

- 1 frase de contexto (quando/onde aplicar)
- 2-4 passos
- 1 frase de frequência

### Exemplo (Ápice — Shampoo)

> Aplique nos cabelos molhados, massageando suavemente o couro cabeludo. Enxágue completamente. Repita se necessário. Em seguida, finalize com o Condicionador Cachos Ápice.
>
> **Frequência:** 2-3x por semana ou conforme sua rotina.

### Guardrails

- ✅ Validar que produtos complementares citados existem na linha
- ✅ Frequência só com indicação técnica clara
- ❌ Não prometer "resultado em X usos" sem teste

### Output JSON

```json
{
  "metafield_key": "modo-de-uso",
  "value": "Texto do modo de uso..."
}
```

---

## 📁 Output esperado

Salvar separadamente em:
```
conteudos/[marca]/produtos/[slug]/descricao/textos/
conteudos/[marca]/produtos/[slug]/composicao/textos/
conteudos/[marca]/produtos/[slug]/modo-de-uso/textos/
```

## ✅ Checklist

- [ ] Tom de voz alinhado com brandbook?
- [ ] Sem termos proibidos ANVISA?
- [ ] Sem números/claims sem fonte?
- [ ] Composição não inventada?
- [ ] Tamanho adequado?

---

## 🔌 Publicação no Shopify — 3 rich_text metafields

> Este formato cobre **3 metafields rich_text separados** no produto. Cada um é independente — não tem metaobjeto. Use `metafieldsSet` direto.

### Esquemas (autoritativos)

| Campo editorial | Metafield Shopify | Label no admin | Tipo |
|---|---|---|---|
| Composição (INCI) | `custom.caracteristicas` | `[Info] Composição` | `rich_text_field` |
| Modo de uso | `custom.how_to_use` | `[Info] Modo de uso` | `rich_text_field` |
| Precauções / advertências | `custom.como_usar` | `Precauções` (legado, nome confuso) | `rich_text_field` |

> ⚠️ **Não confundir** `custom.como_usar` (rich_text com precauções) com `custom.como_usar_session_pdp` (`[Section] Como usar` — esse é o de passos+imagem, ver `format-como-usar.md`).

### Workflow

1. Salvar texto em markdown em `conteudos/[marca]/produtos/[slug]/composicao/textos/content.md` (e equivalentes pra `modo-de-uso/` e `precaucoes/`)
2. Converter cada texto pra **Rich Text JSON** (`{"type":"root","children":[{"type":"paragraph","children":[{"type":"text","value":"..."}]}]}`)
3. `metafieldsSet` num único shot pros 3:

```graphql
mutation SetDescricao($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields { id namespace key type }
    userErrors { field message code }
  }
}
```

Variables:
```json
{
  "metafields": [
    { "ownerId": "<PRODUCT_GID>", "namespace": "custom", "key": "caracteristicas", "type": "rich_text_field", "value": "<RICH_TEXT_JSON_COMPOSICAO>" },
    { "ownerId": "<PRODUCT_GID>", "namespace": "custom", "key": "how_to_use",      "type": "rich_text_field", "value": "<RICH_TEXT_JSON_USO>" },
    { "ownerId": "<PRODUCT_GID>", "namespace": "custom", "key": "como_usar",       "type": "rich_text_field", "value": "<RICH_TEXT_JSON_PRECAUCOES>" }
  ]
}
```

### 🔒 Safety
- ✅ Tocar apenas os 3 metafields do produto pedido
- ❌ Nunca tocar `description` (campo nativo do produto) — é controlado em outro lugar
- ✅ Composição vem do INCI oficial — nunca inventar
- ✅ Precauções seguem ANVISA — "em caso de irritação, suspender o uso", "manter longe do alcance de crianças", etc.
