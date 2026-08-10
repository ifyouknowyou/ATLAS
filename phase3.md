# ATLAS — PHASE 3/7

## Graph & Geospatial Intelligence

You are continuing development of the ATLAS Intelligence Platform.

Act as a senior staff-level architect, frontend/3D engineer, geospatial engineer, data-visualization engineer, backend engineer, and security engineer.

**PHASE 1 and PHASE 2 are already complete.**

Implement **PHASE 3 ONLY**.

Do not automatically implement Phase 4, 5, 6, or 7.

---

# 1. READ THE EXISTING PROJECT

Before modifying anything, read:

```text
docs/ATLAS_7_PHASES.md
docs/PHASE_1_ARCHITECTURE.md
docs/PHASE_1_COMPLETE.md
docs/PHASE_2_ARCHITECTURE.md
docs/PHASE_2_API.md
docs/PHASE_2_SECURITY_AUDIT.md
docs/PHASE_2_COMPLETE.md
```

Then inspect the entire repository.

Understand the existing:

* frontend
* backend
* database
* authentication
* RBAC
* tenant isolation
* investigation system
* entity system
* relationship system
* evidence system
* activity system
* realtime architecture
* 3D architecture
* design system
* testing infrastructure

Extend the existing architecture.

Do NOT rewrite working Phase 1 or Phase 2 systems.

---

# 2. PHASE 3 OBJECTIVE

Transform ATLAS into a visual intelligence platform with:

```text
                 ATLAS VISUAL INTELLIGENCE

          ┌──────── KNOWLEDGE GRAPH ────────┐
          │                                  │
          │       ●────●────●               │
          │      /     │     \              │
          │     ●──────●──────●             │
          │            │                     │
          └────────────┼─────────────────────┘
                       │
                Investigation
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
      MAP           TIMELINE        ENTITIES
        │              │              │
        └──────────────┼──────────────┘
                       ▼
                3D INTELLIGENCE
                   ENVIRONMENT
```

Build:

* interactive knowledge graph
* graph exploration
* graph filtering
* graph clustering
* relationship visualization
* 3D globe
* geographic visualization
* map layers
* location entities
* timeline visualization
* synchronized graph/map/timeline
* investigation visual workspace
* advanced 3D interaction
* performance optimization

---

# 3. GRAPH ENGINE ARCHITECTURE

Create a dedicated graph visualization architecture.

Prefer a modular structure such as:

```text
src/
  features/
    graph/
      components/
      hooks/
      layouts/
      renderers/
      workers/
      algorithms/
      types/
      utils/
```

Separate:

```text
Graph Data
Graph State
Graph Algorithms
Graph Layout
Graph Rendering
Graph Interaction
Graph UI
```

Do not put graph logic inside page components.

---

# 4. GRAPH DATA MODEL

Use the existing:

```text
Entity
Relationship
Investigation
```

models.

Create a graph representation:

```text
GraphNode
GraphEdge
GraphCluster
GraphFilter
GraphSelection
GraphViewport
```

Nodes should contain:

```text
id
entityId
entityType
label
confidence
metadata
```

Edges should contain:

```text
id
relationshipId
source
target
type
direction
confidence
```

Never duplicate the authoritative entity/relationship records unnecessarily.

The graph should be a visualization layer over the existing data.

---

# 5. INTERACTIVE KNOWLEDGE GRAPH

Build a high-performance interactive graph.

Required:

* pan
* zoom
* node selection
* edge selection
* hover
* focus
* drag
* multi-select
* deselect
* center graph
* fit graph
* reset camera
* expand node
* collapse node
* hide node
* hide relationship
* isolate selected node
* neighborhood exploration

Use smooth transitions.

Avoid unnecessary animation.

---

# 6. GRAPH LAYOUTS

Support multiple layouts:

```text
FORCE
RADIAL
HIERARCHICAL
CIRCULAR
GRID
TIMELINE
GEOGRAPHIC
```

