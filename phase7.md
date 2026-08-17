# ATLAS — PHASE 7/7

## Enterprise Hardening, Scale, Reliability & Production Release

You are now completing the **FINAL PHASE** of the ATLAS Intelligence Platform.

Act as a senior:

* software architect
* security architect
* DevSecOps engineer
* distributed-systems engineer
* database engineer
* AI platform engineer
* frontend performance engineer
* 3D visualization engineer
* QA engineer
* accessibility engineer
* production reliability engineer

**PHASES 1–6 are already implemented.**

Your mission is to turn ATLAS into a **production-grade, enterprise-ready intelligence platform**.

Do NOT redesign the entire application from scratch.

Do NOT remove existing functionality.

Do NOT replace working architecture unnecessarily.

Extend and harden what already exists.

---

# 1. READ EVERYTHING FIRST

Read:

```text
docs/ATLAS_7_PHASES.md

docs/PHASE_1_COMPLETE.md
docs/PHASE_2_COMPLETE.md
docs/PHASE_3_COMPLETE.md
docs/PHASE_4_COMPLETE.md
docs/PHASE_5_COMPLETE.md
docs/PHASE_6_COMPLETE.md
```

Also read all architecture, API, database, security, deployment, and testing documentation created during Phases 1–6.

Then inspect the entire repository.

Understand:

```text
Frontend
Backend
Database
Authentication
Authorization
Graph Engine
AI Engine
RAG
Evidence
Reports
Collaboration
Realtime
Geospatial
3D Rendering
Analytics
Anomaly Detection
Rules
Alerts
Watchlists
Workflows
Connectors
Background Jobs
Caching
Logging
Monitoring
```

Create a dependency map before making major changes.

---

# 2. FINAL OBJECTIVE

Transform ATLAS into:

# ATLAS ENTERPRISE INTELLIGENCE PLATFORM

Final architecture:

```text
                         ┌───────────────────────┐
                         │        ATLAS          │
                         │ Intelligence Platform │
                         └───────────┬───────────┘
                                     │
             ┌───────────────────────┼───────────────────────┐
             │                       │                       │
             ▼                       ▼                       ▼
       Intelligence              AI Platform           Collaboration
             │                       │                       │
             ├───────────┬───────────┤                       │
             ▼           ▼           ▼                       ▼
           Graph       Timeline      Map                  Cases
             │           │           │                       │
             └───────────┼───────────┘                       │
                         ▼                                   │
                    Analytics                                │
                         │                                   │
             ┌───────────┼────────────┐                      │
             ▼           ▼            ▼                      │
          Signals     Anomalies     Findings                  │
             │           │            │                      │
             └───────────┼────────────┘                      │
                         ▼                                   │
                    Workflows                                │
                         │                                   │
                         ▼                                   │
                  Human Approval                             │
                         │                                   │
                         ▼                                   │
                    Reporting                                │
                         │                                   │
                         ▼                                   │
                Enterprise Operations
```

The final system must be:

```text
Secure
Scalable
Observable
Recoverable
Accessible
Fast
Maintainable
Auditable
Production-ready
```

---

# 3. ENTERPRISE SECURITY HARDENING

Perform a complete security review.

Audit:

```text
Authentication
Authorization
RBAC
Tenant Isolation
Object-Level Authorization
Session Management
JWT
Refresh Tokens
API Keys
Secrets
Encryption
Database Access
File Uploads
Evidence
Reports
AI Tools
Connectors
Workflows
WebSockets
Background Jobs
Graph Queries
Search
Exports
Imports
Notifications
```

Test:

```text
BOLA
IDOR
Broken Access Control
Privilege Escalation
Tenant Escape
Session Fixation
Token Replay
CSRF
XSS
SQL Injection
NoSQL Injection
Command Injection
SSRF
Path Traversal
File Upload Abuse
Prototype Pollution
Open Redirect
Rate-Limit Bypass
Race Conditions
Mass Assignment
Information Disclosure
```

Fix every confirmed vulnerability.

---

# 4. ZERO TRUST AUTHORIZATION

Every protected operation must verify:

```text
User
Organization
Workspace
Investigation
Resource
Role
Permission
Classification
Action
```

Never rely only on frontend restrictions.

