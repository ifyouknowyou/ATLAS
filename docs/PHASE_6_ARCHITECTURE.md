# ATLAS Phase 6 — Architecture

Phase 6 transforms ATLAS from an intelligence workspace into a complete **Intelligence Operations Platform** with advanced analytics, automation, and orchestration capabilities.

## Overview

Phase 6 adds:
- **Advanced Graph Analytics**: centrality, community detection, path analysis, change detection
- **Entity Resolution**: intelligent matching and deduplication
- **Anomaly Detection**: temporal, relationship, and pattern anomalies
- **Intelligence Scoring**: multi-dimensional analytical relevance
- **Rule Engine**: declarative conditions → actions with safe tool execution
- **Alert System**: severity-based alerts with deduplication and routing
- **Workflow Engine**: human-in-the-loop automation with durable execution
- **Watchlists**: change detection on tracked resources
- **Saved Searches**: reusable analytical queries
- **Data Connectors**: safe ingestion with provenance tracking
- **AI Orchestration**: multi-step research workflows with tool budgets
- **Intelligence Dashboard**: operational command center with 3D visualization

## Architecture Principles

1. **Read-First Analytics**: Graph analytics, anomaly detection, and entity resolution operate on existing data without modifying canonical records
2. **Human-in-the-Loop**: High-impact workflow actions require explicit approval
3. **Authorization-Aware**: Every analytical operation enforces org/workspace/investigation scope
4. **Explainable Results**: All analytical outputs include source references and confidence factors
5. **Idempotent Jobs**: Background processing is retry-safe with deduplication
6. **Provenance**: External data tracks source, connector, import job, and transformation version

## Stack & Conventions Reused

- **API** (`apps/api`): NestJS 11 + Prisma 6 + PostgreSQL
- **Authorization**: `@RequirePermission`, `InvestigationAccessService`, org-scoped queries
- **Background Jobs**: Phase 5 `BackgroundJob` queue extended with Phase 6 job types
- **Realtime**: Phase 5 SSE transport for alerts, workflow status, presence updates
- **AI**: Phase 4 AI engine extended with analytical tools and orchestration
- **Web** (`apps/web`): Next.js 15, react-query, zustand, Tailwind design system

## New Data Model

Added to `apps/api/prisma/schema.prisma`:

### Analytics
- `GraphAnalysis`: stored analysis results (centrality, clusters, paths)
- `GraphSnapshot`: point-in-time graph state for comparison
- `GraphChange`: detected differences between snapshots
- `EntityMatchCandidate`: potential duplicate entities with similarity score
- `EntityMatchDecision`: human review decisions (MERGE, REJECT, IGNORE)
- `Anomaly`: detected anomalies with baseline, observed value, explanation
- `AnomalyEvidence`: supporting records for anomaly detection

### Rules & Alerts
- `IntelligenceRule`: declarative conditions and actions
- `RuleCondition`: individual condition clauses (AND/OR groups)
- `RuleAction`: actions to execute when rule fires
- `Alert`: generated alerts with severity, status, assignment
- `AlertEvent`: alert lifecycle events (ACK, RESOLVE, DISMISS)

### Workflows
- `Workflow`: workflow definitions with steps and approval gates
- `WorkflowStep`: individual workflow steps with type and config
- `WorkflowRun`: execution instances with resumability
- `WorkflowRunStep`: per-step execution state
- `WorkflowApproval`: human approval records

### Data Sources
- `DataSource`: external data source registry
- `Connector`: connector configuration with encrypted secrets
- `IngestionJob`: import job tracking
- `IngestionRecord`: individual imported records with provenance

### Analytical Artifacts
- `Watchlist`: tracked resources with change detection
- `WatchlistItem`: individual watchlist entries
- `SavedSearch`: reusable queries with filters
- `IntelligenceFinding`: analytical conclusions requiring review
- `FindingSource`: evidence supporting a finding
- `IntelligenceQuestion`: explicit unanswered questions
- `IntelligenceBriefing`: AI-generated summaries with citations
- `BriefingSource`: cited sources in briefings
- `AnalyticsSnapshot`: saved analytical state

## Module Layout

```
apps/api/src/
  intelligence/
    analytics/          Graph analytics service
    patterns/           Pattern detection algorithms
    anomalies/          Anomaly detection service
    entity-resolution/  Entity matching and deduplication
    temporal/           Time-series analytics
    geospatial/         Geographic analytics
    scoring/            Multi-dimensional scoring
    
  rules/
    rules.service.ts    Rule engine with condition evaluator
    rules.controller.ts Rule CRUD and testing
    
  alerts/
    alerts.service.ts   Alert generation, routing, deduplication
    alerts.controller.ts Alert management
    
  workflows/
    workflows.service.ts    Workflow definition and execution
    workflow-runner.ts      Durable execution engine
    workflow-approval.ts    Human approval gates
    workflows.controller.ts Workflow CRUD and control
    
  watchlists/
    watchlists.service.ts    Change detection on tracked resources
    watchlists.controller.ts Watchlist management
    
  connectors/
    connector.service.ts     Connector abstraction
    normalization.service.ts Data transformation pipeline
    ingestion.service.ts     Import orchestration
    provenance.service.ts    Source tracking
    
  intelligence-ai/
    orchestrator.service.ts  Multi-step AI workflows
    analytical-tools.ts      Read-only AI tools for analytics
    briefing.service.ts      Intelligence briefing generation

apps/web/src/features/
  intelligence/
    components/         Intelligence dashboard UI
    analytics/          Analytics visualization
    alerts/             Alert center
    workflows/          Workflow builder and monitor
    watchlists/         Watchlist management
    
  intelligence-3d/
    command-center/     3D intelligence visualization
    temporal-graph/     Time-based graph rendering
    cluster-viz/        Community visualization
```

