# Guardrails — PiApp Image Generation

## 🚫 NUNCA gerar

### Identidade e representação
- ❌ Pessoas reais identificáveis (celebridades, influencers, modelos famosos)
- ❌ Fotos de "antes/depois" que apaguem características naturais (etnia, marcas próprias)
- ❌ Transformações fantásticas: cabelo crespo → liso, pele com manchas → totalmente uniforme, corpo modificado, etc. (publicidade enganosa)
- ❌ Crianças em contexto sexualizado ou inapropriado

### Branding e legal
- ❌ Logos de marcas (Gobeaute ou concorrentes)
- ❌ Embalagens com labels legíveis (a menos que seja foto real autorizada)
- ❌ Texto/letras/números dentro da imagem (problemas de I18N + amadorismo visual)
- ❌ Imitação de identidade visual de concorrentes específicos

### Compliance regulatório
- ❌ Imagens que sugiram efeito médico/terapêutico (ANVISA)
- ❌ Imagens que façam claims visuais não suportados (ex: gráfico de % de redução de rugas sem dados reais)
- ❌ Comparações diretas com marca/produto concorrente

## ✅ SEMPRE garantir

### Consistência
- ✅ Em batches (antes/depois, ícones, ingredientes): consistência total de estilo, paleta, iluminação
- ✅ Visual DNA da marca aplicado em TODO prompt
- ✅ Aspect ratio explícito (sem deixar default 9:16 se quer outro)

### Qualidade
- ✅ Resolução adequada ao uso (4k pra hero, high pra PDP, standard pra ícones)
- ✅ "Photorealistic high-quality" pra fotos
- ✅ "Minimalist clean" pra ícones

### Aprovação e rastreabilidade
- ✅ Prompt apresentado pra aprovação ANTES de gerar
- ✅ Metadata salva junto com imagem (job_id, prompt, params)
- ✅ Estimativa de custo apresentada se relevante

## 🔍 Validações antes de chamar API

```
1. [PLACEHOLDERS] foram todos substituídos?
   Ex: [BRAND_VISUAL_DNA] ainda no prompt? → bloquear, pedir contexto

2. Aspect ratio é compatível com o purpose?
   Ex: ícone com aspect 21:9? → ajustar pra 1:1

3. Quality é apropriado pro caso?
   Ex: hero da home em "standard"? → sugerir "4k"

4. Reference image ainda válida?
   URL do upload_reference < 5min? → re-upload se necessário

5. Créditos suficientes pra batch?
   Se batch ≥ 5 → check_credits antes
```

## 🎨 Padrões de DNA visual por marca (preset)

Cada marca tem preset salvo em `brand-context/_shared/piapp-style-presets.md`. Brand-context retorna o preset no bundle, e piapp-image-gen aplica automaticamente no prompt.

## 🚨 Fluxo de pergunta em casos ambíguos

```
Cenário 1: Usuário pede "imagem de modelo usando o produto" sem especificar quem é o modelo
→ PERGUNTAR: "Que tipo de pessoa? (a) Mulher brasileira 25-35 / (b) Homem brasileiro 30-45 / (c) Outro — me descreva"

Cenário 2: Usuário não definiu setting
→ PERGUNTAR: "Onde acontece a cena? (a) Studio neutro / (b) Lifestyle (banheiro/mesa) / (c) Outdoor / (d) Outro"

Cenário 3: Brandbook não tem paleta definida
→ PERGUNTAR: "Não encontrei paleta da [marca]. Quer (a) me dizer agora as cores hex / (b) usar paleta neutra / (c) buscar nas referências visuais que você uploadar"
```
