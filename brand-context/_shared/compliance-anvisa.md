# Compliance ANVISA — Claims Cosméticos e Suplementos

> 🚨 **GUARDRAIL OBRIGATÓRIO**: Antes de gerar qualquer claim de eficácia/benefício/propriedade, consultar este documento. Em caso de dúvida, flagar com `[REGULATÓRIO: revisar]`.

## ❌ Termos PROIBIDOS em produtos cosméticos

Cosméticos no Brasil (RDC 7/2015 e Lei 6.360/76) **não podem** alegar ação terapêutica, medicinal ou de cura.

| Termo proibido | Substituto aceitável |
|---|---|
| **Cura / Curar** | Auxilia, contribui, ajuda |
| **Trata / Tratamento médico** | Cuida, mantém, hidrata |
| **Elimina rugas** | Atenua a aparência de linhas finas |
| **Remove manchas** | Uniformiza o tom da pele |
| **Anti-celulite (eliminar)** | Auxilia na aparência da pele |
| **Anti-queda capilar (médico)** | Fortalece os fios |
| **Anti-envelhecimento (sem ressalva)** | Ação antissinais, atenua sinais do tempo |
| **Restaura/Reconstrói (biológico)** | Restaura aparência, devolve maciez |
| **Estimula colágeno** (sem evidência) | Auxilia na firmeza aparente |
| **Penetra na derme** | Hidratação intensa / ação na superfície |
| **Repara DNA / células** | Cuida e revitaliza |
| **Detox / Desintoxica** | Sensação de leveza, purifica a pele |

## ❌ Claims que exigem comprovação científica

Se TEM teste → pode usar **com fonte**. Se NÃO tem → **NÃO usar**.

- "Reduz X% das rugas" → exige teste clínico
- "Hidratação por 24h" → exige hidratometria
- "Hipoalergênico" → exige teste dermatológico
- "Não comedogênico" → exige teste comedogênico
- "Aprovado por dermatologistas" → exige laudo

**Regra de ouro**: se aparecer `%`, `horas`, `dias` → PERGUNTAR a fonte. Sem fonte → `[VALIDAR: claim sem evidência fornecida]`.

## ❌ Suplementos (Rituária, By Samia)

RDC 243/2018 e RDC 27/2010 — **não podem**:
- "Cura doença X"
- "Previne doença Y"
- "Substitui medicamento"
- "Trata depressão / ansiedade"

**Substitutos**:
- "Contribui para o bem-estar"
- "Auxilia no equilíbrio do organismo"
- "Promove sensação de relaxamento"

## ⚠️ Termos sensíveis — Hair Care (Ápice, Auá)

| Sensível | Usar com cuidado |
|---|---|
| "Reduz queda" | Só com teste; senão "fortalece os fios" |
| "Cresce mais rápido" | Evitar; usar "favorece o crescimento saudável" |
| "Repara químicas" | "Cuida de cabelos quimicamente tratados" |
| "Anti-frizz definitivo" | "Reduz o frizz / controle de frizz" |

## ⚠️ Termos sensíveis — Skincare (Lescent, Kokeshi, Barbour's)

| Sensível | Usar com cuidado |
|---|---|
| "Acaba com a acne" | "Auxilia no controle da oleosidade" |
| "Tira olheiras" | "Atenua a aparência de olheiras" |
| "Clareia manchas" | "Uniformiza o tom da pele" |
| "Rejuvenesce" | "Promove aspecto revigorado" |

## ✅ Padrões aceitáveis universais

- "Promove a sensação de..."
- "Contribui para..."
- "Auxilia na manutenção de..."
- "Atenua a aparência de..."
- "Devolve / mantém / preserva..."
- "Inspirado em..."

## 🚨 Workflow de validação

1. Após gerar texto, **escanear** procurando termos da lista proibida
2. Para cada match → **substituir** OU flagar `[REGULATÓRIO: termo "X" precisa revisão]`
3. Para cada número/% → **validar** fonte; senão flagar
4. Apresentar ao usuário a lista de flags ao final

## 📌 Disclaimers padrão

**Cosméticos** com claim sensível:
> "Resultados podem variar de acordo com o tipo de pele/cabelo. Para condições específicas, consulte um profissional."

**Suplementos**:
> "Este produto não é um medicamento. Não substitui uma alimentação equilibrada nem orientação médica."
