#!/usr/bin/env bash
# Commit + push wrapper for a repo whose working tree is also synced by
# Syncthing to another device (different SSH key, same GitHub account/repo).
#
# Order of operations matters here: we align with origin BEFORE committing,
# so a local commit is never built on top of history the other device has
# already replaced. Usage:
#   scripts/safe-commit-push.sh "commit message"
#   scripts/safe-commit-push.sh            # uses a timestamped default message
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
source scripts/lib/sync-check.sh

echo "== checking for Syncthing conflict copies =="
quarantine_sync_conflicts

echo "== aligning with origin =="
align_with_origin

if [ -z "$(git status --porcelain)" ]; then
    echo "nothing to commit — working tree already matches the last commit."
    exit 0
fi

git add -A

msg="${1:-Sync update $(date '+%Y-%m-%d %H:%M:%S')}"
git commit -m "$msg"

echo "== pushing =="
branch="$(git rev-parse --abbrev-ref HEAD)"
if ! git push origin "$branch"; then
    echo "push rejected — other device likely pushed in the meantime, retrying once."
    align_with_origin
    git push origin "$branch"
fi

echo "done."
