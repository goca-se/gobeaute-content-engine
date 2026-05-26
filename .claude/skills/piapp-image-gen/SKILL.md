---
name: piapp-image-gen
description: Wrapper module for generating images via PiApp MCP for Gobeaute content. Use this skill whenever ANY content skill (pdp-content, collection-content, blog-content, component-content) needs to generate one or more images for product pages, collections, blogs, or site components. Builds optimized prompts following the PiApp structure (subject + setting + lighting + composition + style + mood), enriches with brand visual DNA from brand-context, presents prompts to user for approval, calls generate_image or generate_image_batch via the PiApp MCP, polls check_jobs until completion, downloads outputs to the conteudos/ folder structure, and saves prompt + metadata for traceability. Always asks for user confirmation before calling the API (credit cost). NEVER generates text content — only orchestrates image generation via PiApp MCP. Triggers internally when other skills need images, OR directly when user says "gera imagem", "cria foto", "imagem do produto", etc.
---

# PiApp Image Generation — Módulo Compartilhado

Wrapper sobre o **MCP do PiApp** (interno Gobeaute). Outras skills delegam geração de imagem pra cá.

## 🎯 Quando esta skill ativa

- Outra skill precisa de imagem (PDP icons, collection banner, blog cover, etc.)
- Usuário pede diretamente: "gera imagem do produto X", "cria banner pra collection Y"
- Usuário quer iterar em prompt existente

## 📡 Conexão com o MCP PiApp

A conexão é configurada em `.mcp.json` na raiz do projeto. Antes de usar, garantir que o MCP está conectado no Claude Code.

### Tools PiApp disponíveis

| Tool | Quando usar |
|---|---|
| `generate_image` | 1 prompt → 1 imagem |
| `generate_image_batch` | N prompts → N imagens em paralelo (2–10) |
| `upload_reference` | Subir imagem local pra usar como referência |
| `list_models` | Ver modelos disponíveis e custo |
| `list_gallery` | Ver gerações recentes |
| `check_credits` | Saldo de créditos (chamar antes de batches ≥5) |
| `check_jobs` | Polling de status até `completed` |

> Vídeos (`generate_video`, `apply_motion`) **NÃO** estão no escopo atual. Se usuário pedir vídeo, responder: "Geração de vídeo está fora do escopo desta versão. Quer que eu gere uma imagem estática?"

## 🚦 Workflow padrão

### Etapa 1 — Receber brief

Inputs da skill chamadora:
- **purpose**: `pdp-icon` / `pdp-before` / `pdp-after` / `pdp-ingredient` / `pdp-how-to-use` / `collection-hero` / `blog-cover` / `blog-illustration` / `component-banner` / `component-testimonial`
- **brand_visual_dna**: string descritiva (vem do brand-context)
- **brand_palette**: cores principais
- **subject**: o que está na imagem
- **output_path**: pasta onde salvar (ex: `conteudos/apice/produtos/shampoo-cachos-ra1000/icones/imagens/`)
- **n_images**: 1 (use `generate_image`) ou >1 (use `generate_image_batch`)
- **reference_image** (opcional): path local de imagem de referência

### Etapa 2 — Construir prompt PiApp

Estrutura recomendada pelo PiApp:
```
[subject] + [setting] + [lighting] + [composition/camera angle] + [style] + [mood]
```

Carregar template apropriado de `references/tool-mapping.md` baseado no `purpose`.

Aplicar substituições com dados do brand-context:
- `[BRAND_VISUAL_DNA]` → da brand-context
- `[BRAND_PALETTE]` → da brand-context
- `[SUBJECT]` → input
- `[SETTING]` → input ou inferido do purpose
- `[STYLE]` → do tool-mapping por purpose

### Etapa 3 — Apresentar prompt pra aprovação

**SEMPRE mostrar o prompt completo ao usuário antes de chamar API:**

```
📋 Prompt PiApp pronto:

[texto do prompt]

📐 Aspect: 1:1
⭐ Quality: high
🎨 Tool: generate_image
🤖 Modelo: auto (sem reference)

💰 Custo estimado: [consultar com check_credits + list_models]

Posso gerar? [s/N]
```

### Etapa 4 — Se reference image local: upload primeiro

```
1. Validar: arquivo existe? < 10MB? formato png/jpg/webp/gif?
2. Chamar upload_reference → recebe URL pública (expira em 5min)
3. Usar URL no parâmetro reference_image_urls da chamada de geração
4. ⚠️ Chamar geração logo em seguida (não esperar > 4min)
```

### Etapa 5 — Verificar créditos (se batch ≥ 5)

```
Chamar check_credits ANTES de generate_image_batch com N ≥ 5
Se créditos insuficientes → AVISAR usuário e perguntar:
  (a) Reduzir N
  (b) Usar quality menor
  (c) Abortar
```

### Etapa 6 — Chamar geração

**Para 1 imagem:**
```
generate_image(
  prompt="...",
  aspect_ratio="1:1",
  quality="high"
)
→ retorna job_id
```

**Para batch (2-10):**
```
generate_image_batch(
  prompts=["...", "...", "..."],
  aspect_ratio="1:1",
  quality="high",
  reference_image_urls=[...],          # opcional
  image_assignments=[...]              # opcional, mapear refs a prompts específicos
)
→ retorna list de job_ids
```

### Etapa 7 — Polling

```
Chamar check_jobs(job_ids) em loop com backoff
Aguardar até todos status == "completed" (ou "failed")
Recolher output_urls
```

### Etapa 8 — Download + salvamento

Para cada output_url:

1. Baixar imagem pra `[output_path]/imagens/generated/image-NN.png`
2. Salvar prompt em `[output_path]/imagens/prompts/prompt-NN.txt`
3. Salvar metadata em `[output_path]/imagens/prompts/prompt-NN.meta.json`:

```json
{
  "generated_at": "2026-XX-XX",
  "purpose": "pdp-icon",
  "brand": "apice",
  "entity": "shampoo-cachos-ra1000",
  "tool": "generate_image",
  "aspect_ratio": "1:1",
  "quality": "high",
  "model": "auto",
  "job_id": "...",
  "output_url": "..."
}
```

### Etapa 9 — Apresentar resultado

```
✅ Imagens geradas:
![icon-01](output_url_1)
![icon-02](output_url_2)
![icon-03](output_url_3)

📁 Salvas em:
- conteudos/apice/produtos/shampoo-cachos-ra1000/icones/imagens/generated/

📝 Prompts salvos em:
- conteudos/.../imagens/prompts/

Próximos passos:
- Quer gerar variações de algum?
- Quer ajustar a paleta?
- Quer gerar mais imagens da mesma série?
```

## 🚨 Guardrails

- ❌ **Nunca chamar a API sem aprovação explícita** do usuário
- ❌ **Nunca gerar texto/letras dentro da imagem** (validar prompt antes)
- ❌ **Nunca usar Kling pra qualquer coisa com áudio em PT-BR** (Kling não fala PT)
- ❌ **Nunca pular `check_credits` em batch ≥ 5**
- ❌ **Nunca usar reference_image_url expirado** (5min)
- ✅ **Sempre apresentar o prompt completo antes de chamar**
- ✅ **Sempre salvar prompt + metadata** junto com a imagem
- ✅ **Sempre validar resolução/aspect ratio** conforme purpose

## 📚 References

- `references/prompt-structure.md` — anatomia do prompt PiApp
- `references/tool-mapping.md` — qual tool/aspect/quality por purpose
- `references/guardrails.md` — guardrails detalhados (compliance, ética visual)
