#!/usr/bin/env bash
# Lote do dia: gerar → validar → 1 retry dos reprovados → revalidar → publicar → versionar.
#   scripts/rodar-lote.sh <run_id> [--sem-publicar]
set -euo pipefail
cd "$(dirname "$0")/.."
RUN="$1"; PUBLICAR=1; [ "${2:-}" = "--sem-publicar" ] && PUBLICAR=0
MARCA=$(python3 -c "import json;print(json.load(open('runs/$RUN/run.json'))['loja'])")

echo "== 1/5 geração"
npx tsx generator/index.ts --run "$RUN"
echo "== 2/5 validação"
npx tsx validator/index.ts --run "$RUN"

REPROVADOS=$(python3 -c "
import json; r=json.load(open('runs/$RUN/run.json'))
print(' '.join(sorted({i['handle'] for i in r['items'] if i['status']=='reprovado_validacao'})))")
if [ -n "$REPROVADOS" ]; then
  echo "== 3/5 retry dos reprovados: $REPROVADOS"
  npx tsx generator/index.ts --run "$RUN" --retry-reprovados
  ARGS=(); for h in $REPROVADOS; do ARGS+=(--handle "$h"); done
  npx tsx validator/index.ts --run "$RUN" "${ARGS[@]}"
else
  echo "== 3/5 nenhum reprovado"
fi

if [ "$PUBLICAR" = 1 ]; then
  echo "== 4/5 publicação"
  npx tsx publisher/index.ts --run "$RUN" --apply
else
  echo "== 4/5 publicação pulada (--sem-publicar)"
fi

echo "== 5/5 versionando conteudos/$MARCA no branch conteudos-auto"
SHA=$(scripts/commit-conteudos.sh "$MARCA" "$RUN" | tail -1)
python3 - "$RUN" "$SHA" <<'PY'
import json,sys
p=f'runs/{sys.argv[1]}/run.json'; r=json.load(open(p)); r['commit_sha']=sys.argv[2]
json.dump(r,open(p,'w'),indent=2,ensure_ascii=False)
PY
echo "commit $SHA"
python3 -c "
import json,collections; r=json.load(open('runs/$RUN/run.json'))
print('itens:', dict(collections.Counter(i['status'] for i in r['items'] if i['handle'] in {p['handle'] for p in r['produtos'] if p['selecionado']})))
print('produtos:', dict(collections.Counter((p.get('publicacao') or {}).get('status','sem_publicacao') for p in r['produtos'] if p['selecionado'])))
print('custo US\$', (r.get('geracao') or {}).get('custo_usd'))"