The user should be able to switch layouts without losing the current selection.

Create a layout abstraction so future algorithms can be added without rewriting the renderer.

---

# 7. FORCE-DIRECTED GRAPH

Implement a production-conscious force-directed layout.

Requirements:

* collision handling
* configurable spacing
* link distance
* node repulsion
* stabilization
* controlled simulation
* pause/resume
* deterministic option where useful

Do not allow the browser to perform excessive calculations for large graphs.

---

# 8. GRAPH WORKER

Move expensive graph calculations away from the main UI thread where appropriate.

Use:

```text
Web Workers
```

for expensive operations such as:

* graph layout
* filtering
* clustering
* large graph transformations

The UI must remain responsive.

Gracefully fall back when workers are unavailable.

---

# 9. GRAPH CLUSTERING

Implement basic graph clustering.

Support visual grouping based on:

* entity type
* relationship type
* connected components
* investigation
* geographic region where available

Clusters should be collapsible.

Example:

```text
        ┌───────────────┐
        │ ORGANIZATIONS │
        │      ● ● ●    │
        └───────┬───────┘
                │
          ┌─────▼─────┐
          │  PERSONS  │
          │   ● ● ●   │
          └───────────┘
```

Do not present clustering as proof of real-world association.

It is an analytical visualization.

---

# 10. GRAPH FILTER PANEL

Create an advanced graph control panel.

Filters:

```text
Entity Type
Relationship Type
Confidence
Investigation
Classification
Created Date
Updated Date
```

Additional controls:

```text
Show / Hide Labels
Show / Hide Relationships
Show / Hide Clusters
Show / Hide Low Confidence
Show / Hide Archived
```

Filters should update visualization efficiently.

Use debouncing where necessary.

---

# 11. GRAPH SEARCH

Implement graph search.

Search:

```text
Entity name
Entity ID
Entity type
Relationship type
Investigation
```

When a result is selected:

1. find the node
2. focus the camera
3. highlight the node
4. optionally highlight its immediate neighborhood
5. open the entity context panel

---

# 12. NEIGHBORHOOD EXPLORATION

When a user selects an entity, allow:

```text
1 hop
2 hops
3 hops
```

neighborhood exploration.

Example:

```text
Selected Entity
      │
      ├── 1 Hop
      │     ├── Entity A
      │     └── Entity B
      │
      └── 2 Hop
            ├── Entity C
            └── Entity D
```

Make the maximum depth configurable.

Protect the UI from explosive graph expansion.

Set reasonable limits.

---

# 13. PATH EXPLORATION

Implement a basic shortest-path visualization between two selected entities.

The user can:

```text
Select Entity A
Select Entity B
Find Path
```

Display:

```text
A ─── B ─── C ─── D
```

Highlight:

* path nodes
* path edges
* relationship types

Use existing graph relationships.

Do not imply that a graph path establishes causality or real-world intent.

---

# 14. GRAPH DETAILS PANEL

Selecting a node opens a contextual panel.

Show:

```text
Entity
Type
Confidence
Relationships
Connected entities
Investigation count
Evidence count
Last activity
```

Actions:

```text
Open Entity
Expand Neighborhood
Find Path
Add to Selection
Center View
```

Selecting an edge shows:

```text
Relationship Type
Direction
Confidence
Source Entity
Target Entity
Description
Created At
```

---

# 15. GRAPH MINIMAP

Add a small minimap/navigation overview for large graphs.

It should show:

* graph boundaries
* current viewport
* selected node
* clusters

Do not let the minimap consume excessive screen space.

---

# 16. 3D INTELLIGENCE GLOBE

Upgrade the Phase 1 globe into a major ATLAS visualization.

Use:

* Three.js
* React Three Fiber
* Drei

Create:

```text
src/features/globe/
```

with:

```text
components/
layers/
materials/
shaders/
hooks/
systems/
workers/
types/
```

