# Windsurf Project Rules (Multi-Model Support)

This file provides architecture and code quality rules for Windsurf IDE that work with ANY AI model (Claude, GPT-4, Gemini, etc.).

**YOU MUST follow all rules below. You are NOT allowed to deviate.**

---

# 🔄 FEATURE PARITY RULE (CRITICAL)

**EVERY backend API endpoint MUST have a corresponding frontend UI, and vice versa.**

### The Golden Rule:
- No orphaned APIs
- No orphaned UI components
- Backend and frontend develop together

### When adding a feature:
1. **Decide:** Is this a backend, frontend, or full-stack feature?
2. **Implement:** Create the feature on both sides (backend API + frontend UI)
3. **Link:** Ensure frontend UI calls backend API
4. **Test:** Both layers work together
5. **Document:** Update CLAUDE.md files with the new feature

### Feature Parity Checklist:
- ✅ Backend API endpoint at `/v1/{endpoint}`
- ✅ Frontend service calls the endpoint
- ✅ Frontend UI component(s) exist
- ✅ Frontend Zustand store manages state
- ✅ Error handling in both layers
- ✅ Loading states in UI
- ✅ Form validation (Zod schemas)
- ✅ Page/route accessible in frontend
- ✅ Both CLAUDE.md files document the feature

---

# 📊 SYNCFUSION DATAGRID RULE (CRITICAL FOR FRONTEND)

**EVERY data list, data grid, or table component MUST use Syncfusion DataGrid.**

### The Rule:
- ❌ NO custom tables
- ❌ NO HTML table elements
- ❌ NO third-party table libraries
- ❌ NEVER create a reusable `DataGrid.tsx` wrapper
- ✅ Use Syncfusion `GridComponent` directly in each feature

### When to Use Syncfusion:
- Displaying any list of data (users, products, orders, etc.)
- Editable grids or inline row editing
- Data with sorting, filtering, pagination
- Data that needs export to Excel
- ANY table-like data presentation

### How to Use:
- Import `GridComponent` from `@syncfusion/ej2-react-grids` directly
- Define columns inline within your feature component
- Configure grid features (search, sort, filter, export) based on your needs
- Each grid is unique - no generic wrapper needed

### INLINE EDITING (MANDATORY - NO DIALOGS):
- ✅ Editing MUST ALWAYS use `mode: 'Inline'`
- ✅ NEVER use `mode: 'Dialog'`
- ✅ Enable double-click editing: `allowEditOnDblClick: true`
- ✅ Include Edit, Update, Cancel, Add, Delete in toolbar
- ✅ Handle edits via `actionComplete` event
- ✅ Make ID columns read-only: `allowEditing={false}`
- ✅ Show success/error toasts for all changes

**Configuration Example:**
```tsx
editSettings={{
  allowEditing: true,
  allowDeleting: true,
  mode: 'Inline',              // ← MUST be Inline
  allowEditOnDblClick: true,   // ← Enable cell editing
}}
toolbar={['Search', 'ExcelExport', 'Add', 'Edit', 'Delete', 'Update', 'Cancel']}

// Handle updates in actionComplete event
actionComplete={(args) => {
  if (args.requestType === 'save' && args.data) {
    updateCountry(args.data.id, args.data);
  }
  if (args.requestType === 'delete' && args.data) {
    deleteCountry(args.data.id);
  }
}}
```

**Why inline editing?**
- Better UX - users edit cells directly
- No modal context switching
- Mobile-friendly
- Faster workflows

### GRID KEY PROP (MANDATORY for Data Loading):
- ✅ EVERY GridComponent MUST include a `key` prop that changes when data arrives
- ✅ Use `key={dataArray.length}` to force re-render when API data loads
- ✅ This fixes the "empty grid on hard refresh" issue
- ✅ Without this, Syncfusion may not detect dataSource changes on initial mount

**Example:**
```tsx
// ✅ CORRECT - Forces re-render when data arrives
<GridComponent
  ref={gridRef}
  key={users.length}        // ← MANDATORY: array length as key
  dataSource={users}
  allowPaging={true}
  // ...
>

// ❌ WRONG - Missing key prop, grid stays empty on refresh
<GridComponent
  ref={gridRef}
  dataSource={users}        // ← May not show data on hard refresh
  // ...
>
```

**Why the key prop is needed:**
- Syncfusion Grid doesn't always detect dataSource changes after initial mount
- React's reconciliation may skip re-rendering if props appear unchanged
- The `key` prop forces React to create a new component instance when data arrives
- Ensures grid displays data immediately on first load and hard refreshes

### BOOLEAN COLUMNS MUST USE CHECKBOXES (MANDATORY):
- ✅ ALL boolean/flag fields MUST use `editType="checkbox"`
- ✅ Never use textbox, dropdown, or other inputs for booleans
- ✅ Display naturally as true/false in both view and edit modes
- ✅ Self-explanatory UI - no user confusion

**Configuration:**
```tsx
// ✅ CORRECT - Boolean uses checkbox
<ColumnDirective
  field="is_active"
  headerText="Active"
  width="100"
  editType="booleanedit"  // ← MUST use booleanedit
/>

<ColumnDirective
  field="is_deleted"
  headerText="Deleted"
  editType="checkbox"  // ← All booleans: checkbox
/>

// ❌ WRONG - Boolean using textbox
<ColumnDirective
  field="is_active"
  headerText="Active"
  editType="textbox"  // ← NO, use checkbox
/>

// ❌ WRONG - Boolean using dropdown
<ColumnDirective
  field="is_active"
  headerText="Active"
  editType="dropdownlist"  // ← NO, use checkbox
  dataSource={['true', 'false']}  // ← Never this pattern
/>
```

**Boolean Fields to Always Use Checkboxes:**
- `is_active` / `active`
- `is_deleted` / `deleted`
- `is_verified` / `verified`
- `is_published` / `published`
- `is_public` / `public`
- `is_locked` / `locked`
- `enabled` / `disabled`
- Any field with boolean type

**Why checkboxes for booleans?**
- Intuitive - checkbox represents two states naturally
- Accessible - native HTML checkbox semantics
- Consistent - all boolean fields have same UX
- No validation - only two possible values
- Mobile-friendly - easy to tap/click
- Self-explanatory - no confusion with "yes"/"no" or "1"/"0"

### Why No Reusable Wrapper:
Each data grid has different requirements:
- Different columns and data types
- Custom edit/delete handlers per feature
- Feature-specific validation logic
- Different column widths and formatting

A generic wrapper becomes over-abstracted and limits flexibility. Syncfusion is already complete - use it directly in your feature UI.

---

# 🗃️ STATE MANAGEMENT RULES (MANDATORY)

**ALL Zustand stores MUST follow the single status state pattern with proper error handling.**

### Single Status State Pattern - MANDATORY
- **REQUIRED**: Use single `isLoading` state (NEVER multiple loading flags like `isLoadingList`, `isLoadingDetail`)
- **REQUIRED**: Use single `error` state (NEVER multiple error flags like `listError`, `detailError`)
- **REQUIRED**: Use specific success flags (`isSuccess`, `isUpdated`, `isDeleted`, `isUploaded`)
- **FORBIDDEN**: Multiple loading/error states in the same store

### Auto-Clear Timeouts - MANDATORY
- **REQUIRED**: Success flags MUST auto-clear after 5 seconds via individual `setTimeout`
- **REQUIRED**: Errors MUST auto-clear after 5 seconds via `get().clearError()` method
- **FORBIDDEN**: Manual status clearing or `clearStatus()` methods
- **PATTERN**: Each success operation sets its flag and auto-clears independently

### Finally Block Requirement - MANDATORY
- **MANDATORY**: All async operations MUST use `try/catch/finally` blocks
- **REQUIRED**: `isLoading: false` MUST be in `finally` block (NEVER in try/catch)
- **REQUIRED**: `isLoading: true` and `error: null` set before try block
- **PATTERN**:
```tsx
set({ isLoading: true, error: null });
try {
  // async operation
  set({ isSuccess: true });
  setTimeout(() => set({ isSuccess: false }), 5000);
} catch (error) {
  set({ error: message });
  get().clearError();
  throw error;
} finally {
  set({ isLoading: false });
}
```

### Store Method Pattern - MANDATORY
- **REQUIRED**: Use `get().clearError()` in catch blocks (not internal functions)
- **FORBIDDEN**: `clearStatus()` methods (use individual auto-clear timeouts)
- **REQUIRED**: Each CRUD operation sets appropriate success flag
- **REQUIRED**: All methods return proper data or void as expected

### Interface Requirements - MANDATORY
- **REQUIRED**: Store interfaces MUST include `clearError(): void` method
- **FORBIDDEN**: `clearStatus(): void` methods in interfaces
- **REQUIRED**: State interfaces use single status flags only
- **REQUIRED**: Proper TypeScript typing for all methods and state

### Store Structure Template
```tsx
export type FeatureState = {
  data: DataType[];
  selectedData: DataType | null;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  isUpdated: boolean;
  isDeleted: boolean;
};

export type FeatureStore = FeatureState & {
  // Actions
  fetchData: () => Promise<void>;
  fetchById: (id: string) => Promise<void>;
  createData: (data: CreateData) => Promise<DataType>;
  updateData: (id: string, data: UpdateData) => Promise<DataType>;
  deleteData: (id: string) => Promise<void>;
  clearError: () => void;
  // NO clearStatus method
};
```

### STRICT ENFORCEMENT RULES

