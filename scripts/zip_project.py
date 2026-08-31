#!/usr/bin/env python3
"""
Cross-platform project zipper with optional feature selection.
No external dependencies required.

Usage:
    python scripts/zip_project.py                    # Include all features
    python scripts/zip_project.py --features user,grn  # Include specific features
"""

import sys
import zipfile
from pathlib import Path
from typing import Set, Optional

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


def get_available_features(project_root: Path) -> Set[str]:
    """Get list of available features from both backend and frontend."""
    features = set()

    # Backend features
    backend_features = project_root / 'backend' / 'app' / 'features'
    if backend_features.exists():
        for item in backend_features.iterdir():
            if item.is_dir() and not item.name.startswith('_'):
                features.add(item.name)

    # Frontend features
    frontend_features = project_root / 'frontend' / 'src' / 'features'
    if frontend_features.exists():
        for item in frontend_features.iterdir():
            if item.is_dir() and not item.name.startswith('_'):
                features.add(item.name)

    return sorted(features)


def should_exclude(path: Path, project_root: Path, zip_name: str, selected_features: Optional[Set[str]] = None) -> bool:
    """Return True if the path should be excluded from the zip.

    Args:
        path: Absolute path to the file being evaluated.
        project_root: Absolute path to the project root.
        zip_name: Name of the output zip file (exclude it from itself).
        selected_features: Set of feature names to include. If None, include all.

    Returns:
        True if the file should be skipped, False otherwise.
    """
    if path.name == zip_name:
        return True
    if path.suffix in EXCLUDE_SUFFIXES:
        return True

    relative = path.relative_to(project_root)

    # Check if path contains excluded directories
    if set(relative.parts) & EXCLUDE_DIRS:
        return True

    # If features selected, check if this path belongs to a selected feature
    if selected_features is not None:
        path_parts = relative.parts

        # Check backend features
        if 'backend' in path_parts and 'features' in path_parts:
            try:
                features_idx = path_parts.index('features')
                if features_idx + 1 < len(path_parts):
                    feature_name = path_parts[features_idx + 1]
                    if feature_name not in selected_features:
                        return True
            except (ValueError, IndexError):
                pass

        # Check frontend features
        if 'frontend' in path_parts and 'src' in path_parts and 'features' in path_parts:
            try:
                features_idx = path_parts.index('features')
                if features_idx + 1 < len(path_parts):
                    feature_name = path_parts[features_idx + 1]
                    if feature_name not in selected_features:
                        return True
            except (ValueError, IndexError):
                pass

    return False


def zip_project(selected_features: Optional[Set[str]] = None) -> None:
    """Create a clean zip of the project, optionally filtering by features.

    Args:
        selected_features: Set of feature names to include. If None, include all.
    """
    project_root = Path(__file__).parent.parent.resolve()
    project_name = project_root.name

    if selected_features:
        features_str = ','.join(sorted(selected_features))
        zip_name = f"{project_name}-{features_str}.zip"
    else:
        zip_name = f"{project_name}-clean.zip"

    zip_path = project_root / zip_name

    print(f"📁 Project root: {project_root}")
    print(f"   {'✅' if (project_root / 'frontend').exists() else '❌'} frontend")
    print(f"   {'✅' if (project_root / 'backend').exists() else '❌'} backend")

    if selected_features:
        print(f"\n🎯 Selected features: {', '.join(sorted(selected_features))}")

    print(f"\n🗜️  Creating zip: {zip_name}")
    print(f"📦 Excluding: {', '.join(sorted(EXCLUDE_DIRS))}\n")

    file_count = 0
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for file_path in sorted(project_root.rglob('*')):
            if not file_path.is_file():
                continue
            if should_exclude(file_path, project_root, zip_name, selected_features):
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
        selected_features = None

        # Parse command line arguments
        if len(sys.argv) > 1:
            if sys.argv[1] == '--features' and len(sys.argv) > 2:
                features_str = sys.argv[2]
                selected_features = set(f.strip() for f in features_str.split(','))
            elif sys.argv[1] == '--list':
                project_root = Path(__file__).parent.parent.resolve()
                features = get_available_features(project_root)
                print("📋 Available features:")
                for feature in features:
                    print(f"   - {feature}")
                sys.exit(0)
            elif sys.argv[1] == '--help':
                print("Usage:")
                print("  python scripts/zip_project.py              # All features")
                print("  python scripts/zip_project.py --list       # List available features")
                print("  python scripts/zip_project.py --features user,grn  # Specific features")
                sys.exit(0)

        zip_project(selected_features)
    except Exception as exc:
        print(f"\n❌ Error: {exc}", file=sys.stderr)
        sys.exit(1)
