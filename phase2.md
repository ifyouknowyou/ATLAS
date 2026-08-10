# ATLAS — PHASE 2/7

## Investigation & Entity Intelligence

You are continuing the ATLAS project from **Phase 1**.

Act as a senior staff-level full-stack engineer, security architect, database engineer, UX designer, and intelligence-platform architect.

**PHASE 1 IS ALREADY IMPLEMENTED.**

Your job is to implement **PHASE 2 ONLY**.

Do not skip ahead to Phase 3, 4, 5, 6, or 7.

---

# 1. READ THE EXISTING PROJECT FIRST

Before modifying anything:

Read:

```text
docs/ATLAS_7_PHASES.md
docs/PHASE_1_ARCHITECTURE.md
docs/PHASE_1_COMPLETE.md
```

Then inspect the complete repository.

Understand:

* existing architecture
* database schema
* authentication
* RBAC
* organization/workspace isolation
* API conventions
* frontend architecture
* design system
* 3D engine
* state management
* testing infrastructure

Do NOT rewrite working Phase 1 infrastructure.

Extend it cleanly.

---

# 2. PHASE 2 OBJECTIVE

Transform ATLAS from a foundation into a functional:

# INVESTIGATION & ENTITY INTELLIGENCE WORKSPACE

Users must be able to create investigations and organize:

```text
Investigation
    │
    ├── Entities
    │
    ├── Relationships
    │
    ├── Evidence
    │
    ├── Notes
    │
    ├── Timeline
    │
    ├── Tasks
    │
    └── Activity
```

Phase 2 focuses on:

* investigations
* entities
* relationships
* evidence metadata
* notes
* investigation members
* tasks
* activity
* entity profiles
* investigation dashboard
* advanced frontend UX

Do NOT build the advanced graph engine yet.

Do NOT build the AI reasoning engine yet.

Do NOT build advanced geospatial intelligence yet.

Those belong to later phases.

---

# 3. INVESTIGATION MANAGEMENT

Implement complete investigation CRUD.

Users with appropriate permissions can:

```text
Create
View
Update
Archive
Restore
```

an investigation.

Investigation fields:

```text
id
organizationId
workspaceId
title
description
status
priority
classification
ownerId
createdBy
createdAt
updatedAt
archivedAt
```

Statuses:

```text
DRAFT
ACTIVE
PAUSED
COMPLETED
ARCHIVED
```

Priorities:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Classification:

```text
PUBLIC
INTERNAL
CONFIDENTIAL
RESTRICTED
```

Do not implement classification as a cosmetic frontend field.

Use it as a foundation for future access-control policies.

---

# 4. INVESTIGATION DASHBOARD

Create a sophisticated investigation workspace.

Example:

```text
┌──────────────────────────────────────────────────────┐
│ Investigation Alpha                    ACTIVE ●       │
│ Intelligence investigation                            │
├──────────────────────────────────────────────────────┤
│ Overview │ Entities │ Evidence │ Timeline │ Notes    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Entities       Relationships       Evidence         │
│    42                67                 128           │
│                                                      │
│ ┌─────────────────────┐ ┌──────────────────────────┐ │
│ │ Investigation Graph │ │ Recent Activity          │ │
│ │                     │ │                          │ │
│ │       ●────●        │ │ Entity added             │ │
│ │      /      \       │ │ Evidence uploaded       │ │
│ │     ●────────●      │ │ Investigation updated   │ │
│ │                     │ │                          │ │
│ └─────────────────────┘ └──────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

The graph visualization in Phase 2 can be a lightweight preview.

The full graph engine belongs to Phase 3.

---

# 5. INVESTIGATION LIST

Build a professional investigation browser.

Features:

* search
* filtering
* sorting
* status filtering
* priority filtering
* owner filtering
* pagination
* table/list view
* compact card view
* recently viewed
* favorites
* archived investigations

Large desktop screens should use the available viewport intelligently.

Avoid excessive whitespace.

---

# 6. ENTITY SYSTEM

Implement the core entity system.

Supported entity types:

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

Entity fields should include:

```text
id
organizationId
workspaceId
type
name
displayName
description
status
confidence
metadata
createdBy
createdAt
updatedAt
```

Use structured metadata where possible.

Avoid putting the entire entity model into an uncontrolled JSON blob.

Use typed fields for commonly queried data.

---

# 7. ENTITY CRUD

Implement:

```text
Create entity
View entity
Update entity
Archive entity
Restore entity
Delete entity where authorized
```

Implement proper authorization.

Users must never be able to access entities from another organization/workspace by modifying an ID in a request.

Always resolve authorization server-side.

---

# 8. ENTITY PROFILE PAGE

Create an advanced entity profile.

Example:

```text
ENTITY

