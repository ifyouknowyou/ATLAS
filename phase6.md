# ATLAS — PHASE 6/7

## Advanced Intelligence, Automation & Operations

You are continuing development of the ATLAS Intelligence Platform.

Act as a senior AI architect, intelligence-platform architect, graph-data engineer, automation engineer, security engineer, distributed-systems engineer, and advanced 3D frontend engineer.

**PHASE 1, PHASE 2, PHASE 3, PHASE 4, and PHASE 5 are already complete.**

Implement **PHASE 6 ONLY**.

Do not automatically implement Phase 7.

ATLAS must only process data the user is authorized to access or lawfully supplies. Do not implement credential theft, unauthorized surveillance, bypassing access controls, covert tracking, or unrestricted autonomous actions.

---

# 1. READ THE EXISTING PROJECT FIRST

Read all previous documentation:

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

docs/PHASE_5_ARCHITECTURE.md
docs/PHASE_5_EVIDENCE.md
docs/PHASE_5_REPORTS.md
docs/PHASE_5_COLLABORATION.md
docs/PHASE_5_API.md
docs/PHASE_5_SECURITY_AUDIT.md
docs/PHASE_5_COMPLETE.md
```

Then inspect the entire repository.

Understand the existing:

* authentication
* authorization
* tenant isolation
* graph engine
* geospatial engine
* timeline engine
* evidence system
* report system
* collaboration
* AI/RAG
* background jobs
* realtime system
* notification system
* frontend visualization system

Extend the existing architecture.

Do not duplicate existing functionality.

---

# 2. PHASE 6 OBJECTIVE

Transform ATLAS from an intelligence workspace into an:

# INTELLIGENCE OPERATIONS PLATFORM

Architecture:

```text
                         ATLAS
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
     Knowledge          AI Engine          Evidence
       Graph                │                 │
        │                   │                 │
        └─────────────┬─────┴─────────────────┘
                      ▼
              Intelligence Engine
                      │
       ┌──────────────┼───────────────┐
       ▼              ▼               ▼
   Patterns        Anomalies       Analytics
       │              │               │
       └──────────────┼───────────────┘
                      ▼
                Rule Engine
                      │
                      ▼
                 Automation
                      │
             ┌────────┴────────┐
             ▼                 ▼
          Alerts           Workflows
             │                 │
             └────────┬────────┘
                      ▼
              Analyst Review
                      │
                      ▼
                 Reports
```

Build:

* advanced graph analytics
* pattern detection
* anomaly detection
* similarity analysis
* entity resolution
* temporal analytics
* geospatial analytics
* intelligence rules
* alert engine
* workflow automation
* scheduled analysis
* watchlists
* saved searches
* intelligence dashboards
* external data connector architecture
* ingestion pipelines
* AI-assisted analytical workflows
* operational command center

---

# 3. ADVANCED INTELLIGENCE ENGINE

Create:

```text
src/features/intelligence/
```

Structure:

```text
intelligence/
├── analytics/
├── patterns/
├── anomalies/
├── entity-resolution/
├── temporal/
├── geospatial/
├── scoring/
├── rules/
├── alerts/
├── workflows/
├── watchlists/
├── connectors/
├── ingestion/
├── jobs/
├── schemas/
├── policies/
└── types/
```

Separate:

```text
Detection
Analysis
Scoring
Rules
Automation
Presentation
```

Do not mix UI logic with analytical algorithms.

---

# 4. GRAPH ANALYTICS ENGINE

Extend the Phase 3 graph engine.

Implement analytical capabilities such as:

```text
Degree Centrality
Betweenness Centrality
Closeness
Connected Components
Community Detection
Shortest Paths
Relationship Density
Bridge Detection
Subgraph Analysis
```

Do not invent metrics that the implementation does not actually calculate.

Every analytical result must identify:

```text
graph version
algorithm
parameters
timestamp
source scope
```

---

# 5. GRAPH PATH ANALYSIS

Allow users to select:

```text
Entity A
Entity B
```

and calculate authorized paths.

Display:

```text
A
 │
 ▼
Relationship
 │
 ▼
Entity C
 │
 ▼
Relationship
 │
 ▼
B
```

Show:

* path length
* relationships
* entities
* timestamps where available
* confidence/source metadata

Never imply that a graph path proves a real-world relationship.

Label it as:

```text
GRAPH-DERIVED CONNECTION
```

---

# 6. COMMUNITY DETECTION

Implement community/cluster analysis.

Example:

```text
Cluster A
  24 entities
  41 relationships

Cluster B
  13 entities
  17 relationships
