# ATLAS — Reference-Matched Advanced 3D Frontend Transformation Command

## MASTER INSTRUCTION

Transform the existing **ATLAS Intelligence Web Platform** frontend into a premium, immersive, production-quality 3D intelligence command center.

**The supplied reference image is the PRIMARY VISUAL DESIGN SPECIFICATION.**

Do not merely make the application "futuristic" or "3D-looking". Rebuild the frontend composition so the actual application closely follows the reference image's:

- page composition
- sidebar structure
- panel placement
- information density
- dark visual language
- 3D centerpiece
- glass panels
- lighting
- spacing
- typography hierarchy
- controls
- context panels
- analytical visualizations
- page-specific visual identity

The result must be a **functional implementation of the reference design**, not a collection of decorative mockups.

---

# 1. ABSOLUTE BACKEND PROTECTION

## FRONTEND ONLY

**DO NOT MODIFY THE BACKEND.**

Never change:

- Backend source code
- API routes
- API endpoints
- API request/response contracts
- Database
- Prisma/ORM schema
- Authentication
- Authorization
- RBAC
- Permissions
- WebSockets
- Server-side business logic
- Background workers
- Queues
- Schedulers
- Environment variables
- Server configuration
- Existing backend validation

Use the existing backend exactly as it currently works.

### If a visual feature requires unavailable backend data

Do NOT modify the backend.

Instead:

1. Inspect existing API capabilities.
2. Reuse available data.
3. Build a graceful frontend fallback.
4. Clearly indicate unavailable data where necessary.
5. Continue without changing backend contracts.

**Backend must remain untouched.**

---

# 2. FIRST: FULL FRONTEND AUDIT

Before editing anything:

1. Inspect the entire frontend.
2. Identify the framework and architecture.
3. Inspect all routes.
4. Inspect all layouts.
5. Inspect shared components.
6. Inspect design tokens.
7. Inspect API hooks/services.
8. Inspect authentication state.
9. Inspect authorization state.
10. Inspect Graph implementation.
11. Inspect Map implementation.
12. Inspect Timeline implementation.
13. Inspect Evidence implementation.
14. Inspect Alerts/Watchlists.
15. Inspect Reports/Analytics.
16. Inspect AI Assistant.
17. Inspect Admin pages.
18. Inspect installed Three.js/R3F libraries.
19. Inspect existing tests.
20. Identify reusable components.

Do not blindly rewrite working functionality.

---

# 3. REFERENCE IMAGE IS THE VISUAL SOURCE OF TRUTH

Implement the nine major reference compositions:

1. **Dashboard / Command Center**
2. **Investigations**
3. **Intelligence / Overview**
4. **Knowledge Graph 3D**
5. **Map View 3D Globe**
6. **Timeline View 3D**
7. **Evidence Management 3D**
8. **Alerts & Watchlists 3D**
9. **Reports & Analytics 3D**

Each route must have a different visual centerpiece.

Do NOT apply one generic dashboard template to every page.

---

# 4. GLOBAL ATLAS VISUAL LANGUAGE

Create a unified ATLAS identity.

## Background

Use:

- near-black
- deep navy
- subtle blue atmospheric lighting
- subtle grid
- layered depth
- restrained particles
- soft environmental glow

## Panels

Use:

- dark translucent surfaces
- subtle backdrop blur
- thin borders
- blue-gray edge lighting
- small/controlled corner radius
- internal highlights
- depth shadows

## Accent system

Primary:

- cyan
- electric blue
- teal

Status:

- green = healthy / verified
- orange = warning / review
- red = critical
- gray = inactive / unknown

Do not make the whole UI neon.

The reference design is **dark, restrained, technical and cinematic**.

---

# 5. GLOBAL APPLICATION SHELL

Create a persistent command-center shell:

```text
┌─────────────────────────────────────────────────────────────┐
│ ATLAS        PAGE TITLE / SEARCH / COMMANDS       ACTIONS  │
├─────────────┬───────────────────────────────────┬───────────┤
│             │                                   │           │
│ NAVIGATION  │       PRIMARY 3D WORKSPACE       │ CONTEXT   │
│             │                                   │ PANEL     │
│             │                                   │           │
│             │                                   │           │
├─────────────┴───────────────────────────────────┴───────────┤
│ STATUS / ACTIVITY / SECONDARY ANALYTICS                    │
└─────────────────────────────────────────────────────────────┘
```

