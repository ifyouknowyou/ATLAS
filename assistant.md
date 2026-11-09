# ATLAS AI ASSISTANT — ADVANCED INTELLIGENCE WORKSPACE REDESIGN

## ROLE

Act as a Principal UI/UX Architect, Senior Next.js Engineer, React Specialist, Three.js Developer, AI Product Designer, and Enterprise Intelligence Platform Engineer.

Your assignment is to completely redesign and improve the existing ATLAS AI Assistant page.

You must work inside the existing ATLAS repository and integrate the redesign with its actual implementation.

This is an existing production-oriented intelligence application. Do not create a separate demonstration application.

Your objective is to transform the current AI Assistant into a sophisticated, investigation-aware intelligence workspace.

The new interface should combine:
- Advanced AI conversational experience.
- Investigation context management.
- Evidence-aware intelligence analysis.
- Entity and relationship exploration.
- Structured AI findings.
- Interactive analytical visualizations.
- Conversation history.
- Source and evidence references.
- Contextual investigation actions.
- Professional cyber-intelligence aesthetics.

The final result must look significantly more advanced than the current AI Assistant.

---

# 1. REFERENCE DESIGN ANALYSIS

You have three visual references:

1. Original ATLAS AI Assistant screenshot.
2. First generated redesign concept.
3. Second generated redesign concept.

Study all three before implementation.

Preserve the existing ATLAS identity, but substantially improve the page layout, information hierarchy, usability, and visual quality.

## Design direction

Use the following combination:

FROM REFERENCE 1:
- Premium intelligence dashboard.
- Futuristic AI identity.
- Suggested action cards.
- Structured investigation summaries.
- Visual relationship analysis.
- Timeline visualization.
- Evidence-aware AI responses.

FROM REFERENCE 2:
- Three-column intelligence workspace.
- Investigation context panel.
- Contextual quick actions.
- Central conversation area.
- Conversation history.
- Related resources.
- Investigation-specific AI operations.

FROM THE EXISTING ATLAS APPLICATION:
- Existing navigation.
- Existing dark interface.
- Existing authentication.
- Existing workspace identity.
- Existing investigation context.
- Existing API integration.
- Existing permissions.

Do not blindly copy either reference image. Create a coherent design appropriate for the actual application.

---

# 2. CRITICAL ARCHITECTURAL RULES

This is a FRONTEND-ONLY redesign.

DO NOT:
- Modify the NestJS backend.
- Modify backend services.
- Modify backend controllers.
- Modify Prisma schemas.
- Create database migrations.
- Change PostgreSQL structures.
- Change existing REST API contracts.
- Change authentication.
- Change authorization.
- Change tenant isolation.
- Change AI provider architecture.
- Expose provider API keys.
- Replace existing backend responses with fake data.
- Remove existing AI functionality.

Preserve the existing API client, query architecture, shared contracts, and permission system.

Inspect existing AI functionality before implementing any new interface.

If the current backend does not support a requested operation, clearly identify that limitation.

All displayed information must come from actual available data.

Never manufacture:
- Investigation statistics.
- Evidence references.
- Entity relationships.
- Confidence scores.
- AI citations.
- Source records.
- Analysis completion status.

---

# 3. PHASE ZERO — COMPLETE EXISTING IMPLEMENTATION AUDIT

Before writing code, inspect the actual AI Assistant implementation.

Inspect:

- AI Assistant page and routes.
- Main application layout.
- Existing sidebar.
- Topbar.
- AI assistant components.
- AI chat components.
- Conversation history.
- Message rendering.
- Streaming functionality.
- AI context selection.
- Investigation selector.
- Context retrieval.
- AI API endpoints.
- API client.
- TanStack Query hooks.
- Shared TypeScript contracts.
- Authentication and permissions.
- Existing error handling.
- Existing loading states.
- Existing CSS and animation utilities.

Inspect the complete AI Assistant data flow.

Determine:

1. How messages are submitted.
2. How AI responses are received.
3. Whether streaming is supported.
4. How conversation history is loaded.
5. How investigation context is selected.
6. How authorized records are retrieved.
7. How source references are represented.
8. How AI errors are handled.
9. How AI service availability is detected.

Create:

docs/AI_ASSISTANT_UX_AUDIT.md

Document the current architecture, reusable components, limitations, and implementation strategy.

Then proceed with the redesign.

---

# 4. PHASE ONE — COMPLETE PAGE LAYOUT

Create a premium three-column AI Assistant workspace.

The target desktop composition:

LEFT COLUMN:
Investigation context and quick actions.

CENTER COLUMN:
AI conversation and analytical responses.

