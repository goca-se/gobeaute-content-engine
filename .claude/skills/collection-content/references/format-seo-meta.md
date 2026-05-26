# Formato: SEO Meta — Collection

Tags meta pra otimizar SEO da página de collection no Google.

## Inputs

- ✅ Brand + collection
- ✅ Keywords-foco (perguntar se não definidas)
- ✅ Big idea da collection

---

## 📐 Campos

### Title tag
- **50-60 caracteres** (limite Google)
- Inclui: nome da collection + marca + categoria/diferencial
- Pattern: `[Collection Name] | [Brand] — [Categoria/Diferencial]`

### Meta description
- **150-160 caracteres** (limite Google)
- Vende a collection em 1 frase + CTA implícito
- Inclui keyword principal

### Open Graph (og:)
- `og:title`: pode ser igual ao title tag ou versão mais "social"
- `og:description`: pode ser igual à meta description
- `og:image`: path da imagem hero gerada (1200x630px ideal)

### Schema.org Collection (opcional)
- Tipo: `CollectionPage` ou `ItemList`

---

## 📝 Exemplos

### Ápice — Linha Cachos

```json
{
  "title_tag": "Linha Cachos Ápice — Cuidado completo pra cabelos cacheados",
  "title_length": 56,
  "meta_description": "Conheça a linha completa Ápice pra cachos: shampoo, condicionador, creme de pentear e máscara. Definição, hidratação e respeito ao seu cabelo.",
  "meta_description_length": 152,
  "og_title": "Linha Cachos Ápice — Cuidado completo pra cabelos cacheados",
  "og_description": "Definição, hidratação e respeito aos cabelos cacheados em uma linha completa.",
  "og_image_path": "imagens/generated/hero.png",
  "keywords_primary": ["linha cachos", "shampoo para cachos"],
  "keywords_secondary": ["cabelo cacheado", "ápice cachos", "ra1000"]
}
```

### Rituária — Black Friday

```json
{
  "title_tag": "Black Friday Rituária — Até 40% off em bem-estar",
  "meta_description": "Toda a coleção Rituária com até 40% off no Black Friday. Suplementos e rituais naturais que cabem na sua rotina. Aproveite enquanto durar.",
  "og_title": "Black Friday Rituária — Até 40% off",
  "og_description": "Bem-estar e equilíbrio com desconto especial.",
  "keywords_primary": ["black friday rituária"]
}
```

---

## 🚨 Guardrails

- ❌ Title > 60 caracteres (vai cortar no Google)
- ❌ Description > 160 caracteres
- ❌ Keyword stuffing (repetir keyword 5x no texto)
- ❌ Promessas exageradas que não estão na collection
- ✅ Validar comprimento de caracteres
- ✅ Keyword principal no title E na description
- ✅ Compliance ANVISA também vale aqui

---

## 📁 Output

```
conteudos/[marca]/collections/[slug]/textos/
└── seo.json
```

### JSON

```json
{
  "type": "collection-seo",
  "brand": "apice",
  "collection_handle": "linha-cachos",
  "value": {
    "title_tag": "Linha Cachos Ápice — Cuidado completo pra cabelos cacheados",
    "title_length": 56,
    "meta_description": "Conheça a linha completa Ápice pra cachos: shampoo, condicionador, creme de pentear e máscara. Definição, hidratação e respeito ao seu cabelo.",
    "meta_description_length": 152,
    "og": {
      "title": "...",
      "description": "...",
      "image_path": "imagens/generated/hero.png"
    },
    "keywords": {
      "primary": ["linha cachos"],
      "secondary": ["cabelo cacheado", "ápice"]
    },
    "schema_type": "CollectionPage"
  }
}
```

## ✅ Checklist

- [ ] Title ≤ 60 caracteres?
- [ ] Description ≤ 160 caracteres?
- [ ] Keyword principal no title E description?
- [ ] Sem stuffing?
- [ ] og:image aponta pra hero gerado?
- [ ] Compliance ANVISA?
