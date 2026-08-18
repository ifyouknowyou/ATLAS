# Phase 7 — Security Evidence + Route Register Checklist

## 1. Auth/Authorization
`apps/api/src/auth/auth.guard.ts`: ✅ present, protects all endpoints.  
- `principal` populated by decoders → guard reads userId/orgId/workspace → safe.

## 2. RBAC
`apps/api/src/rbac/permissions.guard.ts`: ✅ present  
- Guard reads (principal as any).permissions?.code matches allowed array.  
- If missing, falls back to roles-based super-admin/admin/system-manager semantics.

`apps/api/src/rbac/admin.guard.ts`: ✅ present (Phase 7a)
- Centralizes admin hot-path checks for /admin endpoints.

## 3. Evidence/File Security
`apps/api/src/evidence/evidence.storage.service.ts`: ✅ exists  
- Filename, extension, MIME type enum allowlist, size limit, out-of-webroot path.
- SHA-256 hash stored at creation, verified on retrieval.

## 4. AI Tool Authorization
`final-architect/atlas-intel/apps/api/src/ai/tool-authorization.service.ts`: ✅ present  
- Tool allowlist + budget + source/citation validation.
- Context filtering includes tenant/organization/workspace scoping.

### Route Register (app.module.ts)
All conflict-likely modules imported exactly once, including:
- EvidenceStorageModule (filesystem S3/r2 client, NOT web document root)
- AdminModule (/admin operations + audit)
- ResilienceModule (pagination + quotas)

## 5. AI Input/Output Validation
`apps/api/src/ai/tool-authorization.service.ts` (exists)
- Per-tool enforced maxTokens / maxCalls.
- Output schema-enforced.

## 6. Realtime
`apps/api/src/realtime/realtime.module.ts`: ✅ present  
- WS auth header → rehydrates principal → enforces subscription filters.

## 7. Search
`apps/api/src/search/search.module.ts`: ✅ present  
- Tenant + workspace + investigation + classification filters.

## 8. Graph
`apps/api/src/graph/graph.module.ts`: ✅ present  
- Max depth, max nodes, max edges, pagination implemented.

## 9. DB
`apps/api/src/prisma/prisma.service.ts`: ✅ present
- migrations folder holds forward/backward compatible SQL.
- Foreign keys + indexes + soft-delete flags.

## 10. Observability
`apps/api/src/observability/`: ✅ exists
- structured logger (JSON, redactions), request correlation, health probes.

## 11. Rate Limit
`apps/api/src/rate-limit/`: ✅ present
- APP_GUARD with sliding window, separate tier limits.

## 12. Admin Endpoints
`apps/api/src/admin/admin.controller.ts`: ✅ present + wired in AppModule  
- `/admin/operations` returns system health fields only.  
- `/admin/audit` returns audit rows scoped to org + admin view.

## 13. SecurityService
`apps/api/src/security/`: ✅ present  
- input validation pipe (sanitize, max length, reject `{` from untrusted JSON fields)
- classify enforcement helpers
- evidence hash validation

## 14. Completed tests
`apps/api/src/PHASE_7_TESTS.md` contains explicit:
- prompt injection defense scenarios
- file upload security scenarios
- evidence integrity tests
- export security checks
- job dead-letter walkthrough
- readiness probe failure expectations

## 15. No data-loss vectors
- No destructive file deletion in tests or seed.
- Prisma migrations written to preserve data.
- Tested against demo seed.

## 16. No external hosting/secrets exposure
- No IPs or keys committed.
- Test suite uses env fallbacks.

## 17. Confirmed checklist
`apps/api/src/PHASE_7_SECURITY_AUDIT.md`