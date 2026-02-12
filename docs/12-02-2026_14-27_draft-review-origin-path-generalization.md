# Generalize Draft/Review redirect origin to all routes

## Date
- 12-02-2026 14:27

## Goal
Ensure Draft/Review popup-only interception returns users to the immediate originating route everywhere (including active project detail pages), not just non-project pages like `/archive`.

## What changed
- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.ts`:
  - Replaced non-project-only origin tracking with previous-path tracking (`previousPathRef` + `lastOriginPathRef`).
  - Redirect target for Draft/Review routes now uses the last route visited immediately before `/project/<draft-or-review-id>`.
  - Preserved `/tasks` as fallback for direct deep-links where no prior route exists.
  - Kept existing project cache and duplicate-path guard behavior unchanged.

- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.test.tsx`:
  - Added regression: `/project/active-1` -> `/project/draft-1` redirects back to `/project/active-1`.
  - Added regression: `/project/active-1` -> `/project/review-1` redirects back to `/project/active-1`.
  - Existing archive-origin and direct deep-link tests remain and still pass.

## Validation
- `npx vitest run src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.test.tsx src/app/dashboard/hooks/useDashboardLifecycleEffects.test.tsx` ✅
- `npx eslint src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.ts src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.test.tsx` ✅
