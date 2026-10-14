# ATLAS — Full Advanced 3D Frontend Design Command

> **Frontend-only transformation. Backend must remain completely untouched.**

## 0. Absolute Rules

This is a **frontend-only** task.

### NEVER modify

- Backend source code
- Backend routes
- API endpoints
- API contracts
- Request/response schemas
- Database/schema
- Prisma/ORM models
- Authentication logic
- Authorization logic
- RBAC/permissions
- WebSocket implementation
- Background jobs
- Queues
- Schedulers
- Server-side business logic
- Environment variables
- Existing backend configuration

Use the existing backend exactly as implemented.

If a visual feature appears to require backend changes:

1. Inspect the existing API capabilities.
2. Reuse available data.
3. Build a graceful frontend fallback if necessary.
4. Document the limitation.
5. **Never modify the backend.**

Do not replace working functionality just for visual reasons.

---

# 1. Objective

Transform the existing ATLAS Intelligence Platform frontend into a premium, immersive, futuristic **3D intelligence-analysis interface**.

The design should feel like:

- A professional intelligence command center
- A sophisticated investigation workspace
- An advanced knowledge-graph platform
- A cinematic geospatial intelligence system
- A modern AI-assisted analysis environment

It must **not** look like a generic SaaS dashboard.

The frontend should combine:

**Enterprise UX + analytical information density + advanced 3D visualization + cinematic depth + excellent usability.**

---

# 2. Design Reference Direction

Use the provided ATLAS design reference as the visual direction.

Core characteristics:

- Dark near-black environment
- Glassmorphism
- Translucent panels
- Subtle borders
- Cyan/blue primary illumination
- Controlled orange/red warning states
- Holographic surfaces
- Depth layers
- Atmospheric particles
- Neon edge highlights
- Subtle grids
- Cinematic lighting
- High information density
- Sophisticated typography
- Smooth but restrained motion

Avoid:

- Generic dashboard cards
- Excessive gradients
- Purple AI-dashboard aesthetics
- Flat Bootstrap-style layouts
- Excessive rounded containers
- Visual clutter
- Unnecessary animations
- 3D effects that reduce usability

---

# 3. Frontend Audit Before Implementation

Before changing code:

1. Inspect the entire frontend.
2. Identify the framework.
3. Inspect all routes.
4. Inspect page layouts.
5. Inspect shared components.
6. Inspect API clients/hooks.
7. Inspect authentication state.
8. Inspect existing realtime/WebSocket consumers.
9. Inspect graph components.
10. Inspect map components.
11. Inspect timeline components.
12. Inspect evidence components.
13. Inspect report components.
14. Inspect AI interfaces.
15. Inspect existing design tokens.
16. Inspect installed 3D libraries.
17. Inspect existing tests.

Reuse the existing architecture wherever practical.

Do not blindly rewrite the application.

---

# 4. Technology Strategy

Use the existing frontend stack.

Where already available and appropriate, use:

- React
- Next.js
- TypeScript
- Tailwind CSS
- CSS variables
- Motion / Framer Motion
- Three.js
- React Three Fiber
- Drei
- Existing charting libraries
- Existing mapping libraries

Do not introduce unnecessary dependencies.

Heavy 3D modules should be lazy-loaded.

---

# 5. ATLAS Design System

Create a consistent reusable frontend design system.

Suggested components:

```text
AtlasShell
AtlasSidebar
AtlasTopbar
AtlasCommandBar
GlassPanel
HolographicPanel
NeonBorder
DataCard
MetricCard
IntelligenceCard
FloatingPanel
EntityBadge
RelationshipBadge
EvidenceCard
TimelineMarker
SceneToolbar
SceneControls
GlobeScene
GraphScene
ParticleField
DepthGrid
3DTooltip
LoadingScene
EmptyScene
ErrorScene
```

Centralize:

- Colors
- Typography
- Spacing
- Border styles
- Glass effects
- Shadows
- Motion
- Z-index
- Scene lighting
- 3D depth
- Responsive breakpoints

Do not duplicate visual logic across pages.

---

# 6. Global ATLAS Shell

Build a persistent intelligence-command layout.

```text
┌─────────────────────────────────────────────────────────────┐
│ ATLAS / COMMAND / SEARCH / STATUS                           │
├──────────────┬─────────────────────────────────┬─────────────┤
│              │                                 │             │
│ Navigation   │     Primary Analysis Scene     │   Context   │
│              │                                 │             │
│              │                                 │             │
├──────────────┴─────────────────────────────────┴─────────────┤
│ Realtime / System Status / Activity                          │
└─────────────────────────────────────────────────────────────┘
```

