# ATLAS — 7 Phase Roadmap

**ATLAS** is a production-grade, web-based AI Intelligence & Investigation Platform for
**lawful, authorized investigations**, security research, threat intelligence, corporate
intelligence, and research workflows.

This document defines the seven delivery phases. Each phase lands a working, tested slice of the
platform and ends with a build gate (typecheck → lint → unit → integration → production build).

---

## Phase 1 — Foundation

Architecture, design system, authentication foundation, RBAC, multi-tenancy, workspace shell,
database foundation, security baseline, API foundation, and the isolated 3D environment.

Deliverables:

- Monorepo (npm workspaces): `apps/web` (Next.js), `apps/api` (NestJS), `packages/shared`.
- PostgreSQL + Prisma schema/migrations for Phase 1 models.
- Session auth (email/password + JWT), RBAC roles (`OWNER`, `ADMIN`, `ANALYST`, `INVESTIGATOR`, `VIEWER`),
  centralized permission model, organization/workspace tenancy with server-side ownership checks.
- API boundaries: `/health`, `/auth`, `/users`, `/organizations`, `/workspaces`, `/investigations`, `/entities`.
- Intelligence-Operations design system; application shell + navigation; Overview/landing page with
  hero 3D globe (Three.js / React Three Fiber / Drei, lazy-loaded, WebGL fallback).
- Demo tenant seeded with fictional data clearly marked as demo.

Exit: `PHASE_1_COMPLETE.md`, all gates passing.

## Phase 2 — Investigation & Entity Intelligence

Cases, investigations, entities, relationships, evidence, notes, entity profiles and
investigation workflows.

Deliverables:

- Full CRUD for investigations, entities, relationships, evidence, notes.
- Entity profile pages and investigation workflow states.
- Activity events woven through investigations.

## Phase 3 — Graph & Geospatial Intelligence

Interactive relationship graphs, timelines, maps, 3D globe, geographic layers and advanced
visualization.

Deliverables:

- Force-directed relationship graph from real data.
- Timeline visualization of `TimelineEvent`.
- Map + geographic layers; 3D globe fed by real entity geo data.
- Advanced camera/interaction tooling.

## Phase 4 — AI Intelligence Engine

AI research assistant, contextual retrieval, knowledge graph reasoning, investigation summaries and
AI-assisted workflows.

Deliverables:

- AI assistant chat bound to investigation context.
- Retrieval over entities/evidence/notes with tenant isolation.
- Knowledge-graph reasoning and investigation summaries.
- AI integration boundary enforced server-side (no client-side provider secrets).

## Phase 5 — Evidence, Reports & Collaboration

Evidence management, report builder, document generation, collaboration, activity streams and
real-time workspace synchronization.

Deliverables:

- Evidence files (minio-backed), report builder and document generation.
- WebSocket/SSE realtime sync; collaboration cursors/mentions.
- Activity stream everywhere.

## Phase 6 — Advanced Intelligence & Automation

Investigation automation, intelligence pipelines, correlation engines, alerting, advanced analytics
and workflow automation.

Deliverables:

- Automation/rule engine for investigations.
- Correlation and alerting; advanced analytics dashboards.

## Phase 7 — Production Hardening

Security hardening, performance optimization, observability, testing, accessibility, deployment,
disaster recovery and final production audit.

Deliverables:

- Hardening audit (OWASP), observability (logs/metrics/traces), load/performance tuning.
- Accessible UI, containerized deployment (Docker), backup/DR runbooks.

---

## Cross-cutting principles

- TypeScript **strict mode**, no gratuitous `any`.
- Server-side authorization is mandatory; never trust client org/workspace IDs.
- DB-level tenant isolation where appropriate; frontend role checks are never the enforcement point.
- The 3D engine is isolated from the normal application bundle (lazy-loaded).
- Demo data is clearly identified and separated from real data.
- Later phases reuse the Phase 1 foundation rather than rewriting it.