┌──────────────────────────────────────────────┐
│ ● PERSON                                     │
│ Alex Example                                 │
│ Confidence: 87%                              │
├──────────────────────────────────────────────┤
│ Overview                                     │
│ Attributes                                   │
│ Relationships                                │
│ Investigations                               │
│ Evidence                                     │
│ Timeline                                     │
│ Activity                                     │
└──────────────────────────────────────────────┘
```

Include:

### Identity header

* entity type
* name
* status
* confidence
* classification
* created/updated timestamps

### Attributes

Display structured metadata in a readable interface.

### Relationships

Show related entities.

### Investigations

Show investigations containing this entity.

### Evidence

Show evidence associated with this entity.

### Timeline

Show entity-related events.

### Activity

Show changes made to the entity.

---

# 9. ENTITY CONFIDENCE

Create a confidence model.

Use:

```text
0–20     VERY_LOW
21–40    LOW
41–60    MEDIUM
61–80    HIGH
81–100   VERY_HIGH
```

Do not present confidence as absolute truth.

The UI must clearly communicate that confidence represents an analytical assessment.

---

# 10. RELATIONSHIP SYSTEM

Implement relationship CRUD.

Relationship fields:

```text
id
organizationId
workspaceId
investigationId
sourceEntityId
targetEntityId
type
direction
confidence
description
metadata
createdBy
createdAt
updatedAt
```

Relationship types should be extensible.

Initial types:

```text
ASSOCIATED_WITH
OWNS
WORKS_FOR
LOCATED_AT
USES
CONTROLS
CONNECTED_TO
MEMBER_OF
RELATED_TO
OBSERVED_WITH
CUSTOM
```

Support:

```text
DIRECTED
UNDIRECTED
```

relationships.

Prevent invalid self relationships unless explicitly supported.

Prevent cross-tenant relationships.

Add appropriate database indexes.

---

# 11. RELATIONSHIP UI

Create a relationship creation interface:

```text
Source Entity
      ↓
Relationship Type
      ↓
Target Entity
      ↓
Confidence
      ↓
