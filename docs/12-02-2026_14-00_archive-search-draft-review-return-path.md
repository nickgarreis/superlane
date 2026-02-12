# Preserve origin page when opening Draft/Review popup from search

## Date
- 12-02-2026 14:00

## Problem
- From `/archive`, selecting a Draft/Review project in Search opened the correct popup but redirected to `/tasks`.
- Expected behavior: stay on the origin page (`/archive`) while showing popup-only Draft/Review flow.

## What changed
- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.ts`:
  - Added `lastNonProjectPathRef` to remember the most recent non-`/project/*` route.
  - For Draft/Review `project:{id}` routes, popup still opens as before.
  - Redirect target now uses remembered origin path (for example `/archive`) instead of hardcoded `/tasks`.
  - Keeps `/tasks` as fallback for direct `/project/:id` entry with no prior non-project route in-session.

## Tests updated
- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.test.tsx`:
  - Added regression test: start on `/archive`, move to `/project/draft-1`, and verify redirect goes back to `/archive` while opening draft popup.

## Validation
- `npx vitest run src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.test.tsx` ✅
- `npx vitest run src/app/dashboard/useDashboardOrchestration.test.tsx` ✅
- `npx eslint src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.ts src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.test.tsx` ✅
