# ATLAS UX engineering report

## A. Executive summary

Completed a frontend-first UX transformation of ATLAS while preserving the
NestJS architecture, Prisma schema, migrations, authentication, RBAC, tenant
isolation, and REST contracts. A later focused backend extension added
server-side Gemini and optional Tavily provider support behind the existing AI
endpoints.

## B. UX audit

The audit identified permanently expanded navigation groups, limited route
orientation, invalid command-palette destinations, generic empty states,
missing first-session guidance, inconsistent focus affordances, and weak
context preservation between investigation modules.

Full findings are recorded in [UX_AUDIT.md](./UX_AUDIT.md).

## C. Implementation summary

- Shared design tokens, focus states, reduced-motion handling, and responsive
  surface utilities.
- Collapsible permission-aware navigation groups.
- Top-bar breadcrumbs, workspace context, and assistant help.
- Accessible command palette with valid routes, dialog semantics, and keyboard
  selection.
- Dashboard onboarding and real-route quick actions.
- Investigation count cards and investigation-scoped quick actions.
- Explicit investigation loading/error handling.
- Entity search, filter reset, and actionable empty/error states.
- Investigation-scoped evidence filtering and upload context.
- Investigation-scoped report listing and report creation payloads.
- Search input, grouped results, clear behavior, and service errors.
- AI assistant URL context and source-type-aware links.
- Gemini REST provider selection through `AI_PROVIDER=gemini`.
- Optional Tavily web research with explicitly labeled `WEB` sources.

## D. Modified files

- `apps/web/src/app/(app)/entities/page.tsx`
- `apps/web/src/app/(app)/evidence/page.tsx`
- `apps/web/src/app/(app)/overview/page.tsx`
- `apps/web/src/app/(app)/reports/page.tsx`
- `apps/web/src/app/(app)/search/page.tsx`
- `apps/web/src/app/globals.css`
- `apps/web/src/components/command-palette.tsx`
- `apps/web/src/components/layout/Sidebar.tsx`
- `apps/web/src/components/layout/TopBar.tsx`
- `apps/web/src/components/ui/EmptyState.tsx`
- `apps/web/src/features/assistant/AssistantWorkspace.tsx`
- `apps/web/src/features/investigation/InvestigationWorkspace.tsx`
- `apps/web/src/components/onboarding/WelcomeCard.tsx`
- `docs/UX_AUDIT.md`
- `docs/UX_IMPLEMENTATION_PROGRESS.md`
- `docs/UX_ENGINEERING_REPORT.md`

The pre-existing change to `apps/api/scripts/test-integration.sh` was
preserved and not modified by this task.

## E. New components

- `WelcomeCard` — dismissible first-session orientation using existing routes
  and no fabricated records.
- `CountCard` and `ActionLink` — investigation-scoped navigation primitives.

## F. Existing components reused

`Panel`, `Button`, `StatusBadge`, `Spinner`, `Modal`, `EvidenceDropzone`,
`AtlasScene`, existing TanStack Query hooks, the typed API client, permission
checks, and the existing graph/map/timeline/AI/report feature workspaces.

## G. Feature verification

Verified investigation navigation, scoped links, entity filtering/search,
evidence investigation selection, report investigation context, grouped
search results, command-palette keyboard behavior, and AI source-link rendering
through TypeScript, lint, unit tests, and production compilation.

## H. Test results

- `PATH="$PWD/.tmp-bin:$PATH" ./.tmp-bin/npm run typecheck` — passed
- `PATH="$PWD/.tmp-bin:$PATH" ./.tmp-bin/npm run lint` — passed
- `PATH="$PWD/.tmp-bin:$PATH" ./.tmp-bin/npm test` — passed
- `PATH="$PWD/.tmp-bin:$PATH" ./.tmp-bin/npm run test:integration` — passed
  (9 suites, 54 tests)
- `PATH="$PWD/.tmp-bin:$PATH" ./.tmp-bin/npm run build` — passed
- `git diff --check` — passed

## I. Backend preservation

The backend architecture, Prisma schema, migrations, authentication behavior,
permission model, tenant isolation logic, and existing request/response
contracts remain intact. The AI module was extended with Gemini and Tavily
provider boundaries; no existing endpoint was replaced.

## J. Remaining limitations

- Advanced anomaly detection, entity resolution, and organization quota
  enforcement remain explicit backend placeholders.
- Automated multi-viewport browser and screen-reader tests are not present in
  the repository; responsive and keyboard behavior were implemented and
  covered by static validation and existing component tests.
- No new unsupported background monitoring or mock intelligence data was added.
- Real `GEMINI_API_KEY` and optional `TAVILY_API_KEY` values are still required
  in the server `.env`; placeholder values do not configure the providers.

## K. Recommended next improvements

1. Add Playwright viewport/accessibility coverage for the shell, investigation
   workspace, evidence upload, graph, map, and report flows.
2. Add toast/notification primitives if product requirements call for transient
   success feedback beyond current inline states.
3. Implement backend placeholder analytics only under a separately approved
   backend change.
