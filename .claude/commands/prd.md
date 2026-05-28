# /prd — Generate Product Requirements Document

Generate complete, interactive PRD HTML files for one or **multiple** features. Auto-reads the codebase to extract entities, relationships, API endpoints, and UI components.

## Trigger Phrases
- "create PRD for X" (single feature)
- "create PRD for X, Y, Z" (multiple features, comma-separated)
- "generate PRD for multiple features"
- "write PRD documents"
- `/prd` (triggers feature selection UI)
- `/prd <feature name>` (single feature, backward compatible)
- `/prd <feature1>, <feature2>, <feature3>` (multiple features)

---

## Feature Selection (NEW)

### If User Doesn't Specify Features:
1. **Auto-detect available features** from `backend/app/features/`
2. **Display a list** of all available features with checkboxes
3. **Ask user to select one or more** features
4. **Show selection summary** before proceeding

```
Available features:
☐ user
☐ grn
☐ purchase_order
☐ inventory
☐ supplier

Selected: (waiting for you to choose)
```

### If User Specifies Features:
- Parse comma-separated feature names: `/prd user, grn, inventory`
- Validate each feature exists
- Proceed directly to generation

---

## What To Do — Step by Step

### Step 0: Get Feature List (NEW)
**Before anything, detect available features:**
```bash
ls -d backend/app/features/*/ | xargs -n1 basename | sort
```
Store this list. If no features specified by user, show selection UI.

---

### Step 1: For Each Selected Feature — Explore the codebase
Before writing anything, READ these files to extract real data:

**Backend — extract entities, fields, relationships, endpoints:**
```
backend/app/features/<feature>/infrastructure/models/   ← ORM models, table schema, FK definitions, indexes
backend/app/features/<feature>/domain/                  ← domain entities (dataclasses), status enumerations
backend/app/features/<feature>/presentation/api.py      ← all API endpoints, HTTP methods, route paths
backend/app/features/<feature>/application/             ← business rules, validations, service logic
backend/app/features/<feature>/presentation/schemas.py  ← Pydantic request/response schemas, field constraints
```

**Frontend — extract UI components, forms, validations:**
```
frontend/src/features/<feature>/ui/       ← UI components, forms, views
frontend/src/features/<feature>/repo/     ← API calls, service layer
frontend/src/features/<feature>/state/    ← Zustand state, data structures
frontend/src/app/<feature>/              ← pages and routes
frontend/src/features/<feature>/schemas/ ← Zod schemas, validation rules
```

### Step 2: Build these inventories from your reading

**Entity inventory** (from `infrastructure/models/`):
- Entity name, all fields, types, nullable, defaults
- Status enumerations and their values
- Primary keys, foreign keys, table names

**Relationship inventory** (from `infrastructure/models/` FK definitions):
- Which entity references which (foreign keys)
- Cardinality: one-to-one, one-to-many, many-to-many
- Cascade rules (delete, update)
- Optional vs required

**Endpoint inventory** (from routers):
- Method + path + description
- Auth required (yes/no)
- Request body fields
- Response shape

**UI inventory** (from components):
- List of all screens/pages
- Forms and their fields
- Validation rules per field

### Step 3: Create output folders (for each feature)
```bash
mkdir -p docs/prd/<FeatureName>
```

### Step 4: Write the PRD HTML file (for each feature)
Output to: `docs/prd/<FeatureName>/<FEATURE_NAME>_PRD.html`

### Step 5: Confirm (after all features done)
For **each feature**, tell the user:
- ✅ File path: `docs/prd/<FeatureName>/<FEATURE_NAME>_PRD.html`
- Section count
- Entity count
- Endpoint count

**Then provide a summary:**
```
📊 PRD Generation Complete!

Generated 3 documents:
1. ✅ docs/prd/User/USER_PRD.html (8 entities, 12 endpoints)
2. ✅ docs/prd/GRN/GRN_PRD.html (6 entities, 10 endpoints)
3. ✅ docs/prd/PurchaseOrder/PURCHASE_ORDER_PRD.html (5 entities, 8 endpoints)

Total: 19 entities, 30 endpoints across 3 features
```

---

## Output Folder Structure

```
docs/
├── flows/         ← user flow diagrams (/userflow command)
└── prd/
    ├── GRN/
    │   └── GRN_PRD.html
    ├── PurchaseOrder/
    │   └── PURCHASE_ORDER_PRD.html
    └── Inventory/
        └── INVENTORY_PRD.html
```

### Naming rules
- Folder: PascalCase → `GRN`, `PurchaseOrder`, `StockTransfer`
- File: SCREAMING_SNAKE_CASE → `GRN_PRD.html`

---

## STRICT HTML TEMPLATE