```

Allow:

* inspect cluster
* visualize cluster
* summarize cluster with AI
* create investigation workspace from cluster
* save cluster analysis

Do not automatically classify a community as malicious or suspicious.

---

# 7. GRAPH CHANGE DETECTION

Compare graph snapshots.

Detect:

```text
New entity
Removed entity
New relationship
Removed relationship
Changed relationship
Changed metadata
```

Display:

```text
GRAPH DELTA

+ 12 entities
+ 28 relationships
- 2 relationships
~ 7 updated entities
```

Allow users to inspect the underlying records.

---

# 8. ENTITY RESOLUTION

Create an entity-resolution engine for authorized data.

Purpose:

```text
Potentially same entity
```

Compare available attributes such as:

* normalized name
* aliases
* organization
* supplied identifiers
* dates
* location metadata
* existing relationships

Return:

```text
MATCH CANDIDATE
```

with explainable factors.

Do not automatically merge entities.

---

# 9. ENTITY MATCH REVIEW

Create a review UI:

```text
ENTITY MATCH CANDIDATE

Entity A
        VS
Entity B

Matching signals:
Name similarity       HIGH
Alias similarity      MEDIUM
Location overlap      LOW
Relationship overlap  MEDIUM

Recommendation:
REVIEW REQUIRED
```

Actions:

```text
Confirm Match
Reject Match
Ignore
```

All decisions must be audited.

---

# 10. SIMILARITY ENGINE

Support similarity search across authorized entities.

Examples:

```text
Find entities similar to Entity A
Find similar evidence
Find similar investigations
Find similar graph structures
```

Return explainable similarity factors.

Do not present similarity as identity.

---

# 11. TEMPORAL ANALYTICS

Extend the timeline engine.

Implement:

```text
event density
time gaps
period comparisons
activity bursts
timeline clustering
before/after analysis
sequence analysis
```

Example:

```text
NORMAL ACTIVITY
      ↓
Activity increase
      ↓
Cluster of events
      ↓
Potential temporal anomaly
```

Label analytical results as potential findings.

---

# 12. TEMPORAL GRAPH

Allow graph relationships to be viewed across time.

Controls:

```text
Date Range
Playback
Speed
Event Density
Relationship Changes
```

Example:

```text
2026-01
   ↓
2026-02
   ↓
2026-03
   ↓
2026-04
```

As the timeline changes, graph state should update where historical data exists.

Do not rewrite historical records.

---

# 13. 3D TEMPORAL INTELLIGENCE

Upgrade the Phase 3 3D visualization.

Provide:

```text
3D Graph Timeline
3D Entity Clusters
Temporal Relationship Animation
Geospatial Timeline
Layer Controls
```

Use GPU-friendly rendering.

Do not render thousands of expensive animated objects unnecessarily.

Use:

* instancing
* level of detail
* frustum culling
* lazy rendering
* clustering
* progressive loading

---

# 14. ANOMALY DETECTION

Create an anomaly-detection framework.

Architecture:

```text
Data
 ↓
Feature Extraction
 ↓
Baseline
 ↓
Detection
 ↓
Score
 ↓
Explanation
 ↓
Analyst Review
```

Potential signals:

```text
unusual relationship growth
unexpected activity burst
unusual timeline sequence
unusual geographic movement in supplied data
sudden graph structure change
unexpected evidence volume
```

Do not automatically label people as suspicious.

Use terminology such as:

```text
Potential Anomaly
Analytical Signal
Unusual Pattern
```

---

# 15. EXPLAINABLE ANOMALIES

Every anomaly should contain:

```text
anomalyId
type
score
baseline
observedValue
explanation
sourceRecords
detectedAt
status
```

Example:

```text
POTENTIAL ANOMALY

Relationship activity increased 240%
relative to the selected baseline.

Sources:
REL-102
REL-104
REL-118
```

---

# 16. ANOMALY REVIEW

Create statuses:

```text
NEW
UNDER_REVIEW
CONFIRMED_SIGNAL
DISMISSED
ARCHIVED
```

Users must decide whether an anomaly matters.

Do not automatically convert anomalies into verified findings.

---

# 17. INTELLIGENCE SCORING

Create a configurable scoring framework.

Separate:

```text
Evidence Quality
Source Reliability
Relationship Strength
Analytical Relevance
Temporal Relevance
Geographic Relevance
```

Do not create a single hidden "truth score."

Make score components explainable.

---

# 18. RULE ENGINE

Create a safe rules engine.

Example:

```text
WHEN
relationship_count > threshold

THEN
create analytical alert
```

Rules can inspect:

```text
entities
relationships
evidence
timeline
graph metrics
anomalies
saved searches
```

Rules must operate only inside the user's authorized scope.

---

# 19. RULE BUILDER

Create a visual rule builder.

Example:

```text
WHEN

Entity Type = Organization
AND
Relationship Count > 20
AND
Time Range = Last 30 Days

THEN

