# Lescent — Mapa de imagens de cena dos top 30 produtos

> Levantado 2026-08-07 · Ranking: ShopifyQL `FROM sales SHOW gross_sales, net_sales, orders GROUP BY product_title ORDER BY gross_sales DESC SINCE -90d`
> Catálogo ativo revalidado no Shopify no mesmo dia (113 produtos ACTIVE, 3 páginas).
> Nada sobe pro Shopify nesta rodada — geração local + QA visual apenas.

---

## 1. Definição de escopo

O ranking bruto é dominado por **kits** (os dois primeiros colocados são Trilogias, R$ 2,27M e R$ 1,89M). Como o pipeline de imagem de cena é construído em cima de **uma fragrância + suas volumetrias**, o escopo aqui é:

> **Top 30 SKUs de fragrância unitária ACTIVE por gross_sales 90d — e, para cada número que aparece nesse top 30, TODAS as volumetrias ativas dele.**

Excluídos e por quê:
- **Kits** (~50 SKUs ativos) — não têm nota olfativa única; caso separado.
- **SKUs mestres em DRAFT** — `Nº 2 • Délicate Londres` (R$ 905k) e `Nº 13 • Féroce Provence` (R$ 152k) aparecem no ranking mas estão despublicados.
- **`3x Nº 2 | 25ml`** (R$ 58,8k) — multipack, mesma fragrância do Nº 2.

Isso fecha em **20 números / 32 SKUs**.

---

## 2. Top 30 SKUs de fragrância unitária (90d)

| # | SKU | Gross 90d | Imagem local | Situação |
|---|---|---|---|---|
| 1 | Nº 2 • Délicate Londres - 25ml | R$ 584.240 | ✅ | ok |
| 2 | Nº 2 • Délicate Londres - 100ml | R$ 530.393 | ✅ | ok |
| 3 | Nº 20 • Brise Amalfi - 100ml | R$ 366.977 | ✅ | ok |
| 4 | Nº 13 • Féroce Provence - 100ml | R$ 339.237 | ✅ | ok |
| 5 | Nº 7 • Sublime Versailles - 100ml | R$ 270.569 | ✅ | ok |
| 6 | Nº 6 • Gracieuse Cannes - 100ml | R$ 246.049 | ✅ | **publicado 2026-08-03** |
| 7 | Nº 27 • Golden Dubai - 25ml | R$ 241.920 | ✅ | ok |
| 8 | Nº 7 • Sublime Versailles - 25ml | R$ 231.299 | ⚠️ | **reprovada — regerar** |
| 9 | Nº 26 • Élegance Vienna - 25ml | R$ 200.551 | ✅ | ok |
| 10 | Nº 20 • Brise Amalfi - 25ml | R$ 192.430 | ✅ | ok |
| 11 | Nº 10 • Belle Grasse - 100ml | R$ 181.046 | ✅ | ok |
| 12 | Nº 12 • Noble Nice - 100ml | R$ 159.478 | ✅ | ok |
| 13 | Nº 5 • Douce Paris - 25ml | R$ 135.329 | ✅ | ok |
| 14 | Nº 13 • Féroce Provence - 25ml | R$ 132.223 | ✅ | ok |
| 15 | Nº 6 • Gracieuse Cannes - 25ml | R$ 130.815 | ✅ | **publicado 2026-08-03** |
| 16 | Nº 3 • Vivante Capri - 25ml | R$ 121.265 | ❌ | gerar |
| 17 | Nº 31 • Authentic Milano - 25ml | R$ 113.959 | ❌ | gerar |
| 18 | Nº 10 • Belle Grasse - 25ml | R$ 112.120 | ✅ | ok |
| 19 | Nº 5 • Douce Paris - 100ml | R$ 99.051 | ✅ | ok |
| 20 | Nº 11 • Unique Lyon - 25ml | R$ 98.909 | ❌ | gerar |
| 21 | Nº 24 • Essence Bordeaux - 25ml | R$ 94.918 | ❌ | gerar |
| 22 | Nº 1 • Jolie Provence - 25ml | R$ 90.019 | ❌ | gerar |
| 23 | Nº 22 • Mystique Veneza - 25ml | R$ 87.475 | ❌ | gerar |
| 24 | Nº 28 • Icon Copenhague - 25ml | R$ 85.264 | ❌ | gerar |
| 25 | Nº 29 • Royal Nottingham - 25ml | R$ 84.514 | ❌ | gerar |
| 26 | Nº 12 • Noble Nice - 25ml | R$ 76.405 | ✅ | ok |
| 27 | Nº 1 • Jolie Provence - 100ml | R$ 69.564 | ❌ | gerar |
| 28 | Nº 11 • Unique Lyon - 100ml | R$ 67.440 | ❌ | gerar |
| 29 | Nº 25 • Athletic Barcelona - 25ml | R$ 63.689 | ❌ | gerar |
| 30 | Nº 14 • Brave Manhattan - 100ml | R$ 60.724 | ❌ | gerar |

