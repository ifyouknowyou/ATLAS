# ATLAS — PHASE 5/7

## Evidence Intelligence, Reports & Real-Time Collaboration

You are continuing development of the ATLAS Intelligence Platform.

Act as a senior staff-level full-stack architect, security engineer, digital-evidence architect, collaboration-system engineer, document-generation engineer, AI product engineer, and advanced frontend/3D UX engineer.

**PHASE 1, PHASE 2, PHASE 3, and PHASE 4 are already complete.**

Implement **PHASE 5 ONLY**.

Do not automatically implement Phase 6 or Phase 7.

ATLAS must remain a lawful, authorized intelligence and investigation platform. Evidence and collaboration features must respect user permissions, workspace boundaries, classification, and privacy.

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

docs/PHASE_3_ARCHITECTURE.md
docs/PHASE_3_GRAPH_ENGINE.md
docs/PHASE_3_GEOSPATIAL.md
docs/PHASE_3_API.md
docs/PHASE_3_SECURITY_AUDIT.md
docs/PHASE_3_COMPLETE.md

docs/PHASE_4_ARCHITECTURE.md
docs/PHASE_4_AI_ENGINE.md
docs/PHASE_4_RAG.md
docs/PHASE_4_TOOLS.md
docs/PHASE_4_API.md
docs/PHASE_4_SECURITY_AUDIT.md
docs/PHASE_4_COMPLETE.md
```

Then inspect the entire repository.

Understand and preserve:

* authentication
* RBAC
* tenant isolation
* investigation system
* entity system
* relationship system
* evidence foundation
* graph engine
* map/globe
* timeline
* AI engine
* RAG
* AI tools
* realtime architecture
* frontend design system
* testing architecture

Do not rewrite working infrastructure.

Extend it.

---

# 2. PHASE 5 OBJECTIVE

Turn ATLAS into a complete:

# EVIDENCE + REPORTING + COLLABORATION PLATFORM

The architecture should become:

```text
                         ATLAS
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
     Evidence           Analysis         Collaboration
        │                  │                  │
        ▼                  ▼                  ▼
   Evidence Vault      AI Engine          Realtime
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ▼
                    Report Builder
                           │
                           ▼
                    Review / Approval
                           │
                           ▼
                     Final Report
```

Build:

* evidence vault
* secure evidence ingestion
* evidence metadata
* evidence versioning
* evidence relationships
* evidence integrity
* chain-of-custody foundation
* evidence preview
* evidence annotations
* report builder
* report templates
* AI-assisted report generation
* report citations
* report review
* report approval
* report versioning
* PDF/export foundation
* real-time collaboration
* comments
* mentions
* presence
* activity
* notifications
* investigation sharing
* collaboration permissions

---

# 3. EVIDENCE VAULT

Create a dedicated:

```text
/evidence
```

workspace.

Design it as an intelligence evidence repository rather than a generic file manager.

Main areas:

```text
Evidence
├── All Evidence
├── Documents
├── Images
├── Video
├── Audio
├── Web Artifacts
├── Logs
├── Datasets
├── Restricted
└── Archived
```

Support:

* search
* filtering
* sorting
* pagination
* classification filtering
* investigation filtering
* entity filtering
* uploader filtering
* date filtering
* evidence status
* integrity status

---

# 4. SECURE EVIDENCE INGESTION

Implement a secure upload architecture.

Use:

```text
Client
  ↓
Upload Authorization
  ↓
Signed Upload / Controlled Upload
  ↓
Storage
  ↓
Validation
  ↓
Hashing
  ↓
Metadata
  ↓