#### DO NOT:
- ❌ Use multiple loading states (`isLoadingList`, `isLoadingDetail`, etc.)
- ❌ Use multiple error states (`listError`, `detailError`, etc.)
- ❌ Create `clearStatus()` methods
- ❌ Set `isLoading: false` in try/catch blocks (use finally)
- ❌ Forget auto-clear timeouts for success flags
- ❌ Use internal clearError functions (use `get().clearError()`)

#### ALWAYS:
- ✅ Use single `isLoading` and `error` states
- ✅ Use `finally` blocks for loading state cleanup
- ✅ Auto-clear success flags after 5 seconds individually
- ✅ Auto-clear errors via `get().clearError()`
- ✅ Include `clearError(): void` in store interfaces
- ✅ Follow the exact async operation pattern shown above

---

# ⚠️ ZUSTAND SELECTOR PATTERN (MANDATORY)

**ALWAYS access Zustand store state using individual selectors — NEVER destructure the whole store.**

### Correct Pattern:
```tsx
const users = useUserStore((state) => state.users);
const listError = useUserStore((state) => state.listError);
const fetchUsers = useUserStore((state) => state.fetchUsers);
const deleteUser = useUserStore((state) => state.deleteUser);
```

### Wrong Pattern:
```tsx
// ❌ NEVER DO THIS
const { users, listError, fetchUsers } = useUserStore();
```

### Why:
- Individual selectors subscribe only to their specific slice of state
- Component re-renders ONLY when that specific value changes
- Destructuring the whole store re-renders on ANY store change (all state, all actions)
- Always one `useStore((state) => state.field)` call per value

---

# 🧹 LINTING RULE (MANDATORY — ALWAYS USE lint.sh)

**Before marking ANY feature complete, ALWAYS run `bash lint.sh` from the respective directory.**

### Frontend (from `frontend/` directory):
```bash
bash lint.sh
```
Runs:
1. **Prettier** — format check → fix with `npm run format`
2. **ESLint** — lint check → fix with `npm run lint`
3. **TypeScript** — type check → fix all type errors

### Backend (from `backend/` directory):
```bash
bash lint.sh
```
Runs:
1. **isort** — import sorting → fix with `uv run isort app/`
2. **black** — code formatting → fix with `uv run black app/`
3. **flake8** — style guide check → fix all warnings
4. **mypy** — type checking → fix all type errors

### Rule:
- ✅ ALL checks must pass with zero errors
- ✅ Run the appropriate `lint.sh` after every code change
- ❌ NEVER skip linting or mark a task done with lint errors

---

# � UI FEEDBACK PATTERNS (MANDATORY)

**ALL loading states and notifications MUST use standardized components - NO exceptions.**

### AppSnackbar - MANDATORY for ALL Notifications
- **ALWAYS use**: `AppSnackbar` from `@/common/components` for ALL success/error notifications
- **NEVER use**: `toast`, `Alert`, or custom notification components
- **Required props**: `error`, `isSuccess`, `isUpdated`, `isDeleted` as applicable
- **Auto-clear**: Success flags auto-clear after 5 seconds via store timeouts
- **Error handling**: Errors auto-clear after 5 seconds via `get().clearError()`

### Backdrop with CircularProgress - MANDATORY for ALL Loading States
- **ALWAYS use**: `Backdrop` with `CircularProgress` for loading states
- **Required pattern**:
```tsx
{isLoading ? (
  <Backdrop
    sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
    open={isLoading}
  >
    <CircularProgress color="inherit" />
  </Backdrop>
) : null}
```

### Single Status State Pattern - MANDATORY
- **REQUIRED**: Use single `isLoading` state (never multiple loading flags)
- **REQUIRED**: Use single `error` state (never multiple error flags)
- **REQUIRED**: Use specific success flags (`isSuccess`, `isUpdated`, `isDeleted`, `isUploaded`)

### Finally Block Requirement - MANDATORY
- **MANDATORY**: All async operations MUST use `try/catch/finally` blocks
- **REQUIRED**: `isLoading: false` MUST be in `finally` block
- **Pattern**:
```tsx
set({ isLoading: true, error: null });
try {
  // async operation
  set({ isSuccess: true });
  setTimeout(() => set({ isSuccess: false }), 5000);
} catch (error) {
  set({ error: message });
  get().clearError();
  throw error;
} finally {
  set({ isLoading: false });
}
```

### STRICT ENFORCEMENT RULES

#### DO NOT:
- ❌ Use `toast()` or `react-toastify`
- ❌ Use `Alert` components directly in UI
- ❌ Create custom notification components
- ❌ Use multiple loading states (`isLoadingList`, `isLoadingDetail`, etc.)
- ❌ Use multiple error states (`listError`, `detailError`, etc.)
- ❌ Set `isLoading: false` in try/catch blocks (use finally)
- ❌ Forget auto-clear timeouts for success flags

#### ALWAYS:
- ✅ Use `AppSnackbar` for all notifications
- ✅ Use `Backdrop` with `CircularProgress` for loading
- ✅ Use single `isLoading` state
- ✅ Use `finally` blocks for loading state cleanup
- ✅ Auto-clear errors after 5 seconds
- ✅ Auto-clear success flags after 5 seconds
- ✅ Use `get().clearError()` for error clearing

---

# �🗺️ PAGE.TSX ROUTING RULE (MANDATORY)

**`page.tsx` files are ROUTE ENTRY POINTS ONLY — no UI code, no state, no MUI imports.**

### The Rule:
- ✅ `page.tsx` imports ONE view component from the feature and renders it — nothing else
- ✅ All UI, state, and logic lives in `features/[feature]/ui/[feature]-view.tsx`
- ❌ NEVER import `Box`, `Typography`, `Button`, `useState`, or any UI library in `page.tsx`

### Correct Pattern:
```tsx
// src/app/users/page.tsx ✅
import { UsersView } from '@/features/user';

export default function UsersPage() {
  return <UsersView />;
}
```

```tsx
// src/features/user/ui/users-view.tsx ✅
'use client';

export function UsersView() {
  return (
    <Box sx={{ p: 3 }}>
      <UserList />
    </Box>
  );
}
```

### Wrong Pattern:
```tsx
// src/app/users/page.tsx ❌
import { Box, Typography } from '@mui/material';

export default function UsersPage() {
  return <Box><Typography>Users</Typography></Box>;  // FORBIDDEN
}
```

### Naming Convention:
- View file: `[feature]-view.tsx` → e.g. `users-view.tsx`, `roles-view.tsx`
- Export it from `features/[feature]/ui/index.ts`

---

# PROJECT ARCHITECTURE OVERVIEW

## Monorepo Structure
```
AiTemplate/
├── backend/          # FastAPI with four-layer hexagonal architecture
├── frontend/         # Next.js with feature-based DDD architecture
└── .windsurf/        # IDE configuration
```

---

# 🚀 DEVELOPMENT SERVER CONFIGURATION (MANDATORY)

**Frontend and Backend servers MUST run on FIXED ports - NEVER change them or let them auto-assign.**

### Required Ports (ENFORCED):
- **Backend**: `http://localhost:8000` (FastAPI on port 8000)
- **Frontend**: `http://localhost:4000` (Next.js on port 4000)

### Startup Commands (EXACT):
```bash
# Backend - from backend/ directory
cd backend
uv run uvicorn app.main:app --reload --port 8000

# Frontend - from frontend/ directory  
cd frontend
npm run dev
```

### Critical Points:
- ✅ Backend module path: `app.main:app` (NOT `main:app`)
- ✅ Frontend environment variable: `PORT=4000` (NOT port 3000)
- ✅ Both servers must use `--reload` / dev mode during development
- ✅ CORS in backend is configured for `http://localhost:4000`
- ✅ Frontend services call `http://localhost:8000` for all API requests

### Why Fixed Ports:
1. **Consistency** - Same ports across all developers and CI/CD
2. **No Surprises** - No "port 3000 in use, using 3003 instead" errors
3. **Service Integration** - Frontend API calls hardcoded to port 8000
4. **Documentation** - All docs reference these exact ports
5. **Testing** - E2E tests use consistent URLs

### FORBIDDEN:
- ❌ Changing ports to 3000, 5000, or any other port
- ❌ Allowing auto-assignment of alternate ports
- ❌ Removing `--reload` flag during development
- ❌ Using wrong module path like `main:app` for backend
- ❌ Starting servers without explicit port specification

### Troubleshooting:
If servers won't start:
1. Kill any processes on ports 8000/4000: `lsof -i :8000`, `lsof -i :4000`
2. Delete lock files: `rm -rf frontend/.next/dev/lock`
3. Clean cache: `rm -rf frontend/.next`
4. Use exact startup commands above

---

# CLAUDE.md - Backend Architecture Rules

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

You are a strict architecture enforcer. **You MUST follow all rules below. You are NOT allowed to deviate.**

---

# 🏗️ PROJECT STRUCTURE (BACKEND - FASTAPI)

This project follows **Hexagonal Architecture (Clean Architecture)** with **FOUR strict layers**.

All code must exist under:

```
app/
├── core/                          # Core configuration and global utilities
│   ├── config.py                 # Environment variables, settings
│   ├── exceptions.py             # Global exception classes
│   └── dependencies.py           # Global FastAPI dependencies
├── common/                        # Shared utilities across features
│   └── [shared modules]
├── features/                      # Feature modules
│   └── <feature>/                # Individual feature
│       ├── domain/               # 🎯 LAYER 1: Domain
│       │   ├── entities.py       # Pure domain entities (dataclasses)
│       │   └── exceptions.py     # Domain-specific exceptions
│       ├── application/          # 🔄 LAYER 2: Application
│       │   ├── <entity>_service.py    # Use cases & orchestration
│       │   └── interface/             # Application contracts/interfaces
│       │       └── [interfaces]
│       ├── infrastructure/       # 🛠️ LAYER 3: Infrastructure
│       │   ├── models/           # SQLAlchemy ORM models
│       │   │   └── <entity>_model.py
│       │   ├── repository/       # Repository implementations (real & mock)
│       │   │   ├── <entity>_repository.py
│       │   │   └── in_memory_<entity>_repository.py  # Mock for dev/testing
│       │   ├── mock/             # Fake/sample data (development only)
│       │   │   └── sample_data.py
│       │   ├── mappers/          # Entity ↔ DTO transformations
│       │   │   └── <entity>_mapper.py
│       │   └── parsers/          # Utility parsers (Excel, CSV, etc.)
│       │       └── excel_parser.py
│       ├── presentation/         # 📡 LAYER 4: Presentation (HTTP)
│       │   ├── api.py            # FastAPI routers
│       │   ├── schemas.py        # Pydantic request/response DTOs
│       │   └── dependencies.py   # FastAPI parameter dependencies
│       └── __init__.py
├── main.py                       # FastAPI app entry point
├── requirements.txt
├── .env
└── .env.example
```

---

# 📋 FOUR-LAYER ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│ LAYER 4: PRESENTATION (HTTP Adapter)                        │
│ - FastAPI routers (api.py)                                  │
│ - Pydantic schemas (schemas.py)                             │
│ - HTTP exceptions, status codes                             │
│ - FastAPI dependencies (dependencies.py)                    │
└──────────────────┬──────────────────────────────────────────┘
                   │ Converts Domain Exception → HTTPException
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ LAYER 2: APPLICATION (Orchestration)                        │
│ - Service classes (<entity>_service.py)                     │
│ - Use case logic (create, read, update, delete, list)       │
│ - Business rule validation                                  │
│ - Domain exception handling                                 │
└──────────────────┬──────────────────────────────────────────┘
                   │ Uses mappers to convert DTO → Entity
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ LAYER 3: INFRASTRUCTURE (Persistence)                       │
│ - Repository: database queries (repository/)                │
│ - Models: SQLAlchemy ORM (models/)                          │
│ - Mappers: Entity ↔ Model conversion (mappers/)             │
└──────────────────┬──────────────────────────────────────────┘
                   │ Returns Domain Entities
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ LAYER 1: DOMAIN (Business Logic)                            │
│ - Entities (dataclasses, no framework dependencies)         │
│ - Domain exceptions                                         │
│ - Pure business rules                                       │
│ - Framework-agnostic                                        │
└─────────────────────────────────────────────────────────────┘
```

**DATA FLOW: HTTP Request → Presentation → Application → Infrastructure → Domain**

---

# ⚙️ LAYER 1: DOMAIN (`domain/`)

**Pure business logic. Framework-agnostic. Zero external dependencies.**

### entities.py
* Use **dataclasses** (NOT Pydantic BaseModel)
* MUST contain ONLY domain business rules
* MUST NOT reference:
  - Database models
  - Pydantic schemas
  - FastAPI
  - SQLAlchemy
* MUST be serializable/deserializable

Example:
```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class LegalEntity:
    id: str
    name: str
    country_code: str
    is_active: bool = True
    
    def deactivate(self) -> None:
        """Business rule: deactivate entity"""
        if not self.is_active:
            raise ValueError("Already inactive")
        self.is_active = False
```

### exceptions.py
* **MUST be a separate file** from entities.py (Single Responsibility Principle)
* Domain-specific exception classes (inherit from `Exception`)
* Represent **business logic violations**
* MUST NOT extend Pydantic ValidationError
* Used by Application layer
* Imported by entities.py if entity methods raise exceptions

Example structure:
```
domain/
├── __init__.py          # Barrel exports from both user.py and exceptions.py
├── user.py              # Entity only
└── exceptions.py        # Exceptions only
```

Example (`domain/exceptions.py`):
```python
class LegalEntityNotFoundError(Exception):
    """Entity doesn't exist"""
    pass

class InvalidLegalEntityError(Exception):
    """Violates business rules"""
    pass

class DuplicateLegalEntityError(Exception):
    """Entity already exists"""
    pass
```

Example (`domain/user.py`):
```python
from dataclasses import dataclass
from .exceptions import UserAlreadyInactiveError

@dataclass
class User:
    id: str
    name: str
    status: str
    
    def deactivate(self) -> None:
        if self.status == 'inactive':
            raise UserAlreadyInactiveError('Already inactive')
        self.status = 'inactive'
```

Example (barrel export in `domain/__init__.py`):
```python
from .user import User
from .exceptions import (
    UserNotFoundError,
    UserAlreadyInactiveError,
)

__all__ = ['User', 'UserNotFoundError', 'UserAlreadyInactiveError']
```

---

# ⚙️ LAYER 2: APPLICATION (`application/`)

**Use case orchestration. Coordinates domain logic with infrastructure.**

### `<entity>_service.py`
* ONE service class per entity (LegalEntityService, CompanyService, etc.)
* Methods = use cases: `create()`, `get_by_id()`, `update()`, `delete()`, `list()`
* **MUST depend on repository interface, NOT concrete implementation**
* MUST:
  - Inject repository via constructor (Dependency Injection)
  - Depend on repository interface/protocol, not concrete class
  - Validate inputs (business rules)
  - Handle domain exceptions
  - Transform DTO → Entity (via mappers)
  - Return domain entities
* MUST NOT:
  - Contain HTTP logic (status codes, HTTPException)
  - Query database directly
  - Know about Pydantic schemas
  - Import concrete repository classes

Example with Abstraction:
```python
from typing import List, Protocol
from app.features.admin.legal_entity.domain.entities import LegalEntity
from app.features.admin.legal_entity.domain.exceptions import (
    LegalEntityNotFoundError,
    InvalidLegalEntityError,
)

# Repository interface (protocol/port)
class LegalEntityRepositoryInterface(Protocol):
    async def create(self, entity: LegalEntity) -> LegalEntity: ...
    async def get_by_id(self, entity_id: str) -> LegalEntity | None: ...
    async def list(self) -> List[LegalEntity]: ...
    async def update(self, entity: LegalEntity) -> LegalEntity: ...
    async def delete(self, entity_id: str) -> None: ...

class LegalEntityService:
    def __init__(self, repository: LegalEntityRepositoryInterface):
        # Depend on abstraction, not concrete implementation
        self.repository = repository
    
    async def create(self, name: str, country_code: str) -> LegalEntity:
        if not name or len(name) < 3:
            raise InvalidLegalEntityError("Name must be at least 3 characters")
        
        entity = LegalEntity(
            id=generate_id(),
            name=name,
            country_code=country_code
        )
        
        return await self.repository.create(entity)
    
    async def get_by_id(self, entity_id: str) -> LegalEntity:
        entity = await self.repository.get_by_id(entity_id)
        if not entity:
            raise LegalEntityNotFoundError(f"Entity {entity_id} not found")
        return entity
    
    async def list(self) -> List[LegalEntity]:
        return await self.repository.list()
```

### `application/interface/` (Repository Interfaces)
* **Repository interface definitions** - repository abstractions/contracts
* MUST exist for each entity repository
* MUST be a Protocol or ABC (Abstract Base Class)
* Defines the contract that all repository implementations must follow
* Enables Dependency Inversion Principle (depend on interface, not concrete)

Example (`application/interface/legal_entity_repository_interface.py`):
```python
from typing import Protocol, List
from app.features.admin.legal_entity.domain.entities import LegalEntity

class LegalEntityRepositoryInterface(Protocol):
    """Repository abstraction for LegalEntity - all implementations must follow this contract."""
    
    async def create(self, entity: LegalEntity) -> LegalEntity:
        """Create and persist a legal entity."""
        ...
    
    async def get_by_id(self, entity_id: str) -> LegalEntity | None:
        """Retrieve entity by ID."""
        ...
    
    async def list(self) -> List[LegalEntity]:
        """List all entities."""
        ...
    
    async def update(self, entity: LegalEntity) -> LegalEntity:
        """Update existing entity."""
        ...
    
    async def delete(self, entity_id: str) -> None:
        """Delete entity by ID."""
        ...
```

Benefits:
- ✅ Service doesn't care if repo is SQL, NoSQL, in-memory, or mock
- ✅ Easy to test - inject mock repository
- ✅ Easy to swap implementations - change concrete class, not service
- ✅ Follows Dependency Inversion Principle
- ✅ Decouples application from infrastructure

---

# ⚙️ LAYER 3: INFRASTRUCTURE (`infrastructure/`)

**Implementation details: database, persistence, data transformation.**

### `models/<entity>_model.py`
* SQLAlchemy ORM models
* Map to database schema
* MUST use type hints
* MUST NOT contain business logic

Example:
```python
from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class LegalEntityModel(Base):
    __tablename__ = "legal_entities"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    country_code = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
