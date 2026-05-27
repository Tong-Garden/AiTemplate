# Frontend Linting & Code Quality Guide

This document explains how to set up and run linting tools in the frontend project.

## 📦 Installed Tools

- **ESLint** - JavaScript/TypeScript linter
- **Prettier** - Code formatter
- **TypeScript** - Static type checking (built-in)
- **Next.js Linting** - Framework-specific rules

## 🚀 Quick Start

### Install Dev Dependencies
```bash
cd frontend
npm install
```

### Run All Checks
```bash
# Lint code
npm run lint

# Format code
npm run format

# Check formatting without changes
npm run format:check
```

---

## 🛠️ Individual Tools

### 1. ESLint - Code Quality & Best Practices

Enforces code style, detects bugs, and prevents bad patterns.

```bash
# Check for issues
npm run lint

# Show detailed output
npm run lint -- --format=table

# Check specific file
npm run lint -- src/features/user/ui/user-form.tsx
```

**Configuration:** `.eslintrc.json`

**Key Rules:**
- ✅ No unused variables
- ✅ No `console.log` in production
- ✅ Prefer `const` over `let`
- ✅ Use `===` instead of `==`
- ✅ Explicit return types in TypeScript
- ✅ No `any` types (use `unknown` if necessary)
- ✅ Proper spacing and formatting

**Common Issues:**
```typescript
// ❌ Error: 'user' is assigned but never used
const user = await getUsersService();

// ✅ Fixed: Use it or remove it
const users = await getUsersService();
return users;

// ❌ Error: Unexpected console.log
console.log('debug');

// ✅ Fixed: Use only in development
if (process.env.NODE_ENV === 'development') {
  console.log('debug');
}

// ❌ Error: Use const instead of let
let count = 0;

// ✅ Fixed
const count = 0;
```

---

### 2. Prettier - Code Formatter

Automatically formats code to a consistent style.

```bash
# Format all files
npm run format

# Check formatting without changing
npm run format:check

# Format specific file
npx prettier --write src/features/user/ui/user-form.tsx
```

**Configuration:** `.prettierrc.json`

**Settings:**
- Line length: 100 characters
- Indentation: 2 spaces
- Quotes: Single quotes
- Semicolons: Always
- Trailing commas: Always (multiline)
- Arrow parens: Always

**Example:**
```typescript
// Before
const longFunctionName=(param1,param2,param3)=>{return param1+param2+param3}

// After (formatted by Prettier)
const longFunctionName = (param1, param2, param3) => {
  return param1 + param2 + param3;
};
```

---

### 3. TypeScript - Type Safety

Built-in type checking via `tsconfig.json`.

```bash
# Type check without compiling
npx tsc --noEmit

# Build with type checking
npm run build
```

**Configuration:** `tsconfig.json`

**Strict Mode Rules:**
- All variables must have types
- No implicit `any`
- No null-unsafe operations
- Function parameters must be typed

**Common Issues:**
```typescript
// ❌ Error: Implicit any type
function add(a, b) {
  return a + b;
}

// ✅ Fixed: Add types
function add(a: number, b: number): number {
  return a + b;
}

// ❌ Error: Potentially null value
const name = user.name.toUpperCase();

// ✅ Fixed: Check for null
const name = user?.name?.toUpperCase() || 'Unknown';
```

---

## 📋 Complete Workflow

### Before Committing Code

1. **Format code with Prettier**
   ```bash
   npm run format
   ```

2. **Lint with ESLint**
   ```bash
   npm run lint
   ```

3. **Check types with TypeScript**
   ```bash
   npm run type-check
   ```

4. **Build to verify everything works**
   ```bash
   npm run build
   ```

### Or All at Once

```bash
npm run format && npm run lint && npm run type-check && npm run build
```

---

## 📝 npm Scripts in package.json

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,md}\"",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 🚨 Common Issues & Fixes

### Issue: ESLint errors won't go away after fixing

**Solution:** Restart your dev server and IDE:
```bash
# Stop dev server (Ctrl+C)
# Clear ESLint cache
npx eslint --cache --cache-location .eslintcache --fix src/

# Restart dev server
npm run dev
```

### Issue: Prettier and ESLint conflict

**Solution:** They're configured to work together. Run in order:
```bash
npm run format    # Prettier first
npm run lint      # Then ESLint
```

### Issue: TypeScript errors in IDE but build succeeds

**Solution:** Restart TypeScript server in your IDE:
- VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
- WebStorm: File → Invalidate Caches

### Issue: "Cannot find module" errors

**Solution:** Install missing types:
```bash
npm install --save-dev @types/module-name
```

---

## 🔒 Strict TypeScript Rules

All TypeScript code MUST follow strict mode:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

---

## ✅ Code Quality Checklist

Before submitting a PR, ensure:

- [ ] No ESLint errors (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] No unused imports
- [ ] No unused variables
- [ ] All functions have return types
- [ ] All parameters have types
- [ ] No `any` types (use `unknown` if necessary)
- [ ] Proper error handling
- [ ] No `console.log` in production code

---

## 🎯 Architecture-Specific Linting

### Feature Layer Rules

**When adding a feature, ensure:**

```
src/features/{feature}/
├── dtos/              ✅ All exported with proper typing
├── schemas/           ✅ All Zod types exported
├── repo/              ✅ No validation (API only)
├── services/          ✅ Validation + mapping
├── mappers/           ✅ Pure functions only
├── state/             ✅ Services only (no repo)
└── ui/                ✅ Components + hooks
```

---

## 📚 Resources

- [ESLint Docs](https://eslint.org/docs/rules/)
- [Prettier Docs](https://prettier.io/docs/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Next.js Linting](https://nextjs.org/docs/basic-features/eslint)

---

## 🔧 IDE Integration

### VS Code Setup

1. Install extensions:
   - ESLint
   - Prettier - Code formatter
   - Thunder Client (for API testing)

2. Add to `.vscode/settings.json`:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

### WebStorm Setup

1. Settings → Languages & Frameworks → TypeScript → ESLint
   - Enable ESLint
   - Run eslint --fix on save

2. Settings → Languages & Frameworks → JavaScript → Code Style
   - Prettier as formatter
   - Enable on save

---

## 🎓 Learning Resources

- [Clean Code in JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [React Best Practices](https://react.dev/learn)
