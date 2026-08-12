# ATLAS Phase 5 — Reports

The Report system (`/reports`) is a professional intelligence report builder,
review/approval workflow, and PDF/HTML/JSON exporter.

## Report model (§21–§22)

`Report` carries `title/description/summary/status/classification`,
`aiGenerated/aiStatus`, `currentVersion`, and `templateId`. Child tables:
`ReportVersion` (immutable snapshots), `ReportSection`, `ReportBlock`
(TEXT/HEADING/IMAGE/TABLE/ENTITY/RELATIONSHIP/EVIDENCE/TIMELINE/MAP/GRAPH/
AI_SUMMARY/CITATION_LIST/CALLOUT/PAGE_BREAK), `ReportCitation`, `ReportReview`,
`ReportApproval`.

Statuses: DRAFT → IN_REVIEW → APPROVED / CHANGES_REQUESTED → PUBLISHED (→ ARCHIVED).

## Builder (§23–§25)

- Sections are modular (add/reorder/rename/duplicate/delete/collapse).
- Blocks are reusable, with an extension-friendly design. The frontend offers
  native drag-and-drop **with keyboard alternatives** for accessibility.
- Autosave: mutations bump `currentVersion` and broadcast a `ReportDeltaPayload`;
  a stale autosave surfaces a 409 Conflict instead of silent last-write-wins.
- Templates (§26): six system templates are seeded per tenant
  (INVESTIGATION_REPORT, EXECUTIVE_INTELLIGENCE_BRIEF, EVIDENCE_SUMMARY,
  ENTITY_PROFILE, INCIDENT_ANALYSIS, RESEARCH_SUMMARY).

## Citations, review, approval, publishing (§28–§31, §48–§49)

- Citations validate the target exists **and** the caller can read it (403
  otherwise) — no dangling or unauthorized citations.
- Review is explicit: submit → reviewer APPROVE/REJECT/REQUEST_CHANGES.
  Approval is a separate, explicit server-side record (§31).
- Publishing is gated server-side: status must be APPROVED, the quality check
  must pass (`ReportQualityService`), the caller must hold `report.publish`, and
  **no unverified AI content** may be present. Published reports cannot be
  silently edited (builder blocks edits to PUBLISHED reports).

## Export (§32–§34)

- JSON: structured snapshot. HTML/JSON fields are **escaped** (XSS-safe).
- PDF (`pdfkit`): title page, diagonal classification watermark on every page,
  page numbers, sections, citations; author/reviewer names only when the caller
  is authorized. Restricted content is filtered for unauthorized callers.

## AI integration (§27, §46–§47)

- AI generation marks every block `aiGenerated` and the report
  `aiStatus = 'REVIEW_REQUIRED'`. AI content is never silently published.
- AI review returns advisory flags (unsupported claim, missing citation,
  conflicting source, ambiguous wording, missing evidence ref, unclear
  conclusion); a human makes the final call.
