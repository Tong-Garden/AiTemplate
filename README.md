# AI Template - Full Stack Application

A modern full-stack application with **FastAPI backend** (Hexagonal Architecture) and **Next.js 16 frontend** using **axios** for HTTP requests.

## 🚀 Quick Start

### Backend
```bash
cd backend
uv sync
uv run pre-commit install
uv run uvicorn app.main:app --reload --port 8000
```
Backend: `http://localhost:8000`

### Frontend
```bash
cd frontend
npm install
PORT=4000 npm run dev
```
Frontend: `http://localhost:4000`

---

## 📋 Prerequisites

- **Python 3.11+** (backend)
- **Node.js 18+** (frontend)
- **npm** (frontend package manager)
- **uv** package manager: `pip install uv`
- **Git** (for version control and hooks)

---

## 🔧 Git Hooks Setup (Required for Code Quality)

This project uses automated git hooks to ensure code quality and consistency.

### One-Time Setup After Cloning

#### Backend Git Hooks (pre-commit)
```bash
cd backend
uv run pre-commit install
```
This installs Python linting hooks (isort, black, flake8, mypy).

#### Frontend Git Hooks (Husky)
```bash
cd frontend
npm install
```
The `prepare` script automatically runs `husky install` during `npm install`, setting up formatting and linting hooks for TypeScript/JavaScript.

### What the Hooks Do

**Backend (pre-commit):**
- ✅ Auto-checks import sorting with `isort`
- ✅ Auto-checks code formatting with `black`
- ✅ Runs style checks with `flake8`
- ✅ Performs type checking with `mypy`

**Frontend (Husky + lint-staged):**
- ✅ Auto-formats code with Prettier
- ✅ Runs ESLint and auto-fixes issues
- ✅ Validates commit message format

### Commit Message Format