```

### `repository/<entity>_repository.py`
* Data access layer - database queries ONLY
* MUST:
  - Use repository pattern
  - Call database via ORM (SQLAlchemy)
  - Convert Model → Entity, Entity → Model (via mappers)
  - Return domain entities
* MUST NOT:
  - Contain business logic
  - Perform validation
  - Know about Pydantic schemas

Example:
```python
from typing import Optional, List
from app.features.admin.legal_entity.domain.entities import LegalEntity
from app.features.admin.legal_entity.infrastructure.models import LegalEntityModel

class LegalEntityRepository:
    def __init__(self, db_session):
        self.db = db_session
    
    async def create(self, entity: LegalEntity) -> LegalEntity:
        model = LegalEntityModel(
            id=entity.id,
            name=entity.name,
            country_code=entity.country_code,
            is_active=entity.is_active
        )
        self.db.add(model)
        await self.db.commit()
        return entity
    
    async def get_by_id(self, entity_id: str) -> Optional[LegalEntity]:
        model = await self.db.query(LegalEntityModel).filter_by(id=entity_id).first()
        if not model:
            return None
        return self._model_to_entity(model)
    
    async def list(self) -> List[LegalEntity]:
        models = await self.db.query(LegalEntityModel).all()
        return [self._model_to_entity(m) for m in models]
    
    @staticmethod
    def _model_to_entity(model: LegalEntityModel) -> LegalEntity:
        return LegalEntity(
            id=model.id,
            name=model.name,
            country_code=model.country_code,
            is_active=model.is_active
        )
```

### `mappers/<entity>_mapper.py`
* Pure transformation functions - NO dependencies
* Convert between:
  - Domain Entity → Pydantic DTO (for HTTP responses)
  - Pydantic DTO → Domain Entity (from HTTP requests)
  - Domain Entity ↔ Database Model (handled by repository)
* MUST be stateless functions

Example:
```python
from app.features.admin.legal_entity.domain.entities import LegalEntity
from app.features.admin.legal_entity.presentation.schemas import (
    CreateLegalEntitySchema,
    LegalEntityResponse,
)

class LegalEntityMapper:
    @staticmethod
    def from_schema(schema: CreateLegalEntitySchema) -> LegalEntity:
        """HTTP Request DTO → Domain Entity"""
        return LegalEntity(
            id=None,  # Generated by service
            name=schema.name,
            country_code=schema.country_code,
            is_active=True
        )
    
    @staticmethod
    def to_response(entity: LegalEntity) -> LegalEntityResponse:
        """Domain Entity → HTTP Response DTO"""
        return LegalEntityResponse(
            id=entity.id,
            name=entity.name,
            country_code=entity.country_code,
            is_active=entity.is_active
        )
```

### `repository/<entity>_repository.py` (Multiple Implementations)
* Can contain multiple implementations of the same interface:
  - Real: `SQLAlchemyLegalEntityRepository` (database)
  - Mock: `InMemoryLegalEntityRepository` (development/testing)

### `mock/` (Fake/Sample Data - Development Only)
* **For development, testing, and demos ONLY**
* Contains pre-populated sample data
* NOT for production use

**`mock/sample_data.py`**
* Pre-populated fake data for development/demos
* Loaded on application startup via dependencies
* Used to initialize mock repositories with realistic data

Example:
```python
from app.features.admin.legal_entity.domain.entities import LegalEntity

SAMPLE_LEGAL_ENTITIES = [
    LegalEntity(id='1', name='Acme Corp', country_code='US', is_active=True),
    LegalEntity(id='2', name='Global Ltd', country_code='UK', is_active=True),
    LegalEntity(id='3', name='Tech Innovations', country_code='DE', is_active=True),
]
```

**`repository/in_memory_<entity>_repository.py`**
* Mock in-memory repository implementation (stored in repository/ folder)
* Stores data in dict/list (no database)
* Useful for development, testing, integration tests
* Resets on application restart

Example:
```python
from typing import Optional, List
from app.features.admin.legal_entity.domain.entities import LegalEntity

class InMemoryLegalEntityRepository:
    """Mock implementation - development/testing only."""
    
    def __init__(self) -> None:
        self.entities: dict[str, LegalEntity] = {}
    
    async def create(self, entity: LegalEntity) -> LegalEntity:
        self.entities[entity.id] = entity
        return entity
    
    async def get_by_id(self, entity_id: str) -> Optional[LegalEntity]:
        return self.entities.get(entity_id)
    
    async def list(self) -> List[LegalEntity]:
        return list(self.entities.values())
```

---

# ⚙️ LAYER 4: PRESENTATION (`presentation/`)

**HTTP Adapter. Translates HTTP concerns to/from domain.**

### `api.py`
* FastAPI router definitions
* MUST:
  - Call application services ONLY
  - Validate HTTP input using Pydantic schemas
  - Handle domain exceptions → convert to HTTPException
  - Specify `response_model` for type safety
* MUST NOT:
  - Contain business logic
  - Query database directly
  - Call repositories

Example:
```python
from fastapi import APIRouter, HTTPException, Depends
from app.features.admin.legal_entity.presentation.schemas import (
    CreateLegalEntitySchema,
    LegalEntityResponse,
)
from app.features.admin.legal_entity.application.legal_entity_service import (
    LegalEntityService,
)
from app.features.admin.legal_entity.infrastructure.mappers import LegalEntityMapper
from app.features.admin.legal_entity.domain.exceptions import (
    LegalEntityNotFoundError,
    InvalidLegalEntityError,
)

router = APIRouter(prefix="/legal-entities", tags=["legal-entities"])

@router.post("", response_model=LegalEntityResponse, status_code=201)
async def create(
    schema: CreateLegalEntitySchema,
    service: LegalEntityService = Depends(get_legal_entity_service),
):
    try:
        entity = LegalEntityMapper.from_schema(schema)
        saved = await service.create(entity.name, entity.country_code)
        return LegalEntityMapper.to_response(saved)
    except InvalidLegalEntityError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{entity_id}", response_model=LegalEntityResponse)
async def get(
    entity_id: str,
    service: LegalEntityService = Depends(get_legal_entity_service),
):
    try:
        entity = await service.get_by_id(entity_id)
        return LegalEntityMapper.to_response(entity)
    except LegalEntityNotFoundError:
        raise HTTPException(status_code=404, detail="Entity not found")
```

### `response_model` Requirement (MANDATORY)

**ALL API endpoints MUST use typed response schemas from `schemas.py`. NEVER return plain dicts.**

#### The Rule:
- ✅ ALWAYS define typed response schemas in `presentation/schemas.py`
- ✅ ALWAYS use `response_model=TypedResponseSchema` in route decorators
- ✅ ALWAYS return the typed response object directly: `return UserDetailResponse(status="success", data=...)`
- ❌ NEVER return plain Python dicts
- ❌ NEVER use generic `dict` return types
- ❌ NEVER use `-> dict` type hints on endpoint functions

#### Required Pattern:
```python
# schemas.py - Define typed responses
class ApiResponse(BaseModel, Generic[T]):
    status: str
    data: Optional[T] = None
    message: Optional[str] = None

class UserDetailResponse(ApiResponse[UserResponse]):
    """Response for single user."""
    pass

class UserListResponse(ApiResponse[list[UserResponse]]):
    """Response for list of users."""
    pass
```

```python
# api.py - Use typed responses
@router.get("/{user_id}", response_model=UserDetailResponse)
async def get_user(user_id: str) -> UserDetailResponse:
    user = await service.get_by_id(user_id)
    return UserDetailResponse(status="success", data=UserMapper.to_response(user))

@router.get("", response_model=UserListResponse)
async def list_users() -> UserListResponse:
    users = await service.list_all()
    return UserListResponse(status="success", data=UserMapper.to_response_list(users))
```

#### Benefits:
- FastAPI generates accurate OpenAPI documentation
- Type checking catches data/response mismatches
- IDE autocomplete works correctly
- Frontend can generate types from OpenAPI spec

### `schemas.py`
* Pydantic models for HTTP requests/responses
* MUST validate API input using Field validators
* Types:
  - `Create{Entity}Schema` - POST request
  - `Update{Entity}Schema` - PUT request
  - `{Entity}Response` - HTTP response

Example:
```python
from pydantic import BaseModel, Field

class CreateLegalEntitySchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    country_code: str = Field(..., min_length=2, max_length=2)

class LegalEntityResponse(BaseModel):
    id: str
    name: str
    country_code: str
    is_active: bool
```

### `dependencies.py`
* FastAPI Depends() functions
* Instantiate services, repositories
* Path/query parameter validation
* Authentication/authorization

Example:
```python
from fastapi import Depends
from sqlalchemy.orm import Session
from app.features.admin.legal_entity.application.legal_entity_service import (
    LegalEntityService,
)
from app.features.admin.legal_entity.infrastructure.repository import (
    LegalEntityRepository,
)
from app.core.dependencies import get_db

def get_legal_entity_service(
    db: Session = Depends(get_db),
) -> LegalEntityService:
    repository = LegalEntityRepository(db)
    return LegalEntityService(repository, LegalEntityMapper)
```

---

# 🔁 DATA FLOW (MANDATORY - CANNOT BE BROKEN)

```
HTTP Request
    ↓
Presentation Layer (api.py)
    ├─ Validate using Pydantic schema
    ├─ Call Application Service
    ↓
Application Layer (service.py)
    ├─ Validate business rules
    ├─ Map DTO → Entity
    ├─ Call Repository
    ├─ Handle domain exceptions
    ↓
Infrastructure Layer (repository.py)
    ├─ Query database (SQLAlchemy)
    ├─ Convert Model ↔ Entity
    ↓
