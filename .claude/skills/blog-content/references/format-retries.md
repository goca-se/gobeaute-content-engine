# Retries — Políticas de resiliência

Aprovações manuais foram reduzidas. Em troca, a skill precisa **se auto-recuperar** dos erros mais comuns sem perguntar.

---

## 🎯 Princípios

- **Diagnóstico antes de retry**: nunca retry cego — logar o erro, decidir se é retry-vale-a-pena (transient) ou abort (config errada).
- **Exponential backoff** com jitter para qualquer retry de rede.
- **Max attempts default = 3**. Após 3 falhas, marcar a unidade (post/imagem/upload) como `failed` e seguir (em batch) ou retornar erro (em single).
- **Sempre logar** cada tentativa (`attempt`, `error`, `next_delay_s`) em `conteudos/_batch-logs/`.
- **Nunca corromper estado** — se um post falhar no meio, deletar artifacts parciais OU manter com flag `[INCOMPLETO]`.

---

## 🖼️ PiApp — políticas por erro

### A. Job `FAILED` (geração falhou)

```
attempt 1: gerar
  → status FAILED após poll
attempt 2: gerar com prompt LEVEMENTE ajustado
  → adicionar "high quality, professional photography" ao prompt
  → status FAILED de novo
attempt 3: gerar com modelo alternativo (se disponível)
  → `model: "auto"` na chamada
final FAIL: marcar imagem como `[IMAGEM FALTANDO]` no JSON; seguir sem essa ilustração ou usar placeholder
```

### B. Polling timeout (`check_jobs` retorna `processing` por > 180s)

```
attempt 1: poll a cada 15s por 180s
  → ainda processing
attempt 2: continuar poll por mais 120s
  → ainda processing
final: marcar como timeout e seguir (não bloquear post)
```

### C. Credit limit atingido

```
NÃO retry — abortar o batch e avisar usuário com saldo + créditos necessários
```

### D. Erro de rede (timeout no MCP call)

```
attempt 1-3 com backoff: 5s, 15s, 45s + jitter ±2s
final FAIL: marcar imagem como faltando
```

---

## 🛒 Shopify — políticas por erro

### A. `fileCreate` → `fileStatus: FAILED`

Causas comuns:
- URL externa não acessível (PiApp signed URL expirou — comum se passou >1h)
- Imagem corrompida

```
attempt 1: tentar fileCreate com URL original
  → FAILED
attempt 2: re-baixar do PiApp localmente (já temos) + upload via stagedUploadsCreate → fileCreate(originalSource=stagedTarget)
  → FAILED
attempt 3: gerar nova imagem via PiApp (mesmo prompt) → fileCreate da nova URL
  → FAILED
final FAIL: usar imagem placeholder da marca (`brand-context/<marca>/visual-references/`) ou marcar `[FALTA IMAGEM]`
```

### B. URL externa expirou antes do fileCreate processar

```
sempre que detectar URL JWT-signed antiga (>50min):
  → re-baixar local primeiro
  → usar stagedUploadsCreate para subir bytes
  → fileCreate(originalSource=stagedTarget)
```

### C. `articleCreate` retorna `userErrors`

Causas comuns:
- `handle` duplicado (slug já existe no blog)
- `body` excede limite (raro — limite ~64KB)
- Campos obrigatórios faltando (validation)

```
handle duplicado:
  attempt 1: append `-2`, `-3`, etc. ao slug e retry
  attempt 2: append timestamp ao slug
  final: abortar com erro claro pro usuário

body excede limite:
  → split em chunks ou simplificar style (não retry, abortar)

validation:
  → abortar, logar campo faltando
```

### D. Rate limit (`THROTTLED` ou status 429)

Shopify Admin API: 40 leaky bucket. Em batch, fácil de bater.

```
attempt 1-5 com exponential backoff: 2s, 5s, 10s, 30s, 60s + jitter
respeitar header `Retry-After` se presente
```

### E. Erro de rede / timeout

```
attempt 1-3 com backoff: 5s, 15s, 45s
final FAIL: marcar artigo como pendente, log para retry manual
```

