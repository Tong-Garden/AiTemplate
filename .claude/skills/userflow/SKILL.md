---
name: userflow
description: Generate visual user-flow HTML documentation (Mermaid diagrams, Claude Design System) for one or more features. Use when asked to create a user flow for X (or X, Y, Z).
---

# /userflow — Generate Visual User Flow Documentation

Generate complete, interactive user flow HTML files for one or **multiple** features using the **Claude Design System** with Mermaid diagrams.

## Trigger Phrases
Use this command when the user says any of:
- "create user flow for X" (single feature)
- "create user flow for X, Y, Z" (multiple features, comma-separated)
- "generate user flow for multiple features"
- "create flow diagrams"
- `/userflow` (triggers feature selection UI)
- `/userflow <feature name>` (single feature, backward compatible)
- `/userflow <feature1>, <feature2>` (multiple features)

---

## Feature Selection (NEW)

### If User Doesn't Specify Features:
1. **Auto-detect available features** from `backend/app/features/`
2. **Display a list** of all available features with checkboxes
3. **Ask user to select one or more** features
4. **Show selection summary** before proceeding

### If User Specifies Features:
- Parse comma-separated feature names: `/userflow user, grn`
- Validate each feature exists
- Proceed directly to generation

---

## What To Do

### Step 0: Get Feature List (NEW)
**Before anything, detect available features:**
```bash
ls -d backend/app/features/*/ | xargs -n1 basename | sort
```
Store this list. If no features specified by user, show selection UI.

---

1. **For Each Selected Feature — Understand it** — Read these paths before drawing any diagrams:
   - `backend/app/features/<feature>/infrastructure/models/` — table schema, fields, status values, FK relationships
   - `backend/app/features/<feature>/domain/` — domain entities, status enumerations, business rules
   - `backend/app/features/<feature>/presentation/api.py` — all API endpoints and HTTP methods
   - `backend/app/features/<feature>/application/` — service logic, validations, use cases
   - `frontend/src/features/<feature>/` — UI components, state, forms, routes

2. **Plan the diagrams** — Identify all distinct user journeys (create, edit, delete, list, filter, error flows, etc.) and map them to individual diagrams.

3. **Create output folders** (for each feature) — Run `mkdir -p docs/flows/<FeatureName>` to create the feature folder inside `docs/flows/` at the project root. Create `docs/flows/` itself if it does not exist yet.

4. **Generate the HTML files** (for each feature) — Write to `docs/flows/<FeatureName>/<FEATURE_NAME>_USER_FLOWS.html` using the exact template below.

5. **Confirm** (after all features done) — For **each feature**, tell the user:
   - File path: `docs/flows/<FeatureName>/<FEATURE_NAME>_USER_FLOWS.html`
   - Number of diagrams generated
   
   Then provide a summary:
   ```
   📊 User Flow Generation Complete!
   
   Generated 3 documents:
   1. ✅ docs/flows/User/USER_USER_FLOWS.html (10 diagrams)
   2. ✅ docs/flows/GRN/GRN_USER_FLOWS.html (12 diagrams)
   3. ✅ docs/flows/PurchaseOrder/PURCHASE_ORDER_USER_FLOWS.html (10 diagrams)
   
   Total: 32 flow diagrams across 3 features
   ```

---

## Output Folder & File Structure

```
docs/
└── flows/
    ├── GRN/
    │   └── GRN_USER_FLOWS.html
    ├── PurchaseOrder/
    │   └── PURCHASE_ORDER_USER_FLOWS.html
    ├── Inventory/
    │   └── INVENTORY_USER_FLOWS.html
    └── Supplier/
        └── SUPPLIER_USER_FLOWS.html
```

### Folder naming rules
- Use **PascalCase** for the folder name: `GRN`, `PurchaseOrder`, `StockTransfer`
- Use **SCREAMING_SNAKE_CASE** for the HTML file: `PURCHASE_ORDER_USER_FLOWS.html`
- Always nest inside `flows/` — never write to the project root

### Shell command to create folder before writing
```bash
mkdir -p docs/flows/<FeatureName>
```

Examples:
- GRN → folder `docs/flows/GRN/`, file `docs/flows/GRN/GRN_USER_FLOWS.html`
- Purchase Order → folder `docs/flows/PurchaseOrder/`, file `docs/flows/PurchaseOrder/PURCHASE_ORDER_USER_FLOWS.html`
- Inventory → folder `docs/flows/Inventory/`, file `docs/flows/Inventory/INVENTORY_USER_FLOWS.html`

---

## STRICT HTML TEMPLATE

