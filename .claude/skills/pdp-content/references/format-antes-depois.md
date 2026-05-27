# Formato: Antes/Depois

Duas variantes — **PERGUNTAR ao usuário qual ele quer** (ou ambas):

- **Variante A** — Antes/Depois visual (Ápice, Rituária, Kokeshi, Auá, Lescent)
- **Variante B** — Números de eficácia (todas, especialmente fragrâncias)

## ⚠️ Inputs CRÍTICOS

- ✅ Marca + produto + categoria confirmados
- **Variante A**: tipo de transformação (cabelo, pele, etc.) + perfil do modelo
- **Variante B**: dados reais de teste + **fonte do teste**

🚨 **Sem dados reais de eficácia → NÃO gerar números. Marcar `[VALIDAR: dados de teste]`.**

---

## 🅰️ Variante A — Visual

### Estrutura

2 imagens (pareadas, lado a lado ou slider):
- **Antes**: estado original
- **Depois**: resultado após uso

### Geração via piapp-image-gen

`tool`: **`generate_image_batch`** (pareado pra consistência absoluta)
`purpose`: `pdp-before` + `pdp-after`
`aspect_ratio`: `1:1` ou `4:5`
`quality`: `high`

#### Prompt "ANTES"

```
Photorealistic high-quality beauty photography.
Close-up portrait of [MODEL_DESCRIPTION].

Showing: [PROBLEM_STATE — ex: hair with frizz, undefined curls, dryness].

Lighting: [BRAND_LIGHTING — soft natural daylight from left, warm tones].
Background: [BRAND_BACKGROUND — clean cream studio].

Aspect ratio: 1:1 (or 4:5).
Mood: HONEST and REALISTIC. Authentic texture.
NO heavy filters. NO text. NO logos. NO product packaging.

Style consistent with [BRAND_NAME]: [BRAND_VISUAL_DNA].
```

#### Prompt "DEPOIS"

```
[EXACT SAME MODEL/LIGHTING/BACKGROUND from "ANTES"]

Showing: [RESULT_STATE — same subject, condition visibly improved REALISTICALLY].

Same person, same outfit, same setting, same framing.
ONLY the [hair/skin condition] improved in a believable way.

NO dramatic transformations. NO unrealistic perfection.
NO text. NO logos.
```

### 🚨 Guardrails específicos

- ❌ **NÃO gerar transformações irreais** (crespo→liso, manchas eliminadas totalmente) — publicidade enganosa
- ❌ **NÃO usar pessoas reais sem autorização**
- ❌ **NÃO gerar com texto/logo**
- ✅ Consistência total: mesma pessoa, ângulo, luz, fundo
- ✅ Melhoria visível mas crível
- ✅ Disclaimer obrigatório: "Resultados podem variar de acordo com [tipo de cabelo/pele/uso]"

---

## 🅱️ Variante B — Números

### Estrutura

3-5 estatísticas em destaque visual:
```
[NÚMERO] [%/horas/dias]
[descrição da métrica]
```

### Por categoria

**Hair Care (Ápice, Auá):**
- % redução de frizz
- % aumento de brilho
- % melhora na definição
- horas de hidratação

**Skincare (Lescent, Kokeshi):**
- % redução de imperfeições
- % aumento de hidratação
- % redução aparente de olheiras