## Key Design Decisions

### Graph Analytics
- **In-Memory Computation**: Large graph operations run in background jobs, not synchronously in request handlers
- **Snapshot-Based Comparison**: Change detection compares stored snapshots rather than recomputing
- **Authorization-Aware**: Graph algorithms respect investigation scope and classification

### Entity Resolution
- **Manual Review Required**: No automatic merging; all matches require human decision
- **Explainable Matching**: Similarity scores break down by factor (name, attributes, relationships)
- **Audit Trail**: Every merge/reject decision is logged with actor and timestamp

### Anomaly Detection
- **Baseline Tracking**: Anomalies are relative to computed or configured baselines
- **Multi-Signal**: Combines temporal, relationship, and pattern-based detection
- **Review Workflow**: Anomalies start as NEW, require analyst review

### Rule Engine
- **Declarative Conditions**: JSON-based rule definitions, no arbitrary code execution
- **Safe Tool Execution**: Rules can only invoke whitelisted, rate-limited tools
- **Audit Logging**: Every rule evaluation and action is logged

### Workflow Engine
- **Durable Execution**: Workflows survive server restarts via database state
- **Approval Gates**: High-impact actions pause execution until human approval
- **Idempotent Steps**: Steps track completion state to avoid duplicate execution
- **Error Recovery**: Failed steps can be retried or manually completed

### Data Connectors
- **Provider Abstraction**: Connectors implement standard interface (authenticate, fetch, normalize)
- **Secrets Management**: Connector credentials encrypted at rest, never in logs
- **Provenance Tracking**: Every imported record links back to source, job, and connector
- **Validation Pipeline**: Untrusted external data validated before ingestion

### AI Orchestration
- **Tool Budget**: AI calls are rate-limited per request (max calls, max tokens, timeout)
- **Read-Only Tools**: Phase 6 AI tools are read-only analytical operations
- **Citation Required**: AI outputs must reference source records
- **Human Review**: AI-generated findings require explicit analyst confirmation

### Intelligence Dashboard
- **Real-Time Updates**: Alerts, workflow status, anomalies stream via SSE
- **Multi-Dimensional View**: Graph, timeline, map, and metrics synchronized
- **3D Command Center**: Enhanced Phase 3 visualization with analytical overlays
- **Contextual Drill-Down**: Click any metric to see supporting records

## Security Model

### Authorization
- Every intelligence operation enforces org/workspace/investigation/classification scope
- Rule execution cannot bypass user permissions
- Workflow actions use the workflow owner's permissions, validated at each step
- AI tools enforce same authorization as direct API access

### Rate Limiting
- Graph analytics: max concurrent jobs per org
- Entity resolution: max candidates per request
- Rule evaluation: max evaluations per minute per org
- Workflow execution: max concurrent runs per workflow
- AI orchestration: max tokens per day per user
- Connector ingestion: max records per job

### Data Isolation
- Analytics results scoped to investigation/workspace
- Saved searches cannot access other org's data
- Watchlists only track accessible resources
- Briefings only cite authorized records

### Audit Trail
- All rule evaluations logged with conditions and results
- All workflow executions logged with steps and approvals
- All alert generations logged with sources
- All AI orchestration logged with tool calls and tokens

## Performance Considerations

- **Async Analytics**: Large graph computations run as background jobs
- **Incremental Updates**: Change detection compares snapshots, not full recomputation
- **Cached Baselines**: Anomaly detection caches baseline statistics
- **Debounced Rules**: Rule engine deduplicates rapid-fire events
- **Batch Ingestion**: Connectors process records in configurable batches
- **Query Optimization**: Analytics queries use covering indexes

## Integration Points

### Phase 5 Integration
- Alerts generate notifications via collaboration system
- Workflow steps can create/update reports
- Intelligence briefings can be saved as report sections
- Background job queue handles all async work

### Phase 4 Integration
- AI orchestrator extends Phase 4 AI engine
- Analytical tools added to Phase 4 tool registry
- Briefings use Phase 4 RAG and citation system
- Entity resolution uses Phase 4 embeddings for semantic similarity

### Phase 3 Integration
- Graph analytics extend Phase 3 graph engine
- Temporal analytics use Phase 3 timeline
- Geospatial analytics use Phase 3 map/globe data
- 3D command center enhances Phase 3 visualization

## Observability

Metrics tracked:
- Graph analysis latency (p50, p95, p99)
- Entity resolution candidates per analysis
- Anomaly detection rate and false positive rate
- Rule evaluation latency and firing rate
- Alert generation rate and resolution time
- Workflow execution latency and failure rate
- Connector sync latency and error rate
- AI orchestration token usage and cost

## Testing Strategy

- **Unit Tests**: Condition evaluator, scoring algorithms, pattern detection
- **Integration Tests**: End-to-end rule → alert → workflow flows
- **Security Tests**: Authorization bypass, prompt injection, data leakage
- **Performance Tests**: Large graph analytics, concurrent workflow execution
- **Evaluation Tests**: Entity resolution accuracy, anomaly detection quality

## Phase 7 Preparation

Phase 6 prepares for Phase 7 production hardening by:
- Structured observability (logs include correlation IDs)
- Graceful degradation (analytics failures don't break core features)
- Resource limits (prevent runaway jobs)
- Audit completeness (every consequential action logged)
- Error handling (safe user-facing messages, detailed internal logs)
