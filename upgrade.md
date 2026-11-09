# ATLAS — ADVANCED USER EXPERIENCE ENGINEERING & FRONTEND TRANSFORMATION

## ROLE AND RESPONSIBILITY

Act as a Principal Frontend Architect, Senior UX Engineer, Product Designer, React/Next.js Specialist, and Enterprise Application Engineer.

You are responsible for upgrading the existing ATLAS platform into a highly polished, professional, intuitive, and production-quality intelligence investigation application.

This is an existing, substantial software project.

You are NOT building a new application.
You are NOT creating a standalone dashboard.
You are NOT replacing existing application functionality.
You are NOT allowed to redesign the backend architecture.

You must first understand the current implementation, then improve the actual application.

Your objective is to transform the existing ATLAS interface into a cohesive intelligence workspace with a clear user journey, professional interaction design, consistent visual language, and excellent usability.

You must complete the implementation rather than stopping at analysis or planning.

---

# 1. COMPLETE PROJECT CONTEXT

## 1.1 Product Identity

Product: ATLAS

Category:
AI-Powered Intelligence and Investigation Platform.

Purpose:

ATLAS provides a centralized environment for collecting, organizing, connecting, analyzing, and presenting intelligence information.

It combines investigation management, entity intelligence, evidence management, relationship analysis, geospatial visualization, knowledge graphs, timelines, AI-assisted analysis, and reporting.

The platform should feel like a sophisticated intelligence operations environment rather than a conventional CRUD administration dashboard.

## 1.2 Existing Technology Stack

Inspect the actual dependencies and configuration before making implementation decisions.

Known architecture:

Frontend:
- Next.js
- React
- TypeScript
- Tailwind CSS
- TanStack Query
- Three.js
- React Three Fiber
- Drei
- MapLibre
- Existing animation and visualization libraries

Backend:
- NestJS
- TypeScript
- Prisma
- PostgreSQL
- Redis
- REST API

Monorepo:
- npm workspaces
- Shared TypeScript packages
- Shared permissions and contracts

Project structure:

apps/api/
apps/web/
packages/shared/
apps/api/prisma/
docker-compose.yml

Do not assume every dependency or feature is configured exactly as described. Verify the actual code.

## 1.3 Existing ATLAS Modules

The existing application includes:

1. Dashboard
2. Investigations
3. Investigation workspace
4. Entities
5. Relationships
6. Evidence management
7. Evidence versions and annotations
8. Evidence processing
9. Reports and templates
10. Report reviews and approvals
11. Knowledge Graph
12. Geospatial Map
13. Timeline
14. AI Assistant
15. Intelligence Search
16. Tasks
17. Activity
18. Collaboration
19. Notifications
20. Alerts
21. Watchlists
22. Rules and workflows
23. Data sources and connectors
24. Analytics
25. Administration
26. Workspace settings

Your responsibility is to improve the complete user experience across these existing modules.

---

# 2. NON-NEGOTIABLE ARCHITECTURAL CONSTRAINTS

This project requires a frontend-first transformation.

## 2.1 Backend Protection

DO NOT:

- Change NestJS architecture.
- Modify existing backend services.
- Modify controllers.
- Modify database schemas.
- Modify Prisma models.
- Create new database migrations.
- Change API response formats.
- Change request payload contracts.
- Change authentication architecture.
- Change JWT behavior.
- Change RBAC permissions.
- Change tenant isolation.
- Change existing backend business logic.
- Replace backend functionality with local mock implementations.

Do not modify backend files simply to make frontend development easier.

## 2.2 Database Protection

Preserve:
- Existing PostgreSQL structure.
- Existing Prisma schema.
- Existing migrations.
- Existing relationships.
- Existing seed data.
- Existing database constraints.

## 2.3 API Protection

Preserve:
- Existing REST endpoints.
- Existing API prefixes.
- Existing request and response contracts.
- Existing error handling.
- Existing API authentication.
- Existing permission checks.

Use the existing typed API client and query architecture.

## 2.4 Frontend Engineering Rules

