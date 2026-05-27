#!/usr/bin/env python3
"""
Lint changed files on every Claude Code session stop.

- Frontend (.ts / .tsx / .js): runs Prettier (format) then ESLint (check)
- Backend (.py): runs flake8 (check) then black (auto-format)

Triggered automatically by the Stop Claude Code hook.
"""

import subprocess
import sys
from pathlib import Path

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8') # type: ignore
    sys.stderr.reconfigure(encoding='utf-8') # type: ignore

PROJECT_ROOT = Path(__file__).parent.parent.resolve()


def run(cmd: list[str], cwd: Path) -> int:
    """Run a subprocess command and return its exit code.

    Args:
        cmd: Command and arguments list.
        cwd: Working directory for the command.

    Returns:
        Exit code of the process.
    """
    return subprocess.run(cmd, cwd=cwd).returncode


def get_changed_files() -> list[str]:
    """Return files changed (added, copied, modified, renamed) via git diff.

    Returns:
        List of relative file path strings, or empty list on failure.
    """
    try:
        result = subprocess.run(
            ['git', 'diff', '--name-only', '--diff-filter=ACMR'],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
        )
        return [f for f in result.stdout.splitlines() if f]
    except Exception:
        return []


def lint_frontend(files: list[str]) -> int:
    """Run Prettier and ESLint on changed frontend files.

    Args:
        files: List of frontend file paths relative to project root.

    Returns:
        Exit code (0 = pass, non-zero = issues found).
    """
    frontend_dir = PROJECT_ROOT / 'frontend'
    print(f"📝 Frontend ({len(files)} files):")

    for f in files:
        run(['npm', 'run', 'format', '--', f], cwd=frontend_dir)

    status = run(['npm', 'run', 'lint:check'], cwd=frontend_dir)

    if status == 0:
        print("   ✅ Frontend lint passed")
    else:
        print("   ⚠️  Frontend lint issues found (auto-formatted where possible)")

    return status


def lint_backend(files: list[str]) -> int:
    """Run flake8 and black on changed backend files.

    Args:
        files: List of backend file paths relative to project root.

    Returns:
        Exit code from flake8 (0 = pass, non-zero = issues found).
    """
    backend_dir = PROJECT_ROOT / 'backend'
    print(f"🐍 Backend ({len(files)} files):")

    status = run(['flake8'] + files, cwd=backend_dir)
    run(['black'] + files + ['--quiet'], cwd=backend_dir)

    if status == 0:
        print("   ✅ Backend lint passed")
    else:
        print("   ⚠️  Backend lint issues found (check manually)")

    return status


def main() -> int:
    """Entry point — detect changed files and run appropriate linters."""
    print("🔍 Linting changed files...\n")

    changed = get_changed_files()
    if not changed:
        print("ℹ️  No changed files detected")
        return 0

    frontend_files = [
        f for f in changed
        if f.startswith('frontend/') and f.endswith(('.ts', '.tsx', '.js'))
    ]
    backend_files = [
        f for f in changed
        if f.startswith('backend/') and f.endswith('.py')
    ]

    if not frontend_files and not backend_files:
        print("ℹ️  No TypeScript or Python files changed")
        return 0

    fe_status = lint_frontend(frontend_files) if frontend_files else 0
    print()
    be_status = lint_backend(backend_files) if backend_files else 0
    print()

    print("✨ Linting complete!")
    return max(fe_status, be_status)


if __name__ == '__main__':
    sys.exit(main())
