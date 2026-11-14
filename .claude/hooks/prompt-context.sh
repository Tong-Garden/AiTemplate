#!/usr/bin/env bash
# UserPromptSubmit hook: print a few lines of context before Claude reads the prompt.
# Fast (no model), never blocks (always exit 0).
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cat >/dev/null # the prompt JSON arrives on stdin; not needed

branch=$(cd "$root" && git rev-parse --abbrev-ref HEAD 2>/dev/null)
dirty=$(cd "$root" && git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
echo "AiTemplate: branch ${branch:-unknown}, ${dirty:-0} uncommitted file(s)."

# Plans still being worked on (see .claude/commands/task.md).
plans="$root/docs/plans"
if [ -d "$plans" ]; then
  for f in "$plans"/*.md; do
    [ -f "$f" ] || continue
    status=$(grep -m1 -iE '^status:' "$f" | sed 's/^[Ss]tatus:[[:space:]]*//')
    case "$status" in
      approved*|"in progress"*)
        open=$(grep -cE '^- \[ \]' "$f")
        echo "Open plan: docs/plans/$(basename "$f") (status: $status, $open unticked task(s)). Resume it instead of re-planning."
        ;;
    esac
  done
fi

echo "A feature-sized build/add/change/fix request? Follow .claude/commands/task.md (triage, plan, one task at a time)."
exit 0