RIGHT COLUMN:
Investigation information, conversation history, and related resources.

TOP:
Application navigation and AI Assistant identity.

BOTTOM:
Persistent AI message composer.

The layout must use available screen space efficiently.

Recommended desktop proportions:
- Left column: approximately 270–310px.
- Center column: flexible, approximately 55–65% of available content width.
- Right column: approximately 280–330px.

These values are starting points, not fixed dimensions.

Allow users to collapse secondary panels when the screen is smaller.

Avoid:
- Excessive empty space.
- Overlapping panels.
- Nested scrolling everywhere.
- Clipped conversation content.
- Tiny unreadable text.
- Unnecessary decorative elements.

---

# 5. PHASE TWO — PREMIUM APPLICATION HEADER

Redesign the AI Assistant header.

Include:

- AI Assistant title.
- Small Beta or availability indicator only if accurate.
- Short assistant description.
- Active investigation indicator.
- Current workspace context.
- Unified search entry.
- Notifications.
- Help.
- User profile.

Create a clear visual distinction between:

- Current workspace.
- Current investigation.
- AI conversation.

The user should always understand which investigation the AI is analyzing.

Preserve existing global navigation and user controls.

---

# 6. PHASE THREE — ADVANCED AI HERO SECTION

Create a visually distinctive AI Assistant introduction.

Design concept:

- Premium dark cinematic background.
- Subtle network visualization.
- Abstract AI intelligence graphic.
- Cyan and electric-blue lighting.
- Purple accent highlights.
- Fine grid and particle details.
- Minimal glass effects.

Content:

Title:
ATLAS Intelligence Assistant

Subtitle:
Your investigation-aware intelligence companion.

Supporting description:
Analyze investigations, connect evidence, explore relationships, identify information gaps, and prepare structured intelligence reports.

Include a context status indicator.

Possible states:
- Investigation Context Active.
- Organization Context Active.
- No Context Selected.
- Context Unavailable.

Only show a state when it accurately represents the actual application context.

The hero should be compact enough not to dominate the conversation.

---

# 7. PHASE FOUR — LEFT PANEL: INVESTIGATION CONTEXT

Create a dedicated Investigation Context panel.

Include:

A. Context selection:
- Organization-wide context.
- Investigation selection.
- Current selected investigation.

B. Investigation summary:
- Investigation name.
- Reference ID.
- Status.
- Priority.
- Classification.
- Created date, if available.

C. Context information:
- Available entities.
- Available evidence.
- Available relationships.
- Available tasks.
- Available timeline events.

Use actual backend data.

Do not show fake counts.

D. Context controls:
- Change investigation.
- Clear context.
- View investigation.
- Refresh context, if supported.

Make context selection obvious.

The assistant must never imply that it can access records outside the current user's permissions.

---

# 8. PHASE FIVE — LEFT PANEL: QUICK INTELLIGENCE ACTIONS

Create a visually polished Quick Actions section.

Suggested actions:

1. Summarize Investigation.
2. Analyze Selected Entity.
3. Explain Relationship.
4. Find Evidence Gaps.
5. Build Timeline.
6. Identify Conflicting Observations.
7. Explore Related Entities.
8. Draft Investigation Report.
9. Review Evidence References.

Each action must:
- Have a clear icon.
- Have a concise description.
- Show hover and focus feedback.
- Execute a real supported AI operation.
- Use current investigation context.
- Display loading feedback.
- Handle failure correctly.

Do not create buttons that only look functional.

If an action is not supported by existing APIs, do not pretend it is implemented.

---

# 9. PHASE SIX — CENTER PANEL: ADVANCED AI CONVERSATION

The conversation area is the most important component.

Redesign it as a modern intelligence-analysis workspace.

## 9.1 Conversation Structure

Include:

- Conversation header.
- Investigation context indicator.
- User messages.
- AI responses.
- Message timestamps where available.
- AI processing indicators.
- Source references.
- Message actions.
- Follow-up suggestions.

## 9.2 Message Design

User messages:
- Clear alignment.
- Distinct surface.
- Readable content.
- Timestamp.

AI messages:
- Assistant identity.
- Processing status where supported.
- Structured content.
- Source references.
- Analytical sections.
- Follow-up actions.

## 9.3 AI Response Renderer

Do not render every AI response as one large plain-text block.

Build a structured response presentation system.

Where the actual response data supports it, render:

- Executive Summary.
- Key Findings.
- Evidence References.
- Entity Analysis.
- Relationship Analysis.
- Timeline Overview.
- Potential Risks.
- Information Gaps.
- Analytical Limitations.
- Recommended Next Steps.

Use reusable components.

