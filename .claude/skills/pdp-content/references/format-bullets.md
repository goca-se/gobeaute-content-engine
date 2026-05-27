# Formato: Descrição Curta + Bullet Points

Metafield resumido. Primeira coisa que o usuário lê. Escaneável.

## Inputs necessários

- ✅ Marca + produto confirmados
- ✅ 5 principais benefícios (PERGUNTAR se não estiver claro)
- ✅ Tom de voz

---

## 📐 Estrutura

### Bloco 1 — Short description (1-2 frases)

Frase de impacto que vende em 5 segundos.
- 1 frase de ~10-15 palavras OU 2 frases curtas (~25-30 palavras total)

### Bloco 2 — Bullet points (máximo 5)

Padrão: **palavra-âncora em negrito** + complemento curto.

### Exemplo (Ápice — Shampoo Cachos)

> Shampoo de limpeza suave que define e hidrata cachos sem ressecar. Para fios livres, leves e marcados.

- **Definição duradoura** — cachos marcados por mais tempo
- **Hidratação profunda** — fios macios sem efeito pesado
- **Limpeza suave** — não agride o couro cabeludo
- **Vegano e cruelty-free** — sem ingredientes de origem animal
- **Fragrância marcante** — perfume que fica no cabelo

---

## 🚨 Guardrails

- ❌ Bullets genéricos ("qualidade premium") sem âncora concreta
- ❌ Repetir ideia em bullets diferentes
- ❌ Mais de 5 bullets
- ❌ Bullets longos (>15 palavras)
- ✅ 1 bullet = 1 dimensão única
- ✅ Validar claims com compliance-anvisa.md

---

## 🎯 Bullets-âncora por categoria

- **Hair Care**: Definição / Hidratação / Brilho / Frizz / Volume / Textura / Vegano / Sem sulfato
- **Skincare**: Hidratação / Glow / Textura / Absorção / Sensorial / Dermatologicamente testado
- **Suplementos**: Bem-estar / Equilíbrio / Origem natural / Sem alérgenos / Sabor
- **Fragrâncias**: Fixação / Projeção / Notas / Ocasião

---

## 📁 Output

```
conteudos/[marca]/produtos/[slug]/descricao-curta/textos/
├── content.md
└── content.json
```

### JSON

```json
{
  "metafield_key": "descricao-curta",
  "value": {
    "short_description": "Shampoo de limpeza suave que define e hidrata cachos sem ressecar.",
    "bullets": [
      { "anchor": "Definição duradoura", "text": "cachos marcados por mais tempo" },
      { "anchor": "Hidratação profunda", "text": "fios macios sem efeito pesado" },
      { "anchor": "Limpeza suave", "text": "não agride o couro cabeludo" },
      { "anchor": "Vegano e cruelty-free", "text": "sem ingredientes de origem animal" },
      { "anchor": "Fragrância marcante", "text": "perfume que fica no cabelo" }
    ]
  }
}
```

## ✅ Checklist

- [ ] Short description vende em 5 segundos?
- [ ] Cada bullet aborda dimensão única?
- [ ] Máximo de 5 bullets?
- [ ] Compliance ANVISA?
- [ ] Tom de voz da marca?

---

## 🔌 Publicação no Shopify — metaobjeto `product_benefit` + metafield `custom.product_info_benefits`

> O tema da loja consome este formato via metafield de produto **`custom.product_info_benefits`** (label visível: `[Info] Descrição curta + bullet points`). Tipo `metaobject_reference` (**singular** — UM metaobjeto por produto) que aponta pra um metaobjeto do tipo **`product_benefit`**.

### Esquemas (autoritativos)

**Metafield definition** (no produto):
```yaml
namespace: custom
key: product_info_benefits
name: "[Info] Descrição curta + bullet points"
type: metaobject_reference
metaobject_definition_id: gid://shopify/MetaobjectDefinition/4836294863
```

