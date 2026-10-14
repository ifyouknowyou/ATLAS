# Plan: Transform ATLAS to fully immersive 3D

## Context
The ATLAS project presently renders a 2‑D map & overview using conventional React components. The user wants to convert the entire app into a fully animated 3‑D experience, with orbit controls and auto‑rotate enabled, without changing the core data or business logic.

We will keep the existing API shape and data contracts. The new architecture will replace 2‑D map and sidebar components with a WebGL + `@react-three/fiber` canvas that renders a globe, nests other UI elements as 3‑D controls, and supports scene‑driven animations.

## High‑level approach
1. **Identify existing 3‑D building blocks** – The repo already ships a `GlobeCanvas` and supporting components (`Scene`, `Planet`, `ParticleField`, …). These will form the backbone of the new root.
2. **Add a layout that hosts the 3‑D canvas** – A new top‑level page, `apps/web/src/pages/immersive/page.tsx`, will render a lazy‑loaded `GlobeCanvas` with the same props the old `MapWorkspace` provided.
3. **Refactor navigation** – Replace the global `Sidebar` and `TopBar` with 3‑D widgets that appear in world space (e.g., floating panels). These can be simple React components wrapped in `<Html>` from `drei`.
4. **Propagate data** – Existing API services (`api-client`) will remain untouched. The new `GlobeCanvas` receives nodes and arcs via props, so we will lift state in a new `ImmersiveProvider` that fetches data once and provides it to children.
5. **Animation and interaction** – Enable orbit controls (`OrbitControls`), auto‑rotate, and optional camera preset triggers. The user selected `Orbit + auto‑rotate`.
6. **Testing strategy** – Unit test `GlobeCanvas` rendering via `@testing-library/react` + `@testing-library/dom` using `jest`. Add snapshot and structural assertions. Add visual regression tests for rotation/time‑based animations using `jest‑dom‑is`. End‑to‑end test with Playwright checking 3‑D element presence.
7. **Integration** – The new immersive route should be reachable from the nav. Update `next.config.js` rewrites if needed.
8. **Performance concerns** – Ensure that `dpr` is capped, and `gl` options use `powerPreference: 'high-performance'`. Validate that the app still loads within 3 s on a mid‑range laptop.

## Files to add / modify
### New files
- `apps/web/src/pages/immersive/page.tsx`: entry point.
- `apps/web/src/components/ImmersiveLayout.tsx`: wrapper with lazy `GlobeCanvas` and 3‑D UI panel components.
- `apps/web/src/components/ImmersiveProvider.tsx`: context to load nodes/arcs.
- `apps/web/src/components/3d-fleets/` (helper components): `EmergencyPanel`, `ControlPanel`, etc.

### Existing files to modify
- `apps/web/src/app/(app)/map/page.tsx` → replace with lazy route or keep as legacy.
- `apps/web/src/app/(app)/overview/page.tsx` → adjust to render within the 3‑D scene (either omit or overlay).
- `apps/web/src/components/layout/AppShell.tsx` → adapt to mount the **ImmersiveLayout** conditionally.
- `apps/web/src/components/layout/Sidebar.tsx` → replace with 3‑D panel components or hide.
- `apps/web/src/features/globe/GlobeCanvas.tsx`, `Scene.tsx`, `Planet.tsx`: no changes needed; use as is.
- `apps/web/src/features/geo/MapWorkspace.tsx`: extract data‑fetching logic into `ImmersiveProvider`.

## Verification plan
1. **Local start‑up** – `pnpm run dev` → navigate to `/immersive` and verify a rotating globe + base UI.
2. **Unit tests** – Run `pnpm test` and ensure new components render.
3. **E2E** – Run `pnpm test:e2e` to confirm Playwright finds `<Canvas>` elements and UI panels.
4. **Performance** – Capture bundle size and frame rate in Chrome DevTools.
5. **Merge criteria** – code must pass lint, test, and TypeScript type‑check.

## Next steps
If the plan is acceptable, I will begin creating the new files and refactoring the layout while retaining the existing data‑fetching logic.
