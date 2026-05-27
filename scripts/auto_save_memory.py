#!/usr/bin/env python3
"""
Auto-save session summary to memory before /compact.

Reads git status and recent commits to produce a Markdown summary
saved to .claude/memory/<project>_session_<date>_<time>.md.

Triggered automatically by the PreCompact Claude Code hook.
"""

import random
import string
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8') # type: ignore
    sys.stderr.reconfigure(encoding='utf-8') # type: ignore

PROJECT_ROOT = Path(__file__).parent.parent.resolve()


def run_git(*args: str) -> str:
    """Run a git command and return stdout, or empty string on failure.

    Args:
        *args: Git subcommand and flags (e.g. 'log', '--oneline', '-10').

    Returns:
        Stripped stdout string, or '' if the command fails.
    """
    try:
        result = subprocess.run(
            ['git', *args],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            timeout=10,
        )
        return result.stdout.strip()
    except Exception:
        return ''


def get_recent_commits() -> list[str]:
    """Return the last 10 git commit one-liners."""
    output = run_git('log', '--oneline', '-10', '--no-decorate')
    return [line for line in output.splitlines() if line]


def get_changed_files() -> list[str]:
    """Return currently changed/staged files from git status."""
    output = run_git('status', '--porcelain')
    return [line for line in output.splitlines() if line]


def generate_summary() -> str:
    """Build the Markdown session summary string.

    Returns:
        Formatted Markdown document as a string.
    """
    now = datetime.now(timezone.utc)
    date = now.strftime('%Y-%m-%d')
    time = now.strftime('%H:%M:%S')
    project_name = PROJECT_ROOT.name
    rand_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=9))
    session_id = f"{project_name}-{date}-{rand_suffix}"

    commits = get_recent_commits()
    changed = get_changed_files()

    lines: list[str] = [
        f"# Session Summary — {date} {time}",
        "",
        "## Session Info",
        f"- **Project:** {project_name}",
        f"- **Path:** {PROJECT_ROOT}",
        f"- **Session ID:** {session_id}",
        f"- **Timestamp:** {now.isoformat()}",
        "",
        "## Files Modified",
    ]

    lines += [f"- {f}" for f in changed] if changed else ["- (no uncommitted changes — see git log)"]

    if commits:
        lines += ["", "## Recent Commits"]
        lines += [f"- {c}" for c in commits]

    lines += [
        "",
        "## Work Done",
        "- [Update with specific work completed this session]",
        "",
        "## Key Decisions",
        "- [Record important decisions made]",
        "",
        "## Next Steps",
        "- [List what needs to be done next]",
    ]

    return '\n'.join(lines)


def save_memory() -> bool:
    """Write the session summary to .claude/memory/.

    Returns:
        True on success, False on failure.
    """
    try:
        memory_dir = PROJECT_ROOT / '.claude' / 'memory'
        memory_dir.mkdir(parents=True, exist_ok=True)

        now = datetime.now(timezone.utc)
        date = now.strftime('%Y-%m-%d')
        time = now.strftime('%H-%M-%S')
        project_name = PROJECT_ROOT.name

        filename = f"{project_name}_session_{date}_{time}.md"
        filepath = memory_dir / filename
        filepath.write_text(generate_summary(), encoding='utf-8')

        print(f"✅ Memory saved : {filename}")
        print(f"📁 Project      : {project_name}")
        return True

    except Exception as exc:
        print(f"❌ Failed to save memory: {exc}", file=sys.stderr)
        return False


if __name__ == '__main__':
    sys.exit(0 if save_memory() else 1)
