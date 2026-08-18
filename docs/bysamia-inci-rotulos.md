# By Samia — INCI e método de extração lidos do RÓTULO FÍSICO

Fonte: imagem do produto no CDN da loja, lida em **2026-07-29**. É a **fonte regulatória** — prevalece sobre `brand-context/bysamia/produtos.csv` e sobre o brandbook, que continham 7 erros de espécie/método.

Template do rótulo By Samia (idêntico em todo o catálogo):

```
BY SAMIA
ÓLEO ESSENCIAL  |  ÓLEO VEGETAL
[NOME COMERCIAL]
[nome INCI em inglês]
[método de extração]
[volume]
```

## Óleos essenciais (18 confirmados)

| Produto | INCI no rótulo | Método | vs. CSV/brandbook |
|---|---|---|---|
| Lavanda 10ml | Lavandula angustifolia | Destilado de flores | ✅ |
| Alecrim 10ml | Rosmarinus officinalis leaf oil | Destilado de folhas | ✅ (QT1 Cânfora vem da description, não do rótulo) |
| Laranja 10ml | **Citrus aurantium dulcis** | **Prensado a frio da casca** | ⚠️ CSV: *Citrus sinensis* |
| Tea Tree 10ml | Melaleuca alternifolia leaf oil | Destilado de folhas | ✅ |
| Hortelã Pimenta 10ml | Mentha piperita oil | Destilado de folhas | ✅ |
| Eucalipto Globulus 10ml | Eucalyptus globulus leaf oil | Destilado de folhas | ✅ |
| Ylang-Ylang 5ml | Cananga odorata flower oil | Destilado de flores | ✅ |
| Limão Siciliano 10ml | Citrus limon peel oil | **Destilado da casca** | 🔴 não é prensado a frio |
| Copaíba 10ml | **Copaifera officinalis** resin oil | Destilado da resina | ⚠️ CSV: *Copaifera spp.* |
| Lemongrass 10ml | **Cymbopogon schoenanthus** | Destilado de folhas | 🔴 CSV: *Cymbopogon citratus* |
| Patchouli 5ml | Pogostemon cablin oil | Destilado de folhas | ✅ |
| Hortelã do Brasil 10ml | Mentha arvensis leaf oil | Destilado de folhas | ✅ |
| Vetiver 5ml | Vetiveria **zizanoides** root oil | Destilado da raiz | ⚠️ grafia (CSV: zizanioides) |
| Gerânio Bourbon 5ml | Pelargonium graveolens flower oil | Destilado de flores | ✅ |
| Bergamota 5ml | **Citrus aurantium bergamia** | Prensado a frio da casca | ⚠️ CSV: *Citrus bergamia* |
| Cravo 10ml | **Eugenia caryophyllus** leaf oil | Destilado de folhas | 🔴 CSV: *Syzygium aromaticum*; e é **folha**, não botão |
| Cedro 10ml | **Juniperus virginiana** oil | Destilado dos frutos e folhas | 🔴 CSV: *Cedrus atlantica* — **gênero diferente** |
| Citronela 10ml | Cymbopogon nardus oil | Destilado da erva | ✅ |
| Sândalo 5ml | **Amyris balsamifera** bark oil | Destilado da casca | 🔴🔴 brandbook: *Santalum album*. O rótulo diz **"SÂNDALO AMYRIS"** |
| Petitgrain 10ml | **Citrus aurantium amara** | Destilado de folhas | ⚠️ CSV: *Citrus aurantium* |
| Tangerina 10ml | **Citrus tangerina** peel oil | Destilado da casca | 🔴 CSV: *Citrus reticulata* |
| Manjerona 5ml | Origanum majorana leaf oil | Destilado de folhas | ✅ |

## Óleos vegetais (4 confirmados)

O rótulo dos vegetais usa a 3ª linha para **uso**, não para método.

| Produto | INCI no rótulo | 3ª linha |
|---|---|---|
| Rosa Mosqueta 30ml | Rosa rubiginosa seed oil | Óleo carreador para corpo e rosto |
| Semente de Uva 100ml | Vitis vinifera seed oil | Óleo carreador para corpo e rosto |
| Amêndoa Doce 100ml | Prunus amygdalus dulcis oil | Óleo carreador para corpo e rosto |
| Jojoba 30ml | Simmondsia chinensis seed oil | Óleo carreador para corpo e rosto |

## 🔴 O caso Sândalo — precisa de decisão do time de marca

O rótulo do produto diz **"SÂNDALO AMYRIS — Amyris balsamifera bark oil"**. O brandbook (§7.1) e o `produtos.csv` afirmam **"Santalum album — meditação profunda e Zen"**.

Não é sinônimo: *Amyris balsamifera* (sândalo das Índias Ocidentais, família Rutaceae) e *Santalum album* (sândalo indiano verdadeiro, família Santalaceae) são gêneros e famílias diferentes, com perfil aromático e faixa de preço muito distintos. O rótulo está correto e transparente — o nome comercial inclui "Amyris". **O material de marketing é que está desalinhado.**

Ação sugerida: corrigir o brandbook §7.1 e qualquer peça que cite Santalum album. Já corrigido no `produtos.csv`.

## Padrão útil descoberto

**Método de extração varia entre cítricos** e não é dedutível:
- Prensado a frio da casca → Laranja, Bergamota
- Destilado da casca → Limão Siciliano, Tangerina

Qualquer conteúdo que afirme "prensado a frio" para um cítrico sem checar o rótulo tem ~50% de chance de errar.

## Como replicar

```graphql
query { nodes(ids: [...]) { ... on Product {
  handle featuredMedia { preview { image { url(transform: {maxWidth: 900}) } } } } } }
```

Baixar com `curl` e ler a imagem. O rótulo é legível a 900px em todos os SKUs testados. Se o `featuredMedia` for imagem de campanha ou gerada por IA (caso da Copaíba), buscar em `media(first: 4)`.
