#!/usr/bin/env bash
# Commita conteudos/<marca>/ no branch conteudos-auto (backup versionado, regra #0). Não faz push.
#   scripts/commit-conteudos.sh <marca> <run_id>
set -euo pipefail
MARCA="$1"; RUN_ID="$2"
REPO="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
WT="$REPO/pipeline/runs/.worktree-conteudos-auto"

if ! git -C "$REPO" show-ref --quiet refs/heads/conteudos-auto; then
  git -C "$REPO" branch conteudos-auto main
fi
if [ ! -d "$WT" ]; then
  git -C "$REPO" worktree add "$WT" conteudos-auto >/dev/null
fi

mkdir -p "$WT/conteudos/$MARCA"
rsync -a --delete "$REPO/conteudos/$MARCA/" "$WT/conteudos/$MARCA/"
# conteudos/ está no .gitignore do main: -f é intencional neste branch.
git -C "$WT" add -f "conteudos/$MARCA"
if git -C "$WT" diff --cached --quiet; then
  echo "sem mudanças"; git -C "$WT" rev-parse HEAD; exit 0
fi
git -C "$WT" commit -q -m "conteudos($MARCA): run $RUN_ID

Gerado pelo content pipeline. Backup versionado (regra #0) antes de qualquer publicação.

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
git -C "$WT" rev-parse HEAD