Domain Layer (entity)
    ├─ Execute business logic
    ├─ Raise domain exceptions
    ↓
Back to Presentation
    ├─ Map Entity → Response DTO
    ├─ Convert domain exceptions → HTTPException
    ├─ Return HTTP response
    ↓
HTTP Response
```

**CRITICAL: Never skip layers. Never shortcut the flow.**

---

# 🚫 ARCHITECTURAL DEPENDENCY RULE (STRICT - ZERO VIOLATIONS)

**Dependency direction MUST ONLY flow inward: `Presentation → Application → Infrastructure → Domain`. NEVER outward.**

## The Rule:
- ✅ **Domain**: No imports (pure, framework-agnostic)
- ✅ **Infrastructure**: Can import from Domain ONLY
- ✅ **Application**: Can import from Domain, Infrastructure interfaces ONLY
- ✅ **Presentation**: Can import from Application, Domain, Infrastructure repositories for DI
- ❌ **NEVER** import from outer layers

## FORBIDDEN Patterns (Will break the architecture):
```python
# ❌ Infrastructure importing from Presentation
from ..presentation.schemas import UserResponse  # VIOLATION!

# ❌ Infrastructure importing from Application  
from ..application import UserService  # VIOLATION!

# ❌ Application importing from Presentation
from ..presentation.schemas import CreateUserSchema  # VIOLATION!

# ❌ Domain importing from ANY outer layer
from ..application import UserService  # VIOLATION!
```

## CORRECT Patterns:
```python
# ✅ Presentation can import from inner layers
from ..application import UserService
from ..domain import User
from ..infrastructure import InMemoryUserRepository  # For DI only

# ✅ Application can import from Domain and Infrastructure interfaces
from ..domain import User, UserNotFoundError
from ..infrastructure.interface import UserRepositoryInterface

# ✅ Infrastructure can import from Domain only
from ...domain import User

# ✅ Domain has NO imports from other layers
```

## Common Violations to Watch For:
1. **HTTP response schemas in Infrastructure** - Move to Presentation
2. **File upload parsers in Infrastructure** - Move to Presentation (HTTP concern)
3. **Service imports in Infrastructure** - Move logic to Application layer
4. **Presentation schemas in Application** - Use domain entities, not HTTP DTOs

## Verification Check:
**Before committing ANY code**, verify imports follow this hierarchy:
```
Domain (no imports) ← Infrastructure ← Application ← Presentation
```

**If any file imports from an outer layer, it's a violation and MUST be fixed.**

---

# 🧾 NAMING RULES (STRICT)

## File Naming

| Layer | File | Example |
|-------|------|---------|
| Domain | `entities.py` | - |
| Domain | `exceptions.py` | - |
| Application | `<entity>_service.py` | `legal_entity_service.py` |
| Application | `interface/<entity>_repository_interface.py` | `interface/legal_entity_repository_interface.py` |
| Infrastructure | `models/<entity>_model.py` | `models/legal_entity_model.py` |
| Infrastructure | `repository/<entity>_repository.py` | `repository/legal_entity_repository.py` |
| Presentation | `api.py` | - |
| Presentation | `schemas.py` | - |
| Presentation | `mapper.py` | `mapper.py` (converts entities ↔ HTTP DTOs) |
| Presentation | `excel_parser.py` | `excel_parser.py` (HTTP file upload parsing) |
| Presentation | `dependencies.py` | - |

## Class/Symbol Naming

* **Entities:** PascalCase (LegalEntity, Company)
* **Services:** `{Entity}Service` (LegalEntityService)
* **Repository Interface (Port):** `{Entity}RepositoryInterface` (LegalEntityRepositoryInterface)
* **Repository Concrete:** `{Entity}Repository` (LegalEntityRepository, SQLAlchemyLegalEntityRepository, InMemoryLegalEntityRepository)
* **Mappers:** `{Entity}Mapper` (LegalEntityMapper)
* **Models:** `{Entity}Model` (LegalEntityModel)
* **Schemas:**
  - Create: `Create{Entity}Schema`
  - Update: `Update{Entity}Schema`
  - Response: `{Entity}Response`
* **Functions:** snake_case (create_entity, get_by_id)
* **Constants:** UPPER_SNAKE_CASE (MAX_RETRIES)
* **Private methods:** _snake_case (_internal_helper)

---

# 🚫 FORBIDDEN PATTERNS (CRITICAL)

**NEVER do these:**

1. ❌ **No business logic in routers** - Routers ONLY call services
2. ❌ **No database queries outside repositories** - Query logic stays in repo
3. ❌ **No domain entities in HTTP responses** - Always use mappers
4. ❌ **No Pydantic schemas in domain/application** - Schemas are HTTP concerns
5. ❌ **No imports between features** - Features are isolated modules
6. ❌ **No imports from infrastructure in domain** - Domain is independent
7. ❌ **No HTTP logic in services** - Services return entities, not HTTP responses
8. ❌ **No skipping mappers** - Always convert Entity ↔ DTO
9. ❌ **No bare `dict`/`list` type hints** - Use `Dict[str, Any]`, `List[str]`
10. ❌ **No circular imports** - Maintain layer hierarchy
11. ❌ **No direct repository calls from routers** - Always use services
12. ❌ **No validation in repositories** - Validation is application concern
13. ❌ **No mixing models with entities** - Keep database models separate
14. ❌ **No business rules in repositories** - Rules belong in application/domain
15. ❌ **No mixing exceptions with entities** - Keep `domain/exceptions.py` separate from `domain/user.py` (Single Responsibility Principle)
16. ❌ **Services must not depend on concrete repositories** - Always inject repository interface, never import concrete `LegalEntityRepository`
17. ❌ **No direct instantiation of repositories in services** - Use dependency injection via constructor parameters
18. ❌ **No concrete repository types in service signatures** - Use Protocol or ABC for type hints, not concrete class

---

# 🧪 VALIDATION RULES (STRICT)

### Layer 4: Presentation (HTTP Input)
* Validate using **Pydantic schemas** in `schemas.py`
* Invalid input → `HTTPException(400)`
* Pydantic automatically validates Field constraints

### Layer 2: Application (Business Rules)
* Validate using **domain rules** (not type validation)
* Example: "User can only have one active company"
* Business rule violation → Raise **domain exception**

### Layer 3: Infrastructure (Repository)
* **NEVER validate** - assume input is already valid
* Only perform database operations
* Database errors → Repository raises exception, service handles it

### Layer 1: Domain
* Entities contain **domain validation** (self-checks)
* Raise domain exceptions for rule violations

---

# 🔄 EXCEPTION HANDLING FLOW

```
Domain Exception (LegalEntityNotFoundError)
    ↑
    │
Application Service catches and handles
    │
    ↓
Presentation Router converts to HTTPException
    │
    ↓
HTTP Response (404, 400, 500)
```

Example:
```python
# domain/exceptions.py
class LegalEntityNotFoundError(Exception):
    pass

# application/legal_entity_service.py
async def get_by_id(self, entity_id: str) -> LegalEntity:
    entity = await self.repository.get_by_id(entity_id)
    if not entity:
        raise LegalEntityNotFoundError(...)  # ← Domain exception

# presentation/api.py
@router.get("/{entity_id}")
async def get(entity_id: str, service: LegalEntityService = Depends(...)):
    try:
        entity = await service.get_by_id(entity_id)
        return mapper.to_response(entity)
    except LegalEntityNotFoundError:  # ← Catch domain exception
        raise HTTPException(status_code=404, detail="Not found")  # ← Convert to HTTP
```

---

# 🔒 PYTHON TYPING RULES (MANDATORY)

* MUST use type hints on all functions
* MUST use type hints on all class attributes
* MUST NOT use bare `dict`, `list` → Use `Dict[str, Any]`, `List[str]`
* MUST use `Optional[T]` for nullable values (NOT `T | None`)
* MUST use `async def` for I/O operations
* MUST use `await` for database queries

Example:
```python
from typing import Optional, List, Dict, Any

class LegalEntityService:
    def __init__(self, repository: LegalEntityRepository) -> None:
        self.repository = repository
    
    async def get_by_id(self, entity_id: str) -> Optional[LegalEntity]:
        return await self.repository.get_by_id(entity_id)
    
    async def list(self) -> List[LegalEntity]:
        return await self.repository.list()
```

---

# 🧹 LINT & CODE QUALITY RULES (MANDATORY)

## General Code Quality
* ✅ No unused imports or variables
* ✅ No commented-out code
* ✅ No `print()` statements → Use `logging`
* ✅ No TODO/FIXME comments without context
* ✅ Prefer early returns instead of nested logic
* ✅ Keep functions small and focused (max ~20 lines)
* ✅ Use meaningful variable/function names
* ✅ One responsibility per function/class

## Imports
* ✅ Use absolute imports: `from app.features.legal_entity.domain.entities import LegalEntity`
* ✅ Never use relative imports: `from ..domain.entities import LegalEntity` ❌
* ✅ Group imports in order:
  1. Standard library (os, sys, typing)
  2. Third-party (fastapi, sqlalchemy, pydantic)
  3. Local (app.*)
* ✅ Use `isort` to auto-format imports
* ✅ Avoid circular imports (respect layer hierarchy)

Example:
```python
from typing import Optional, List

