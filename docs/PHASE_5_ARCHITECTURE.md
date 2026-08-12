# ATLAS Phase 5 — Architecture

Phase 5 adds three capability areas on top of the Phase 1–4 foundation:
**Evidence Vault**, **Reports**, and **Real-Time Collaboration**. All of it
keeps the Phase 1 rules: server-side authorization is the only enforcement
point, every org-owned row carries `organizationId`, and the frontend never
trusts its own role checks as a security boundary.

## Stack & conventions reused

- **API** (`apps/api`): NestJS 11 + Prisma 6 + PostgreSQL. Global
  `AuthGuard → PermissionsGuard → RateLimitGuard` in `app.module.ts`.
  `@RequirePermission('domain.action')` gates routes; `InvestigationAccessService`
  gates investigation-scoped resources (`requireCapability` with the
  VIEWER=1…LEAD=4 rank map).
- **Shared contracts** (`packages/shared`): `Permission` union extended with
  Phase 5 domains (`evidence.download/annotate/process/classify`,
  `report.update/delete/review/approve/export`, `comment.*`,
  `notification.*`, `collaboration.read`). Every Prisma enum is mirrored in
  shared + asserted by `src/prisma/enum-parity.spec.ts`.
- **Web** (`apps/web`): Next.js 15 App Router, react-query over a typed
  `api-client`, zustand stores, Tailwind design tokens (`void`/`phosphor`/
  `amber`/`slate`/`danger`), component classes `.panel/.tech-input/
  .tech-button(-primary/-danger)/.mono-label/.hairline`.

## New data model

See `apps/api/prisma/schema.prisma`. Highlights:

- **Evidence** gains `storageKey`, `originalFilename`, `processingStatus`,
  `verifiedAt` and child tables: `EvidenceVersion` (immutable file snapshots
  with server-computed SHA-256), `EvidenceAccessEvent` (chain of custody),
  `EvidenceAnnotation`, `EvidenceProcessingJob`, `EvidenceLink`.
- **Report** becomes the Phase 5 report model (`status` now the 6-state
  DRAFT/IN_REVIEW/CHANGES_REQUESTED/APPROVED/PUBLISHED/ARCHIVED,
  `classification`, `aiGenerated`, `aiStatus`, `currentVersion`, `templateId`)
  with `ReportVersion/Section/Block/Citation/Review/Approval` and
  `ReportTemplate`.
- **Collaboration**: `Comment`/`CommentReply`/`Mention`, `Notification`,
  `PresenceSession`, `CollaborationEvent`, and a generic `BackgroundJob` queue.

## Module layout

```
apps/api/src/
  evidence/            Evidence Vault (upload/download/access/hash/version/
                       annotations/links/search/processing)
  reports/             Report builder, workflow, export, AI
  collaboration/       Comments, notifications, presence, collaboration events
  jobs/                DB-backed in-process job queue + runner
  rate-limit/          Custom per-user sliding-window guard
```

## Key decisions

- **Storage**: local disk under `ATLAS_STORAGE_DIR` (`EvidenceStorageService`),
  with a path-traversal guard. Never exposed as permanent URLs; delivery flows
  through `/evidence/:id/download` (bearer) or short-lived signed URLs.
- **Realtime**: reuses the Phase 3 SSE transport (ticket + stream) for all
  Phase 5 payloads. `StreamMessage.type` extended with
  `evidence|report|presence|comment|notification`. `RealtimeService.publishToUser`
  added for user-scoped delivery. Presence heartbeats are REST POSTs; only
  deltas are broadcast.
- **Report editing**: server-authoritative section/block sync, no CRDT.
  Autosave bumps `currentVersion`; conflicts surface as 409 rather than silent
  last-write-wins.
- **Background work**: single-instance DB-polled queue (`BackgroundJob`) with
  idempotent enqueue, atomic claim, retry/backoff, and safe error messages.
- **PDF export**: `pdfkit` (pure JS), inline buffer for moderate reports,
  classification watermark + page numbers + citations, restricted content
  filtered for unauthorized callers.
