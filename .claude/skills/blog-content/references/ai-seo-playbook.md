# AI SEO Playbook — Blogs otimizados pra ChatGPT, Gemini e AI Overviews

> **Source of truth de AI SEO (AEO/GEO) pra blogs novos das marcas Gobeaute.** Baseado em "Beyond SEO: Como Fazer Sua Marca Ser Recomendada pelo ChatGPT, Gemini e Buscadores de IA" (Jeff Oxford, Seller Summit 2026).
>
> 🚨 **ESCOPO: aplica-se APENAS a blogs NOVOS.** Não refatorar blogs já publicados retroativamente sem pedido explícito do usuário. Complementa (não substitui) o `seo-playbook.md` — os 20 pontos de SEO tradicional continuam obrigatórios.

---

## 🧠 Por que isso importa

- LLMs recomendam as marcas **mais mencionadas e melhor documentadas** nos dados de treino e nas fontes consultadas em tempo real
- Tráfego vindo de IA converte **+33%** vs. busca orgânica tradicional
- **Conteúdo fresco tem vantagem desproporcional**: artigos novos bem otimizados pra IA são citados centenas de vezes mesmo sem backlinks — janela de first-mover aberta agora
- AI Overviews do Google já aparecem em 14% das buscas transacionais (e crescendo) — o blog precisa ser **extraível** pela IA, não só ranqueável
- A diferença central: SEO tradicional é sobre keywords; **AI SEO é sobre dar à IA informação rica o suficiente pra ela ter confiança em recomendar a marca** (especificações, casos de uso, FAQs, contexto)

---

## 📋 Os 8 princípios aplicados ao blog Gobeaute

### 1. Formatos que a IA mais cita (priorizar na escolha de tema/ângulo)

Os 5 formatos de conteúdo que LLMs mais citam como fonte:

| Formato | Exemplo Gobeaute | Por que funciona |
|---|---|---|
| **Guia de compra** | "Como escolher a melhor máscara pra cachos 3B" | Conteúdo decisório que a IA usa pra fundamentar recomendações |
| **Guia de custo** | "Quanto custa montar uma rotina capilar completa em 2026" | Informação factual e atualizada que a IA prioriza |
| **Roundup / listicle** | "Top 5 ativos pra couro oleoso (e como usar cada um)" | Formato de lista mapeia direto pra como a IA responde |
| **Comparativo** | "Máscara de hidratação vs. nutrição vs. reconstrução" | Reforça posicionamento relativo (⚠️ NUNCA nomear marca concorrente — comparar categorias, formatos, abordagens) |
| **Glossário** | "Glossário do cronograma capilar: 20 termos explicados" | Conteúdo de referência citado frequentemente |

→ Ao gerar/validar temas (`blog-themes.md`), **preferir esses formatos**. Tema livre ainda é permitido, mas o calendário deve ter maioria nesses 5 formatos.

### 2. Estrutura FAQ nos subheadings (formato nativo da IA)

- Formular **H2/H3 como perguntas** sempre que natural: "Por que os cachos ressecam no verão?" em vez de "Ressecamento no verão"
- **Resposta direta na primeira frase** abaixo do heading (1-2 frases factuais que respondem a pergunta por completo), depois desenvolver
- Espelha como LLMs processam informação: pergunta entra, resposta sai
- Meta: **≥ 50% dos H2 do artigo em formato de pergunta** (sem forçar onde ficar artificial)

### 3. Bloco de resposta direta após o lead (answer-first)

Logo após o lead, incluir um bloco `direct-answer` (ver seção HTML abaixo): 2-4 frases que respondem a pergunta central do artigo de forma completa e extraível. É o trecho que AI Overviews e LLMs vão citar.

### 4. Seção FAQ obrigatória no fim do artigo

- **4-6 perguntas específicas do tema**, respondidas direto (40-80 palavras cada)
- Perguntas vindas de **prompt research**: transformar a keyword-foco nas perguntas que um usuário faria a uma IA ("qual o melhor X pra...", "X funciona pra...", "quanto tempo demora...", "pode usar X com Y?")
- Renderizada como bloco rico `faq-block` (ver `format-rich-blocks.md`) + **JSON-LD `FAQPage`** (ver `format-seo-meta.md`)
- Respostas devem ser autocontidas (fazer sentido fora do contexto do artigo — é assim que a IA extrai)

### 5. Linguagem simples e factual (padrão Wikipedia)

- Direto ao ponto, sem fluff, sem opinião vazia — **quanto mais factual, melhor a performance em IA**
- NÃO significa abandonar o tom da marca: a voz aparece na escolha de exemplos, no ritmo e no CTA — os **fatos** aparecem em frases declarativas simples
- Especificar sempre que possível: concentrações, tempos de uso, frequências, tipos de cabelo/pele, faixas de preço ("a partir de R$ X")
- Evitar frases que só fazem sentido com contexto implícito — a IA extrai trechos isolados

### 6. Citar fontes confiáveis + estatísticas com fonte

- Artigos que citam fontes têm **+30% de chance de serem citados pela IA** (efeito cascata: quem cita fontes vira fonte)
- Incluir **2-3 dados concretos com fonte** por artigo (estudos, INCI, ANVISA, dados de eficácia já validados da marca)
- Linkar a fonte externa autoritativa (`rel="noopener"` em `target="_blank"`) — já era regra do `seo-playbook.md`, agora com motivação dobrada
- ⚠️ Continua valendo: **NUNCA inventar estatística**. Sem fonte → sem número (`[VALIDAR: fonte]`)

