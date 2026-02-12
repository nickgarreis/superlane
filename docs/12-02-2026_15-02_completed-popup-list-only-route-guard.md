# Completed route guard opens list popup only

## Date
- 12-02-2026 15:02

## Goal
- Adjust completed-project route interception so it opens the **Completed Projects list popup** (not completed-detail popup).

## What changed
- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.ts`:
  - Replaced completed interception callback from `openCompletedProjectDetail(projectId)` to `openCompletedProjectsPopup()`.
  - Kept all previously-added completed interception rules intact:
    - origin-preserving redirect for normal `/project/<completed-id>` entries,
    - next-eligible-active redirect for same-route Active -> Completed transitions,
    - `/tasks` fallback when no eligible active project exists.

- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardActionLayer.ts`:
  - Wired the guard to `navigation.openCompletedProjectsPopup` instead of `navigation.openCompletedProjectDetail`.

- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.test.tsx`:
  - Renamed callback mocks/expectations to assert list-popup opening (`openCompletedProjectsPopup`) rather than detail-popup opening with ID arguments.
  - Preserved completed redirect behavior coverage.

## Validation
- `npx vitest run src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.test.tsx` ✅
- `npx eslint src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.ts src/app/dashboard/hooks/useDashboardActionLayer.ts src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.test.tsx` ✅
- `npm run test:frontend` ✅ (`66` files, `242` tests passed)
