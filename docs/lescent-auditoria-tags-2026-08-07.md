# Lescent — Auditoria de Tags do Card e do PDP

**Data:** 2026-08-07
**Loja:** `568499-ef.myshopify.com`
**Escopo:** 113 produtos com `status:active` (varredura completa, 3 páginas)

---

## 0. As três camadas de rótulo — não confundir

| Camada | Metafield | Onde aparece | Preenchidos |
|---|---|---|---|
| **Badges escuras** sobre a foto | `custom.badges` (`list.single_line_text_field`) | Card + PDP acima do título | 94 de 113 ativos |
| **Pill de perfil olfativo** abaixo da foto ← *a que o Lucas circulou* | `custom.tag_customizada` (`metaobject_reference` → `tag_customizada`) | Card, via `card-tag-customizada.liquid` | 48 de 113 ativos |
| **Chips** no corpo do PDP | `custom.product_bullet_point_metafield` (`list.metaobject_reference` → `product_bullet_point`) | PDP, bloco `jump-product-tag` | 24 de 113 ativos |

⚠️ `custom.badges` não tem controle de cor nem de ordem — o snippet faz `| sort`, ordem alfabética.

---

## 1. PRIORIDADE — Perfil olfativo faltando (`custom.tag_customizada`)

**50 fragrâncias individuais ativas · 38 com pill · 12 sem.**

Sugestão de perfil derivada do `custom.notas_e_ess_ncias` já publicado na loja (nunca de fonte externa).

| # | Produto | GID | Sinal usado | Perfil sugerido | Confiança |
|---|---|---|---|---|---|
| 1 | Nº 1 • Jolie Provence - 25ml | `9960345731379` | irmão 100ml = GOURMAND | **GOURMAND** | alta (espelho) |
| 2 | Nº 3 • Vivante Capri - 100ml | `9960384921907` | irmão 25ml = CÍTRICO | **CÍTRICO** | alta (espelho) |
| 3 | Nº 18 • Essential Tokyo - 25ml | `9960397308211` | irmão 100ml = AQUÁTICO | **AQUÁTICO** | alta (espelho) |
| 4 | Nº 4 • Festive Miami - 100ml | `9960388493619` | champanhe rosé, flor de pêssego, almíscar + madeiras | **FRUTADO** | média |
| 5 | Nº 4 • Festive Miami - 25ml | `9960388591923` | idem | **FRUTADO** | média |
| 6 | Nº 9 • Magnétique NY - 100ml | `9960389935411` | café, amêndoa, fava tonka, cacau | **GOURMAND** | alta |
| 7 | Nº 9 • Magnétique NY - 25ml | `9960389706035` | idem | **GOURMAND** | alta |
| 8 | Nº 16 • Dynamique Le Mans - 25ml | `9960397111603` | limão, gengibre, **base aquática**, vetiver, cedro | **AQUÁTICO** | alta |
| 9 | Nº 17 • Sublime Monte-Carlo - 100ml | `9960398389555` | limão siciliano + bergamota → sândalo, pimenta rosa → baunilha, vetiver | **AMADEIRADO** | ⚠️ baixa — abre cítrico, fecha amadeirado |
| 10 | Nº 17 • Sublime Monte-Carlo - 25ml | `9960398258483` | idem | **AMADEIRADO** | ⚠️ baixa |
| 11 | Nº 21 • Luxe Saint-Tropez - 25ml | `9960394621235` | toranja, hortelã, canela, rosa, couro, âmbar, patchouli | **AMADEIRADO** | ⚠️ baixa — é especiado/couro, e não existe pill ESPECIADO |
| 12 | Nº 33 • OPULENCE GENEVA - 25ml | `9993517859123` | maçã, tangerina, cardamomo, manga, lavanda, baunilha, âmbar, teca | **FRUTADO** | ⚠️ baixa — poderia ser AMADEIRADO |

