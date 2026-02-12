# Archive search Draft/Review redirect analysis and guard hardening

## Date
- 12-02-2026 14:08

## What changed
- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.ts`:
  - Added a project cache (`projectCacheRef`) to retain last-seen project metadata across route/data-map transitions.
  - Route guard now resolves target project from either current map or cache.
  - This prevents loss of Draft/Review classification when selected project temporarily drops from the immediate project map during archive/search -> project route transition.

- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.test.tsx`:
  - Added regression test ensuring archive-origin Draft route still redirects back to `/archive` when the current projects map is empty at interception time, using cached project metadata.

- Added user-requested root analysis doc:
  - `/Users/nick/Designagency/DRAFT_REVIEW_ARCHIVE_REDIRECT_PROBLEM.md`

## Validation
- `npx vitest run src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.test.tsx src/app/dashboard/hooks/useDashboardDataLayer.test.tsx` ✅
- `npx eslint src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.ts src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.test.tsx` ✅
