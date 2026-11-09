# ATLAS UX audit

## Scope

This audit covers the existing Next.js application shell, navigation, shared UI
components, data-fetching layer, and primary investigation surfaces. The
backend, database schema, authentication, and API contracts are intentionally
out of scope for the frontend transformation.

## Current strengths

- A clear dark intelligence-operations visual direction already exists.
- The application has a reusable shell, permission-aware navigation, typed API
  access, TanStack Query caching, and shared status/presentation helpers.
- Investigations already support URL-backed filters, pagination, archive views,
  table/card views, favorites, and a visualization surface.
- Graph, globe, map, timeline, evidence, collaboration, and report components
  are separated into feature areas rather than being embedded in route files.
- Authentication, tenant context, and permissions are enforced server-side and
  should remain unchanged.

## UX issues found

### Navigation and orientation

- The sidebar was visually consistent but presented all groups as permanently
  expanded, which made a large feature set harder to scan.
- The top bar showed a page title but not the user's location within a route
  hierarchy or a clear help entry.
- The command palette contained routes that do not exist (`/ai` and
  `/admin/operations`).

### Feedback and guidance

- The generic empty state had no action affordance, so users often had no clear
  next step.
- The dashboard had useful real telemetry but did not make common next actions
  prominent.
- First-time users received no short explanation of the investigation workflow.

### Accessibility and responsive behavior

- Several shell controls relied on hover/title affordances without a visible
  context label on smaller screens.
- The command palette was not marked as a dialog and did not expose a selected
  command for keyboard users.
- Some shared focus and motion behavior was present only implicitly in utility
  classes rather than being standardized.

### Consistency and maintainability

- Core visual tokens existed in Tailwind and global CSS, but panel, focus,
  surface, and status patterns were not documented or consistently exposed as
  reusable primitives.
- Empty, unavailable, and action-oriented states were implemented differently
  across pages.

## Recommended improvements

1. Make navigation groups collapsible while preserving permission filtering and
   active-route indication.
2. Add breadcrumbs and a compact help entry to the top bar.
3. Correct command-palette routes and add accessible dialog/keyboard behavior.
4. Give empty states optional actions and use them on high-value surfaces.
5. Add a dismissible onboarding card that explains the core workflow without
   inventing data.
6. Consolidate focus, surface, and reduced-motion behavior in global tokens.
7. Prefer real API states (`loading`, `unavailable`, `restricted`, and `empty`)
   over success-shaped fallbacks.

## Risks

- Heavy graph, map, globe, and immersive components should remain lazy and
  should not be duplicated during shell work.
- New dashboard actions must route to existing pages or existing mutations;
  no mock records or backend changes are appropriate.
- The current worktree contains unrelated staged and unstaged changes. Those
  changes must be preserved.

