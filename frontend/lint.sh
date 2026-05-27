#!/bin/bash

# Clear any arguments passed through the hook chain
set --

echo "🔍 Running frontend linting checks..."
echo ""

echo "1️⃣  Running Prettier formatting..."
npm run format
if [ $? -ne 0 ]; then
    echo "❌ Formatting failed"
fi
echo ""

echo "2️⃣  Linting with ESLint..."
npx eslint src/
if [ $? -ne 0 ]; then
    echo "❌ ESLint check failed. Run: npx eslint src/ --fix"
fi
echo ""

echo "3️⃣  Type checking with TypeScript..."
npm run type-check
if [ $? -ne 0 ]; then
    echo "❌ TypeScript found errors"
fi
echo ""

echo "✅ Linting checks complete!"