Use **exactly** this structure. Do not deviate from the layout, CSS design tokens, or JavaScript pattern.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{FEATURE_NAME}} User Flows</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', sans-serif;
            background: #f0f2f5;
            color: #1a202c;
            min-height: 100vh;
        }
        .header {
            background: linear-gradient(135deg, #1f2937, #374151);
            color: #fff;
            padding: 40px 32px;
            display: flex;
            align-items: center;
            gap: 20px;
        }
        .header-text h1 { font-size: 2em; font-weight: 700; letter-spacing: -0.02em; }
        .header-text p  { margin-top: 6px; opacity: 0.75; font-size: 0.97em; }
        .stats-bar {
            background: #1e3a5f;
            display: flex;
            justify-content: center;
            gap: 0;
        }
        .stat {
            padding: 14px 40px;
            text-align: center;
            border-right: 1px solid rgba(255,255,255,0.1);
        }
        .stat:last-child { border-right: none; }
        .stat-num  { font-size: 1.5em; font-weight: 700; color: #60a5fa; }
        .stat-lbl  { font-size: 0.75em; color: rgba(255,255,255,0.6); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.05em; }
        .layout { display: flex; min-height: calc(100vh - 160px); }
        .sidebar {
            width: 220px;
            flex-shrink: 0;
            background: #fff;
            border-right: 1px solid #e5e7eb;
            padding: 20px 0;
            position: sticky;
            top: 0;
            height: 100vh;
            overflow-y: auto;
        }
        .sidebar-title {
            font-size: 0.7em;
            font-weight: 700;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            padding: 0 16px 12px;
        }
        .tab-btn {
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
            padding: 10px 16px;
            border: none;
            background: transparent;
            cursor: pointer;
            font-family: 'Inter', sans-serif;
            font-size: 0.88em;
            color: #4b5563;
            text-align: left;
            transition: all 0.15s;
            border-left: 3px solid transparent;
        }
        .tab-btn:hover { background: #f9fafb; color: #1a202c; }
        .tab-btn.active {
            background: #eff6ff;
            color: #2563eb;
            font-weight: 600;
            border-left-color: #3b82f6;
        }
        .tab-num {
            width: 22px; height: 22px;
            border-radius: 6px;
            background: #f0f1f3;
            font-size: 0.78em;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: #6b7280;
        }
        .tab-btn.active .tab-num { background: #3b82f6; color: white; }
        .main { flex: 1; padding: 32px; overflow: auto; }
        .panel { display: none; }
        .panel.active { display: block; }
        .panel-header {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            border-radius: 12px 12px 0 0;
            padding: 24px 28px;
            color: white;
        }
        .panel-badge {
            display: inline-block;
            background: rgba(255,255,255,0.18);
            padding: 3px 12px;
            border-radius: 20px;
            font-size: 0.75em;
            font-weight: 600;
            letter-spacing: 0.04em;
            margin-bottom: 10px;
        }
        .panel-title { font-size: 1.7em; font-weight: 700; margin-bottom: 6px; }
        .panel-desc  { opacity: 0.85; font-size: 0.95em; }
        .panel-body {
            background: #fff;
            border: 1px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 12px 12px;
            padding: 28px;
        }
        .info-box {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 14px 18px;
            border-radius: 0 8px 8px 0;
            margin-bottom: 28px;
            font-size: 0.93em;
            color: #1e3a8a;
            line-height: 1.65;
        }
        .mermaid-box {
            background: #fafbfc;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 40px 20px;
            min-height: 320px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow-x: auto;
        }
        .mermaid-box .mermaid { width: 100%; display: flex; justify-content: center; }
        .mermaid-box svg { max-width: 100%; height: auto; min-height: 260px; }
        .nav-arrows {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 20px;
        }
        .arrow-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border: 1px solid #e5e7eb;
            background: #fff;
            border-radius: 8px;
            cursor: pointer;
            font-family: 'Inter', sans-serif;
            font-size: 0.88em;
            font-weight: 500;
            color: #374151;
            transition: all 0.15s;
        }
        .arrow-btn:hover { background: #f9fafb; border-color: #3b82f6; color: #2563eb; }
        .arrow-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .progress-label { font-size: 0.85em; color: #6b7280; }
        @media (max-width: 768px) {
            .layout { flex-direction: column; }
            .sidebar { width: 100%; height: auto; position: static; display: flex; flex-wrap: wrap; padding: 10px; gap: 6px; }
            .tab-btn { width: auto; padding: 7px 12px; border: 1px solid #e5e7eb; border-radius: 6px; border-left: 3px solid transparent; }
            .stats-bar { flex-wrap: wrap; }
            .stat { padding: 10px 20px; }
            .main { padding: 16px; }
        }
    </style>
</head>
<body>

<div class="header">
    <div style="font-size:3em;">{{FEATURE_EMOJI}}</div>
    <div class="header-text">
        <h1>{{FEATURE_NAME}} User Flows</h1>
        <p>Complete visual guide to {{FEATURE_NAME}} system interactions and architecture</p>
    </div>
</div>

<div class="stats-bar">
    <div class="stat"><div class="stat-num">{{DIAGRAM_COUNT}}</div><div class="stat-lbl">Flow Diagrams</div></div>
    <div class="stat"><div class="stat-num">{{STATUS_COUNT}}</div><div class="stat-lbl">Statuses</div></div>
    <div class="stat"><div class="stat-num">{{ROLE_COUNT}}</div><div class="stat-lbl">User Roles</div></div>
    <div class="stat"><div class="stat-num">{{ENDPOINT_COUNT}}</div><div class="stat-lbl">API Endpoints</div></div>
</div>

<div class="layout">
    <nav class="sidebar">
        <div class="sidebar-title">Flow Diagrams</div>
        <!-- ONE tab-btn PER DIAGRAM -->
        <!-- <button class="tab-btn active" onclick="showPanel(1)"><span class="tab-num">1</span> Main Flow</button> -->
        <!-- <button class="tab-btn" onclick="showPanel(2)"><span class="tab-num">2</span> Create</button> -->
    </nav>

    <main class="main">
        <!-- ONE panel PER DIAGRAM, first has class="panel active" -->
        <!-- 
        <div id="panel-1" class="panel active">
            <div class="panel-header">
                <div class="panel-badge">DIAGRAM 1 OF N</div>
                <div class="panel-title">Main Flow Title</div>
                <div class="panel-desc">Short description of this diagram</div>
            </div>
            <div class="panel-body">
                <div class="info-box">Explanation of what this flow shows and key context.</div>
                <div class="mermaid-box">
                    <div class="mermaid" id="m1">
graph TD
    A[Start Node] - -> B[End Node]
                    </div>
                </div>
                <div class="nav-arrows">
                    <button class="arrow-btn" disabled>Previous</button>
                    <span class="progress-label">1 of N</span>
                    <button class="arrow-btn" onclick="showPanel(2)">Next</button>
                </div>
            </div>
        </div>
        -->
    </main>
</div>

<script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        flowchart: { useMaxWidth: true, htmlLabels: false, curve: 'basis' },
        sequence: { useMaxWidth: true }
    });

    const rendered = new Set();

    async function renderPanel(id) {
        if (rendered.has(id)) return;
        const el = document.getElementById('m' + id);
        if (!el) return;
        try {
            await mermaid.run({ nodes: [el] });
            rendered.add(id);
        } catch(e) {
            el.innerHTML = '<div style="color:#dc2626;padding:20px;text-align:center;">Render error: ' + e.message + '</div>';
        }
    }

    window._mermaidRender = renderPanel;
    renderPanel(1);
</script>

<script>
    let currentPanel = 1;

    async function showPanel(n) {
        document.getElementById('panel-' + currentPanel).classList.remove('active');
        document.querySelectorAll('.tab-btn')[currentPanel - 1].classList.remove('active');
        document.getElementById('panel-' + n).classList.add('active');
        document.querySelectorAll('.tab-btn')[n - 1].classList.add('active');
        currentPanel = n;
        if (window._mermaidRender) await window._mermaidRender(n);
        document.querySelector('.main').scrollTo({ top: 0, behavior: 'smooth' });
    }

    window.showPanel = showPanel;
</script>
</body>
</html>
```

---

## Mermaid Diagram Rules — MUST FOLLOW

These rules prevent syntax errors. Violations will cause "Syntax error in text".

### ✅ ALLOWED Syntax

```
graph TD          ← top-down flowchart
graph LR          ← left-right flowchart
sequenceDiagram   ← sequence diagram (use for API call chains)
stateDiagram-v2   ← state machine (use for status lifecycles)
```

### Node Label Rules
```
A[Simple text only]           ← ✅ plain text in brackets
A{Decision text}              ← ✅ diamond for decisions
A[Text with spaces OK]        ← ✅
A[Call GET /v1/items/id]      ← ✅ use plain slash, no special chars
```

### ❌ FORBIDDEN in diagram code
- `&` character → write `and` instead (`page=1 and limit=20`)
- `"quotes"` inside `[]` node labels → use plain text without quotes
- `<br/>` tags inside node labels → use a space or new node
- Emoji inside diagram code → only allowed in HTML outside the mermaid div
- `note right of` in stateDiagram → not supported, remove notes
- Parentheses `()` in node labels → replace with plain words
- Special chars: `|`, `#`, `@`, `{}` inside label text

### Arrow Syntax
```
A --> B              ← ✅ plain arrow
A -->|label| B       ← ✅ labelled arrow
A -- text --> B      ← ✅ text on arrow
```

### sequenceDiagram Rules
```
sequenceDiagram
    actor U as User         ← ✅ actor for humans
    participant FE as Frontend
    participant API as Backend
    U->>FE: Action text
    FE->>API: HTTP Call
    API-->>FE: Response
    FE->>U: Show result
```

### stateDiagram-v2 Rules
```
stateDiagram-v2
    [*] --> STATE1 : Create
    STATE1 --> STATE2 : Transition label
    STATE2 --> [*] : End
```
No `note` blocks — they cause syntax errors.

---

## Required Diagrams Checklist

For any feature, always include AT MINIMUM these flows (adapt names/content):

| # | Diagram Type | What It Shows |
|---|---|---|
| 1 | `graph TD` | Main overview — all entry points and top-level paths |
| 2 | `sequenceDiagram` | Create flow — full API sequence from user action to DB |
| 3 | `stateDiagram-v2` | Status lifecycle — all valid status transitions |
| 4 | `graph TD` | Edit/Update flow — validation loop |
| 5 | `graph TD` | Delete/Cancel flow |
| 6 | `graph TD` | List view with pagination |
| 7 | `graph LR` | Filter / search flow |
| 8 | `graph TD` | Detail view — context-aware action buttons by status |
| 9 | `graph TD` | Error handling — all error types and how they surface |
| 10 | `graph TD` | Data flow architecture — all system layers |

Add more diagrams for: bulk upload, export/report, dashboard KPIs, role permissions, multi-step wizards, etc.

---

## Quality Rules

- ✅ Each panel has a meaningful `info-box` explaining the flow context
- ✅ Panel titles are clear action phrases ("Create GRN Flow", not "Diagram 2")
- ✅ Node labels are short (max 6 words per node)
- ✅ Diagrams have 8-15 nodes — not too simple, not overwhelming
- ✅ Prev/Next arrows show correct panel numbers
- ✅ Stats bar shows accurate counts (count diagrams, statuses, roles, endpoints)
- ✅ First tab has `class="panel active"` and first button has `class="tab-btn active"`
- ✅ Mermaid IDs match: `id="panel-N"` and `id="mN"` for the same N
- ❌ Do NOT use display:none to hide all panels and render on load — use the on-demand renderPanel() pattern
- ❌ Do NOT use `mermaid.contentLoaded()` — it does not exist in v11
- ❌ Do NOT use `startOnLoad: true` — it fails on hidden elements

---

## Example: Minimal 2-Panel Output

```html
<!-- sidebar -->
<button class="tab-btn active" onclick="showPanel(1)"><span class="tab-num">1</span> Main Flow</button>
<button class="tab-btn" onclick="showPanel(2)"><span class="tab-num">2</span> Create</button>

<!-- panel 1 -->
<div id="panel-1" class="panel active">
    <div class="panel-header">
        <div class="panel-badge">DIAGRAM 1 OF 2</div>
        <div class="panel-title">Main Flow</div>
        <div class="panel-desc">Top-level navigation overview</div>
    </div>
    <div class="panel-body">
        <div class="info-box">Overview of all user entry points.</div>
        <div class="mermaid-box">
            <div class="mermaid" id="m1">
graph TD
    A[User Opens Module] --> B{Action?}
    B -->|Create| C[Create Form]
    B -->|View List| D[List Page]
            </div>
        </div>
        <div class="nav-arrows">
            <button class="arrow-btn" disabled>Previous</button>
            <span class="progress-label">1 of 2</span>
            <button class="arrow-btn" onclick="showPanel(2)">Next</button>
        </div>
    </div>
</div>

<!-- panel 2 -->
<div id="panel-2" class="panel">
    <div class="panel-header">
        <div class="panel-badge">DIAGRAM 2 OF 2</div>
        <div class="panel-title">Create Flow</div>
        <div class="panel-desc">Creating a new record</div>
    </div>
    <div class="panel-body">
        <div class="info-box">User fills form and submits to API.</div>
        <div class="mermaid-box">
            <div class="mermaid" id="m2">
graph TD
    A[Open Create Form] --> B[Fill Fields]
    B --> C[POST /v1/items]
    C --> D[Item Created]
            </div>
        </div>
        <div class="nav-arrows">
            <button class="arrow-btn" onclick="showPanel(1)">Previous</button>
            <span class="progress-label">2 of 2</span>
            <button class="arrow-btn" disabled>Next</button>
        </div>
    </div>
</div>
```