- Reuse existing components when appropriate.
- Reuse existing hooks and query functions.
- Keep business logic separate from presentation.
- Avoid unnecessary dependencies.
- Avoid duplicate implementations.
- Maintain strict TypeScript compatibility.
- Avoid `any` unless there is a documented technical reason.
- Avoid unnecessary client-side rendering.
- Preserve server/client component boundaries.
- Avoid unnecessary global state.
- Keep frontend performance under control.
- Never introduce nonfunctional buttons or decorative controls pretending to be functional.

If a requested feature cannot be implemented using current backend capabilities, document it as a limitation.

---

# 3. PHASE ZERO — PROJECT DISCOVERY AND BASELINE

Before editing anything, inspect the repository.

## 3.1 Repository Inspection

Inspect:

- Root package.json
- Workspace configuration
- apps/web/package.json
- apps/api/package.json
- TypeScript configurations
- Tailwind configuration
- Next.js configuration
- Existing route structure
- Shared component structure
- Existing layout system
- Authentication providers
- Permission guards
- API client
- Query architecture
- Global styles
- Theme configuration
- Existing visualization components
- Existing test configuration

## 3.2 Inspect Existing Frontend Architecture

Identify:

- Main application layout
- Sidebar implementation
- Top navigation
- Page layouts
- Reusable cards
- Data tables
- Forms
- Dialogs
- Drawers
- Dropdowns
- Notification systems
- Toast systems
- Loading states
- Error boundaries
- Empty states
- Existing animation utilities

## 3.3 Establish a Baseline

Before implementation:

1. Check the Git working tree.
2. Identify existing modifications.
3. Do not overwrite user changes.
4. Identify existing build and test scripts.
5. Run available frontend validation commands.
6. Record existing failures separately from newly introduced failures.
7. Verify that the application can start.

Never use destructive Git commands to clean the repository.

## 3.4 Produce an Audit

Create:

docs/UX_AUDIT.md

Include:

- Current UX architecture
- Existing navigation problems
- Inconsistent design patterns
- Confusing interactions
- Missing user guidance
- Accessibility problems
- Performance concerns
- Existing reusable components
- Recommended improvements
- Potential implementation risks

After completing the audit, proceed directly to implementation.

Do not wait for additional approval.

---

# 4. DESIGN SYSTEM — COMPLETE VISUAL CONSISTENCY

Establish a consistent visual system across ATLAS.

## 4.1 Design Direction

Visual identity:

- Dark-only interface.
- Professional intelligence operations aesthetic.
- Modern enterprise software.
- Sophisticated analytical interface.
- Minimal glassmorphism.
- Subtle gradients.
- Refined depth and layering.
- Controlled motion.
- High information readability.
- Consistent spacing.
- Distinctive page-specific layouts.

Avoid:
- Generic SaaS dashboard templates.
- Excessive glowing effects.
- Excessive gradients.
- Excessive blur.
- Unnecessary animated backgrounds.
- Oversized typography.
- Decorative UI that reduces usability.
- Inconsistent card designs.
- Excessive rounded containers.
- Unreadable low-contrast text.

## 4.2 Design Tokens

Create or improve centralized design tokens for:

- Background colors
- Surface colors
- Elevated surfaces
- Borders
- Primary accent
- Secondary accent
- Semantic success
- Warning
- Error
- Information
- Text hierarchy
- Muted text
- Spacing
- Border radius
- Shadows
- Typography
- Transitions
- Focus states
- Layering

Use existing project conventions wherever possible.

Avoid introducing hardcoded, inconsistent styles across pages.

## 4.3 Typography

Establish a clear hierarchy:

- Page title
- Section heading
- Card heading
- Body text
- Supporting text
- Metadata
- Technical identifiers
- Table information

Technical identifiers and timestamps should be easy to distinguish.

Do not use Inter or Arial as a default replacement font.

## 4.4 Component Standards

Create or consolidate reusable components where justified:

- PageHeader
- SectionHeader
- Breadcrumbs
- SidebarNavigation
- Topbar
- SearchCommand
- StatusIndicator
- PriorityIndicator
- EmptyState
- ErrorState
- LoadingSkeleton
- ConfirmationDialog
- ContextualTooltip
- FilterBar
- DataTable
- Pagination
- DetailDrawer
- EntityCard
- EvidenceCard
- ActivityItem
- QuickAction
- MetricCard
- PermissionGuard

