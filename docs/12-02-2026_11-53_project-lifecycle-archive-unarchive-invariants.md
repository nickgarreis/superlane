# Project lifecycle archive/unarchive invariants

**Date:** 12-02-2026 11:53

## What changed

### Backend lifecycle enforcement (`convex/projects.ts`)
- Hardened `projects.archive` with strict invariants:
  - Rejects when project is already archived: `ConvexError("Project is already archived")`.
  - Rejects when project status is not `Active`: `ConvexError("Only active projects can be archived")`.
- Hardened `projects.unarchive` with strict invariants:
  - Rejects when project is not archived: `ConvexError("Project is not archived")`.
  - Always restores to `Active` (no `previousStatus` restore fallback).
  - Clears lifecycle/archive state on restore:
    - `archived: false`
    - `archivedAt: null`
    - `previousStatus: null`
    - `completedAt: null`
  - Tracks actor fields for restore/status update:
    - `statusUpdatedByUserId`
    - `unarchivedByUserId`
- Added owner-only maintenance mutation:
  - `projects.normalizeUnarchivedDraftReviewToActive`
  - Args: `{ workspaceSlug, dryRun? }`
  - Targets only rows with:
    - `deletedAt == null`
    - `archived === false`
    - `unarchivedByUserId` present
    - `status` in `Draft|Review`
  - `dryRun: true` reports candidates only.
  - Apply mode normalizes candidate status to `Active` and clears `previousStatus` + `completedAt`.
  - Returns summary: `{ scanned, eligible, updated, projectPublicIds }`.

### Seed data alignment (`convex/devSeedBlueprints.ts`)
- Removed impossible archived+completed lifecycle seed state:
  - `completed-mobile-kit` now seeds as `status: "Active"`, `previousStatus: null`, `archived: true`.
- Keeps archived project coverage while conforming to lifecycle rules.

### Regression tests
- Added focused lifecycle test suite:
  - `convex/__tests__/projects_lifecycle_invariants.test.ts`
  - Covers:
    - Unarchive always restores to `Active` and clears `completedAt`.
    - Archive rejects `Draft`, `Review`, `Completed`; allows `Active`.
    - Archive rejects already archived rows.
    - Unarchive rejects non-archived rows.
    - Cleanup mutation `dryRun` and apply behavior.
    - Cleanup mutation owner-only access guard.
- Updated existing RBAC lifecycle test:
  - `convex/__tests__/rbac.test.ts`
  - Asserts project is `Active` immediately after unarchive and `completedAt` is null before subsequent completion transition.

## Why
- Prevent archived projects from re-entering review/draft popup flows after restore.
- Enforce a deterministic lifecycle contract:
  - Archive only from `Active`.
  - Unarchive always to `Active`.
- Provide a safe one-time remediation path for historical bad rows.

## Validation
- `npm run typecheck` ✅
- `npx vitest run convex/__tests__/projects_lifecycle_invariants.test.ts convex/__tests__/rbac.test.ts` ✅
- `npm run test:backend` ✅

## Cleanup invocation notes (post-deploy)
1. Preview candidates per workspace:
   - `api.projects.normalizeUnarchivedDraftReviewToActive({ workspaceSlug: "<slug>", dryRun: true })`
2. Review `projectPublicIds` in response.
3. Apply normalization:
   - `api.projects.normalizeUnarchivedDraftReviewToActive({ workspaceSlug: "<slug>" })`
4. Confirm restored projects now appear as `Active` in non-archive surfaces.