Create Alert
```

Support:

* conditions
* AND/OR groups
* thresholds
* date ranges
* actions
* rule status

Avoid arbitrary code execution.

---

# 20. ALERT ENGINE

Create:

```text
src/features/intelligence/alerts/
```

Alerts should support:

```text
NEW
ACKNOWLEDGED
IN_REVIEW
RESOLVED
DISMISSED
```

Alert fields:

```text
alertId
ruleId
investigationId
severity
title
description
sources
createdAt
status
assignedTo
```

---

# 21. ALERT SEVERITY

Use:

```text
INFO
LOW
MEDIUM
HIGH
CRITICAL
```

Severity must represent the configured analytical rule/result.

Do not automatically infer real-world danger from severity.

---

# 22. ALERT CENTER

Create:

```text
/alerts
```

with:

```text
Active
Assigned
Unread
Resolved
Dismissed
```

Filters:

```text
severity
investigation
rule
date
status
assignee
```

---

# 23. ALERT NOTIFICATIONS

Integrate with Phase 5 notifications.

Support:

```text
in-app
realtime
email adapter
```

Do not spam users.

Implement:

* deduplication
* cooldown
* grouping
* notification preferences

---

# 24. WATCHLISTS

Create authorized watchlists.

Watchlists can track ATLAS resources such as:

```text
entities
investigations
relationships
saved searches
graph clusters
```

When tracked resources change:

```text
Watchlist
   ↓
Change Detection
   ↓
Rule Engine
   ↓
Alert
```

Do not implement covert tracking of people or devices.

---

# 25. SAVED SEARCHES

Allow users to save advanced searches.

Example:

```text
Entities
Type = Organization
Created = Last 30 Days
Relationship Count > 10
```

Save:

```text
query
filters
scope
owner
createdAt
```

Users can rerun them manually or attach them to authorized analytical workflows.

---

# 26. INTELLIGENCE WORKFLOW ENGINE

Create:

```text
src/features/workflows/
```

Architecture:

```text
Trigger
 ↓
Condition
 ↓
Analysis
 ↓
Human Review
 ↓
Action
```

Supported actions:

```text
Create Alert
Create Task
Notify User
Generate AI Summary
Update Investigation Status
Create Report Draft
Request Review
```

Do not allow unrestricted shell commands or arbitrary code actions.

---

# 27. HUMAN-IN-THE-LOOP

High-impact workflow actions must require approval.

Example:

```text
Detected Signal
      ↓
AI Analysis
      ↓
Review Required
      ↓
Analyst Approves
      ↓
Workflow Continues
```

Actions requiring approval should be configurable.

---

# 28. WORKFLOW BUILDER

Create visual workflow UI:

```text
┌──────────┐
│ Trigger  │
└────┬─────┘
     ↓
┌──────────┐
│ Filter   │
└────┬─────┘
     ↓
┌──────────┐
│ Analyze  │
└────┬─────┘
     ↓
┌──────────┐
│ Review   │
└────┬─────┘
     ↓
┌──────────┐
│ Action   │
└──────────┘
```

Use React Flow or the existing graph framework if already installed.

---

# 29. WORKFLOW EXECUTION

Create a durable execution model.

Track:

```text
workflowRun
step
status
startedAt
completedAt
error
inputReference
outputReference
```

Statuses:

```text
QUEUED
RUNNING
WAITING_APPROVAL
COMPLETED
FAILED
CANCELLED
```

Workflows must be resumable after server restart.

---

# 30. SCHEDULED INTELLIGENCE

Create scheduled jobs.

Support:

```text
hourly
daily
weekly
custom schedule
```

Examples:

```text
Run saved search daily
Recalculate graph metrics nightly
Check watchlist changes
Generate scheduled intelligence summary
```

Use a proper scheduler.

Do not create uncontrolled cron jobs.

---

# 31. JOB QUEUE

Use the existing Phase 5 job infrastructure.

Create jobs for:

```text
graph analysis
entity resolution
anomaly detection
embedding refresh
watchlist evaluation
rule evaluation
workflow execution
report generation
scheduled analysis
```

Jobs should be:

* retryable
* idempotent
* observable
* cancellable where safe

---

# 32. EXTERNAL DATA CONNECTOR ARCHITECTURE

Create a connector abstraction.

```text
DataConnector
    ├── Connector A
    ├── Connector B
    ├── Local Dataset
    └── Mock Connector
```

Each connector should support:

```text
authenticate
validate
fetch
normalize
transform
ingest
```

Only implement lawful/authorized data sources.

Do not build credential-harvesting functionality.

---

# 33. DATA SOURCE REGISTRY

Create:

```text
DataSource
Connector
IngestionJob
```

Track:

```text
name
type
owner
status
lastSync
configuration
health
```

Never store connector secrets in plain text.

Use the application's existing secret-management strategy.

---

# 34. NORMALIZATION PIPELINE

External data must pass through:

```text
Raw Data
 ↓
