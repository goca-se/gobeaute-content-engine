# Formato: FAQ

**Exatamente 6 perguntas + respostas.** Texto puro, sem imagem. Reduz dúvidas de pré-compra → impacto direto em CVR.

## Inputs necessários

- ✅ Marca + produto confirmados
- ✅ Composição/INCI (pra perguntas de ingredientes)
- ✅ Categoria (hair/skin/suplemento/fragrância)
- ✅ Modo de uso oficial
- ✅ Compatibilidades

---

## 📐 Estrutura

**Exatamente 6 pares Q&A.** Regra de produto Gobeaute.

- **Pergunta**: 1 linha, primeira pessoa do usuário
- **Resposta**: 2-4 linhas, direta, honesta

---

## 🎯 Perguntas-âncora obrigatórias

Cobrir **pelo menos 4 destas categorias** (sem repetir nenhuma):

| # | Categoria | Exemplo |
|---|---|---|
| 1 | Adequação | "Serve pro meu tipo de cabelo/pele?" |
| 2 | Modo de uso / frequência | "Posso usar todo dia?" |
| 3 | Resultados / expectativa | "Em quanto tempo vejo resultado?" |
| 4 | Composição / restrições | "É vegano? Tem sulfato?" |
| 5 | Compatibilidade | "Posso usar com produto X?" |
| 6 | Diferenciação | "Qual a diferença pra outro produto da linha?" |
| 7 | Segurança | "É seguro pra grávidas / crianças?" |
| 8 | Conservação | "Como conservo?" |
| 9 | Logística | "Demora pra chegar? Tem garantia?" |

> ⚠️ **Nunca repetir** categoria. Diversificar.

---

## ✅ Anatomia

### Pergunta
- ✅ "Esse shampoo serve pra cabelo cacheado tipo 4?"
- ❌ "Indicações de uso conforme tipologia capilar"
- 1 dúvida por pergunta
- Naturalidade (como o cliente perguntaria)

### Resposta
- 2-4 linhas
- Resposta direta primeiro, contexto depois
- Tom de voz da marca
- Sem termos proibidos ANVISA
- Honestidade ("não" com elegância se for não)

---

## 📝 Exemplo completo (Ápice — Shampoo Cachos)

```markdown
## Perguntas Frequentes

**1. Esse shampoo serve pra qualquer tipo de cacho?**
Sim! A fórmula é indicada pra todos os tipos de cabelos cacheados e crespos (do 2C ao 4C). Pode variar a frequência de uso conforme a porosidade do seu fio.

**2. Posso usar todos os dias?**
Recomendamos 2-3x por semana, alternando com Co-wash ou hidratação, pra preservar a oleosidade natural dos cachos.

**3. É vegano e cruelty-free?**
Sim, é vegano e não testado em animais. A fórmula não contém ingredientes de origem animal.

**4. Tem sulfato?**
Não. A fórmula é livre de sulfatos agressivos, com tensoativos suaves que limpam sem ressecar.

**5. Em quanto tempo vejo resultado?**
A maioria percebe definição e maciez já na primeira aplicação. Resultados de longo prazo aparecem com uso contínuo (4-6 semanas) em conjunto com a rotina completa Ápice.

**6. Posso usar com produtos de outras marcas?**
Sim, mas pra resultado máximo recomendamos usar com o Condicionador e Creme de Pentear da linha Cachos Ápice — foram formulados pra trabalharem em conjunto.
```

---

## 🚨 Guardrails

- ❌ Inventar resposta sobre composição sem INCI
- ❌ Criar pergunta sobre "anti-queda" sem teste
- ❌ Prometer "resultado em X dias" sem fonte
- ❌ Misturar 3 perguntas em 1
- ❌ Mais ou menos de 6 perguntas
- ✅ Validar claims com compliance-anvisa.md
- ✅ Marcar dados duvidosos com `[VALIDAR]`
- ✅ Pelo menos 1 pergunta de composição, 1 de adequação, 1 de uso

---

## 📁 Output

```
conteudos/[marca]/produtos/[slug]/faq/textos/
├── content.md
└── content.json
```

### JSON