Evidence Record
```

Do not trust client-provided:

* MIME type
* file size
* filename
* extension
* hash
* classification
* ownership

Validate server-side.

---

# 5. FILE VALIDATION

Implement safe validation for uploaded files.

Validate:

```text
size
extension
MIME type
content signature where appropriate
filename
path handling
```

Prevent:

* path traversal
* executable uploads
* dangerous file types where not supported
* malformed metadata
* oversized uploads
* filename injection
* archive bombs
* resource exhaustion

Do not execute uploaded files.

Do not render untrusted HTML directly.

---

# 6. STORAGE ABSTRACTION

Create a storage abstraction:

```text
StorageProvider
    ├── LocalDevelopmentStorage
    ├── S3CompatibleStorage
    └── TestStorage
```

The application should not be tightly coupled to a single storage vendor.

Store files outside the application source tree.

Use environment configuration for storage credentials.

Never expose storage credentials to the browser.

---

# 7. EVIDENCE HASHING

For uploaded evidence:

* calculate SHA-256
* store hash
* store file size
* store creation timestamp
* store uploader
* store storage reference

Example:

```text
Evidence Integrity

SHA-256
a8f4...c93d

Size
4.8 MB

Uploaded
2026-08-11 14:32

Integrity
VERIFIED
```

Do not claim a file is authentic merely because its hash is valid.

The hash verifies integrity against the recorded value.

---

# 8. EVIDENCE VERSIONING

Implement evidence versions.

Model:

```text
Evidence
   │
   ├── Version 1
   ├── Version 2
   └── Version 3
```

Track:

```text
version
hash
size
storageReference
createdBy
createdAt
reason
```

Do not overwrite immutable evidence content silently.

---

# 9. EVIDENCE CHAIN-OF-CUSTODY FOUNDATION

Create a chain-of-custody event model.

Events:

```text
COLLECTED
UPLOADED
REGISTERED
VIEWED
DOWNLOADED
ANNOTATED
CLASSIFIED
VERSION_CREATED
MOVED
ARCHIVED
RESTORED
```

Track:

```text
actor
timestamp
action
evidenceId
versionId
safe metadata
```

Do not log passwords, tokens, secrets, or unnecessary sensitive information.

Do not claim legal admissibility.

Present this as an application-level audit trail.

---

# 10. EVIDENCE ACCESS CONTROL

Every evidence operation must verify:

```text
organization
workspace
investigation
classification
membership
role
resource permission
```

Protect:

```text
view
download
preview
annotate
edit metadata
change classification
archive
restore
delete
```

Never rely on hidden frontend buttons.

---

# 11. EVIDENCE CLASSIFICATION

Support:

```text
PUBLIC
INTERNAL
CONFIDENTIAL
RESTRICTED
```

Classification must affect access.

Do not allow a user to lower classification without permission.

Audit every classification change.

---

# 12. EVIDENCE PREVIEW

Create a secure evidence viewer.

Support safe preview for:

* images
* PDFs
* text
* supported documents
* supported audio/video

Use sandboxed rendering where appropriate.

Do not directly execute arbitrary uploaded content.

For unsupported files:

```text
Preview unavailable
Download permitted according to your permissions.
```

---

# 13. EVIDENCE IMAGE VIEWER

For images implement:

* zoom
* pan
* rotate
* fit
* fullscreen
* metadata panel
* annotations

Do not modify the original evidence file.

Annotations must exist as separate records.

---

# 14. EVIDENCE DOCUMENT VIEWER

For supported documents:

* page navigation
* zoom
* search where supported
* metadata
* citations
* annotations

Do not expose internal storage URLs.

Use authorized temporary access or equivalent secure delivery.

---

# 15. EVIDENCE ANNOTATIONS

Create annotations.

Support:

```text
HIGHLIGHT
COMMENT
TAG
REGION
BOOKMARK
```

For visual evidence, support coordinate-based regions.

For documents, support page/position references where practical.

Annotations must include:

```text
author
createdAt
updatedAt
target
content
```

Never alter the original evidence.

---

# 16. EVIDENCE LINKING

Allow evidence to be associated with:

```text
Investigation
Entity
Relationship
Timeline Event
Note
Report
```

Example:

```text
Evidence
  ├── Entity A
  ├── Entity B
  ├── Relationship A→B
  └── Timeline Event