Sidebar:

```text
ATLAS

Dashboard
Investigations
Intelligence
Entities
Graph
Map
Timeline
Evidence
Alerts
Watchlists
Reports
Workflows
AI Assistant
Administration
```

The sidebar must be compact like the reference.

Support:

- active route
- hover state
- selected state
- keyboard navigation
- tooltips
- collapse/expand
- responsive behavior

---

# 6. COMMAND CENTER — REFERENCE SCREEN 1

Create the Dashboard as a 3D intelligence command center.

## Top metrics

Display real backend data:

- Total Investigations
- Active Alerts
- Entities
- Sources

## Center

Large **3D Earth / Globe**.

The globe should visually dominate the page.

Use:

- illuminated continents
- atmosphere
- latitude/longitude
- connection arcs
- geographic markers
- activity points
- orbital lines
- subtle data particles

Do not put the globe inside a generic dashboard card.

## Right

Recent Activity.

## Bottom

Three compact analytical panels:

- Active Investigations
- Threat Level
- Top Entities

The layout should visually resemble the reference.

---

# 7. INVESTIGATIONS — REFERENCE SCREEN 2

Create a distinctive investigation operations page.

## Top

Compact investigation cards:

- Investigation name
- progress
- status
- priority
- activity

## Center

Large **3D terrain / investigation landscape**.

Use:

- mountain terrain
- glowing routes
- location markers
- investigation points
- subtle atmospheric depth

## Bottom

Investigation Phases:

```text
Planning
Collection
Analysis
Validation
Review
Report
```

## Right

Key Findings.

## Lower section

Team Activity.

Do not turn this page into an ordinary card grid.

---

# 8. INTELLIGENCE / OVERVIEW — REFERENCE SCREEN 3

Create a large holographic intelligence visualization.

Centerpiece:

**3D orbital/cylindrical intelligence structure.**

Inside/around it:

- Organizations
- People
- Locations
- Events
- Documents
- Intelligence objects

Use:

- orbital rings
- floating entity cards/icons
- holographic panels
- subtle rotation
- depth
- emissive lighting

Right:

### Intelligence Summary

Show:

- Total Intelligence
- Confirmed
- Pending
- Rejected

Below:

### Categories

Show category counts.

Bottom/right:

### Top Intelligence

Use real data.

---

# 9. KNOWLEDGE GRAPH — REFERENCE SCREEN 4

This page must be a genuine interactive 3D knowledge graph.

## Center

Large 3D graph.

Use:

- 3D nodes
- relationship edges
- relationship labels
- node halos
- category-specific visual treatment
- depth
- subtle bloom
- camera movement
- clustering
- filtering

Interactions:

```text
Hover node
→ Highlight

Click node
→ Focus camera + open context

Click edge
→ Highlight relationship + show metadata

Double-click node
→ Expand available connections
```

## Right

Filters:

### Entity Type

- Person
- Organization
- Location
- Event
- Document

### Relationship Type

Use the relationship types already supported by the backend.

## Bottom

Graph search and controls.

Use real graph data.

Never replace the graph with a static fake illustration.

---

# 10. MAP VIEW — REFERENCE SCREEN 5

Create a large **3D globe intelligence map**.

Use:

- realistic dark Earth
- illuminated terrain
- atmospheric edge
- location markers
- curved connection lines
- geographic clusters
- event markers

## Right context panel

When a location is selected:

```text
Location Intelligence

Location
Risk Level
Related Entities
Events
Last Activity
Connected To
```

## Bottom

Activity Over Time.

Provide:

```text
2D MAP
3D GLOBE
```

switching.

Both modes must remain usable.

---

# 11. TIMELINE VIEW — REFERENCE SCREEN 6

Build a spatial 3D timeline.

Do NOT create a conventional flat timeline.

Use:

- multiple glowing temporal paths
- floating event markers
- vertical event anchors
- date labels
- entity tracks
- evidence markers
- event clusters
- depth

Example event types:

```text
Entity Created
Document Uploaded
Relationship Added
Alert Triggered
Report Generated
```

Controls:

```text
1M
3M
6M
1Y
ALL
```

Use actual timeline data.

Clicking an event opens its existing details/context.

---

# 12. EVIDENCE MANAGEMENT — REFERENCE SCREEN 7

