#!/usr/bin/env bash
# Copy a skill into another repo's .claude/skills/ so cloud runs (Claude Code
# on the web, GitHub Actions) can use it. Edit the skill here, never the copy.
#
# Usage: scripts/sync-to-project.sh <plugin>/<skill> <path-to-project-repo>
# Example: scripts/sync-to-project.sh core/write-like-abhisek ~/Code/abhisek-xyz-astro
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
ref="${1:?usage: $0 <plugin>/<skill> <path-to-project-repo>}"
project="${2:?usage: $0 <plugin>/<skill> <path-to-project-repo>}"
plugin="${ref%%/*}"
skill="${ref#*/}"
src="$root/$plugin/skills/$skill"
dest="$project/.claude/skills/$skill"

[ -f "$src/SKILL.md" ] || { echo "No skill at $src" >&2; exit 1; }
mkdir -p "$dest"
rsync -a --delete --exclude .DS_Store "$src/" "$dest/"
echo "Synced $ref -> $dest"
git -C "$project" status --short -- ".claude/skills/$skill"
