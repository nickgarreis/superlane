# Archive redirect fix (project -> archive)

**Date:** 12-02-2026 11:58

## What changed
- Updated `src/app/dashboard/hooks/useDashboardProjectActions.ts` to prevent archive navigation races when archiving from a project route:
  - Capture `sourceView` and detect archive actions triggered from `project:{id}`.
  - Pre-navigate to `archive` immediately in that case so the user leaves the soon-to-be-invalid `/project/:id` route before reactive data refresh.
  - Keep existing post-success navigation for non-project origins.
  - On archive failure after pre-navigation, return to the source project route and clear highlighted archive row state.
- Added focused coverage in `src/app/dashboard/hooks/useDashboardProjectActions.test.tsx`:
  - Verifies immediate navigation/highlight when archiving from a project route.
  - Verifies rollback to `project:{id}` and highlight reset on archive failure.

## Why
- Archiving from a project detail route can race with reactive project list updates. When the archived project disappears from active-route data before archive navigation settles, route guards can push the user to `/tasks`.
- Pre-navigation to `/archive` removes that race and preserves intended UX.

## Validation
- `npm run test:frontend -- src/app/dashboard/hooks/useDashboardProjectActions.test.tsx` ✅