Use **exactly** this structure for the output file.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{FEATURE_NAME}} PRD</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #f0f2f5; color: #1a202c; }

        /* HEADER */
        .header {
            background: linear-gradient(135deg, #1f2937, #374151);
            color: white; padding: 40px 32px;
            display: flex; align-items: center; gap: 20px;
        }
        .header-icon { font-size: 3em; }
        .header h1 { font-size: 2em; font-weight: 700; letter-spacing: -0.02em; }
        .header p  { margin-top: 6px; opacity: 0.75; font-size: 0.95em; }

        /* META BAR */
        .meta-bar {
            background: #1e3a5f;
            display: flex; justify-content: center; flex-wrap: wrap;
        }
        .meta-item {
            padding: 12px 32px;
            border-right: 1px solid rgba(255,255,255,0.1);
            text-align: center;
        }
        .meta-item:last-child { border-right: none; }
        .meta-val { font-size: 1.3em; font-weight: 700; color: #60a5fa; }
        .meta-lbl { font-size: 0.72em; color: rgba(255,255,255,0.55); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.06em; }

        /* LAYOUT */
        .layout { display: flex; min-height: calc(100vh - 150px); }

        /* SIDEBAR */
        .sidebar {
            width: 230px; flex-shrink: 0;
            background: #fff; border-right: 1px solid #e5e7eb;
            padding: 20px 0; position: sticky; top: 0;
            height: 100vh; overflow-y: auto;
        }
        .sidebar-label {
            font-size: 0.68em; font-weight: 700; color: #9ca3af;
            text-transform: uppercase; letter-spacing: 0.08em;
            padding: 0 16px 10px;
        }
        .nav-btn {
            display: flex; align-items: center; gap: 10px;
            width: 100%; padding: 10px 16px;
            border: none; background: transparent; cursor: pointer;
            font-family: 'Inter', sans-serif; font-size: 0.88em;
            color: #4b5563; text-align: left; transition: all 0.15s;
            border-left: 3px solid transparent;
        }
        .nav-btn:hover { background: #f9fafb; color: #1a202c; }
        .nav-btn.active {
            background: #eff6ff; color: #2563eb;
            font-weight: 600; border-left-color: #3b82f6;
        }
        .nav-icon {
            width: 24px; height: 24px; border-radius: 6px;
            background: #f0f1f3; font-size: 0.85em;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
        }
        .nav-btn.active .nav-icon { background: #3b82f6; }

        /* MAIN */
        .main { flex: 1; padding: 32px; overflow: auto; }

        /* SECTION PANEL */
        .panel { display: none; }
        .panel.active { display: block; }

        .panel-header {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            border-radius: 12px 12px 0 0; padding: 24px 28px; color: white;
        }
        .panel-badge {
            display: inline-block; background: rgba(255,255,255,0.18);
            padding: 3px 12px; border-radius: 20px;
            font-size: 0.75em; font-weight: 600; letter-spacing: 0.04em; margin-bottom: 10px;
        }
        .panel-title { font-size: 1.6em; font-weight: 700; margin-bottom: 6px; }
        .panel-desc  { opacity: 0.85; font-size: 0.93em; }

        .panel-body {
            background: #fff; border: 1px solid #e5e7eb;
            border-top: none; border-radius: 0 0 12px 12px; padding: 32px;
        }

        /* CONTENT BLOCKS */
        .info-box {
            background: #eff6ff; border-left: 4px solid #3b82f6;
            padding: 14px 18px; border-radius: 0 8px 8px 0;
            margin-bottom: 28px; font-size: 0.93em;
            color: #1e3a8a; line-height: 1.65;
        }
        .warn-box {
            background: #fffbeb; border-left: 4px solid #f59e0b;
            padding: 14px 18px; border-radius: 0 8px 8px 0;
            margin-bottom: 20px; font-size: 0.92em; color: #78350f;
        }

        h2.section-heading {
            font-size: 1.1em; font-weight: 700; color: #1a202c;
            margin: 28px 0 14px; padding-bottom: 8px;
            border-bottom: 2px solid #f0f2f5;
        }
        h2.section-heading:first-child { margin-top: 0; }

        /* TABLE */
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; font-size: 0.9em; }
        .data-table th {
            background: #f8f9fb; padding: 10px 14px;
            text-align: left; font-weight: 600; color: #374151;
            border: 1px solid #e5e7eb; font-size: 0.85em;
            text-transform: uppercase; letter-spacing: 0.04em;
        }
        .data-table td {
            padding: 10px 14px; border: 1px solid #e5e7eb;
            color: #4b5563; vertical-align: top; line-height: 1.5;
        }
        .data-table tr:nth-child(even) td { background: #fafbfc; }

        /* BADGES */
        .badge {
            display: inline-block; padding: 2px 10px; border-radius: 12px;
            font-size: 0.78em; font-weight: 600;
        }
        .badge-must    { background: #dcfce7; color: #166534; }
        .badge-should  { background: #dbeafe; color: #1e40af; }
        .badge-could   { background: #fef9c3; color: #713f12; }
        .badge-wont    { background: #f3f4f6; color: #6b7280; }
        .badge-get     { background: #dbeafe; color: #1e40af; }
        .badge-post    { background: #dcfce7; color: #166534; }
        .badge-put     { background: #fef9c3; color: #92400e; }
        .badge-delete  { background: #fee2e2; color: #991b1b; }
        .badge-status  { background: #ede9fe; color: #5b21b6; }
        .badge-pk      { background: #fef3c7; color: #92400e; }
        .badge-fk      { background: #e0f2fe; color: #075985; }
        .badge-req     { background: #fee2e2; color: #991b1b; }
        .badge-opt     { background: #f3f4f6; color: #6b7280; }

        /* MERMAID */
        .mermaid-box {
            background: #fafbfc; border: 1px solid #e5e7eb;
            border-radius: 10px; padding: 32px 16px;
            min-height: 280px; overflow-x: auto;
            display: flex; align-items: center; justify-content: center;
            margin-bottom: 24px;
        }
        .mermaid-box .mermaid { width: 100%; display: flex; justify-content: center; }
        .mermaid-box svg { max-width: 100%; height: auto; }

        /* USER STORY CARD */
        .story-card {
            border: 1px solid #e5e7eb; border-radius: 10px;
            padding: 18px 20px; margin-bottom: 16px; background: #fff;
        }
        .story-role { font-size: 0.78em; font-weight: 700; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
        .story-text { font-size: 0.95em; color: #1a202c; margin-bottom: 12px; line-height: 1.6; }
        .story-criteria { margin: 0; padding-left: 18px; }
        .story-criteria li { font-size: 0.88em; color: #4b5563; margin-bottom: 4px; }

        /* RISK CARD */
        .risk-card {
            border-left: 4px solid #f87171; background: #fff;
            border-radius: 0 8px 8px 0; padding: 14px 18px; margin-bottom: 12px;
        }
        .risk-title { font-weight: 600; font-size: 0.95em; margin-bottom: 4px; }
        .risk-mitigation { font-size: 0.88em; color: #6b7280; }

        /* DEFINITION OF DONE */
        .dod-list { list-style: none; padding: 0; }
        .dod-list li {
            display: flex; align-items: flex-start; gap: 10px;
            padding: 8px 0; border-bottom: 1px solid #f0f2f5;
            font-size: 0.93em; color: #374151;
        }
        .dod-list li:last-child { border-bottom: none; }
        .dod-check {
            width: 18px; height: 18px; border: 2px solid #d1d5db;
            border-radius: 4px; flex-shrink: 0; margin-top: 1px;
        }

        /* NAV ARROWS */
        .nav-arrows {
            display: flex; justify-content: space-between;
            align-items: center; margin-top: 32px; padding-top: 20px;
            border-top: 1px solid #f0f2f5;
        }
        .arrow-btn {
            display: flex; align-items: center; gap: 8px;
            padding: 10px 20px; border: 1px solid #e5e7eb;
            background: #fff; border-radius: 8px; cursor: pointer;
            font-family: 'Inter', sans-serif; font-size: 0.88em;
            font-weight: 500; color: #374151; transition: all 0.15s;
        }
        .arrow-btn:hover { background: #f9fafb; border-color: #3b82f6; color: #2563eb; }
        .arrow-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .progress-label { font-size: 0.85em; color: #6b7280; }

        @media (max-width: 768px) {
            .layout { flex-direction: column; }
            .sidebar { width: 100%; height: auto; position: static; flex-direction: row; flex-wrap: wrap; display: flex; padding: 10px; gap: 6px; }
            .nav-btn { width: auto; padding: 7px 12px; border: 1px solid #e5e7eb; border-radius: 6px; border-left: 3px solid transparent; font-size: 0.8em; }
            .main { padding: 16px; }
            .meta-bar { flex-wrap: wrap; }
            .meta-item { padding: 10px 20px; }
        }
    </style>
</head>
<body>

<!-- HEADER -->
<div class="header">
    <div class="header-icon">{{FEATURE_EMOJI}}</div>
    <div>
        <h1>{{FEATURE_NAME}} — Product Requirements Document</h1>
        <p>v1.0 &nbsp;·&nbsp; {{DATE}} &nbsp;·&nbsp; Status: Draft</p>
    </div>
</div>

<!-- META BAR -->
<div class="meta-bar">
    <div class="meta-item"><div class="meta-val">{{ENTITY_COUNT}}</div><div class="meta-lbl">Entities</div></div>
    <div class="meta-item"><div class="meta-val">{{ENDPOINT_COUNT}}</div><div class="meta-lbl">API Endpoints</div></div>
    <div class="meta-item"><div class="meta-val">{{STORY_COUNT}}</div><div class="meta-lbl">User Stories</div></div>
    <div class="meta-item"><div class="meta-val">{{ROLE_COUNT}}</div><div class="meta-lbl">User Roles</div></div>
    <div class="meta-item"><div class="meta-val">{{STATUS_COUNT}}</div><div class="meta-lbl">Statuses</div></div>
</div>

<!-- LAYOUT -->
<div class="layout">

    <!-- SIDEBAR -->
    <nav class="sidebar">
        <div class="sidebar-label">Sections</div>
        <button class="nav-btn active" onclick="showPanel(1)"><span class="nav-icon">📌</span> Overview</button>
        <button class="nav-btn" onclick="showPanel(2)"><span class="nav-icon">🎯</span> Goals</button>
        <button class="nav-btn" onclick="showPanel(3)"><span class="nav-icon">👤</span> User Stories</button>
        <button class="nav-btn" onclick="showPanel(4)"><span class="nav-icon">⚙️</span> Functional Req</button>
        <button class="nav-btn" onclick="showPanel(5)"><span class="nav-icon">🛡️</span> Non-Functional</button>
        <button class="nav-btn" onclick="showPanel(6)"><span class="nav-icon">🗄️</span> Data Model</button>
        <button class="nav-btn" onclick="showPanel(7)"><span class="nav-icon">📡</span> API Contract</button>
        <button class="nav-btn" onclick="showPanel(8)"><span class="nav-icon">🎨</span> UI Spec</button>
        <button class="nav-btn" onclick="showPanel(9)"><span class="nav-icon">🔗</span> Dependencies</button>
        <button class="nav-btn" onclick="showPanel(10)"><span class="nav-icon">⚠️</span> Risks</button>
        <button class="nav-btn" onclick="showPanel(11)"><span class="nav-icon">✅</span> Definition of Done</button>
    </nav>

    <main class="main">

        <!-- ══════════════════════ PANEL 1: OVERVIEW ══════════════════════ -->
        <div id="panel-1" class="panel active">
            <div class="panel-header">
                <div class="panel-badge">SECTION 1 OF 11</div>
                <div class="panel-title">Executive Overview</div>
                <div class="panel-desc">What this feature is, why it exists, and who it serves</div>
            </div>
            <div class="panel-body">
                <div class="info-box">{{OVERVIEW_SUMMARY}}</div>

                <h2 class="section-heading">Problem Statement</h2>
                <p style="color:#4b5563;line-height:1.7;margin-bottom:20px;">{{PROBLEM_STATEMENT}}</p>

                <h2 class="section-heading">Solution</h2>
                <p style="color:#4b5563;line-height:1.7;margin-bottom:20px;">{{SOLUTION_STATEMENT}}</p>

                <h2 class="section-heading">Success Metrics</h2>
                <table class="data-table">
                    <thead><tr><th>Metric</th><th>Target</th><th>How Measured</th></tr></thead>
                    <tbody>
                        <!-- FILL FROM FEATURE CONTEXT -->
                        <!-- <tr><td>GRN creation time</td><td>Under 2 minutes</td><td>User timing tests</td></tr> -->
                    </tbody>
                </table>

                <div class="nav-arrows">
                    <button class="arrow-btn" disabled>← Previous</button>
                    <span class="progress-label">1 of 11</span>
                    <button class="arrow-btn" onclick="showPanel(2)">Next →</button>
                </div>
            </div>
        </div>

        <!-- ══════════════════════ PANEL 2: GOALS ══════════════════════ -->
        <div id="panel-2" class="panel">
            <div class="panel-header">
                <div class="panel-badge">SECTION 2 OF 11</div>
                <div class="panel-title">Goals and Non-Goals</div>
                <div class="panel-desc">Explicit scope boundaries to prevent feature creep</div>
            </div>
            <div class="panel-body">
                <h2 class="section-heading">Goals — In Scope for v1</h2>
                <table class="data-table">
                    <thead><tr><th>#</th><th>Goal</th><th>Priority</th></tr></thead>
                    <tbody>
                        <!-- FILL: one row per goal -->
                        <!-- <tr><td>1</td><td>Allow warehouse staff to create GRNs from supplier invoices</td><td><span class="badge badge-must">Must</span></td></tr> -->
                    </tbody>
                </table>

                <h2 class="section-heading">Non-Goals — Explicitly Out of Scope</h2>
                <table class="data-table">
                    <thead><tr><th>#</th><th>Non-Goal</th><th>Reason</th></tr></thead>
                    <tbody>
                        <!-- FILL: what will NOT be built -->
                    </tbody>
                </table>

                <div class="nav-arrows">
                    <button class="arrow-btn" onclick="showPanel(1)">← Previous</button>
                    <span class="progress-label">2 of 11</span>
                    <button class="arrow-btn" onclick="showPanel(3)">Next →</button>
                </div>
            </div>
        </div>

        <!-- ══════════════════════ PANEL 3: USER STORIES ══════════════════════ -->
        <div id="panel-3" class="panel">
            <div class="panel-header">
                <div class="panel-badge">SECTION 3 OF 11</div>
                <div class="panel-title">User Personas and Stories</div>
                <div class="panel-desc">Who uses this feature and what they need to accomplish</div>
            </div>
            <div class="panel-body">
                <div class="info-box">Each story follows: <strong>As a [role], I want to [action] so that [benefit].</strong> Acceptance criteria define when a story is done.</div>

                <!-- REPEAT this block per user story -->
                <!--
                <div class="story-card">
                    <div class="story-role">Warehouse Staff</div>
                    <div class="story-text">As a warehouse staff member, I want to create a GRN from an invoice number so that I can record received goods quickly without re-entering supplier data.</div>
                    <ul class="story-criteria">
                        <li>Given I enter a valid invoice number, the system auto-fills supplier and line items</li>
                        <li>Given I click Save, a GRN is created with status SAVED</li>
                        <li>Given the invoice is not found, I see a clear error message</li>
                    </ul>
                </div>
                -->

                <div class="nav-arrows">
                    <button class="arrow-btn" onclick="showPanel(2)">← Previous</button>
                    <span class="progress-label">3 of 11</span>
                    <button class="arrow-btn" onclick="showPanel(4)">Next →</button>
                </div>
            </div>
        </div>

        <!-- ══════════════════════ PANEL 4: FUNCTIONAL REQUIREMENTS ══════════════════════ -->
        <div id="panel-4" class="panel">
            <div class="panel-header">
                <div class="panel-badge">SECTION 4 OF 11</div>
                <div class="panel-title">Functional Requirements</div>
                <div class="panel-desc">What the system must do — MoSCoW prioritised</div>
            </div>
            <div class="panel-body">
                <div class="info-box">
                    <strong>MoSCoW:</strong>
                    <span class="badge badge-must">Must</span> — required for launch &nbsp;
                    <span class="badge badge-should">Should</span> — important but not blocking &nbsp;
                    <span class="badge badge-could">Could</span> — nice to have &nbsp;
                    <span class="badge badge-wont">Won't</span> — out of scope
                </div>
                <table class="data-table">
                    <thead><tr><th>#</th><th>Requirement</th><th>Priority</th><th>Notes</th></tr></thead>
                    <tbody>
                        <!-- FILL: one row per requirement extracted from codebase -->
                    </tbody>
                </table>

                <div class="nav-arrows">
                    <button class="arrow-btn" onclick="showPanel(3)">← Previous</button>
                    <span class="progress-label">4 of 11</span>
                    <button class="arrow-btn" onclick="showPanel(5)">Next →</button>
                </div>
            </div>
        </div>

        <!-- ══════════════════════ PANEL 5: NON-FUNCTIONAL ══════════════════════ -->
        <div id="panel-5" class="panel">
            <div class="panel-header">
                <div class="panel-badge">SECTION 5 OF 11</div>
                <div class="panel-title">Non-Functional Requirements</div>
                <div class="panel-desc">Performance, security, scalability, and reliability standards</div>
            </div>
            <div class="panel-body">
                <table class="data-table">
                    <thead><tr><th>Category</th><th>Requirement</th><th>Target</th></tr></thead>
                    <tbody>
                        <!-- FILL from codebase context -->
                        <!-- <tr><td>Performance</td><td>API response time</td><td>Under 300ms for list, under 100ms for detail</td></tr> -->
                        <!-- <tr><td>Security</td><td>Authentication</td><td>All endpoints require valid JWT token</td></tr> -->
                        <!-- <tr><td>Pagination</td><td>List endpoints</td><td>Max 100 items per page, default 20</td></tr> -->
                    </tbody>
                </table>

                <div class="nav-arrows">
                    <button class="arrow-btn" onclick="showPanel(4)">← Previous</button>
                    <span class="progress-label">5 of 11</span>
                    <button class="arrow-btn" onclick="showPanel(6)">Next →</button>
                </div>
            </div>
        </div>

        <!-- ══════════════════════ PANEL 6: DATA MODEL ══════════════════════ -->
        <div id="panel-6" class="panel">
            <div class="panel-header">
                <div class="panel-badge">SECTION 6 OF 11</div>
                <div class="panel-title">Data Model</div>
                <div class="panel-desc">Entities, fields, relationships, constraints, and ERD</div>
            </div>
            <div class="panel-body">

                <!-- ERD DIAGRAM -->
                <h2 class="section-heading">Entity Relationship Diagram</h2>
                <div class="info-box">Auto-generated from domain models. Shows all entities, their key fields, and relationships with cardinality.</div>
                <div class="mermaid-box">
                    <div class="mermaid" id="m-erd">
erDiagram
    %% FILL THIS FROM READING infrastructure/models/ — one entity block per table
    %% ENTITY_NAME {
    %%     type   field_name   PK/FK "description"
    %% }
    %% ENTITY_A ||--o{ ENTITY_B : "relationship label"

    %% CARDINALITY REFERENCE:
    %% ||--||   exactly one to exactly one
    %% ||--o{   exactly one to zero or many
    %% }o--||   zero or many to exactly one
    %% }o--o{   zero or many to zero or many

    %% EXAMPLE (replace with real entities):
    GRN {
        int        id          PK "Primary key"
        string     grn_number  "Auto-generated"
        string     status      "SAVED, POSTED, CANCELLED"
        int        supplier_id FK "References Supplier"
        date       grn_date    "Receipt date"
        datetime   created_at  "Timestamp"
    }
    GRN_LINE_ITEM {
        int        id          PK "Primary key"
        int        grn_id      FK "References GRN"
        int        product_id  FK "References Product"
        float      quantity    "Received quantity"
        float      unit_price  "Price at receipt"
    }
    SUPPLIER {
        int        id          PK "Primary key"
        string     name        "Supplier name"
        string     code        "Supplier code"
    }
    PRODUCT {
        int        id          PK "Primary key"
        string     name        "Product name"
        string     sku         "Stock keeping unit"
    }
    SUPPLIER ||--o{ GRN : "supplies"
    GRN ||--o{ GRN_LINE_ITEM : "contains"
    PRODUCT ||--o{ GRN_LINE_ITEM : "referenced in"
                    </div>
                </div>

                <!-- ENTITY TABLES — one per entity -->
                <h2 class="section-heading">Entity Definitions</h2>

                <!-- REPEAT this block for each entity found in codebase -->
                <!--
                <h3 style="font-size:1em;font-weight:600;color:#374151;margin:20px 0 10px;">GRN</h3>
                <table class="data-table">
                    <thead><tr><th>Field</th><th>Type</th><th>Key</th><th>Nullable</th><th>Default</th><th>Description</th></tr></thead>
                    <tbody>
                        <tr><td>id</td><td>INTEGER</td><td><span class="badge badge-pk">PK</span></td><td>No</td><td>autoincrement</td><td>Primary key</td></tr>
                        <tr><td>grn_number</td><td>VARCHAR(50)</td><td>UNIQUE</td><td>No</td><td>—</td><td>Auto-generated GRN number</td></tr>
                        <tr><td>supplier_id</td><td>INTEGER</td><td><span class="badge badge-fk">FK</span></td><td>No</td><td>—</td><td>References supplier.id</td></tr>
                        <tr><td>status</td><td>ENUM</td><td>—</td><td>No</td><td>SAVED</td><td>SAVED / POSTED / CANCELLED</td></tr>
                    </tbody>
                </table>
                -->

                <!-- RELATIONSHIPS TABLE -->
                <h2 class="section-heading">Relationships</h2>
                <table class="data-table">
                    <thead><tr><th>From Entity</th><th>Cardinality</th><th>To Entity</th><th>Foreign Key</th><th>On Delete</th><th>Description</th></tr></thead>
                    <tbody>
                        <!-- FILL from infrastructure layer — foreign key definitions -->
                        <!-- <tr><td>GRN</td><td>Many-to-One</td><td>Supplier</td><td>grn.supplier_id</td><td>RESTRICT</td><td>Each GRN belongs to one supplier</td></tr> -->
                        <!-- <tr><td>GRN_LINE_ITEM</td><td>Many-to-One</td><td>GRN</td><td>grn_line_item.grn_id</td><td>CASCADE</td><td>Line items deleted with parent GRN</td></tr> -->
                    </tbody>
                </table>

                <!-- STATUS ENUMERATIONS -->
                <h2 class="section-heading">Status Enumerations</h2>
                <table class="data-table">
                    <thead><tr><th>Entity</th><th>Field</th><th>Values</th><th>Transitions Allowed</th></tr></thead>
                    <tbody>
                        <!-- FILL from domain models -->
                        <!-- <tr><td>GRN</td><td>status</td><td>SAVED, POSTED, CANCELLED</td><td>SAVED→POSTED, SAVED→CANCELLED</td></tr> -->
                    </tbody>
                </table>

                <div class="nav-arrows">
                    <button class="arrow-btn" onclick="showPanel(5)">← Previous</button>
                    <span class="progress-label">6 of 11</span>
                    <button class="arrow-btn" onclick="showPanel(7)">Next →</button>
                </div>
            </div>
        </div>

        <!-- ══════════════════════ PANEL 7: API CONTRACT ══════════════════════ -->
        <div id="panel-7" class="panel">
            <div class="panel-header">
                <div class="panel-badge">SECTION 7 OF 11</div>
                <div class="panel-title">API Contract</div>
                <div class="panel-desc">All endpoints, methods, auth, request and response shapes</div>
            </div>
            <div class="panel-body">
                <div class="info-box">All endpoints use the <strong>/v1/</strong> prefix and return the standard response envelope: <code>status</code>, <code>data</code>, <code>errors</code>, <code>meta</code>.</div>
                <table class="data-table">
                    <thead><tr><th>Method</th><th>Endpoint</th><th>Auth</th><th>Description</th><th>Request Body</th><th>Response</th></tr></thead>
                    <tbody>
                        <!-- FILL from routers — one row per endpoint -->
                        <!-- <tr>
                            <td><span class="badge badge-get">GET</span></td>
                            <td>/v1/grns</td>
                            <td>Yes</td>
                            <td>List GRNs with pagination</td>
                            <td>Query: page, limit, status</td>
                            <td>Paginated GRN list</td>
                        </tr> -->
                    </tbody>
                </table>

                <div class="nav-arrows">
                    <button class="arrow-btn" onclick="showPanel(6)">← Previous</button>
                    <span class="progress-label">7 of 11</span>
                    <button class="arrow-btn" onclick="showPanel(8)">Next →</button>
                </div>
            </div>
        </div>

        <!-- ══════════════════════ PANEL 8: UI SPEC ══════════════════════ -->
        <div id="panel-8" class="panel">
            <div class="panel-header">
                <div class="panel-badge">SECTION 8 OF 11</div>
                <div class="panel-title">UI Specification</div>
                <div class="panel-desc">Pages, components, forms, validation rules, and states</div>
            </div>
            <div class="panel-body">

                <h2 class="section-heading">Pages and Routes</h2>
                <table class="data-table">
                    <thead><tr><th>Route</th><th>Page Name</th><th>Components Used</th><th>Auth Required</th></tr></thead>
                    <tbody>
                        <!-- FILL from frontend/src/app -->
                    </tbody>
                </table>

                <h2 class="section-heading">Form Fields and Validation</h2>
                <table class="data-table">
                    <thead><tr><th>Form</th><th>Field</th><th>Type</th><th>Required</th><th>Validation Rules</th></tr></thead>
                    <tbody>
                        <!-- FILL from Zod schemas / React Hook Form -->
                    </tbody>
                </table>

                <h2 class="section-heading">UI States Required</h2>
                <table class="data-table">
                    <thead><tr><th>Component</th><th>Loading State</th><th>Empty State</th><th>Error State</th></tr></thead>
                    <tbody>
                        <!-- FILL from component analysis -->
                    </tbody>
                </table>

                <div class="nav-arrows">
                    <button class="arrow-btn" onclick="showPanel(7)">← Previous</button>
                    <span class="progress-label">8 of 11</span>
                    <button class="arrow-btn" onclick="showPanel(9)">Next →</button>
                </div>
            </div>
        </div>

        <!-- ══════════════════════ PANEL 9: DEPENDENCIES ══════════════════════ -->
        <div id="panel-9" class="panel">
            <div class="panel-header">
                <div class="panel-badge">SECTION 9 OF 11</div>
                <div class="panel-title">Dependencies and Integrations</div>
                <div class="panel-desc">External systems, internal services, and third-party dependencies</div>
            </div>
            <div class="panel-body">
                <table class="data-table">
                    <thead><tr><th>Dependency</th><th>Type</th><th>Required For</th><th>Status</th></tr></thead>
                    <tbody>
                        <!-- FILL based on codebase imports and external calls -->
                    </tbody>
                </table>

                <div class="nav-arrows">
                    <button class="arrow-btn" onclick="showPanel(8)">← Previous</button>
                    <span class="progress-label">9 of 11</span>
                    <button class="arrow-btn" onclick="showPanel(10)">Next →</button>
                </div>
            </div>
        </div>

        <!-- ══════════════════════ PANEL 10: RISKS ══════════════════════ -->
        <div id="panel-10" class="panel">
            <div class="panel-header">
                <div class="panel-badge">SECTION 10 OF 11</div>
                <div class="panel-title">Risks and Assumptions</div>
                <div class="panel-desc">Known risks, open questions, and assumptions being made</div>
            </div>
            <div class="panel-body">

                <h2 class="section-heading">Technical Risks</h2>
                <!-- REPEAT per risk -->
                <!--
                <div class="risk-card">
                    <div class="risk-title">Invoice lookup latency from ERP</div>
                    <div class="risk-mitigation">Mitigation: Cache invoice data for 5 minutes. Add timeout of 3s with user-friendly error.</div>
                </div>
                -->

                <h2 class="section-heading">Assumptions</h2>
                <table class="data-table">
                    <thead><tr><th>#</th><th>Assumption</th><th>If Wrong, Impact</th></tr></thead>
                    <tbody>
                        <!-- FILL based on feature context -->
                    </tbody>
                </table>

                <h2 class="section-heading">Open Questions</h2>
                <table class="data-table">
                    <thead><tr><th>#</th><th>Question</th><th>Owner</th><th>Due</th></tr></thead>
                    <tbody>
                        <!-- FILL with unresolved design decisions -->
                    </tbody>
                </table>

                <div class="nav-arrows">
                    <button class="arrow-btn" onclick="showPanel(9)">← Previous</button>
                    <span class="progress-label">10 of 11</span>
                    <button class="arrow-btn" onclick="showPanel(11)">Next →</button>
                </div>
            </div>
        </div>

        <!-- ══════════════════════ PANEL 11: DEFINITION OF DONE ══════════════════════ -->
        <div id="panel-11" class="panel">
            <div class="panel-header">
                <div class="panel-badge">SECTION 11 OF 11</div>
                <div class="panel-title">Definition of Done</div>
                <div class="panel-desc">Checklist — every item must be complete before the feature ships</div>
            </div>
            <div class="panel-body">
                <div class="info-box">The feature is considered complete only when ALL items below are checked off.</div>

                <h2 class="section-heading">Backend</h2>
                <ul class="dod-list">
                    <li><span class="dod-check"></span>All API endpoints implemented and returning standard response envelope</li>
                    <li><span class="dod-check"></span>Pydantic input/output schemas defined for all endpoints</li>
                    <li><span class="dod-check"></span>Business rules validated in service layer</li>
                    <li><span class="dod-check"></span>All list endpoints paginated (page + limit)</li>
                    <li><span class="dod-check"></span>Proper HTTP status codes returned for all error cases</li>
                    <li><span class="dod-check"></span>No stack traces exposed in error responses</li>
                </ul>

                <h2 class="section-heading">Frontend</h2>
                <ul class="dod-list">
                    <li><span class="dod-check"></span>All API endpoints have a corresponding UI page or component</li>
                    <li><span class="dod-check"></span>Zod validation schemas match backend Pydantic schemas</li>
                    <li><span class="dod-check"></span>Zustand store manages all feature state with pagination</li>
                    <li><span class="dod-check"></span>Loading, empty, and error states implemented on all components</li>
                    <li><span class="dod-check"></span>Validation errors mapped to form fields</li>
                    <li><span class="dod-check"></span>Toast notifications for success and error actions</li>
                </ul>

                <h2 class="section-heading">Documentation</h2>
                <ul class="dod-list">
                    <li><span class="dod-check"></span>PRD document complete (this file)</li>
                    <li><span class="dod-check"></span>User flow diagrams generated (<code>/userflow</code>)</li>
                    <li><span class="dod-check"></span>All functions and classes have docstrings</li>
                </ul>

                <div class="nav-arrows">
                    <button class="arrow-btn" onclick="showPanel(10)">← Previous</button>
                    <span class="progress-label">11 of 11</span>
                    <button class="arrow-btn" disabled>Next →</button>
                </div>
            </div>
        </div>

    </main>
</div>

<script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });

    const rendered = new Set();
    async function renderMermaid(id) {
        if (rendered.has(id)) return;
        const el = document.getElementById(id);
        if (!el) return;
        try { await mermaid.run({ nodes: [el] }); rendered.add(id); }
        catch(e) { el.innerHTML = '<div style="color:#dc2626;padding:16px">ERD render error: ' + e.message + '</div>'; }
    }
    window._mermaidRender = renderMermaid;
    // Panel 6 contains the ERD — render when panel-6 opens
    // Render on load only if panel-6 is active (it won't be by default)
</script>

<script>
    let currentPanel = 1;

    async function showPanel(n) {
        document.getElementById('panel-' + currentPanel).classList.remove('active');
        document.querySelectorAll('.nav-btn')[currentPanel - 1].classList.remove('active');
        document.getElementById('panel-' + n).classList.add('active');
        document.querySelectorAll('.nav-btn')[n - 1].classList.add('active');
        currentPanel = n;
        // Render ERD when data model panel opens
        if (n === 6 && window._mermaidRender) await window._mermaidRender('m-erd');
        document.querySelector('.main').scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.showPanel = showPanel;
</script>
</body>
</html>
```

---

## ERD Mermaid Rules

Use `erDiagram` syntax — no flowchart syntax inside ERD blocks.

```
erDiagram
    ENTITY_NAME {
        type   field_name   PK "description"
        type   field_name   FK "references other"
        type   field_name      "regular field"
    }

    ENTITY_A ||--o{ ENTITY_B : "label"
```

### Cardinality symbols
| Symbol | Meaning |
|---|---|
| `\|\|--\|\|` | exactly one to exactly one |
| `\|\|--o{` | one to zero-or-many |
| `}o--\|\|` | zero-or-many to one |
| `}o--o{` | zero-or-many to zero-or-many |

### ERD Rules
- ✅ Use entity names in UPPERCASE
- ✅ Keep field descriptions short (quoted string)
- ✅ Mark PK and FK explicitly
- ❌ No special chars in field names (no hyphens, spaces)
- ❌ No emoji inside erDiagram block
- ❌ No `&` character anywhere in diagram

---

## Quality Checklist

- ✅ ERD reflects ACTUAL entities read from `backend/app/features/<feature>/infrastructure/models/`
- ✅ Relationships table matches FK definitions read from `infrastructure/models/` (ForeignKey columns, ondelete rules)
- ✅ API Contract table built from ACTUAL routers, not guessed
- ✅ Form validation rules extracted from Zod schemas in frontend
- ✅ All placeholder comments replaced with real data
- ✅ Meta bar counts are accurate
- ✅ `docs/prd/<FeatureName>/` folder created before writing file