Validation
 ↓
Normalization
 ↓
Deduplication
 ↓
Entity Resolution
 ↓
Relationship Mapping
 ↓
Evidence/Source Metadata
 ↓
ATLAS Graph
```

Do not insert unvalidated external data directly into canonical records.

---

# 35. DATA PROVENANCE

Every imported record should preserve provenance:

```text
sourceId
connectorId
importJobId
retrievedAt
originalReference
transformationVersion
```

Users should be able to inspect where data originated.

---

# 36. INGESTION SAFETY

External data is untrusted.

Protect against:

```text
malicious text
prompt injection
malicious filenames
oversized payloads
unexpected schemas
duplicate records
poisoned metadata
```

Treat imported content as data.

Never execute imported instructions.

---

# 37. AI INTELLIGENCE ORCHESTRATOR

Extend Phase 4 AI into a controlled intelligence orchestrator.

Architecture:

```text
User Question
      ↓
AI Planner
      ↓
Tool Selection
      ↓
Retrieval
      ↓
Graph Analysis
      ↓
Temporal Analysis
      ↓
Evidence Analysis
      ↓
Cross-check
      ↓
Synthesis
      ↓
Citations
      ↓
Human Review
```

Use strict tool budgets.

---

# 38. AI ANALYTICAL TOOLS

Add controlled read-only tools:

```text
calculateGraphMetrics
findGraphPaths
detectGraphChanges
findSimilarEntities
analyzeTimeline
detectAnomalies
runSavedSearch
compareEntities
compareInvestigations
findEvidenceConflicts
```

Every tool must enforce authorization.

---

# 39. AI TOOL BUDGET

Limit:

```text
maximum tool calls
maximum recursion depth
maximum retrieval records
maximum graph nodes
maximum execution time
maximum output size
```

Never allow infinite autonomous loops.

---

# 40. AI RESEARCH WORKFLOW

Allow AI to create a proposed analytical workflow:

```text
Question
 ↓
Research Plan
 ↓
Retrieve
 ↓
Analyze
 ↓
Cross-check
 ↓
Draft
```

Show the plan to the user.

Allow:

```text
Approve
Edit
Cancel
```

before expensive or multi-step execution.

---

# 41. INTELLIGENCE BRIEFING

Create an AI-assisted briefing dashboard.

Display:

```text
KEY DEVELOPMENTS
NEW SIGNALS
GRAPH CHANGES
TIMELINE CHANGES
ANOMALIES
IMPORTANT EVIDENCE
OPEN QUESTIONS
PENDING REVIEWS
```

Every item must link back to source records.

---

# 42. DAILY / PERIODIC BRIEFING

Allow users to generate a briefing for a selected period.

Example:

```text
INTELLIGENCE BRIEF
August 12, 2026

New entities: 8
New relationships: 17
Potential anomalies: 4
Evidence updates: 12
Open reviews: 3
```

The AI summary must cite underlying records.

Do not invent events.

---

# 43. INTELLIGENCE DASHBOARD

Create:

```text
/intelligence
```

with:

```text
┌───────────────────────────────────────────────────────────┐
│ ATLAS INTELLIGENCE OPERATIONS                             │
├─────────────┬──────────────┬──────────────┬──────────────┤
│ Signals     │ Anomalies    │ Alerts       │ Workflows    │
│ 128         │ 12           │ 7            │ 4 running    │
├─────────────┴──────────────┴──────────────┴──────────────┤
│                                                           │
│              3D INTELLIGENCE GRAPH                       │
│                                                           │
├──────────────────────────────┬────────────────────────────┤
│ Timeline Signals             │ Geographic Signals        │
├──────────────────────────────┼────────────────────────────┤
│ Recent Changes               │ AI Briefing               │
└──────────────────────────────┴────────────────────────────┘
```

All metrics must come from real backend data.

---

# 44. ADVANCED 3D COMMAND CENTER

Create a premium 3D intelligence visualization.

Features:

```text
3D entity graph
cluster visualization
relationship flows
temporal playback
geographic overlay
signal visualization
alert markers
timeline synchronization
```

Use visual hierarchy.

Do not overload the scene with animations.

---

# 45. 3D INTERACTION

Support:

* orbit
* zoom
* pan
* focus entity
* isolate cluster
* hide/show relationship types
* temporal filtering
* geographic filtering
* search-to-focus
* AI-to-focus
* alert-to-focus

When selecting an entity:

```text
Graph
 ↓
Entity panel
 ↓
Timeline
 ↓
Map
 ↓
Evidence
 ↓