```

Every association must be permission-checked.

---

# 17. EVIDENCE SEARCH

Create advanced evidence search.

Support:

```text
title
description
type
classification
investigation
entity
uploader
date
hash
status
```

Integrate with Phase 4 AI/RAG.

Do not expose restricted evidence through semantic search.

---

# 18. EVIDENCE AI

Extend Phase 4 AI.

Add controlled actions:

```text
Summarize Evidence
Extract Entities
Extract Dates
Extract Claims
Find Potential Conflicts
Generate Evidence Notes
```

AI outputs must be clearly marked:

```text
AI GENERATED
NOT VERIFIED
```

Do not automatically modify canonical evidence metadata.

---

# 19. EVIDENCE EXTRACTION

Where supported, create asynchronous processing jobs for:

* text extraction
* metadata extraction
* OCR adapter
* document parsing
* embedding generation

Architecture:

```text
Upload
 ↓
Evidence Registered
 ↓
Processing Queue
 ↓
Extractor
 ↓
Validation
 ↓
Index
 ↓
AI/RAG Available
```

Do not block the main upload request on expensive processing.

---

# 20. PROCESSING STATUS

Show:

```text
QUEUED
PROCESSING
COMPLETED
PARTIAL
FAILED
```

Provide safe error messages.

Do not expose internal stack traces.

Allow retry where safe.

---

# 21. REPORT SYSTEM

Create:

```text
/reports
```

and investigation reports:

```text
/investigations/:id/reports
```

Reports should be first-class ATLAS objects.

---

# 22. REPORT DATA MODEL

Create:

```text
Report
ReportVersion
ReportSection
ReportCitation
ReportReview
ReportApproval
```

Report fields:

```text
id
organizationId
workspaceId
investigationId
title
description
status
classification
templateId
createdBy
createdAt
updatedAt
publishedAt
```

Statuses:

```text
DRAFT
IN_REVIEW
CHANGES_REQUESTED
APPROVED
PUBLISHED
ARCHIVED
```

---

# 23. REPORT BUILDER

Create a professional report editor.

Structure:

```text
Report
├── Cover
├── Executive Summary
├── Investigation Overview
├── Entities
├── Relationships
├── Evidence
├── Timeline
├── Geographic Analysis
├── Findings
├── AI Analysis
├── Limitations
└── Sources
```

Sections should be modular.

Allow:

* add section
* reorder
* rename
* edit
* duplicate
* delete
* collapse
* preview

---

# 24. REPORT BLOCK SYSTEM

Use reusable report blocks.

Types:

```text
TEXT
HEADING
IMAGE
TABLE
ENTITY
RELATIONSHIP
EVIDENCE
TIMELINE
MAP
GRAPH
AI_SUMMARY
CITATION_LIST
CALLOUT
PAGE_BREAK
```

Architecture should make future block types easy to add.

---

# 25. DRAG-AND-DROP REPORT BUILDER

Create a polished editor.

Support:

* drag sections
* reorder blocks
* inline editing
* block insertion
* undo/redo where practical
* autosave
* version tracking

Do not sacrifice accessibility.

Provide keyboard alternatives to drag operations.

---

# 26. REPORT TEMPLATES

Create reusable templates.

Initial templates:

```text
Investigation Report
Executive Intelligence Brief
Evidence Summary
Entity Profile
Incident Analysis
Research Summary
```

Templates should define:

* sections
* block types
* default styling
* required sections
* classification

---

# 27. AI REPORT GENERATION

Integrate Phase 4 AI.

Provide:

```text
Generate Executive Summary
Generate Timeline Summary
Generate Entity Summary
Generate Evidence Summary
Generate Findings Draft
Generate Research Summary
```

AI must use authorized investigation context.

Generated content must be marked as:

```text
AI GENERATED — REVIEW REQUIRED
```

Never silently publish AI-generated content.

---

# 28. REPORT CITATIONS

Every AI-generated factual statement should be traceable to sources.

Support citations to:

```text
Evidence
Entity
Relationship
Timeline Event
Investigation
Note
```

Example:

```text
Finding:
Entity A is connected to Entity B.

