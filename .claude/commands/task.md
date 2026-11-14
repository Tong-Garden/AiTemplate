---
description: Plan and implement a feature-sized request step by step across backend and frontend. Use for build/add/change/fix work that is more than a one-line edit. Skip for questions and trivial edits.
argument-hint: "[small:|medium:|large:] <request>"
---

Request: $ARGUMENTS

Work in this order. Keep every message short; the point is to be predictable, not to narrate.
Root `CLAUDE.md`, `backend/CLAUDE.md` and `frontend/CLAUDE.md` always apply. Feature Parity is non-negotiable.

## 1. Triage (one line, before any work)

Look at the code first (Grep/Glob `backend/app/features/` and `frontend/src/features/` for what the request names), then pick the **highest** tier any signal reaches:

| Signal | Small | Medium | Large |
|---|---|---|---|
| Files touched | 1-2 | 3-10 | more than 10 |
| Sides | one | one, existing endpoints | backend and frontend together |
| Layers | 1 | 2-3 | all of them, plus wiring |
| API | none | existing endpoints | new or changed endpoint |
| Feature | existing | existing | new feature or new entity |
| Data / schema | no | maybe | ORM models, envelope or pagination change |

Always go one tier up for: auth, security, CORS, the response envelope, pagination, shared `core/` or `common/` code.

"Both sides" means a new or changed API contract (new endpoint, changed request/response shape). A bug fix or behaviour change that leaves the contract untouched stays small or medium even when it edits both sides.

Say it in one line, with the reason: "Medium: frontend only, existing endpoints." The user may override with `small:`, `medium:`, `large:` or "just do it"; obey that.

## Model selection

A session cannot switch its own model, so models are chosen by delegating to agents with the `model` parameter:

| Work | Model | How |
|---|---|---|
| Planning (medium and large) | `opus` | `Agent` with `subagent_type: "Plan"`, `model: "opus"` |
| Small implementation | `haiku` | `Agent` with `subagent_type: "general-purpose"`, `model: "haiku"` |
| Medium and large implementation | session model | main session, no delegation |

Haiku rules (small tasks only):
- The prompt is self-contained: exact files, the change wanted, the relevant CLAUDE.md rules, and the check to run (`bash lint.sh` / `uv run pytest`). Haiku starts cold.
- Review its diff (`git diff`) and the check output before reporting; Haiku's result is not evidence on its own.
- Run `git diff --stat` (and `git status --short` for new files) and compare against the files it was told to edit. Anything outside that list is a failure: revert it and redo the task in the main session.
- Never use Haiku for anything the triage bumped up a tier (auth, security, CORS, envelope, pagination, shared `core/` or `common/`). Those stay in the main session.
- If Haiku's check fails twice, take the task over in the main session.

## 2. Questions (only when blocking)

Ask with `AskUserQuestion` only for a decision the user owns that the code and the CLAUDE.md files cannot answer. One call, at most 4 questions, recommended option first.

- Small: never ask; state the assumption in a line and go.
- Medium: assume and list it under "Assumptions" in the plan.
- A prompt too vague to plan ("improve the app"): one open question ("which feature or screen?"), not a menu.

## 3. Plan

- **Small:** no plan. Do it (implementation is delegated to Haiku, see Model selection).
- **Medium:** a short plan in chat, drafted by the `Plan` agent on Opus, then proceed.
- **Large:** write it to `docs/plans/<feature>.md` (kebab-case; a working document, deleted when the work is done), show it, and **stop until the user approves**. Use plan mode when available. Draft it with the `Plan` agent (`Agent` with `subagent_type: "Plan"`, `model: "opus"`); its prompt carries the request, the triage line and pointers to the three CLAUDE.md files. `Plan` is read-only, so questions and writing the file stay with the main session. Check its output against the repo (paths exist, endpoints exist) before showing it.

Plan file format (the `UserPromptSubmit` hook in `.claude/hooks/prompt-context.sh` reads it to remind you of open plans):
- a line `status: draft | approved | in progress | done` near the top; set `approved` when the user approves and `in progress` when work starts;
- every task as a checkbox line `- [ ] ...`, ticked to `- [x]` when done;
- a `## Log` section for drift notes.

If the hook reports an open plan, resume it instead of re-planning.

A plan states:
- the request restated; assumptions;
- affected side(s) and layers;
- the **parity check**: for each endpoint, does the matching frontend UI exist, and vice versa? Whatever is missing becomes a task, so both sides finish together;
- tasks in this order. Each lists its files and how we know it is done.

