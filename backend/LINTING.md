# Code Linting & Formatting Guide

This document explains how to set up and run linting tools in the backend project.

## 📦 Installed Tools

- **black** - Code formatter (enforces consistent style)
- **flake8** - Style guide & error checker
- **isort** - Import statement organizer
- **mypy** - Static type checker
- **pytest** - Test runner

## 🚀 Quick Start

### Install Dev Dependencies
```bash
cd backend
uv sync --extra dev
```

### Run All Checks
```bash
# Using the lint script (recommended)
bash lint.sh

# Or run individual tools (see below)
```

---

## 🛠️ Individual Tools

### 1. isort - Import Sorting

Automatically organizes imports in the correct order (standard lib → third-party → local).

```bash
# Check imports (no changes)
uv run isort app/ --check-only

# Show diff without making changes
uv run isort app/ --diff

# Auto-fix imports
uv run isort app/
```

**What it does:**
```python
# Before
from typing import List
import os
from app.core.config import settings
import sys
from fastapi import FastAPI

# After
import os
import sys
from typing import List

from fastapi import FastAPI

from app.core.config import settings
```

---

### 2. black - Code Formatter

Formats Python code to a consistent style automatically.

```bash
# Check formatting (no changes)
uv run black app/ --check

# Show diff without making changes
uv run black app/ --diff

# Auto-format all files
uv run black app/

# Format a specific file
uv run black app/main.py
```

**Configuration** (in `pyproject.toml`):
- Line length: 100 characters
- Python version: 3.11+

**What it does:**
```python
# Before
x   = 1
y=2
result = very_long_function_name( arg1,arg2,arg3,arg4,arg5 )

# After
x = 1
y = 2
result = very_long_function_name(
    arg1, arg2, arg3, arg4, arg5
)
```

---

### 3. flake8 - Style Checker

Checks for PEP 8 style violations and common errors.

```bash
# Check all files
uv run flake8 app/

# Check specific file
uv run flake8 app/main.py

# Show statistics
uv run flake8 app/ --statistics

# Count violations by type
uv run flake8 app/ --count
```

**Common Error Codes:**
- `E501` - Line too long (max 100)
- `F401` - Imported but unused
- `F841` - Local variable assigned but never used
- `E302` - Expected 2 blank lines, found N
- `W503` - Line break before binary operator

**Configuration** (in `.flake8`):
- Max line length: 100 characters
- Ignores: E203, W503 (spacing around operators)

---

### 4. mypy - Type Checker

Performs static type analysis based on type hints.

```bash
# Check all files
uv run mypy app/

# Check specific file
uv run mypy app/main.py

# Show detailed error messages
uv run mypy app/ --show-error-codes

# Generate coverage report
uv run mypy app/ --html ./mypy_report
```

**Common Error Types:**
- Missing type hints on function/variable
- Type mismatch (e.g., passing `str` where `int` expected)
- Unused variables
- Missing return type annotations

**Configuration** (in `pyproject.toml`):
- Python version: 3.11
- Warn on any types
- Warn on unused configs

**Example:**
```python
# ❌ Error: Missing return type
def create_user(name: str):
    return {"name": name}

# ✅ Fixed: Add return type
def create_user(name: str) -> dict[str, str]:
    return {"name": name}
```

---

### 5. pytest - Testing

Run unit tests to verify code correctness.

```bash
# Run all tests
uv run pytest

# Run with verbose output
uv run pytest -v

# Run specific test file
uv run pytest tests/test_user_service.py

# Run tests matching pattern
uv run pytest -k "test_create"

# Show print statements during tests
uv run pytest -s

# Show coverage report
uv run pytest --cov=app

# Stop on first failure
uv run pytest -x
```

---

## 📋 Complete Workflow

### Before Committing Code

1. **Format code with isort**
   ```bash
   uv run isort app/
   ```

2. **Format code with black**
   ```bash
   uv run black app/
   ```

3. **Check style with flake8**
   ```bash
   uv run flake8 app/
   ```

4. **Check types with mypy**
   ```bash
   uv run mypy app/
   ```

5. **Run tests**
   ```bash
   uv run pytest
   ```

### Or All at Once

```bash
# Run all checks
bash lint.sh

# Or individual run
uv run isort app/ && \
uv run black app/ && \
uv run flake8 app/ && \
uv run mypy app/ && \
uv run pytest
```

---

## ⚙️ Configuration Files

### `.flake8`
Flake8 configuration:
- Max line length: 100
- Excluded directories: `.venv`, `__pycache__`, `.git`, etc.
- Ignored rules: E203 (space before ':'), W503 (line break before operator)

### `pyproject.toml`
Configuration for black, isort, mypy, and pytest:
- **black**: 100 char line length, Python 3.11
- **isort**: Black profile for compatibility
- **mypy**: Type checking settings
- **pytest**: Async support, test discovery paths

---

## 🚨 Common Issues

### Issue: "Line too long" error
**Solution**: Break long lines or increase line length in config
```python
# ❌ Too long
result = some_function(arg1, arg2, arg3, arg4, arg5, arg6, arg7)

# ✅ Fixed
result = some_function(
    arg1, arg2, arg3,
    arg4, arg5, arg6, arg7
)
```

### Issue: "Unused import" error
**Solution**: Remove unused imports
```python
# ❌ Unused
import os
from typing import Optional

# ✅ Remove unused
from typing import Optional
```

### Issue: "Missing type hint" in mypy
**Solution**: Add type hints to functions
```python
# ❌ Missing type
def create_user(name):
    return name

# ✅ Add type hints
def create_user(name: str) -> str:
    return name
```

### Issue: "Black and flake8 conflict"
**Solution**: They're configured to work together. Just run black first, then flake8.

---

## 🔄 Auto-Fix Commands

Some tools can auto-fix issues:

```bash
# Auto-sort imports
uv run isort app/

# Auto-format code
uv run black app/

# These CANNOT auto-fix (manual review needed)
uv run flake8 app/      # Shows errors only
uv run mypy app/        # Shows type errors only
```

---

## 💡 Best Practices

1. **Run linting before committing**
   ```bash
   bash lint.sh
   ```

2. **Format on save** (configure your IDE)
   - VS Code: Install Python extension, enable black formatter
   - PyCharm: Settings → Tools → Python Integrated Tools → Default formatter: Black

3. **Enable pre-commit hooks** (optional)
   ```bash
   pip install pre-commit
   # Create .pre-commit-config.yaml to auto-run linting
   ```

4. **Keep imports organized**
   - Use isort to auto-organize

5. **Use type hints everywhere**
   - Improves code readability and catches bugs early

---

## 📚 Resources

- [black documentation](https://black.readthedocs.io/)
- [flake8 documentation](https://flake8.pycqa.org/)
- [isort documentation](https://pycqa.github.io/isort/)
- [mypy documentation](https://www.mypy-lang.org/)
- [pytest documentation](https://docs.pytest.org/)
