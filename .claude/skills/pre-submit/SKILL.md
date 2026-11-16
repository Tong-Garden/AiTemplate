---
name: pre-submit
description: Check backend features for missing ORM model files and SQLAlchemy view files, and create any that are missing. Use before finishing a feature, or when asked to validate or pre-submit one or more features.
argument-hint: "[feature1, feature2, ...]"
---

Validate the database artefacts of backend features. Target: `$ARGUMENTS`.

Rules come from `backend/CLAUDE.md` (section ORM Models). Models are **schema reference only**, never wired to the app, and the app keeps using the InMemory repository.

## 1. Pick features
- Arguments given: split on commas, trim, match against folders in `backend/app/features/`. Unknown name: report it and continue with the rest.
- No arguments: list the folders in `backend/app/features/` and ask which to check (multi-select, plus "all").

## 2. Classify every entity (per feature)
Read `domain/entities.py` and `application/interface/<feature>_repository_interface.py`. For each entity:

| Class | Test | Required file |
|---|---|---|
| STORED | Persisted aggregate | `infrastructure/models/<entity>_model.py` |
| STORED header + lines | Document with child rows | `<entity>_header_model.py` + `<entity>_line_model.py` |
| DERIVED / VIEW | Read-only projection with its own `list_<entity>()` repo method | `infrastructure/views/<entity>_view.py` |
| DERIVED / INTERNAL | Inline helper, no dedicated repo method | none, skip |

## 3. Check and create
For each required file that is missing, create it. Never overwrite or edit an existing file.

Model files (copy the style of `backend/app/features/company/infrastructure/models/company_model.py`):
- `from app.core.base import Base`; SQLAlchemy 2.x `Mapped[]` / `mapped_column()`; never a local Base
- Module docstring: `Schema reference only — NOT wired up. App uses InMemoryRepository.`
- One column per entity field, `id` as `String(36)` primary key
- `created_at` / `updated_at` audit timestamps
- Index FK columns and frequently filtered columns; mirror uniqueness rules from the service
- Header/lines: FK `<entity>_header_id` with `ondelete="CASCADE"`, `lines` <-> `header` relationships with `cascade="all, delete-orphan"`

View files: a read-only SQLAlchemy mapping or `Table` of the projection, same Base and docstring rules, no business logic.

Also make sure `infrastructure/models/__init__.py` (and `views/__init__.py`) exist with a one-line docstring. Do not import models from domain, application or presentation.

## 4. Verify
Run `cd backend && python -c "import app.features.<feature>.infrastructure.models.<module>"` for each created file to confirm it imports.

## 5. Report
One block per feature, then a total:

```
Pre-Submit Validation Complete

<Feature> (N entities)
   ✅ exists   <entity> -> infrastructure/models/<entity>_model.py
   ❌ created  <entity> -> infrastructure/views/<entity>_view.py
   ⏭ skipped  <entity> (internal)
```

State plainly anything that failed to import or that you could not classify.