AI context
```

All views must use shared application state.

---

# 46. PERFORMANCE FOR 3D

Implement:

```text
LOD
instanced rendering
frustum culling
progressive graph loading
node clustering
edge simplification
GPU-friendly animations
```

Test:

```text
500 nodes
1,000 nodes
5,000 nodes
```

Do not promise a fixed FPS.

Record actual performance.

---

# 47. ADVANCED GEOSPATIAL ANALYTICS

Extend Phase 3 map/globe.

Support authorized data analysis such as:

```text
location clustering
density visualization
time-based geographic changes
route visualization from supplied data
region comparison
geographic relationship analysis
```

Do not implement covert real-time tracking.

Use only existing authorized location data.

---

# 48. MAP + TIMELINE SYNCHRONIZATION

When the user changes time range:

```text
Timeline
 ↓
Map
 ↓
Graph
 ↓
Evidence
```

update consistently.

Example:

```text
2026-05-01 → 2026-05-15
```

Only relevant records should remain visible.

---

# 49. ANALYTICAL SNAPSHOTS

Allow users to save:

```text
Graph Snapshot
Map Snapshot
Timeline Snapshot
Analytics Snapshot
```

Each snapshot records:

```text
filters
date range
scope
visualization state
createdBy
createdAt
```

Snapshots should be reproducible.

---

# 50. INTELLIGENCE CASEBOARD

Create a visual caseboard.

Cards can represent:

```text
Entity
Evidence
Alert
Anomaly
Finding
Question
Task
Report
```

Users can arrange cards into analytical groups.

Use a canvas-style interface.

---

# 51. INTELLIGENCE QUESTIONS

Allow users to create explicit unanswered questions:

```text
What explains this relationship?

When did this pattern begin?

Which evidence supports this conclusion?

What information is missing?
```

Each question can have:

```text
status
owner
sources
AI analysis
comments
resolution
```

This prevents AI from pretending uncertainty is resolved.

---

# 52. FINDINGS

Create analytical findings separate from raw evidence.

A finding should contain:

```text
title
description
status
confidence
supportingSources
contradictingSources
createdBy
reviewStatus
```

Statuses:

```text
DRAFT
UNDER_REVIEW
CONFIRMED
REJECTED
ARCHIVED
```

A finding must never become confirmed merely because AI generated it.

---

# 53. FINDING REVIEW

Create:

```text
Finding
  ↓
Supporting Evidence
  ↓
Contradicting Evidence
  ↓
Analyst Review
  ↓
Decision
```

Allow analysts to inspect evidence before confirmation.

---

# 54. ALERT → INVESTIGATION

Allow an analyst to convert an alert into a new investigation workspace.

Workflow:

```text
Alert
 ↓
Review
 ↓
Create Investigation
 ↓
Copy authorized context
 ↓
Start Analysis
```

Do not duplicate inaccessible resources.

---

# 55. ANOMALY → INVESTIGATION

Same concept:

```text
Anomaly
 ↓
Review
 ↓
Create Investigation
```

Preserve provenance.

---

# 56. WATCHLIST → BRIEFING

Allow users to generate a briefing from watched resources.

Example:

```text
Watchlist
 ↓
Recent Changes
 ↓
AI Analysis
 ↓
Cited Briefing
```

---

# 57. WORKFLOW AUDIT LOG

Every automation execution should record:

```text
workflow
trigger
steps
actor
system action
approval
result
timestamp
```

Do not allow untracked automation.

---

# 58. AUTOMATION SAFETY

Every automated action must be categorized:

```text
READ_ONLY
LOW_IMPACT
REVIEW_REQUIRED
HIGH_IMPACT
```

High-impact actions require human approval.

Never allow automation to:

* delete evidence
* remove users
* change permissions
* publish reports
* destroy investigations

without explicit authorization and approval.

---

# 59. MULTI-TENANT SECURITY

Every analytical system must preserve:

```text
organization
workspace
investigation
classification
resource permissions
```

Test:

```text
graph analytics
vector search
saved searches
watchlists
alerts
workflows
anomalies
briefings
snapshots
```

for cross-tenant leakage.

---

# 60. RATE LIMITING

Apply limits to:

```text
graph analytics
entity resolution
anomaly detection
workflow runs
scheduled jobs
external ingestion
AI orchestration
3D graph queries
saved searches
alerts
```

Prevent resource exhaustion.

---

# 61. OBSERVABILITY

Track:

```text
job latency
workflow latency
graph analysis latency
retrieval latency
AI latency
connector latency
alert latency
queue depth
failed jobs
retry counts
```

Create an internal operations diagnostics view.

Do not expose sensitive infrastructure information to ordinary users.

---

# 62. FAILURE HANDLING

Handle:

```text
job failure
connector failure
AI failure
graph analysis failure
database failure
realtime disconnect
workflow timeout
partial ingestion
duplicate ingestion
```

Use clear states:

```text
FAILED
PARTIAL
RETRYING
CANCELLED
```

Never silently discard failures.

---

# 63. API

Implement APIs following existing conventions:

```text
GET  /intelligence/metrics
POST /intelligence/graph/analyze
POST /intelligence/graph/paths
POST /intelligence/graph/compare