**Os 4 casos de confiança baixa precisam de decisão sua** — são fragrâncias de arco (abrem numa família, fecham noutra). O `tag_customizada` só aceita UM valor.

**Lacuna estrutural:** o catálogo de pills tem 9 perfis (FLORAL, FRUTADO, CÍTRICO, AMADEIRADO, AQUÁTICO, AROMÁTICO, FRESCO, GOURMAND, ALMISCARADO) mas **não tem ESPECIADO**, que existe no catálogo de chips (`familia-especiado`, `232417820979`). Nº 21 e Nº 33 seriam candidatos naturais.

### Catálogo de pills disponível (reuso — não criar novo)

| GID | Texto | BG / Texto |
|---|---|---|
| `232507048243` | FLORAL | `#F3EDE7` / `#6B5B4E` |
| `232507081011` | FRUTADO | `#F3EDE7` / `#6B5B4E` |
| `232507113779` | CÍTRICO | `#F3EDE7` / `#6B5B4E` |
| `232507146547` | AMADEIRADO | `#F3EDE7` / `#6B5B4E` |
| `232507179315` | AQUÁTICO | `#F3EDE7` / `#6B5B4E` |
| `232507212083` | AROMÁTICO | `#F3EDE7` / `#6B5B4E` |
| `232507244851` | FRESCO | `#F3EDE7` / `#6B5B4E` |
| `232507277619` | GOURMAND | `#F3EDE7` / `#6B5B4E` |
| `232507310387` | ALMISCARADO | `#F3EDE7` / `#6B5B4E` |
| `232417886515` | KIT COMPLETO | `#8C5E3C` / `#FFFFFF` |
| `232507343155` | LANÇAMENTO | `#1A1A1A` / `#E6BD8A` |

### Kits sem pill

**63 produtos não-fragrância ativos · 10 com KIT COMPLETO · 53 sem.**

Os 10 que têm são todos da família "Kit Trilogia Essencial" + Gold + Sexteto Feminino + Quarteto Hits Femininos + Dueto Essencial Masculino. Todo o resto (Duetos, Quartetos, Caixas, linha "Presente pra…", "3x Nº X") está sem.

Decisão pendente: `KIT COMPLETO` em todo kit é redundante com a badge que já diz "Kit"? Se sim, o correto seria usar `LANÇAMENTO` nos kits novos e deixar o resto vazio, em vez de preencher os 53.

---

## 2. Badges (`custom.badges`) — 19 ativos sem nenhuma

| Produto | Observação |
|---|---|
| **Nº 10 • Belle Grasse - 100ml** | ⚠️ **única fragrância individual sem badge** — o 25ml tem `["Femininos"]` |
| Caixa + Kit Trilogia Nº 2 + Nº 8 + Nº 28 | ⚠️ **órfão total**: sem badges, sem tags de produto, sem pill |
| Creme Desodorante para Mãos Nº 1 (brinde) | provavelmente proposital |
| Caixa de Presente | tem `["Estoques Limitados"]` — ok |
| Kit Dueto Belle Grasse · Douce Paris · Sublime Versailles | trio recém-criado |
| Kit Dueto Dia e Noite Nº 17+29 · Nº 6+8 | |
| Kit Quarteto Clássicos Femininos · Ícones Masculinos | |
| Kit Sexteto Feminino · Unissex | |
| Kit Trilogia Nº12+25+35 · Nº13+12+27 · Nº13+27+33 · Nº2+22+28 · Nº20+23+29 · Nº20+25+27 · Nº6+26+30 | 7 kits da mesma leva |

### Vocabulário inconsistente (badges ordenam alfabeticamente — plural muda a posição)

| Variantes encontradas | Deveria ser |
|---|---|
| `Feminino` · `Femininos` | 1 forma só |
| `Masculino` · `Masculinos` | 1 forma só |
| `Best-Seller` · `Best-Sellers` · **`Best- Seller`** (com espaço no meio) | 1 forma só |
| `Lançamento` · `Lançamentos` | 1 forma só |

