# Color Intelligence — escolha de cores das pills

Duas decisões: **fundo** (semântica de marca) e **texto** (matemática de contraste). Nunca inverter a ordem: fundo primeiro, texto é consequência calculada.

## 1. `tag_background_color` — match semântico com a paleta da marca

Fonte única: seção "Identidade visual" do `brand-context/[marca]/brandbook.md`.

**Ordem de preferência**:

1. **Cor de linha/fórmula com match semântico** — se a marca tem sistema cromático por produto/linha (ex: Rituária) e a collection corresponde a uma linha, usar a cor dela. Ex: collection "Saúde do Intestino" → produtos da Fórmula Prebiótica → `#BC4869`. **Collection multi-linha**: desempatar pelo produto-âncora (a linha presente em mais produtos da collection); se a âncora não tem cor na paleta ou há empate, cair pra regra 2.
2. **Cor secundária da paleta com afinidade temática** — ex: collection calmante/sono → tons frios da paleta; energia → tons quentes. Sempre da paleta, nunca de fora.
3. **Cor institucional secundária** — fallback quando não há match temático (ex: Rituária Verde Sage `#9CAF88`).

**Variações permitidas**: tint/shade de uma cor da paleta (clarear/escurecer mantendo o hue) quando necessário pra contraste — documentar a base no `color_rationale`.

**Proibido**: cor arbitrária fora da paleta; cor primária de OUTRA marca Gobeaute; preto/branco puro como fundo (pills devem carregar identidade).

**Coerência entre collections**: se várias collections da marca vão ganhar tags, variar as cores entre elas usando o sistema da paleta (uma cor por tema), pra collection adjacentes não ficarem idênticas. Registrar quais cores já foram usadas (query dos metaobjects existentes mostra).

## 2. `text_color` — contraste WCAG calculado

Candidatos: **branco `#FFFFFF`**, **ink `#1C1C1C`** e, se o brandbook tiver preto/escuro institucional, ele também (ex: Rituária `#000000`). Calcular TODOS os candidatos e escolher o de maior ratio — registrar todos em `text_candidates`.

**Algoritmo** (rodar de verdade — via node/python inline — não estimar de cabeça):

```js
function lum(hex) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
// text_color = o candidato com maior ratio; exigir >= 4.5, piso absoluto 3.0
```

**Decisão**:

| Resultado | Ação |
|---|---|
| Melhor candidato ≥ 4.5:1 | Usar (AA — texto de pill é pequeno) |
| Melhor candidato entre 3.0 e 4.5 | Aceitável só com aprovação explícita do usuário |
| Melhor candidato < 3.0 | Trocar o fundo: escurecer/clarear o tint mantendo o hue até passar |

**Heurística de sanidade** (o cálculo decide, mas o resultado deve bater com isso): paletas pastéis → ink escuro; cores profundas/saturadas escuras → branco.

## 3. Exemplos calculados (paleta Rituária)

| Fundo | Branco | Ink `#1C1C1C` | Veredito |
|---|---|---|---|
| `#BC4869` Prebiótica | **4.92** ✅ | 3.46 | branco |
| `#F0896D` Imunidade | 2.47 | **6.90** ✅ | ink |
| `#73A2C8` Lumini | 2.72 | **6.27** ✅ | ink |
| `#9CAF88` Verde Sage | 2.36 | **7.22** ✅ | ink |
| `#AE8547` Mostarda | 3.36 | 6.25 ✅ | preto `#000000` (6.25) |
| `#D2E8DF` Micelar | 1.24 | **13.27** ✅ | ink |
| `#FAE4B3` Golden Stick | 1.16 | **13.64** ✅ | ink |

**Anti-exemplo em produção**: branco sobre `#C6BDC7` = **1.83:1** — falha até o piso de 3.0. Com ink `#1C1C1C` o mesmo fundo daria 9.34:1. É o erro que esta reference existe pra impedir.

## 4. Registro obrigatório

Todo output `tags.json` carrega:

```json
"color_rationale": {
  "background_source": "brandbook [marca] — <linha/cor> (match: <tema>)",
  "text_candidates": { "#FFFFFF": 2.47, "#1C1C1C": 6.90 },
  "chosen_text": "#1C1C1C",
  "contrast_ratio": 6.90,
  "wcag": "AA"
}
```

## Erros comuns

| Erro | Correção |
|---|---|
| Escolher texto "no olho" porque o fundo "parece escuro" | Rodar o cálculo. `#AE8547` parece escuro e branco dá só 3.36 |
| Copiar as cores do exemplo vivo (`#C6BDC7`/branco) | Exemplo vivo falha contraste — usar como referência de ESTRUTURA, não de cor |
| Usar a mesma cor pra todas as collections da marca | O sistema cromático existe pra diferenciar temas — variar dentro da paleta |
| Inventar hex "bonito" fora da paleta | Só paleta do brandbook ou tint/shade documentado dela |