Create a holographic evidence archive.

Center:

**3D evidence carousel/archive.**

Use floating:

- PDF cards
- image cards
- video cards
- audio cards
- document cards

Selected evidence should visually move into focus.

Right:

### Evidence Types

Bottom:

### Evidence Stats

Include existing actions:

- Upload
- Search
- Filter
- Sort
- View
- Download
- Delete

Use the existing backend functionality.

Do not fabricate evidence.

---

# 13. ALERTS & WATCHLISTS — REFERENCE SCREEN 8

Create a dedicated intelligence-warning environment.

## Top

Severity metrics:

```text
Critical
High
Medium
Low
```

## Center

Large 3D warning/radar centerpiece.

Use:

- warning symbol
- circular platforms
- radar sweep
- controlled red/orange glow
- subtle pulse
- alert beacon

## Left

Alert feed.

## Right

Watchlist Overview.

## Bottom

Severity filters and existing alert controls.

Keep animation restrained.

---

# 14. REPORTS & ANALYTICS — REFERENCE SCREEN 9

Create a premium analytics environment.

## Center

Large 3D analytical visualization.

Use:

- 3D columns
- glowing data bars
- depth
- subtle animated data
- grid floor

## Left

Report Categories.

## Right

Analytics Overview.

Show existing metrics such as:

- Total Reports
- Threat Reports
- Financial Reports
- Operational Reports
- Custom Reports

## Bottom

Recent Reports table.

Include:

- name
- date
- status
- action

Keep tables highly readable.

---

# 15. ENTITY PROFILE — ADDITIONAL ATLAS 3D DESIGN

Create a distinct entity intelligence page.

Center:

**3D relationship constellation.**

Show:

```text
              ENTITY
          /      |      \
      PERSON    ORG     EVENT
        |        |        |
     EVIDENCE LOCATION  REPORT
```

Panels:

- Identity
- Classification
- Relationships
- Evidence
- Timeline
- Locations
- Investigations
- Activity
- AI Analysis

Selecting a node should focus the camera and open its context.

---

# 16. RELATIONSHIP CREATION

Create a polished frontend relationship workflow:

```text
Entity A
   ↓
Connect
   ↓
Entity B
   ↓
Relationship Type
   ↓
Evidence
   ↓
Metadata
   ↓
3D Preview
   ↓
Create
```

Before saving, show the relationship visually:

```text
[Entity A] ───── relationship ─────> [Entity B]
```

Use the existing relationship API without modification.

---

# 17. AI ASSISTANT — INTELLIGENCE COPILOT

Do not create a generic chatbot.

Create an ATLAS Intelligence Copilot.

Use:

- contextual investigation
- entity-aware prompts
- evidence references
- graph context
- timeline context
- source references
- analysis cards
- streaming if already supported

Quick actions:

```text
Summarize Investigation
Analyze Relationships
Find Missing Evidence
Compare Entities
Analyze Timeline
Explain Connection
Identify Contradictions
Generate Briefing
```

Clearly distinguish:

```text
Confirmed
Supported
Inferred
Hypothesis
Unknown
```

Do not invent AI capabilities unavailable from the existing backend.

---

# 18. WORKFLOW BUILDER

Create a node-based visual workflow interface.

Example:

```text
Trigger
   ↓
Collect
   ↓
Analyze
   ↓
Review
   ↓
Approve
   ↓
Report
```

Nodes should have:

- depth
- glass surfaces
- status lighting
- animated execution state
- connection lines
- hover details

Use the existing workflow backend.

---

# 19. ADMINISTRATION DESIGN

Admin must have a different visual identity.

Use a system command-center aesthetic.

Include:

- system health
- user activity
- audit activity
- permissions overview
- operational metrics
- system status
- activity streams

Do not make Admin look identical to the investigator workspace.

---

# 20. PAGE-SPECIFIC 3D SYSTEM

Mandatory:

```text
Dashboard
→ 3D Globe

Investigations
→ 3D Terrain

Intelligence
→ Holographic Intelligence Cylinder

Knowledge Graph
→ 3D Relationship Network

Map
→ 3D Earth

Timeline
→ 3D Temporal Paths

Evidence
→ 3D Evidence Archive

Alerts
→ 3D Warning Radar

Reports
→ 3D Analytics Columns

Entity
→ 3D Relationship Constellation

AI
→ Intelligence Copilot Environment

Admin
→ System Command Center
```

