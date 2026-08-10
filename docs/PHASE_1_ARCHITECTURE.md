# ATLAS — Phase 1 Architecture Assessment

**Date:** 2026-08-10
**Scope:** `docs/PHASE_1_ARCHITECTURE.md` (per `phase1.md` §1)

---

## 1. Current architecture

The repository began as an **empty directory** containing only `phase1.md`. No prior
application, framework, or database existed to reuse, so the stack was chosen fresh per
`phase1.md` §4 ("if choosing the stack from scratch, prefer…").

This document records the decisions made, the resulting structure, and the boundaries that
later phases will build on — without implementing them.

## 2. Existing technologies

None (greenfield). Available tooling on the working machine: Node.js 24, npm 11, Docker with
`postgres:16-alpine` containers, and OS-level `psql`.

## 3. Existing problems

- Greenfield: no baseline to be compatible with, which also means nothing constrains mistakes.
- No committed dependency on a real database until Phase 1 provisioning was done.

## 4. Proposed ATLAS architecture

A **single-repository monorepo** using **npm workspaces**, with three packages:

```text
apps/
  api/   NestJS + Prisma + PostgreSQL        (REST JSON API, all auth/tenancy)
  web/   Next.js 15 (App Router) + React 19  (client UI + isolated 3D globe)
packages/
  shared/ TypeScript contracts               (roles, permissions, entity types, API errors)
```

### Why this split

- The spec mandates a *strongly typed API architecture* (NestJS) and a *Next.js* frontend;
  they evolve at different speeds, so they live in separate workspaces with separate build
  gates.
- `@atlas/shared` holds the **permission matrix and API error contract** once, so the API
  enforcement and the web UX-affordance checks can never drift out of agreement (verified by
  an enum-parity unit test against the Prisma schema).

## 5. Directory structure

```text
ATLAS/
├── apps/api/src/
│   ├── auth/          login, sessions, AuthGuard, throttling
│   ├── rbac/          @RequirePermission + PermissionsGuard
│   ├── config/        validated, typed env (AppConfig)
│   ├── prisma/        PrismaModule + PrismaService
│   ├── common/        error filter (ApiErrorBody), request-id, pagination, logging
│   └── {health,users,organizations,workspaces,investigations,entities}/
├── apps/web/src/
│   ├── app/           routes: login, overview, investigations, entities, placeholders
│   ├── components/    layout shell + design-system primitives
│   ├── features/globe/ Three.js/R3F (lazy-loaded, isolated)
│   └── lib/           api-client, auth-store, queries, presentation
├── packages/shared/src/
└── docs/
```

## 6. Data flow

```text
Browser (apps/web)  ── fetch('/api/*') ── Next rewrite ──> NestJS (:4100)
   │                                                        │
   └─ token in Authorization header ───── AuthGuard (JWT+ActiveSession)
                                              │ re-reads Membership
                                              ▼
                                     PermissionsGuard (@RequirePermission)
                                              │
                                              ▼
                                 Resource services (scoped by principal.organizationId)
                                              │
                                              ▼
                                          Prisma/Postgres
```

