# Production Remediation Plan

Date: 2026-02-09  
Scope: Move Build Design from "partially backend-enabled" to production-ready for security, multi-user collaboration, and operations.

## Current Reality

The app has real Convex + WorkOS integration for core auth and CRUD, but it is not production-ready yet because:

- Multiple critical surfaces are still mock/local-state driven (settings, members, profile, billing).
- File upload is metadata-only (no persisted binary storage pipeline).
- Role-based authorization is modeled but not consistently enforced server-side.
- Some core data contracts are string-formatted instead of normalized for querying/sorting.
- Operational readiness is incomplete (tests, CI gates, runbooks, observability).

## Prioritization Framework

- `P0` = launch blockers (security/data integrity and correctness)
- `P1` = required for complete backend capability and trustworthy collaboration UX
- `P2` = reliability and maintainability requirements for production ops
- `P3` = optimization and hardening (important, but not launch-blocking)

## Workstreams

### P0.1 Enforce RBAC at Mutation Boundaries (Launch Blocker)
Problem:
- Membership checks exist, but role checks are inconsistent on privileged operations.

Implementation:
- Define a role matrix for every mutation/action (`owner`, `admin`, `member`).
- Add shared helper(s) in backend auth layer, e.g. `requireWorkspaceRole(ctx, workspaceId, minimumRole)`.
- Apply to all sensitive endpoints:
  - workspace updates and future workspace deletion
  - project archive/unarchive/remove/update-status
  - membership management endpoints (to be added in P1)
- Add audit fields where relevant (`updatedByUserId`, `deletedByUserId`) for traceability.

Done when:
- Privileged actions are impossible for unauthorized roles.
- Role matrix is documented and covered by tests.

---

### P0.2 Implement Real File Storage Pipeline (Launch Blocker)
Problem:
- File objects currently persist only metadata and thumbnails; no file bytes are stored.

Implementation:
- Extend schema for file storage metadata (`storageId`, `mimeType`, `sizeBytes`, optional checksum).
- Implement upload lifecycle:
  - `generateUploadUrl` (or equivalent signed upload flow)
  - `finalizeUpload` mutation with validation
  - secure download URL resolution
  - deletion cleanup for storage object + DB row
- Migrate frontend upload flows to real byte upload before metadata commit.
- Enforce file constraints (size/type) server-side, not only UI-side.

Done when:
- Uploaded files can be downloaded across sessions/devices.
- Removing a file removes both metadata and stored object.

---

### P0.3 Security Baseline and Secret Hygiene (Launch Blocker)
Problem:
- Production hardening is not fully codified.

Implementation:
- Rotate all auth/webhook secrets and verify no secrets in git history or docs.
- Lock environment validation for all required runtime vars (dev/staging/prod).
- Validate WorkOS callback and action URLs for all environments.
- Keep strict return-to sanitization and callback safety checks already introduced.
- Add dependency policy:
  - apply available security upgrades (e.g., Vite patch line)
  - track no-fix transitive vulnerabilities with compensating controls and upgrade watch.

Done when:
- Secret rotation completed and documented.
- Security checklist passes in staging.

## P1 Required for Complete Backend Capability

### P1.1 Backendize Settings/Account/Company/Billing Flows
Problem:
- Settings UI is mostly local/mocked and not persisted to backend.

Implementation:
- Account API: profile read/update (name, avatar URL/upload ref, email display source of truth).
- Company API:
  - list members from backend
  - invite member flow
  - role change flow
  - remove member flow
- Notification preferences API + storage table.
- Billing panel:
  - if billing integration not ready, switch to explicit read-only "integration pending" state
  - avoid fake invoice/payment records.

Done when:
- All settings actions persist server-side and survive reload/device switch.

---

### P1.2 Replace Mock Identity/Members in Collaboration Surfaces
Problem:
- Task assignees and mention lists still use static mock users.

Implementation:
- Add query for workspace members and reuse it in:
  - task assignment UI
  - comment mention autocomplete
  - profile displays in sidebar and related components
- Remove hardcoded user/email fallbacks from persistent UI surfaces.

Done when:
- All member-facing UI reflects actual workspace membership.

---

### P1.3 Fix Creator Attribution and User Joins in Snapshot
Problem:
- Project creator display is derived from current viewer fallback, not creator record.

Implementation:
- Update dashboard/snapshot queries to include creator user info for each project.
- Update mappers to use backend creator payload rather than viewer fallback.

Done when:
- Multi-user workspaces show correct creator identity per project.

## P2 Reliability and Production Operations

### P2.1 Normalize Date/Time Contracts
Problem:
- Deadlines/due dates/display dates are primarily string-formatted.

Implementation:
- Store canonical timestamps (`number` epoch ms or ISO policy consistently).
- Keep display formatting strictly in UI layer.
- Add migration/backfill scripts for existing records.

Done when:
- Sorting/filtering/querying by date is deterministic and locale-independent.

---

### P2.2 Testing + CI Gates
Problem:
- No automated test suite currently gates production changes.

Implementation:
- Add test strategy:
  - backend unit/integration tests for auth, RBAC, and critical mutations
  - frontend behavior tests for protected routing and critical flows
- Add CI pipeline gates:
  - lint
  - typecheck
  - build
  - tests
  - dependency security checks

Done when:
- All merge paths require passing CI gates.

---

### P2.3 Observability + Webhook/Sync Resilience
Problem:
- Limited production telemetry and limited guardrails for sync drift.

Implementation:
- Structured logging conventions and error tagging.
- Error monitoring integration for frontend + backend.
- Webhook idempotency/event dedupe persistence.
- Scheduled org-membership reconciliation job and alerting for failures.

Done when:
- On-call can detect, diagnose, and recover from auth/sync failures quickly.

## P3 Optimization and Hardening

### P3.1 Performance and Bundle Health
Implementation:
- Split heavy UI modules (settings popup, create project, chat sidebar).
- Reduce large static asset footprint and optimize delivery.
- Add performance budget checks in CI.

Done when:
- Initial load and interaction metrics are within agreed thresholds.

---

### P3.2 Documentation and Runbooks
Implementation:
- Replace starter README with production setup/run/deploy docs.
- Add runbooks for incidents, secret rotation, rollback, and migrations.
- Document permission model and environment matrix.

Done when:
- New engineer can deploy and operate system from docs only.

## Suggested Sequence (Execution Order)

1. `P0.1` RBAC enforcement  
2. `P0.2` real file storage  
3. `P0.3` security baseline and secret hygiene  
4. `P1.1` settings backendization  
5. `P1.2` real member identity propagation  
6. `P1.3` creator attribution correctness  
7. `P2.1` date normalization  
8. `P2.2` tests and CI gates  
9. `P2.3` observability/webhook resilience  
10. `P3.x` performance + documentation hardening

## Production Readiness Exit Criteria

All must be true:

- No critical user-facing flows rely on mock/local-only state.
- File upload/download/delete is fully backed by real storage.
- RBAC is enforced server-side and covered by automated tests.
- Auth, redirects, and secret handling pass security checklist.
- CI gates block regressions (lint/typecheck/build/tests/security checks).
- Operational runbooks and environment docs are complete and current.