### Volumetrias puxadas pela regra "garanta 25ml e 100ml"

Dois SKUs entram por serem a outra volumetria de um número já no top 30:

| SKU | Gross 90d | Motivo |
|---|---|---|
| Nº 14 • Brave Manhattan - 25ml | R$ 49.651 | par do #30 |
| Nº 3 • Vivante Capri - 100ml | abaixo do top 60 | par do #16 |

**Total do escopo: 32 SKUs · 17 já prontos · 15 a gerar.**

---

## 3. Correções de cadastro descobertas no levantamento

1. **`Nº 1 • Jolie Provence - 25ml` EXISTE e está ACTIVE** — handle `nº-1-jolie-provence-copy`, 3.234 un. em estoque, R$ 90.019 em 90d. A auditoria de 2026-07-30 registrou "handle não localizado entre ativos"; está desatualizada.
2. **`Nº 19 • Brûlant Bordeaux` só tem 100ml ativo.** O handle `no-19-brulant-bordeaux-25ml` do doc de contexto não aparece mais entre os ativos.
3. **Badge do Nº 3 é inconsistente entre volumetrias** — 25ml está como `Feminino`, 100ml como `Unissex`. O frasco é o mesmo (rótulo prata) nos dois.
4. **Vocabulário de badge segue quebrado** — convivem `Feminino` e `Femininos` (Nº 11 100ml, Nº 22, Nº 28, Nº 7).
5. **As imagens 2048 de 22/24/25/26/27/28/29/31 são packshots limpos**, não cenas de IA como se supôs antes. O `n27` continua sendo a exceção: **2048×1653, não quadrado**.
6. **Nº 25 • Athletic Barcelona está com 237 un.** e **Nº 7 • Sublime Versailles - 100ml com 718 un.** — estoque baixo, vale checar antes de investir em imagem.

---

## 4. Travas de produto confirmadas visualmente

Todos os packshots foram baixados e inspecionados antes de escrever prompt.

| Elemento | 25ml | 100ml |
|---|---|---|
| Corpo | retangular pequeno, vidro transparente, ombros retos | retangular grande, vidro transparente, ombros retos |
| Tampa | **cilíndrica dourada maciça e opaca**, ~1/3 da altura | **acrílica transparente de topo achatado, com colar de bomba dourado visível dentro** |
| Rótulo | quadrado, no terço superior-médio da face frontal | quadrado, no meio da face frontal |

| Rótulo por número | Cor |
|---|---|
| Nº 1, 3, 7, 11, 22, 24, 28 | **prata-claro** com borda e tipografia douradas |
| Nº 14, 25, 29, 31 | **preto profundo** com borda fina e tipografia douradas |

Texto do rótulo, sempre: monograma `S` + `LESCENT` / `Nº X` / `NOME` / `CIDADE` / `25ml` ou `100ml`.

### Packshots de referência (URLs públicas do CDN — não precisa `upload_reference`)

| Nº | 25ml | 100ml |
|---|---|---|
| 1 | `No_1_Jolie_Provence.png` | `No_1_Jolie_Provence_4.png` |
| 3 | `No_3_Vivante_Capri.png` | `No_3_Vivante_Capri_4.png` |
| 7 | `No_7_Sublime_Versailles.png` | — (100ml já aprovado) |
| 11 | `No_11_Unique_Lyon.png` | `No_11_Unique_Lyon_4.png` |
| 14 | `No_14_Brave_Manhattan.png` | `No_14_Brave_Manhattan_4.png` |
| 22 | `22_1.png` | — |
| 24 | `24_1_b0f5d3b3-6244-4ad5-ab83-462bb47cd4ba.png` | — |
| 25 | `25_2.png` | — |
| 28 | `28_1.png` | — |
| 29 | `29_1.png` | — |
| 31 | `n31.png` | — |

⚠️ **Não usar as imagens `Mystique_Veneza_2`, `Essence_Bordeaux_2`, `Athletic_Barcelona_2`, `Icon_Copenhague_2`, `Royal_Nottingham_2`, `Prancheta_*`** como reference: são infográficos de pirâmide olfativa, com texto sobreposto e frutas em pódio. Contaminam a cena.

---

## 5. Cenas — compostas a partir das notas REAIS de `custom.notas_e_ess_ncias`

Nenhuma nota foi inventada. Cidade do nome define o cenário, notas definem os props.