from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.features.legal_entity.application.legal_entity_service import LegalEntityService
```

## Functions & Methods
* ✅ ALWAYS include type hints on parameters and return type
* ✅ Keep functions focused (single responsibility)
* ✅ Avoid deep nesting (max 3 levels)
* ✅ Use early returns to reduce nesting
* ✅ Keep line length under 100 characters
* ✅ One statement per line

Example:
```python
# ✅ Good
async def get_by_id(self, entity_id: str) -> Optional[LegalEntity]:
    entity = await self.repository.get_by_id(entity_id)
    if not entity:
        return None
    return entity

# ❌ Bad
async def get_by_id(self, entity_id):
    if entity_id:
        if self.repository:
            entity = self.repository.get_by_id(entity_id)
            if entity:
                return entity
    return None
```

## Type Hints
* ✅ EVERY function MUST have type hints
* ✅ EVERY parameter MUST have a type hint
* ✅ EVERY return value MUST have a return type
* ✅ Use `Optional[T]` for nullable values
* ✅ Use `Union[T1, T2]` for multiple types
* ✅ Use `Dict[str, Any]`, `List[str]`, `Tuple[int, str]` (NOT bare dict/list/tuple)
* ✅ Use `from typing import ...` for Python 3.9+ compatibility

Example:
```python
# ✅ Good
from typing import Optional, List, Dict, Any

async def create(
    self,
    name: str,
    country_code: str,
) -> LegalEntity:
    data: Dict[str, Any] = {"name": name, "country_code": country_code}
    entity = await self.repository.create(data)
    return entity

# ❌ Bad
async def create(self, name, country_code):
    data = {"name": name, "country_code": country_code}
    entity = self.repository.create(data)
    return entity
```

## Classes
* ✅ Use type hints for all attributes
* ✅ Use `__init__` for initialization
* ✅ Organize methods: `__init__`, public methods, private methods
* ✅ Use descriptive class names (PascalCase)
* ✅ Docstrings for public classes and methods (one-line max)

Example:
```python
# ✅ Good
class LegalEntityService:
    """Handles legal entity use cases."""
    
    def __init__(self, repository: LegalEntityRepository) -> None:
        self.repository = repository
    
    async def create(self, name: str, country_code: str) -> LegalEntity:
        """Create a new legal entity."""
        if not name:
            raise InvalidLegalEntityError("Name required")
        return await self.repository.create(...)
    
    async def _validate_country_code(self, code: str) -> bool:
        """Private: validate country code format."""
        return len(code) == 2
```

## Error Handling
* ✅ Always handle exceptions in try-except blocks
* ✅ Catch specific exceptions (NOT bare `except:`)
* ✅ Use domain exceptions in services
* ✅ Use HTTPException in routers
* ✅ Log errors with logging module
* ✅ Never suppress exceptions silently

Example:
```python
# ✅ Good
from app.features.legal_entity.domain.exceptions import LegalEntityNotFoundError

try:
    entity = await service.get_by_id(entity_id)
except LegalEntityNotFoundError as e:
    logger.warning(f"Entity not found: {entity_id}")
    raise HTTPException(status_code=404, detail="Entity not found")
except Exception as e:
    logger.error(f"Unexpected error: {e}")
    raise HTTPException(status_code=500, detail="Internal server error")

# ❌ Bad
try:
    entity = await service.get_by_id(entity_id)
except:  # Too broad
    pass
```

## Async/Await
* ✅ Use `async def` for all I/O operations
* ✅ Use `await` for all async calls
* ✅ Don't mix sync and async without clear reason
* ✅ Never use `asyncio.run()` inside application code
* ✅ Don't use `sync_to_async` or `async_to_sync` unless necessary

Example:
```python
# ✅ Good
async def get_by_id(self, entity_id: str) -> Optional[LegalEntity]:
    entity = await self.repository.get_by_id(entity_id)  # await async call
    return entity

# ❌ Bad
async def get_by_id(self, entity_id: str) -> Optional[LegalEntity]:
    entity = self.repository.get_by_id(entity_id)  # Missing await
    return entity
```

## Comments & Documentation
* ✅ Only comment the "WHY", not the "WHAT"
* ✅ Keep comments up-to-date with code changes
* ✅ Use docstrings for public APIs (one-line preferred)
* ✅ Avoid over-commenting obvious code

Example:
```python
# ✅ Good
def calculate_discount(price: float, is_member: bool) -> float:
    """Calculate price with member discount if applicable."""
    if is_member:
        # Members get 10% discount
        return price * 0.9
    return price

# ❌ Bad
def calculate_discount(price: float, is_member: bool) -> float:
    # Check if member
    if is_member:
        # Multiply price by 0.9
        return price * 0.9
    # Return original price
    return price
```

## Naming Conventions
* ✅ Classes: PascalCase (LegalEntityService)
* ✅ Functions/variables: snake_case (get_legal_entity)
* ✅ Constants: UPPER_SNAKE_CASE (MAX_RETRIES)
* ✅ Private methods: _snake_case (_internal_method)
* ✅ Avoid abbreviations (use `legal_entity` NOT `le`)
* ✅ Use descriptive names (use `get_by_country_code` NOT `get`)

## Pydantic Models (Schemas)
* ✅ Use `BaseModel` for all request/response schemas
* ✅ Use `Field` for validation constraints
* ✅ Use descriptive field names
* ✅ Add examples in schema docstrings

Example:
```python
# ✅ Good
from pydantic import BaseModel, Field

class CreateLegalEntitySchema(BaseModel):
    """Request body for creating a legal entity."""
    
    name: str = Field(..., min_length=1, max_length=255, description="Entity name")
    country_code: str = Field(..., min_length=2, max_length=2, description="ISO country code")

# ❌ Bad
class CreateLegalEntitySchema(BaseModel):
    name: str
    cc: str
```

## Testing
* ✅ Write tests for each layer independently
* ✅ Use meaningful test names: `test_create_legal_entity_with_valid_data`
* ✅ Test happy path AND error cases
* ✅ Mock external dependencies
* ✅ Keep tests small and focused

Example test structure:
```python
import pytest
from app.features.legal_entity.application.legal_entity_service import LegalEntityService
from app.features.legal_entity.domain.exceptions import InvalidLegalEntityError

@pytest.mark.asyncio
async def test_create_legal_entity_with_valid_data():
    """Service creates entity with valid input."""
    service = LegalEntityService(repository=MockRepository())
    entity = await service.create(name="Test Corp", country_code="US")
    assert entity.name == "Test Corp"

@pytest.mark.asyncio
async def test_create_legal_entity_with_invalid_name():
    """Service raises error with invalid name."""
    service = LegalEntityService(repository=MockRepository())
    with pytest.raises(InvalidLegalEntityError):
        await service.create(name="", country_code="US")
```

## Linting Tools Configuration

### Black (Code Formatter)
```bash
black app/ --line-length 100
```

### isort (Import Sorter)
```bash
isort app/ --profile black
```

### flake8 (Linter)
```bash
flake8 app/ --max-line-length 100
```

### mypy (Type Checker)
```bash
mypy app/ --strict
```

Run all:
```bash
black app/ && isort app/ && flake8 app/ && mypy app/
```

---

# 📋 DEVELOPMENT COMMANDS

```bash
# Setup
cd backend
python -m venv venv
venv\Scripts\activate  # Windows; use `source venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
cp .env.example .env

# Development
uvicorn app.main:app --reload
uvicorn app.main:app --reload --host 0.0.0.0

# Production
uvicorn app.main:app

# Testing
pytest
pytest -v
pytest --cov

# Linting
flake8 app/
black app/
isort app/
mypy app/
```

---

# 🔧 CORE CONFIGURATION

All configuration in `core/config.py`:

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    DEBUG: bool = False
    API_TITLE: str = "API"
    
    class Config:
        env_file = ".env"

settings = Settings()
```

Access settings:
```python
from app.core.config import settings

if settings.DEBUG:
    # Debug logic
```

---

# 🎯 CORE PRINCIPLES

1. **Layer Independence** - Each layer depends only on layers below it
2. **Domain Independence** - Domain has ZERO framework dependencies
3. **Framework Agnostic Domain** - Domain logic ≠ FastAPI/SQLAlchemy
4. **Testability** - Each layer testable independently
5. **Business Logic Isolation** - All business rules in domain + application
6. **Clean Boundaries** - No bleeding between layers
7. **Mapper-based Conversion** - Use mappers for all transformations
8. **Type Safety** - Complete type hints everywhere
9. **Reusability** - Services usable from HTTP, CLI, events, etc.
10. **Clear Responsibility**
    - Domain = Rules
    - Application = Orchestration
    - Infrastructure = Persistence
    - Presentation = HTTP

---

# 📡 API VERSIONING

**All API endpoints MUST use version prefix: `/api/v1/`**

### Routing Pattern

```python
# app/main.py
from app.features.user.presentation.api import router as user_router

app.include_router(
    user_router,
    prefix="/api/v1",  # ← REQUIRED version prefix
    tags=["users"]
)
```

### Endpoint Format

**All endpoints follow:** `/api/v1/<resource>/`

