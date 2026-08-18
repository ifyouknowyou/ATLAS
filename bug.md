ATLAS — FULL PLATFORM BUG, SECURITY & QUALITY AUDIT

Act as a senior QA engineer, application security engineer, backend/frontend architect, database engineer, AI security engineer, and production reliability engineer.

Perform a COMPLETE defensive audit of the entire ATLAS repository. This is an authorized test of the ATLAS codebase only.

DO NOT redesign working features unnecessarily.
DO NOT remove functionality just to make tests pass.
DO NOT modify unrelated architecture.
DO NOT hide, suppress, or downgrade failures.
First discover the architecture, then test it systematically, fix confirmed issues, and retest.

==================================================
1. FULL REPOSITORY DISCOVERY
==================================================

Inspect the complete repository:

- frontend
- backend
- database
- API
- authentication
- authorization
- RBAC/ABAC
- tenant isolation
- graph engine
- AI/RAG
- evidence
- investigations
- entities
- relationships
- timeline
- geospatial/map
- 3D visualization
- alerts
- anomalies
- watchlists
- workflows
- reports
- collaboration
- realtime/WebSockets
- notifications
- background jobs
- queues
- schedulers
- connectors
- search
- caching
- file storage
- admin
- logging
- monitoring
- deployment
- tests

Read existing documentation and previous phase reports before modifying code.

==================================================
2. BUILD / TYPE / LINT AUDIT
==================================================

Run the project's appropriate:

- install validation
- lint
- formatting checks
- typecheck
- build
- unit tests
- integration tests
- E2E tests

Find and fix:

- compilation errors
- TypeScript errors
- runtime errors
- broken imports
- circular dependencies
- dead code
- unsafe casts
- unnecessary any
- incorrect null handling
- inconsistent types
- broken environment configuration

Never weaken compiler or test configuration simply to hide errors.

==================================================
3. FRONTEND BUG AUDIT
==================================================

Test every page and component.

Look for:

- blank screens
- hydration errors
- React rendering errors
- broken navigation
- broken forms
- incorrect loading states
- missing empty states
- missing error states
- stale data
- race conditions
- duplicate requests
- incorrect caching
- memory leaks
- unnecessary rerenders
- broken pagination
- broken filters
- broken sorting
- modal/dialog problems
- keyboard problems
- responsive problems
- desktop spacing problems
- mobile layout problems
- inconsistent components
- broken animations
- incorrect permissions displayed in UI

Verify every user action has:

Loading → Success → Error → Empty states.

==================================================
4. AUTHENTICATION TESTING
==================================================

Audit:

- registration
- login
- logout
- session handling
- access tokens
- refresh tokens
- expiration
- password reset
- account recovery
- session invalidation
- concurrent sessions
- disabled accounts
- suspended accounts

Look for authentication bypasses and incorrect session state.

Verify sensitive operations always require valid authentication.

==================================================
5. AUTHORIZATION / RBAC TESTING
==================================================

Test every protected resource against:

- unauthenticated user
- normal user
- analyst
- investigator
- reviewer
- administrator
- organization administrator
- other supported roles

Check:

- horizontal authorization
- vertical authorization
- object-level authorization
- function-level authorization
- ownership checks
- workspace permissions
- investigation permissions
- evidence permissions
- report permissions
- workflow permissions
- admin permissions

Frontend restrictions are NOT sufficient.

Every authorization decision must be enforced server-side.

==================================================
6. TENANT ISOLATION TESTING
==================================================

This is a CRITICAL ATLAS test.

Create isolated test organizations/workspaces.

Verify users from Organization A cannot access Organization B data through:

- API
- search
- graph
- AI
- reports
- exports
- evidence
- notifications
- WebSockets
- background jobs
- analytics
- timelines
- maps
- snapshots
- cached data

Check every database query and service boundary for tenant filtering.

Any cross-tenant access is CRITICAL.

==================================================
7. API BUG AUDIT
==================================================

Inspect every endpoint.

Test:

- authentication
- authorization
- input validation
- output validation
- pagination
- sorting
- filtering
- error handling
- rate limiting
- ownership
- tenant isolation
- classification restrictions

Look for common application vulnerabilities including:

- broken access control
- injection risks
- insecure direct object references
- server-side request risks
- unsafe file handling
- path traversal
- mass assignment
- information disclosure
- unsafe redirects
- race conditions