Keep the globe independently lazy-loaded.

---

# 17. GLOBE VISUAL DESIGN

Create a sophisticated intelligence globe.

Include:

* high-quality Earth sphere
* subtle atmospheric shell
* night/day appearance if practical
* latitude/longitude grid
* stars/background
* subtle particles
* orbiting indicators
* location markers
* connection arcs
* selected-location highlighting

Avoid turning it into a flashy game.

The visual language should remain professional and analytical.

---

# 18. GEOGRAPHIC DATA

Extend the existing `LOCATION` entity support.

A location may contain:

```text
latitude
longitude
country
region
city
timezone
label
```

Validate latitude:

```text -90 to 90
```

Validate longitude:

```text -180 to 180
```

Do not trust client-side validation.

Validate server-side.

---

# 19. MAP VIEW

Create a dedicated:

```text
/map
```

route.

The map should support:

* pan
* zoom
* marker selection
* clustering
* search
* filters
* location details
* investigation filtering
* entity filtering

Use an appropriate mapping library based on the existing stack.

Do not introduce multiple mapping libraries unnecessarily.

---

# 20. MAP/GLOBE SYNCHRONIZATION

The map and globe must share a common visualization state.

For example:

```text
Select Location on Map
        ↓
Globe focuses location

Select Location on Globe
        ↓
Map focuses location
```

Also synchronize:

```text
Selected Entity
Selected Location
Selected Investigation
Filters
```

Do not duplicate state independently in multiple components.

---

# 21. GEOGRAPHIC CLUSTERING

When many points exist near each other:

* cluster markers
* show cluster counts
* expand cluster on zoom
* avoid rendering thousands of DOM elements

Use appropriate spatial indexing/clustering techniques.

---

# 22. CONNECTION ARCS

On the globe, visualize geographic relationships using animated arcs.

Examples:

```text
Location A ───────── Location B
```

Arc attributes may represent:

* relationship
* event
* investigation association

Do not imply that an arc represents physical movement unless the underlying data explicitly represents movement.

Use different visual treatment for different semantic meanings.

---

# 23. GLOBE INTERACTION

Implement:

```text
Rotate
Zoom
Pan where appropriate
Hover
Select
Focus
Reset
Search location
```

When a location/entity is selected:

* focus camera
* show information panel
* highlight related markers
* optionally highlight related arcs

Use smooth camera transitions.

---

# 24. GLOBE LAYERS

Create a layer manager.

Example:

```text
☑ Entities
☑ Locations
☑ Relationships
☑ Investigations
☐ Timeline Events
☐ Evidence Locations
☐ Connections
```

Each layer must be independently toggleable.

Architecture must allow future layers.

---

# 25. TIMELINE ENGINE

Create a dedicated:

```text
/timeline
```

visualization.

Use existing:

```text
TimelineEvent
ActivityEvent
Investigation
Entity
Evidence
```

where appropriate.

Create a chronological visualization.

---

# 26. TIMELINE FEATURES

Support:

* zoom
* pan
* date filtering
* event selection
* entity filtering
* investigation filtering
* event categories
* event density
* focus event
* event details

Example:

```text
2026
│
├────● Event A
│
│       ├──● Event B
│
├────────────● Event C
│
└────────────────● Event D
```

---

# 27. TIMELINE EVENT TYPES

Support:

```text
INVESTIGATION
ENTITY
RELATIONSHIP
EVIDENCE
NOTE
ACTIVITY
CUSTOM
```

Allow future event types without redesigning the component.

---

# 28. TIMELINE + GRAPH SYNCHRONIZATION

Selecting an event should be able to:

```text
Highlight related entities
Highlight related relationships
Focus relevant graph nodes
Open event details
```

Selecting an entity can filter the timeline to related events.

Maintain a shared intelligence visualization state.

---

# 29. UNIFIED INTELLIGENCE WORKSPACE

Create a new investigation visualization workspace.

