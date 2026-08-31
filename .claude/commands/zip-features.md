# /zip-features — Selective Project Zipper

Create a zip file of the project with selective feature inclusion. Choose which backend and frontend features to include, or zip the entire project.

## Trigger Phrases
- "zip the project" 
- "create a backup"
- "export project with features"
- `/zip-features`
- `/zip-features user`
- `/zip-features user, grn`

## What It Does

1. **Auto-detects** all available features from:
   - `backend/app/features/[feature_name]/`
   - `frontend/src/features/[feature_name]/`

2. **Allows selection** of which features to include (or all by default)

3. **Creates a zip** file containing:
   - Selected feature code (backend + frontend)
   - Shared utilities and configuration
   - Documentation and assets
   - **Excludes:** node_modules, .venv, .git, .next, dist, build, logs, etc.

4. **Outputs** to project root as:
   - `AiTemplate-clean.zip` (all features)
   - `AiTemplate-user.zip` (single feature)
   - `AiTemplate-user,grn.zip` (multiple features)

## Usage Examples

### Zip entire project (all features)
```bash
python scripts/zip_project.py
```

### List available features
```bash
python scripts/zip_project.py --list
```

### Zip specific features
```bash
python scripts/zip_project.py --features user
python scripts/zip_project.py --features user,grn
python scripts/zip_project.py --features user,grn,inventory
```

### Show help
```bash
python scripts/zip_project.py --help
```

## Features Detected

When you run `/zip-features`, the system auto-detects:

**Backend features** from `backend/app/features/`:
- Each folder is one feature (e.g., `user`, `grn`, `purchase_order`)

**Frontend features** from `frontend/src/features/`:
- Each folder is one feature (matches backend feature names)

## What Gets Included

✅ **Included:**
- All selected feature source code (backend + frontend)
- Shared backend config (`app/core/`, `app/common/`)
- Shared frontend code (`src/common/`, `src/lib/`, `src/core/`)
- All documentation (`docs/`, `README.md`, `CLAUDE.md`)
- Configuration files (`.env.example`, `package.json`, `pyproject.toml`)
- Scripts and utilities

❌ **Excluded:**
- `node_modules/` — frontend dependencies
- `.venv/` — backend virtual environment
- `.git/` — git history
- `.next/`, `dist/`, `build/` — build artifacts
- `__pycache__/`, `.pytest_cache/` — Python cache
- `.log`, `.pyc` — log files

## Output File

The zip file appears in your project root:
- File name shows included features
- Compressed with ZIP_DEFLATED (level 6)
- Ready to share or backup
- Extract anywhere with standard unzip tools

## Why Use This?

- **Selective backups** — Zip only the features you're working on
- **Share with team** — Export specific features without dependencies
- **Clean archives** — Excludes build artifacts, caches, node_modules
- **Feature snapshots** — Create a snapshot of feature at a point in time
- **Cross-platform** — Works on Windows, macOS, Linux (pure Python)