If the backend returns ordinary text, render it properly without inventing structured findings.

## 9.4 Message Actions

Where appropriate, support:

- Copy response.
- Retry or regenerate, if supported.
- Provide feedback.
- Expand details.
- Open referenced investigation records.
- Continue analysis.
- Use response in a report, if supported.

Every action must work.

---

# 10. PHASE SEVEN — STRUCTURED INTELLIGENCE RESPONSE CARDS

Create advanced analytical cards for supported AI response types.

## Executive Summary Card

Display:
- Summary heading.
- Key observation.
- Supporting references.
- Relevant investigation context.

## Key Findings Card

Display:
- Finding title.
- Description.
- Source references.
- Confidence only when supplied by a valid backend field.

## Entity Analysis Card

Display:
- Entity identity.
- Entity type.
- Available attributes.
- Related entities.
- Supporting evidence.
- Investigation associations.

## Relationship Analysis Card

Display:
- Source entity.
- Relationship.
- Target entity.
- Available supporting records.
- Relationship metadata.
- Confidence where supported.

## Evidence Reference Card

Display:
- Evidence reference.
- Evidence title.
- File type.
- Available status.
- Associated investigation.
- Open evidence action.

## Timeline Card

Display:
- Event date.
- Event title.
- Event description.
- Associated entities.
- Evidence references.

## Information Gap Card

Display:
- Missing information.
- Why it matters.
- Relevant existing records.
- Suggested analyst follow-up.

These are presentation components, not new backend data models.

Never invent fields that are absent from the actual response.

---

# 11. PHASE EIGHT — VISUAL INTELLIGENCE ANALYSIS

Create a more advanced visual analysis experience inside AI responses.

Where actual structured data is available, display:

- Entity relationship diagrams.
- Small network graphs.
- Timeline visualizations.
- Evidence relationship views.
- Investigation connection summaries.

Reuse existing graph and timeline components where practical.

Technology:
- Existing Three.js.
- React Three Fiber.
- Existing graph implementation.
- Existing visualization libraries.

Do not create an unnecessary second graph engine.

## Entity Relationship Visualization

Display:
- Entity nodes.
- Relationship connections.
- Labels.
- Selected entity state.
- Supporting evidence indicators.

Allow users to open full Knowledge Graph analysis.

## Timeline Visualization

Display chronological events.

Use actual available timestamps.

Allow navigation to the full investigation timeline.

## Performance

- Avoid rendering large graphs inside every chat message.
- Use lazy loading.
- Use compact previews.
- Expand into a full analysis view when requested.
- Avoid unnecessary Three.js scene initialization.

The normal conversation must remain fast.

---

# 12. PHASE NINE — RIGHT PANEL: INVESTIGATION INTELLIGENCE

Create a dedicated right-side information panel.

Organize it using tabs:

TAB 1: INVESTIGATION

Display:
- Investigation name.
- Reference.
- Status.
- Priority.
- Classification.
- Available summary.

Include operational information only when supported.

TAB 2: SOURCES

Display:
- Actual source references.
- Relevant evidence records.
- Referenced entities.
- Available source metadata.
- Links to original records.

TAB 3: HISTORY

Display:
- Previous conversations where supported.
- Previous AI operations where supported.
- Conversation timestamps.
- Conversation titles.

Allow users to reopen a previous conversation if the existing backend supports it.

Do not display fabricated history.

TAB 4: RESOURCES

Display useful links to:
- Investigation.
- Knowledge Graph.
- Timeline.
- Evidence.
- Entities.
- Reports.

All links must use existing routes.

---

# 13. PHASE TEN — INVESTIGATION STATISTICS

Create a compact investigation statistics component.

Possible information:

- Entities.
- Evidence.
- Relationships.
- Tasks.
- Timeline events.
- Reports.

Requirements:

- Use actual authorized data.
- Clearly handle unavailable data.
- Avoid fake statistics.
- Make relevant statistics clickable.
- Navigate to the corresponding investigation section.

Use subtle visual indicators rather than oversized dashboard cards.

---

# 14. PHASE ELEVEN — ADVANCED MESSAGE COMPOSER

Create a premium persistent AI input area.

Design:

- Wide rounded input surface.
- Subtle cyan-purple border illumination.
- Clear placeholder.
- Send button.
- Attachment control only if supported.
- Context indicator.
- Keyboard interaction guidance.

Suggested placeholder:

"Ask anything about this investigation..."

Support:

- Enter to send, according to existing multiline behavior.
- Shift + Enter for a new line if compatible.
- Disabled send state for empty messages.
- Loading state.
- Submission error feedback.
- Message length validation.
- Accessible focus states.