**Skincare masculino (Barbour's):**
- % redução de oleosidade

**Bem-estar (Rituária, By Samia):**
- % melhora no bem-estar (cuidado regulatório!)
- % redução de inchaço
- % melhora na qualidade do sono

**Fragrâncias:**
- horas de fixação
- m de projeção
- % agradabilidade (painel sensorial)

### 🚨 Guardrail INVIOLÁVEL

**TODOS os números precisam de fonte real.**

- Se usuário fornecer % → PEDIR fonte (instituto, n amostral, metodologia)
- Sem fonte → `[VALIDAR: dados de teste pendentes]`
- % que tangencia claim médico → `[REGULATÓRIO]`

---

## 📁 Output

```
conteudos/[marca]/produtos/[slug]/antes-depois/
├── textos/
│   ├── content.md
│   └── content.json
└── imagens/                       # SOMENTE Variante A
    ├── generated/
    │   ├── image-01-antes.png
    │   └── image-02-depois.png
    └── prompts/
        ├── prompt-01-antes.txt
        ├── prompt-01-antes.meta.json
        ├── prompt-02-depois.txt
        └── prompt-02-depois.meta.json
```

### JSON (Variante A)

```json
{
  "metafield_key": "antes-depois",
  "value": {
    "variant": "A",
    "antes_path": "imagens/generated/image-01-antes.png",
    "depois_path": "imagens/generated/image-02-depois.png",
    "disclaimer": "Resultados podem variar conforme tipo de cabelo e uso correto do produto."
  }
}
```

### JSON (Variante B)

```json
{
  "metafield_key": "antes-depois",
  "value": {
    "variant": "B",
    "stats": [
      {
        "value": "[VALIDAR: 92]",
        "unit": "%",
        "label": "redução de frizz",
        "source": "[VALIDAR: laudo IPCLIN — pendente]"
      }
    ],
    "disclaimer": "Resultados podem variar conforme tipo de cabelo e uso correto do produto."
  }
}
```

## ✅ Checklist

### Variante A
- [ ] Mesma pessoa/luz/composição entre antes/depois?
- [ ] Resultado plausível?
- [ ] Sem texto/logo?
- [ ] Disclaimer presente?

### Variante B
- [ ] Cada número com fonte?
- [ ] Sem claims médicos?
- [ ] Disclaimer presente?
- [ ] `[VALIDAR]` claros pra revisão?

---

## 🔌 Publicação no Shopify — metaobjeto `eficiencia_do_produto` + metafield `custom.eficiencia_do_produto`

> O tema da loja consome esse formato via metafield de produto **`custom.eficiencia_do_produto`** (label visível: `[Section] Eficiência do Produto`). Tipo `metaobject_reference` (**singular** — UM único metaobjeto por produto, diferente do FAQ que é lista) que aponta pra um metaobjeto do tipo **`eficiencia_do_produto`**.

> 🧩 **Schema híbrido**: o mesmo metaobjeto carrega **3 métricas numéricas** (Variante B) **+ 2 imagens antes/depois** (Variante A). Use o que tiver — campos são todos opcionais. Mínimo recomendado: 3 números OU 1 par de imagens. Ideal: ambos.

### Esquemas (autoritativos)

**Metafield definition** (no produto):
```yaml
namespace: custom
key: eficiencia_do_produto
name: "[Section] Eficiência do Produto"
type: metaobject_reference                          # singular, não lista
metaobject_definition_id: gid://shopify/MetaobjectDefinition/5422973135
```

**Metaobject definition** `eficiencia_do_produto`:
```yaml
type: eficiencia_do_produto
display_name_key: number_1
fields:
  - key: image_before          # File (image) — opcional
    type: file_reference
    validations: { file_type_options: ["Image"] }
  - key: image_after           # File (image) — opcional
    type: file_reference
    validations: { file_type_options: ["Image"] }
  - key: number_1              # ex "97%", "+62%", "24h"
    type: single_line_text_field
  - key: number_2
    type: single_line_text_field
  - key: number_3
    type: single_line_text_field
  - key: text_1                # rich_text — descrição da métrica 1
    type: rich_text_field
  - key: text_2
    type: rich_text_field
  - key: text_3
    type: rich_text_field
```

> ⚠️ Mesma regra do FAQ: `text_1/2/3` são **rich_text_field** — exigem JSON `{"type":"root","children":[...]}`, não string crua.

### Workflow de publicação (3-4 passos)

**1) [Opcional] Subir imagens antes/depois → obter GIDs de File**

Se for usar `image_before` / `image_after`, primeiro fazer upload pra Shopify Files via `stagedUploadsCreate` → PUT no target → `fileCreate`. Coletar `MediaImage.id` (formato `gid://shopify/MediaImage/...`).

> O `piapp-image-gen` já entrega assets em `imagens/generated/`; reaproveitar e fazer o upload via staged.

**2) Criar o metaobjeto `eficiencia_do_produto` (UM só por produto)**

```graphql
mutation CreateEficiencia($metaobject: MetaobjectCreateInput!) {
  metaobjectCreate(metaobject: $metaobject) {
    metaobject { id handle type }
    userErrors { field message code }
  }
}
```

