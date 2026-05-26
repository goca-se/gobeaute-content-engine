# Formato: Ícones de Benefício

3 ícones PNG (transparente) + 3 títulos de benefício. **Requer geração de imagem via piapp-image-gen.**

## ⚠️ Inputs CRÍTICOS — bloquear se faltar

- ✅ Marca + produto confirmados
- ✅ DNA visual da marca (do bundle)
- ✅ Paleta (do bundle)
- ✅ **3 benefícios principais** (PERGUNTAR se não explícito)
- ✅ Estilo de ícone (linha / flat / 3D / hand-drawn) → PERGUNTAR se não definido no brandbook

---

## 📐 Estrutura

```
[ÍCONE 1]    [ÍCONE 2]    [ÍCONE 3]
[Título 1]   [Título 2]   [Título 3]
```

### Títulos
- 2-4 palavras
- Concretos e diferenciados
- Tom da marca

### Ícones
- PNG transparente
- 1:1 (1024x1024)
- Mesmo estilo entre os 3 (CRÍTICO pra consistência)

---

## 🎨 Geração via piapp-image-gen

Delegar para `piapp-image-gen` com:
- `purpose`: `pdp-icon`
- `tool`: `generate_image_batch` (3 prompts numa chamada — garante consistência)
- `aspect_ratio`: `1:1`
- `quality`: `standard`
- `background`: transparent (se PiApp suportar; senão flagar pra remoção)
- `output_path`: `conteudos/[marca]/produtos/[slug]/icones/imagens/`

### Template de prompt (passar pra piapp-image-gen)

```
A minimalist [STYLE: line art / flat / 3D rendered] icon representing
"[BENEFIT_TITLE]" for a beauty product.

Visual style: [BRAND_VISUAL_DNA].
Color palette: [BRAND_PRIMARY_HEX] on transparent background.

Background: transparent. Square 1:1.
NO text. NO letters. NO numbers. NO logos.
Centered composition. Simple geometry, recognizable at 32x32px.

The icon should clearly communicate [BENEFIT_DESCRIPTION].

Style consistent with [BRAND_NAME]: [BRAND_VISUAL_DNA].
```

---

## 🚨 Guardrails

- ❌ Não gerar ícones com estilos diferentes entre si
- ❌ Não incluir texto/letras
- ❌ Não usar fotos realistas (são ÍCONES)
- ❌ Não inventar benefícios não validados
- ✅ Mesmo estilo + paleta + stroke entre os 3
- ✅ Salvar prompts antes de gerar
- ✅ Apresentar prompts pra aprovação do usuário

---

## 📁 Output

```
conteudos/[marca]/produtos/[slug]/icones/
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
        └── ... (2 e 3)
```

### JSON

```json
{
  "metafield_key": "icones",
  "value": {
    "items": [
      {
        "title": "Definição Duradoura",
        "icon_path": "imagens/generated/image-01.png",
        "prompt_path": "imagens/prompts/prompt-01.txt"
      },
      {
        "title": "Hidratação Profunda",
        "icon_path": "imagens/generated/image-02.png",
        "prompt_path": "imagens/prompts/prompt-02.txt"
      },
      {
        "title": "Vegano e Cruelty-Free",
        "icon_path": "imagens/generated/image-03.png",
        "prompt_path": "imagens/prompts/prompt-03.txt"
      }
    ]
  }
}
```

## ✅ Checklist

- [ ] 3 ícones mesmo estilo visual?
- [ ] Paleta reflete a marca?
- [ ] Reconhecível em 32x32px?
- [ ] Sem texto nos ícones?
- [ ] Títulos concretos e diferenciados?
