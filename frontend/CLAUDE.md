# Frontend Architecture Rules (Next.js / React)

**See root CLAUDE.md for shared full-stack rules (Feature Parity, Dev Server Config, etc.)**

You are a strict architecture enforcer. **You MUST follow all rules below. You are NOT allowed to deviate.**

---

# 📁 PROJECT STRUCTURE

```
src/
├── app/                  # Next.js routes — route entry points ONLY
├── common/               # Shared components, hooks, utils
├── core/                 # API client, shared DTOs, store helpers
└── features/
    └── [feature]/
        ├── dtos/         # TypeScript DTOs (API shapes)
        ├── repo/         # HTTP calls only — no logic
        ├── services/     # Zod validation + mapping + orchestration
        ├── schemas/      # Zod schemas
        ├── mappers/      # Pure form → DTO transformation
        ├── state/        # Zustand store (state.ts + store.ts + index.ts)
        └── ui/           # React components, forms, views
```

No additional folders allowed.

---

# 🔁 DATA FLOW (MANDATORY — NEVER BREAK)

```
UI → Store → Service → Mapper → Repo → API
```

---

# ⚙️ LAYER RULES

| Layer | Responsibility | DO ✅ | DON'T ❌ |
|---|---|---|---|
| **repo/** | HTTP calls | API requests only | Validation, mapping, logic |
| **services/** | Orchestration | Validate (Zod), map, call repo | UI logic, skip validation |
| **mappers/** | Transformation | Pure form→DTO functions | API calls, validation |
| **schemas/** | Contracts | Zod schemas for forms + params | Business logic |
| **state/** | State management | Zustand, call services only | Direct repo calls, mapping |
| **ui/** | Presentation | React Hook Form, MUI, Syncfusion | Repo calls, business logic |

---

# 🗺️ PAGE.TSX RULE (MANDATORY)

`page.tsx` is a **route entry point only** — zero UI, zero state, zero MUI imports.

```tsx
// ✅ CORRECT
import { UsersView } from '@/features/user';
export default function UsersPage() { return <UsersView />; }

// ❌ WRONG — no UI in page.tsx
import { Box } from '@mui/material';
export default function UsersPage() { return <Box>...</Box>; }
```

- View component lives at `features/[feature]/ui/[feature]-view.tsx`
- Exported from `features/[feature]/ui/index.ts`

---

# 🗃️ STATE — ZUSTAND RULES

## File structure
```
state/
├── [entity].state.ts   # Types only — no Zustand imports
├── [entity].store.ts   # Zustand implementation
└── index.ts            # Barrel export
```

## Required state shape
Every store managing list data MUST include:
```typescript
type EntityState = {
  items: EntityDto[];
  pagination: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean; };
  isLoading: boolean;
  error: string | null;
  errors: ApiError[];
  fieldErrors: Record<string, string>;
  isSuccess: boolean;
  isUpdated: boolean;
  isDeleted: boolean;
};
```

## Selector pattern (MANDATORY)
```tsx
// ✅ CORRECT — individual selectors
const users = useUserStore((state) => state.users);
const fetchUsers = useUserStore((state) => state.fetchUsers);

// ❌ WRONG — never destructure the whole store
const { users, fetchUsers } = useUserStore();
```
Individual selectors prevent unnecessary re-renders. Destructuring re-renders on ANY store change.

## Store action rules
- ✅ `try / catch / finally` — always set `isLoading: false` in `finally`
- ✅ Auto-clear errors after 5 seconds: `setTimeout(() => set({ error: null, errors: [] }), 5000)`
- ✅ Auto-clear success flags after 5 seconds
- ✅ Extract `fieldErrors` from API error objects that have a `field` property
- ✅ Call services only — never call repo directly
- ❌ NEVER set `isLoading: false` in try or catch — use finally
- ❌ NEVER have multiple loading flags (`isLoadingList`, `isLoadingDetail`)

## Minimal store pattern
```typescript
fetchItems: async (page = 1, limit = 20) => {
  set({ isLoading: true, error: null, errors: [], fieldErrors: {} });
  try {
    const response = await getItemListService(page, limit);
    const fieldErrors: Record<string, string> = {};
    set({ items: response.data, pagination: response.meta });
  } catch (err) {
    const { errors } = parseApiError(err);
    const fieldErrors = Object.fromEntries(errors.filter(e => e.field).map(e => [e.field!, e.detail]));
    set({ error: errors.map(e => e.detail).join('; '), errors, fieldErrors });
    setTimeout(() => set({ error: null, errors: [] }), 5000);
  } finally {
    set({ isLoading: false });
  }
},
```

---

# 📄 PAGINATION (MANDATORY for all list features)

- Accept and pass `page` (default 1) + `limit` (default 20, max 100) on every list fetch
- Store full pagination metadata from API response (`page, limit, total, totalPages, hasNextPage, hasPreviousPage`)
- Store exposes: `fetchItems(page, limit)`, `goToPage(page)`, `nextPage()`, `previousPage()`, `setLimit(limit)`
- Reset to page 1 when changing limit
- UI MUST show Previous / Next buttons, MUI `<Pagination>` component, and "X of Y total" indicator
- Disable Previous/Next based on `hasPreviousPage` / `hasNextPage`
- ❌ NEVER fetch without pagination params
- ❌ NEVER use a custom pagination component — use `MUI Pagination`

---

# 🚨 ERROR HANDLING (MANDATORY)

## API error type
```typescript
type ApiError = { type: string; title: string; status: number; detail: string; field?: string; };
```

## Rules
- ✅ ALWAYS parse errors from axios response into `ApiError[]`
- ✅ ALWAYS store both `error` (combined string) and `errors` (structured array) and `fieldErrors` (per-field map)
- ✅ ALWAYS auto-clear errors after 5 seconds
- ✅ Show field errors in form `helperText`
- ✅ Show general errors in `AppSnackbar`
- ❌ NEVER expose stack traces or raw error objects to users
- ❌ NEVER ignore caught errors

---

# 📊 SYNCFUSION DATAGRID (MANDATORY for all data lists)

**EVERY data list MUST use Syncfusion DataGrid — never custom tables or `<table>` elements.**

## Required services (no Filter)
```tsx
<Inject services={[Page, Search, Toolbar, Edit, Sort, ExcelExport]} />
```
Do NOT add `Filter` — use toolbar Search instead.

## Editing — MUST be Inline
```tsx
editSettings={{ allowEditing: true, allowDeleting: true, mode: 'Inline', allowEditOnDblClick: true }}
toolbar={['Search', 'ExcelExport', 'Add', 'Edit', 'Delete', 'Update', 'Cancel']}
// ❌ mode: 'Dialog' is FORBIDDEN
```

## Boolean columns — MUST use checkbox
```tsx
<ColumnDirective field="is_active" headerText="Active" editType="booleanedit" />
// ❌ editType="textbox" or "dropdownlist" for booleans is FORBIDDEN
```

## Key prop (MANDATORY — fixes empty grid on refresh)
```tsx
<GridComponent key={items.length} dataSource={items} ... />
// ❌ Missing key prop causes empty grid on hard refresh
```

## Refresh button (MANDATORY)
Every grid MUST have a refresh `IconButton` top-right above the grid:
```tsx
<Tooltip title="Refresh"><IconButton onClick={() => { fetchData(); gridRef.current?.refresh(); }}><RefreshIcon /></IconButton></Tooltip>
```

## General rules
- ✅ Import `GridComponent` directly in each feature — no shared wrapper
- ✅ Define columns inline per feature
- ❌ NEVER create a reusable `DataGrid.tsx` wrapper
- ❌ NEVER use `<table>` HTML elements

---

# 🎨 UI FRAMEWORK (MANDATORY)

- **ALL UI** uses Material-UI (`@mui/material`, `@mui/icons-material`)
- Theme configured in `src/lib/theme.ts`, applied via `ThemeProvider` in root layout
- Styling via `sx` prop only — no CSS files, no Tailwind, no inline styles
- Layout (`AppBar` + `Drawer`) is auto-applied at root — all pages get it automatically
- Add menu items in `src/common/components/Layout.tsx`

## Loading state
```tsx
<Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoading}>
  <CircularProgress color="inherit" />
</Backdrop>
```

## Notifications
Use `AppSnackbar` from `@/common/components` for ALL success/error messages.
```tsx
<AppSnackbar error={error} isSuccess={isSuccess} isUpdated={isUpdated} isDeleted={isDeleted}
  successMessage="..." updateMessage="..." deleteMessage="..." />
```
- ❌ NEVER use `toast`, `react-toastify`, or direct `Alert` components

---

# 🧾 NAMING RULES

| Artifact | Pattern | Example |
|---|---|---|
| DTO file | `{action}-{entity}.dto.ts` | `create-user.dto.ts` |
| Schema file | `{action}-{entity}.schema.ts` | `create-user.schema.ts` |
| Service file | `{action}-{entity}.service.ts` | `create-user.service.ts` |
| Repo file | `{entity}.repo.ts` | `user.repo.ts` |
| State files | `{entity}.state.ts` / `{entity}.store.ts` | `user.state.ts` |
| Mapper file | `{action}-{entity}.mapper.ts` | `create-user.mapper.ts` |
| View component | `{feature}-view.tsx` | `users-view.tsx` |
| Types | PascalCase | `UserDto`, `CreateUserSchema` |
| Variables | camelCase | `userData`, `isLoading` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_LIMIT` |

- Use `type` not `interface`
- 2+ files in a folder → MUST have `index.ts` barrel export

---

# 📝 DOCUMENTATION (MANDATORY)

- JSDoc on every public function, type, and component
- `@param`, `@returns`, `@throws` for non-obvious signatures
- `@example` for complex functions
- Document **why**, not **how** — keep it concise
- ❌ No TODO / FIXME / commented-out code

---

# 🔒 TYPESCRIPT RULES (MANDATORY)

- Strict mode — no `any`, no `unknown` (unless justified), no implicit types
- Explicit return types on all functions
- Zod-inferred types for forms: `type FormData = z.infer<typeof schema>`
- No duplicate types — derive from Zod schemas
- Props interfaces for every component

---

# 🧹 CODE QUALITY

- Run `bash lint.sh` (Prettier → ESLint → TypeScript) before marking any feature complete — all checks must pass
- No unused imports / variables
- No `console.log` in production code
- `const` over `let`
- Max ~20 lines per function — single responsibility
- Early returns over deep nesting

---

# 🚫 FORBIDDEN

1. ❌ Direct repo calls from UI or state
2. ❌ Validation outside schemas/services
3. ❌ Mapping outside mappers
4. ❌ Skipping layers
5. ❌ `any` / untyped code
6. ❌ UI in `page.tsx`
7. ❌ Custom `<table>` elements (use Syncfusion)
8. ❌ Dialog edit mode in Syncfusion
9. ❌ `toast` / `react-toastify` (use AppSnackbar)
10. ❌ Multiple loading/error flags per store
11. ❌ Destructuring entire Zustand store
12. ❌ CSS files / Tailwind / inline styles (use MUI sx)

---

# 🎯 ADDING A NEW FEATURE — CHECKLIST

```
features/[feature]/
├── dtos/       [entity].dto.ts
├── repo/       [entity].repo.ts
├── services/   get-[entity].service.ts, create-[entity].service.ts, ...
├── schemas/    create-[entity].schema.ts, update-[entity].schema.ts
├── mappers/    create-[entity].mapper.ts
├── state/      [entity].state.ts, [entity].store.ts, index.ts
└── ui/         [entity]-list.tsx, [entity]-form.tsx, [entity]-view.tsx, index.ts
```

**Steps:**
1. **DTOs** — define API request/response shapes
2. **Schemas** — Zod schemas for forms
3. **Repo** — API calls (no logic)
4. **Mappers** — form → DTO transformations
5. **Services** — validate + map + call repo
6. **State** — Zustand store with pagination + error handling
7. **UI** — components consuming store, Syncfusion grid, AppSnackbar
8. **Route** — `app/[feature]/page.tsx` importing the view component

---

# 🎯 YOU ARE

A **strict frontend architecture enforcer** for Next.js / React.
Follow ALL rules. Never skip layers. Never deviate from patterns.

**UI → Store → Service → Mapper → Repo → API**
