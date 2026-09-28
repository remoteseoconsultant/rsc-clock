#!/usr/bin/env bash
# Git hooks live in .git/hooks, which is not tracked by git and (per
# .stignore) no longer synced by Syncthing either — so run this once on
# every device that works on this repo.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
hooks_dir="$(git rev-parse --git-dir)/hooks"

for hook in pre-commit pre-push; do
    cp "scripts/hooks/$hook" "$hooks_dir/$hook"
    chmod +x "$hooks_dir/$hook"
    echo "installed $hook"
done
