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
