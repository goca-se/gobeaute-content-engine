# CSV Schema — produtos.csv e collections.csv

Estrutura padrão (validação macro, não rígida — Claude valida mas não bloqueia se houver colunas extras).

## `produtos.csv`

### Colunas obrigatórias

| Coluna | Tipo | Exemplo | Notas |
|---|---|---|---|
| `slug` | string (kebab-case) | `condicionador-nutri-waves-500ml` | Identificador único, usado em paths |
| `name` | string | `Condicionador Nutri Waves 500ml` | Nome comercial |
| `detail_md` | path relativo | `produtos/condicionador-nutri-waves-500ml.md` | Caminho do .md de detalhe |

### Colunas recomendadas

| Coluna | Tipo | Exemplo |
|---|---|---|
| `line` | string | `Nutri` |
| `category` | enum | `hair` / `skincare` / `suplemento` / `fragrancia` |
| `sku` | string | `CO-005` |
| `shopify_handle` | string | `condicionador-nutri-waves-500ml` |
| `status` | enum | `active` / `draft` / `archived` |
| `price` | number | `89.90` |

### Exemplo completo

```csv
slug,name,line,category,sku,shopify_handle,status,price,detail_md
shampoo-cachos-ra1000,Shampoo Cachos RA1000,Cachos,hair,SH-001,shampoo-cachos-ra1000,active,79.90,produtos/shampoo-cachos-ra1000.md
condicionador-nutri-waves-500ml,Condicionador Nutri Waves 500ml,Nutri,hair,CO-005,condicionador-nutri-waves-500ml,active,89.90,produtos/condicionador-nutri-waves-500ml.md
```

## `collections.csv`

### Colunas obrigatórias

| Coluna | Tipo | Exemplo |
|---|---|---|
| `slug` | string | `linha-cachos` |
| `name` | string | `Linha Cachos` |
| `detail_md` | path | `collections/linha-cachos.md` |

### Colunas recomendadas

| Coluna | Tipo | Exemplo |
|---|---|---|
| `description_short` | string | `Cuidado completo pra cabelos cacheados` |
| `shopify_handle` | string | `linha-cachos` |
| `status` | enum | `active` / `draft` / `archived` |
| `seasonal` | boolean | `false` |

### Exemplo

```csv
slug,name,description_short,shopify_handle,status,seasonal,detail_md
linha-cachos,Linha Cachos,Cuidado completo pra cabelos cacheados,linha-cachos,active,false,collections/linha-cachos.md
black-friday-2026,Black Friday 2026,Ofertas especiais de novembro,black-friday-2026,draft,true,collections/black-friday-2026.md
```

## 🚨 Validação

- Slug deve ser kebab-case, lowercase, sem acento → `linha-cachos` ✅, `Linha Cachos` ❌
- `detail_md` deve apontar pra arquivo que existe (ou será criado)
- Se faltar coluna obrigatória → **PERGUNTAR** ao usuário se quer:
  1. Completar a linha
  2. Prosseguir mesmo assim com flags