Possible layout:

```text
┌─────────────────────────────────────────────────────────┐
│ Investigation Alpha                         ACTIVE ●    │
├──────────────┬──────────────────────────────┬───────────┤
│              │                              │           │
│ Intelligence│       GRAPH / GLOBE           │ Context   │
│ Controls     │                              │ Panel     │
│              │          ●────●              │           │
│ Filters      │         /      \             │ Entity    │
│ Layers       │        ●────────●            │ Details   │
│ Search       │                              │           │
│              │                              │           │
├──────────────┴──────────────────────────────┴───────────┤
│ Timeline                                                │
│ ─────●────────●────────────●──────────────●──────────── │
└─────────────────────────────────────────────────────────┘
```

Allow users to switch:

```text
Graph
Globe
Map
Timeline
Split View
```

---

# 30. SHARED VISUALIZATION STATE

Create a centralized visualization state.

It should manage:

```text
selectedEntity
selectedEntities
selectedRelationship
selectedLocation
selectedInvestigation
graphFilters
mapFilters
timelineFilters
globeLayers
graphLayout
viewport
cameraTarget
highlightedNodes
highlightedEdges
```

Avoid multiple competing global stores.

Keep state modular.

---

# 31. COMMAND BAR

Create an ATLAS intelligence command/search bar.

It should support navigation and visualization actions such as:

```text
Search entity
Search investigation
Find location
Open graph
Open globe
Open timeline
Focus selected entity
Reset visualization
```

Do NOT implement arbitrary code execution.

Keep it as a controlled application command system.

---

# 32. ADVANCED 3D DESIGN

The Phase 3 frontend must feel substantially more advanced than Phase 2.

Implement:

* depth-based panels
* subtle parallax
* spatial transitions
* animated graph nodes
* camera easing
* atmospheric globe
* particle field
* contextual overlays
* animated connection lines
* smooth state transitions
* intelligent loading states

Use motion selectively.

Do not sacrifice readability for visual effects.

---

# 33. 3D ACCESSIBILITY

Provide:

* 2D graph fallback
* list-based entity explorer
* keyboard selection
* keyboard navigation
* accessible labels
* reduced-motion mode
* non-WebGL fallback

No critical information may exist only inside the 3D scene.

---

# 34. GRAPH PERFORMANCE

Design for:

```text
100 nodes
500 nodes
1,000 nodes
5,000+ nodes
```

Do not attempt to render all 5,000 nodes with expensive effects simultaneously.

Implement:

* level of detail
* progressive rendering
* clustering
* viewport culling where appropriate
* node limits
* lazy relationship expansion
* Web Workers
* efficient geometry
* instancing where appropriate

For large graphs, initially show an overview and allow controlled expansion.

---

# 35. GLOBE PERFORMANCE

Implement:

* lazy loading
* efficient geometries
* instanced markers where appropriate
* limited particles
* resource disposal
* texture optimization
* responsive rendering
* device capability checks
* reduced effects on low-power devices

Do not load unnecessarily large Earth datasets.

---

# 36. DATA FETCHING

Do not fetch the entire organization's graph by default.

Use APIs such as:

```text
GET /investigations/:id/graph
GET /investigations/:id/entities
GET /investigations/:id/relationships
GET /investigations/:id/timeline
GET /map/entities
```

Use:

* pagination
* filtering
* bounding-box queries for geographic data
* relationship-depth parameters
* server-side filtering

Never allow unrestricted graph expansion through a single request.

---

# 37. GEOSPATIAL QUERY FOUNDATION

Create support for geographic queries such as:

```text
near location
within bounding box
within radius
```

Use the database's geospatial capabilities if already available.

If introducing PostGIS, do so deliberately and document the migration.

Do not duplicate geographic data unnecessarily.

---

# 38. API SECURITY

Every graph/map/timeline endpoint must enforce:

```text
authentication
organization authorization
workspace authorization
investigation authorization
classification restrictions
```