Every request goes through: **AuthGuard** (validates token *and* server-held session, re-reads
the DB membership row so role changes apply immediately) → **PermissionsGuard** (checks
declared `@RequirePermission`) → **service layer** (all Prisma queries scoped to the
principal's `organizationId`, never trusting client-supplied org/workspace ids).

## 7. Authentication strategy

- **Email/password** with bcrypt-only password storage (no plaintext, no reversible formats).
- On login: create a random `ActiveSession` row (`sid`) and issue a short-lived JWT binding
  `{sub, sid, oid}`. The JWT alone is insufficient — its `sid` must reference a live session
  row, so **logout revokes immediately**.
- `GET /api/auth/session` re-resolves the principal so the frontend always shows the
  server-authoritative role/permissions.
- Rate-limited login (per-IP throttle) + helmet headers + strict CORS allow-list.
- Frontend stores the opaque token in `localStorage` (documented Phase 7 hardening: HttpOnly
  SameSite cookies through a same-origin proxy). No server credentials ever reach the browser.

## 8. Authorization strategy

- **Roles:** `OWNER`, `ADMIN`, `ANALYST`, `INVESTIGATOR`, `VIEWER`.
- **Permissions:** `investigation.*`, `entity.*`, `evidence.*`, `report.*`,
  `workspace.manage`, `members.manage`, `settings.manage` (matrix in `@atlas/shared`).
- Enforcement is **server-side only** (`PermissionsGuard` uses the freshly-DB-resolved role).
- The web `Sidebar` and pages hide entries a user cannot act on, but this is **affordance,
  not security** — every protected call is independently authorized.

## 9. AI integration boundary

- No AI engine is implemented in Phase 1 (deferred to Phase 4).
- The boundary is defined now: **all provider credentials live server-side**, and the web app
  will only ever reach the assistant through the API. Nothing in Phase 1 leaks a client-side
  AI key because none exists in client code.

## 10. 3D rendering architecture

- **Isolated feature slice** `apps/web/src/features/globe/` (`components/`, `shaders/`,
  `hooks/`, `systems/`, `data/`, `types/`).
- **Lazy-loaded** via `next/dynamic(..., { ssr: false })` → the Three.js bundle ships as a
  separate chunk and is never in the main route bundle; the normal app stays fast when the
  globe is off-screen.
- **WebGL-capability probe** decides between the live `<Canvas>` and a readable 2D fallback.
- Scene: fresnel atmosphere shader, dataviz lattice (wireframe + lat/lng guides), instanced
  selectable markers, curved arcs, orbital particles, orbit controls with auto-rotate, and a
  damped camera focus on marker selection. Fictional demo nodes only.
- Renders are GPU-bound, `dpr` capped, particle counts fixed; no giant geographic datasets.

## 11. Realtime architecture

- Not implemented in Phase 1. Redis is provisioned (docker-compose) as the durable
  pub/sub/queue substrate for Phase 5 WebSocket/SSE sync; the API is structured so
  `ActivityEvent` rows exist now for later streaming.

## 12. Testing strategy

- **API unit (jest):** error filter contract, AuthGuard flows, org last-OWNER rule,
  shared↔Prisma enum parity.
- **API integration (jest + supertest, separate test database):** login/logout/session,
  protected routes, RBAC denial (403), organization isolation across two tenants.
- **Frontend unit (jest + jsdom + Testing Library):** permission-aware navigation,
  WebGL fallback, auth store, presentation helpers, shared matrix.
- **Build gate (`npm run gate`):** shared build → typecheck → lint → unit tests →
  integration tests → production builds (API `nest build`, web `next build`).

## 13. Security model

| Concern | Control |
| --- | --- |
| Transport | API behind Next rewrite locally; TLS at ingress in later phases |
| Secrets | Env-only, `.env` git-ignored, never in frontend |
| Sessions | JWTs + revocable server sessions; bcrypt hashes |
| AuthZ | Server-only `@RequirePermission` guards; DB-scoped queries |
| Tenancy | `organizationId` on every owned row; tenant-scoped findFirst everywhere |
| Validation | Global `ValidationPipe` (whitelist + transforms), stable error contract |
| Input | All external input validated (`class-validator`), UUIDs parsed |
| Headers | `helmet`, strict CORS origins, `x-request-id` correlation |
| Error surface | 500s never leak internals; stable `ApiErrorBody` codes |

## 14. Phase 1 scope

- Foundation monorepo, Prisma schema/migrations, demo seed.
- Auth + RBAC + multi-tenancy enforcement (API) with integration coverage.
- Application shell, design system, Overview with 3D hero globe, Investigation workspace
  shell, honest placeholders with phase labels.
- `/health`, `/auth`, `/users`, `/organizations`, `/workspaces`, `/investigations`,
  `/entities` API boundaries.

## 15. Future Phase 2–7 boundaries

- **Phase 2:** full investigation/entity/evidence/note CRUD + profile pages (fits the
  existing module/services pattern).
- **Phase 3:** graph, map, timeline, globe fed by real geo data (extends `features/globe`,
  adds relationships/map/timeline APIs).
- **Phase 4:** AI engine behind `/assistant` with server-side credentials.
- **Phase 5:** evidence files (MinIO), report builder, WebSocket sync over Redis.
- **Phase 6:** automation/correlation/alerting.
- **Phase 7:** hardening (HttpOnly sessions, rate-limit distribution, observability, TLS,
  a11y, deployment, DR).