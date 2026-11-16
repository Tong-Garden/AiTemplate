# Backend Architecture Rules (FastAPI)

**See root CLAUDE.md for shared full-stack rules (Feature Parity, Dev Server Config, etc.)**

You are a strict backend architecture enforcer. **You MUST follow all rules below. You are NOT allowed to deviate.**

---

# 🏗️ PROJECT STRUCTURE

```
app/
├── core/
│   ├── base.py              # ⭐ Shared SQLAlchemy DeclarativeBase — ALL models import from here
│   ├── config.py            # Environment variables, settings
│   ├── exceptions.py        # Global exception classes
│   └── dependencies.py      # Global FastAPI dependencies
├── common/                  # Shared utilities across features
├── features/
│   └── <feature>/
│       ├── domain/
│       │   ├── entities.py       # Pure dataclasses — no framework deps
│       │   └── exceptions.py     # Domain-specific exceptions
│       ├── application/
│       │   ├── <entity>_service.py
│       │   └── interface/        # Repository protocol/interface definitions
│       ├── infrastructure/
│       │   ├── models/           # ORM schema reference (NOT wired up)
│       │   │   ├── <entity>_header_model.py
│       │   │   ├── <entity>_line_model.py   # if parent-child applies
│       │   │   └── __init__.py
│       │   ├── repository/
│       │   │   ├── in_memory_<entity>_repository.py  # ✅ ACTIVE
│       │   │   └── <entity>_repository.py             # SQLAlchemy (future)
│       │   ├── mock/             # sample_data.py — dev/test only
│       │   ├── mappers/          # Entity ↔ DTO transformations
│       │   └── parsers/          # Excel, CSV, etc.
│       └── presentation/
│           ├── api.py            # FastAPI routers
│           ├── schemas.py        # Pydantic request/response DTOs
│           └── dependencies.py   # Depends() factories
└── main.py
```

---

# 📋 FOUR-LAYER ARCHITECTURE

```
LAYER 4 — PRESENTATION   FastAPI routers, Pydantic schemas, HTTP exceptions
         ↓ domain exception → HTTPException
LAYER 2 — APPLICATION    Service classes, use-case orchestration, business rules
         ↓ DTO → Entity via mappers
LAYER 3 — INFRASTRUCTURE Repository, ORM models, mappers, parsers
         ↓ returns domain entities
LAYER 1 — DOMAIN         Dataclass entities, domain exceptions, pure business logic
```

**CRITICAL: Never skip layers. Never shortcut the flow.**

---

# ⚙️ LAYER 1 — DOMAIN

- Use **dataclasses** (NOT Pydantic)
- Zero external dependencies (no SQLAlchemy, no FastAPI, no Pydantic)
- Business methods live here (e.g. `entity.cancel()`, `entity.post()`)
- `exceptions.py` is a **separate file** from `entities.py`
- Domain exceptions inherit from `Exception`, not `HTTPException`

---

# ⚙️ LAYER 2 — APPLICATION

- ONE service class per entity
- Constructor-inject the **repository interface** (Protocol), never the concrete class
- Methods = use cases: `create()`, `get_by_id()`, `list()`, `update()`, `delete()`
- Validates business rules → raises domain exceptions
- MUST NOT import HTTPException, Pydantic schemas, or concrete repositories

---

# ⚙️ LAYER 3 — INFRASTRUCTURE

## ORM Models (MANDATORY — schema reference only)

**EVERY feature MUST have ORM model files even when using InMemoryRepository.**
They serve as the authoritative schema reference for ERDs, PRDs, and future DB migration.

### Header / Lines convention

| Feature shape | Files to create |
|---|---|
| Simple (single table) | `<entity>_model.py` |
| Document + line items | `<entity>_header_model.py` + `<entity>_line_model.py` |

Use header/lines when the feature is a document with child rows (orders, GRNs, invoices, etc.).

