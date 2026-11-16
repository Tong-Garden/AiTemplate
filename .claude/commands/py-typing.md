---
description: Convert legacy typing generics (Dict, List, Optional, Union...) to built-in forms in the backend files a task changed.
argument-hint: "[paths]"
---

Modernise type hints in the backend Python files this task changed. Target: `$ARGUMENTS` (default: every changed `backend/**/*.py` file).

`typing.Dict`, `List`, `Set`, `Tuple`, `Type`, `Optional` and `Union` are deprecated since Python 3.9/3.10. The project requires Python 3.11, so use the built-in forms (rule in `backend/CLAUDE.md`, section TYPING RULES).

## Steps

1. **Find the files.** Without arguments, take the changed backend files:
   `git status --short` plus `git diff --name-only HEAD`, keep `backend/**/*.py`. Only touch those files; never rewrite files the task did not change (the Scope guard in `task.md` applies).

2. **Convert with ruff** (configured in `backend/pyproject.toml`, rules UP006, UP007, UP045):
   ```bash
   cd backend && uv run ruff check <files> --fix
   uv run ruff check <files> --select F401 --fix   # drops typing names left unused
   ```
   What it rewrites:

   | Old | New |
   |---|---|
   | `Dict[K, V]`, `List[T]`, `Set[T]`, `Tuple[...]`, `Type[T]` | `dict[K, V]`, `list[T]`, `set[T]`, `tuple[...]`, `type[T]` |
   | `Optional[X]` | `X \| None` |
   | `Union[A, B]` | `A \| B` |

   Keep `Any`, `Protocol`, `AsyncGenerator`, `Callable`, `TypeVar`, `Generic` and other non-deprecated names imported from `typing`.

3. **Format:** `uv run isort <files> && uv run black <files>`.

4. **Watch for the `list` method trap.** In a class body that defines a method named `list` (services and repositories do), a later `list[...]` annotation resolves to that method and mypy fails. Inside such a class use `builtins.list[...]` (add `import builtins`), or put the annotation before the method. Module-level code and other classes are unaffected.

5. **Check:** run `bash lint.sh` (it also runs ruff, so a missed hint fails lint) and `uv run pytest` in `backend/`. If a conversion breaks mypy and the fix is not obvious, revert that one line to the `typing` form and say so in the report.

6. **Report in one line:** files changed, number of hints converted, anything left on purpose.

## Rules

- Behaviour must not change; this is a type-hint-only edit.
- Do not touch `.venv`, migrations or generated files.
- Files the task did not change are not converted by this skill. `lint.sh` runs ruff over all of `app/` and `tests/`, so a legacy hint in an untouched file shows up as a lint failure: report it, do not fix it unasked.