Preserve existing message submission logic.

Do not create a fake attachment workflow.

---

# 15. PHASE TWELVE — CONTEXTUAL PROMPT SUGGESTIONS

Create suggested prompts below the composer.

Examples:

- Summarize this investigation.
- Identify missing evidence.
- Explain this relationship.
- Analyze recent timeline events.
- Find conflicting observations.
- Draft an intelligence report.

These suggestions should depend on available context and supported operations.

Clicking a suggestion must populate or submit a real prompt through the existing chat workflow.

Avoid repeating suggestions that already appear in the Quick Actions section.

---

# 16. PHASE THIRTEEN — CONVERSATION HISTORY

Improve conversation management.

Where existing functionality supports it:

- List previous conversations.
- Search conversation history.
- Display conversation titles.
- Display last updated time.
- Reopen conversations.
- Start a new conversation.
- Clear current conversation with confirmation.

Preserve existing conversation identifiers and backend behavior.

If conversation persistence is not supported, do not simulate permanent history.

---

# 17. PHASE FOURTEEN — VISUAL DESIGN SYSTEM

Create a consistent ATLAS AI visual language.

## Color direction

Primary:
- Deep navy.
- Midnight blue.
- Dark graphite.

Accents:
- Electric cyan.
- Teal.
- Deep blue.
- Controlled purple.

Semantic:
- Green for successful states.
- Amber for warnings.
- Red for errors.

## Visual effects

Use:
- Subtle glassmorphism.
- Layered dark surfaces.
- Fine grid patterns.
- Soft ambient lighting.
- Restrained gradients.
- Smooth transitions.
- Subtle glowing accents.

Avoid:
- Constant flashing.
- Excessive neon.
- Overloaded backgrounds.
- Unreadable text.
- Excessive animation.
- Large decorative 3D objects that reduce usable space.

## Typography

Use a clear hierarchy.

Technical labels may use a monospace font.

Body text must remain readable.

Maintain consistent line height, spacing, and metadata sizing.

## Motion

Use motion for:
- Panel transitions.
- Message appearance.
- Loading feedback.
- Hover states.
- Expand/collapse actions.
- Context changes.

Respect reduced-motion preferences.

---

# 18. PHASE FIFTEEN — ADVANCED INTERACTION DESIGN

Implement:

- Collapsible left panel.
- Collapsible right panel.
- Responsive three-column layout.
- Expandable analysis cards.
- Context switching.
- Tab switching.
- Message scrolling.
- Conversation history navigation.
- Search integration.
- Keyboard accessibility.
- Clear loading indicators.
- Useful tooltips.
- Confirmation dialogs where necessary.

Maintain a predictable scroll experience.

The composer must not cover the last message.

Do not create multiple nested scroll containers without a clear reason.

---

# 19. PHASE SIXTEEN — RESPONSIVE DESIGN

Support:

1920px desktop.
1440px desktop.
1280px laptop.
1024px tablet.
768px tablet.
390px mobile.

Desktop:
- Full three-column experience.

Tablet:
- Main conversation remains primary.
- Context panels become collapsible or drawer-based.

Mobile:
- Single-column conversation.
- Investigation context in a drawer.
- Quick actions in a compact expandable section.
- Related resources in a separate panel or drawer.
- Composer remains usable.
- No horizontal page overflow.

Do not simply shrink desktop components.

---

# 20. PHASE SEVENTEEN — ACCESSIBILITY

Implement:

- Semantic HTML.
- Accessible labels.
- Keyboard navigation.
- Visible focus indicators.
- Accessible tab controls.
- Screen-reader-friendly status messages.
- Appropriate contrast.
- Reduced-motion support.
- Accessible dialogs.
- Usable mobile controls.

All controls must be functional.

---

# 21. PHASE EIGHTEEN — PERFORMANCE

Pay particular attention to the AI Assistant because it can contain large conversations and complex visualizations.

Improve:

- Message list rendering.
- Conversation scrolling.
- Graph initialization.
- Timeline rendering.
- Lazy loading.
- API request behavior.
- Component re-rendering.
- Query caching.
- Large content rendering.
- Animation performance.

Avoid:
- Initializing Three.js unnecessarily.
- Re-rendering all messages after each input change.
- Re-fetching unchanged investigation context repeatedly.
- Loading unrelated resources.
- Rendering large visualizations before the user opens them.

Use existing dependencies and project conventions.

---

# 22. PHASE NINETEEN — ERROR AND TRUST MANAGEMENT

The interface must clearly distinguish:

- AI-generated analysis.
- Analyst-authored information.
- Actual evidence records.
- Source-backed findings.
- Unverified hypotheses.
- Missing information.

