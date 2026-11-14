#!/bin/bash

# Try to find and use uv, or activate virtual environment
if [ -f ".venv/Scripts/activate" ]; then
    # Windows Git Bash / MINGW
    source .venv/Scripts/activate
elif [ -f ".venv/bin/activate" ]; then
    # Unix-like
    source .venv/bin/activate
fi

FAILED=0

echo "🔍 Running linting checks..."
echo ""

echo "1️⃣  Running isort (import sorting)..."
if ! uv run isort app/ --check-only --diff; then
    echo "❌ isort check failed. Run: uv run isort app/"
    FAILED=1
fi
echo ""

echo "2️⃣  Running black (code formatting)..."
if ! uv run black app/ --check; then
    echo "❌ black check failed. Run: uv run black app/"
    FAILED=1
fi
echo ""

echo "3️⃣  Running flake8 (style guide)..."
if ! uv run flake8 app/; then
    echo "❌ flake8 found issues"
    FAILED=1
fi
echo ""

echo "4️⃣  Running mypy (type checking)..."
if ! uv run mypy app/; then
    echo "❌ mypy found type errors"
    FAILED=1
fi
echo ""

if [ "$FAILED" -ne 0 ]; then
    echo "❌ Linting FAILED. Fix the issues above."
    exit 1
fi

echo "✅ Linting complete!"
