# ATLAS Phase 5 — Security Audit

Deep Phase 5 security review (§64). Findings are addressed in code; the
remaining items are documented as accepted risks with mitigations.

## Verified controls (with tests)

| Area | Control | Test evidence |
|---|---|---|
| BOLA / IDOR | Every evidence/report/comment query is org-scoped; cross-org access 404s (no existence leak) | `evidence.e2e-spec` (other-org download), `collaboration.e2e-spec` (outsider reads) |
| Tenant escape | `listEvidenceWhere`/`listReportsWhere` anchor on `organizationId`; realtime `publish`/`publishToUser` filter by org | `realtime.service.spec` (org isolation) |
| Classification bypass | RESTRICTED requires org admin or investigation manager; classification lowering needs `evidence.classify` + audit | `evidence-access.service.spec`, `evidence.e2e-spec` (archived/restricted deny) |
| Insecure downloads | No permanent storage URLs; authorized streaming + short-lived signed URLs that **re-validate at delivery** (archive/restrict revokes immediately) | `evidence.e2e-spec` (signed URL revoked after archive) |
| Upload security | memory storage before disk, magic-byte + MIME + size validation, server-computed SHA-256, generated storage keys, path-traversal guard | `evidence-upload.controller`, `evidence-storage.service.spec`, `evidence.e2e-spec` (magic-byte rejection) |
| Stored XSS | Comment/report bodies are escaped on export (HTML/JSON) and rendered as text in React (never `dangerouslySetInnerHTML`); helmet `nosniff` | `collaboration.e2e-spec` (script stored verbatim), `CommentComposer.test.tsx` (renders as text) |
| Report leakage | Exports filter restricted content for unauthorized callers; citations validate target access; quality gate blocks broken/unauthorized citations | `reports.e2e-spec` (unverified AI blocks publish), `report-export.service` (restricted filtering) |
| Business logic | Viewer cannot modify evidence; Contributor cannot approve reports; draft cannot publish without approval; published cannot be edited; AI content cannot auto-publish | `reports.e2e-spec` (Contributor approve 403, draft publish 409, AI publish 409), `evidence.e2e-spec` |

## Signed URL semantics (§62/§64)

- Tokens are JWT, `scope='evidence-download'`, `exp` = `ATLAS_SIGNED_URL_TTL_S`
  (120s), bound to evidenceId (+ optional versionId) and the requester's
  session.
- Delivery (`/evidence/deliver/:token`, `@Public`) reconstructs the principal
  from the DB and re-checks: session active, membership, classification, and
  evidence status. **Revocation is immediate** — a minted token cannot bypass a
  later archive/re-classify/membership removal.

## Permission-aware notifications (§42)

- Create-time: a notification is skipped when the recipient cannot read the
  target (no leak of the resource's existence).
- Delivery-time: the destination endpoint re-authorizes; a notification is a
  hint, never a bypass.

## Rate limiting (§63)

Custom `RateLimitGuard` (in-memory sliding window, per user): uploads 5/min,
downloads 60/min, previews 120/min, evidence processing 10/min, PDF export
5/min, AI report generation 10/min, comments 30/min, realtime ticket 10/min,
presence heartbeats 60/min. **Caveat:** the store is per-process — multi-instance
deployments need a shared store (e.g. Redis). Documented, not silently claimed
to scale.

## Accepted risks / notes

- OCR/embedding are adapter seams; when unconfigured, processing completes as
  `PARTIAL` with a safe message rather than failing the evidence.
- The in-process `BackgroundJob` queue is single-instance; atomic claim
  prevents double-run. A shared queue (Redis-backed) is the documented path to
  scale-out.
- SSE presence is in-memory per process; acceptable for the Phase 5
  single-instance deployment.
- Chain-of-custody is an **application-level audit trail** — it makes no legal
  admissibility claim and stores only safe metadata.