Sources:
[1] REL-102
[2] EV-201
[3] EVT-44
```

Clicking a citation should open the source if the current user is authorized.

---

# 29. REPORT VERSIONING

Implement immutable report versions.

Example:

```text
Report
 ├── Version 1
 ├── Version 2
 └── Version 3
```

Each version records:

```text
createdBy
createdAt
changeSummary
contentSnapshot
```

Published versions must not be silently altered.

---

# 30. REPORT REVIEW WORKFLOW

Implement:

```text
Draft
  ↓
Submit for Review
  ↓
In Review
  ↓
Approved / Changes Requested
  ↓
Published
```

Reviewers can:

* comment
* request changes
* approve
* reject
* inspect citations
* inspect source material

---

# 31. REPORT APPROVAL

Approval must be explicit.

Store:

```text
reviewer
decision
timestamp
comment
reportVersionId
```

Do not let frontend state determine approval.

Server-side authorization is mandatory.

---

# 32. REPORT EXPORT

Create export architecture.

Support:

```text
PDF
HTML
JSON
```

where technically appropriate.

PDF should have:

* title
* classification
* page numbers
* sections
* citations
* generated timestamp
* report version
* investigation identifier
* author/reviewer information where permitted

Do not include restricted information unless the requesting user is authorized.

---

# 33. REPORT WATERMARKS / CLASSIFICATION

Display classification clearly.

Example:

```text
CONFIDENTIAL
ATLAS INTELLIGENCE REPORT
```

Classification must be carried into exports.

Do not treat a watermark as a security control by itself.

Access control remains mandatory.

---

# 34. REPORT PREVIEW

Create a high-quality report preview.

Support:

* desktop preview
* print-style preview
* page navigation
* zoom
* section navigation
* citation navigation

Do not make preview a separate source of truth.

Render from the report model.

---

# 35. COLLABORATION ENGINE

Create real-time collaboration for investigations and reports.

Support:

```text
Presence
Comments
Mentions
Activity
Notifications
Live updates
```

Do not build a general-purpose chat application.

Collaboration should be contextual to ATLAS workspaces.

---

# 36. REAL-TIME PRESENCE

Show users currently active in:

```text
Investigation
Evidence
Report
```

Example:

```text
ACTIVE NOW

