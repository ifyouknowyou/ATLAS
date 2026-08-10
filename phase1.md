# ATLAS — PHASE 1/7

## Foundation, Architecture & Advanced 3D Intelligence Workspace

You are a senior staff-level full-stack architect, product designer, security engineer, and 3D web engineer.

Build **ATLAS**, a production-grade, web-based AI Intelligence & Investigation Platform.

ATLAS is designed for **lawful, authorized investigations, security research, threat intelligence, corporate intelligence, and research workflows**.

This is **PHASE 1 OF 7**. Do not attempt to implement the entire platform in this phase.

---

# 1. FIRST: INSPECT THE REPOSITORY

Before writing code:

1. Inspect the entire repository.
2. Identify the existing framework, package manager, database, API architecture, frontend architecture, authentication system, testing framework, and build system.
3. Determine whether the repository is empty or already contains an application.
4. Reuse good existing infrastructure instead of unnecessarily replacing it.
5. Do not blindly overwrite existing files.
6. Create a short architecture assessment at:

`docs/PHASE_1_ARCHITECTURE.md`

Document:

* Current architecture
* Existing technologies
* Existing problems
* Proposed ATLAS architecture
* Directory structure
* Data flow
* Authentication strategy
* Authorization strategy
* AI integration boundary
* 3D rendering architecture
* Realtime architecture
* Testing strategy
* Security model
* Phase 1 scope
* Future Phase 2–7 boundaries

---

# 2. CREATE THE 7-PHASE ROADMAP

Create:

`docs/ATLAS_7_PHASES.md`

Define these seven phases:

### Phase 1 — Foundation

Architecture, design system, authentication foundation, workspace shell, database foundation, security baseline, 3D environment.

### Phase 2 — Investigation & Entity Intelligence

Cases, investigations, entities, relationships, evidence, notes, entity profiles and investigation workflows.

### Phase 3 — Graph & Geospatial Intelligence

Interactive relationship graphs, timelines, maps, 3D globe, geographic layers and advanced visualization.

### Phase 4 — AI Intelligence Engine

AI research assistant, contextual retrieval, knowledge graph reasoning, investigation summaries and AI-assisted workflows.

### Phase 5 — Evidence, Reports & Collaboration

Evidence management, report builder, document generation, collaboration, activity streams and real-time workspace synchronization.

### Phase 6 — Advanced Intelligence & Automation

Investigation automation, intelligence pipelines, correlation engines, alerting, advanced analytics and workflow automation.

### Phase 7 — Production Hardening

Security hardening, performance optimization, observability, testing, accessibility, deployment, disaster recovery and final production audit.

Only implement **Phase 1 now**.

---

# 3. CORE PRODUCT VISION

ATLAS should eventually become:

```text
                    ATLAS
          Intelligence Platform

 ┌────────────────────────────────────────────┐
 │ Investigation │ Intelligence │ Analytics │
 ├────────────────────────────────────────────┤
 │                                            │
 │              3D INTELLIGENCE               │
 │                  SPACE                     │
 │                                            │
 │        Entities ── Relationships           │
 │            │          │                    │
 │            └──── Graph ──── Timeline       │
 │                                            │
 ├────────────────────────────────────────────┤
 │ Evidence │ Cases │ AI │ Reports │ Activity │
 └────────────────────────────────────────────┘
```

The application must feel like a serious intelligence command center, not a generic SaaS dashboard.

Avoid generic AI-generated dashboard aesthetics.

---

# 4. TECHNOLOGY REQUIREMENTS

Use the repository's existing stack when practical.

If choosing the stack from scratch, prefer:

Frontend:

* Next.js
* React
* TypeScript
* Tailwind CSS
* modern component architecture
* Framer Motion/Motion where appropriate
* Three.js
* React Three Fiber
* Drei
* Zustand or equivalent lightweight state management
* TanStack Query where server-state management is needed

Backend:

* NestJS or equivalent strongly typed API architecture
* PostgreSQL
* Prisma
* WebSocket/realtime layer

Infrastructure:

* Docker
* environment-based configuration
* structured logging
* automated tests

Do not introduce unnecessary dependencies.

---

# 5. DESIGN LANGUAGE

Create a distinctive **Intelligence Operations / Digital Observatory** visual identity.

Do NOT use:

* generic admin dashboard layouts
* excessive cards
* default Bootstrap styling
* generic Inter/Roboto typography
* purple-gradient SaaS aesthetics
* huge empty desktop margins
* repetitive rounded rectangles everywhere

Use:

* deep atmospheric background
* layered surfaces
* subtle grid/topographic patterns
* technical typography hierarchy
* restrained accent colors
* thin borders
* glass/metallic surfaces where appropriate
* data visualization styling
* subtle glow
* depth
* spatial navigation
* cinematic transitions

The interface should resemble a futuristic intelligence operations environment while remaining professional and usable.

---

# 6. ADVANCED 3D FOUNDATION

Create the initial 3D intelligence environment.

Use:

* Three.js
* React Three Fiber
* Drei

The 3D engine must be isolated so it does NOT unnecessarily inflate every application route.

Create a reusable architecture similar to:

```text
src/
  features/
    globe/
      components/
      shaders/
      hooks/
      systems/
      types/
```

Build the foundation for:

### 3D Globe

Include:

* realistic spherical geometry
* atmospheric layer
* subtle grid
* longitude/latitude visualization
* animated particles
* orbital markers
* geographic node placeholders
* connection arcs
* camera controls
* smooth zoom
* smooth rotation
* hover interaction
* click interaction
* selectable nodes

Do not load huge geographic datasets yet.

Use optimized placeholder/sample data.

---

# 7. 3D PERFORMANCE REQUIREMENTS

The 3D system must be production-conscious.

Implement:

* lazy loading
* dynamic imports where appropriate
* render throttling where appropriate
* efficient geometries
* instancing where useful
* limited particle counts
* disposal of Three.js resources
* responsive rendering
* graceful fallback when WebGL is unavailable

The normal application must remain fast even when the 3D scene is not visible.

---

# 8. APPLICATION SHELL

Create the main ATLAS shell.

Required navigation:

```text
ATLAS

Overview
Investigations
Entities
Graph
Map
Timeline
Evidence
Reports
AI Assistant

──────────────

Workspace
Activity
Notifications

──────────────

Settings
```

Do not fully implement every module yet.

For Phase 1:

* navigation exists
* routes exist
* placeholder states are professional
* active navigation works
* permissions are considered
* future modules have clear boundaries

---

# 9. HOME / OVERVIEW PAGE

Create a high-quality ATLAS landing/overview experience.

It should include:

### Hero intelligence visualization

Large 3D globe/graph environment.

### Intelligence metrics

Examples:

```text
ACTIVE CASES
ENTITIES
RELATIONSHIPS
EVIDENCE
ACTIVE INVESTIGATIONS
```

Use realistic demo data only.

Clearly separate demo data from real data.

### Activity stream

Example categories:

* Investigation updated
* Entity discovered
* Evidence added
* Relationship created
* Report generated
* AI analysis completed

### Investigation overview

Show:

* active investigations
* recent investigations
* investigation status
* priority
* last activity

---

# 10. INVESTIGATION WORKSPACE FOUNDATION

Create the first version of an investigation workspace.

Example:

```text
Investigation
│
├── Overview
├── Entities
├── Relationships
├── Evidence
├── Timeline
├── Map
├── Notes
├── Reports
└── Activity
```

In Phase 1, implement only the workspace shell and navigation.

Do NOT build the complete investigation engine yet.

---

# 11. ENTITY MODEL FOUNDATION

Design the initial data model for:

```text
User
Organization
Workspace
Investigation
Entity
Relationship
Evidence
TimelineEvent
Note
Report
ActivityEvent
```

