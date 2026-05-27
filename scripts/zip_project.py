#!/usr/bin/env python3
"""
Cross-platform project zipper using Python's built-in zipfile module.
No external dependencies required.

Usage:
    python scripts/zip_project.py

Output:
    <project-name>-clean.zip in the project root directory.
"""

import sys
import zipfile
from pathlib import Path

# Force UTF-8 output on Windows so emoji print correctly
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')  # type: ignore
    sys.stderr.reconfigure(encoding='utf-8')  # type: ignore

# Directories and file patterns to exclude
EXCLUDE_DIRS = {
    'node_modules', '.next', 'dist', 'build',
    '.venv', 'venv', '__pycache__', '.pytest_cache',
    '.git', '.idea', 'logs',
}

EXCLUDE_SUFFIXES = {'.log', '.pyc'}


def should_exclude(path: Path, project_root: Path, zip_name: str) -> bool:
    """Return True if the path should be excluded from the zip.

    Args:
        path: Absolute path to the file being evaluated.
        project_root: Absolute path to the project root.
        zip_name: Name of the output zip file (exclude it from itself).

    Returns:
        True if the file should be skipped, False otherwise.
    """
    if path.name == zip_name:
        return True
    if path.suffix in EXCLUDE_SUFFIXES:
        return True
    relative = path.relative_to(project_root)
    return bool(set(relative.parts) & EXCLUDE_DIRS)


def zip_project() -> None:
    """Create a clean zip of the project, excluding build artifacts and deps."""
    project_root = Path(__file__).parent.parent.resolve()
    project_name = project_root.name
    zip_name = f"{project_name}-clean.zip"
    zip_path = project_root / zip_name

    print(f"📁 Project root: {project_root}")
    print(f"   {'✅' if (project_root / 'frontend').exists() else '❌'} frontend")
    print(f"   {'✅' if (project_root / 'backend').exists() else '❌'} backend")
    print(f"\n🗜️  Creating zip: {zip_name}")
    print(f"📦 Excluding: {', '.join(sorted(EXCLUDE_DIRS))}\n")

    file_count = 0
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for file_path in sorted(project_root.rglob('*')):
            if not file_path.is_file():
                continue
            if should_exclude(file_path, project_root, zip_name):
                continue
            arcname = Path(project_name) / file_path.relative_to(project_root)
            zf.write(file_path, arcname)
            file_count += 1

    size_mb = zip_path.stat().st_size / (1024 * 1024)
    print(f"✅ Success!")
    print(f"📄 Files zipped : {file_count}")
    print(f"📊 Size         : {size_mb:.2f} MB")
    print(f"📍 Location     : {zip_path}")


if __name__ == '__main__':
    try:
        zip_project()
    except Exception as exc:
        print(f"\n❌ Error: {exc}", file=sys.stderr)
        sys.exit(1)