Variables (exemplo só com números — sem imagens):
```json
{
  "metaobject": {
    "type": "eficiencia_do_produto",
    "fields": [
      { "key": "number_1", "value": "97%" },
      { "key": "text_1", "value": "{\"type\":\"root\",\"children\":[{\"type\":\"paragraph\",\"children\":[{\"type\":\"text\",\"value\":\"das usuárias relataram pele mais hidratada na 1ª aplicação.\"}]}]}" },
      { "key": "number_2", "value": "+82%" },
      { "key": "text_2", "value": "{\"type\":\"root\",\"children\":[{\"type\":\"paragraph\",\"children\":[{\"type\":\"text\",\"value\":\"de aparência uniforme do tom após 4 semanas de uso contínuo.\"}]}]}" },
      { "key": "number_3", "value": "24h" },
      { "key": "text_3", "value": "{\"type\":\"root\",\"children\":[{\"type\":\"paragraph\",\"children\":[{\"type\":\"text\",\"value\":\"de hidratação contínua confirmada em teste de corneometria.\"}]}]}" }
    ]
  }
}
```

Variables (exemplo com imagens — adicionar nos fields):
```json
{ "key": "image_before", "value": "gid://shopify/MediaImage/<ID_DA_IMAGEM_ANTES>" },
{ "key": "image_after",  "value": "gid://shopify/MediaImage/<ID_DA_IMAGEM_DEPOIS>" }
```

**3) Anexar o GID do metaobjeto ao produto via `metafieldsSet`**

```graphql
mutation SetEficiencia($metafields: [MetafieldsSetInput!]!) {
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
    "ownerId": "gid://shopify/Product/<PRODUCT_GID>",
    "namespace": "custom",
    "key": "eficiencia_do_produto",
    "type": "metaobject_reference",
    "value": "gid://shopify/Metaobject/<METAOBJECT_GID>"
  }]
}
```

> ⚠️ Como é `metaobject_reference` (singular), o `value` é **a string do GID direto**, não JSON array. Diferente do FAQ.

**4) Idempotência**

Antes de criar novo metaobjeto, verificar se o produto já tem `custom.eficiencia_do_produto` vinculado. Se tem:
- **Atualizar conteúdo** → usar `metaobjectUpdate` no metaobjeto existente (recomendado pra preservar histórico)
- **Substituir** → criar novo + setar metafield com novo GID (o antigo fica órfão; limpar com `metaobjectDelete` se quiser)

### 🔒 Shopify safety

- ✅ Tocar apenas `custom.eficiencia_do_produto` do produto pedido
- ❌ Nunca tocar outros metafields/title/status/variants
- ✅ Se já existe metaobjeto vinculado: perguntar ao usuário se atualiza in-place ou substitui
- ✅ Upload de imagens só pra `Shopify Files` — não tocar outros uploads

### 🚨 Guardrail regulatório (CRÍTICO)

Como esse formato exibe **claims numéricos** publicamente, todos os 3 números **DEVEM** ter fonte verificável **antes** de gerar o metaobjeto:

- ✅ Laudo de instituto (ex: IPCLIN, MedCin, Allergisa) — com n amostral, metodologia, data
- ✅ Painel sensorial (n ≥ 30, autodeclaração) — claim deve dizer "das usuárias relataram"
- ✅ Teste in-vitro (ex: corneometria, TEWL) — com aparelho/laboratório
- ❌ "Achismo" ou estimativa interna sem teste
- ❌ Claim médico (curar, tratar, eliminar) — encaminhar pra ANVISA

Sem fonte → **não publicar** o metaobjeto. Gerar como rascunho local (`content.md`) com `[VALIDAR: pendente]` nos números e parar antes da mutation.

---

## 📝 Exemplo concreto — Hidratante Facial Pele de Porcelana (Kokeshi)

**Contexto disponível:**
- Sem laudo de instituto público (verificado)
- 1625+ avaliações de clientes (Trustvox/Loox) → fonte de painel sensorial
- Viral TikTok com vídeos de antes/depois orgânicos
- Benefícios brandbook: hidratação profunda, uniformização do tom, anti-idade, efeito glass-skin

**Status regulatório**: ❌ **NÃO temos números prontos pra publicar**. Os exemplos abaixo são **estruturais** — substituir por dados reais de laudo OU painel sensorial antes de rodar a mutation.

### Briefing dos 3 números (rascunho — todos `[VALIDAR]`)

| # | Número | Texto | Fonte sugerida |
|---|---|---|---|
| 1 | `[VALIDAR: 97%]` | das clientes notaram pele mais hidratada na 1ª noite de uso | Painel sensorial Trustvox (extrair de avaliações com tag "hidratação") |
| 2 | `[VALIDAR: +82%]` | de aparência uniforme do tom após 4 semanas | Painel sensorial 30 dias (recrutar n≥30 clientes) |
| 3 | `[VALIDAR: 24h]` | de hidratação contínua confirmada por corneometria | Laudo IPCLIN — solicitar |