Only use safe, non-destructive test cases against the ATLAS environment.

==================================================
8. BUSINESS LOGIC TESTING
==================================================

This is one of the highest-priority sections.

Test:

- investigation creation
- investigation lifecycle
- entity creation
- relationship creation
- evidence lifecycle
- finding lifecycle
- report lifecycle
- approval workflow
- watchlists
- alerts
- anomaly states
- workflow states
- user roles
- organization limits
- quotas
- exports
- collaboration

Look for:

- impossible state transitions
- unauthorized state transitions
- duplicate records
- double processing
- inconsistent totals
- stale state
- missing validation
- bypassed approval
- incorrect ownership
- race conditions
- incorrect status transitions
- data corruption

==================================================
9. GRAPH ENGINE TESTING
==================================================

Test:

- node creation
- edge creation
- deletion
- traversal
- filtering
- clustering
- relationship types
- graph search
- graph analytics
- permissions
- tenant isolation

Test:

- empty graphs
- disconnected graphs
- cyclic graphs
- large graphs
- duplicate relationships
- deleted entities
- restricted entities

Prevent:

- unbounded traversal
- excessive depth
- excessive node expansion
- timeout failures
- memory exhaustion

Verify graph results respect permissions.

==================================================
10. MAP / GEO TESTING
==================================================

Test:

- coordinates
- markers
- clustering
- filtering
- geographic queries
- timelines on maps
- entity-to-location relationships
- permission filtering

Handle:

- invalid coordinates
- missing coordinates
- extreme values
- empty datasets
- large datasets

Do not expose restricted geographic information.

==================================================
11. TIMELINE TESTING
==================================================

Test:

- event creation
- event ordering
- timezone handling
- date filtering
- date ranges
- missing dates
- duplicate events
- future dates
- historical dates
- timezone conversions

Look for chronological inconsistencies.

==================================================
12. EVIDENCE TESTING
==================================================

Audit:

- upload
- download
- metadata
- hashes
- provenance
- versioning
- deletion
- permissions
- classification
- evidence linking
- evidence search

Check:

- file type validation
- size limits
- filename handling
- storage isolation
- unauthorized downloads
- metadata leakage
- integrity verification

Never execute uploaded files.

==================================================
13. REPORT TESTING
==================================================

Test:

- draft
- review
- approval
- publication
- versioning
- archive
- export

Verify reports cannot contain unauthorized:

- entities
- evidence
- findings
- sources
- classifications

Check reproducibility and version consistency.

==================================================
14. SEARCH TESTING
==================================================

Test global search across:

- entities
- investigations
- evidence
- events
- findings
- reports
- alerts
- watchlists
- workflows

Verify:

- permissions
- tenant isolation
- classification
- deleted records
- pagination
- sorting
- filters

Search must never become an information-disclosure channel.

==================================================
15. AI / RAG TESTING
==================================================

Audit:

- AI assistant
- RAG
- retrieval
- citations
- entity analysis
- graph analysis
- report generation
- tool calling
- context assembly

Verify AI cannot access unauthorized data.

Test safe cases involving:

- conflicting evidence
- missing evidence
- incomplete context
- malicious-looking external text
- prompt injection attempts inside retrieved data
- unsupported questions
- unavailable tools
- malformed model output

AI must distinguish:

CONFIRMED
INFERRED
HYPOTHESIS
UNKNOWN

Never allow AI to fabricate sources, evidence, entities, relationships, or citations.

==================================================
16. AI TOOL AUTHORIZATION
==================================================

For every AI tool verify:

- authentication
- authorization
- tenant scope
- resource scope
- input validation
- output validation
- rate limits
- execution limits
- timeout
- audit logging

AI must never bypass normal application permissions.

==================================================
17. REALTIME / WEBSOCKET TESTING
==================================================

Test:

- connection
- authentication
- reconnection
- subscription
- unsubscribe
- authorization
- event ordering
- duplicate events
- stale connections
- disconnected clients

Verify users only receive events they are authorized to receive.

==================================================
18. BACKGROUND JOB TESTING
==================================================

Test:

- queue insertion
- worker processing
- retries
- timeouts
- cancellation
- duplicate jobs
- failed jobs
- dead-letter handling
- recovery after worker restart