The backend must enforce authorization.

---

# 5. RBAC + ABAC

Keep existing RBAC.

Add contextual authorization where required:

```text
Role
+
Resource
+
Workspace
+
Classification
+
Action
+
Ownership
```

Example:

```text
Can user X
perform action Y
on resource Z
inside workspace W?
```

Create a centralized authorization layer.

Do not scatter permission logic throughout controllers.

---

# 6. CLASSIFICATION SECURITY

Support classification levels already defined by the platform.

Ensure:

```text
UI
API
Search
Graph
AI
Reports
Exports
Notifications
Snapshots
Workflows
```

respect classification.

A restricted resource must never appear in:

```text
search results
AI context
graph visualization
analytics
notifications
reports
exports
```

unless the user is authorized.

---

# 7. AI SECURITY HARDENING

Treat AI as an untrusted reasoning component.

AI must never:

```text
bypass permissions
execute arbitrary code
access unrestricted databases
access hidden system prompts
retrieve unauthorized documents
modify protected records without approval
execute dangerous external actions
```

Implement:

```text
AI Tool Authorization
Tool Allowlist
Tool Budget
Context Filtering
Output Validation
Prompt-Injection Detection
Source Validation
Citation Enforcement
Sensitive Data Filtering
```

---

# 8. PROMPT-INJECTION DEFENSE

External data can contain malicious instructions.

Architecture:

```text
External Data
      ↓
Untrusted Content
      ↓
Sanitization
      ↓
Context Isolation
      ↓
AI Retrieval
      ↓
Tool Authorization
      ↓
AI Output
```

Never treat retrieved text as executable instructions.

Clearly separate:

```text
SYSTEM INSTRUCTIONS
USER INSTRUCTIONS
DATA
EVIDENCE
AI OUTPUT
```

---

# 9. AI HALLUCINATION CONTROL

AI-generated claims must distinguish:

```text
SOURCE FACT
ANALYTICAL INFERENCE
HYPOTHESIS
UNKNOWN
```

Require citations for factual claims derived from ATLAS data.

Do not allow AI to manufacture:

```text
entities
relationships
evidence
events
sources
citations
```

---

# 10. AI OUTPUT VALIDATION

Validate structured AI responses with schemas.

Reject malformed outputs.

Implement:

```text
schema validation
citation validation
source existence validation
permission validation
confidence validation
```

If validation fails:

```text
retry safely
or
return controlled failure
```

Never silently accept malformed AI output.

---

# 11. DATABASE HARDENING

Review all database queries.

Ensure:

```text
parameterized queries
proper indexes
transaction boundaries
foreign-key integrity
unique constraints
cascade behavior
soft-delete behavior
tenant filters
classification filters
```

Identify:

```text
N+1 queries
unbounded queries
missing indexes
large joins
slow graph queries
slow search queries
```

Fix high-impact issues.

---

# 12. DATABASE MIGRATION SAFETY

Every migration must be:

```text
forward-compatible
reversible where practical
tested
documented
```

Do not destroy existing production data.

Test migrations against realistic datasets.

---

# 13. DATABASE BACKUP

Implement documented backup strategy.

Support:

```text
scheduled backup
retention policy
backup verification
restore procedure
```

Do not claim backups are successful without verifying them.

---

# 14. DISASTER RECOVERY

Create:

```text
Recovery Point Objective
Recovery Time Objective
Database Recovery
File Recovery
Search Recovery
Queue Recovery
AI Job Recovery
```

Document recovery procedures.

Simulate:

```text
database failure
worker failure
API failure
frontend failure
realtime failure
partial storage failure
```

---

# 15. JOB SYSTEM HARDENING

Review every background job.

Implement:

```text
idempotency
timeouts
retries
exponential backoff
dead-letter handling
cancellation
visibility
job ownership
```

Prevent:

```text
duplicate execution
infinite retry loops
poison jobs
queue starvation
```

---

# 16. DISTRIBUTED LOCKING

Where necessary, prevent duplicate execution of:

```text
scheduled jobs
workflow steps
connector sync
alert generation
briefing generation
large analytics
```

Use the project's existing infrastructure where available.

---

# 17. RATE LIMITING

Implement tiered limits for:

```text
authentication
search
graph queries
AI queries
AI tools
file uploads
report generation
exports
imports
connector sync
workflow execution
analytics
websocket connections
```

Use appropriate user/organization/resource scopes.

---

# 18. RESOURCE QUOTAS

Prevent one workspace from consuming unlimited resources.

Track:

```text
storage
AI usage
graph size
evidence count
API requests
jobs
workflow executions
connector sync
report generation
```

Provide graceful errors when quotas are exceeded.

---

# 19. API HARDENING

Review every API endpoint.

Verify:

```text
authentication
authorization
input validation
output filtering
pagination
rate limiting
error handling
audit logging
```

Never return:

```text
password hashes
tokens
secret keys
internal stack traces
private metadata
unauthorized records
```

---

# 20. PAGINATION

Ensure all potentially large endpoints use pagination.

Especially:

```text
entities
relationships
evidence
events
alerts
findings
investigations
reports
jobs
workflows
audit logs
notifications
search results
```

Support:

```text
limit
cursor
sort
filter
```

Use cursor pagination where appropriate.

---

# 21. SEARCH HARDENING

Search must respect:

```text
tenant
workspace
investigation
classification
permissions
deleted records
```

Test searches for information leakage.

---

# 22. GRAPH QUERY HARDENING

Prevent graph queries from becoming denial-of-service operations.

Implement:

```text
maximum depth
maximum nodes
maximum edges
timeout
pagination
sampling
aggregation
```

Return:

```text
RESULT_LIMIT_REACHED
```

instead of exhausting the server.

---

# 23. 3D PERFORMANCE ENGINEERING

Perform a final optimization pass on all 3D views.

Optimize:

```text
render loops
memory
geometry
textures
materials
shaders
instancing
LOD
culling
graph layout
animation
```

Use lazy loading.

Do not load 3D libraries on pages that do not need them.

---

# 24. 3D FALLBACK

If WebGL is unavailable:

```text
WebGL
 ↓
2D visualization
 ↓
Accessible list/table
```

The user must still be able to perform the analysis.

---

# 25. LARGE GRAPH PERFORMANCE

Test:

```text
1,000 nodes
5,000 nodes
10,000 nodes
25,000 nodes
50,000+ relationships
```

Use:

```text
clustering
progressive rendering
LOD
aggregation
virtualization
server-side filtering
```

Do not render massive datasets as individual DOM elements.

---

# 26. FRONTEND PERFORMANCE

Audit:

```text
JavaScript bundle
CSS
images
fonts
3D libraries
charts
maps
network requests
React rendering
state updates
```

Implement:

```text
code splitting
lazy loading
dynamic imports
memoization
virtualization
request deduplication
cache strategy
```

Avoid premature optimization.

Measure before and after.

---

# 27. CORE WEB PERFORMANCE

Measure:

```text
LCP
INP
CLS
TTFB
FCP
```

Optimize the most expensive pages.

Especially:

```text
Dashboard
Investigation
Graph
Map
Timeline
Evidence
AI
Reports
Intelligence
Admin
```

---

# 28. FRONTEND STATE ARCHITECTURE

Audit global state.

Prevent:

```text
duplicate state
stale state
unnecessary rerenders
race conditions
memory leaks
```

Ensure:

```text
Graph
Map
Timeline
Evidence
AI
Alerts
```

can synchronize without creating circular state dependencies.

---

# 29. REALTIME HARDENING

Review WebSocket/realtime infrastructure.

Implement:

```text
authentication
authorization
reconnection
backoff
heartbeat
subscription cleanup
event deduplication
event ordering
```

Users must only receive events they are authorized to see.

---

# 30. OFFLINE / RECONNECTION BEHAVIOR

When realtime disconnects:

```text
CONNECTED
   ↓
RECONNECTING
   ↓
RESYNCING
   ↓
CONNECTED
```

Avoid duplicate events.

Show clear connection state.

---

# 31. OBSERVABILITY

Create enterprise observability.

Track:

```text
API latency
database latency
AI latency
graph latency
job latency
workflow latency
connector latency
WebSocket latency
error rate
queue depth
CPU
memory
storage
```

---

# 32. STRUCTURED LOGGING

Use structured logs.