`Best- Seller` aparece em *Kit Trilogia Essencial Masculina: Nº 20 | 100ml + Nº 12 + Nº 13 | 25ml* (`9781350891827`) — erro de digitação em produção.

Outras badges em uso: `Unissex`, `Estoques Limitados`, `Kit Confra`, `1 Feminino + 1 Masculino`, `2 Feminino + 2 Masculino`.

---

## 3. Chips do PDP (`custom.product_bullet_point_metafield`) — 24 de 113

Das 50 fragrâncias individuais ativas, **28 estão sem chips**. O padrão de falha é o mesmo do
perfil olfativo: **uma volumetria recebeu, a irmã não.**

**Com chips:** Nº 1 (100ml), Nº 2 (ambos), Nº 5 (100ml), Nº 8 (ambos), Nº 11 (ambos), Nº 12 (25ml), Nº 14 (ambos), Nº 15, Nº 18 (100ml), Nº 19 (100ml), Nº 22, Nº 23, Nº 24, Nº 25, Nº 28, Nº 29, Nº 30, Nº 35 · + 2 kits.

**Sem chips:** Nº 1 (25ml), Nº 3 (ambos), Nº 4 (ambos), Nº 5 (25ml), Nº 6 (ambos), Nº 7 (ambos), Nº 9 (ambos), Nº 10 (ambos), Nº 12 (100ml), Nº 13 (ambos), Nº 16, Nº 17 (ambos), Nº 18 (25ml), Nº 20 (ambos), Nº 21, Nº 26, Nº 27, Nº 31, Nº 33.

⚠️ Lembrete: o bloco `jump-product-tag` existe no `lescent-theme/develop` **mas não está no `block_order`** do `templates/product.json` — os chips não renderizam ainda, mesmo preenchidos. Depende do dev.

---

## 4. Mudanças de catálogo detectadas desde 2026-08-03

| Produto | Antes | Agora |
|---|---|---|
| Nº 1 • Jolie Provence - 25ml (`9960345731379`) | DRAFT | **ACTIVE** — republicado; resolve o alerta de R$ 77.823/90d sem SKU ativo |
| Nº 19 • Brûlant Bordeaux - 25ml (`9931779670323`) | ACTIVE | **DRAFT** |
| Kit Sexteto Masculino ×3 | ACTIVE | despublicados |

---

## 5. Compliance ainda em aberto (brandbook §8)

O termo **"uma recriação de X"** continua publicado no `custom.notas_e_ess_ncias`, sem ®️ e sem
nota de não-afiliação, em pelo menos: **Nº 1** (La Vie Est Belle / Lancôme), **Nº 3** (Light Blue /
Dolce & Gabbana), **Nº 4** (212 VIP Rosé / Carolina Herrera), **Nº 33** (Gisada Ambassador).
Já havia sido apontado em 2026-07-31 para Nº 2, 3, 5 e 6 — a passada de correção não foi feita.

O §8 manda usar "inspirado por" / "contratipo", sempre com ®️ e nota de esclarecimento.

---

## 6. Ordem de execução sugerida

1. **12 perfis olfativos** — 8 de confiança alta/média entram direto; 4 esperam sua decisão. 1 `metafieldsSet`.
2. **Nº 10 • Belle Grasse - 100ml** — badge faltando, fragrância individual. 1 linha.
3. **Normalizar vocabulário de badges** — singular/plural + `Best- Seller`. Afeta ~30 produtos.
4. **Caixa + Kit Trilogia Nº 2 + Nº 8 + Nº 28** — órfão total, precisa de badges + tags.
5. **Chips das 28 fragrâncias** — só depois do dev plugar o bloco no `block_order`.
6. **Correção "recriação"** — passada de compliance no `notas_e_ess_ncias`.