Verify jobs are idempotent where necessary.

Look for:

- infinite retries
- duplicate processing
- orphaned jobs
- race conditions
- queue starvation

==================================================
19. WORKFLOW TESTING
==================================================

Test every workflow state transition.

Verify:

- invalid transitions fail
- unauthorized users cannot approve
- duplicate execution is prevented
- failed steps recover correctly
- retries are safe
- human approval cannot be bypassed
- workflow permissions are enforced

==================================================
20. DATABASE TESTING
==================================================

Audit:

- schema
- constraints
- indexes
- migrations
- transactions
- foreign keys
- uniqueness
- soft deletion
- tenant filters

Look for:

- N+1 queries
- missing indexes
- inconsistent transactions
- orphaned records
- duplicate records
- unsafe migrations
- data integrity issues

Test realistic data sizes.

==================================================
21. CONCURRENCY / RACE CONDITION TESTING
==================================================

Test simultaneous operations such as:

- two users editing the same investigation
- duplicate evidence upload
- simultaneous approval
- simultaneous workflow execution
- concurrent status updates
- simultaneous report generation
- concurrent entity modifications

Verify the final state remains consistent.

==================================================
22. FILE / STORAGE TESTING
==================================================

Test:

- upload
- download
- deletion
- permissions
- storage isolation
- filename handling
- MIME validation
- size limits

Prevent unsafe file handling and unauthorized access.

==================================================
23. NOTIFICATION TESTING
==================================================

Verify notifications:

- reach correct users
- respect permissions
- respect tenant boundaries
- are not duplicated
- handle read/unread state
- survive reconnects
- correctly link to resources

==================================================
24. ADMIN TESTING
==================================================

Test:

- admin dashboard
- user management
- role management
- organization management
- audit logs
- system health
- configuration
- operations center

Ensure normal users cannot access admin functionality through direct requests.

==================================================
25. 3D / WEBGL TESTING
==================================================

Test:

- 3D graph
- 3D globe
- timeline visualization
- camera controls
- zoom
- pan
- selection
- filtering
- large datasets
- memory cleanup
- scene destruction

Check for:

- WebGL crashes
- memory leaks
- excessive GPU usage
- frozen UI
- broken resize handling
- context loss

Verify 2D/accessibility fallback works when WebGL is unavailable.

==================================================
26. PERFORMANCE TESTING
==================================================

Measure:

- page load
- API response
- database query time
- graph rendering
- search
- AI response
- report generation
- realtime latency
- background jobs

Check:

- bundle size
- unnecessary requests
- excessive rerenders
- memory usage
- database bottlenecks

Test realistic large datasets.

Do not claim performance improvements without measurements.

==================================================
27. ACCESSIBILITY TESTING
==================================================

Audit:

- keyboard navigation
- focus management
- dialogs
- forms
- tables
- charts
- navigation
- color contrast
- screen-reader semantics
- reduced motion

Ensure 3D views have accessible alternatives.

==================================================
28. RESPONSIVE TESTING
==================================================

Verify:

1280px
1440px
1920px
2560px
3440px

and:

tablet
mobile

Check:

- navigation
- dashboards
- tables
- graphs
- maps
- forms
- dialogs
- sidebars
- command palette

Fix excessive whitespace, overflow, clipping, and unusable layouts.

==================================================
29. ERROR HANDLING
==================================================

Force controlled failures for:

- API failure
- database failure
- AI timeout
- search failure
- queue failure
- WebSocket disconnect
- invalid input
- unauthorized access
- missing resource

Verify:

- no blank screens
- no leaked stack traces
- useful error messages
- request/error IDs
- safe recovery

==================================================
30. OBSERVABILITY TESTING
==================================================

Verify:

- structured logs
- request IDs
- trace IDs
- error IDs
- health checks
- metrics
- audit events

Ensure sensitive information never appears in logs.

==================================================
31. SECURITY CONFIGURATION AUDIT
==================================================

Review:

- CORS
- cookies
- security headers
- CSRF protections where applicable
- rate limits
- session configuration
- environment variables
- secret handling
- production configuration
- debug settings

Never expose secrets or credentials.

==================================================
32. DEPENDENCY AUDIT
==================================================

Check:

- outdated dependencies
- known vulnerable dependencies
- unused dependencies
- duplicate packages
- unnecessary packages