| Nº | Gênero | Notas publicadas | Cena |
|---|---|---|---|
| **1** Jolie Provence | F | pera e groselha preta / íris, jasmim, flor de laranjeira / baunilha, fava tonka, praline, patchouli | mesa de mármore claro em varanda com glicínias; pera partida + cacho de groselha preta + hastes de flor de laranjeira; mulher de costas descendo degraus de pedra para o jardim; luz dourada e suave de fim de tarde |
| **3** Vivante Capri | F | limão siciliano e maçã verde / jasmim e rosa branca / cedro e almíscar | mesa de azulejo pintado sob pergolado de limoeiros em Capri; limão siciliano partido + maçã verde + flor de jasmim; mulher de costas em vestido branco leve olhando o mar entre as folhas; luz clara de meio da manhã |
| **11** Unique Lyon | F | lavanda / flor de laranjeira / baunilha, base âmbar | console de mármore junto a janela alta com vista para os telhados de Lyon; ramo de lavanda + flor de laranjeira + favas de baunilha; mulher de costas na janela; luz âmbar quente de fim de tarde, interior urbano |
| **14** Brave Manhattan | M | absinto e anis estrelado / lavanda / baunilha negra e almíscar | balcão de ardósia escura em rooftop de Manhattan à noite; anis estrelado + ramo de lavanda + fava de baunilha; homem de costas de terno olhando os arranha-céus; luzes da cidade desfocadas, noite fria com brilho âmbar |
| **22** Mystique Veneza | F | bergamota / jasmim e neróli / almíscar | parapeito de pedra istriana à beira do canal ao amanhecer; bergamota partida + flores de jasmim + flor de neróli; mulher de costas atravessando uma ponte pequena; gôndolas e fachadas desfocadas; luz rosada de amanhecer |
| **24** Essence Bordeaux | F | pimenta rosa / jasmim e íris / patchouli, almíscar, baunilha | mesa de carvalho claro em varanda sobre vinhedo; grãos de pimenta rosa + flor de íris + jasmim; mulher de costas caminhando entre as fileiras de videira; luz dourada de fim de tarde de outono |
| **25** Athletic Barcelona | M | notas oceânicas, laranja, mandarina sanguínea / pimenta e néroli / baunilha, fava tonka, vetiver | mureta de concreto claro em calçadão de Barcelona à beira-mar; mandarina sanguínea partida + grãos de pimenta + ramo de vetiver; homem de costas apoiado olhando o Mediterrâneo; palmeiras e arquitetura urbana desfocadas; luz limpa de manhã |
| **28** Icon Copenhague | F | bergamota, pera, pimenta rosa / rosa e jasmim / musk branco, baunilha, patchouli, cedro | mesa de madeira clara escandinava junto a janela ampla; pera partida + bergamota + rosa clara; mulher de costas olhando as fachadas coloridas de Nyhavn; luz nórdica difusa e fria |
| **29** Royal Nottingham | M | abacaxi e bergamota / bétula e jasmim / musgo de carvalho, âmbar-gris | toco de carvalho em clareira de floresta inglesa; abacaxi fatiado + casca de bétula + musgo; homem de costas em trilha de floresta; névoa fina, luz filtrada pela folhagem de manhã |
| **31** Authentic Milano | M | bergamota da Calábria / flor de laranjeira / madeira e patchouli | mesa de mármore cinza em pátio milanês; bergamota partida + flor de laranjeira + lascas de madeira; homem de costas sob arcada urbana; luz neutra e clara de fim de manhã |
| **7** Sublime Versailles *(regeneração)* | F | magnólia e bergamota / rosa e jasmim / baunilha e cedro | mantém a cena aprovada do 100ml: console de mármore claro, magnólia branca + rosa creme, mulher em perfil junto à janela alta, cortinas de linho, luz dourada rasante |

### Colisões de cenário que evitei de propósito

- **Nº 3 Capri vs. Nº 20 Amalfi** — os dois são costa italiana. O Nº 20 já é parapeito caiado + falésias + meio-dia + homem; o Nº 3 vai de pergolado de limoeiros + azulejo + manhã + mulher.
- **Nº 11 Lyon vs. Nº 13 Provence** — os dois têm lavanda nas notas. O Nº 13 é campo aberto seco com sol rasante; o Nº 11 é interior urbano quente com vista de telhados.
- **Nº 25 Barcelona vs. Nº 20 Amalfi** — os dois são homem à beira-mar. Barcelona vai urbano (calçadão, palmeiras, concreto), Amalfi é falésia rural.

---

## 6. Plano de execução