Sidebar:

```text
ATLAS

Command Center
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

Requirements:

- Persistent navigation
- Active route visualization
- Icon + label
- Hover depth
- Tooltips
- Smooth expansion/collapse
- Keyboard navigation
- Responsive behavior

---

# 7. Command Center — 3D Globe

The Command Center should use an interactive 3D globe as the primary visual centerpiece.

Use:

- 3D Earth
- Atmospheric glow
- Latitude/longitude lines
- Intelligence connection arcs
- Geographic markers
- Activity points
- Orbital rings
- Data particles
- Subtle scan effects

Surround the globe with real data:

- Active investigations
- Intelligence alerts
- Entity counts
- Evidence statistics
- Recent activity
- System status

Never hardcode production statistics.

Use real backend data.

---

# 8. Investigations — 3D Mission Workspace

Create a distinctive investigation dashboard.

Use:

- Floating investigation cards
- Depth-based cards
- Status beacons
- Priority indicators
- Progress indicators
- Activity streams
- Miniature visualizations
- Investigation health indicators

Each investigation should visually feel like an active intelligence operation.

Clicking an investigation should transition smoothly into its workspace.

---

# 9. Investigation Workspace

This should be one of the most advanced pages.

Navigation:

```text
Overview
Entities
Graph
Map
Timeline
Evidence
Findings
AI Analysis
Reports
Activity
```

Primary visualization modes:

```text
GRAPH
MAP
TIMELINE
EVIDENCE
ENTITIES
FINDINGS
AI
```

Use smooth transitions between modes.

Maintain persistent investigation context.

---

# 10. Knowledge Graph — Advanced 3D

Build an immersive 3D knowledge graph.

Use:

- 3D entity nodes
- Glowing edges
- Relationship labels
- Category-based visual treatments
- Depth-based positioning
- Animated relationship pulses
- Hover highlighting
- Selection focus
- Camera transitions
- Clustering
- Filtering
- Search
- Progressive expansion

Interaction:

```text
Hover Node
→ Highlight

Click Node
→ Focus Camera
→ Open Entity Context

Click Relationship
→ Highlight Edge
→ Show Relationship Metadata

Double Click
→ Expand Authorized Connections
```

Do not render unlimited nodes.

Use:

- Progressive expansion
- Node limits
- Clustering
- Virtualization where applicable

Use real ATLAS graph data.

---

# 11. Map — 3D Globe Intelligence

Create an advanced geospatial interface.

Modes:

```text
2D MAP
3D GLOBE
```

3D mode:

- Globe
- Location markers
- Animated arcs
- Clusters
- Entity locations
- Event indicators
- Geographic overlays
- Timeline filtering
- Camera controls

2D mode should remain precise and usable.

Use real geographic data.

---

# 12. Timeline — 3D Temporal Visualization

Do not create a generic flat timeline.

Build a depth-based temporal environment.

Use:

- 3D timeline rail
- Floating event markers
- Glowing paths
- Date labels
- Event clusters
- Entity tracks
- Evidence markers
- Zoomable time scale

Interactions:

```text
Hover Event
→ Preview

Click Event
→ Focus

Select Entity
→ Highlight Entity Timeline

