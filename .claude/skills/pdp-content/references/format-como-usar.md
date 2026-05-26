# Formato: Como Usar

**5 a 8 passos** + **1 imagem** ilustrando. Versão rica do Modo de Uso textual.

## Inputs necessários

- ✅ Marca + produto confirmados
- ✅ Modo de aplicação real
- ✅ Quantidade recomendada
- ✅ Frequência de uso

Pra imagem:
- ✅ Tipo de mídia (foto única, sequência, ou GIF — esta versão suporta só foto única)
- ✅ Estilo (mãos aplicando, autoaplicação, modelo)
- ✅ Brandbook visual

---

## 📐 Estrutura

### Texto — 5 a 8 passos

- Mínimo 5, máximo 8
- 1 linha cada (~10-15 palavras)
- Numerados
- Imperativo direto ("Aplique...", "Massageie...")
- Tom comercial (não bula)

### Imagem — 1 foto ilustrativa

Single shot via `generate_image` (não batch).

---

## 📝 Exemplos

### Hair Care (Ápice — Shampoo)

```markdown
## Como usar

1. Molhe completamente os cabelos com água morna.
2. Aplique uma porção do shampoo nas mãos e espalhe no couro cabeludo.
3. Massageie em movimentos circulares por 30 segundos.
4. Distribua a espuma pelo comprimento, sem esfregar.
5. Enxágue até remover todo o produto.
6. Repita se sentir necessidade.
7. Finalize com o Condicionador Cachos Ápice.

**Frequência:** 2-3x por semana.
```

### Skincare (Lescent — Sérum)

```markdown
1. Comece com a pele limpa e seca.
2. Aplique 2-3 gotas do sérum na ponta dos dedos.
3. Espalhe suavemente no rosto, evitando a área dos olhos.
4. Faça movimentos ascendentes do queixo até a testa.
5. Toque suave no pescoço e colo.
6. Aguarde 30s antes de aplicar o hidratante.

**Frequência:** 2x ao dia.
```

---

## 🎨 Geração da imagem via piapp-image-gen

`purpose`: `pdp-how-to-use`
`tool`: `generate_image`
`aspect_ratio`: `4:5` ou `1:1`
`quality`: `high`

### Template prompt (passar pra piapp-image-gen)

```
Photorealistic high-quality beauty product photography.
Showing [APPLICATION_ACTION — hands massaging shampoo / fingertips applying serum].

Subject: [SUBJECT_DESCRIPTION — pessoa, mãos, contexto].
Setting: [BRAND_SETTING — bathroom / vanity / lifestyle].

Lighting: soft natural daylight, [BRAND_LIGHTING_STYLE].
Color palette: [BRAND_PALETTE].

Aspect ratio: 4:5.
Mood: aspirational but accessible. Authentic.

NO text. NO logos. NO visible labels.

Style consistent with [BRAND_NAME]: [BRAND_VISUAL_DNA].
```

---

## 🚨 Guardrails

- ❌ Mais de 8 ou menos de 5 passos
- ❌ Passos com mais de 1 ação
- ❌ Tom de bula
- ❌ Esquecer frequência
- ❌ Inventar quantidade exata
- ❌ Citar produtos complementares sem confirmar existência
- ❌ Imagens com texto/logo
- ✅ Passos sequenciais, imperativos
- ✅ Frequência clara ao final

---

## 📁 Output

```
conteudos/[marca]/produtos/[slug]/como-usar/
├── textos/
│   ├── content.md
│   └── content.json
└── imagens/
    ├── generated/
    │   └── image-01.png
    └── prompts/
        ├── prompt-01.txt
        └── prompt-01.meta.json
```

### JSON

```json
{
  "metafield_key": "como-usar",
  "value": {
    "steps": [
      "Molhe completamente os cabelos com água morna.",
      "Aplique uma porção do shampoo nas mãos..."
    ],
    "frequency": "2-3x por semana",
    "media": {
      "type": "image",
      "path": "imagens/generated/image-01.png",
      "prompt_path": "imagens/prompts/prompt-01.txt"
    }
  }
}
```

## ✅ Checklist

- [ ] 5 a 8 passos?
- [ ] Cada passo em imperativo direto, 1 ação?
- [ ] Frequência clara?
- [ ] Tom de voz da marca?
- [ ] Produtos complementares (se citados) existem?
- [ ] Imagem sem texto/logo?