### Texto pronto (rascunho)

```markdown
## Eficácia comprovada

**97%** — das clientes notaram pele mais hidratada já na primeira noite de uso. [VALIDAR: fonte]

**+82%** — de aparência uniforme do tom após 4 semanas de uso contínuo, em conjunto com a rotina completa. [VALIDAR: fonte]

**24h** — de hidratação contínua confirmada por teste de corneometria. [VALIDAR: laudo]

> Resultados podem variar conforme tipo de pele, rotina e regularidade de uso.
```

### Imagens antes/depois (se forem usar)

⚠️ Skincare antes/depois é o caso mais sensível regulatoriamente:
- ✅ Permitido: textura/luminosidade visivelmente mais hidratada/iluminada
- ❌ Proibido: marquinhas eliminadas, manchas que somem totalmente, mudança de tom de pele radical
- ✅ Sempre incluir disclaimer "resultados podem variar"
- ✅ Usar `piapp-image-gen` com `purpose: pdp-before` / `pdp-after`, prompts pareados (mesma modelo, luz, fundo)

### Variables prontas pra `metaobjectCreate` (após validar números)

```json
{
  "metaobject": {
    "type": "eficiencia_do_produto",
    "fields": [
      { "key": "number_1", "value": "97%" },
      { "key": "text_1", "value": "{\"type\":\"root\",\"children\":[{\"type\":\"paragraph\",\"children\":[{\"type\":\"text\",\"value\":\"das clientes notaram pele mais hidratada já na primeira noite de uso.\"}]}]}" },
      { "key": "number_2", "value": "+82%" },
      { "key": "text_2", "value": "{\"type\":\"root\",\"children\":[{\"type\":\"paragraph\",\"children\":[{\"type\":\"text\",\"value\":\"de aparência uniforme do tom após 4 semanas de uso contínuo.\"}]}]}" },
      { "key": "number_3", "value": "24h" },
      { "key": "text_3", "value": "{\"type\":\"root\",\"children\":[{\"type\":\"paragraph\",\"children\":[{\"type\":\"text\",\"value\":\"de hidratação contínua confirmada por teste de corneometria.\"}]}]}" }
    ]
  }
}
```

### Variables prontas pra `metafieldsSet` (após criar o metaobjeto)

```json
{
  "metafields": [{
    "ownerId": "gid://shopify/Product/7312644931791",
    "namespace": "custom",
    "key": "eficiencia_do_produto",
    "type": "metaobject_reference",
    "value": "gid://shopify/Metaobject/<GID_RETORNADO_NO_PASSO_2>"
  }]
}
```

### Output a salvar no repo

```
conteudos/kokeshi/produtos/hidratante-facial-pele-de-porcelana/antes-depois/
├── textos/
│   ├── content.md            # 3 números + textos em markdown
│   ├── content.json          # estruturado com flags [VALIDAR]
│   └── shopify-payload.json  # variables prontas pras 2 mutations
├── imagens/                  # opcional, se variante visual também
│   ├── generated/
│   │   ├── image-01-antes.png
│   │   └── image-02-depois.png
│   └── prompts/
│       ├── prompt-01-antes.txt
│       ├── prompt-01-antes.meta.json
│       ├── prompt-02-depois.txt
│       └── prompt-02-depois.meta.json
└── shopify-result.json       # GIDs criados após publicar
```

### Checklist de publicação Shopify

- [ ] Todos os 3 números têm fonte verificável (laudo/painel sensorial) — **não pode ter `[VALIDAR]` solto**
- [ ] Disclaimer "resultados podem variar" presente na PDP (já vem do tema OU adicionar via text_3)
- [ ] Se usar imagens: ambas geradas com mesma modelo/luz/fundo, sem claim irreal
- [ ] Se usar imagens: GIDs `MediaImage` obtidos via `fileCreate` (não signed URLs do PiApp — Shopify precisa hospedar)
- [ ] `ownerId` confirmado bate com o produto pedido
- [ ] Verificado se já existe metaobjeto `eficiencia_do_produto` linkado (decisão: atualizar in-place via `metaobjectUpdate` OU substituir)
- [ ] Mutation `metaobjectCreate` rodou sem `userErrors`?
- [ ] Mutation `metafieldsSet` rodou sem `userErrors`?
- [ ] Verificação pós-mutation: PDP renderiza os 3 números + textos (e imagens, se aplicável)?
- [ ] `shopify-result.json` salvo com GID pra rastreabilidade