Example:

```json
{
  "timestamp": "...",
  "level": "info",
  "service": "graph-engine",
  "operation": "graph-analysis",
  "requestId": "...",
  "organizationId": "...",
  "durationMs": 120
}
```

Never log:

```text
passwords
tokens
API keys
private evidence
sensitive user data
```

---

# 33. REQUEST CORRELATION

Implement:

```text
requestId
traceId
jobId
workflowId
```

where appropriate.

A request should be traceable through:

```text
Frontend
 ↓
API
 ↓
Database
 ↓
Queue
 ↓
Worker
 ↓
AI
 ↓
Notification
```

---

# 34. ERROR TRACKING

Create centralized error handling.

Errors must have:

```text
errorId
requestId
timestamp
category
safe message
```

Users should receive understandable errors.

Developers should receive diagnostic information through secure logging.

---

# 35. HEALTH CHECKS

Implement:

```text
/health
/health/live
/health/ready
```

Check dependencies:

```text
database
cache
queue
search
object storage
AI provider
```

Do not expose sensitive diagnostics publicly.

---

# 36. ADMIN OPERATIONS CENTER

Create:

```text
/admin/operations
```

Display:

```text
System Health
API
Database
Queue
Workers
AI
Search
Storage
Realtime
```

Show:

```text
Healthy
Degraded
Unavailable
```

Only authorized administrators can access it.

---

# 37. ADMIN AUDIT CENTER

Create:

```text
/admin/audit
```

Allow filtering by:

```text
user
organization
action
resource
timestamp
IP
requestId
severity
```

Audit events such as:

```text
login
logout
permission change
data export
report publication
finding confirmation
workflow approval
connector change
AI action
classification change
```

---

# 38. IMMUTABLE AUDIT TRAIL

Critical audit events should not be editable through the normal application.

Use append-only semantics.

Record:

```text
actor
action
resource
before
after
timestamp
requestId
reason
```

---

# 39. SECURITY EVENT MONITORING

Create security signals for:

```text
repeated login failures
unusual API volume
permission changes
large exports
mass downloads
workflow abuse
connector failures
repeated authorization failures
```

Do not automatically accuse users of malicious activity.

Label as:

```text
Security Signal
```

and require review where appropriate.

---

# 40. EXPORT SECURITY

Secure:

```text
CSV
JSON
PDF
reports
graph exports
evidence exports
```

Verify authorization at export time.

Do not assume that because a user could previously view a resource, they can always export it.

---

# 41. WATERMARKING / CLASSIFICATION

Where appropriate, reports and exports should display:

```text
classification
generatedAt
generatedBy
organization
reportId
```

Use existing classification rules.

---

# 42. FILE SECURITY

Harden uploads.

Validate:

```text
filename
extension
MIME type
size
content
storage path
```

Prevent:

```text
path traversal
executable uploads
malicious SVG
zip bombs
oversized files
duplicate abuse
```

Store uploads outside executable paths.

---

# 43. EVIDENCE INTEGRITY

Preserve:

```text
hash
source
timestamp
creator
version
provenance
```

Detect unexpected changes.

Do not silently modify evidence.

---

# 44. REPORT INTEGRITY

Reports should record:

```text
report version
data snapshot
sources
author
reviewer
approval
generatedAt
```

If underlying data changes, the report should remain historically reproducible.

---

# 45. COLLABORATION HARDENING

Review:

```text
comments
mentions
presence
shared workspaces
tasks
assignments
notifications
```

Prevent users from interacting with resources they cannot access.

---

# 46. CONFLICT RESOLUTION

For collaborative editing:

```text
local change
     ↓
server version
     ↓
conflict detection
     ↓
merge/review
```

Do not silently overwrite another user's work.

---

# 47. ACCESSIBILITY FINAL AUDIT

Target:

```text
WCAG 2.2 AA
```

Check:

```text
keyboard navigation
focus order
contrast
screen reader
ARIA
forms
dialogs
tables
charts
maps
3D alternatives
motion
reduced motion
```

---

# 48. REDUCED MOTION

Respect:

```text
prefers-reduced-motion
```

Reduce:

```text
3D movement
camera transitions
particle effects
large animations
autoplay
```

Never remove essential information.