Never allow:

```text
GET /entities/:id
```

to bypass tenant or workspace authorization.

The same security rules must apply to:

* graph endpoints
* map endpoints
* timeline endpoints
* search endpoints
* relationship endpoints

---

# 39. SECURITY TESTING

Perform a dedicated Phase 3 security audit.

Test:

```text
BOLA / IDOR
tenant escape
workspace escape
classification bypass
graph data leakage
map data leakage
timeline leakage
unauthorized relationship traversal
excessive data exposure
query parameter manipulation
resource exhaustion
large graph requests
large geographic queries
WebSocket authorization
```

Especially test:

```text
User A requests graph belonging to User B
User changes investigationId manually
User requests entities outside their workspace
User requests hidden/restricted locations
User increases graph depth beyond allowed limit
User requests enormous geographic bounding box
User subscribes to another investigation's realtime events
```

Fix confirmed vulnerabilities.

---

# 40. BUSINESS LOGIC TESTING

Verify:

```text
Can a Viewer modify graph data?
Can an archived investigation appear as active?
Can a deleted entity remain visible through graph cache?
Can a deleted relationship remain in visualization?
Can unauthorized evidence appear on a timeline?
Can a restricted entity be discovered through search?
Can filters reveal hidden entities?
Can map clustering expose restricted locations?
Can graph expansion bypass investigation permissions?
```

The visualization layer must never become an authorization bypass.

---

# 41. REALTIME GRAPH UPDATES

Extend Phase 2 realtime events.

When authorized changes occur:

```text
entity.created
entity.updated
entity.deleted

relationship.created
relationship.updated
relationship.deleted

location.updated
timeline.created
timeline.updated
```

The visualization should update without unnecessarily rebuilding the entire graph.

Only send events to authorized clients.

---

# 42. CACHING

Implement appropriate caching for:

* graph data
* entity summaries
* map data
* timeline data

Invalidate caches correctly after mutations.

Do not allow stale private data to leak between users/workspaces.

---

# 43. FRONTEND ROUTES

Implement:

```text
/graph
/map
/timeline
/investigations/:id/graph
/investigations/:id/map
/investigations/:id/timeline
```

Also integrate these into the investigation workspace.

---

# 44. ERROR & LOADING STATES

Every visualization must handle:

```text
loading
empty
partial data
network error
authorization error
WebGL unavailable
large dataset
invalid geographic data
```

Create intelligent loading states rather than generic spinners everywhere.

Example:

```text
BUILDING INTELLIGENCE GRAPH
Loading 184 entities
Resolving 327 relationships
```

Do not expose internal technical errors to users.

---

# 45. DEMO DATA

Expand fictional demo data to properly exercise:

```text
100+ entities
200+ relationships
20+ locations
50+ timeline events
```

Include different entity types and relationship types.

Create several geographically separated fictional locations.

Use fictional data only.

---

# 46. DOCUMENTATION

Create:

```text
docs/PHASE_3_ARCHITECTURE.md
docs/PHASE_3_GRAPH_ENGINE.md
docs/PHASE_3_GEOSPATIAL.md
docs/PHASE_3_API.md
docs/PHASE_3_SECURITY_AUDIT.md
docs/PHASE_3_COMPLETE.md
```

Document:

* graph architecture
* graph algorithms
* rendering architecture
* worker architecture
* globe architecture
* map architecture
* timeline architecture
* synchronization model
* API endpoints
* geospatial strategy
* performance strategy
* security findings
* resolved bugs
* Phase 4 preparation

---

# 47. TESTING

Add tests for:

### Graph

```text
node transformation
edge transformation
filtering
clustering
path calculation
neighborhood limits
authorization
```

### Geographic

```text
latitude validation
longitude validation
bounding box
radius filtering
authorization
```

### Timeline

```text
event ordering
date filtering
entity filtering
authorization
```

### Visualization state