Description
```

Use searchable entity selectors.

Do not require users to manually type entity IDs.

---

# 12. EVIDENCE FOUNDATION

Implement an evidence metadata system.

This phase does NOT need advanced file-processing pipelines.

Create:

```text
Evidence
```

with:

```text
id
organizationId
workspaceId
investigationId
title
description
type
source
classification
hash
mimeType
size
status
collectedAt
createdBy
createdAt
updatedAt
```

Evidence types:

```text
DOCUMENT
IMAGE
VIDEO
AUDIO
ARCHIVE
WEB_ARTIFACT
LOG
DATASET
OTHER
```

Statuses:

```text
PENDING
AVAILABLE
ARCHIVED
RESTRICTED
```

---

# 13. EVIDENCE INTEGRITY

Prepare evidence for future chain-of-custody support.

Implement:

* SHA-256 hash field
* immutable creation metadata
* uploader identity
* timestamps
* audit events
* classification
* evidence status

Do not fake cryptographic verification.

If a hash is supplied, validate its format.

Future phases can add complete evidence processing.

---

# 14. EVIDENCE UI

Create an evidence workspace:

```text
Evidence
├── All
├── Documents
├── Images
├── Logs
├── Web Artifacts
└── Other
```

Features:

* search
* filter
* sorting
* metadata view
* linked entities
* linked investigations
* activity history

Do not implement arbitrary internet scraping.

---

# 15. NOTES SYSTEM

Implement investigation notes.

Fields:

```text
id
organizationId
workspaceId
investigationId
authorId
title
content
visibility
createdAt
updatedAt
```

Visibility:

```text
INVESTIGATION
PRIVATE
```

Implement:

* create
* edit
* delete
* search
* author information
* timestamps
* activity logging

Do not build a huge document editor yet.

Keep the editor extensible.

---

# 16. INVESTIGATION MEMBERS

Allow authorized users to manage investigation membership.

Roles:

```text
LEAD
ANALYST
CONTRIBUTOR
VIEWER
```

Implement:

* add member
* remove member
* change investigation role
* list members

Enforce organization membership first.

A user cannot be added to an investigation if they do not belong to the parent organization/workspace.

---

# 17. INVESTIGATION TASKS

Create lightweight investigation tasks.

Fields:

```text
id
investigationId
title
description
status
priority
assigneeId
createdBy
dueAt
createdAt
updatedAt
```

Statuses:

```text
TODO
IN_PROGRESS
BLOCKED
DONE
```

Build a simple task board/list.

Do not build a full project-management system.

---

# 18. ACTIVITY STREAM

Extend the Phase 1 audit/activity foundation.

Investigation activity should include:

```text
Investigation created
Investigation updated
Entity created
Entity updated
Relationship created
Relationship removed
Evidence added
Note created
Task created
Task completed
Member added
Member removed
```

Create an investigation-specific activity stream.

---

# 19. SEARCH

Implement unified investigation search.

Search across:

```text
Investigations
Entities
Relationships
Evidence
Notes
Tasks
```

Use appropriate database indexes.

Do not perform inefficient full-table scans for every keystroke.

Use debounced frontend search.

Keep the architecture ready for semantic search in Phase 4.

---

# 20. FILTERING & QUERY STATE

Frontend filtering must support:

```text
status
type
priority
confidence
classification
owner
date
```

Use URL/search parameters where appropriate so investigation views are shareable.

Do not store critical query state only in local component state.

---

# 21. ADVANCED FRONTEND DESIGN

Phase 2 should significantly expand the ATLAS visual system.

Create a professional intelligence-interface aesthetic.

Use:

* layered panels
* subtle glass surfaces
* technical grids
* depth
* fine borders
* restrained glow
* motion
* data density
* clear hierarchy
* command-center styling

Avoid:

* excessive gradients
* generic SaaS cards
* excessive rounded containers
* huge empty spaces
* repetitive components
* flashy animation that harms usability

---

# 22. INVESTIGATION 3D EXPERIENCE

Extend the Phase 1 3D environment.

Create an investigation visualization mode.

The scene should show:

```text
Investigation
     │
     ├── Entity ●
     │      │
     │      ├──── Entity ●
     │      │
     │      └──── Entity ●
     │
     └── Entity ●
```

Use:

* nodes
* relationship lines
* hover states
* selection
* focus camera
* smooth transitions
* entity type indicators
* confidence visualization

This is a **preview visualization**.

Do NOT implement the full Phase 3 graph engine.

---

# 23. 3D INTERACTION

Implement:

```text
Hover entity
Click entity
Focus entity
Reset camera
Zoom
Pan
Rotate
Hide/show labels
```

Selecting an entity should open its contextual information panel.

Do not force users to navigate away from the investigation.

---

# 24. ENTITY CONTEXT PANEL

When an entity is selected in the visualization:

```text
┌──────────────────────────┐
│ PERSON                   │
│ Alex Example             │
│                          │
│ Confidence      87%      │
│ Relationships    12      │
│ Evidence         8       │
│                          │
│ [Open Entity]            │
│ [View Relationships]     │
└──────────────────────────┘
```

Use smooth motion.

Support keyboard accessibility.

Provide a non-3D alternative.

---

# 25. RESPONSIVE DESIGN

Verify:

```text
1280px
1440px
1920px
2560px+
tablet
mobile
```

Desktop:

* investigation workspace should use available width
* graph/3D area should expand
* sidebar should remain stable
* information panels should not become unnecessarily narrow

Mobile:

* convert side panels into drawers
* make tables horizontally scrollable where required
* preserve important actions
* do not simply shrink desktop layouts

---

# 26. API ARCHITECTURE

Implement clean APIs for:

```text
/investigations
/investigations/:id
/investigations/:id/members
/investigations/:id/activity
/investigations/:id/tasks