### 7. Casos de uso detalhados (long-tail pra IA)

- Cada artigo deve deixar explícito **pra quem é**: iniciante ou avançado? Que tipo de cabelo/pele? Que cenário específico?
- Isso permite a IA recomendar pra queries long-tail ("melhor X pra iniciantes que querem Y")
- O bloco `pill-list` (persona-fit) cumpre esse papel — passa a ser **obrigatório em blogs novos** (antes era opcional)
- Nos `product-cta-card`, incluir na descrição o caso de uso ("ideal pra quem...")

### 8. Hiper-foco temático + freshness

- **Sites hiper-focados são mais recomendados pela IA** (e ranqueiam melhor). Temas tangenciais ("3 dicas de organização da penteadeira") diluem a autoridade temática — recusar/flagar temas fora do core da marca
- **Freshness**: a IA tem viés forte por conteúdo recente. Incluir o ano no título quando fizer sentido (guias de custo: "em 2026"), manter `datePublished`/`dateModified` corretos no JSON-LD

---

## 🔎 Prompt research (o "keyword research" do AI SEO)

Ao receber keyword-foco, derivar as perguntas que um usuário faria a uma IA:

| Keyword | Prompt correspondente |
|---|---|
| `máscara hidratante cachos` | "Qual a melhor máscara hidratante pra cabelo cacheado?" |
| `nac suplemento` | "NAC funciona pra quê? Vale a pena suplementar?" |
| `cronograma capilar` | "Como montar um cronograma capilar pra cabelo ondulado?" |

Usar essas perguntas como: H2s do artigo, perguntas do `faq-block`, e ângulo do título. Registrar no `article.json` em `seo.ai_prompts_targeted[]`.

---

## 🧩 Blocos novos (schema + HTML)

### `direct-answer` — resposta direta extraível (após o lead)

```json
{
  "type": "direct-answer",
  "props": {
    "question": "Como cuidar de cachos no verão sem ressecar?",
    "answer": "Cachos ressecam no verão pela combinação de raios UV, cloro e sal, que removem a camada lipídica do fio. A solução é hidratação contínua (2-3x por semana), proteção UV via leave-in e enxágue imediato após mar ou piscina. Com esses três gestos, é possível manter definição e brilho a estação inteira."
  }
}
```

```html
<section class="rb rb-direct-answer">
  <p class="rb-direct-answer__label" aria-hidden="true">Resposta rápida</p>
  <p class="rb-direct-answer__body"><strong>Cachos ressecam no verão pela combinação de raios UV, cloro e sal...</strong></p>
</section>
```

Regras:
- ✅ 2-4 frases, autocontidas, factuais
- ✅ Posição fixa: imediatamente após o lead, antes do primeiro H2
- ✅ Responde a pergunta central do artigo por completo (quem ler só isso já tem a resposta)
- ❌ Sem links de produto, sem CTA, sem marca de produto (educacional puro — está na primeira metade)

### `faq-block` — seção de perguntas frequentes (fim do artigo)

Ver schema completo + HTML em `format-rich-blocks.md` (bloco 7️⃣). Resumo:
- 4-6 Q&As específicas do tema, respostas 40-80 palavras autocontidas
- H2 "Perguntas frequentes sobre [tema]" + H3 por pergunta (mantém hierarquia semântica)
- Posição: depois da última seção de conteúdo, antes da conclusão
- Acompanha JSON-LD `FAQPage` no final do body (ver `format-seo-meta.md`)

---

## ✅ Checklist AI SEO (por blog novo, antes de publicar)

- [ ] Tema está em 1 dos 5 formatos preferidos (ou flag justificando)
- [ ] Tema é core do nicho da marca (sem tangencial)
- [ ] ≥ 50% dos H2 em formato de pergunta
- [ ] Resposta direta na 1ª frase abaixo de cada H2-pergunta
- [ ] Bloco `direct-answer` após o lead
- [ ] `faq-block` com 4-6 Q&As autocontidas antes da conclusão
- [ ] JSON-LD `FAQPage` junto do `BlogPosting`
- [ ] 2-3 dados concretos com fonte citada (link externo autoritativo)
- [ ] `pill-list` persona-fit presente (casos de uso explícitos)
- [ ] Linguagem factual (especificações, frequências, concentrações onde aplicável)
- [ ] Ano no título se guia de custo/preço
- [ ] `seo.ai_prompts_targeted[]` preenchido no `article.json`

---

## 🚨 Guardrails

- ❌ Aplicar este playbook retroativamente em blogs já publicados sem pedido explícito
- ❌ Nomear marca concorrente em comparativos (regra existente continua valendo)
- ❌ Inventar estatística/fonte pra cumprir o checklist de dados concretos
- ❌ FAQ com respostas que dependem do contexto do artigo ("como vimos acima...")
- ❌ Transformar TODOS os H2 em pergunta de forma forçada (meta é ≥50%, com naturalidade)
- ❌ `direct-answer` com link ou menção de produto
- ❌ Sacrificar o tom da marca por "linguagem factual" — fatos simples + voz da marca convivem