```text
selection
filter synchronization
graph/map synchronization
timeline synchronization
reset behavior
```

### API

```text
tenant isolation
workspace isolation
investigation authorization
pagination
depth limits
large-query protection
```

---

# 48. PERFORMANCE TESTING

Test with:

```text
100 entities
500 entities
1,000 entities
5,000 entities
```

Measure:

* initial load
* graph stabilization
* filter response
* node selection
* camera movement
* map rendering
* timeline rendering
* memory usage

Do not claim a performance target passed unless it was actually measured.

Optimize confirmed bottlenecks.

---

# 49. RESPONSIVE DESIGN

Verify:

```text
1280px
1440px
1920px
2560px+
tablet
mobile
```

Large desktop:

* visualization should dominate available space
* controls should remain compact
* context panel should remain usable
* no excessive blank margins

Mobile:

* use bottom sheets/drawers
* switch complex split views to tabs
* preserve search/filter functionality
* provide 2D fallback where 3D is impractical

---

# 50. FINAL PHASE 3 VERIFICATION

Run:

```text
lint
typecheck
unit tests
integration tests
frontend tests
production build
```

Then manually verify:

```text
[ ] Knowledge graph loads
[ ] Graph zoom/pan works
[ ] Node selection works
[ ] Edge selection works
[ ] Graph layouts work
[ ] Graph filtering works
[ ] Clustering works
[ ] Neighborhood exploration works
[ ] Path exploration works
[ ] Graph search works
[ ] Graph minimap works

[ ] 3D globe loads
[ ] Globe interaction works
[ ] Location selection works
[ ] Globe layers work
[ ] Connection arcs work
[ ] Map loads
[ ] Map clustering works
[ ] Map/globe synchronization works

[ ] Timeline loads
[ ] Timeline filtering works
[ ] Timeline selection works
[ ] Timeline/graph synchronization works

[ ] Investigation visualization works
[ ] Shared visualization state works
[ ] Realtime updates work
[ ] WebGL fallback works
[ ] Accessibility works
[ ] Reduced motion works
[ ] Desktop layout works
[ ] Mobile layout works

[ ] Tenant isolation verified
[ ] RBAC verified
[ ] BOLA/IDOR tests passed
[ ] Large graph requests protected
[ ] Large geographic queries protected
[ ] No sensitive data leakage
[ ] No console errors
[ ] No runtime errors
```

Do not disable tests to achieve a green build.

Fix the underlying issue.

---

# 51. FINAL PHASE REPORT

Create:

```text
docs/PHASE_3_COMPLETE.md
```

Include:

* implemented features
* files changed
* database changes
* API changes
* graph architecture
* globe architecture
* map architecture
* timeline architecture
* visualization state
* performance optimizations
* security audit
* tests
* known limitations
* Phase 4 preparation

Finally output:

```text
========================================
       ATLAS PHASE 3 COMPLETE
========================================

GRAPH ENGINE:             READY
GRAPH EXPLORATION:        READY
GRAPH FILTERING:          READY
GRAPH CLUSTERING:         READY
PATH EXPLORATION:         READY

3D GLOBE:                 READY
GEOLOCATION:              READY
MAP ENGINE:               READY
MAP/GLOBE SYNC:           READY

TIMELINE:                 READY
GRAPH/TIMELINE SYNC:      READY

3D INTERACTION:           READY
PERFORMANCE:              VERIFIED
REALTIME UPDATES:         READY

RBAC:                     VERIFIED
TENANT ISOLATION:         VERIFIED
SECURITY AUDIT:           PASSED

UNIT TESTS:               PASSED
INTEGRATION TESTS:        PASSED
FRONTEND TESTS:           PASSED
TYPECHECK:                PASSED
PRODUCTION BUILD:         PASSED

NEXT:
PHASE 4 — AI Intelligence Engine
========================================
```

STOP after Phase 3.

Do not automatically start Phase 4.