● Analyst A
● Investigator B
○ Viewer C
```

Do not expose unnecessary user information.

Presence must respect workspace access.

---

# 37. REALTIME INVESTIGATION UPDATES

When a permitted user modifies an investigation:

```text
Entity added
Relationship updated
Evidence uploaded
Task completed
Note edited
Report updated
```

other authorized clients should receive the update.

Do not refresh the entire application.

Update affected components only.

---

# 38. REALTIME REPORT EDITING

Implement safe collaborative editing.

At minimum support:

* live section updates
* presence
* edit indicators
* conflict detection
* autosave
* version creation

If full CRDT collaboration is justified by the existing architecture, use it.

Otherwise implement server-authoritative section-level synchronization.

Do not create data-loss-prone last-write-wins behavior without conflict detection.

---

# 39. COMMENTS

Create contextual comments.

Comments can attach to:

```text
Investigation
Entity
Evidence
Timeline Event
Report
Report Block
```

Fields:

```text
author
content
createdAt
updatedAt
resolvedAt
```

Support:

* reply
* resolve
* reopen
* edit
* delete where authorized

---

# 40. MENTIONS

Support:

```text
@user
```

inside comments.

Mentioned users should receive a notification if they have access to the resource.

Do not allow mentions to reveal inaccessible users/resources.

---

# 41. NOTIFICATION CENTER

Create:

```text
/notifications
```

Support:

```text
Comment mention
Comment reply
Investigation assignment
Task assignment
Evidence processing completed
Report review requested
Report changes requested
Report approved
Collaboration activity
```

Features:

* unread count
* mark read
* mark all read
* filtering
* navigation to source

---

# 42. NOTIFICATION SECURITY

Notifications must be permission-aware.

Never generate a notification that links a user to an inaccessible resource.

If permissions are later removed, the destination must still enforce authorization.

---

# 43. COLLABORATION PERMISSIONS

Extend Phase 2 investigation roles.

Ensure:

```text
VIEWER
CONTRIBUTOR
ANALYST
LEAD
ADMIN
OWNER
```

have appropriate collaboration permissions.

Separate:

```text
read
comment
edit
manage
approve
publish
```

where appropriate.

Do not give broad privileges simply because a user can view an investigation.

---

# 44. SHARING

Create controlled investigation sharing.

Support sharing with:

* existing workspace members
* organization members where permitted

Do not implement public anonymous sharing in this phase.

If external sharing already exists, audit it thoroughly before extending it.

---

# 45. ACTIVITY FEED

Extend Phase 2 activity.

Include:

```text
Evidence uploaded
Evidence annotated
Report created
Report submitted
Report approved
Comment added
Task assigned
Member added
Entity updated
Investigation updated
AI analysis generated
```

Provide filters:

```text
All
Evidence
Reports
Collaboration
Investigation
AI
```

---

# 46. AI + COLLABORATION

Integrate Phase 4 AI with collaboration.

Users can:

```text
Save AI response as Note
Insert AI summary into Report
Attach AI result to Investigation
Create Task from AI recommendation
```

Important:

AI-generated content must remain visibly identified until reviewed.

Do not automatically treat AI output as verified evidence.

---

# 47. AI REPORT REVIEW

Create AI-assisted review capabilities.

The AI can flag:

```text
Unsupported claim
Missing citation
Conflicting source
Potentially ambiguous wording
Missing evidence reference
Unclear conclusion
```

The AI should suggest corrections.

A human must make the final decision.

---

# 48. REPORT QUALITY CHECK

Create a report validation system.

Check:

```text
Missing required sections
Broken citations
Unauthorized citations
Unresolved review comments
Missing classification
Invalid entity references
Missing evidence references
Unverified AI content
```

Prevent publishing if mandatory requirements are not satisfied.

---

# 49. REPORT PUBLISHING RULES

A report cannot be published unless:

```text
required sections complete
citations valid
permissions valid
classification set
required review complete
approval granted
```

Do not trust frontend validation.

Enforce on the server.

---

# 50. EVIDENCE → REPORT INTEGRATION

Users should be able to insert evidence into reports.

Example:

```text
Evidence
   ↓
Insert into Report
   ↓
Evidence Block
   ↓