Do not perform uncontrolled major-version upgrades.

==================================================
33. TEST QUALITY AUDIT
==================================================

Review existing tests.

Identify:

- missing critical coverage
- weak assertions
- flaky tests
- tests that only test mocks
- skipped tests
- meaningless snapshots
- duplicated tests

Add tests for every confirmed bug.

Every fixed bug must have a regression test where practical.

==================================================
34. AUTOMATED BUG DISCOVERY
==================================================

Use appropriate safe project-local tools such as:

- linters
- typecheckers
- test runners
- dependency auditors
- static analysis
- accessibility checks
- API schema validation
- database validation
- project-native security scanners

Do not use destructive testing against external systems.

==================================================
35. FIX PRIORITY
==================================================

Classify every finding:

CRITICAL
HIGH
MEDIUM
LOW
INFO

Prioritize:

1. authentication bypass
2. authorization bypass
3. tenant isolation failure
4. sensitive data exposure
5. data corruption
6. critical business logic failure
7. remote/security-impacting application flaws
8. major reliability issues
9. performance problems
10. UI/UX bugs

Fix confirmed CRITICAL and HIGH issues first.

==================================================
36. NO FALSE POSITIVES
==================================================

For every finding:

1. reproduce
2. identify root cause
3. determine impact
4. fix
5. add regression test
6. retest
7. document result

Do not report speculative issues as confirmed vulnerabilities.

==================================================
37. FINAL FULL TEST
==================================================

After fixes run the complete test suite again:

- lint
- typecheck
- unit
- integration
- E2E
- authorization
- tenant isolation
- AI
- graph
- realtime
- database
- accessibility
- performance
- production build

Ensure fixes did not introduce regressions.

==================================================
38. CREATE FINAL AUDIT REPORT
==================================================

Create:

docs/ATLAS_FULL_BUG_AUDIT.md

Include:

# Executive Summary

# Architecture Tested

# Test Environment

# Test Coverage

# Critical Findings

# High Findings

# Medium Findings

# Low Findings

# Business Logic Findings

# Authentication Findings

# Authorization Findings

# Tenant Isolation Findings

# API Findings

# Database Findings

# AI/RAG Findings

# Graph Findings

# Evidence Findings

# Workflow Findings

# Realtime Findings

# 3D Findings

# Performance Findings

# Accessibility Findings

# Dependency Findings

# Fixed Bugs

# Regression Tests Added

# Remaining Issues

# Risk Assessment

# Final Verification

For every finding include:

- ID
- severity
- component
- description
- impact
- root cause
- reproduction summary
- fix
- regression test
- verification status

==================================================
39. FINAL QUALITY GATE
==================================================

ATLAS must NOT be declared clean if:

- authentication bypass exists
- authorization bypass exists
- tenant isolation failure exists
- sensitive data exposure exists
- critical business logic bug exists
- production secrets are exposed
- critical tests fail
- production build fails

If something cannot be fixed safely, document it clearly as an unresolved issue.

==================================================
40. FINAL OUTPUT
==================================================

At completion print:

==================================================
        ATLAS FULL PLATFORM AUDIT COMPLETE
==================================================

Repository: ATLAS
Audit Type: Full QA + Security + Business Logic + Reliability

Build:              PASS/FAIL
Typecheck:          PASS/FAIL
Lint:               PASS/FAIL
Unit Tests:         PASS/FAIL
Integration:        PASS/FAIL
E2E:                PASS/FAIL
Security:           PASS/FAIL
Authorization:      PASS/FAIL
Tenant Isolation:   PASS/FAIL
AI/RAG:             PASS/FAIL
Graph:              PASS/FAIL
Realtime:           PASS/FAIL
Database:           PASS/FAIL
3D:                 PASS/FAIL
Performance:        PASS/FAIL
Accessibility:      PASS/FAIL

CRITICAL: X
HIGH:     X
MEDIUM:   X
LOW:      X
INFO:     X

Fixed: X
Regression Tests: X
Remaining Issues: X

Final Risk:
CRITICAL / HIGH / MEDIUM / LOW

==================================================

IMPORTANT:
Do not stop after finding the first bug.
Do not only test the frontend.
Do not only run existing tests.
Audit the complete ATLAS platform and verify the fixes.
==================================================