Zoom
→ Change Time Granularity
```

Support:

- Missing dates
- Long timelines
- Dense event clusters
- Different time ranges

---

# 13. Evidence — Holographic Archive

Create a premium evidence-management environment.

Visual concept:

A futuristic evidence archive containing floating documents, images, links, and records.

Use:

- Floating document cards
- Document stacks
- Image previews
- Metadata panels
- Verification indicators
- Source indicators
- Evidence relationships
- Classification indicators

Use a 3D carousel/archive effect where appropriate.

Maintain normal functionality:

- Upload
- Search
- Filter
- Sort
- View
- Download
- Delete

All through existing backend APIs.

---

# 14. Alerts & Watchlists — Intelligence Radar

Create a futuristic alert center.

Main centerpiece:

**3D intelligence radar / warning beacon**

Severity:

```text
Critical
High
Medium
Low
```

Use controlled visual states:

- Pulse
- Radar sweep
- Beacon glow
- Status rings
- Notification transitions

Watchlists should show:

- Monitored entities
- Latest changes
- Activity
- Alert history
- Status

Do not use constant distracting motion.

---

# 15. Intelligence Overview

Create a holographic intelligence core.

Visual components:

- Circular intelligence visualization
- Entity categories
- Intelligence feeds
- Confidence indicators
- Activity streams
- Analytical summaries
- Relationship statistics

Use depth layers to create a spatial command-center feeling.

---

# 16. Reports & Analytics

Create a premium analytics environment.

Use:

- Analytical panels
- Floating charts
- Selective 3D charts
- Animated counters
- Investigation metrics
- Report status
- Report history

Do not convert every chart into 3D.

Use 3D only when it improves comprehension.

Reports must remain readable and export-friendly.

---

# 17. Entity Profile — Relationship Constellation

Build a distinctive entity intelligence page.

Sections:

```text
Identity
Classification
Relationships
Evidence
Timeline
Locations
Investigations
Activity
AI Analysis
```

Primary visualization:

A 3D relationship constellation.

Example:

```text
              Entity
           /    |    \
       Person  Org   Event
         |      |      |
      Evidence Location
```

Interactions:

- Select node
- Focus camera
- Expand relationships
- Filter relationship types
- Open evidence
- View timeline

Keep precise structured data panels alongside the visualization.

---

# 18. Relationship Creation UI

Build a visually advanced relationship creation workflow.

```text
Select Entity A
       ↓
Connect
       ↓
Select Entity B
       ↓
Choose Relationship
       ↓
Add Evidence
       ↓
Set Metadata
       ↓
Preview Connection
       ↓
Create
```

Show a live 3D connection preview.

Example:

```text
[Entity A]
     │
     │  WORKS_FOR
     ▼
[Entity B]
```

Use the existing relationship API exactly as implemented.

Do not change API contracts.

---

# 19. AI Intelligence Assistant

The AI interface must feel integrated into ATLAS rather than like a generic chatbot.

Use:

- Contextual investigation panel
- Entity-aware prompts
- Evidence references
- Graph context
- Timeline context
- Source citations
- Analysis cards
- Streaming responses if supported
- Expandable context information

Quick actions:

```text
Summarize Investigation
Analyze Relationships
Find Missing Evidence
Compare Entities
Analyze Timeline
Explain This Connection
Identify Contradictions
Generate Briefing
```

Use existing AI APIs.

Do not invent backend functionality.

AI output should visually distinguish:

```text
Confirmed
Supported
Inferred
Hypothesis
Unknown
```

---

# 20. Workflow Builder

Build a visual workflow editor.

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

Use:

- Node-based canvas
- 3D depth
- Connection lines
- Execution indicators
- Status lighting
- Hover details
- Smooth transitions

Do not modify workflow backend logic.

---

# 21. Administration UI

The Admin interface must have its own visual identity.

Use:

- Command-center aesthetic
- System health visualization
- Infrastructure metrics
- User activity
- Audit events
- Permission overview
- System status
- Operational indicators

Do not make Admin visually identical to Analyst/Investigator pages.

---

# 22. Distinct 3D Identity Per Page

Each major page needs a different visual centerpiece.

```text
Command Center
→ 3D Globe

Investigations
→ 3D Mission/Terrain Visualization

Intelligence
→ Holographic Intelligence Core

Graph
→ 3D Knowledge Network

Map
→ 3D Globe

Timeline
→ 3D Temporal Rail

Evidence
→ Holographic Evidence Archive

Alerts
→ 3D Radar / Beacon

Reports
→ 3D Analytics Environment

Entity
→ 3D Relationship Constellation

AI
→ Intelligence Copilot Environment

