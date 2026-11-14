#!/bin/bash

# Clear any arguments passed through the hook chain
set --

FAILED=0

echo "🔍 Running frontend linting checks..."
echo ""

echo "1️⃣  Checking Prettier formatting..."
if ! npm run format:check; then
    echo "❌ Formatting check failed. Run: npm run format"
    FAILED=1
fi
echo ""

echo "2️⃣  Linting with ESLint..."
if ! npx eslint src/; then
    echo "❌ ESLint check failed. Run: npx eslint src/ --fix"
    FAILED=1
fi
echo ""

echo "3️⃣  Type checking with TypeScript..."
if ! npm run type-check; then
    echo "❌ TypeScript found errors"
    FAILED=1
fi
echo ""

if [ "$FAILED" -ne 0 ]; then
    echo "❌ Linting FAILED. Fix the issues above."
    exit 1
fi

echo "✅ Linting checks complete!"
