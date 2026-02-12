# Completed projects popup-only routing

## Date
- 12-02-2026 14:58

## Goal
- Apply the same popup-only route interception used by Draft/Review projects to Completed projects.
- Keep Completed projects out of dedicated main detail routes.
- On same-route status flip to Completed, open the Completed popup and move background route to the next eligible active project (fallback `/tasks`).

## What changed
- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.ts`:
  - Extended route interception from Draft/Review to Draft/Review/Completed.
  - Added completed popup callback input (`openCompletedProjectDetail`).
  - Added ordered project ID input for deterministic next-active resolution.
  - Added same-route status transition detection to distinguish:
    - normal completed route entry (return to origin path),
    - current-route active -> completed transition (go to next eligible active project, fallback `/tasks`).
  - Preserved cache-based project resolution and duplicate-path guard behavior.

- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardActionLayer.ts`:
  - Wired `openCompletedProjectDetail` and ordered IDs (`visibleProjectIds`) into the route guard.

- Updated `/Users/nick/Designagency/src/app/dashboard/useDashboardController.ts`:
  - Excluded `Completed` from embeddable `project:*` main content routing.
  - Excluded `Completed` from fallback first-project selection.

- Updated `/Users/nick/Designagency/src/app/components/search-popup/useSearchIndex.ts`:
  - Filtered Completed-linked task and file search entries (project entries remain searchable/clickable).
  - Updated first active project fallback selection to exclude Completed.

- Updated tests:
  - `/Users/nick/Designagency/src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.test.tsx`
    - Added completed-route interception coverage (deep-link/origin-preserving paths).
    - Added same-route active -> completed transition coverage with next-active and `/tasks` fallback.
  - `/Users/nick/Designagency/src/app/dashboard/useDashboardController.test.tsx`
    - Added completed route exclusion assertions.
    - Updated fallback assertions to ensure Completed is not treated as dedicated main content.
  - `/Users/nick/Designagency/src/app/components/search-popup/useSearchPopupData.test.tsx`
    - Added completed project/task/file fixtures.
    - Added assertions that completed project hits remain while completed task/file hits are filtered.

## Validation
- `npx vitest run src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.test.tsx` ✅
- `npx vitest run src/app/dashboard/useDashboardController.test.tsx` ✅
- `npx vitest run src/app/components/search-popup/useSearchPopupData.test.tsx` ✅
- `npm run test:frontend` ✅ (`66` files, `242` tests passed)
- `npx eslint src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.ts src/app/dashboard/hooks/useDashboardActionLayer.ts src/app/dashboard/useDashboardController.ts src/app/components/search-popup/useSearchIndex.ts src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.test.tsx src/app/dashboard/useDashboardController.test.tsx src/app/components/search-popup/useSearchPopupData.test.tsx` ✅
