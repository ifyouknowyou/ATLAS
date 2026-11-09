# AI Assistant Implementation Progress

## Completed

- Audited the existing assistant route, hooks, source contract, summary flow,
  investigation picker, and constellation preview.
- Added the architecture audit in `docs/AI_ASSISTANT_UX_AUDIT.md`.
- Replaced the single-column assistant with a responsive three-column workspace.
- Added investigation context metadata, authorized counts, context switching,
  refresh, and links to the existing investigation sections.
- Added real quick actions routed through the existing chat and summary
  mutations; no unsupported operation is presented as a separate backend
  feature.
- Added a compact AI hero, active-scope state, trust messaging, source panel,
  persisted message history panel, and resource links.
- Added heading-aware response sections for headings actually returned by the
  model, while preserving ordinary text rendering.
- Added source cards for entity, evidence, note, and web references.
- Added copy response, loading, retry, error, empty, character-count, and
  keyboard composer states.
- Added collapsible desktop panels, tablet panel stacking, mobile single-column
  behavior, focus-visible controls, and reduced-motion-compatible styling.
- Preserved all existing backend endpoints, shared contracts, permissions,
  authentication, and tenant scoping.

## Modified files

- `apps/web/src/features/assistant/AssistantWorkspace.tsx`
- `apps/web/src/app/globals.css`
- `docs/AI_ASSISTANT_UX_AUDIT.md`
- `docs/AI_ASSISTANT_IMPLEMENTATION_PROGRESS.md`

## Validation

- Assistant tests: 3 passed.
- Frontend tests: 63 passed across 17 suites.
- Frontend typecheck: passed.
- Frontend lint: passed.
- Frontend production build: passed.
- `git diff --check`: passed.
- Browser verification: `/assistant` rendered successfully with live authorized
  references and persisted assistant messages.

## Limitations

- The current API returns text and source references, not typed finding,
  relationship, or timeline payloads. The UI does not fabricate those fields.
- Streaming, attachments, regeneration, feedback, and report insertion remain
  unavailable because the current web/API contracts do not expose them.
- Existing test output includes non-fatal JSDOM canvas warnings from unrelated
  WebGL coverage.
