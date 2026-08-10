# ATLAS — Phase 1 Completion Report

**Date:** 2026-08-10
**Status:** PHASE 1 COMPLETE — all build-gate stages green

```text
========================================
 ATLAS PHASE 1 COMPLETE
========================================

Foundation:        READY
Authentication:    READY
RBAC:              READY
Multi-tenancy:     READY
API Foundation:    READY
Database:          READY
3D Engine:         READY
Overview:          READY
Investigation UI:  READY
Security Baseline: READY

Testing:           PASSED
Production Build:  PASSED
```

---

## 1. What was implemented

- **Monorepo (npm workspaces):** `apps/api` (NestJS 11 + Prisma + PostgreSQL), `apps/web`
  (Next.js 15 App Router + React 19 + Tailwind CSS), `packages/shared` (TS contracts).
- **Database foundation:** full Phase-1 Prisma schema (User, Organization, Workspace,
  Membership, ActiveSession, Investigation, Entity, Relationship, Evidence, Note, Report,
  TimelineEvent, ActivityEvent) with UUID ids, timestamps, FK indexes, and cascade rules;
  initial migration `20260809231010_init` applied to dev and test databases.
- **Auth:** email/password login (bcrypt), short-lived JWTs bound to revocable server-held
  sessions, `/auth/session` fresh resolution, `/auth/logout` with immediate revocation, login
  throttling, helmet + CORS + `x-request-id` correlation.
- **RBAC:** data-driven roles (`OWNER/ADMIN/ANALYST/INVESTIGATOR/VIEWER`), centralized
  permission matrix in `packages/shared`, `@RequirePermission` guards running server-side,
  permission-aware (UX) sidebar that never bypasses API enforcement.
- **Multi-tenancy:** organization isolation enforced in every query via the authenticated
  principal's `organizationId`; workspaces with activation; last-OWNER protection on member
  role changes.
- **API boundaries:** `/health`, `/auth`, `/users`, `/organizations`, `/workspaces`,
  `/investigations`, `/entities` — consistent `ApiErrorBody` contract, validation, pagination.
- **Web app:** Intelligence-Operations design system; protected application shell + full
  navigation; login flow; Overview with live metrics, active-cases list, and a 3D hero globe;
  investigation workspace shell (Overview/Entities/Relationships/Evidence/Timeline/Map/Notes/
  Reports/Activity tabs); real list pages for investigations and entities; professional
  placeholder routes with explicit phase labels for Phase 3–7 modules.
- **3D globe (isolated):** `features/globe` — fresnel atmosphere shader, dataviz lattice, lat/lng
  guides, instanced selectable markers, curved arcs, orbital particles, orbit controls with
  auto-rotate, damped camera focus, deterministic pseudo-random particles, **lazy-loaded**
  behind `next/dynamic`, WebGL-probe fallback.
- **Demo data:** fictional ATLAS Demo Organization with role users, 3 investigations,
  9 entities, 6 relationships, evidence/notes/timeline/activity/report, all marked `isDemo`.

## 2. Architecture decisions

| Decision | Rationale |
| --- | --- |
| NestJS for the API | Spec-preferred strongly-typed API architecture; native DI guards/guards testing. |
| npm workspaces monorepo | Shared contracts; separate builds/gates; no cross-app duplication. |
| Prisma + PostgreSQL | Spec-required DB; typed client; migrations-first; dedicated dev + test containers. |
| JWT + server-held sessions | Reversible revocation (logout kills the session), stateless token, role change applies on next request. |
| Server-side permission resolution | Guard re-reads the membership row each request; never trusts the token or client. |
| Central permission matrix in `@atlas/shared` | Single source of truth; Prisma-enum parity is unit-tested against it. |
| 3D isolated + lazy | Three.js stays out of the main bundle; jsdom/WebGL fallback keeps the app resilient. |

## 3. Files created / modified

Highlights (full tree documented in `docs/PHASE_1_ARCHITECTURE.md`):

