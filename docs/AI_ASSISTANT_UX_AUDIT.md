# AI Assistant UX Audit

## Existing architecture

- `/assistant` renders `AssistantWorkspace`.
- `useAiChat` posts to the existing `/api/ai/chat` endpoint and preserves the
  optional investigation scope plus prior turns.
- `useAiMessages` loads persisted, tenant-scoped messages from
  `/api/ai/messages`.
- `useAiSummarize` calls the existing `/api/ai/summarize` endpoint and returns
  the structured summary payload already supported by the API.
- `InvestigationPicker` loads authorized investigations through
  `useInvestigations`; it does not invent local investigation data.
- Assistant source references use the shared `AiSourceRef` contract and link to
  existing entity, evidence, and external web routes.
- The existing `AtlasScene` provides a lightweight constellation preview from
  source records.

## Existing strengths

- AI requests remain server-side and use the established authentication,
  permissions, tenant isolation, and API client.
- Conversation history and source references are real backend data.
- The summary operation is already wired to a supported backend operation.
- The page already supports investigation context through the URL and picker.

## Gaps addressed by the redesign

- No clear three-column information hierarchy or collapsible secondary panels.
- Investigation metadata and authorized record counts were not visible beside
  the conversation.
- Quick actions were absent; the redesign routes supported analysis intents
  through the existing chat operation and keeps summarization on its existing
  endpoint.
- Responses were rendered as a single text block with no heading-aware
  presentation.
- Source, history, and resource navigation were not grouped into a right-side
  intelligence panel.
- Mobile and tablet behavior did not provide panel drawers or a compact
  context surface.

## Constraints and limitations

- The API returns text plus source references, not typed finding, entity
  relationship, or timeline cards. The UI therefore renders recognized
  headings only when the model actually supplies them and never fabricates
  confidence, timestamps, relationships, or statistics.
- There is no separate conversation identifier or streaming hook in the current
  web contract. The redesign keeps persisted message history and the current
  request lifecycle without simulating unsupported features.
- Attachments, regeneration, feedback, and report insertion are not exposed by
  current APIs and are intentionally not presented as functional controls.

## Implementation strategy

Build the assistant as a frontend composition around the current hooks:

1. Keep `useAiChat`, `useAiMessages`, `useAiSummarize`, and
   `useInvestigations` unchanged.
2. Add responsive left context, center conversation, and right intelligence
   panels.
3. Use authorized investigation list data for metadata and counts.
4. Route quick actions through the existing chat or summary mutation.
5. Render source references and recognized response sections without creating
   new backend models or API contracts.