---

## 🔁 Workflow geral de retry (por unidade)

```python
def retry_with_backoff(operation, max_attempts=3, base_delay=5):
    for attempt in range(1, max_attempts + 1):
        try:
            result = operation()
            if result.success:
                return result
            
            # falha "soft" — diagnóstico
            err = diagnose(result.error)
            if not err.is_retriable:
                raise UnrecoverableError(err)
            
            log_attempt(attempt, err, next_delay=delay_for(attempt, base_delay))
            
            if attempt < max_attempts:
                sleep(delay_for(attempt, base_delay))  # exp + jitter
        
        except UnrecoverableError:
            raise
        except NetworkError as e:
            log_attempt(attempt, e, retry=True)
            if attempt < max_attempts:
                sleep(delay_for(attempt, base_delay))
    
    # Todos os attempts falharam
    raise MaxRetriesExceeded()
```

### delay_for

```python
def delay_for(attempt, base):
    # exponential: base × 2^(attempt-1)
    delay = base * (2 ** (attempt - 1))
    # jitter: ±20%
    jitter = random.uniform(-0.2, 0.2) * delay
    return min(delay + jitter, 60)  # cap em 60s
```

---

## 🗂️ Diagnóstico de erros — taxonomia

| Erro | Retriable? | Estratégia |
|---|---|---|
| PiApp job FAILED | ✅ | Ajustar prompt, max 3 |
| PiApp polling timeout | ❌ | Marcar como faltando, seguir |
| PiApp credit limit | ❌ | Abortar batch, alertar |
| Shopify fileCreate FAILED (URL externa) | ✅ | Re-upload via staged, max 3 |
| Shopify handle duplicado | ✅ | Append sufixo, max 2 |
| Shopify rate limit (429) | ✅ | Backoff respeitando `Retry-After` |
| Shopify validation error | ❌ | Abortar, mostrar campo |
| Network timeout | ✅ | Backoff exponencial, max 3 |
| MCP tool error genérico | ✅ | Backoff, max 3 |
| Brand context faltando | ❌ | Abortar, pedir setup |
| Handle de produto não existe | ❌ | Pular o post (batch) ou abortar (single) |

---

## 📊 Logging de retries

Cada retry vai pro log estruturado:

```json
{
  "post_slug": "...",
  "operation": "shopify_filecreate",
  "attempts": [
    {
      "n": 1,
      "started_at": "...",
      "error": "fileStatus=FAILED url=https://...",
      "diagnosis": "external_url_expired",
      "retry": true,
      "delay_before_next_s": 5
    },
    {
      "n": 2,
      "started_at": "...",
      "approach": "re-upload via stagedUploads",
      "error": null,
      "result": "success",
      "shopify_id": "gid://..."
    }
  ],
  "final_status": "success",
  "total_attempts": 2,
  "total_duration_s": 12
}
```

---

## 🚨 Guardrails

- ❌ Retry cego sem diagnóstico
- ❌ Loop infinito de retry (sempre `max_attempts`)
- ❌ Retry em erro de configuração (handle errado, brand inexistente)
- ❌ Esconder falhas — sempre reportar no output final
- ❌ Esperar mais de 60s entre attempts
- ✅ Diagnóstico antes de cada retry
- ✅ Exponential backoff + jitter
- ✅ Logar TODAS as tentativas
- ✅ Fail-soft em batch (1 post falha, outros continuam)
- ✅ Fail-fast em config (brand inválida, credenciais erradas)

---

## ✅ Checklist retries

- [ ] Toda operação de rede tem retry configurado?
- [ ] Diagnóstico antes do retry (não retry cego)?
- [ ] Exponential backoff com jitter?
- [ ] Cap em 60s entre retries?
- [ ] Cada attempt está logado em `_batch-logs/`?
- [ ] Erros não-retriáveis abortam com mensagem clara?
- [ ] Imagens faltantes não param o post (placeholder + flag)?
- [ ] Posts falhos não param o batch?