Use proper relationships and IDs.

Entity types should support future extensibility:

```text
PERSON
ORGANIZATION
DOMAIN
IP_ADDRESS
LOCATION
DEVICE
ACCOUNT
DOCUMENT
EVENT
OTHER
```

Do not build invasive collection functionality.

ATLAS should operate on data that the user is authorized to access or has lawfully collected.

---

# 12. MULTI-TENANT FOUNDATION

Design ATLAS so organizations/workspaces are isolated.

Every organization-owned resource must have a clear ownership boundary.

Implement:

* organization
* workspace
* user membership
* roles
* permissions
* ownership checks

Prepare the architecture for database-level tenant isolation where appropriate.

Do not rely exclusively on frontend role checks.

---

# 13. RBAC FOUNDATION

Create data-driven roles.

At minimum:

```text
OWNER
ADMIN
ANALYST
INVESTIGATOR
VIEWER
```

Create permission concepts such as:

```text
investigation.read
investigation.create
investigation.update
investigation.delete

entity.read
entity.create
entity.update
entity.delete

evidence.read
evidence.create
evidence.update
evidence.delete

report.read
report.create
report.publish

workspace.manage
members.manage
settings.manage
```

Do not hardcode authorization throughout UI components.

Centralize permission evaluation.

---

# 14. AUTHENTICATION FOUNDATION

Implement or prepare:

* login
* logout
* session handling
* protected routes
* user identity
* organization membership
* role resolution

Never place sensitive secrets in frontend code.

Never expose server credentials to the browser.

Do not implement password recovery or external OAuth unless the repository already supports it or it is necessary for the current architecture.

---

# 15. DATABASE FOUNDATION

Create the initial schema/migrations for the Phase 1 models.

Use:

* UUID/strong IDs
* timestamps
* createdBy/updatedBy where appropriate
* soft deletion only where justified
* indexes on common query paths
* unique constraints
* foreign keys

Do not create a huge speculative schema for all seven phases.

Only create the foundation required now.

---

# 16. API FOUNDATION

Create clean API boundaries for:

```text
/auth
/users
/organizations
/workspaces
/investigations
/entities
/health
```

Only implement the endpoints needed by Phase 1.

Every protected endpoint must enforce authorization server-side.

Return consistent error structures.

Do not leak internal stack traces or sensitive implementation details.

---

# 17. REALTIME FOUNDATION

Prepare the architecture for:

* activity events
* collaboration
* investigation updates
* notifications
* live graph updates

Do not implement the complete collaboration engine yet.

Create a clean event abstraction that future phases can extend.

---

# 18. SECURITY BASELINE

Implement baseline security:

* strict input validation
* authorization on protected resources
* secure session handling
* CSRF protection where applicable
* secure headers
* rate limiting foundation
* CORS configuration
* request size limits
* safe error responses
* server-side permission checks
* audit logging foundation
* no secrets committed to Git
* environment variable validation

Do not create offensive exploitation features.

---

# 19. AUDIT LOG FOUNDATION

Create an immutable-style activity/audit event model.

Track events such as:

```text
LOGIN
LOGOUT
INVESTIGATION_CREATED
INVESTIGATION_UPDATED
ENTITY_CREATED
ENTITY_UPDATED
EVIDENCE_CREATED
REPORT_CREATED
PERMISSION_CHANGED
MEMBER_ADDED
MEMBER_REMOVED
```

Include:

* actor
* organization
* workspace
* action
* resource type
* resource ID
* timestamp
* metadata where safe

Never store passwords, tokens, API keys, or unnecessary sensitive data in audit metadata.

---

# 20. RESPONSIVE DESIGN

The application must work correctly at:

```text
1280px
1440px
1920px
2560px+
tablet
mobile
```

For large desktop screens:

* use available width intelligently
* avoid narrow centered containers
* avoid excessive side whitespace
* allow dashboards to expand
* maintain readable content widths
* keep sidebars stable
* allow graphs/maps/3D scenes to use large viewports

