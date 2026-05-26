# Output Paths — Blog Content

```
conteudos/[marca-slug]/blogs/[blog-slug]/
├── textos/
│   ├── article.md
│   └── article.json
├── imagens/
│   ├── generated/
│   │   ├── cover.png
│   │   ├── illustration-01.png
│   │   ├── illustration-02.png
│   │   └── illustration-03.png
│   └── prompts/
│       ├── cover.txt
│       ├── cover.meta.json
│       ├── illustration-01.txt
│       ├── illustration-01.meta.json
│       ├── illustration-02.txt
│       ├── illustration-02.meta.json
│       ├── illustration-03.txt
│       └── illustration-03.meta.json
├── conteudo-html/
│   ├── article.html
│   └── schema.json
└── prompts/
    └── article-brief.md
```

## Validações

- `blog-slug` em **kebab-case**, sem acento, lowercase, máximo ~60 caracteres
- Slug deve estar relacionado ao tema validado contra `blog-themes.md`
- Se Shopify accessível, idealmente validar não-duplicação de slug (senão, flagar)

## Convenções de naming

- Capa: sempre `cover.png` (sem numeração)
- Ilustrativas: `illustration-01.png`, `illustration-02.png`, etc. (com zero-pad)
- Prompts: mesmo basename + `.txt` (prompt) e `.meta.json` (metadata)
- Article: sempre `article.md` / `article.json` / `article.html`
- Schema: sempre `schema.json`

## Exemplo

Usuário pede: "blog sobre cachos no verão pra Ápice, com 3 ilustrativas"

```
conteudos/apice/blogs/cuidados-com-cachos-no-verao/
├── textos/
│   ├── article.md
│   └── article.json
├── imagens/
│   ├── generated/
│   │   ├── cover.png
│   │   ├── illustration-01.png
│   │   ├── illustration-02.png
│   │   └── illustration-03.png
│   └── prompts/
│       ├── cover.txt
│       ├── cover.meta.json
│       ├── illustration-01.txt
│       ├── illustration-01.meta.json
│       ├── illustration-02.txt
│       ├── illustration-02.meta.json
│       ├── illustration-03.txt
│       └── illustration-03.meta.json
├── conteudo-html/
│   ├── article.html
│   └── schema.json
└── prompts/
    └── article-brief.md
```

## 🚨 Regras

- ❌ Nunca usar acento/espaço/maiúscula em paths
- ❌ Nunca colocar 2 posts diferentes na mesma pasta
- ✅ `mkdir -p` automático conforme necessário
- ✅ Validar slug único antes de criar pasta