**Backend:** domain → application → infrastructure (ORM model files, in-memory repo, mappers) → presentation → register router in `app/main.py`.
**Frontend:** DTOs → schemas → repo → mappers → services → state → ui → `app/<feature>/page.tsx` (+ menu item in `Layout.tsx`).
**Docs last:** `/prd` and `/userflow` for the feature.

**Test seed:** if `backend/tests/` does not exist, the first backend task of a large plan creates it: `tests/conftest.py` with a FastAPI `TestClient` fixture and a helper that asserts the response envelope (`status`, `data`, `errors`, `meta`, and error object keys `type`, `title`, `status`, `detail`). `TestClient` needs `httpx`, which is not in `pyproject.toml`; ask the user before adding it (`uv add --dev httpx`). Later tasks reuse these.

## 4. Implement, one task at a time

Before the first edit, take the baseline described in "Scope guard" under Finish.

For each task (small tasks: hand the whole task to the Haiku agent, then verify its diff):
1. Write the code at the matching layer, following the layer rules exactly (envelope, `/v1/` prefix, pagination, Zustand selectors, Syncfusion grid, `AppSnackbar`, docstrings/JSDoc, no TODOs).
2. Tests: add them where a runner exists. Backend: `backend/` pytest for services (business rules, domain exceptions) and API (envelope, status codes, pagination). Frontend has no test runner yet; do not invent one without asking, and say "no frontend tests: no runner" in the report.
3. Run the cheapest check that covers it: `cd backend && uv run pytest` and/or `bash lint.sh` in the side you touched.
4. Tick the task in the plan file (large) and report in one line.

If a check fails, fix it or stop and say why; never move on over a failure. Keep each task a reviewable, commit-sized slice. Do not commit unless the user asks. Dev servers stay on fixed ports 8000 (backend) and 4000 (frontend).

## 5. Re-triage on drift

If a task shows the work is bigger than stated (a missing endpoint, the other side of the stack, a shared-code change), stop, update the plan (add a line to its Log), say what changed, and ask before continuing.

## 6. Finish

1. Parity: every endpoint has a service, store, UI and route; every UI has a working endpoint.
2. `/simplify`: cleans up reuse, simplification and efficiency. It edits code.
3. `/code-review --fix`: finds correctness bugs and applies the fixes. It edits code. Run it after `/simplify` so it reviews the simplified code.
4. `/security-review` when the change touches auth, CORS, input validation, error handling or secrets. Report-only: fix its findings yourself, one at a time, and mention each in the report. Never auto-apply security fixes unreviewed.
5. Lint: `bash lint.sh` in `backend/` and `frontend/` for each side touched. A non-zero exit code means failure; the output shows which check (`❌` lines). ALL checks must pass. Failures in files you did not touch (for example the user's uncommitted work) are reported, not fixed.
6. Tests: run `uv run pytest` in `backend/` if tests exist.
7. Run `/pre-submit <feature>` when a backend entity was added or changed (ORM model / view files).
8. Docs: `/prd <feature>` and `/userflow <feature>` when the feature's behaviour changed.
9. Large task: set the plan status to `done` and tell the user the plan file can be deleted.
10. Report what ran, what failed, and what was skipped, in plain words. Include what `/simplify` and `/code-review --fix` changed (`git diff --stat`) and any finding you chose not to fix.

Lint, tests and `/pre-submit` come after the editing steps (2 and 3) on purpose: `/simplify` and `/code-review --fix` change code, so everything is re-checked on the final result.

### Scope guard for auto-fix steps

`/simplify` and `/code-review` work on the whole diff, which can include the user's unrelated uncommitted work. Protect it:
- **Baseline:** before the first edit of the task, record `git status --short` and, for each file already modified, a hash of its diff (`git diff <file> | md5sum`).
- **Scope:** tell both skills to touch only the files this task changed. Pass those paths as the target where the skill accepts one.
- **Verify:** after steps 2 and 3, compare against the baseline. A file that was already dirty and is not in this task's file list must have the same hash. If anything outside the task changed, stop, say which files, and ask before continuing. Do not revert the user's work yourself.
- If either step breaks lint or tests, fix that regression before moving on; if it cannot be fixed in two attempts, undo only the auto-fix changes to files this task owns and report it.