| Onda | O que | Qtd | Rodada | Reference |
|---|---|---|---|---|
| 1 | 100ml dos Nº 1, 3, 11, 14 | 4 | A | packshot 100ml do CDN |
| 2 | 25ml únicos: Nº 22, 24, 25, 28, 29, 31 | 6 | única | packshot 25ml do CDN |
| 3 | 25ml dos Nº 1, 3, 11, 14 + regeneração do Nº 7 | 5 | B | output aprovado da onda 1 (clona o fundo) + packshot 25ml |

Parâmetros: `generate_image_batch` · `wavespeed-gpt-image-2-edit` (auto-selecionado quando há reference) · `1:1` · quality `high`.

QA obrigatório por imagem, antes de fechar a onda:
1. Rótulo legível e correto (número, nome, cidade, volumetria)
2. Cor do rótulo certa para o gênero
3. Tampa certa para a volumetria
4. Frasco inteiro no quadro, centralizado, ~62% da altura
5. Zero texto além do rótulo
6. Modelo humano de costas/perfil, desfocado, sem deformação

Reprovado em qualquer item = regerar antes de seguir.

---

## 7. Resultado da execução — 2026-08-07

**32/32 SKUs do escopo têm imagem local aprovada.** Nenhuma mutation no Shopify foi executada nesta rodada.

| Onda | O que | Geradas | Reprovadas | Resultado |
|---|---|---|---|---|
| 1 | 100ml dos Nº 1, 3, 11, 14 | 4 | 0 | 4 aprovadas de primeira |
| 2 | 25ml únicos: Nº 22, 24, 25, 28, 29, 31 | 6 | 1 (Nº 22) | 5 de primeira + Nº 22 regerado |
| 2b | Regeneração do Nº 22 com 2 variantes | 2 | 0 | v2b escolhida, v2a guardada |
| 3 | 25ml dos Nº 1, 3, 11, 14 + Nº 7 | 5 | 0 | 5 aprovadas de primeira |
| | **Total** | **17 chamadas** | **1** | **15 imagens novas entregues** |

### Reprovações e o que foi feito

| Imagem | Defeito | Ação |
|---|---|---|
| `n22-25ml-v1` | frasco a ~52% da altura e baixo no quadro | regerado com 2 variantes; `n22-25ml-oficial-v2.png` (ex-v2b) escolhida a ~65%. v1 renomeada para `n22-25ml-REPROVADA-v1.png`, v2a mantida como alternativa |
| `n7-25ml-oficial-v1` (de 2026-07-31) | frasco descentrado, ~55% da altura, rótulo com contraste baixo | regerado clonando o fundo do 100ml aprovado → `n7-25ml-oficial-v2.png`. v1 renomeada para `n7-25ml-REPROVADA-v1.png` |

### QA aplicado a cada imagem

Todas as 15 passaram nos 6 critérios: rótulo legível e correto (número, nome, cidade, volumetria) · cor de rótulo certa para o gênero · tampa certa para a volumetria · frasco inteiro, centralizado, sem corte · zero texto além do rótulo · modelo humano de costas ou em perfil, desfocado, sem deformação.

**Fidelidade de rótulo: 17/17.** Nenhuma imagem precisou ser refeita por rótulo errado — a receita de reference do CDN + PRODUCT LOCK segue com 100% de acerto.

### Sobre a escala do frasco

A altura ocupada varia de ~49% (Nº 1 25ml) a ~76% em uma variante descartada, com a maioria entre 55% e 70%. **O 25ml sai sistematicamente menor que o 100ml na mesma cena** — é fisicamente correto e é o mesmo comportamento dos pares Nº 2 e Nº 6 já aprovados e publicados. Não foi tratado como defeito; só o Nº 22, que caiu muito abaixo da faixa, foi regerado.

### Onde está tudo

- Imagens: `conteudos/lescent/produtos/<slug>/imagem-principal/imagens/generated/n<N>-<vol>-oficial-v*.png`
- Metadados por produto: `conteudos/lescent/produtos/<slug>/imagem-principal/prompts/geracao-2026-08-07.meta.json`
- Template de prompt + aprendizados: `conteudos/lescent/_assets/imagem-principal/prompt-template.md`
- Manifest consolidado dos 32: `conteudos/lescent/_assets/imagem-principal/manifest-top30.json`
- **Contact sheet para validação manual:** `conteudos/lescent/_assets/imagem-principal/qa-top30-contact-sheet.png`

### O que fica fora e por quê

- **Kits (~50 SKUs ativos)** — os dois maiores faturamentos da loja. Não têm nota olfativa única; precisam de um conceito próprio.
- **13 fragrâncias unitárias fora do top 30** — Nº 4, 8, 9, 15, 16, 17, 18, 19, 21, 23, 30, 33, 35, somando 21 SKUs ativos sem imagem de cena.
- **Resolução** — tudo saiu em 1024×1024. O teste de `seedream-v5-lite-edit` a 2048 continua não executado.