```json
{
  "metafield_key": "faq",
  "value": {
    "items": [
      {
        "category": "adequacao",
        "question": "Esse shampoo serve pra qualquer tipo de cacho?",
        "answer": "Sim! A fórmula é indicada pra todos os tipos de cabelos cacheados e crespos (do 2C ao 4C)..."
      },
      {
        "category": "frequencia",
        "question": "Posso usar todos os dias?",
        "answer": "Recomendamos 2-3x por semana..."
      }
    ]
  }
}
```

## ✅ Checklist (conteúdo)

- [ ] Exatamente 6 perguntas?
- [ ] Pelo menos 4 categorias diferentes?
- [ ] Tom de voz da marca?
- [ ] Respostas 2-4 linhas cada?
- [ ] Sem claims sem fonte?
- [ ] Sem termos proibidos ANVISA?
- [ ] Composição não inventada?

---

## 🔌 Publicação no Shopify — metaobjeto `faq_item` + metafield `custom.section_faq`

> O tema da loja consome FAQ via metafield de produto **`custom.section_faq`** (label visível: `[Section] FAQ`). Esse metafield é do tipo `list.metaobject_reference` e aponta pra metaobjetos do tipo **`faq_item`**. Cada FAQ vira **um metaobjeto separado**; o produto referencia uma **lista** desses metaobjetos.

### Esquemas (autoritativos — não inventar)

**Metafield definition** (no produto):
```yaml
namespace: custom
key: section_faq
name: "[Section] FAQ"
type: list.metaobject_reference
metaobject_definition_id: gid://shopify/MetaobjectDefinition/5360648399  # faq_item
```

**Metaobject definition** `faq_item` (cada item da lista):
```yaml
type: faq_item
display_name_key: question
fields:
  - key: question
    name: Pergunta
    type: single_line_text_field
    required: false
  - key: answer
    name: Resposta
    type: rich_text_field
    required: false
```

> ⚠️ **`answer` é `rich_text_field`** — não aceita string crua nem HTML. Tem que mandar **JSON do schema Rich Text do Shopify** (raiz `{"type":"root","children":[...]}`).

### Conversão da resposta (Markdown → Rich Text JSON)

A resposta sai do conteúdo (.md/.json) como markdown/string. Antes de salvar no metaobjeto, converter pra Rich Text JSON.

Mínimo viável (parágrafo único, sem formatação):
```json
{
  "type": "root",
  "children": [
    {
      "type": "paragraph",
      "children": [
        { "type": "text", "value": "TEXTO DA RESPOSTA AQUI" }
      ]
    }
  ]
}
```

Múltiplos parágrafos:
```json
{
  "type": "root",
  "children": [
    { "type": "paragraph", "children": [{ "type": "text", "value": "Primeiro parágrafo." }] },
    { "type": "paragraph", "children": [{ "type": "text", "value": "Segundo parágrafo." }] }
  ]
}
```

Com bold inline:
```json
{ "type": "paragraph", "children": [
  { "type": "text", "value": "Use " },
  { "type": "text", "value": "à noite", "bold": true },
  { "type": "text", "value": ", após a limpeza." }
]}
```

> O `value` final salvo no campo `answer` é a **string JSON** dessa estrutura (i.e., `JSON.stringify(...)`).

### Workflow de publicação (3 passos)

**1) Pra cada Q&A, criar um metaobjeto `faq_item`**

```graphql
mutation CreateFaqItem($metaobject: MetaobjectCreateInput!) {
  metaobjectCreate(metaobject: $metaobject) {
    metaobject { id handle type }
    userErrors { field message code }
  }
}
```

Variables (exemplo de 1 item — repetir N vezes):
```json
{
  "metaobject": {
    "type": "faq_item",
    "fields": [
      { "key": "question", "value": "Esse hidratante serve pra pele oleosa?" },
      { "key": "answer", "value": "{\"type\":\"root\",\"children\":[{\"type\":\"paragraph\",\"children\":[{\"type\":\"text\",\"value\":\"Sim. A textura é leve e não-comedogênica, indicada pra todos os tipos de pele — incluindo oleosa e mista.\"}]}]}" }
    ]
  }
}
```

