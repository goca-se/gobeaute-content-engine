# Geração headless de PDP — {{marca}} · {{handle}}

Você está rodando no **content pipeline em modo headless** (sem humano no loop). Estas instruções têm prioridade sobre as do `CLAUDE.md` e das skills **apenas** nos pontos abaixo:

- **Nunca pergunte nada.** Se faltar informação para um formato, não invente: escreva `blocked.json` naquele formato (ver "Saída") e siga para o próximo.
- **Nunca chame Shopify, PiApp ou qualquer MCP.** Você não tem acesso e não precisa: todo o contexto está nos arquivos abaixo. A publicação é feita depois, por um script, a partir do `shopify-payload.json` que você escrever.
- **Não gere imagens.** Campos de imagem ficam fora do payload.
- Escreva **somente** dentro de `{{dir_produto}}/`.

Todo o resto das regras do projeto continua valendo: tom de voz da marca, compliance ANVISA, nunca alucinar ingrediente/claim/número, convenções Goshop da skill `pdp-content`.

## Contexto (leia antes de escrever)

1. `{{ficha_path}}`: ficha do produto (origem: **{{ficha_origem}}**), dados do produto e avaliações Judge.me (se houver). É a **única** fonte de fatos sobre o produto.
2. `brand-context/{{marca}}/brandbook.md`: tom de voz.
3. `brand-context/_shared/compliance-anvisa.md`: termos proibidos e regras de claim.
4. `.claude/skills/pdp-content/SKILL.md` e, para cada formato pedido, o `references/format-*.md` correspondente.
5. `.claude/skills/pdp-content/references/shopify-payload-schema.md`: **schema obrigatório** do payload (`pdp-payload/v1`).
6. `{{catalogo_path}}`: metaobjetos que já existem na loja, por tipo (id, handle, fields). Use para **reuso** (regra "reuso > criação" da skill).

{{feedback}}

## Produto

- Título: {{title}}
- Handle (também é o slug de pasta e o prefixo de handles novos): `{{handle}}`
- Product GID: `{{product_gid}}`
- Loja: `{{shop}}`

## Formatos a gerar (só estes: os outros já estão preenchidos ou fora do piloto)

{{formatos}}

## Regras por formato (complementam as references)

- **descricao-curta** (`product_benefit`): 1 metaobjeto novo `{{handle}}-benefits` com `descricao` (rich_text), `titulo_destacado` (rich_text, curto, caixa alta), `beneficios` (lista JSON de 4 a 6 strings, cada uma começando com emoji semântico), `cor_bullet_point` = `""`.
- **faq** (`faq_item`): de 5 a 7 perguntas no total. Reuse um `faq_item` do catálogo **só** se a pergunta for genérica, a resposta continuar verdadeira para este produto (ex.: cruelty-free) **e** o handle for universal (não começa com o handle de outro produto). Sem item universal adequado, crie um novo. Perguntas novas: handle `{{handle}}-faq-N`, `answer` em rich_text. Priorize as perguntas da ficha (coluna FAQ), se existirem.
- **section-efficacy** (`eficiencia_item`): de 3 a 5 cards. **Card numérico só com fonte**: a prova de eficácia da ficha (citada) ou as avaliações Judge.me do arquivo de contexto, com `footnote` no formato `*Base: N avaliações Judge.me, <mês>/<ano>` (não escreva "verificadas": a ficha não afirma isso). Use **um** card numérico de avaliações (nota média), não dois cards com o mesmo dado. Badges (selos): **reuse** `eficiencia_item` do catálogo quando o selo bater (eles já têm ícone). Selo novo: só `text` + `state: Active`, sem ícone.
- **como-usar** (`como_usar`): 1 metaobjeto `{{handle}}-como-usar` com `steps` (lista JSON de 5 a 8 passos, imperativo, 1 linha cada), baseado no modo de uso da ficha. Sem campo `file`.
- **modo-de-uso** / **precaucoes** / **composicao** (rich_text direto no metafield): `metaobjects: []`, `metafield.value` = rich_text JSON. `composicao` só com INCI literal da ficha.

## Saída (obrigatória, regra #0)

Para cada formato, em `{{dir_produto}}/<formato>/textos/`:

1. `content.md`: o conteúdo legível, como um revisor humano vai ler.
2. `content.json`: o conteúdo estruturado (mesma forma das rodadas anteriores: `brand`, `product_slug`, `product_gid`, `metafield`, `value`).
3. `shopify-payload.json`: **exatamente** no schema `pdp-payload/v1`, com `formato` igual ao nome da pasta.

Se não der para gerar um formato com fidelidade, escreva **apenas** `{{dir_produto}}/<formato>/blocked.json` com `{"motivo": "<motivo curto em snake_case>", "detalhe": "<1 frase>"}`.

Não escreva `[VALIDAR]` nem `[REGULATÓRIO]` no conteúdo: se precisaria dessas marcas, o formato está bloqueado.

Ao terminar, responda em uma linha: `OK <n formatos gerados> / BLOQUEADOS <lista>`.