POST /intelligence/entities/resolve
POST /intelligence/entities/similar

POST /intelligence/timeline/analyze
POST /intelligence/anomalies/detect

GET  /alerts
POST /alerts/:id/acknowledge
POST /alerts/:id/resolve
POST /alerts/:id/dismiss

GET  /watchlists
POST /watchlists
PATCH /watchlists/:id

GET  /saved-searches
POST /saved-searches
POST /saved-searches/:id/run

GET  /workflows
POST /workflows
POST /workflows/:id/run
POST /workflows/:id/cancel
GET  /workflows/:id/runs

GET  /intelligence/findings
POST /intelligence/findings
POST /intelligence/findings/:id/review

GET  /intelligence/briefings
POST /intelligence/briefings

GET  /data-sources
POST /data-sources
POST /data-sources/:id/sync
```

Use strict DTO/schema validation.

---

# 64. DATABASE MODELS

Add only necessary Phase 6 models:

```text
GraphAnalysis
GraphSnapshot
GraphChange

EntityMatchCandidate
EntityMatchDecision

Anomaly
AnomalyEvidence

IntelligenceRule
RuleCondition
RuleAction

Alert
AlertEvent

Watchlist
WatchlistItem

SavedSearch

Workflow
WorkflowStep
WorkflowRun
WorkflowRunStep
WorkflowApproval

DataSource
Connector
IngestionJob
IngestionRecord

IntelligenceFinding
FindingSource

IntelligenceQuestion

IntelligenceBriefing
BriefingSource

AnalyticsSnapshot
```

Reuse existing models wherever possible.

---

# 65. INDEXING

Add appropriate indexes for:

```text
organizationId
workspaceId
investigationId
createdAt
status
classification
ruleId
alert status
workflow status
job status
watchlist ownership
```

Review query plans for high-volume analytical queries.

---

# 66. BACKGROUND JOB ARCHITECTURE

Use the existing queue.

Jobs should include:

```text
GRAPH_ANALYSIS
ENTITY_RESOLUTION
ANOMALY_DETECTION
RULE_EVALUATION
WATCHLIST_EVALUATION
WORKFLOW_EXECUTION
CONNECTOR_SYNC
DATA_NORMALIZATION
BRIEFING_GENERATION
SNAPSHOT_GENERATION
```

Every job must have:

```text
jobId
type
scope
status
attempt
createdAt
startedAt
completedAt
error
```

---

# 67. IDEMPOTENCY

Ensure repeated execution does not create duplicate:

* alerts
* findings
* ingestion records
* notifications
* workflow actions

Use idempotency keys or deterministic identifiers where appropriate.

---

# 68. SECURITY AUDIT

Perform a deep Phase 6 security audit.

Test:

```text
BOLA / IDOR
tenant escape
workspace escape
classification bypass
workflow privilege escalation
automation abuse
rule injection
connector abuse
data poisoning
prompt injection
AI tool abuse
resource exhaustion
race conditions
duplicate workflow execution
duplicate alerts
scheduled-job abuse
saved-search data leakage
watchlist leakage
analytics leakage
snapshot leakage
```

Especially test:

```text
Can a Viewer execute an administrative workflow?

Can a workflow access another investigation?

Can an AI tool invoke a protected analytical operation?

Can a user create a rule that reads unauthorized data?

Can a saved search expose restricted records?

Can a watchlist reveal a private entity?

Can an alert reveal a restricted investigation?

Can repeated events create thousands of alerts?

Can a workflow execute twice after a worker restart?

Can an imported dataset poison canonical entity relationships?

Can malicious imported text manipulate the AI?

Can a user use graph analytics to infer restricted entities?

Can an old snapshot expose resources that are no longer accessible?
```

Fix every confirmed vulnerability.

---

# 69. BUSINESS LOGIC AUDIT

Verify:

```text
Viewer
→ read-only

Contributor
→ cannot approve high-impact actions

Analyst
→ can analyze but cannot manage organization permissions

Reviewer
→ can approve configured reports/findings

Admin
→ manages authorized operational configuration

AI
→ cannot bypass permissions

Automation
→ cannot bypass permissions

Workflow
→ cannot execute unauthorized actions

Anomaly
→ is not automatically a confirmed finding

Similarity
→ is not automatically identity

Graph connection
→ is not automatically factual proof