> Coletar o `metaobject.id` retornado (formato `gid://shopify/Metaobject/...`) pro passo 3.

**2) Validar idempotência (opcional mas recomendado)**

Antes de criar, buscar metaobjetos `faq_item` existentes com `question` igual pra não duplicar (`metaobjects(type:"faq_item", query:"...")`). Se existir, reusar GID.

**3) Anexar a lista de GIDs ao produto via `metafieldsSet`**

```graphql
mutation SetSectionFaq($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields { id namespace key type value }
    userErrors { field message code }
  }
}
```

Variables:
```json
{
  "metafields": [{
    "ownerId": "gid://shopify/Product/7312644931791",
    "namespace": "custom",
    "key": "section_faq",
    "type": "list.metaobject_reference",
    "value": "[\"gid://shopify/Metaobject/AAA\",\"gid://shopify/Metaobject/BBB\",\"gid://shopify/Metaobject/CCC\",\"gid://shopify/Metaobject/DDD\",\"gid://shopify/Metaobject/EEE\",\"gid://shopify/Metaobject/FFF\"]"
  }]
}
```

> ⚠️ O `value` é uma **string JSON com array de GIDs**, na ordem desejada de exibição.

### 🔒 Shopify safety (relembrar)

- ✅ Tocar apenas `custom.section_faq` do produto solicitado
- ❌ **Nunca** mexer em outros metafields (descrição, ingredientes, como_usar, etc.)
- ❌ **Nunca** alterar `title`, `tags`, `vendor`, `status`, `variants`, `price`
- ❌ **Nunca** publicar/despublicar produto
- ✅ Antes da mutation: confirmar `ownerId` bate com o produto do pedido
- ✅ Se metaobjeto `faq_item` antigo já existe vinculado, decidir explicitamente: **substituir lista**, **apendar**, ou **reusar GIDs existentes** (perguntar ao usuário)

---

## 📝 Exemplo concreto — Hidratante Facial Pele de Porcelana (Kokeshi)

**Contexto do produto** (de `brand-context/kokeshi/produtos/hidratante-facial-pele-de-porcelana.md` + CSV):
- Categoria: skincare facial, hidratante noturno
- Ingredientes-chave: Óleo de Farelo de Arroz, Farinha de Arroz, Rosa Mosqueta, Pantenol, Óleo de Amêndoa Doce
- Público: todos os tipos de pele, adultos, uso noturno
- Benefícios: hidratação profunda, anti-idade, antiacne, antioxidante, uniformização do tom
- Prova social: 1625+ avaliações, viral TikTok
- Tom Kokeshi: K-beauty/J-beauty, glass-skin, delicado, brasileiro com personalidade kute

### Briefing dos 6 itens (categoria → pergunta → resposta)

| # | Categoria | Pergunta | Resposta (resumo) |
|---|---|---|---|
| 1 | Adequação | Serve pra qualquer tipo de pele? | Sim — todos os tipos, incluindo oleosa/mista. Textura leve, não-comedogênica. |
| 2 | Frequência / modo de uso | Posso usar de manhã também? | Foi desenhado pra rotina noturna, mas dá pra usar de dia com FPS por cima. |
| 3 | Composição / restrição | É vegano e cruelty-free? | Sim — sem ingredientes animais, sem teste em animais (Coelho Azul / IBD). |
| 4 | Resultados | Em quanto tempo vejo diferença? | Hidratação na 1ª noite; uniformização e glow após 3-4 semanas de uso contínuo. |
| 5 | Compatibilidade | Posso usar com ácidos (retinol, AHA)? | Sim, como passo de hidratação **depois** do ativo. Ajuda a reduzir irritação. |
| 6 | Diferenciação | Qual a diferença pra outros hidratantes? | Combina poder do arroz (Farinha + Óleo de Farelo) com Rosa Mosqueta — efeito glass-skin sem oleosidade. |

### Texto pronto pros 6 itens