Do not create duplicate components if equivalent components already exist.

---

# 5. PHASE ONE — GLOBAL APPLICATION SHELL

Redesign the main application shell.

## 5.1 Sidebar

Create a more understandable navigation experience.

Recommended structure:

OVERVIEW
- Dashboard
- Activity
- Notifications

INVESTIGATIONS
- Investigations
- Tasks
- Entities
- Relationships

INTELLIGENCE
- Intelligence Sources
- Knowledge Graph
- Geospatial Map
- Timeline
- Search

EVIDENCE & REPORTS
- Evidence
- Reports
- Reviews and Approvals

AUTOMATION
- AI Assistant
- Alerts
- Watchlists
- Workflows

WORKSPACE
- Collaboration
- Members
- Workspace Settings

ADMINISTRATION
- Administration

Requirements:

- Collapsible groups.
- Expand and collapse interaction.
- Active navigation indicators.
- Permission-aware navigation.
- Consistent icons.
- Useful tooltips.
- Responsive mobile navigation.
- Clear hover and focus states.
- No clipped labels.
- No accidental route changes.
- Preserve existing routes.

The sidebar must feel compact and professional.

## 5.2 Top Navigation

Improve the top navigation with:

- Current page context.
- Breadcrumb navigation.
- Global search entry.
- Notifications.
- Workspace context.
- User profile.
- Help entry.
- Relevant page actions.

Only show controls that are supported by existing functionality.

## 5.3 Global Search

Improve the existing search experience.

Where existing endpoints support it, allow searching:

- Investigations
- Entities
- Evidence
- Reports
- Tasks
- Other searchable records

Provide:

- Search input.
- Loading state.
- Empty state.
- Results grouped by type.
- Keyboard navigation.
- Clear search.
- Useful result previews.

Do not implement a fake global search using hardcoded records.

---

# 6. PHASE TWO — DASHBOARD TRANSFORMATION

The dashboard should provide an understandable overview of the user's authorized workspace.

## 6.1 Dashboard Layout

Recommended sections:

1. Welcome and workspace context.
2. Key operational metrics.
3. Active investigations.
4. Recent activity.
5. Outstanding tasks.
6. Recent evidence.
7. Upcoming deadlines.
8. Alerts requiring attention.
9. Recent reports.
10. Quick actions.

## 6.2 Dashboard Metrics

Use real data from existing APIs.

Examples:

- Active investigations.
- Pending tasks.
- Evidence items.
- Reports awaiting review.
- Open alerts.
- Recent workspace activity.

Requirements:

- Never invent counts.
- Do not treat missing values as zero.
- Clearly identify unavailable data.
- Use meaningful labels.
- Avoid excessive metric cards.
- Provide navigation to the relevant records.

## 6.3 Dashboard Interactions

Each operational metric should navigate to the appropriate existing page.

Recent activity should provide useful record links.

Quick actions should open real workflows.

---

# 7. PHASE THREE — INVESTIGATION WORKSPACE REENGINEERING

This is the highest-priority part of the project.

The investigation workspace must become the central working environment of ATLAS.

## 7.1 Investigation Register

Improve the investigation list.

Add or refine:

- Search.
- Status filters.
- Priority filters.
- Classification filters.
- Sorting.
- Pagination.
- View preferences.
- Table view.
- Card view.
- Archive visibility.
- Investigation creation.
- Clear filter actions.

Keep existing API pagination and filtering contracts.

## 7.2 Investigation Overview

Build a polished investigation overview with:

HEADER
- Investigation name.
- Reference ID.
- Status.
- Priority.
- Classification.
- Created date.
- Last updated.
- Assigned members.

OPERATIONAL OVERVIEW
- Outstanding tasks.
- Evidence count.
- Entity count.
- Relationship count.
- Recent activity.
- Report status.

INVESTIGATION PROGRESS
- Available milestones.
- Completed work.
- Pending work.
- Outstanding actions.

