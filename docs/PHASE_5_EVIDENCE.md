# ATLAS Phase 5 — Evidence Vault

The Evidence Vault (`/evidence`) is an intelligence evidence repository, not a
generic file manager.

## Secure ingestion (§4–§6)

- `POST /evidence/upload` accepts a multipart file (`FileInterceptor`,
  memory storage so validation happens before disk).
- Validation: size cap (`ATLAS_MAX_UPLOAD_MB`), **magic-byte** sniffing
  (PDF/PNG/JPEG/GIF/WebP/ZIP), MIME allowlist. A claimed binary type that does
  not match its signature is rejected.
- The server computes the real SHA-256 (`HashService`) and writes the file to
  local disk via `EvidenceStorageService` (path-traversal guarded, generated
  keys only — the client filename is never used on disk).
- Every upload creates an `Evidence` row (`AVAILABLE`), an `EvidenceVersion`
  (v1), an `UPLOADED` access event, an activity event, and a realtime delta.

## Versioning & chain of custody (§7–§9)

- `EvidenceVersion` stores immutable snapshots: storage key, SHA-256, size,
  mime, original filename, change type. `POST /evidence/:id/versions/:n/restore`
  re-materials a historical version as a new version.
- `EvidenceAccessEvent` records every meaningful action (UPLOADED, DOWNLOADED,
  PREVIEWED, ANNOTATED, CLASSIFICATION_CHANGED, ARCHIVED, RESTORED, DELETED,
  PROCESSED) with only **safe metadata** — an application audit trail, never a
  legal-admissibility claim and never secrets.

## Access control & classification (§10–§11)

- `EvidenceAccessService.requireEvidence` enforces: org scope → investigation
  membership (or org permission for org-level evidence) → classification gate.
- `RESTRICTED` requires an org admin (OWNER/ADMIN) or — for investigation-scoped
  evidence — investigation manager access. Classification **lowering** requires
  `evidence.classify` and is audited.

## Annotations, links, search, processing (§15–§20)

- Annotations (HIGHLIGHT/COMMENT/TAG/REGION/BOOKMARK) are stored as separate
  records; the original evidence is never mutated. Edit/delete requires the
  author or an elevated principal.
- Evidence links validate the target exists and is readable before creating.
- `/evidence/search` filters title/description/content, kind, status,
  classification, investigation, uploader, date, hash — always scoped.
- Processing jobs (`POST /evidence/:id/process`) enqueue async work on the
  `BackgroundJob` queue (text/metadata extraction, OCR/embedding adapter seams
  → PARTIAL with safe messages when unconfigured). Statuses:
  QUEUED/PROCESSING/COMPLETED/PARTIAL/FAILED.

## Secure delivery (§62)

- `GET /evidence/:id/download` / `preview` stream with the bearer token and a
  delivery-time re-authz (membership, classification, status).
- `GET /evidence/:id/signed-url` mints a ~120s JWT scoped to one evidence
  (optionally one version) for `<img>/<object>/iframe`. The `@Public`
  `/evidence/deliver/:token` endpoint **re-validates live access at delivery**,
  so archiving/restricting evidence revokes previously-minted URLs immediately.
- No permanent public storage URLs exist.