### Rules
- ✅ ALWAYS create model files when adding a new feature
- ✅ ALWAYS import `Base` from `app.core.base` — never define a local Base
- ✅ ALWAYS use SQLAlchemy 2.x `Mapped[]` / `mapped_column()` style
- ✅ FK column on child: name it `<entity>_header_id` (e.g. `grn_header_id`)
- ✅ Parent relationship: `lines` ↔ `header` with `cascade="all, delete-orphan"`
- ✅ Every model gets `created_at` / `updated_at` audit timestamps
- ✅ Index FK columns and frequently filtered columns
- ✅ Module docstring must state: *"Schema reference only — NOT wired up. App uses InMemoryRepository."*
- ❌ NEVER wire up models to the running app unless explicitly requested
- ❌ NEVER import ORM models in domain, application, or presentation layers
- ❌ NEVER define `Base` inside a feature — always use `app.core.base`
- ❌ NEVER put business logic inside model classes

### Minimal example
```python
from app.core.base import Base

class OrderHeaderModel(Base):
    __tablename__ = "order_headers"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="draft", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    lines: Mapped[List["OrderLineModel"]] = relationship(
        "OrderLineModel", back_populates="header", cascade="all, delete-orphan", lazy="selectin"
    )

class OrderLineModel(Base):
    __tablename__ = "order_lines"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    order_header_id: Mapped[str] = mapped_column(String(36), ForeignKey("order_headers.id", ondelete="CASCADE"), nullable=False, index=True)
    header: Mapped["OrderHeaderModel"] = relationship("OrderHeaderModel", back_populates="lines")
```

## Repository

- Data access only — no business logic, no validation
- `in_memory_<entity>_repository.py` is always the **active** repository
- Returns domain entities, not ORM models
- List methods return `tuple[list[Entity], int]` (entities + total count)

## Mappers

- Stateless pure functions
- Convert: Domain Entity ↔ Pydantic DTO, Domain Entity ↔ ORM Model

---

# ⚙️ LAYER 4 — PRESENTATION

- Routers call services only — no direct DB or repo access
- Convert domain exceptions → `HTTPException`
- All responses follow the standard envelope (see below)
- Specify `response_model` on every route

---

# 📄 STANDARD RESPONSE ENVELOPE

All endpoints return this shape:

```json
{ "status": "success" | "error", "data": <payload> | null, "errors": [], "meta": {} }
```

**Success — list:** `data` = array, `meta` = `{page, limit, total, totalPages, hasNextPage, hasPreviousPage}`  
**Success — detail:** `data` = object, `meta` = `{}`  
**Error:** `data` = null, `errors` = array of `{type, title, status, detail, field?}`

### Standard error types
`validation-error` (422) · `not-found` (404) · `unauthorized` (401) · `forbidden` (403) · `conflict` (409) · `bad-request` (400) · `server-error` (500)

---

# 📄 PAGINATION (MANDATORY for all list endpoints)

- Accept `page` (default 1) and `limit` (default 20, min 1, max 100) query params
- Calculate `offset = (page - 1) * limit` in the service layer
- Repository receives `offset` + `limit`, returns `(entities, total_count)`
- Response `meta` includes: `page, limit, total, totalPages, hasNextPage, hasPreviousPage`
- ❌ NEVER return unlimited results

---

# 🚨 ERROR HANDLING (MANDATORY)

- ALL errors use the structured envelope — never plain strings or HTML
- Use global exception handlers in `main.py` for domain exceptions
- Each error object: `type`, `title`, `status`, `detail`, `field` (validation only)
- ❌ NEVER expose stack traces
- ❌ NEVER return `data` in error responses

---

# 🧾 NAMING RULES

| Layer | File | Class / Symbol |
|---|---|---|
| Domain | `entities.py` | `LegalEntity` |
| Domain | `exceptions.py` | `LegalEntityNotFoundError` |
| Application | `<entity>_service.py` | `LegalEntityService` |
| Application | `interface/<entity>_repository_interface.py` | `LegalEntityRepositoryInterface` |
| Infrastructure | `models/<entity>_header_model.py` | `LegalEntityHeaderModel` |
| Infrastructure | `models/<entity>_line_model.py` | `LegalEntityLineModel` |
| Infrastructure | `repository/in_memory_<entity>_repository.py` | `InMemoryLegalEntityRepository` |
| Infrastructure | `mappers/<entity>_mapper.py` | `LegalEntityMapper` |
| Presentation | `api.py` / `schemas.py` / `dependencies.py` | `Create{Entity}Schema`, `{Entity}Response` |

