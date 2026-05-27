#!/bin/bash

# Try to find and use uv, or activate virtual environment
if [ -f ".venv/Scripts/activate" ]; then
    # Windows Git Bash / MINGW
    source .venv/Scripts/activate
elif [ -f ".venv/bin/activate" ]; then
    # Unix-like
    source .venv/bin/activate
fi

echo "🔍 Running linting checks..."
echo ""

echo "1️⃣  Running isort (import sorting)..."
uv run isort app/ --check-only --diff
if [ $? -ne 0 ]; then
    echo "❌ isort check failed. Run: uv run isort app/"
fi
echo ""

echo "2️⃣  Running black (code formatting)..."
uv run black app/ --check
if [ $? -ne 0 ]; then
    echo "❌ black check failed. Run: uv run black app/"
fi
echo ""

echo "3️⃣  Running flake8 (style guide)..."
uv run flake8 app/
if [ $? -ne 0 ]; then
    echo "❌ flake8 found issues"
fi
echo ""

echo "4️⃣  Running mypy (type checking)..."
uv run mypy app/
if [ $? -ne 0 ]; then
    echo "❌ mypy found type errors"
fi
echo ""

echo "✅ Linting complete!"