```
docker-compose.yml            .gitignore  .editorconfig  .env.example  package.json
docs/PHASE_1_ARCHITECTURE.md  docs/ATLAS_7_PHASES.md  docs/PHASE_1_COMPLETE.md  docs/api-notes.md
packages/shared/src/          types, permissions, api, session (+ parity-testable contracts)
apps/api/prisma/              schema.prisma, migrations/20260809231010_init, seed.ts
apps/api/scripts/             test-integration.sh
apps/api/src/                 config, prisma, common, auth, rbac, health, users,
                              organizations, workspaces, investigations, entities
apps/api/src + test/          unit + e2e suites (helper fixtures)
apps/web/src/                 app/ (routes), components/ (shell + ui), features/globe/,
                              lib/ (api-client, auth-store, queries, presentation, nav)
apps/web/                     next.config.mjs, tailwind.config.ts, jest.config.js, eslint.config.mjs
```

No pre-existing application code was overwritten (repository was empty at start).

## 4. Database migrations

- `apps/api/prisma/migrations/20260809231010_init/migration.sql` — applied to `atlas` (dev) and
  `atlas_test` (integration).
- Demo reseeding is deterministic (`prisma/migrations` + `prisma/seed.ts`).

## 5. API endpoints

Covered in `docs/api-notes.md`. Summary: `/health`, `/auth/*`, `/users/*`,
`/organizations/*`, `/workspaces/*`, `/investigations/*`, `/entities/*`
(CRUD + list with filters/pagination), all tenant-scoped.

## 6. Frontend routes

```
/login                       (unauthenticated)
/overview                    hero globe + metrics + active cases + module roadmap
/investigations              case register (status/priority filters)
/investigations/[id]         investigation workspace shell (9 sections)
/entities                    entity register (type filter)
/graph /map /timeline /evidence /reports /assistant   (Phase 3–5 placeholders)
/workspace /activity /notifications /settings         (ops placeholders)
/                           → redirects to /overview
```

## 7. 3D architecture

- `features/globe/` with `components/`, `shaders/`, `hooks/`, `systems/`, `data/`.
- Lazy-loaded via `next/dynamic({ ssr: false })`; WebGL probe gates the live canvas.
- Scene: shader atmosphere, R3F canvas, instanced markers, arcs, particles, controls.
- Fictional demo nodes only; no geographic datasets. Fallback component tested in jsdom.

## 8. Security controls

- Passwords: bcrypt only. Tokens: JWT signed with env secret, bound to revocable sessions.
- AuthZ server-side via guards + org-scoped Prisma queries; client role checks are affordances.
- Validation via global `ValidationPipe` + `class-validator`; stable error contract.
- `helmet`, strict CORS origins, request-id correlation; secrets env-only, `.env` git-ignored.
- Cross-org reads return 404 (never existence leaks); last-OWNER protection.
- Integration tests assert these behaviors end-to-end.

## 9. Tests executed

| Suite | Count | Result |
| --- | --- | --- |
| `@atlas/shared` unit (node:test) | 5 | PASSED |
| API unit (jest) | 15 | PASSED |
| Web unit (jest/jsdom) | 16 | PASSED |
| API integration (jest + supertest, test DB) | 20 | PASSED |
| typecheck (shared/api/web) | — | PASSED |
| lint (api/web) | — | PASSED |
| Production builds (nest build + next build) | — | PASSED |

Integration coverage: auth (login/logout/session/invalid), protected routes, RBAC 403s,
permission-matrix equivalence per role, and organization isolation across two tenants.

## 10. Known limitations

- Client token is stored in `localStorage` (documented change to HttpOnly SameSite cookies in
  Phase 7 hardening).
- Login throttling is per-instance in-memory (distributed limiting deferred to Phase 7).
- The 3D globe uses fictional demo nodes; real geo data integration is Phase 3.
- WebSockets/realtime intentionally not built (Phase 5); Redis is provisioned but unused now.
- No AI functionality, graph engine, evidence pipeline, or report engine — deferred per spec.

## 11. Deferred Phase 2 work

- Investigation CRUD flows beyond the workspace shell, entity profiles, relationship management,
  evidence intake, notes, and investigation workflow states.

## 12. Commands to run the project

```bash
cd "ATLAS"

docker compose up -d atlas-postgres          # dev DB on :5434 (test on :5435)
npm install
npm run db:migrate                            # apply migrations (dev)
npm run prisma:seed -w @atlas/api            # optional: demo data

# Run everything (dev):
npm run dev                                   # API :4100 + Web :3000

# Verify the phase gate:
npm run gate                                  # typecheck + lint + unit + integration + build
```

Demonstration login: `admin@atlas.demo` / `AtlasDemo#2026` (or the seeded analyst /
investigator / viewer accounts).