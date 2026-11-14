---
description: Start the backend (port 8000) and frontend (port 4000) dev servers and confirm both are up.
argument-hint: "[backend|frontend|both]"
---

Start the dev servers. Target: `$ARGUMENTS` (default: both).

Ports are fixed by the root CLAUDE.md: backend **8000**, frontend **4000**. Never use other ports.

## Steps

1. **Check the ports first.** If a port is already serving, do not start a second copy:
   - Backend: `curl -s http://localhost:8000/health`
   - Frontend: `curl -s -o /dev/null -w "%{http_code}" http://localhost:4000`

   If one answers, report it as "already running" and skip it. If a port is held by something that does not answer correctly, report which process holds it (`netstat -ano | findstr :<port>`) and ask before killing anything.

2. **Start what is not running**, each with the Bash tool and `run_in_background: true`:
   - Backend, from `backend/`: `uv run uvicorn app.main:app --reload --port 8000`
   - Frontend, from `frontend/`: `PORT=4000 npm run dev`

3. **Confirm both are up.** Poll until they answer (max ~30 s for the backend, ~60 s for the frontend's first compile), using the same checks as step 1. The backend must return `{"status": ...}` JSON from `/health`; the frontend must return 200.

4. **Report in a few lines:**
   - Backend: `http://localhost:8000` (docs at `/docs`)
   - Frontend: `http://localhost:4000`
   - For each: started, already running, or failed (with the last lines of its output).

## Rules

- Never edit code to make a server start; report the error instead.
- Do not stop or kill servers unless the user asks.
- To stop them later, use the background task controls, or on request `taskkill` the specific PID found via `netstat`.