Do not reuse the exact same 3D centerpiece everywhere.

---

# 21. REUSABLE 3D COMPONENT SYSTEM

Create reusable components where appropriate:

```text
AtlasShell
AtlasSidebar
AtlasTopbar
AtlasCommandBar

GlassPanel
HolographicPanel
FloatingPanel
NeonBorder
MetricCard
DataCard

GlobeScene
TerrainScene
GraphScene
TimelineScene
EvidenceScene
RadarScene
AnalyticsScene
ConstellationScene

SceneToolbar
SceneControls
EntityNode
RelationshipEdge
TimelineMarker
EvidenceObject
LocationMarker
```

Keep page-specific scenes separate when their behavior differs.

---

# 22. REALTIME CONTEXT PANEL

Create a reusable right-side context system.

Selecting:

- Entity
- Relationship
- Location
- Event
- Evidence
- Alert
- Report

opens a contextual panel.

Example:

```text
ENTITY

Name
Type
Status

Relationships
Evidence
Timeline
Locations
Investigations
Activity
```

The primary 3D scene remains visible.

---

# 23. MOTION DESIGN

Use motion intentionally.

Required:

- page entrance
- staggered panel reveal
- hover depth
- camera transitions
- node focus
- relationship pulses
- subtle scene transitions
- modal transitions
- loading transitions

Avoid:

- excessive bouncing
- constant particle movement
- unnecessary animations
- very long transitions
- animation on every component

Respect:

```text
prefers-reduced-motion
```

---

# 24. 3D QUALITY

3D must look designed, not decorative.

Use:

- proper lighting
- emissive materials
- depth
- atmosphere
- subtle fog
- controlled bloom
- transparent materials
- realistic camera perspective
- restrained particles
- consistent blue/cyan illumination

Do not use random primitives with random colors.

Every object must communicate intelligence/data.

---

# 25. PERFORMANCE

3D performance is mandatory.

Implement:

- lazy loading
- dynamic imports
- progressive graph rendering
- node limits
- clustering
- instancing
- texture optimization
- particle limits
- device pixel ratio control
- render throttling
- visibility-based rendering
- resource disposal
- scene cleanup

Dispose:

- geometries
- materials
- textures
- render targets
- listeners

when scenes unmount.

Do not render hidden 3D scenes unnecessarily.

---

# 26. RESPONSIVE DESIGN

Desktop targets:

```text
1280
1440
1920
2560
3440+
```

Tablet:

- simplify 3D
- collapse context panels
- preserve core interactions

Mobile:

- prioritize data
- use bottom sheets
- use simplified 3D
- provide 2D alternatives

Never allow:

- horizontal overflow
- clipped controls
- overlapping panels
- unreadable tables
- unusable 3D controls

---

# 27. ACCESSIBILITY

Every important 3D interaction requires an accessible alternative.

Implement:

- keyboard navigation
- visible focus
- semantic controls
- screen-reader labels
- tooltips
- reduced-motion support
- 2D fallback
- accessible context panels

3D must enhance the product, not block access to information.

---

# 28. DATA INTEGRITY

Never replace real application data with fake production data.

Preserve:

- loading states
- error states
- empty states
- pagination
- filtering
- sorting
- search
- realtime updates
- existing API behavior

If data is missing, show an honest empty state.

---

# 29. SECURITY UX

Do not treat frontend visibility as authorization.

Never:

- expose secrets
- expose tokens
- bypass permission checks
- display restricted information
- implement fake frontend-only security

Use existing backend authorization as the source of truth.

---

# 30. LOADING / EMPTY / ERROR STATES

Create ATLAS-specific states.

## Loading

Use:

- holographic skeletons
- subtle scene loaders
- progress indicators

## Empty

Show:

- minimal intelligence visualization
- explanation
- useful next action

## Error

Show:

- readable error
- retry action
- existing request/error identifier if available

Do not expose stack traces.

---

# 31. INFORMATION DENSITY

The reference image is dense.

Do NOT create excessive empty space.

Use the viewport intelligently.

Maintain compact:

- metrics
- tables
- activity feeds
- filters
- context panels
- metadata

The 3D visualization should dominate where appropriate without destroying analytical density.

---

# 32. TYPOGRAPHY

Use a sophisticated technical hierarchy.

