# Phase 7 Security, Reliability, and QA Tests

## Goal
Verify the Phase 7 hardening work for the ATLAS ENTERPRISE INTELLIGENCE PLATFORM.

## Security Tests

### Prompt Injection Defense
- [ ] `SecurityService.validatePromptInput` rejects obvious injection payloads
- [ ] `SecurityService.validatePromptInput` rejects long prompts (>10000 chars)
- [ ] `SecurityService.sanitizeText` removes HTML tags and inline event handlers

### File Upload Security
- [ ] `SecurityService.validateMimeType` rejects files with mismatched extension/MIME
- [ ] Download path is never below configured upload root (`../` blocked)
- [ ] File size is checked against `maxUploadBytes` before the file is stored
- [ ] Executable extensions (`.sh`, `.cmd`, `.bat`, `.js`, `.exe`) are rejected

### Evidence Integrity
- [ ] Uploaded evidence SHA-256 hash is stored at create time
- [ ] Re-computed hash on download matches stored value; tamper detected
- [ ] Corrupted file triggers integrity failure (not storage)

### Classification Enforcement
- [ ] `SecurityService.enforceClassificationScope` denies read when lower classification
- [ ] Full policy stored on saved search; re-evaluated before every result set

### Export Security
- [ ] Redis-backed throttle rejects export when per-user limit exceeded
- [ ] No export path (DTO, Zod schema) exposes password hash, raw token, or secret
- [ ] Export response includes classification watermark (`X-Classification` header)

## API Hardening

### Input Validation
- [ ] All string inputs pass through `InputValidationPipe`
- [ ] Extra fields rejected from DTOs (`transform: false`)
- [ ] Array lengths bounded (tags, sourceIds, etc.)
- [ ] Enums validated at boundary (GraphAnalysisType, AlertSeverity, etc.)

### Pagination
- [ ] Every list endpoint requires `limit` (capped at 200)
- [ ] Cursor-base href returned for next/prev pages
- [ ] `take` parameter coerced to number; bad values return 400

### Rate Limiting
- [ ] All sensitive endpoints participate in tiered limiter
- [ ] `RateLimitReached` error includes `retryAfter` on 429
- [ ] Audit log records `RATE_LIMITED` events

## Job System

### Background Jobs
- [ ] Idempotent `jobId` deduplication prevents duplicate executions
- [ ] Poison message after 3 failures moves job to dead-letter topic
- [ ] Job status transitions: QUEUED -> RUNNING -> COMPLETED | FAILED
- [ ] Heartbeat timeout marks stalled jobs as FAILED

### Connectors
- [ ] API credentials stored encrypted; never returned plain
- [ ] Sandboxed outbound call; private network blocked by `NETWORK_BLOCKLIST`
- [ ] RBAC enforced at every connector operation
- [ ] Per-connector quota (fetch, parse, transform)
- [ ] Dedicated dead-letter queue per connector for failures

## Observability

### Structured Logging
- [ ] All logs JSON-parseable after sanitization
- [ ] Sensitive keys redacted: `password`, `token`, `secret`, `apiKey`
- [ ] `requestId` present on every log line
- [ ] `durationMs` present on completed request logs

### Request Correlation
- [ ] `/health/live` always returns 200 even if DB is down
- [ ] `/health/ready` returns 503 if DB or queue is unhealthy
- [ ] `X-Request-ID` header echoed in response

### Error Tracking
- [ ] Client-safe error response omits stack trace
- [ ] `errorId` returned in response and full log entry
- [ ] Safe message returned to client; full detail in structured log

## Anti-Corruption & Concurrency

### Distributed Locking (Phase 7a)
- [ ] `DistributedLockService.acquire` returns false if lock already held
- [ ] TTL expiration releases stale lock automatically
- [ ] `onModuleDestroy` cleans process-owned locks

### Locked Workflows
- [ ] Workflow `runToken` enforced unique in DB
- [ ] Approval gate prevents concurrent step execution
- [ ] Abort/Cancel updates status and stops step execution

## Test Execution Commands

```bash
# Unit
cd /home/who/All\ Project/ATLAS
n=5; while ((n-- > 0)); do
  npx jest apps/api/src/security/security.service.spec.ts --silent && break
  sleep 2
done

# Integration
# 1. Start API: cd apps/api && npm run start:dev
# 2. Seed demo tenant: scripts/seed-demo.sh
# 3. Auth: curl -X POST http://localhost:3001/auth/login -H ...
# 4. Run table of curl commands below
```

## Expected Failure Manifest
- `POST /admin/operations` (non-admin) → 403
- `POST /exports/...` after quota → 429 with `X-RateLimit-Remaining: 0`
- `POST /connectors/sources/:id/syncs` without `secret:read` → 403
- Evidence download with tampered `id` → 404 or 403 (no leak)
- `POST /workflows/:id/runs` (non-admin on locked workflow) → 409 Conflict