Admin
→ System Command Center
```

Maintain a consistent ATLAS design language while giving each page a unique identity.

---

# 23. Motion System

Create a unified motion language.

Use:

- Page entrance transitions
- Staggered reveals
- Camera movement
- Node highlighting
- Hover depth
- Subtle parallax
- Data pulses
- Modal transitions
- Scene transitions
- Loading transitions

Motion must communicate state.

Avoid:

- Excessive bouncing
- Constant movement
- Distracting particles
- Long animations
- Animating every element

Respect:

```text
prefers-reduced-motion
```

---

# 24. 3D Interaction Standards

All 3D scenes should support:

- Mouse controls
- Touch controls where practical
- Zoom
- Pan
- Rotate
- Reset camera
- Focus selected object
- Fullscreen scene
- Scene controls
- Tooltip/details panel
- Keyboard alternatives

Provide:

```text
Reset View
Focus Selected
Zoom In
Zoom Out
Fullscreen
2D View
```

where appropriate.

---

# 25. Performance Requirements

3D must never destroy application performance.

Implement:

- Lazy loading
- Dynamic imports
- Progressive graph loading
- Instancing
- Limited particle counts
- Resource disposal
- Texture optimization
- Scene cleanup
- Animation throttling
- Visibility-based rendering
- Reasonable device pixel ratio
- Virtualized lists
- Avoiding unnecessary React rerenders

Pause expensive animations when scenes are not visible.

Dispose:

- Geometry
- Materials
- Textures
- Render targets
- Event listeners

when components unmount.

---

# 26. Responsive Design

Support:

```text
1280px
1440px
1920px
2560px
3440px+
```

Also:

- Tablet
- Mobile

Desktop:

Full 3D experience.

Tablet:

Simplified 3D + collapsible context panels.

Mobile:

Prioritize:

- Data
- Search
- Actions
- Entity information
- Lightweight visualization

Do not allow:

- Horizontal overflow
- Clipped content
- Overlapping panels
- Unusable tables
- Unreachable controls

---

# 27. Accessibility

Every important 3D interaction must have a non-3D alternative.

Support:

- Keyboard navigation
- Focus management
- Screen-reader labels
- Tooltips
- Accessible controls
- Reduced motion
- 2D fallback
- High readability
- Semantic HTML

3D should enhance the interface, not become a barrier.

---

# 28. Real Data Only

Never replace existing backend-driven data with mock production data.

Preserve:

- Loading states
- Error states
- Empty states
- Pagination
- Filtering
- Sorting
- Search
- Realtime updates
- Existing API behavior

If data is unavailable:

Show a proper empty/loading/error state.

Do not fabricate intelligence.

---

# 29. Loading / Empty / Error States

Create ATLAS-specific states.

### Loading

Use:

- Holographic skeletons
- Subtle scene loader
- Progress indicators

### Empty

Use:

- Minimal intelligence visualization
- Explanation
- Clear action

### Error

Use:

- Diagnostic panel
- Human-readable message
- Retry action
- Error/request ID if already provided

Never expose stack traces to ordinary users.

---

# 30. Visual Hierarchy

Use a clear hierarchy:

```text
Level 1
Primary Intelligence / Main Scene

Level 2
Important Metrics / Findings

Level 3
Context Panels

Level 4
Metadata

Level 5
Secondary Controls
```

Do not make every element visually loud.

The 3D centerpiece should support the data, not overpower it.

---

# 31. Typography

Avoid generic visual styling.

Use a sophisticated typography system.

Recommended direction:

- Distinctive display font for major ATLAS headings if already available
- Highly readable UI font for dense analytical content
- Monospace for IDs, timestamps, hashes, technical metadata

Typography should support:

- Dense tables
- Investigation metadata
- Evidence details
- Graph labels
- Dashboard metrics

Prioritize readability.

---

# 32. Color System

Use a restrained intelligence palette.

Base:

- Near-black
- Deep navy/charcoal
- Transparent dark glass

Primary:

- Cyan
- Electric blue

Secondary:

- Muted blue
- Neutral gray

Status:

- Green = healthy/verified
- Yellow/orange = warning/review
- Red = critical
- Gray = inactive/unknown

Never use color as the only status indicator.

---

# 33. Glassmorphism Rules

Glass surfaces should have:

- Transparency
- Backdrop blur
- Fine borders
- Subtle internal highlights
- Layered depth
- Controlled shadows

Avoid making everything glass.

Use visual hierarchy:

```text
Background
↓
Atmosphere
↓
3D Scene
↓
Glass Workspace
↓
Floating Context
↓
Focused Modal
```

---

# 34. Background Atmosphere

Use subtle environmental depth:

- Grid
- Particles
- Light fields
- Gradient atmosphere
- Soft glows
- Depth layers

Avoid:

- Heavy particle storms
- Distracting animations
- Excessive neon
- Wallpaper-like backgrounds

---

# 35. Navigation Transitions

When moving between major ATLAS modules:

Use subtle transitions such as:

```text
Dashboard
→ Globe camera transition
→ Investigation

Graph
→ Entity focus transition
→ Entity Profile

Map
→ Location focus
→ Entity

