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