This project enforces **[Conventional Commits](https://www.conventionalcommits.org/)** via a `commit-msg` git hook.

#### Format
```
<type>(<scope>): <description>
```
- **`type`** — required, one of the types below
- **`scope`** — optional, the area of the codebase affected (e.g. `auth`, `api`, `ui`)
- **`description`** — required, max 50 characters, lowercase

#### Commit Types

| Type | When to use | Example |
|---|---|---|
| `feat` | New feature added | `feat(auth): add jwt login` |
| `fix` | Bug fix | `fix(api): handle null user response` |
| `docs` | Documentation only | `docs: update setup guide` |
| `style` | Formatting, no logic change | `style: format with prettier` |
| `refactor` | Code restructure, no feature/fix | `refactor(user): simplify service layer` |
| `test` | Adding or updating tests | `test(user): add unit tests for create user` |
| `chore` | Tooling, config, maintenance | `chore: update dependencies` |

#### Examples
```bash
git commit -m "feat(user): add user authentication"
git commit -m "fix(api): resolve null pointer exception"
git commit -m "docs: update api documentation"
git commit -m "style: format code with prettier"
git commit -m "refactor: simplify user service"
git commit -m "test: add unit tests for user model"
git commit -m "chore: update dependencies"
git commit -m "chore: initial commit"
```

#### ❌ Invalid examples
```bash
git commit -m "Initial commit"          # missing type
git commit -m "FEAT: add login"         # type must be lowercase
git commit -m "feat: Add Login Feature That Is Too Long To Fit In Fifty Characters"  # description too long
```

### Daily Workflow
1. Make changes to your code
2. Stage files: `git add .`
3. Commit with proper format: `git commit -m "feat: add new feature"`
4. Push changes: `git push`

The git hooks will automatically run and block commits if there are code quality issues.

### Troubleshooting Git Hooks
```bash
# If hooks aren't working, reinstall them:
cd backend && uv run pre-commit install
cd frontend && npm install  # Triggers prepare script automatically

# To bypass hooks (not recommended):
git commit --no-verify -m "message"
git push --no-verify
```

For detailed git hooks documentation, see [SETUP_GIT_HOOKS.md](SETUP_GIT_HOOKS.md).

---

## 🛠️ Detailed Setup Guide

### Backend Setup

#### Step 1: Navigate to backend directory
```bash
cd backend
```

#### Step 2: Install dependencies with uv
```bash
uv sync
```
This automatically creates `.venv/` and installs all dependencies from `pyproject.toml`

#### Step 3: Create environment file
```bash
cp .env.example .env
```

#### Step 4: Start development server
```bash
uv run uvicorn app.main:app --reload
```

**Backend runs at:**
- API: `http://localhost:8000`
- Health Check: `http://localhost:8000/health`
- Swagger UI Docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

### Frontend Setup

#### Step 1: Navigate to frontend directory
```bash
cd frontend
```

#### Step 2: Install dependencies
```bash
npm install
```

#### Step 3: Create environment file
```bash
cp .env.example .env.local
```

Edit `.env.local` and ensure:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

#### Step 4: Start development server
```bash
npm run dev
```

**Frontend runs at:**
- Web App: `http://localhost:3000`

---

## 📁 Project Structure

```
AiTemplate/
├── backend/                           # FastAPI (Hexagonal Architecture)
│   ├── .venv/                        # Virtual environment (auto-created by uv)
│   ├── app/
│   │   ├── main.py                  # FastAPI entry point
│   │   ├── core/                    # Configuration & global utilities
│   │   └── features/                # Feature modules
│   │       └── user/                # User feature (example)
│   │           ├── domain/          # Business logic (entities, exceptions)
│   │           ├── application/     # Use cases (services, interfaces)
│   │           ├── infrastructure/  # Persistence (repositories, models, mappers)
│   │           └── presentation/    # HTTP (routers, schemas, dependencies)
│   ├── pyproject.toml               # Project dependencies & metadata
│   ├── requirements.txt             # Legacy requirements file
│   ├── .env.example                 # Environment template
│   ├── CLAUDE.md                    # Architecture rules & guidelines
│   └── README.md                    # Backend documentation
│
└── frontend/                         # Next.js (React)
    ├── node_modules/
    ├── src/
    │   ├── pages/                   # Next.js pages/routes
    │   ├── components/              # React components
    │   └── lib/                     # Utilities & API client
    ├── package.json
    ├── .env.example                 # Environment template
    └── README.md                    # Frontend documentation
```

---


## 🏗️ Architecture

### Backend: Hexagonal (Clean) Architecture - 4 Layers

```
Presentation Layer (HTTP)
    ↓ (routes, schemas, dependencies)
Application Layer (Orchestration)
    ↓ (services, use cases)
Infrastructure Layer (Persistence)
    ↓ (repositories, models, mappers)
Domain Layer (Business Logic)
    ↑ (entities, exceptions)
```

**Key Principles:**
- ✅ Domain-Driven Design (DDD)
- ✅ Dependency Inversion Principle
- ✅ Repository Pattern with Interfaces
- ✅ Strict Layer Separation
- ✅ Framework-Independent Domain Logic
- ✅ Type-Safe with Full Type Hints

For detailed architecture guidelines, see [backend/CLAUDE.md](backend/CLAUDE.md)

### Frontend: Next.js with Axios

- React components for UI
- Axios for API requests
- Environment-based API URL configuration
- Built-in CORS handling

---

## 📝 Environment Variables

### Backend (.env)
```env
# Add your backend environment variables here
# Example:
DEBUG=true
ENVIRONMENT=development
```

### Frontend (.env.local)
```env
# Backend API URL (MUST include /api/v1)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## 🔧 Available Commands

### Backend Commands

```bash
# Development server with auto-reload
uv run uvicorn app.main:app --reload

# Production server
uv run uvicorn app.main:app

# Custom host/port
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

# Run tests
uv run pytest

# Run tests with coverage
uv run pytest --cov

# Code linting
uv run flake8 app/

# Code formatting
uv run black app/

# Import sorting
uv run isort app/

# Type checking
uv run mypy app/
```

### Frontend Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Run production build
npm start

# Code linting
npm run lint

# Run tests
npm run test
```

---

## 🔒 CORS Configuration

CORS is configured in `backend/app/main.py` for local development:
```python
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

For production, update this list with your frontend URL.

---

## 🐛 Troubleshooting

### Backend Port Already in Use
```bash
# Use a different port
uv run uvicorn app.main:app --reload --port 8001
```

### Virtual Environment Issues
```bash
# Recreate virtual environment
rm -rf .venv
uv sync
```

### Frontend Can't Connect to Backend
- Verify backend is running: `http://localhost:8000/health`
- Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
- Check CORS origins in `backend/app/main.py`

### Dependencies Need Update
```bash
# Backend
uv sync --refresh

# Frontend
npm install --save-exact
```

---

## 📚 Documentation

- **[Backend Architecture Guide](backend/CLAUDE.md)** - Detailed architecture rules and patterns
- **[Backend README](backend/README.md)** - Backend-specific documentation (when available)
- **[Frontend README](frontend/README.md)** - Frontend-specific documentation (when available)

---

## 🤖 Claude AI Commands

Custom slash commands available in Claude chat (defined in `.claude/commands/`).

| Command | Usage | Description |
|---|---|---|
| `/pre-submit` | `/pre-submit <feature>` | Checks a feature for missing ORM model files and SQLAlchemy view files. Creates any that are missing. |
| `/prd` | `/prd <feature>` | Generates a complete interactive PRD HTML file by reading entities, endpoints, and UI components from the codebase. |
| `/userflow` | `/userflow <feature>` | Generates an interactive user flow HTML file with Mermaid diagrams covering all major user journeys. |

### `/pre-submit <feature>`

Validates that every domain entity in a feature has the correct database artefact:
- **STORED** entities → `infrastructure/models/<entity>_model.py` (or `_header_model.py` / `_line_model.py` for header-line pairs)
- **DERIVED / VIEW** entities (have their own `list_<entity>()` repo method) → `infrastructure/views/<entity>_view.py`
- **DERIVED / INTERNAL** entities (inline helpers with no dedicated repo method) → skipped, nothing created

```
/pre-submit grn
/pre-submit purchase_order
```

Output: a summary table showing each entity, its classification, and the file status (`✅ exists` / `❌ created` / `⏭ skipped`).

---

### `/prd <feature>`

Reads the full feature stack (domain, models, API routes, frontend components) and generates a styled 11-section PRD as a standalone HTML file.

```
/prd grn
/prd purchase_order
```

Output: `docs/prd/<Feature>/<FEATURE>_PRD.html`

---

### `/userflow <feature>`

Reads the feature codebase and generates a sidebar-navigated HTML file with at least 10 Mermaid diagrams (main flow, create, status lifecycle, edit, delete, list, filter, detail view, error handling, architecture).

```
/userflow grn
/userflow purchase_order
```

Output: `docs/flows/<Feature>/<FEATURE>_USER_FLOWS.html`

---

## 🚀 Deployment

### Backend (FastAPI)
```bash
# Production server with gunicorn
uv run gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

### Frontend (Next.js)
```bash
# Build and run
npm run build
npm start
```

---

## 📄 License

This project is part of the AI Template suite.

---

## 🤝 Contributing

Follow the architecture guidelines in [backend/CLAUDE.md](backend/CLAUDE.md) when adding new features.