Recommended:

- distinctive display font for major headings if available
- highly readable UI font
- monospace for:
  - IDs
  - hashes
  - timestamps
  - technical metadata

Use compact uppercase labels similar to the reference.

Prioritize readability over decorative typography.

---

# 33. VISUAL LAYERS

Use a consistent spatial hierarchy:

```text
Background
↓
Atmosphere
↓
3D Scene
↓
Main Glass Workspace
↓
Context Panels
↓
Focused Modal
```

Do not make every surface equally bright.

---

# 34. PAGE TRANSITIONS

Where appropriate, connect pages visually.

Examples:

```text
Dashboard
→ Globe focus
→ Investigation

Graph
→ Node focus
→ Entity

Map
→ Location focus
→ Entity

Timeline
→ Event focus
→ Evidence
```

The application should feel like one connected intelligence environment.

---

# 35. VISUAL QA AGAINST THE REFERENCE

After implementation, compare each route directly against the supplied reference.

Check:

- Overall composition
- Sidebar width
- Header
- Main scene size
- Right panel placement
- Bottom panels
- Typography density
- Glass surfaces
- Border treatment
- Lighting
- 3D depth
- Spacing
- Colors
- Visual hierarchy

If a page looks like a generic SaaS dashboard:

**REDESIGN IT.**

If a page uses only decorative 3D instead of a meaningful visualization:

**REDESIGN IT.**

---

# 36. FUNCTIONAL QA

Verify:

- Navigation
- Authentication
- Authorization
- Search
- Filters
- Forms
- Graph
- Map
- Timeline
- Evidence
- Alerts
- Watchlists
- Reports
- AI
- Workflows
- Admin
- Realtime updates

All existing functionality must continue working.

---

# 37. BUILD QA

Run:

```bash
lint
typecheck
test
build
```

Fix frontend errors and regressions.

Do not "fix" frontend problems by changing backend code.

---

# 38. 3D QA

For every 3D scene verify:

```text
Initial render
Resize
Route change
Camera controls
Reset camera
Selection
Hover
Click
Data update
Unmount
Remount
Fullscreen
Reduced motion
WebGL failure/fallback
Mobile
```

Ensure no Three.js resource leaks.

---

# 39. FINAL DELIVERABLE

At completion report:

```text
ATLAS FRONTEND 3D TRANSFORMATION

Dashboard ................. PASS
Investigations ............ PASS
Intelligence .............. PASS
Knowledge Graph ........... PASS
Map ....................... PASS
Timeline .................. PASS
Evidence .................. PASS
Alerts/Watchlists ......... PASS
Reports/Analytics ......... PASS
Entities .................. PASS
AI Assistant .............. PASS
Workflows ................. PASS
Administration ............ PASS

Responsive ................. PASS
Accessibility .............. PASS
Performance ................ PASS
Lint ....................... PASS
Typecheck .................. PASS
Tests ...................... PASS
Production Build ........... PASS

Backend Modified ........... MUST BE NO
API Contracts Modified ..... MUST BE NO
Database Modified .......... MUST BE NO
Authentication Modified .... MUST BE NO
Authorization Modified ..... MUST BE NO
```

---

# FINAL COMMAND

Build the complete ATLAS frontend according to this specification.

The **provided reference image is the primary visual target**.

Do not interpret the task as simply "add 3D".

Interpret it as:

> **Rebuild the existing ATLAS frontend into a functional, interactive implementation of the supplied 3D reference design.**

Every major page must have:

- a unique visual composition
- a unique 3D centerpiece
- compact analytical panels
- contextual information
- real data
- functional controls
- professional enterprise UX

The final product should feel like:

**ATLAS — A Premium 3D Intelligence Command Center**

not a generic dashboard.

## NON-NEGOTIABLE

```text
FRONTEND ONLY
BACKEND UNTOUCHED
API CONTRACTS UNCHANGED
DATABASE UNCHANGED
AUTHENTICATION UNCHANGED
AUTHORIZATION UNCHANGED
REAL DATA PRESERVED
NO FAKE PRODUCTION DATA
REFERENCE IMAGE = PRIMARY VISUAL TARGET
EVERY PAGE = DISTINCT 3D DESIGN
FUNCTIONALITY = PRESERVED
PERFORMANCE = REQUIRED
ACCESSIBILITY = REQUIRED
```