Timeline
→ Event focus
→ Evidence
```

Transitions should feel connected rather than like unrelated page loads.

---

# 36. Data Density

ATLAS is an analytical application.

Do not sacrifice information density for aesthetics.

Users must be able to quickly find:

- Entity name
- Type
- Status
- Relationship
- Confidence
- Evidence
- Date
- Source
- Classification
- Investigation
- Finding

Use:

- Compact tables
- Smart panels
- Expandable details
- Filters
- Search
- Context drawers

---

# 37. Security UX

Frontend must respect the existing backend security model.

Never:

- Hide unauthorized data only visually
- Assume frontend role checks provide security
- Display restricted information
- Expose tokens
- Put secrets in client code

Frontend should consume the existing authorization state and display only what the backend allows.

Backend authorization remains authoritative.

---

# 38. API Preservation

Before and after the redesign verify:

- API URLs unchanged
- HTTP methods unchanged
- Request structures unchanged
- Response handling unchanged
- Authentication unchanged
- WebSocket endpoints unchanged
- Existing hooks/services remain functional

If refactoring frontend API access, preserve behavior exactly.

---

# 39. Testing

After implementation run:

```text
Lint
Typecheck
Unit Tests
Integration Tests
E2E Tests
Production Build
```

Then manually verify every major route:

```text
Command Center
Investigations
Investigation Workspace
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

Verify:

- Navigation
- Forms
- Search
- Filters
- Sorting
- Pagination
- Graph
- Map
- Timeline
- Evidence
- Reports
- AI
- Alerts
- Watchlists
- Realtime updates

---

# 40. Visual QA

Test at:

```text
1280 × 720
1440 × 900
1920 × 1080
2560 × 1440
3440 × 1440
```

Also test:

- Tablet
- Mobile

Look for:

- Overflow
- Incorrect spacing
- Broken panels
- Z-index issues
- Clipped 3D scenes
- Text collisions
- Unreadable labels
- Slow animations
- GPU-heavy scenes
- Broken camera controls

---

# 41. 3D Scene QA

For every 3D scene verify:

```text
Initial render
Resize
Fullscreen
Camera reset
Object selection
Hover
Click
Data update
Unmount
Remount
Route change
WebGL failure
Reduced motion
Mobile behavior
```

Ensure Three.js resources are correctly disposed.

---

# 42. Final Quality Gate

Do not consider the redesign complete if:

- Backend was modified
- API contracts changed
- Authentication broke
- Authorization behavior changed
- Existing data disappeared
- Existing functionality broke
- Production build fails
- Typecheck fails
- Critical frontend tests fail
- 3D scenes leak resources
- Mobile is unusable
- Accessibility is severely degraded

---

# 43. Final Deliverables

At completion provide:

```text
Frontend redesign complete

Pages redesigned:
- Command Center
- Investigations
- Intelligence
- Entities
- Graph
- Map
- Timeline
- Evidence
- Alerts
- Watchlists
- Reports
- Workflows
- AI Assistant
- Administration

3D systems:
- Globe
- Knowledge Graph
- Timeline
- Evidence Archive
- Radar
- Relationship Constellation
- Analytics
- Workflow Canvas

Responsive:
PASS / FAIL

Accessibility:
PASS / FAIL

Performance:
PASS / FAIL

Lint:
PASS / FAIL

Typecheck:
PASS / FAIL

Tests:
PASS / FAIL

Production Build:
PASS / FAIL

Backend Modified:
MUST BE NO

API Contracts Modified:
MUST BE NO
```

---

# FINAL COMMAND TO THE CODING AGENT

Build the complete ATLAS frontend transformation described above.

Work carefully through the existing frontend instead of blindly rewriting it.

Make the application feel like a premium, futuristic intelligence-analysis platform with advanced 3D visualization.

Every major page should have a distinct 3D centerpiece.

Use real backend data.

Preserve all existing functionality.

Do not create fake production intelligence.

Do not change the backend.

Do not change API contracts.

Do not change authentication.

Do not change authorization.

Do not change database logic.

Do not change server-side business logic.

Optimize every 3D scene for performance.

Provide 2D/accessibility fallbacks where necessary.

Finish with a complete frontend build, typecheck, lint, test, and visual QA pass.

**BACKEND = UNTOUCHED.**
**FRONTEND = FULL 3D TRANSFORMATION.**
**ATLAS = PREMIUM INTELLIGENCE COMMAND CENTER.**
