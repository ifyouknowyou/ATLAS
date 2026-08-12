# ATLAS Phase 5 — Collaboration

Real-time, context-aware collaboration — not a general chat product.

## Transport

Reuses the Phase 3 SSE transport: bearer POST to `/realtime/ticket`, then
`EventSource /realtime/stream?token=…`. `StreamMessage.type` is extended with
`evidence | report | presence | comment | notification`. Per-connection
sequence numbers + `Last-Event-ID` give gap-free replay on reconnect. The web
client (`lib/realtime.ts`, `lib/realtime-store.ts`) maintains a truthful
connection state (connecting/connected/reconnecting/offline) and drives
react-query invalidation + store slices.

## Comments & mentions (§39–§40)

- Comments attach to INVESTIGATION, ENTITY, EVIDENCE, TIMELINE_EVENT, REPORT,
  REPORT_BLOCK, NOTE, RELATIONSHIP via a polymorphic `CollaborationAccessService`
  (Prisma + InvestigationAccessService only — no module cycles).
- `@mention` resolution only considers users who can read the target; users
  without access are silently dropped (mentioning never reveals inaccessible
  users). Mentions create permission-aware `Mention` + `Notification` rows.
- React-query `CommentComposer` renders bodies as text (React escapes them), so
  stored `<script>` never executes.

## Notifications (§41–§42)

- `/notifications`: list, unread count, mark read/all read, kind filtering.
- `NotificationsService.create` is **permission-aware**: a notification is only
  created if the recipient can read the target — never a link to an
  inaccessible resource. The destination endpoint re-authorizes independently,
  so a notification is a hint, never a bypass.
- User-scoped delivery rides `RealtimeService.publishToUser` (org-scoped).

## Presence (§36)

- Heartbeats are REST POSTs (`/collaboration/:resourceType/:resourceId/presence`)
  that upsert `PresenceSession`; only deltas are broadcast over SSE.
- `activeNow` lists users seen within 30s, access-filtered, exposing only a
  name + status.

## Realtime report editing (§37–§38)

- Server-authoritative section/block sync; the builder broadcasts
  `ReportDeltaPayload` per mutation. Autosave compares `baseVersion`; a
  collaborator's intervening save surfaces a 409 Conflict (explicit reconcile)
  rather than silent last-write-wins.
- `RealtimeStatusPill` shows only truthful states (● Saved / Syncing /
  Reconnecting / Offline) — never a fake "synced" indicator.

## Activity feed (§45)

`/activity` consumes the SSE stream's `activity` events with filters
(All/Evidence/Reports/Collaboration/Investigation/AI). `CollaborationEventsService`
persists a `CollaborationEvent`, records an `ActivityEvent`, and broadcasts —
one source for §37-style investigation updates.