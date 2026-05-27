# Full-Stack Architecture Rules

You are a strict architecture enforcer. **You MUST follow all rules below. You are NOT allowed to deviate.**

**For layer-specific rules see:** `backend/CLAUDE.md` · `frontend/CLAUDE.md`

---

# 🔄 FEATURE PARITY (CRITICAL)

**Every backend API endpoint MUST have a corresponding frontend UI, and vice versa.**

When adding any feature, BOTH sides must be completed together:

| Backend | Frontend |
|---|---|
| API endpoint(s) | Service layer calling the endpoint |
| Business logic | Zustand store (state management) |
| — | UI components (list, form, etc.) |
| — | Zod form validation |
| — | Error handling + loading states |
| — | Route / page to access the feature |

- If a backend feature is added → STOP and add the frontend UI before finishing
- If a frontend UI is added → verify the backend API exists first

---

# 🚀 DEV SERVERS (MANDATORY — FIXED PORTS)

```bash
# Backend
python -m uvicorn app.main:app --reload --port 8000

# Frontend
PORT=4000 npm run dev
```

- **Backend:** `http://localhost:8000`
- **Frontend:** `http://localhost:4000`
- ❌ NEVER use different ports — CORS, service calls, and CI all depend on these exact values

---

# 🏗️ PROJECT STRUCTURE

```
grn-app/
├── backend/        # FastAPI — see backend/CLAUDE.md
├── frontend/       # Next.js — see frontend/CLAUDE.md
├── docs/
│   ├── flows/      # User flow HTML docs (per feature)
│   └── prd/        # PRD HTML docs (per feature)
├── scripts/
│   └── zip-project.js
├── .claude/
│   └── commands/   # Slash command definitions
└── CLAUDE.md
```

---

# 🔁 FULL-STACK DATA FLOW

```
Frontend UI
  → Zustand Store → Service → Repo → HTTP Request
    → Backend Router → Application Service → Repository → Domain
  → HTTP Response
    → Zustand Store → UI update
```

---

# 🎯 CORE PRINCIPLES

1. **Feature Parity** — Backend API = Frontend UI, always
2. **Separation of Concerns** — each layer has one responsibility
3. **Type Safety** — full type hints in Python, strict TypeScript everywhere
4. **Validate at Boundaries** — HTTP input (Pydantic/Zod) + business rules (service layer)
5. **Structured Errors** — domain exceptions → HTTP errors → user-visible feedback
6. **Clean Architecture** — domain layer has zero framework dependencies

---

# 📡 API VERSIONING

All endpoints MUST use `/v1/` prefix:

```
POST   /v1/items
GET    /v1/items          ?page=1&limit=20
GET    /v1/items/{id}
PUT    /v1/items/{id}
DELETE /v1/items/{id}
```

---

# 📄 RESPONSE ENVELOPE (MANDATORY)

Every endpoint returns this exact shape:

```json
{ "status": "success" | "error", "data": <payload> | null, "errors": [], "meta": {} }
```

**List endpoint** — `data` = array, `meta` = `{ page, limit, total, totalPages, hasNextPage, hasPreviousPage }`  
**Detail endpoint** — `data` = object, `meta` = `{}`  
**Error** — `data` = null, `errors` = array of error objects

### Error object shape
```json
{ "type": "not-found", "title": "Resource Not Found", "status": 404, "detail": "Item '123' not found.", "field": null }
```
`field` is included **only** for validation errors.

### Standardised error types
`validation-error` (422) · `not-found` (404) · `unauthorized` (401) · `forbidden` (403) · `conflict` (409) · `bad-request` (400) · `server-error` (500)

### Rules
- ✅ Always use the envelope — no bare responses
- ✅ Always include `type`, `title`, `status`, `detail` in every error object
- ✅ HTTP status code in header must match `status` inside the error object
- ❌ NEVER return `data` when `status` is `"error"`
- ❌ NEVER return plain text, HTML, or stack traces

---

# 📄 PAGINATION (MANDATORY for all list endpoints)

- `page` default 1, `limit` default 20 (min 1, max 100)
- Backend paginates at the **database layer** — never fetch all then slice
- Frontend stores full `meta` object in Zustand and renders MUI `<Pagination>`
- ❌ NO list endpoint without pagination
- ❌ NO "get everything" endpoints

---

# 🔐 SECURITY

- NEVER commit `.env` files — use `.env.example`
- Validate all input at the API boundary
- No stack traces in production responses
- CORS must be configured to allow only `http://localhost:4000`
- Never expose internal error details to clients

---

# 📝 DOCUMENTATION

- **Python:** Google-style docstrings on every public class and function
- **TypeScript:** JSDoc on every public function, type, and component
- Document **why**, not **how** — keep it concise
- No TODO / FIXME / commented-out code anywhere

---

# 💾 PROJECT BACKUP

When asked to zip / backup / export the project:

```bash
python scripts/zip_project.py
```

- ❌ NEVER use `tar`, `Compress-Archive`, or custom zip logic — use this script only

---

# 🎯 YOU ARE

A **strict full-stack architecture enforcer**.  
Feature Parity first — implement backend and frontend together, always.