---

# 49. DESIGN SYSTEM FINALIZATION

Create a consistent ATLAS design system.

Define:

```text
colors
spacing
typography
radius
shadows
elevation
motion
icons
buttons
inputs
tables
cards
dialogs
navigation
charts
3D controls
```

Avoid random styling per page.

---

# 50. ADVANCED VISUAL LANGUAGE

The final frontend should feel:

```text
Professional
Technical
Premium
Intelligent
Spatial
Calm
Data-driven
```

Avoid:

```text
generic SaaS appearance
excessive gradients
excessive glassmorphism
random neon
giant empty spaces
overloaded dashboards
unnecessary animation
```

---

# 51. RESPONSIVE DESIGN FINALIZATION

Verify:

```text
1280px
1440px
1920px
2560px
3440px
```

Desktop layouts should intelligently use available space.

Do not leave excessive empty margins.

Dashboards should expand naturally.

Also verify:

```text
tablet
mobile
```

without breaking core functionality.

---

# 52. GLOBAL NAVIGATION

Ensure ATLAS navigation is consistent.

Structure:

```text
ATLAS
├── Home
├── Investigations
├── Intelligence
├── Graph
├── Map
├── Timeline
├── Evidence
├── Alerts
├── Watchlists
├── Workflows
├── Reports
├── AI
└── Administration
```

Only display sections the user is authorized to access.

---

# 53. GLOBAL COMMAND CENTER

Finalize the command palette.

Support:

```text
Search
Navigate
Analyze
Create
Open
Filter
Run
Generate
```

Add command suggestions based on current context.

Never allow commands to bypass permissions.

---

# 54. KEYBOARD-FIRST OPERATION

Make the desktop application highly keyboard-friendly.

Support:

```text
/
Search

G
Graph

M
Map

T
Timeline

I
Intelligence

A
Alerts

E
Evidence

W
Workflows

R
Reports

C
Command Center

?
Shortcuts
```

Allow users to customize shortcuts where appropriate.

---

# 55. SEARCH EXPERIENCE

Create a unified global search.

Search across authorized:

```text
entities
investigations
evidence
events
relationships
alerts
findings
reports
questions
watchlists
workflows
```

Results should show:

```text
type
title
context
classification
updatedAt
```

---

# 56. UNIVERSAL ENTITY VIEW

Create a unified entity workspace.

Sections:

```text
Overview
Relationships
Graph
Timeline
Map
Evidence
Investigations
Signals
AI Analysis
Audit
```

This becomes the primary analytical interface for entities.

---

# 57. INVESTIGATION EXPERIENCE

Finalize the investigation workspace.

Layout:

```text
┌─────────────────────────────────────────────────────────┐
│ Investigation Header                                    │
├───────────────┬──────────────────────────┬──────────────┤
│ Navigation    │ Main Analysis             │ Context      │
│               │                            │              │
│ Graph         │ Graph / Map / Timeline     │ Entity       │
│ Evidence      │                            │ Evidence     │
│ Timeline      │                            │ AI           │
│ Findings      │                            │ Alerts       │
│ Questions     │                            │              │
└───────────────┴──────────────────────────┴──────────────┘
```

Allow the user to resize panels.

---

# 58. INTELLIGENCE COMMAND CENTER FINAL UI

Finalize:

```text
/intelligence
```

with:

```text
Live Signals
Anomalies
Alerts
Graph
Timeline
Map
Watchlists
AI Briefing
Active Workflows
Pending Reviews
```

Use real data.

No fake dashboard statistics.

---

# 59. DEMO DATA

Create a safe synthetic dataset for development/demo environments.

Clearly mark:

```text
DEMO DATA
```

Never mix synthetic data with production records.

---

# 60. SEEDING

Create deterministic development seed data:

```text
organizations
users
roles
investigations
entities
relationships
events
evidence
alerts
anomalies
findings
workflows
watchlists
reports
```

The seed must be repeatable.

---

# 61. END-TO-END TESTING

Create complete workflows.

Test:

```text
Register
 ↓
Login
 ↓
Create Investigation
 ↓
Create Entity
 ↓
Create Relationship
 ↓
Add Evidence
 ↓
Analyze Graph
 ↓
Analyze Timeline
 ↓
Detect Anomaly
 ↓
Create Finding
 ↓
Review Finding
 ↓
Create Report
 ↓
Approve Report
 ↓
Export Report
```

