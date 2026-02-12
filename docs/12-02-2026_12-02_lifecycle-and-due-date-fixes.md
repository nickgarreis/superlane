# Lifecycle and due-date fixes

**Date:** 12-02-2026 12:02

## What changed
- Updated `convex/__tests__/projects_lifecycle_invariants.test.ts`:
  - Normalized seeded `unarchivedByUserId` to explicit null fallback:
    - `unarchivedByUserId: args.unarchivedByUserId ?? null`
  - Made cleanup mutation assertions order-independent by comparing Sets instead of arrays for:
    - `preview.projectPublicIds`
    - `applied.projectPublicIds`
- Updated `src/app/components/activities-page/rows/TaskActivityRow.tsx`:
  - Removed unreachable null-guard branch in `getDueDateShiftSummary` after exhaustive prior null checks.
  - Normalized due-date shift comparison to local start-of-day before day-delta math to avoid off-by-one issues from time-of-day differences.
- Updated `convex/schema.ts` for compatibility with explicit null normalization in tests:
  - `unarchivedByUserId` now accepts nullable user IDs:
    - `v.optional(v.union(v.id("users"), v.null()))`

## Why
- Ensures lifecycle test data uses deterministic null semantics instead of undefined.
- Removes ordering flakiness in invariant tests.
- Aligns due-date day-shift calculations with date-normalized urgency logic.
- Prevents validator failures when tests intentionally seed nullable `unarchivedByUserId`.

## Validation
- `npx vitest run convex/__tests__/projects_lifecycle_invariants.test.ts` ✅
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx` ✅
