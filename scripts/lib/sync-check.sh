#!/usr/bin/env bash
# Shared helpers used by the pre-commit/pre-push hooks and safe-commit-push.sh.
# Keeps this repo's local state aligned with GitHub before we let git write
# new history, so a Syncthing-synced clone on another device never causes a
# silent divergence.
set -euo pipefail

repo_root() {
    git rev-parse --show-toplevel
}

# Quarantine any Syncthing conflict copies sitting in the working tree
# (files like "foo.js.sync-conflict-20260101-120000-ABCDEFG") instead of
# silently deleting or silently committing them.
quarantine_sync_conflicts() {
    local root quarantine found=0
    root="$(repo_root)"
    quarantine="$root/.syncthing-conflicts/$(date +%Y%m%d-%H%M%S)"

    while IFS= read -r -d '' f; do
        [ "$found" -eq 0 ] && mkdir -p "$quarantine"
        found=1
        mkdir -p "$quarantine/$(dirname "${f#"$root"/}")"
        mv "$f" "$quarantine/${f#"$root"/}"
        echo "  moved conflict copy: ${f#"$root"/} -> ${quarantine#"$root"/}/"
    done < <(find "$root" -path "$root/.git" -prune -o -name '*sync-conflict*' -print0)

    if [ "$found" -eq 1 ]; then
        echo "warning: found Syncthing conflict copies from the other device."
        echo "         quarantined under .syncthing-conflicts/ — review and delete manually."
    fi
}

# Fetch origin and make sure the current branch is aligned with it before
# we push. Fast-forwards quietly if we're behind; rebases (autostash) if
# history diverged; refuses to guess on real conflicts.
align_with_origin() {
    local branch
    git fetch origin --quiet
    branch="$(git rev-parse --abbrev-ref HEAD)"

    if ! git rev-parse --verify --quiet "origin/$branch" > /dev/null; then
        echo "no origin/$branch yet — nothing to align against."
        return 0
    fi

    local local_rev origin_rev base_rev
    local_rev="$(git rev-parse HEAD)"
    origin_rev="$(git rev-parse "origin/$branch")"

    if [ "$local_rev" = "$origin_rev" ]; then
        return 0
    fi

    base_rev="$(git merge-base HEAD "origin/$branch")"

    if [ "$base_rev" = "$local_rev" ]; then
        # We're strictly behind — fast-forward, no local commits at risk.
        echo "behind origin/$branch — fast-forwarding."
        git merge --ff-only "origin/$branch"
    elif [ "$base_rev" = "$origin_rev" ]; then
        # We're strictly ahead — nothing to do, push will fast-forward origin.
        return 0
    else
        # Diverged: the other device pushed commits we don't have yet.
        echo "diverged from origin/$branch (other device pushed) — rebasing local commits on top."
        if ! git rebase --autostash "origin/$branch"; then
            echo "error: rebase hit a real conflict. Resolve it manually:" >&2
            echo "  git status; fix conflicts; git rebase --continue" >&2
            exit 1
        fi
    fi
}