Also:

```text
Alert
 ↓
Investigation
 ↓
Analysis
 ↓
Finding
 ↓
Briefing
```

And:

```text
Watchlist
 ↓
Change
 ↓
Rule
 ↓
Alert
 ↓
Workflow
 ↓
Human Approval
 ↓
Action
```

---

# 62. SECURITY END-TO-END TESTING

Test complete attack scenarios:

```text
User A attempts User B resource access
Viewer attempts Analyst action
Analyst attempts Admin action
AI attempts unauthorized tool
Workflow attempts unauthorized resource
Export attempts restricted data
Search attempts restricted data
Graph attempts restricted relationship
Snapshot attempts expired permission
Notification attempts restricted alert
```

Every unauthorized operation must fail safely.

---

# 63. LOAD TESTING

Test realistic concurrent workloads:

```text
50 users
100 users
250 users
500 users
```

Measure:

```text
API latency
database latency
queue latency
AI latency
WebSocket latency
graph latency
memory
CPU
```

Identify bottlenecks.

Do not invent capacity claims.

---

# 64. CHAOS / FAILURE TESTING

Simulate:

```text
worker crash
database restart
queue restart
AI timeout
connector timeout
WebSocket disconnect
network interruption
partial job failure
duplicate job
stale worker
```

Verify graceful recovery.

---

# 65. BACKUP RESTORE TEST

Perform an actual restore test in a non-production environment.

Verify:

```text
database
files
evidence
reports
metadata
search indexes
```

Document the result.

---

# 66. DEPLOYMENT HARDENING

Prepare production deployment.

Support:

```text
environment variables
secret management
database migrations
health checks
logging
monitoring
TLS
secure headers
CORS
rate limits
backups
```

Never commit:

```text
.env
API keys
private keys
credentials
production secrets
```

---

# 67. CONTAINERIZATION

If the project uses containers, finalize:

```text
frontend
backend
worker
database
cache
search
```

Use production-safe configurations.

Do not run production services as root unless absolutely necessary.

---

# 68. CI/CD

Create or harden CI.

Pipeline:

```text
Install
 ↓
Lint
 ↓
Typecheck
 ↓
Unit Tests
 ↓
Integration Tests
 ↓
Security Tests
 ↓
Build
 ↓
Migration Check
 ↓
Production Build
```

Fail the pipeline on critical failures.

---

# 69. DEPENDENCY SECURITY

Audit dependencies.

Check:

```text
outdated packages
known vulnerabilities
unused packages
duplicate packages
license compatibility
```

Remove unnecessary dependencies.

Do not blindly upgrade everything.

---

# 70. SECRET SCANNING

Scan repository for:

```text
API keys
tokens
passwords
private keys
database URLs
cloud credentials
```

Remove any accidental secrets.

Rotate exposed credentials where applicable.

---

# 71. SOURCE CODE QUALITY

Perform final cleanup.

Remove:

```text
dead code
unused imports
unused components
debug logs
temporary files
fake API responses
unused mocks
development-only bypasses
```

Do not remove code that is intentionally used for tests or development environments.

---

# 72. TYPE SAFETY

Run strict type checking.

Eliminate:

```text
unnecessary any
unsafe casts
ignored errors
missing null handling
```

Do not weaken compiler settings to make builds pass.

---

# 73. ERROR BOUNDARIES

Frontend must have error boundaries around major areas:

```text
Graph
Map
Timeline
AI
Evidence
Reports
Intelligence
Admin
```

A failure in one module should not crash the entire application.

---

# 74. EMPTY / LOADING / ERROR STATES

Every major page must handle:

```text
Loading
Empty
Error
Unauthorized
Not Found
Offline
Partial Data
```

No blank screens.

---

# 75. UX FEEDBACK

Every important action should provide:

```text
success
failure
progress
confirmation
```

For long-running jobs:

```text
Queued
Running
Progress
Completed
Failed
```

---

# 76. FINAL 3D EXPERIENCE

Create a polished ATLAS spatial environment.

Core scenes:

```text
3D Intelligence Graph
3D Investigation Space
3D Timeline
3D Globe
3D Operations Center
```

Users can move between these environments without losing context.

Keep transitions fast and optional.

---

# 77. 3D ACCESSIBILITY

Every 3D scene must have:

```text
2D alternative
keyboard controls
screen-reader-compatible data representation
reduced-motion mode
```

3D must enhance the application rather than become the only interface.

---

# 78. FINAL AI EXPERIENCE

ATLAS AI should support:

```text
Ask
Search
Analyze
Compare
Summarize
Explain
Find Connections
Find Contradictions
Generate Briefings
Generate Report Drafts
```

AI should always communicate uncertainty.

Example:

```text
CONFIRMED SOURCE
ANALYTICAL SIGNAL
POSSIBLE CONNECTION
UNVERIFIED
INSUFFICIENT DATA
```

---

# 79. AI REPORT GENERATION

Reports should follow:

```text
Question
Scope
Method
Evidence
Analysis
Findings
Contradictions
Uncertainty
Conclusion
Sources
```

Do not generate unsupported conclusions.

---

# 80. FINAL REPORT VERSIONING

Reports must support:

```text
Draft
Review
Approved
Published
Archived
```

Version every change.

---

# 81. FINAL AUDIT

Perform a full platform audit covering:

```text
Architecture
Security
Database
API
Frontend
3D
AI
Graph
Evidence
Reports
Collaboration
Realtime
Workflows
Connectors
Observability
Deployment
Accessibility
Performance
```

Create:

```text
docs/FINAL_PLATFORM_AUDIT.md
```

---

# 82. SECURITY SCORECARD

Create a security scorecard.

Track:

```text
Critical
High
Medium
Low
Informational
```

There must be:

```text
0 unresolved Critical vulnerabilities
0 known authentication bypasses
0 known authorization bypasses
0 known tenant-isolation failures
0 exposed production secrets
```

Do not hide unresolved issues.

Document accepted risks explicitly.

---

# 83. PERFORMANCE SCORECARD

Record actual measurements:

```text
Frontend load
API latency
Database latency
Graph latency
AI latency
Realtime latency
Job latency
3D performance
Memory usage
```

Use real measurements.

---

# 84. TEST SCORECARD

Record:

```text
Unit Tests
Integration Tests
E2E Tests
Security Tests
AI Tests
Performance Tests
Accessibility Tests
Migration Tests
Recovery Tests
```

Include:

```text
passed
failed
skipped
reason
```

---

# 85. PRODUCTION CHECKLIST

Before declaring completion:

```text
[ ] Authentication hardened
[ ] Authorization centralized
[ ] Tenant isolation verified
[ ] Classification enforced
[ ] AI tools secured
[ ] Prompt injection defenses tested
[ ] Database hardened
[ ] Backups verified
[ ] Restore tested
[ ] Jobs idempotent
[ ] Rate limiting enabled
[ ] Resource quotas enforced
[ ] API validation complete
[ ] Search secured
[ ] Graph limits enforced
[ ] 3D optimized
[ ] 3D fallback available
[ ] Realtime secured
[ ] Observability enabled
[ ] Audit logs verified
[ ] File uploads secured
[ ] Evidence integrity verified
[ ] Reports versioned
[ ] Collaboration secured
[ ] Accessibility verified
[ ] Responsive layouts verified
[ ] CI/CD verified
[ ] Dependencies audited
[ ] Secrets scanned
[ ] Dead code removed
[ ] Typecheck passes
[ ] Production build passes
[ ] E2E tests pass
[ ] Security tests pass
[ ] Recovery test passes
```

---

# 86. FINAL DOCUMENTATION

Create:

```text
docs/ATLAS_PRODUCTION_ARCHITECTURE.md
docs/ATLAS_SECURITY_MODEL.md
docs/ATLAS_DEPLOYMENT.md
docs/ATLAS_OPERATIONS.md
docs/ATLAS_DISASTER_RECOVERY.md
docs/ATLAS_PERFORMANCE.md
docs/ATLAS_ACCESSIBILITY.md
docs/ATLAS_AI_GOVERNANCE.md
docs/FINAL_PLATFORM_AUDIT.md
docs/ATLAS_FINAL_RELEASE.md
```

