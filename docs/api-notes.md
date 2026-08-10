# ATLAS API Notes

Compact working reference for the Phase 1 API (`apps/api`, NestJS 11). Base URL in dev:
`http://127.0.0.1:4100/api` (the web app proxies `/api/*` to it on port 4100).

## Authentication

- `POST /auth/login` — `{ email, password }` → `200 { accessToken, session }`
  - `session` = `{ userId, organizationId, workspaceId, role, permissions[] }`
  - Every request after login sends `Authorization: Bearer <accessToken>`.
- `GET /auth/session` — re-resolves the principal from the DB (fresh role/permissions).
- `POST /auth/logout` — revokes the server-held session (`204`).
- Login is throttled per-IP (disabled under `NODE_ENV=test`).

## Error contract

Every non-2xx response has the same shape:

```json
{
  "error": {
    "code": "UNAUTHORIZED | FORBIDDEN | NOT_FOUND | CONFLICT | VALIDATION_FAILED | INVALID_CREDENTIALS | RATE_LIMITED | INTERNAL_ERROR",
    "message": "user-presentable message",
    "requestId": "correlates with the x-request-id header",
    "details": [ { "field": "title", "message": "..." } ]
  }
}
```

`500` responses never leak internals.

## Roles & permissions

Roles: `OWNER`, `ADMIN`, `ANALYST`, `INVESTIGATOR`, `VIEWER`.
Permissions (central matrix in `packages/shared`): `investigation.*`, `entity.*`,
`evidence.*`, `report.*`, `workspace.manage`, `members.manage`, `settings.manage`.

Authorization is **server-side only**. Resources are always scoped to the caller's
`organizationId` (never trusted from client input).

## Endpoints

| Method | Path | Permission | Notes |
| --- | --- | --- | --- |
| GET | `/health` | public | liveness + DB probe |
| POST | `/auth/login` | public | throttled |
| POST | `/auth/logout` | auth | revokes session |
| GET | `/auth/session` | auth | fresh principal |
| GET/PATCH | `/users/me` | auth | own profile |
| GET | `/users` | `members.manage` | org members |
| GET/PATCH | `/organizations/me` `/organizations/me/settings` | auth / `settings.manage` | org + counts |
| GET | `/organizations/me/members` | `members.manage` | member list |
| PATCH | `/organizations/me/members/:userId/role` | `members.manage` | last-OWNER protected |
| GET/POST | `/workspaces` | auth / `workspace.manage` | org-scoped |
| PATCH/DELETE | `/workspaces/:id` | `workspace.manage` | org-scoped |
| POST | `/workspaces/:id/activate` | auth | sets active workspace |
| GET/POST | `/investigations` | `investigation.read` / `.create` | list supports `status`, `priority`, `workspaceId`, `q`, `limit`, `offset` |
| GET/PATCH/DELETE | `/investigations/:id` | read/update/delete | org-scoped, includes `_count` |
| GET/POST | `/entities` | `entity.read` / `.create` | list supports `type`, `investigationId`, `workspaceId`, `q` |
| GET/PATCH/DELETE | `/entities/:id` | read/update/delete | includes relationships |

Validation uses `class-validator`; unknown DTO fields are stripped; UUIDs are parsed.

## Demo seed (dev only)

`npm run db:seed` (or `npm run prisma:seed -w @atlas/api`) creates the **ATLAS Demo
Organization** (all data fictional) with:

- Users: `admin@atlas.demo`, `analyst@atlas.demo`, `investigator@atlas.demo`,
  `viewer@atlas.demo` — password `AtlasDemo#2026` (via `DEMO_OWNER_PASSWORD`).
- One workspace, 3 investigations (Alpha/Beta/Gamma), 9 entities, 6 relationships,
  plus evidence/notes/timeline/activity/report.

Seeded resources are marked `isDemo` on the organization and never mixed with real data.

## Run it

```bash
docker compose up -d atlas-postgres            # Postgres on :5434 (test on :5435)
npm run db:migrate -w @atlas/api               # apply migrations
npm run prisma:seed -w @atlas/api              # demo data
npm run dev:api                                # API :4100
npm run dev:web                                # Web :3000
npm run gate                                   # typecheck + lint + unit + integration + build
```