Automatic Citation
```

If evidence becomes inaccessible later, report rendering must handle the situation safely.

Do not leak restricted evidence through old report versions.

---

# 51. GRAPH → REPORT INTEGRATION

Allow users to insert:

```text
Graph snapshot
Entity relationship diagram
Selected neighborhood
```

into reports.

The report should store a reproducible representation rather than depending on a temporary browser state.

Do not include unauthorized nodes.

---

# 52. MAP → REPORT INTEGRATION

Allow:

```text
Map snapshot
Selected locations
Geographic visualization
```

to be inserted into reports.

Respect:

* classification
* location permissions
* investigation permissions

Do not expose restricted geographic information in exports.

---

# 53. TIMELINE → REPORT INTEGRATION

Allow users to insert:

```text
Timeline section
Selected date range
Selected events
```

into reports.

The inserted timeline must preserve source references.

---

# 54. ADVANCED FRONTEND DESIGN

Phase 5 should feel like a premium professional intelligence platform.

Create:

* evidence command center
* immersive report workspace
* split-screen evidence viewer
* report editor
* contextual collaboration panel
* real-time presence
* source/citation drawer
* notification center
* review timeline
* intelligent status indicators

Use:

* depth
* layered surfaces
* subtle glass effects
* technical typography
* precise spacing
* restrained motion
* data-dense layouts

Avoid generic SaaS UI.

---

# 55. ADVANCED EVIDENCE VIEWER LAYOUT

Use a layout similar to:

```text
┌──────────────────────────────────────────────────────────┐
│ Evidence #EV-204                 CONFIDENTIAL            │
├───────────────┬──────────────────────────┬───────────────┤
│ Evidence      │                          │               │
│ Metadata      │       PREVIEW            │ Context       │
│               │                          │               │
│ Hash          │      DOCUMENT / IMAGE    │ Entities      │
│ Classification│                          │ Timeline      │
│ Source        │                          │ AI Analysis   │
│               │                          │ Comments      │
├───────────────┴──────────────────────────┴───────────────┤
│ Chain of Custody / Activity                              │
└──────────────────────────────────────────────────────────┘
```

Make panels resizable where appropriate.

---

# 56. REPORT WORKSPACE DESIGN

Use:

```text
┌──────────────────────────────────────────────────────────┐
│ Report Title                    DRAFT ●   [Review] [Export]│
├────────────┬───────────────────────────┬─────────────────┤
│ Sections   │                           │ Inspector       │
│            │       Report Canvas       │                 │
│ Executive  │                           │ Block Settings  │
│ Entities   │       Content             │ Sources         │
│ Evidence   │       Content             │ Comments        │
│ Timeline   │                           │ AI Tools        │
│ Findings   │                           │                 │
└────────────┴───────────────────────────┴─────────────────┘
```

---

# 57. REALTIME STATUS UI

Show truthful statuses:

```text
● Saved
● Saving
● Syncing
● Conflict detected
● Offline
● Reconnecting
```

Do not display fake realtime states.

---

# 58. OFFLINE / RECONNECT HANDLING

Where appropriate:

* detect disconnect
* preserve unsaved local changes
* reconnect
* reconcile changes
* warn about conflicts

Do not silently overwrite user changes.

---

# 59. DATABASE MODELS

Create only necessary Phase 5 models:

```text
EvidenceVersion
EvidenceAccessEvent
EvidenceAnnotation
EvidenceProcessingJob

Report
ReportVersion
ReportSection
ReportBlock
ReportCitation
ReportReview
ReportApproval

Comment
CommentReply
Mention

Notification

PresenceSession
CollaborationEvent
```

Reuse Phase 1–4 models wherever possible.

Use appropriate:

* foreign keys
* indexes
* unique constraints
* ownership fields
* timestamps

---

# 60. BACKGROUND PROCESSING

Create job abstractions for expensive work:

```text
EvidenceProcessing
EmbeddingGeneration
ReportGeneration
PDFGeneration
NotificationDispatch
```

Jobs must be:

* idempotent where possible
* retryable
* observable
* permission-aware
* safely cancellable where appropriate

Do not perform large processing synchronously inside request handlers.

---

# 61. API

Implement APIs such as:

```text
POST   /evidence/upload
GET    /evidence
GET    /evidence/:id
GET    /evidence/:id/versions
GET    /evidence/:id/access-history
POST   /evidence/:id/annotations
POST   /evidence/:id/process

GET    /reports
POST   /reports
GET    /reports/:id
PATCH  /reports/:id
POST   /reports/:id/submit
POST   /reports/:id/review
POST   /reports/:id/approve
POST   /reports/:id/publish
GET    /reports/:id/versions
POST   /reports/:id/export

GET    /comments
POST   /comments
PATCH  /comments/:id
POST   /comments/:id/resolve

GET    /notifications
PATCH  /notifications/:id/read