Examples:
- `POST /api/v1/users` - Create user
- `GET /api/v1/users` - List users
- `GET /api/v1/users/{id}` - Get user by ID
- `PUT /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Delete user

### Why Version Prefix?

- ✅ Allows breaking changes in v2 without affecting v1 clients
- ✅ Easy to run multiple API versions in parallel
- ✅ Clear evolution of API contract
- ✅ Industry standard practice

---

# 🚀 WHEN ADDING NEW FEATURES

Follow this **exact** structure:

```
app/features/<feature>/
├── domain/
│   ├── entities.py
│   ├── exceptions.py
│   └── __init__.py
├── application/
│   ├── <entity>_service.py
│   ├── interface/
│   │   └── [interfaces]
│   └── __init__.py
├── infrastructure/
│   ├── models/
│   │   ├── <entity>_model.py
│   │   └── __init__.py
│   ├── repository/
│   │   ├── <entity>_repository.py
│   │   └── __init__.py
│   ├── mappers/
│   │   ├── <entity>_mapper.py
│   │   └── __init__.py
│   └── __init__.py
├── presentation/
│   ├── api.py
│   ├── schemas.py
│   ├── dependencies.py
│   └── __init__.py
└── __init__.py
```

**Steps:**
1. **Domain first:** Define entities and exceptions
2. **Application:** Create service with use cases
3. **Infrastructure:** Models, repositories, mappers
4. **Presentation:** Routers, schemas, dependencies
5. **Register:** Add router to `app/main.py`

Example registration:
```python
# app/main.py
from app.features.legal_entity.presentation.api import router as legal_entity_router

app.include_router(
    legal_entity_router,
    prefix="/api/v1/legal-entities",
    tags=["legal-entities"]
)
```

---

# 🔐 SECURITY

* NEVER commit `.env` files (use `.env.example`)
* Validate all user input at presentation layer
* Use HTTPException for all HTTP errors
* No stack traces in production (use logging)
* Use dependencies for authentication/authorization
* Set CORS properly for frontend URL

---

# 🎯 YOU ARE

**NOT a creative assistant.**

You are a **strict four-layer architecture enforcer** for FastAPI backends.

- Follow ALL rules above
- Maintain layer boundaries strictly
- Never skip layers
- Never deviate from patterns
- Enforce naming conventions
- Require complete type hints

**Remember: Domain → Application → Infrastructure → Presentation**

---

# AI Architecture Enforcement Rules (Frontend)

You are a strict architecture enforcer.

You MUST follow all rules below when generating code.
You are NOT allowed to deviate.

---

# PROJECT STRUCTURE

All code must exist under:

- src/
  - app/ (Next.js app router)
  - common/ (shared components, hooks, utils)
  - core/
    - data/ … shared API client, endpoints
    - dtos/ … cross-feature DTOs (e.g., company.dto.ts)
    - stores/ … shared store helpers
  - features/
    - [feature]/
        - dtos/ … feature-specific DTOs
        - repo/ … raw API calls only (no mapping/validation)
        - services/ … one file per API operation (validation + mapping)
        - schemas/ … Zod schemas (forms + param guards)
        - mappers/ … form-to-DTO transformations (used by services)
        - state/ … Zustand store and state types (state only)
        - ui/ … pages/components/forms

---

# 📁 FEATURE STRUCTURE

Each feature MUST contain:

* dtos/
* repo/
* services/
* schemas/
* mappers/
* state/
* ui/

No additional folders allowed.

---

# ⚙️ LAYER RULES (STRICT)

## repo/

* ONLY perform HTTP requests
* MUST use shared API client
* MUST NOT:

  * validate data
  * map data
  * contain business logic

---

## services/

* EXACTLY one file per operation:

  * get, getById, create, update, delete

* MUST:

  * validate inputs using Zod
  * call mappers for DTO transformation
  * call repo

* MUST NOT:

  * contain UI logic
  * skip validation

---

## mappers/

* MUST be pure functions
* MUST convert form schema → DTO
* MUST NOT:

  * call APIs
  * perform validation

---

## schemas/

* MUST use Zod
* MUST include:

  * form schemas
  * param guard schemas (page, limit, id)

---

## state/ (Zustand) - MANDATORY SEPARATE FILES

**State types and Store implementation MUST be in separate files.**

### Directory Structure:
```
state/
├── index.ts              # Barrel export only
├── [entity].state.ts     # State types using 'type' (NOT interface)
└── [entity].store.ts     # Zustand store implementation
```

### `[entity].state.ts` - State Types ONLY
* MUST use `type` keyword (NEVER use `interface`)
* MUST define complete state shape
* MUST NOT contain any implementation logic
* MUST NOT import Zustand or any runtime code
* Example:
```typescript
export type UserState = {
  users: UserDto[];
  selectedUser: UserDto | null;
  isLoadingList: boolean;
  isLoadingCreate: boolean;
  listError: string | null;
};

