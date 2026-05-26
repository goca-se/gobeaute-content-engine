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

## ✅ Checklist

- [ ] Exatamente 6 perguntas?
- [ ] Pelo menos 4 categorias diferentes?
- [ ] Tom de voz da marca?
- [ ] Respostas 2-4 linhas cada?
- [ ] Sem claims sem fonte?
- [ ] Sem termos proibidos ANVISA?
- [ ] Composição não inventada?