Do not calculate fake progress.

If the backend does not expose a reliable progress value, present actual task and workflow information without manufacturing a percentage.

## 7.3 Investigation Navigation

Organize investigation sections into clear tabs:

- Overview
- Entities
- Relationships
- Evidence
- Timeline
- Tasks
- Notes
- Members
- Activity
- Knowledge Graph
- Reports

Preserve existing functionality and route behavior.

## 7.4 Investigation Quick Actions

Add contextual actions:

- Add entity.
- Add evidence.
- Create task.
- Add note.
- Explore relationships.
- Open timeline.
- Open graph.
- Create report.

Actions must respect permissions.

## 7.5 Investigation Context

When navigating between investigation modules, preserve relevant context.

For example:

- Opening evidence from an investigation should retain investigation context.
- Opening an entity should provide a path back to its investigation.
- Opening a timeline should use the selected investigation's data.
- Opening a report should preserve its investigation association.

Avoid unnecessarily resetting user filters and navigation state.

---

# 8. PHASE FOUR — ENTITY AND RELATIONSHIP EXPERIENCE

Improve the entity intelligence workflow.

## 8.1 Entity Management

Improve:

- Entity search.
- Entity list.
- Entity filters.
- Entity classification.
- Entity detail pages.
- Entity relationships.
- Related evidence.
- Investigation associations.
- Activity history.

## 8.2 Entity Detail Interface

Display available information in a structured format:

- Entity name.
- Entity type.
- Description.
- Identifiers.
- Attributes.
- Associated investigations.
- Connected entities.
- Relationships.
- Supporting evidence.
- Relevant timeline events.
- Activity.

Do not display unsupported fields.

## 8.3 Relationship Exploration

Improve relationship readability.

Display:

- Source entity.
- Target entity.
- Relationship type.
- Available metadata.
- Confidence when supported.
- Supporting evidence.
- Associated investigation.

Distinguish confirmed data from analyst interpretation.

Never manufacture relationship confidence.

---

# 9. PHASE FIVE — EVIDENCE MANAGEMENT REENGINEERING

Evidence is a core component of ATLAS.

Its interface must be trustworthy, understandable, and easy to navigate.

## 9.1 Evidence Register

Improve:

- Evidence search.
- File type filters.
- Processing filters.
- Review filters.
- Investigation filters.
- Sorting.
- Pagination.
- Evidence previews.
- Upload workflow.
- Upload feedback.

## 9.2 Evidence Detail Workspace

Design a structured evidence detail page.

Sections:

A. GENERAL INFORMATION
- Evidence reference.
- Evidence title.
- Description.
- File name.
- File type.
- File size.
- Collection date.
- Available source information.

B. INTEGRITY INFORMATION
- Hash algorithm.
- Recorded hash.
- Integrity comparison status, if supported.
- Relevant processing information.

C. PROVENANCE
- Recorded collection events.
- Access history.
- Version history.
- Processing history.
- Relevant annotations.

D. RELATIONSHIPS
- Associated investigation.
- Related entities.
- Related reports.
- Other linked records.

E. REVIEW
- Review status.
- Reviewer information.
- Comments.
- Available actions.

## 9.3 Evidence Upload UX

Create a clear upload workflow:

1. Select file.
2. Display file information.
3. Select associated investigation where supported.
4. Add available metadata.
5. Submit upload.
6. Show progress.
7. Display server response.
8. Navigate to the created evidence record.

Support actual backend validation.

Handle:
- Upload failure.
- Network interruption.
- Unsupported file types.
- File-size restrictions.
- Duplicate submissions.
- Permission errors.

## 9.4 Integrity and Trust

Never confuse:

- File hash.
- Authenticity.
- Integrity.
- Provenance.
- Chain of custody.

A matching hash only establishes a match against the recorded digest being compared.

Do not display a verified or trusted badge unless the backend supports the underlying verification.

---

# 10. PHASE SIX — KNOWLEDGE GRAPH UX

Preserve the existing Three.js and graph architecture.

Improve usability rather than replacing the visualization engine.

## 10.1 Graph Interface