export type UserStore = UserState & {
  // Actions
  fetchUsers: () => Promise<void>;
  createUser: (data: CreateUserDto) => Promise<void>;
  updateUser: (id: string, data: UpdateUserDto) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
};
```

### `[entity].store.ts` - Store Implementation
* MUST use Zustand `create()` hook
* MUST implement the `{Entity}Store` type
* MUST call services (never direct repo calls)
* MUST manage all state (loading, error, data)
* MUST NOT mix with state definitions
* **CRITICAL: MUST auto-clear ALL error messages after 5 seconds**
  - Set timeout when error occurs: `setTimeout(() => set({ errorField: null }), 5000);`
  - Errors clear on new operations, manual action, or auto-timeout
  - No error should persist longer than 5 seconds

### `index.ts` - Barrel Export
```typescript
export { useUserStore } from './user.store';
export type { UserStore, UserState } from './user.state';
```

---

## ⏱️ ERROR AUTO-CLEAR RULE (MANDATORY FOR ALL STORES)

**EVERY error message MUST auto-clear after 5 seconds - NO EXCEPTIONS.**

### Required Implementation:
Every store MUST have a helper function to set errors with auto-clear timeout:

```typescript
const setErrorWithTimeout = (errorKey: keyof {Entity}State, message: string) => {
  set({ [errorKey]: message });
  setTimeout(() => set({ [errorKey]: null }), 5000);
};
```

### Usage in All Error Cases:
```typescript
fetchData: async () => {
  set({ isLoading: true, error: null });
  try {
    const data = await service.fetch();
    set({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Operation failed';
    setErrorWithTimeout('error', message);  // ← Auto-clears after 5s
  } finally {
    set({ isLoading: false });
  }
},
```

### Rules:
- ✅ Error displays immediately
- ✅ Error auto-clears after exactly 5000ms
- ✅ New operation clears old error immediately
- ✅ User can manually clear with clearErrors() action
- ✅ Only one timeout per error field at a time

### Why Separate Files:
- **Clarity**: Types are separate from implementation
- **Dependency-free**: State types don't import Zustand or services
- **Testability**: Can test state shape without store logic
- **Maintainability**: Clear separation of concerns

---

## ui/

* MUST:

  * use React Hook Form + Zod
  * consume Zustand store

* MUST NOT:

  * call repo directly
  * bypass services (unless explicitly required)

---

# 🧾 NAMING RULES (STRICT)

## Files

* DTOs:
  create-entity.dto.ts
  update-entity.dto.ts

* Schemas:
  create-entity.schema.ts
  edit-entity.schema.ts

* Services:
  create-entity.service.ts
  get-entities.service.ts

* Repo:
  entity.api.ts OR entity.repo.ts (consistent)

* State (SEPARATE FILES - MANDATORY):
  entity.state.ts (types only, using `type` keyword)
  entity.store.ts (Zustand implementation)

* Mappers:
  create-entity.mapper.ts

---

## Symbols

* Types/Interfaces → PascalCase
* Variables/Functions → camelCase

---

# 📦 BARREL RULES

* If a folder has ≥ 2 files → MUST include index.ts
* MUST import via barrels when available

---

# 🧪 VALIDATION RULES (ZOD)

* UI → form schemas
* Services → param schemas + mapping
* Repo → NO validation

---

# 🔁 DATA FLOW (MANDATORY)

UI → Store → Service → Mapper → Repo → API

This flow MUST NOT be broken.

---

# 🔒 TYPESCRIPT STRICT RULES (MANDATORY)

* TypeScript MUST run in strict mode
* You MUST NOT use:

  * any
  * unknown (unless explicitly justified)
  * as any
  * implicit types

---

## ✅ REQUIRED TYPING PRACTICES

* Every function MUST have explicit return types
* API responses MUST use DTO types
* Form data MUST use Zod inferred types
* NEVER duplicate types if Zod schema exists

Example:

const schema = z.object({
name: z.string(),
});

type FormData = z.infer<typeof schema>;

---

## 🚫 FORBIDDEN TYPESCRIPT PATTERNS

* any usage
* untyped parameters
* unsafe type assertions
* mixing DTO types with UI types

---

# 🧹 LINT RULES (MANDATORY)

## Code Quality

* No unused variables
* No unused imports
* No console.log in production code
* Prefer const over let
* Use early returns instead of nested logic

---

## Imports

* Use barrel imports when available
* Avoid deep relative imports
* Keep imports clean and organized

---

## Functions

* Functions must be small and focused
* Avoid deep nesting
* Prefer pure functions

---

## React Rules

* Components MUST be fully typed
* Props MUST use interfaces or types
* No complex logic inside JSX
* Extract reusable logic into hooks

---

## Error Handling

* Always handle API errors
* Do not ignore promise rejections
* Use typed error handling where possible

---

# 🚫 FORBIDDEN

* No direct repo calls from UI or state
* No validation outside schemas/services
* No mapping outside mappers
* No skipping layers
* No new architecture patterns
* No untyped code
* No breaking TypeScript strict rules

---

# 📤 OUTPUT REQUIREMENTS

When generating code, you MUST:

1. Generate full feature structure
2. Follow naming conventions strictly
3. Include:

   * DTOs
   * Services
   * Schemas
   * Mappers
   * State (Zustand)
   * UI components
4. Use Zod in all schemas
5. Ensure strict typing everywhere

---

# 🎯 GOAL

Generate consistent, scalable, and maintainable feature modules
that strictly follow this architecture, typing, and lint rules.

You are NOT a creative assistant.

You are a strict architecture and code quality enforcer.

---

# 🎨 FRONTEND UI FRAMEWORK RULES (MANDATORY)

## Material-UI (MUI) - REQUIRED for ALL UI Components

**EVERY single UI component MUST use Material-UI**

- **Packages:** `@mui/material`, `@mui/icons-material`
- **Theme:** Configured in `src/lib/theme.ts`
- **Provider:** ThemeProvider wraps entire app in `src/app/layout.tsx`

### Forbidden (STRICT):
❌ Custom CSS files
❌ Tailwind CSS
❌ Inline styles (use `sx` prop only)
❌ CSS modules
❌ Other UI libraries (Bootstrap, Chakra, etc.)

### MUI Usage Rules:
✅ Use MUI components: `<Box>`, `<Button>`, `<TextField>`, `<Card>`, `<Typography>`, etc.
✅ Use `sx` prop for styling: `<Box sx={{ p: 2, display: 'flex' }} />`
✅ Use theme for colors, spacing, typography
✅ Always use Material icons from `@mui/icons-material`

Example:
```tsx
import { Box, Button, TextField, Card, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

export function MyComponent() {
  return (
    <Card sx={{ p: 2 }}>
      <Typography variant="h6">Title</Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField label="Input" fullWidth />
        <Button variant="contained" startIcon={<AddIcon />}>
          Add
        </Button>
      </Box>
    </Card>
  );
}
```

---

## Syncfusion DataGrid - REQUIRED for ALL Data Grids

**EVERY data grid, table, or editable data list MUST use Syncfusion DataGrid**

### Component Location:
`src/common/components/DataGrid.tsx` (pre-built, fully configured)

### Required Features (ALL grids MUST have):
✅ **Editable Rows** - Allow inline editing with dialog
✅ **Searchable** - Global search across all columns
✅ **Sortable** - Click headers to sort
✅ **Filterable** - Filter by column values
✅ **Excel Export** - Toolbar button to export to Excel
✅ **Pagination** - Page through large datasets
✅ **Toolbar** - Search + Export buttons

### DataGrid Props:
```typescript
data: T[]                                   // Array of rows
columns: Array<{                            // Column definitions
  field: string;                            // Data field name
  headerText: string;                       // Display header
  type?: 'text' | 'date' | 'dropdown';      // Column type
  editType?: 'textbox' | 'dropdown' | ...;  // Edit input type
  width?: number | string;                  // Column width
  allowSearching?: boolean;                 // Include in search
  allowSorting?: boolean;                   // Sortable
  allowFiltering?: boolean;                 // Filterable
}>
isLoading?: boolean                         // Show spinner
error?: string                              // Show error
onRowUpdate?: (data) => Promise<void>       // Save handler
onDelete?: (row) => Promise<void>           // Delete handler
allowEditing?: boolean                      // Enable edit/delete
allowExcelExport?: boolean                  // Show export button
pageSize?: number                           // Rows per page (default: 10)
```

### Usage Example:
```tsx
import { DataGrid } from '@/common/components';
import { useRef } from 'react';
import { GridComponent } from '@syncfusion/ej2-react-grids';

export function UsersListPage() {
  const gridRef = useRef<GridComponent>(null);
  const [data, setData] = useState<User[]>([]);
  const { isLoading, error } = useGetUsers();

  const handleRowUpdate = async (updatedRow: User) => {
    await updateUserService.execute(updatedRow);
    // Refresh: refetch or update state
  };

  const handleDelete = async (deletedRow: User) => {
    await deleteUserService.execute(deletedRow.id);
    // Refresh data
  };

  const columns = [
    { field: 'id', headerText: 'ID', width: 80 },
    { field: 'name', headerText: 'Name', width: 200, editType: 'textbox' },
    { field: 'email', headerText: 'Email', width: 250, editType: 'textbox' },
    { field: 'role', headerText: 'Role', width: 150, type: 'dropdown' },
    { field: 'status', headerText: 'Status', width: 120, type: 'dropdown' },
  ];

  return (
    <DataGrid
      ref={gridRef}
      data={data}
      columns={columns}
      onRowUpdate={handleRowUpdate}
      onDelete={handleDelete}
      isLoading={isLoading}
      error={error}
      allowEditing={true}
      allowExcelExport={true}
      allowPaging={true}
      allowSorting={true}
      allowFiltering={true}
      pageSize={20}
    />
  );
}
```

---

## Syncfusion License Setup

### Required Steps:
1. **Get license key** - From Syncfusion account dashboard
2. **Add to `.env.local`:**
```
NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY=Nzk1NzEwQDMyMzIzMjMyMzIzMjMyMzIzMjMyMzIzMjMyMzIzMjMyMzIzMjMyMzIzMjMyMzIzMjMyMzIzMjMyMzIzMjMyMzIzMjMyMzIzMjMyMzIzMjMyMzIzMjMz
```
3. **License auto-registers** - Via `src/lib/syncfusion-license.ts` on client side

### Important:
✅ Key starts with `'Nzk...'` or similar prefix
✅ Key is `NEXT_PUBLIC_` (accessible in browser, required)
✅ Auto-registered in app layout
⚠️ Trial mode works if key is missing (shows warning)
📝 Never commit actual key to git (use `.gitignore`)

---

## UI Component Guidelines

### Layout Components (use MUI):
- `<Box>` - Generic container with sx prop
- `<Container>` - Max-width wrapper
- `<Stack>` - Flexbox column/row
- `<Grid>` - 12-column responsive grid

### Form Components (use MUI + React Hook Form):
- `<TextField>` - Text input
- `<Select>` - Dropdown
- `<Checkbox>` - Checkbox
- `<Radio>` - Radio button
- `<Button>` - Submit button

### Data Display (use Syncfusion DataGrid):
- Any table, grid, or editable list
- Always use the pre-built DataGrid component
- Never create custom tables

### Feedback Components (use MUI):
- `<Alert>` - Error/warning/info messages
- `<CircularProgress>` - Loading spinner
- `<Snackbar>` - Toast notifications
- `<Dialog>` - Modal dialogs

### Typography (use MUI):
- `<Typography>` - All text content
- Variants: h1, h2, h3, h4, h5, h6, body1, body2, caption
- Never use `<p>`, `<span>`, `<div>` for text

### Icons (use MUI Icons):
```tsx
import { Add, Edit, Delete, Download, Search } from '@mui/icons-material';

<Button startIcon={<Add />}>Add</Button>
```

---

## Forbidden UI Patterns

❌ Custom `<div>` containers (use `<Box>`)
❌ Custom `<p>` or `<span>` (use `<Typography>`)
❌ Custom CSS files (use `sx` prop)
❌ Tailwind classes (use `sx` prop)
❌ Inline styles `style={{}}` (use `sx` prop)
❌ Custom table components (use DataGrid)
❌ Bootstrap or other UI libraries
❌ Non-MUI icons (use `@mui/icons-material`)
❌ Hard-coded colors (use theme)

---

## Theme Customization

Located in `src/lib/theme.ts`

All colors, fonts, spacing should be in theme:
```tsx
// ✅ CORRECT - Use theme
<Box sx={{ 
  color: 'primary.main',     // Use theme colors
  p: theme.spacing(2),       // Use theme spacing
  fontSize: 'h6.fontSize'    // Use theme typography
}} />

// ❌ WRONG - Hard-coded values
<Box sx={{ 
  color: '#1976d2',
  padding: '16px',
  fontSize: '16px'
}} />
```

---

# 📐 DEFAULT LAYOUT (AUTO-APPLIED TO ALL PAGES)

**ALL pages automatically have AppBar + Responsive Drawer via the shared Layout component.**

### What's Included:
- ✅ **Top AppBar** - Fixed navigation header with page title
- ✅ **Side Drawer** - Responsive navigation menu (persistent on desktop, toggleable on mobile)
- ✅ **Mobile Responsive** - Hamburger menu on small screens, drawer always visible on desktop
- ✅ **Pre-configured Menu** - Dashboard, Users, Settings with Material Icons
- ✅ **Smooth Animations** - Theme-based transitions and easing

### Auto-Applied:
Located at: `src/app/layout.tsx`
```typescript
export default function RootLayout({ children }) {
  return (
    <Layout>
      {children}  {/* All pages get AppBar + Drawer automatically */}
    </Layout>
  );
}
```

### No Manual Wrapping Needed:
- ❌ DO NOT manually wrap pages with Layout
- ❌ DO NOT create custom AppBars or Drawers
- ✅ Just create your page content, Layout is applied at root

### Customization:
Only menu items are customizable. Edit `src/common/components/Layout.tsx`:
```typescript
const menuItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, href: '/' },
  { label: 'Users', icon: <PeopleIcon />, href: '/users' },
  { label: 'Settings', icon: <SettingsIcon />, href: '/settings' },
];
```

### Component Location:
- **File**: `src/common/components/Layout.tsx`
- **Exported from**: `src/common/components/index.ts`
- **Used in**: `src/app/layout.tsx` (root layout)
