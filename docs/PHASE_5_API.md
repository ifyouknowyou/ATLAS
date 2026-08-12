# ATLAS Phase 5 — API Reference

All endpoints under `/api`, bearer-authenticated, `@RequirePermission`-gated,
rate-limited where noted. Error shape: `{ error: { code, message, requestId } }`.

## Evidence Vault

| Method | Path | Permission | Notes |
|---|---|---|---|
| POST | `/evidence/upload` | `evidence.create` | multipart; magic-byte + size validation; server SHA-256 |
| GET | `/evidence` | `evidence.read` | filters: type, status, classification, investigationId, q |
| GET | `/evidence/search` | `evidence.read` | advanced filters + date + hash + uploader |
| GET | `/evidence/:id` | `evidence.read` | detail incl. `_count` |
| PATCH | `/evidence/:id` | `evidence.update` | metadata; classification change audited + `evidence.classify` |
| DELETE | `/evidence/:id` | `evidence.delete` | chain-of-custody DELETED event |
| POST | `/evidence/:id/archive` · `/restore` | `evidence.update` | status flip + access event |
| GET | `/evidence/:id/versions` | `evidence.read` | version list |
| POST | `/evidence/:id/versions/:n/restore` | `evidence.update` | new version from historical bytes |
| GET | `/evidence/:id/access-history` | `evidence.read` | chain-of-custody |
| GET/POST | `/evidence/:id/annotations` | `evidence.read` / `annotate` | annotation list/create |
| PATCH | `/evidence/annotations/:aid` | `evidence.annotate` | author-or-privileged |
| POST | `/evidence/annotations/:aid/resolve` | `evidence.annotate` | resolve/reopen |
| DELETE | `/evidence/annotations/:aid` | `evidence.annotate` | author-or-privileged |
| GET/POST | `/evidence/:id/links` · DELETE `/links/:t/:tid` | `evidence.read`/`update` | validated target access |
| POST | `/evidence/:id/process` | `evidence.process` | enqueue extraction job |
| GET | `/evidence/:id/processing` | `evidence.read` | job statuses |
| GET | `/evidence/:id/download` · `/preview` | `evidence.read` | authorized streaming (rate 60/min) |
| GET | `/evidence/:id/signed-url` | `evidence.read` | ~120s scoped token |
| GET | `/evidence/deliver/:token` | `@Public` | **delivery-time re-authz** |

## Reports

| Method | Path | Permission | Notes |
|---|---|---|---|
| GET | `/reports` | `report.read` | list + filters |
| POST | `/reports` | `report.create` | create |
| GET | `/reports/templates` | `report.read` | system templates |
| POST | `/reports/from-template` | `report.create` | hydrate sections from template |
| GET/PATCH/DELETE | `/reports/:id` | `read`/`update`/`delete` | CRUD |
| POST | `/reports/:id/sections` · PATCH `/sections/:sid` · move · delete | `report.update` | builder |
| POST | `/reports/:id/sections/:sid/blocks` · PATCH/DELETE `/blocks/:bid` · move | `report.update` | builder |
| GET/POST | `/reports/:id/versions` | `read`/`update` | version list / create snapshot |
| GET/POST/DELETE | `/reports/:id/citations` | `read`/`update` | citation CRUD (validated targets) |
| GET | `/reports/:id/quality` | `report.read` | §48 validation result |
| POST | `/reports/:id/submit` | `report.update` | DRAFT → IN_REVIEW |
| POST | `/reports/:id/review` | `report.review` | APPROVE/REJECT/REQUEST_CHANGES |
| POST | `/reports/:id/approve` | `report.approve` | explicit approval record |
| POST | `/reports/:id/publish` | `report.publish` | quality + approved + no unverified AI |
| POST | `/reports/:id/archive` | `report.delete` | ARCHIVED |
| GET | `/reports/:id/export?format=PDF\|HTML\|JSON` | `report.export` | stream (rate 5/min) |
| POST | `/reports/:id/ai/generate` | `report.update` | AI draft, REVIEW_REQUIRED |
| POST | `/reports/:id/ai/review` | `report.review` | advisory flags |

## Collaboration

| Method | Path | Permission | Notes |
|---|---|---|---|
| GET | `/comments?targetType=&targetId=` | `collaboration.read` | thread + replies |
| POST | `/comments` | `comment.create` | creates mentions + notifications |
| POST | `/comments/:id/replies` | `comment.create` | reply (+author notify) |
| PATCH | `/comments/:id` | `comment.create` | author-or-privileged edit |
| POST | `/comments/:id/resolve` | `comment.resolve` | resolve/reopen |
| DELETE | `/comments/:id` | `comment.delete` | author-or-privileged |
| GET | `/notifications` | `notification.read` | list (30s poll) |
| GET | `/notifications/unread-count` | `notification.read` | badge |
| PATCH | `/notifications/:id/read` · `/read-all` | `notification.read` | mark read |
| POST/GET/DELETE | `/collaboration/:type/:id/presence` | `collaboration.read` | heartbeat / active-now / leave |
| POST | `/realtime/ticket` · GET `/realtime/stream` | `investigation.read` / `@Public` | SSE handshake (rate-limited) |