**Metaobject definition** `product_benefit`:
```yaml
type: product_benefit
display_name_key: beneficios
fields:
  - key: descricao         # rich_text — descrição curta editorial
    type: rich_text_field
  - key: titulo_destacado  # rich_text — título com destaque visual (ex: "POROS MINIMIZADOS")
    type: rich_text_field
  - key: beneficios        # list.single_line_text — os 5 bullets
    type: list.single_line_text_field
  - key: cor_bullet_point  # 🚫 DEIXAR VAZIO ("") — emoji no texto substitui
    type: color
```

### 🚫 Convenção Goshop (estabelecida 2026-05-27)

**NÃO usar `cor_bullet_point`** — sempre passar `value: ""` no campo. A diferenciação visual deve vir de **emoji semântico no início de cada item** da lista `beneficios`.

**Por quê**: bullets só com cor genérica viram ruído visual; emojis específicos comunicam o benefício imediatamente + alinham com a estética kawaii POP Kokeshi.

**Mapa de emojis sugeridos**:

| Tipo de benefício | Emoji |
|---|---|
| Hidratação / água | 💧 |
| Regeneração / cicatrização | 🌹 ou 🔄 |
| Anti-idade / firmeza | 💪 ou 💎 |
| Glow / luminosidade | ✨ |
| Refrescância / mentol | ❄️ |
| Pele oleosa / controle | 🌸 |
| Antioxidante / natural | 🌿 |
| Olhos | 👁️ |
| Vegano / planta | 🌱 |
| Cruelty-free | 🐰 |
| Ritual K-beauty | 👘 |
| Composição / kit | 💎 |

Exemplo correto:
```json
{
  "beneficios": [
    "💧 Hidratação intensa enquanto você dorme",
    "✨ Suaviza manchas e linhas de expressão",
    "🌸 Para todos os tipos de pele",
    "💎 Inspirado nos rituais asiáticos"
  ],
  "cor_bullet_point": ""
}
```

### Workflow (3 passos)

1. Salvar local em `conteudos/[marca]/produtos/[slug]/descricao-curta/textos/content.json`
2. Criar metaobjeto:

```graphql
mutation CreateBenefits($metaobject: MetaobjectCreateInput!) {
  metaobjectCreate(metaobject: $metaobject) {
    metaobject { id handle }
    userErrors { field message code }
  }
}
```

Variables:
```json
{
  "metaobject": {
    "type": "product_benefit",
    "handle": "<slug-do-produto>-benefits",
    "fields": [
      { "key": "descricao", "value": "{\"type\":\"root\",\"children\":[{\"type\":\"paragraph\",\"children\":[{\"type\":\"text\",\"value\":\"Descrição curta editorial de 1-2 frases\"}]}]}" },
      { "key": "titulo_destacado", "value": "{\"type\":\"root\",\"children\":[{\"type\":\"paragraph\",\"children\":[{\"type\":\"text\",\"value\":\"PELE DE PORCELANA\",\"bold\":true}]}]}" },
      { "key": "beneficios", "value": "[\"Hidratação profunda\",\"Uniformização do tom\",\"Efeito glass-skin\",\"Não-comedogênico\",\"Vegano\"]" },
      { "key": "cor_bullet_point", "value": "" }
    ]
  }
}
```

> ⚠️ `beneficios` é `list.single_line_text_field` — value precisa ser string JSON de array. `descricao` e `titulo_destacado` são `rich_text_field` — value precisa ser string JSON Rich Text.

3. Anexar ao produto via `metafieldsSet`:

```json
{
  "metafields": [{
    "ownerId": "<PRODUCT_GID>",
    "namespace": "custom",
    "key": "product_info_benefits",
    "type": "metaobject_reference",
    "value": "<METAOBJECT_GID>"
  }]
}
```

### 🔒 Safety
- ✅ Tocar apenas `custom.product_info_benefits` do produto pedido
- ❌ Não tocar `custom.benefits` (esse é outro metafield, rich_text de benefícios longos)
- ✅ Se já existe metaobjeto linkado: `metaobjectUpdate` no GID existente (preserva histórico) OU substituir com novo GID
- ✅ Cor do bullet point deve estar dentro da paleta da marca (consultar brand-context)