AI inference
→ is not automatically verified evidence
```

---

# 70. TESTING

Create:

### Graph analytics tests

```text
centrality
paths
clusters
graph comparison
snapshot
large graph
```

### Entity resolution

```text
exact match
partial match
false positive
false negative
manual review
merge protection
```

### Anomaly detection

```text
baseline
normal activity
activity spike
false positive
review
dismissal
```

### Rules

```text
condition evaluation
AND/OR
threshold
scope
permissions
```

### Alerts

```text
creation
deduplication
cooldown
acknowledge
resolve
dismiss
```

### Workflows

```text
execution
pause
approval
resume
failure
retry
cancellation
idempotency
```

### Connectors

```text
authentication
validation
normalization
duplicate handling
partial failure
provenance
```

### AI

```text
tool authorization
tool budget
prompt injection
source grounding
analytical hallucination
```

---

# 71. PERFORMANCE TESTING

Test:

```text
1,000 entities
5,000 entities
10,000 entities
50,000 relationships
large timelines
large evidence collections
multiple concurrent workflows
multiple concurrent graph analyses
large saved searches
large alert streams
```

Measure actual:

```text
query latency
job latency
memory
CPU
queue depth
realtime latency
3D rendering performance
```

Do not invent benchmark results.

---

# 72. FRONTEND ROUTES

Add:

```text
/intelligence
/intelligence/graph
/intelligence/anomalies
/intelligence/findings
/intelligence/questions
/intelligence/briefings
/alerts
/watchlists
/workflows
/data-sources
```

Use the existing application shell.

Do not duplicate navigation systems.

---

# 73. INTELLIGENCE OPERATIONS UI

Build a high-end intelligence command center.

Visual hierarchy:

```text
GLOBAL STATUS
      ↓
SIGNALS
      ↓
ANOMALIES
      ↓
ALERTS
      ↓
ACTIVE INVESTIGATIONS
      ↓
ANALYTICAL GRAPH
      ↓
TIMELINE / MAP
      ↓
AI BRIEFING
```

Use a dense but readable professional interface.

Avoid generic dashboard cards everywhere.

---

# 74. 3D DESIGN LANGUAGE

The Phase 6 frontend should feel like an advanced intelligence workstation.

Use:

* layered dark surfaces where appropriate
* technical typography
* subtle grid systems
* depth
* volumetric-looking panels
* restrained glow
* data visualization
* smooth transitions
* spatial navigation
* command palette
* keyboard shortcuts

Do not use excessive neon effects.

Do not make every component glassmorphic.

Prioritize usability over visual effects.

---

# 75. 3D GRAPH EXPERIENCE

Add:

```text
Focus Mode
Cluster Mode
Timeline Mode
Geographic Mode
Investigation Mode
Alert Mode
```

Example:

```text
FOCUS ENTITY

Entity A
   │
   ├── Entity B
   ├── Entity C
   ├── Entity D
   └── Entity E
```

Allow the user to smoothly transition between:

```text
2D Graph
3D Graph
Map
Timeline
```

---

# 76. COMMAND PALETTE

Create an advanced command palette.

Commands:

```text
Open Investigation
Find Entity
Analyze Entity
Find Path
Analyze Graph
Detect Anomalies
Open Evidence
Generate Briefing
Open Alerts
Run Saved Search
Open Watchlist
Run Workflow
Open Report
```

All commands must check permissions.

---

# 77. KEYBOARD SHORTCUTS

Support:

```text
/
search

G
graph

M
map

T
timeline

A
alerts

I
AI

E
evidence

R
reports

?
shortcuts
```

Do not override browser/system shortcuts.

Allow accessibility alternatives.

---

# 78. ACCESSIBILITY

Maintain:

* keyboard navigation
* focus states
* semantic HTML
* ARIA where appropriate
* reduced motion support
* readable contrast
* screen-reader-compatible controls

3D visualizations must have accessible 2D alternatives.

---

# 79. MOBILE / TABLET

Do not attempt to squeeze the entire 3D workstation onto mobile.

Provide responsive alternatives:

```text
Desktop:
Full intelligence command center

Tablet:
Split analytical workspace

