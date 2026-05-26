# Formato: Description — Collection

Texto institucional da página de collection. Aparece logo abaixo do hero ou em seção dedicada. Conta a história da collection, lista os produtos incluídos, motiva a navegação.

## Inputs

- ✅ Brand + collection do bundle
- ✅ Big idea + produtos incluídos
- ✅ Tema, sazonalidade
- ✅ Diferencial vs outras collections

---

## 📐 Estrutura

3 blocos:

### Bloco 1 — Intro (1-2 parágrafos curtos)
- Apresenta a big idea da collection
- Conecta com a persona/momento
- Tom da marca

### Bloco 2 — Highlights (3-4 bullets ou parágrafos curtos)
- Quais produtos compõem
- O que cada um faz na rotina
- Para quem é

### Bloco 3 — Encerramento + CTA contextual
- Reforça a promessa
- Convida pra explorar / comprar
- Tom comercial mas sem ser invasivo

### Tamanho total

- Mínimo: 120 palavras
- Ideal: 180-250 palavras
- Máximo: 350 palavras

---

## 📝 Exemplo (Ápice — Linha Cachos)

```markdown
## A Linha Cachos Ápice

Cabelos cacheados merecem uma rotina pensada do começo ao fim. A Linha Cachos Ápice nasceu pra
respeitar a estrutura única de cada fio — do 2C ao 4C — com fórmulas que limpam, hidratam,
definem e finalizam sem ressecar.

### O que compõe a linha

- **Shampoo Cachos**: limpeza suave que preserva a hidratação natural
- **Condicionador Cachos**: nutrição profunda com slip pra desembaraço fácil
- **Creme de Pentear**: definição leve, sem pesar, com fragrância marcante
- **Máscara Cachos**: hidratação intensa pra rotinas semanais

### Para quem?

Pra quem tem cabelo cacheado ou crespo e busca uma rotina que valorize a textura natural,
com ingredientes de origem responsável e resultados visíveis desde a primeira aplicação.

[Conheça a coleção completa →]
```

---

## 🚨 Guardrails

- ❌ Não inventar produtos
- ❌ Não exagerar benefícios além do que cada produto entrega
- ❌ Não criar urgência falsa
- ✅ Validar produtos contra `produtos.csv` da marca
- ✅ Tom da marca consistente
- ✅ Compliance ANVISA

---

## 📁 Output

```
conteudos/[marca]/collections/[slug]/textos/
├── description.md
└── description.json
```

### JSON

```json
{
  "type": "collection-description",
  "brand": "apice",
  "collection_handle": "linha-cachos",
  "value": {
    "intro": "Cabelos cacheados merecem...",
    "products_included": [
      { "slug": "shampoo-cachos-ra1000", "role": "limpeza" },
      { "slug": "condicionador-cachos-ra1000", "role": "hidratação" }
    ],
    "highlights_text": "...",
    "closing": "...",
    "cta_text": "Conheça a coleção completa"
  }
}
```

## ✅ Checklist

- [ ] Tom da marca?
- [ ] Produtos referenciados existem?
- [ ] Tamanho adequado (180-250 palavras)?
- [ ] Compliance ANVISA?
- [ ] CTA contextual ao final?