```markdown
**1. Esse hidratante serve pra qualquer tipo de pele?**
Sim. A textura é leve e não-comedogênica, indicada pra todos os tipos de pele — incluindo oleosa, mista, seca e sensível. Quem tem pele muito oleosa pode aplicar uma camada fina; pele seca pode reforçar à noite.

**2. Posso usar de manhã também?**
Foi formulado pra rotina noturna, mas dá pra usar pela manhã sem problema — sempre com protetor solar por cima. À noite o efeito hidratante e antioxidante da Rosa Mosqueta + Óleo de Farelo de Arroz potencializa a recuperação da pele durante o sono.

**3. É vegano e cruelty-free?**
Sim. Não contém ingredientes de origem animal e não testamos em animais. Certificado Coelho Azul / IBD.

**4. Em quanto tempo vejo resultado?**
A pele fica mais hidratada e macia logo na primeira aplicação. Resultados de uniformização do tom, redução de marquinhas e efeito glass-skin aparecem com uso contínuo de 3 a 4 semanas, idealmente em conjunto com a rotina completa Kokeshi (limpeza + tônico + hidratante).

**5. Posso usar com ácidos (retinol, AHA, vitamina C)?**
Sim. Use ele como passo de hidratação **depois** do ativo, pra selar a pele e reduzir irritação. Em peles sensíveis ou começando com retinol, intercalar dias — uma noite com ativo, outra só hidratante.

**6. Qual a diferença pra outros hidratantes faciais?**
A fórmula combina o poder do arroz (Farinha + Óleo de Farelo de Arroz, ricos em vitamina E e ferúlico) com Rosa Mosqueta e Pantenol — o resultado é efeito glass-skin sem oleosidade, com ação antioxidante e anti-idade.
```

### Variables prontas pra `metaobjectCreate` (item 1 — replicar pros 6)

```json
{
  "metaobject": {
    "type": "faq_item",
    "fields": [
      {
        "key": "question",
        "value": "Esse hidratante serve pra qualquer tipo de pele?"
      },
      {
        "key": "answer",
        "value": "{\"type\":\"root\",\"children\":[{\"type\":\"paragraph\",\"children\":[{\"type\":\"text\",\"value\":\"Sim. A textura é leve e não-comedogênica, indicada pra todos os tipos de pele — incluindo oleosa, mista, seca e sensível. Quem tem pele muito oleosa pode aplicar uma camada fina; pele seca pode reforçar à noite.\"}]}]}"
      }
    ]
  }
}
```

### Variables prontas pra `metafieldsSet` (após criar os 6)

```json
{
  "metafields": [{
    "ownerId": "gid://shopify/Product/7312644931791",
    "namespace": "custom",
    "key": "section_faq",
    "type": "list.metaobject_reference",
    "value": "[\"gid://shopify/Metaobject/<GID_ITEM_1>\",\"gid://shopify/Metaobject/<GID_ITEM_2>\",\"gid://shopify/Metaobject/<GID_ITEM_3>\",\"gid://shopify/Metaobject/<GID_ITEM_4>\",\"gid://shopify/Metaobject/<GID_ITEM_5>\",\"gid://shopify/Metaobject/<GID_ITEM_6>\"]"
  }]
}
```

### Output a salvar no repo

```
conteudos/kokeshi/produtos/hidratante-facial-pele-de-porcelana/faq/
├── textos/
│   ├── content.md          # 6 perguntas em markdown (humano lê)
│   ├── content.json        # 6 items estruturados (question, answer_md, answer_richtext_json, category)
│   └── shopify-payload.json  # variables prontas pros 2 mutations (metaobjectCreate × 6 + metafieldsSet)
└── shopify-result.json     # GIDs criados + timestamp + product owner (após publicar)
```

### Checklist de publicação Shopify

- [ ] 6 itens prontos no `content.json` com `answer_richtext_json` válido?
- [ ] `ownerId` confirmado bate com o produto pedido?
- [ ] Verificado se já existem `faq_item` linkados (decisão: substituir/apendar/reusar)?
- [ ] Mutation `metaobjectCreate` rodada pros 6 — todos retornaram GID sem `userErrors`?
- [ ] Mutation `metafieldsSet` rodada com lista dos 6 GIDs na ordem correta?
- [ ] Verificação pós-mutation: `product.metafield(namespace:"custom", key:"section_faq")` retorna a lista esperada?
- [ ] `shopify-result.json` salvo com GIDs pra rastreabilidade?
