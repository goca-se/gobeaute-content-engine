# Submissão de Projeto — Gobeaute Content Engine (IA Agêntica)

Respostas prontas para o formulário de submissão. Copiar e colar cada bloco no campo correspondente.

---

## BLOCO 2 — SOBRE O PROJETO

### 📌 Cenário inicial com problemática/oportunidade de automação

As PDPs (páginas de produto) e os blogs das lojas Gobeaute tinham conteúdo raso ou inexistente: descrição básica, sem FAQ, sem seção de eficácia, sem modo de uso estruturado, sem ingredientes destacados, sem produção editorial recorrente para SEO. Produzir esse conteúdo manualmente envolvia **5 equipes diferentes** — Produto (ficha técnica, composição, INCI, claims), Marketing (redação e imagens), Growth (SEO e briefing), Tech (cadastro de metafields/metaobjects no Shopify) e E-commerce (QA e publicação) — num processo de **~11h de trabalho combinado por produto**, multiplicado por centenas de produtos e 7 marcas com identidades distintas. Blogs seguiam o mesmo gargalo: cada artigo completo (pauta, redação, imagens, HTML, SEO, publicação) consumia ~2 dias de trabalho entre as equipes.

Na prática, o enriquecimento em escala era inviável: as PDPs pobres deixavam receita na mesa (menos confiança, menos resposta a objeções de compra, pior conversão) e a ausência de conteúdo editorial limitava tráfego orgânico, autoridade de marca e presença nas respostas de IAs (GEO).

### 💡 Ideia de solução e seu diferencial




### 🔧 Ferramentas utilizadas

- **Claude Code (Anthropic)** — agente de IA com skills customizadas (orchestrator, brand-context, pdp-content, blog-content, collection-content, piapp-image-gen) e sub-agents para paralelizar a produção
- **Shopify Admin API (GraphQL)** — criação/atualização de metafields, metaobjects, articles e arquivos via MCP
- **PiApp (MCP)** — geração de imagens (capas de blog, ilustrações editoriais, imagens de apoio de PDP) com prompts derivados do DNA visual de cada marca
- **Elevate** — plataforma de testes A/B para validação dos ganhos (split de tráfego controle vs. PDP incrementada)
- **Git/GitHub** — versionamento de todo conteúdo gerado e das skills
- **Base de conhecimento estruturada** — brandbooks, fichas de produto (composição/INCI/claims com fonte) e regras de compliance ANVISA por marca, em formato consumível pelo agente

### ⚙️ Detalhamento da execução do projeto

**1. Estruturação da fonte de verdade:** documentamos brandbook (tom de voz, paleta, DNA visual), fichas de produto (composição, INCI, claims com fonte) e regras de compliance ANVISA por marca, em formato consumível pelo agente.

**2. Engenharia das skills:** criamos skills de Claude Code com workflow prescritivo — o orquestrador identifica marca e intenção, a skill de contexto monta o bundle da marca, e as skills especialistas geram o conteúdo:
- **PDP**: 7 formatos seguindo as specs de cada metafield/metaobject do tema (cards de eficácia com número + badge, FAQ como lista de metaobjects, como-usar com passos + imagem, ingredientes destacados etc.)
- **Blog**: artigo completo com blocos editoriais ricos (CTA cards de produtos reais da loja, pull-quotes, grids de benefícios, tabelas comparativas), capa 16:9 e ilustrações 4:5 geradas por IA, meta SEO e Schema.org

**3. Salvaguardas:** regra inviolável de persistir todo conteúdo em disco (versionado) antes de qualquer mutation no Shopify; validação de claims contra ANVISA; aprovação humana de prompts de imagem antes de consumir créditos; blogs publicados como rascunho para revisão humana.

**4. Geração e publicação em escala:** o engine gerou e publicou o conteúdo enriquecido dos top produtos via API (metafieldsSet, metaobjectCreate, fileCreate, articleCreate), com payloads salvos para replay e IDs registrados para auditoria.

**5. Validação via A/B:** rodamos dois experimentos no Elevate comparando a PDP original (controle) vs. PDP incrementada, com Revenue Per Visitor como métrica-objetivo:
- **[PDP] Teste de PDP Incrementada** — +120.000 sessões: RPV +7,84% (R$9,21 → R$9,94), com aumento na taxa de conversão e no ticket médio. Resultado **estatisticamente significativo**. Ganho projetado: **+R$571.399/mês**.
- **[PDP] Incremento de Conteúdo para os Top 30 produtos** — 121.644 visitantes: RPV +2,64% (R$9,58 → R$9,84), com aumento na taxa de conversão e no ticket médio. Ganho projetado: **+R$193.042/mês**.

**6. Aplicação do vencedor:** a variação PDP Incrementada foi aplicada a 100% do tráfego após o resultado.