Create a clean analytical layout with:

- Graph canvas.
- Search panel.
- Filter panel.
- Selected entity details.
- Relationship details.
- Visualization toolbar.
- View controls.
- Legend.
- Minimap where supported.

## 10.2 Graph Controls

Improve:

- Zoom in.
- Zoom out.
- Fit to screen.
- Reset.
- Search.
- Node selection.
- Relationship selection.
- Entity filters.
- Relationship filters.
- Layout selection where supported.
- Expand related entities where supported.

## 10.3 Node Interaction

Clicking a node should:

1. Highlight the selected node.
2. Display its details.
3. Display connected relationships.
4. Show available evidence references.
5. Provide links to associated investigations.

Selecting another node should update the detail panel correctly.

Provide a clear way to close the panel.

## 10.4 Large Graph Performance

Implement only where compatible with the existing visualization engine:

- Progressive graph loading.
- Filtering before rendering.
- Reduced unnecessary re-renders.
- Stable node identifiers.
- Efficient selection state.
- Appropriate rendering limits.
- Clear graph loading feedback.

Do not load thousands of unrelated records without a clear user need.

## 10.5 Accessibility

Provide:
- Keyboard-accessible controls.
- Search-based alternatives to visual node discovery.
- A structured entity list where appropriate.
- Readable relationship information.

The graph must not be the only way to access intelligence records.

---

# 11. PHASE SEVEN — GEOSPATIAL INTELLIGENCE EXPERIENCE

Preserve the existing MapLibre implementation.

Improve the map experience with:

- Clear map toolbar.
- Layer controls where supported.
- Search.
- Filters.
- Selected-item details.
- Associated investigation context.
- Timeline connections where supported.
- Map legend.
- Reset view.
- Loading and error states.

Make the map understandable to users who are unfamiliar with geospatial software.

Do not invent coordinates or location accuracy.

Clearly distinguish:
- Exact coordinates.
- Approximate locations.
- Inferred locations.
- Unknown locations.

Do not imply that a mapped technical indicator identifies a person's physical location.

---

# 12. PHASE EIGHT — TIMELINE EXPERIENCE

Improve the investigation timeline.

Provide:

- Chronological event list.
- Time filters.
- Event categories.
- Event details.
- Related entities.
- Evidence references.
- Source references.
- Investigation context.

Where existing data supports it, provide:

- Zoomable time ranges.
- Date grouping.
- Event selection.
- Search.
- Timeline summaries.

Clearly distinguish recorded timestamps from estimated or inferred dates.

Do not invent missing timestamps.

---

# 13. PHASE NINE — INVESTIGATION-AWARE AI ASSISTANT

Improve the AI Assistant as an integrated investigation tool.

It should not feel like an unrelated chatbot.

## 13.1 Contextual AI Actions

Where existing backend endpoints support them, offer:

- Summarize investigation.
- Analyze selected entity.
- Explain selected relationship.
- Summarize timeline.
- Identify evidence gaps.
- Identify conflicting observations.
- Organize investigation findings.
- Draft a report.
- Review citations.
- Explain analytical limitations.

## 13.2 Context Awareness

Use the active investigation context when available.

Show users which investigation and records are being used as context.

Allow them to understand the scope of the AI operation.

## 13.3 AI Response UX

Improve:

- Streaming presentation where supported.
- Loading states.
- Error states.
- Conversation history.
- Context references.
- Copy functionality.
- Regenerate functionality where supported.
- Clear AI-generated content labels.

## 13.4 Trust and Safety

- AI output must be distinguishable from verified records.
- Cite actual source records where supported.
- Never fabricate citations.
- Never present AI-generated hypotheses as confirmed facts.
- Preserve authorization boundaries.
- Do not expose provider credentials.
- Gracefully handle unavailable AI providers.

---

# 14. PHASE TEN — REPORTING AND ANALYTICAL DELIVERY

Improve the report workflow.

## 14.1 Report Creation

Build a guided report workflow:

1. Select investigation.
2. Select template.
3. Create executive summary.
4. Define scope and methodology.
5. Include observations.
6. Include relevant entities.
7. Include relationships.
8. Reference evidence.
9. Include timeline findings.
10. Document limitations.
11. Draft conclusions.
12. Review citations.
13. Submit for review.

Use existing report APIs and data models.

## 14.2 Report Editor

Improve:

- Section navigation.
- Editing experience.
- Citation insertion.
- Entity references.
- Evidence references.
- Timeline references.
- Autosave where already supported.
- Save feedback.
- Validation.
- Unsaved-change warnings.

Do not claim autosave if the implementation does not actually persist changes.

## 14.3 Review and Approval

Improve:

- Review status.
- Reviewer comments.
- Approval history.
- Revision history.
- Version comparison where supported.
- Final publishing actions.

Ensure actions follow existing permissions and state transitions.

## 14.4 Export

Improve the export experience.

Support only existing export capabilities.

Show:
- Export preparation.
- Success.
- Failure.
- Download availability.

---

# 15. PHASE ELEVEN — FIRST-TIME USER EXPERIENCE

Make ATLAS easier for someone who has never used the platform.

## 15.1 Onboarding

Implement a lightweight onboarding experience:

- Welcome to ATLAS.
- Explain the primary workflow.
- Introduce investigations.
- Explain entities and relationships.
- Explain evidence.
- Introduce knowledge graphs.
- Introduce AI assistance.
- Explain reporting.

Keep it short.

Allow users to:
- Skip onboarding.
- Continue later.
- Reopen help.
- Access contextual documentation.

## 15.2 Contextual Tooltips

Provide helpful explanations for unfamiliar concepts.

Examples:

- Investigation.
- Entity.
- Relationship.
- Evidence.
- Provenance.
- Knowledge Graph.
- Confidence.
- Watchlist.
- Workflow.

Avoid long technical descriptions.

## 15.3 Empty States

Every major page should explain:

1. What the module does.
2. Why the user might need it.
3. What action to take next.

Provide a working action when the user has permission.

Do not display empty states as generic "No data found" messages.

## 15.4 Demo Experience

If the existing demo dataset supports it, provide a clearly labeled synthetic demonstration investigation.

Never mix demonstration records with real client records without clear labeling.

---

# 16. PHASE TWELVE — TASKS, ALERTS, WATCHLISTS AND WORKFLOWS

Improve the operational experience across these modules.

Tasks:
- Clear task ownership.
- Priority.
- Due dates.
- Status.
- Investigation context.
- Filters.
- Useful task details.

Alerts:
- Severity.
- Alert source.
- Related record.
- Creation time.
- Review state.
- Available actions.

Watchlists:
- Clear watchlist organization.
- Search.
- Monitoring state.
- Related alerts.
- Last available activity.

Workflows:
- Clear workflow structure.
- Step status.
- Execution history.
- Failure feedback.
- Approval requirements.
- Available actions.

Do not create unsupported background monitoring or automation functionality in the frontend.

---

# 17. PHASE THIRTEEN — USER INTERFACE MODES

Implement a consistent preference system for three interface modes.

STANDARD MODE

Purpose:
Everyday investigation work.

Characteristics:
- Clean layout.
- Readable information.
- Reduced visual complexity.
- Simple navigation.
- Accessible controls.

ADVANCED MODE

Purpose:
Experienced analysts.

Characteristics:
- More information density.
- Additional analytical controls.
- Expanded filters.
- More detailed metadata.
- Advanced table and graph options where supported.

IMMERSIVE MODE

Purpose:
Visualization-focused analysis.

Characteristics:
- Expanded graph workspace.
- Expanded geospatial experience.
- Larger timeline visualization.
- Reduced surrounding interface clutter.
- Better use of available display space.

Requirements:
- All three modes must use existing capabilities.
- Modes must not create separate implementations of the same business logic.
- Important information must remain accessible.
- Preserve dark-only visual identity.
- Respect reduced-motion preferences.
- Do not allow immersion to interfere with navigation or accessibility.

---

# 18. PHASE FOURTEEN — RESPONSIVE DESIGN

The desktop experience is important, but the application must remain usable at different viewport sizes.

Test:

- 1920px desktop.
- 1440px desktop.
- 1280px laptop.
- 1024px tablet landscape.
- 768px tablet.
- 390px mobile.

Requirements:

- No horizontal overflow unless intentionally required by a data visualization.
- No clipped text.
- No overlapping dialogs.
- No inaccessible navigation.
- Tables should have a usable mobile alternative.
- Graph and map controls should remain accessible.
- Forms should be usable on small screens.
- Detail panels should adapt appropriately.

Do not simply shrink the desktop interface.

---

# 19. PHASE FIFTEEN — ACCESSIBILITY AND INTERACTION QUALITY

Implement and verify:

- Semantic HTML.
- Proper form labels.
- Keyboard navigation.
- Visible focus indicators.
- Accessible dialogs.
- Accessible dropdowns.
- Meaningful tooltips.
- Sufficient contrast.
- Reduced-motion support.
- Clear validation messages.
- Descriptive action labels.
- Screen-reader-friendly status messages.

All interactive controls must have real behavior.

Do not use clickable-looking elements without working actions.

---

# 20. PHASE SIXTEEN — PERFORMANCE ENGINEERING

Improve performance without changing the backend.

Inspect:

- Bundle size.
- Unnecessary client components.
- Duplicate API requests.
- Query invalidation.
- Component re-rendering.
- Large table rendering.
- Graph rendering.
- Map rendering.
- Animation performance.
- Image loading.
- Expensive computations.

Use appropriate existing tools and architecture.

Potential improvements:

- Dynamic imports for heavy visualizations.
- Lazy loading.
- Memoization where measurable.
- Efficient query caching.
- Stable callback and state patterns.
- Progressive visualization loading.
- Reduced unnecessary animation.
- Appropriate skeletons.

Do not introduce optimization complexity without a measurable benefit.

---

# 21. PHASE SEVENTEEN — ERROR HANDLING AND USER FEEDBACK

Establish consistent interaction feedback across the application.

Every important action must provide appropriate feedback.

Examples:

- Investigation created.
- Evidence uploaded.
- Task updated.
- Report saved.
- Review submitted.
- Alert acknowledged.
- Workflow execution failed.

Handle:
- Unauthorized access.
- Forbidden actions.
- Missing records.
- Network errors.
- Server errors.
- Validation errors.
- Timeout.
- Empty responses.

Use existing error formats.

Never expose stack traces, secrets, tokens, or internal implementation details to users.

For destructive actions:
- Explain the consequence.
- Ask for confirmation.
- Respect permissions.
- Provide feedback after completion.

---

# 22. PHASE EIGHTEEN — FRONTEND TESTING

Test actual functionality, not just whether pages render.

## 22.1 Navigation Tests

Verify:
- Every navigation item.
- Active route state.
- Collapsible groups.
- Permission-aware visibility.
- Responsive navigation.
- Breadcrumbs.

## 22.2 Investigation Tests

Verify:
- List loading.
- Search.
- Filtering.
- Pagination.
- Creation.
- Detail navigation.
- Tab navigation.
- Quick actions.

## 22.3 Evidence Tests

Verify:
- Evidence list.
- Upload.
- Metadata.
- Detail view.
- Version history.
- Annotations.
- Downloads.
- Error handling.

## 22.4 Intelligence Tests

Verify:
- Entity search.
- Entity details.
- Relationship details.
- Graph selection.
- Graph filters.
- Map controls.
- Timeline filters.

## 22.5 AI and Reporting Tests

Verify:
- AI service availability handling.
- Investigation context.
- AI response rendering.
- Citation presentation.
- Report creation.
- Report editing.
- Review flow.
- Export behavior.

## 22.6 Accessibility and Responsive Tests

Verify:
- Keyboard navigation.
- Focus visibility.
- Text contrast.
- Dialog behavior.
- Small-screen navigation.
- No clipped content.
- Reduced-motion support.

---

# 23. PHASE NINETEEN — FINAL REGRESSION VALIDATION

Use the actual scripts in the existing package.json files.

Run appropriate checks:

- Frontend TypeScript.
- Frontend lint.
- Frontend unit tests.
- Frontend integration tests.
- Backend regression tests.
- Production build.
- Existing end-to-end tests.

Do not invent scripts.

Do not modify test assertions merely to make failing tests pass.

If a failure already existed before implementation, report it separately.

If a new failure is introduced, fix it before completing the task.

Do not report a successful build unless it actually completed successfully.

---

# 24. IMPLEMENTATION EXECUTION PROTOCOL

Follow this sequence.

STEP 1:
Inspect the repository and current working tree.

STEP 2:
Understand the existing frontend architecture.

STEP 3:
Create docs/UX_AUDIT.md.

STEP 4:
Identify reusable components and architectural constraints.

STEP 5:
Implement the shared design system.

STEP 6:
Upgrade the application shell and navigation.

STEP 7:
Upgrade dashboard and investigation workspace.

STEP 8:
Upgrade entities, relationships, and evidence.

STEP 9:
Upgrade graph, map, and timeline experiences.

STEP 10:
Upgrade AI assistant and reporting.

STEP 11:
Implement onboarding and interface preferences.

STEP 12:
Improve responsive design, accessibility, and performance.

STEP 13:
Run regression tests and production build.

STEP 14:
Review the Git diff and identify accidental changes.

STEP 15:
Produce the final engineering report.

Do not skip phases simply because the task is large.

If context or execution limits require multiple sessions, preserve progress in:

docs/UX_IMPLEMENTATION_PROGRESS.md

Record:
- Completed phases.
- Files modified.
- Components created.
- Remaining work.
- Test results.
- Known limitations.
- Next implementation step.

Continue from the recorded progress without repeating completed work.

---

# 25. FINAL ACCEPTANCE CRITERIA

The transformation is complete only when:

[ ] The existing application starts successfully.

[ ] Navigation is logically organized.

[ ] Existing routes still work.

[ ] Existing authentication is preserved.

[ ] Permission checks are preserved.

[ ] Dashboard uses real available data.

[ ] Investigation workspace is easier to understand.

[ ] Investigation quick actions work.

[ ] Evidence management is easier to navigate.

[ ] Entity and relationship pages are clearer.

[ ] Knowledge graph controls are usable.

[ ] Map and timeline experiences are improved.

[ ] AI Assistant has clearer contextual workflows.

[ ] Report creation and review are easier to follow.

[ ] First-time users receive useful guidance.

[ ] Empty, loading, and error states are consistent.

[ ] Responsive layouts work.

[ ] Accessibility has been improved.

[ ] No backend or database changes were introduced.

[ ] No existing API contracts were changed.

[ ] Existing functionality has not been replaced with mock data.

[ ] TypeScript and lint checks pass, or existing failures are documented.

[ ] Production build succeeds, or any existing blockers are documented.

[ ] Git changes have been reviewed.

---

# 26. FINAL ENGINEERING REPORT

At the end, provide a detailed report using this structure.

## A. Executive Summary
Explain what was improved and the overall result.

## B. UX Audit
Describe the major usability problems found.

## C. Implementation Summary
List every completed phase.

## D. Modified Files
Provide the exact paths of modified files.

## E. New Components
Explain newly created components and their purpose.

## F. Existing Components Reused
List important reused components.

## G. Feature Verification
Explain what was actually tested.

## H. Test Results
Provide exact commands and their results.

## I. Backend Preservation
Confirm whether backend, database, migrations, and API contracts remained untouched.

## J. Remaining Limitations
List anything that could not be implemented without additional backend support.

## K. Recommended Next Improvements
Prioritize future improvements by impact.

## FINAL INSTRUCTION

Do not deliver only a visual redesign.

Deliver a real engineering improvement to the existing ATLAS application.

The finished product must be:

- Easy to understand.
- Easy to navigate.
- Professionally designed.
- Consistent.
- Responsive.
- Accessible.
- Efficient.
- Trustworthy.
- Fully integrated with existing backend functionality.

The central principle is:

MAKE ATLAS EASIER TO USE WITHOUT MAKING IT LESS POWERFUL.

Inspect first. Plan carefully. Implement completely. Test honestly. Preserve the architecture.