GET    /collaboration/:resourceId/presence
```

Follow existing API conventions.

Every endpoint must enforce authorization.

---

# 62. SECURE DOWNLOADS

Never expose permanent public storage URLs for restricted evidence.

Use:

* authorized streaming
* short-lived signed URLs
* access checks before delivery

The storage layer must not become a bypass around ATLAS permissions.

---

# 63. RATE LIMITING

Apply limits to:

```text
uploads
downloads
evidence processing
PDF generation
AI report generation
comments
notifications
realtime subscriptions
```

Prevent resource exhaustion.

---

# 64. SECURITY AUDIT

Perform a deep Phase 5 security audit.

Test:

```text
BOLA / IDOR
Broken access control
Tenant escape
Workspace escape
Classification bypass
Insecure downloads
Signed URL abuse
Path traversal
Malicious file upload
MIME spoofing
Archive bombs
Oversized uploads
XSS through evidence metadata
XSS through comments
XSS through report content
CSRF
Mass assignment
Race conditions
Concurrent editing
Notification leakage
Citation leakage
Report export leakage
AI-generated content leakage
```

Especially test:

```text
Can User A download User B's evidence?

Can changing an evidence ID bypass authorization?

Can a user access an old evidence version after losing access?

Can a restricted evidence file appear in a report?

Can a restricted evidence file appear in AI retrieval?

Can a notification reveal a private investigation?

Can a report export contain unauthorized entities?

Can an unauthorized user publish a report?

Can a Viewer approve a report?

Can a malicious filename escape the storage directory?

Can an uploaded HTML file execute in the application?

Can concurrent edits silently destroy another user's changes?

Can a signed URL be reused after permissions are revoked?
```

Fix all confirmed vulnerabilities.

---

# 65. BUSINESS LOGIC AUDIT

Test:

```text
Viewer
→ cannot modify evidence

Contributor
→ cannot approve reports

Reviewer
→ cannot modify canonical evidence

Analyst
→ cannot manage organization members

Removed member
→ cannot access previous restricted resources

Restricted evidence
→ cannot be inserted into unauthorized reports

AI-generated content
→ cannot become verified evidence automatically

Draft report
→ cannot be published without approval

Published report
→ cannot be silently modified

Archived investigation
→ cannot receive unauthorized mutations
```

---

# 66. TESTING

Add:

### Evidence tests

```text
upload
validation
hashing
authorization
classification
versioning
chain of custody
annotations
download security
```

### Processing tests

```text
job creation
retry
failure
idempotency
authorization
```

### Report tests

```text
CRUD
versioning
blocks
citations
review
approval
publishing
export
authorization
```

### Collaboration tests

```text
comments
mentions
presence
realtime updates
notification permissions
conflict detection
```

### AI integration tests

```text
AI → evidence
AI → report
AI → citations
AI → review
AI → permissions
```

### Security tests

```text
IDOR
tenant isolation
download authorization
upload security
XSS
CSRF
classification bypass
report leakage
```

---

# 67. PERFORMANCE

Test:

```text
1,000 evidence records
10,000 evidence records
large reports
large investigation graphs
multiple simultaneous collaborators
large evidence files
multiple concurrent exports
```

Optimize:

* database queries
* file streaming
* background processing
* report rendering
* realtime updates
* notification queries
* evidence search

Do not load entire evidence collections into the browser.

---

# 68. REALTIME LOAD

Test multiple simultaneous users.

Verify:

```text
10 users
25 users
50 users
```

where practical.

Measure:

* event latency
* memory usage
* dropped events
* reconnect behavior
* authorization correctness

Do not claim scalability beyond what was actually tested.

---

# 69. DOCUMENTATION

Create:

```text
docs/PHASE_5_ARCHITECTURE.md
docs/PHASE_5_EVIDENCE.md
docs/PHASE_5_REPORTS.md
docs/PHASE_5_COLLABORATION.md
docs/PHASE_5_API.md
docs/PHASE_5_SECURITY_AUDIT.md
docs/PHASE_5_COMPLETE.md
```

Document:

* evidence architecture
* storage architecture
* hashing
* chain of custody
* processing jobs
* report architecture
* report versioning
* approval workflow
* export architecture
* collaboration architecture
* realtime architecture
* notifications
* permissions
* security findings
* performance findings
* Phase 6 preparation

---

# 70. FINAL VERIFICATION

Run:

```text
lint
typecheck
unit tests
integration tests
frontend tests
security tests
database migration validation
production build
```

Then manually verify:

```text
[ ] Evidence vault works
[ ] Secure upload works
[ ] File validation works
[ ] SHA-256 hashing works
[ ] Evidence versions work
[ ] Chain-of-custody events work
[ ] Evidence classification works
[ ] Secure preview works
[ ] Secure downloads work
[ ] Evidence annotations work
[ ] Evidence/entity linking works
[ ] Evidence AI works
[ ] Background processing works

