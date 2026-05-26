# Output Paths — Collection Content

```
conteudos/[marca-slug]/collections/[collection-slug]/
├── textos/
│   ├── hero.md
│   ├── hero.json
│   ├── description.md
│   ├── description.json
│   ├── seo.json
│   └── thumbnail-meta.json
└── imagens/
    ├── generated/
    │   ├── hero.png
    │   └── thumbnail.png
    └── prompts/
        ├── hero.txt
        ├── hero.meta.json
        ├── thumbnail.txt
        └── thumbnail.meta.json
```

## Validações

- `collection-slug` deve existir no `brand-context/[marca]/collections.csv`
- Se não existir → PERGUNTAR usuário se quer adicionar ao CSV

## Exemplo

Usuário pede: "hero pra collection Linha Cachos da Ápice"

```
conteudos/apice/collections/linha-cachos/
├── textos/
│   ├── hero.md
│   └── hero.json
└── imagens/
    ├── generated/
    │   └── hero.png
    └── prompts/
        ├── hero.txt
        └── hero.meta.json
```
