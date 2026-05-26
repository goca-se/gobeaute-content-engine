# Output Paths — PDP Content

Estrutura padronizada de pastas pra conteúdo de PDP.

## Caminho base

```
conteudos/[marca-slug]/produtos/[produto-slug]/[metafield]/
```

Onde:
- `[marca-slug]`: lowercase, sem acento (apice, barbours, rituaria, lescent, kokeshi, bysamia, aua)
- `[produto-slug]`: kebab-case do CSV (condicionador-nutri-waves-500ml)
- `[metafield]`: um dos 9 abaixo

## Metafields disponíveis (slugs exatos)

| Metafield slug | O que contém |
|---|---|
| `descricao` | Descrição comercial (texto) |
| `composicao` | Composição/INCI (texto) |
| `modo-de-uso` | Modo de uso textual (texto) |
| `descricao-curta` | Short description + 5 bullets |
| `icones` | 3 ícones de benefício (3 PNGs + 3 títulos) |
| `antes-depois` | Variante A (visual) ou B (números) |
| `faq` | 6 Q&A |
| `como-usar` | 5-8 passos + 1 imagem |
| `ingredientes` | 3-6 ingredientes com imagem |

## Subestrutura dentro de cada metafield

```
[metafield]/
├── textos/                              # SEMPRE
│   ├── content.md                       # SEMPRE (Markdown)
│   ├── content.json                     # SEMPRE (estruturado)
│   └── shopify-liquid.html              # OPCIONAL (se solicitado)
└── imagens/                             # SOMENTE icones, antes-depois (A), como-usar, ingredientes
    ├── generated/
    │   ├── image-01.png
    │   ├── image-02.png
    │   └── ...
    └── prompts/
        ├── prompt-01.txt
        ├── prompt-01.meta.json
        └── ...
```

## Exemplo real

Usuário pede: "FAQ pro Condicionador Nutri Waves 500ml da Ápice"

Output:
```
conteudos/apice/produtos/condicionador-nutri-waves-500ml/faq/
└── textos/
    ├── content.md
    └── content.json
```

Usuário pede: "ícones pro mesmo produto"

Output:
```
conteudos/apice/produtos/condicionador-nutri-waves-500ml/icones/
├── textos/
│   └── content.json
└── imagens/
    ├── generated/
    │   ├── image-01.png
    │   ├── image-02.png
    │   └── image-03.png
    └── prompts/
        ├── prompt-01.txt
        ├── prompt-01.meta.json
        ├── prompt-02.txt
        ├── prompt-02.meta.json
        ├── prompt-03.txt
        └── prompt-03.meta.json
```

## 🚨 Regras

- ❌ Nunca usar caracteres especiais em paths (sem acento, sem espaço, sem maiúscula)
- ❌ Nunca colocar 2 produtos diferentes na mesma pasta
- ✅ Slug do produto SEMPRE bate com o slug no `brand-context/[marca]/produtos.csv`
- ✅ Criar diretórios automaticamente conforme necessário (`mkdir -p`)