---

## BLOCO 3 — DOCUMENTAÇÃO

**Anexar:**
- Prints dos 2 experimentos do Elevate (Results: Revenue Lift, RPV, significância)
- Este documento (PDF/print) como documentação técnica do fluxo
- Opcional: print da estrutura de skills do repositório

### 📝 Descrição técnica complementar (opcional)

O engine mapeia cada formato de conteúdo a um metafield/metaobject específico do tema Shopify (ex.: `custom.section_efficacy` → metaobjects `eficiencia_item`; `custom.section_faq` → `faq_item`; `custom.product_ingredients_metafield` → `product_ingredients`), garantindo que o conteúdo gerado renderiza nativamente no tema sem desenvolvimento front-end adicional. Blogs são exportados em HTML estilizado com a paleta da marca, com Schema.org Article JSON-LD e meta tags, e publicados via Admin API como rascunho para revisão humana. A arquitetura é extensível: adicionar uma nova marca exige apenas popular brandbook + fichas de produto; a mesma infraestrutura atende PDPs, blogs, collections e componentes de site.

---

## BLOCO 4 — GANHOS

### 💰 Ganhos comprovados (auditáveis via Elevate)

- **+R$571.399/mês** — experimento "[PDP] Teste de PDP Incrementada" (RPV +7,84%, estatisticamente significativo)
- **+R$193.042/mês** — experimento "[PDP] Incremento de Conteúdo para os Top 30 produtos" (RPV +2,64%)
- Em ambos, houve **aumento na taxa de conversão e no ticket médio** da variação com conteúdo enriquecido
- **Total: ~R$764 mil/mês de receita incremental projetada**, medida em teste A/B controlado

### ⏱️ Economia de horas — estimativa para top 30 produtos por marca

Processo manual de enriquecimento de 1 produto (7 blocos de conteúdo + imagens + publicação), envolvendo as 5 equipes:

| Equipe | Atividade | Horas/produto |
|---|---|---|
| **Produto** | Levantar ficha técnica, composição/INCI, claims e fontes | 2,0h |
| **Marketing** | Redação dos 7 blocos no tom da marca + revisões | 4,0h |
| **Marketing (design)** | Criação/tratamento de imagens de apoio | 2,0h |
| **Growth** | Briefing SEO, keywords, revisão de copy | 1,0h |
| **Tech** | Cadastro de metafields/metaobjects e upload no Shopify | 1,5h |
| **E-commerce** | QA, publicação e conferência na PDP | 1,0h |
| **Total** | | **~11,5h/produto** |

| Escopo | Manual | Com o Content Engine |
|---|---|---|
| 1 produto | ~11,5h (5 equipes) | **minutos** (+ ~30min de revisão humana) |
| Top 30 produtos de 1 marca | **~345h** (~2 meses de 1 FTE) | **~1 dia** de supervisão/revisão (~8–15h) |
| Top 30 × 7 marcas | **~2.415h** (~14 meses de 1 FTE) | **~70–105h** de supervisão total |

**Economia estimada: >95% das horas** — um backlog de mais de 1 ano-pessoa distribuído entre 5 equipes foi **minimizado a horas**. Blogs seguem a mesma proporção: um artigo completo que consumia ~2 dias entre as equipes sai em minutos, já com imagens, HTML e SEO.

### 🚀 Potencial de ganho futuro (opcional)

Os experimentos cobriram apenas os top produtos de duas lojas do grupo. O mesmo engine já está pronto para:

1. **Expandir ao restante do catálogo** das lojas testadas (long tail) e **replicar para as demais marcas** do grupo, multiplicando o ganho de conversão já validado;
2. **Produção editorial em escala (blogs)** — enriquecimento de SEO e tráfego orgânico recorrente, com artigos otimizados, Schema.org e linkagem para produtos reais; ganho a ser metrificado nos próximos ciclos;
3. **GEO (Generative Engine Optimization)** — conteúdo estruturado e rico aumenta a presença das marcas nas respostas de IAs (ChatGPT, Gemini, Perplexity), um canal de aquisição emergente cujo impacto também será metrificado;
4. **Fortalecimento de marca** — consistência absoluta de tom de voz e identidade visual em todos os pontos de contato, algo impossível de garantir manualmente em 7 marcas;
5. **Velocidade de lançamento** — todo produto novo entra no ar com PDP completa desde o dia 1, sem fila de conteúdo entre 5 equipes;
6. **Collections e componentes de site** — mesma infraestrutura, custo marginal próximo de zero.

---

## BLOCO 5 — AUDITORIA DE GANHOS

✅ Marcar o checkbox: os ganhos apresentados vêm de relatórios da plataforma Elevate (prints anexados, com dados de visitantes, receita, RPV e significância estatística), auditáveis pelo Time de Gestão e FP&A.