Mobile:
List + focused detail + AI
```

Preserve core functionality.

---

# 80. DOCUMENTATION

Create:

```text
docs/PHASE_6_ARCHITECTURE.md
docs/PHASE_6_GRAPH_ANALYTICS.md
docs/PHASE_6_ANOMALIES.md
docs/PHASE_6_AUTOMATION.md
docs/PHASE_6_CONNECTORS.md
docs/PHASE_6_AI_ORCHESTRATION.md
docs/PHASE_6_API.md
docs/PHASE_6_SECURITY_AUDIT.md
docs/PHASE_6_COMPLETE.md
```

Document:

* intelligence engine
* graph analytics
* entity resolution
* anomaly detection
* scoring
* rules
* alerts
* workflows
* scheduling
* connectors
* ingestion
* provenance
* AI orchestration
* 3D command center
* security findings
* performance findings
* limitations
* Phase 7 preparation

---

# 81. FINAL VERIFICATION

Run:

```text
lint
typecheck
unit tests
integration tests
security tests
AI evaluation tests
workflow tests
database migration validation
frontend tests
production build
```

Then manually verify:

```text
[ ] Intelligence dashboard works
[ ] Graph analytics work
[ ] Graph paths work
[ ] Graph comparison works
[ ] Community detection works
[ ] Entity resolution works
[ ] Similarity search works
[ ] Temporal analytics work
[ ] Anomaly detection works
[ ] Anomaly review works
[ ] Findings work
[ ] Intelligence questions work

[ ] Rules work
[ ] Rule builder works
[ ] Alerts work
[ ] Alert deduplication works
[ ] Watchlists work
[ ] Saved searches work

[ ] Workflow builder works
[ ] Workflow execution works
[ ] Workflow approval works
[ ] Workflow retry works
[ ] Workflow idempotency works
[ ] Scheduled jobs work

[ ] Connector abstraction works
[ ] Ingestion works
[ ] Normalization works
[ ] Provenance works
[ ] Failed ingestion is recoverable

[ ] AI orchestration works
[ ] AI tool authorization works
[ ] AI tool budgets work
[ ] AI citations work

[ ] Intelligence briefing works
[ ] Graph → AI works
[ ] Alert → investigation works
[ ] Anomaly → investigation works

[ ] 3D graph works
[ ] 3D timeline works
[ ] Map synchronization works
[ ] Graph performance is acceptable
[ ] Mobile fallback works

[ ] Tenant isolation verified
[ ] RBAC verified
[ ] Classification verified
[ ] Workflow permissions verified
[ ] Connector permissions verified
[ ] Analytics permissions verified
[ ] No data leakage
[ ] No secrets exposed
[ ] No console errors
[ ] No runtime errors
```

Do not disable tests to obtain a passing build.

Fix the underlying problems.

---

# 82. PHASE 6 COMPLETION REPORT

Create:

```text
docs/PHASE_6_COMPLETE.md
```

Include:

* intelligence architecture
* graph analytics
* temporal analytics
* geospatial analytics
* entity resolution
* anomaly detection
* findings
* rules
* alerts
* watchlists
* saved searches
* workflow engine
* scheduler
* connectors
* ingestion
* provenance
* AI orchestration
* intelligence briefing
* 3D command center
* performance results
* security audit
* test results
* known limitations
* Phase 7 preparation

Finally output:

```text
========================================
       ATLAS PHASE 6 COMPLETE
========================================

INTELLIGENCE ENGINE:       READY
GRAPH ANALYTICS:           READY
ENTITY RESOLUTION:         READY
SIMILARITY ENGINE:         READY
TEMPORAL ANALYTICS:        READY
GEOSPATIAL ANALYTICS:      READY

ANOMALY DETECTION:         READY
INTELLIGENCE FINDINGS:     READY
RULE ENGINE:               READY
ALERT ENGINE:              READY
WATCHLISTS:                READY
SAVED SEARCHES:            READY

WORKFLOW ENGINE:           READY
SCHEDULER:                 READY
HUMAN APPROVAL:            READY
JOB PROCESSING:            READY
IDEMPOTENCY:               VERIFIED

CONNECTOR SYSTEM:          READY
INGESTION PIPELINE:        READY
DATA NORMALIZATION:        READY
PROVENANCE:                READY

AI ORCHESTRATION:          READY
AI TOOL GOVERNANCE:        VERIFIED
AI ANALYTICS:              READY
INTELLIGENCE BRIEFINGS:    READY

3D COMMAND CENTER:         READY
TEMPORAL 3D:               READY
GRAPH/MAP SYNC:             READY
PERFORMANCE:               VERIFIED

TENANT ISOLATION:           VERIFIED
RBAC:                       VERIFIED
WORKFLOW SECURITY:          VERIFIED
DATA PROVENANCE:            VERIFIED
AUTOMATION SAFETY:          VERIFIED

SECURITY AUDIT:             PASSED
UNIT TESTS:                 PASSED
INTEGRATION TESTS:          PASSED
AI TESTS:                   PASSED
WORKFLOW TESTS:             PASSED
FRONTEND TESTS:             PASSED
TYPECHECK:                  PASSED
PRODUCTION BUILD:           PASSED

NEXT:
PHASE 7 — Enterprise Hardening, Scale & Final ATLAS Platform
========================================
```

STOP after Phase 6.

Do not automatically start Phase 7.