[ ] Report creation works
[ ] Report builder works
[ ] Report blocks work
[ ] Report templates work
[ ] AI report generation works
[ ] Citations work
[ ] Report versioning works
[ ] Review workflow works
[ ] Approval workflow works
[ ] Publishing protection works
[ ] PDF/HTML/JSON export works

[ ] Comments work
[ ] Replies work
[ ] Mentions work
[ ] Notifications work
[ ] Presence works
[ ] Realtime updates work
[ ] Conflict handling works
[ ] Reconnect handling works

[ ] RBAC verified
[ ] Tenant isolation verified
[ ] Classification security verified
[ ] Download authorization verified
[ ] Upload security verified
[ ] Report leakage tests passed
[ ] Notification leakage tests passed
[ ] AI permission tests passed
[ ] No secrets exposed
[ ] No console errors
[ ] No runtime errors
```

Do not disable tests to get a green build.

Fix the underlying problems.

---

# 71. PHASE 5 COMPLETION REPORT

Create:

```text
docs/PHASE_5_COMPLETE.md
```

Include:

* implemented features
* database changes
* API changes
* evidence architecture
* storage architecture
* processing pipeline
* chain-of-custody model
* report architecture
* report workflow
* export system
* collaboration architecture
* realtime architecture
* notification system
* AI integration
* security audit
* performance testing
* test results
* known limitations
* Phase 6 preparation

Finally output:

```text
========================================
       ATLAS PHASE 5 COMPLETE
========================================

EVIDENCE VAULT:          READY
SECURE UPLOAD:           READY
EVIDENCE HASHING:        READY
VERSIONING:              READY
CHAIN OF CUSTODY:        READY
ANNOTATIONS:             READY
EVIDENCE AI:             READY

REPORT BUILDER:          READY
REPORT TEMPLATES:        READY
REPORT CITATIONS:        READY
AI REPORT GENERATION:    READY
REPORT REVIEW:           READY
REPORT APPROVAL:         READY
REPORT VERSIONING:       READY
REPORT EXPORT:           READY

COLLABORATION:           READY
COMMENTS:                READY
MENTIONS:                READY
PRESENCE:                READY
NOTIFICATIONS:           READY
REALTIME SYNC:           READY

RBAC:                    VERIFIED
TENANT ISOLATION:        VERIFIED
CLASSIFICATION:          VERIFIED
UPLOAD SECURITY:         VERIFIED
DOWNLOAD SECURITY:       VERIFIED

SECURITY AUDIT:          PASSED
UNIT TESTS:              PASSED
INTEGRATION TESTS:       PASSED
FRONTEND TESTS:          PASSED
SECURITY TESTS:          PASSED
TYPECHECK:               PASSED
PRODUCTION BUILD:        PASSED

NEXT:
PHASE 6 — Advanced Intelligence & Automation
========================================
```

STOP after Phase 5.

Do not automatically start Phase 6.