Document:

```text
architecture
security
deployment
configuration
monitoring
backup
recovery
AI governance
performance
accessibility
known limitations
operational procedures
```

---

# 87. FINAL RELEASE GATE

Do not declare ATLAS production-ready if:

```text
Critical security issues remain
Tenant isolation fails
Authentication can be bypassed
Authorization can be bypassed
Production secrets are exposed
Database integrity is compromised
Backups cannot be restored
Major workflows are broken
Production build fails
Core E2E tests fail
```

Fix the underlying issue first.

---

# 88. FINAL COMMANDS

Run the project's equivalent of:

```bash
lint
typecheck
test
test:e2e
test:security
test:performance
test:a11y
build
```

Then run the production build.

Verify:

```text
frontend
backend
worker
database
queue
search
AI
realtime
```

all start correctly.

---

# 89. FINAL RELEASE REPORT

Create:

```text
docs/ATLAS_FINAL_RELEASE.md
```

Include:

```text
ATLAS VERSION
Release Date
Architecture
Major Features
Security
AI
Graph
3D
Evidence
Investigations
Intelligence
Alerts
Workflows
Collaboration
Reports
Performance
Accessibility
Deployment
Monitoring
Backup
Recovery
Testing
Known Limitations
```

---

# 90. FINAL COMPLETION OUTPUT

When everything is genuinely verified, output:

```text
========================================================
                 ATLAS PLATFORM
              FINAL RELEASE COMPLETE
========================================================

ARCHITECTURE
    Enterprise Architecture       VERIFIED

SECURITY
    Authentication                VERIFIED
    Authorization                 VERIFIED
    Tenant Isolation              VERIFIED
    Classification                VERIFIED
    AI Security                   VERIFIED
    Prompt Injection Defense      VERIFIED
    Secrets                       VERIFIED
    Audit Logging                 VERIFIED

INTELLIGENCE
    Graph Analytics               READY
    Entity Resolution             READY
    Temporal Analytics             READY
    Geospatial Analytics          READY
    Anomaly Detection              READY
    Findings                       READY
    Alerts                         READY
    Watchlists                     READY
    Workflows                      READY

AI
    AI Assistant                  READY
    RAG                           READY
    Tool Governance               VERIFIED
    Citation Validation            VERIFIED
    AI Governance                 VERIFIED

VISUALIZATION
    3D Graph                      READY
    3D Globe                      READY
    3D Timeline                   READY
    Intelligence Command Center  READY
    2D Fallbacks                  READY

COLLABORATION
    Realtime                      READY
    Cases                         READY
    Tasks                         READY
    Comments                      READY
    Notifications                READY

OPERATIONS
    Background Jobs               VERIFIED
    Scheduling                    VERIFIED
    Observability                READY
    Health Checks                 READY
    Audit Center                 READY
    Admin Operations             READY

RELIABILITY
    Backup                        VERIFIED
    Restore                       VERIFIED
    Disaster Recovery             VERIFIED
    Job Recovery                  VERIFIED
    Failure Handling              VERIFIED

PERFORMANCE
    Frontend                      VERIFIED
    Backend                       VERIFIED
    Database                      VERIFIED
    Graph                         VERIFIED
    AI                            VERIFIED
    3D                            VERIFIED
    Realtime                      VERIFIED

QUALITY
    Typecheck                     PASSED
    Unit Tests                    PASSED
    Integration Tests             PASSED
    E2E Tests                     PASSED
    Security Tests                PASSED
    AI Tests                      PASSED
    Performance Tests             PASSED
    Accessibility Tests           PASSED
    Production Build              PASSED

DEPLOYMENT
    Production Configuration      VERIFIED
    CI/CD                         VERIFIED
    Secrets Management            VERIFIED
    Monitoring                   VERIFIED

========================================================
             ATLAS 7-PHASE BUILD COMPLETE
========================================================

ATLAS IS NOW READY FOR FINAL PRODUCTION
DEPLOYMENT REVIEW.

Do NOT claim production readiness if any required
verification above actually failed.

========================================================
```

STOP.

Do not create another phase.

**PHASE 7 IS THE FINAL ATLAS BUILD PHASE.**