/entities
/entities/:id

/relationships
/relationships/:id

/evidence
/evidence/:id

/notes
/notes/:id
```

Use consistent:

```text
validation
authentication
authorization
pagination
sorting
filtering
error handling
```

Do not expose database internals directly.

---

# 27. AUTHORIZATION MATRIX

Ensure permissions are enforced server-side.

Examples:

```text
Viewer
  → read permitted investigation data
  → cannot modify

Contributor
  → read
  → create/update allowed investigation data

Analyst
  → broader investigation operations

Lead
  → investigation management

Admin/Owner
  → organization/workspace-level administration
```

Do not assume a frontend-hidden button equals authorization.

Every mutation must be protected by backend authorization.

---

# 28. DATABASE SECURITY

Verify:

* tenant isolation
* workspace isolation
* foreign-key integrity
* cascade behavior
* unique constraints
* indexes
* authorization-aware queries

Never fetch a record by ID first and check permissions later if that can be avoided.

Prefer scoped queries such as:

```text
organizationId + workspaceId + resourceId
```

where appropriate.

---

# 29. REALTIME ACTIVITY

Extend the Phase 1 realtime foundation.

When supported by the existing architecture, investigation changes should generate realtime events.

Examples:

```text
entity.created
entity.updated
relationship.created
evidence.created
note.created
task.updated
member.updated
```

Only broadcast data the receiving user is authorized to see.

Never broadcast private data globally.

---

# 30. SECURITY REQUIREMENTS

Audit Phase 2 for:

* IDOR/BOLA
* broken access control
* tenant isolation failures
* mass assignment
* unsafe metadata
* injection
* XSS
* CSRF
* unauthorized file metadata access
* privilege escalation
* insecure direct object references
* sensitive data leakage
* unsafe error messages

Especially test:

```text
User A organization → User B resource
Viewer → mutation endpoint
Contributor → admin endpoint
Removed member → old investigation
Archived resource → unauthorized access
Cross-workspace entity relationship
```

Fix all confirmed issues.

---

# 31. TESTING

Add tests for:

### Investigation

```text
create
read
update
archive
authorization
tenant isolation
```

### Entities

```text
CRUD
authorization
tenant isolation
validation
```

### Relationships

```text
create
delete
cross-tenant prevention
self-reference validation
authorization
```

### Evidence

```text
metadata validation
hash validation
authorization
```

### Notes

```text
visibility
authorization
CRUD
```

### Members

```text
organization membership
role changes
removal
authorization
```

### Tasks

```text
assignment
status changes
authorization
```

### Frontend

Test:

* navigation
* investigation creation
* entity creation
* entity profile
* filtering
* contextual panel
* responsive layout
* permission-aware UI

---

# 32. PERFORMANCE

Do not load an entire investigation dataset into the browser.

Use:

* pagination
* selective queries
* indexed database access
* lazy loading
* debounced search
* virtualization where appropriate
* dynamic imports
* 3D lazy loading

The investigation overview must remain responsive with thousands of records.

---

# 33. DATA INTEGRITY

Implement validation for:

* required fields
* enum values
* confidence range 0–100
* valid relationship endpoints
* valid dates
* valid classification
* valid IDs
* ownership boundaries

Never trust frontend validation.

Validate again on the server.

---

# 34. DEMO DATA

Expand the Phase 1 fictional demo dataset.

Create:

```text
3 investigations