Do not simply stretch every element.

---

# 21. ACCESSIBILITY

Implement:

* keyboard navigation
* visible focus states
* semantic HTML
* accessible buttons
* aria labels where needed
* sufficient contrast
* reduced-motion support
* screen-reader-friendly navigation

3D visualization must have a non-3D fallback.

---

# 22. TESTING

Create the foundation for:

### Unit tests

Test:

* permission evaluation
* organization isolation
* validation
* utility functions

### Integration tests

Test:

* authentication
* protected routes
* workspace access
* organization isolation

### Frontend tests

Test:

* navigation
* protected pages
* permission-aware UI
* basic rendering

### Build gate

The project must successfully pass:

```text
typecheck
lint
unit tests
integration tests
production build
```

Do not hide or disable failing tests.

---

# 23. DEMO DATA

Create a clearly marked development/demo seed.

Example:

```text
ATLAS Demo Organization
    ├── Investigation Alpha
    ├── Investigation Beta
    └── Investigation Gamma
```

Include a small number of fictional entities and relationships so the 3D interface has something to visualize.

Do NOT use real people's personal information.

---

# 24. ENGINEERING RULES

Follow these rules strictly:

1. TypeScript strict mode.
2. No unnecessary `any`.
3. No duplicated business logic.
4. No giant components.
5. Separate UI, domain, API and infrastructure concerns.
6. Reusable components over page-specific duplication.
7. Server-side authorization is mandatory.
8. Never trust client-provided organization/workspace IDs.
9. Validate all external input.
10. Do not expose secrets.
11. Do not add fake backend functionality disguised as production functionality.
12. Demo data must be clearly identified.
13. Do not break existing functionality.
14. Do not rewrite the entire project unnecessarily.
15. Keep 3D functionality isolated from the normal application bundle.
16. Do not implement future phases prematurely.

---

# 25. FINAL PHASE 1 VERIFICATION

Before declaring Phase 1 complete, run the project's available:

```text
lint
typecheck
unit tests
integration tests
build
```

Also manually verify:

```text
[ ] Application starts
[ ] Landing/Overview page works
[ ] Authentication works
[ ] Protected routes work
[ ] RBAC foundation works
[ ] Organization isolation works
[ ] Navigation works
[ ] Investigation workspace shell works
[ ] 3D globe loads
[ ] Globe interactions work
[ ] WebGL fallback works
[ ] Desktop layout works at 1440px+
[ ] Tablet layout works
[ ] Mobile layout works
[ ] No secrets are exposed
[ ] No backend authorization is bypassed
[ ] No console errors
[ ] No obvious runtime errors
```

Fix all Phase 1 issues before stopping.

---

# 26. PHASE 1 COMPLETION REPORT

Create:

`docs/PHASE_1_COMPLETE.md`

Include:

* What was implemented
* Architecture decisions
* Files created/modified
* Database migrations
* API endpoints
* Frontend routes
* 3D architecture
* Security controls
* Tests executed
* Test results
* Known limitations
* Deferred Phase 2 work
* Commands required to run the project

At the end, print:

```text
========================================
 ATLAS PHASE 1 COMPLETE
========================================

Foundation:        READY
Authentication:    READY
RBAC:              READY
Multi-tenancy:     READY
API Foundation:    READY
Database:          READY
3D Engine:         READY
Overview:          READY
Investigation UI:  READY
Security Baseline: READY
Testing:           PASSED
Production Build:  PASSED

NEXT:
PHASE 2 — Investigation & Entity Intelligence
========================================
```

IMPORTANT:

This is **PHASE 1 ONLY**.

Do not continue into Phase 2 automatically.

Do not implement the complete AI engine, advanced graph engine, evidence pipeline, report engine, or full intelligence collection system yet.

Build a clean, extensible foundation that makes those features possible in the next six phases.
