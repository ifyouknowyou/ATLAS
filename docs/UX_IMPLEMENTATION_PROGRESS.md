# UX implementation progress

## Completed

- Audited the existing frontend architecture and documented the baseline in
  `docs/UX_AUDIT.md`.
- Added collapsible, permission-aware navigation groups.
- Improved the top bar with route context, breadcrumbs, workspace context, and
  an accessible help entry.
- Corrected command-palette destinations and improved keyboard/dialog semantics.
- Added action-capable empty states.
- Added a dismissible first-time onboarding card to the dashboard.
- Added shared focus, surface, and mobile overflow tokens.
- Added dashboard quick actions using existing routes only.
- Reworked investigation context with real record-count links, scoped quick
  actions, graph/map/assistant/report entry points, and explicit load errors.
- Added entity search, filter clearing, and actionable empty/error states.
- Added investigation-scoped evidence filtering and upload context.
- Added investigation-scoped report listing/creation.
- Added grouped global search with query input, clear behavior, and service
  error handling.
- Improved AI source links and URL-provided investigation context.

## Validation

- Frontend typecheck passed: `./.tmp-bin/npm run typecheck -w @atlas/web`.
- Frontend lint passed: `./.tmp-bin/npm run lint -w @atlas/web`.
- Frontend unit tests passed: `./.tmp-bin/npm test -w @atlas/web -- --runInBand`.
- Frontend production build passed: `./.tmp-bin/npm run build -w @atlas/web`.
- Workspace typecheck passed with the npm wrapper in `PATH`.
- Workspace lint passed with the npm wrapper in `PATH`.
- Workspace unit tests passed: `PATH="$PWD/.tmp-bin:$PATH" ./.tmp-bin/npm test`.
- API integration tests passed: `PATH="$PWD/.tmp-bin:$PATH" ./.tmp-bin/npm run test:integration`
- Workspace production build passed: `PATH="$PWD/.tmp-bin:$PATH" ./.tmp-bin/npm run build`

## Remaining limitations

- Backend/API/database behavior was intentionally not changed.
- Advanced backend analytics placeholders remain outside this frontend task.
- Automated browser viewport and screen-reader checks were not available in the
  existing test scripts; responsive CSS and keyboard behavior were validated
  through implementation review, lint, and build checks.