- Functions: `snake_case` · Constants: `UPPER_SNAKE_CASE` · Classes: `PascalCase`

---

# 🔒 TYPING RULES

- Type hints on **all** function parameters and return values
- No bare `dict` / `list` → parametrise them: `dict[str, Any]` / `list[T]`
- Use built-in generics (`dict`, `list`, `set`, `tuple`, `type`) and `X | None` / `A | B`; never `typing.Dict`, `List`, `Set`, `Tuple`, `Type`, `Optional` or `Union` (deprecated since 3.9/3.10)
- In a class that defines a method named `list`, write `builtins.list[T]` in later annotations so they do not resolve to the method
- `ruff` (UP006, UP007, UP045) enforces this in `lint.sh` and pre-commit; `/py-typing` converts legacy hints in the files a task changed
- `async def` + `await` for all I/O

---

# 📝 DOCUMENTATION RULES

- Google-style docstrings on every public class and method
- Document **why** not **how** — Args / Returns / Raises sections
- No TODO / FIXME / commented-out code

---

# 🚫 FORBIDDEN PATTERNS

1. ❌ Business logic in routers
2. ❌ Database queries outside repositories
3. ❌ Domain entities directly in HTTP responses (always use mappers)
4. ❌ Pydantic schemas in domain or application layers
5. ❌ Cross-feature imports
6. ❌ Infrastructure imports in domain layer
7. ❌ Concrete repository classes injected into services (use interfaces)
8. ❌ Skipping mappers for entity/model/DTO transformations
9. ❌ Circular imports
10. ❌ ORM models imported in presentation, application, or domain layers

---

# 🧪 VALIDATION RESPONSIBILITIES

| Layer | Validates | On failure |
|---|---|---|
| Presentation | HTTP input format (Pydantic) | `HTTPException(422)` |
| Application | Business rules | Domain exception |
| Domain | Domain constraints | Domain exception |
| Infrastructure | Nothing — assumes valid input | — |

---

# 🧹 CODE QUALITY

- No unused imports or variables
- No `print()` — use `logging`
- Max ~20 lines per function
- Absolute imports only: `from app.features.grn.domain.entities import GRN`
- Import order: stdlib → third-party → local (`app.*`)
- Run `bash lint.sh` (isort → black → flake8 → mypy) before marking any feature complete — ALL checks must pass

---

# 🎯 ADDING A NEW FEATURE — CHECKLIST

**Structure:**
```
features/<feature>/
├── domain/           entities.py, exceptions.py
├── application/      <entity>_service.py, interface/
├── infrastructure/
│   ├── models/       <entity>_header_model.py, <entity>_line_model.py (if applicable)
│   ├── repository/   in_memory_<entity>_repository.py  ← inject this
│   ├── mock/         sample_data.py
│   └── mappers/      <entity>_mapper.py
└── presentation/     api.py, schemas.py, dependencies.py
```

**Steps:**
1. **Domain** — entities + exceptions
2. **Application** — service + repository interface
3. **Infrastructure / Models** — create ORM model files (`from app.core.base import Base`), header+lines if applicable, docstring stating NOT wired up
4. **Infrastructure / Repository** — InMemory implementation with fake data
5. **Infrastructure / Mappers** — entity ↔ DTO conversion
6. **Presentation** — routers, schemas, inject InMemoryRepository
7. **Register** — add router in `app/main.py`

**ORM model checklist (required before completing any feature):**
- ✅ Model files exist in `infrastructure/models/`
- ✅ `Base` imported from `app.core.base`
- ✅ Header/lines split applied where the feature is a document with line items
- ✅ FK column named `<entity>_header_id`
- ✅ `created_at` / `updated_at` on every model
- ✅ Docstring states model is NOT wired up
- ✅ App still uses InMemoryRepository — no behaviour change

---

# 🎯 YOU ARE

A **strict four-layer architecture enforcer** for FastAPI backends.
Follow ALL rules. Maintain layer boundaries. Never skip layers. Never deviate from patterns.

**Domain → Application → Infrastructure → Presentation**