Display appropriate limitations.

Handle:
- AI provider unavailable.
- Network error.
- Unauthorized context.
- Missing investigation.
- Invalid message.
- Failed response.
- Empty source list.
- Missing evidence reference.
- Failed conversation retrieval.

Never claim analysis completed if it failed.

Never fabricate source citations.

Never expose internal errors, secrets, or API credentials.

---

# 23. PHASE TWENTY — TESTING

Run the existing test commands.

Verify:

1. AI Assistant page loads.
2. Existing sidebar works.
3. Existing navigation works.
4. Investigation selector works.
5. Context changes work.
6. AI messages submit correctly.
7. Existing streaming works, if supported.
8. Conversation history works.
9. Structured response rendering works.
10. Source links open correct records.
11. Evidence links open correct records.
12. Knowledge Graph links work.
13. Timeline links work.
14. Quick actions execute supported operations.
15. Message composer works.
16. Loading states work.
17. Error states work.
18. Responsive panels work.
19. Permissions are preserved.
20. Existing AI backend integration remains intact.

Run:
- TypeScript checks.
- ESLint.
- Existing frontend tests.
- Production build.
- Relevant backend regression tests.

Do not modify backend files to make frontend tests pass.

---

# 24. IMPLEMENTATION RULES

Follow this sequence:

STEP 1:
Audit existing AI Assistant architecture.

STEP 2:
Document existing functionality and data flow.

STEP 3:
Design the component architecture.

STEP 4:
Implement the new layout and design system.

STEP 5:
Implement the investigation context panel.

STEP 6:
Implement Quick Actions.

STEP 7:
Redesign the conversation experience.

STEP 8:
Implement structured response rendering.

STEP 9:
Implement visual intelligence previews.

STEP 10:
Implement the right-side investigation panel.

STEP 11:
Upgrade the message composer.

STEP 12:
Improve conversation history.

STEP 13:
Implement responsive behavior and accessibility.

STEP 14:
Optimize performance.

STEP 15:
Run regression tests.

STEP 16:
Review all Git changes.

If the implementation cannot be completed in one session, save progress in:

docs/AI_ASSISTANT_IMPLEMENTATION_PROGRESS.md

Record completed work, remaining tasks, modified files, and test results.

Continue from the recorded progress.

Do not repeatedly redesign already completed components.

---

# 25. FINAL ACCEPTANCE CRITERIA

[ ] New premium AI Assistant layout implemented.

[ ] Three-column desktop workspace implemented.

[ ] Investigation context panel functional.

[ ] Quick Actions functional where supported.

[ ] Conversation interface redesigned.

[ ] Structured AI responses supported.

[ ] Entity relationship previews integrated where supported.

[ ] Timeline previews integrated where supported.

[ ] Evidence references displayed correctly.

[ ] Right-side context panel implemented.

[ ] Conversation history integrated.

[ ] Persistent message composer implemented.

[ ] Suggested prompts functional.

[ ] Collapsible panels functional.

[ ] Mobile layout implemented.

[ ] Accessibility improved.

[ ] Performance checked.

[ ] Existing AI backend integration preserved.

[ ] Existing API contracts unchanged.

[ ] No database changes.

[ ] No fake intelligence data.

[ ] TypeScript and lint validation completed.

[ ] Production build verified.

---

# 26. FINAL ENGINEERING REPORT

Provide:

1. Existing AI Assistant architecture findings.
2. Design and UX improvements.
3. Complete modified file list.
4. New components created.
5. Existing components reused.
6. Existing API integrations preserved.
7. Actual features implemented.
8. Test commands and results.
9. Remaining limitations.
10. Performance improvements.
11. Backend files modified, if any (the expected number is zero).
12. Recommended next improvements.

FINAL PRODUCT OBJECTIVE:

Transform the existing ATLAS AI Assistant into a premium intelligence-analysis workspace.

It must feel like a unified environment where an analyst can:

- Select an investigation.
- Understand the available context.
- Ask investigation-aware questions.
- Analyze entities.
- Understand relationships.
- Explore supporting evidence.
- Review timelines.
- Identify information gaps.
- Generate structured intelligence.
- Prepare reports.

The design must be futuristic, sophisticated, readable, responsive, and genuinely functional.

Do not stop at visual mockups.

Inspect the existing code, implement the complete redesign, integrate actual data, test the functionality, and report the verified results.

MOST IMPORTANT:

PRESERVE THE EXISTING BACKEND.
PRESERVE THE EXISTING AI INTEGRATION.
UPGRADE THE COMPLETE AI ASSISTANT EXPERIENCE.