20–30 fictional entities

25–40 fictional relationships

10–20 fictional evidence records

10+ notes

10+ tasks

activity history
```

All data must be fictional.

Do not use real people's private information.

---

# 35. DO NOT IMPLEMENT YET

Do NOT implement:

```text
Advanced graph algorithms
Advanced GIS
3D globe intelligence layers
AI research agent
RAG
Vector database
Knowledge graph reasoning
Automated intelligence collection
Advanced scraping
Automated report generation
Full collaboration engine
Advanced workflow automation
Production deployment hardening
```

Those belong to later phases.

---

# 36. FINAL SECURITY & BUG AUDIT

Before completion, perform a Phase 2 audit.

Look specifically for the top web application problems:

```text
Broken Access Control
IDOR/BOLA
Authentication failures
Injection
XSS
CSRF
Security misconfiguration
Sensitive data exposure
Mass assignment
Race conditions
Business logic flaws
```

Also test business logic such as:

```text
Can a Viewer modify an investigation?
Can a removed member still access it?
Can a user create a relationship across organizations?
Can an entity from another workspace be attached?
Can a user modify another user's private note?
Can an unauthorized user access evidence metadata?
Can an archived investigation still be modified?
Can a user manipulate confidence outside 0–100?
Can a user assign a task to someone outside the workspace?
Can a client-side organizationId bypass server authorization?
```

Fix every confirmed vulnerability.

---

# 37. FINAL VERIFICATION

Run:

```text
lint
typecheck
unit tests
integration tests
frontend tests
database migration validation
production build
```

Then manually verify:

```text
[ ] Investigation CRUD
[ ] Investigation dashboard
[ ] Investigation filtering
[ ] Entity CRUD
[ ] Entity profile
[ ] Relationship CRUD
[ ] Evidence metadata
[ ] Notes
[ ] Investigation members
[ ] Tasks
[ ] Activity stream
[ ] Search
[ ] RBAC
[ ] Tenant isolation
[ ] Realtime activity
[ ] 3D investigation preview
[ ] Entity selection
[ ] Context panel
[ ] Desktop layout
[ ] Tablet layout
[ ] Mobile layout
[ ] No console errors
[ ] No runtime errors
[ ] No authorization bypass
[ ] No sensitive information leakage
```

Do not disable failing tests to make the build pass.

Fix the underlying problems.

---

# 38. DOCUMENTATION

Create:

```text
docs/PHASE_2_ARCHITECTURE.md
docs/PHASE_2_API.md
docs/PHASE_2_SECURITY_AUDIT.md
docs/PHASE_2_COMPLETE.md
```

Document:

* architecture changes
* database changes
* API endpoints
* permissions
* entity model
* relationship model
* investigation model
* evidence model
* frontend routes
* 3D architecture
* realtime events
* tests
* security findings
* resolved bugs
* known limitations
* Phase 3 preparation

---

# 39. PHASE 2 COMPLETION REPORT

At the end, output:

```text
========================================
       ATLAS PHASE 2 COMPLETE
========================================

INVESTIGATIONS:       READY
ENTITIES:             READY
RELATIONSHIPS:        READY
EVIDENCE:             READY
NOTES:                READY
TASKS:                READY
MEMBERS:              READY
ACTIVITY:             READY
SEARCH:               READY
RBAC:                 VERIFIED
TENANT ISOLATION:     VERIFIED
REALTIME FOUNDATION:  READY
3D PREVIEW:           READY

SECURITY AUDIT:       PASSED
UNIT TESTS:           PASSED
INTEGRATION TESTS:    PASSED
FRONTEND TESTS:       PASSED
TYPECHECK:             PASSED
PRODUCTION BUILD:     PASSED

NEXT PHASE:
PHASE 3 — Graph & Geospatial Intelligence
========================================
```

STOP after Phase 2.

Do not automatically begin Phase 3.
