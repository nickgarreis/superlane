# Completed project popup detail open fix

**Date:** 11-02-2026 22:39

## What changed
- Updated `/Users/nick/Designagency/src/app/dashboard/useDashboardData.ts`:
  - Stopped coupling `includeArchived` project query args to `completedProjectDetailId`.
  - `shouldIncludeArchivedProjects` now depends only on archive/search contexts.
  - This prevents a query reset when opening completed-project detail from the popup list.
- Updated `/Users/nick/Designagency/src/app/dashboard/useDashboardData.test.tsx`:
  - Added regression test `keeps project query args stable when opening completed project popup detail`.
  - Verifies project query args remain stable (`includeArchived: false`) when `completedProjectDetailId` transitions from `null` to a selected completed project id in tasks view.

## Why
- Clicking a completed project row in the popup set `completedProjectDetailId`, which previously changed project query args (`includeArchived` false -> true).
- That arg change could trigger first-page reload and temporarily drop `projectsById`, causing detail resolution to fail and the popup to bounce back to list mode.
- Keeping query args stable during popup detail open preserves the selected project and allows detail to open reliably.

## Validation
- `npm run test:frontend -- src/app/dashboard/useDashboardData.test.tsx` ✅
  - (This command runs the frontend test suite in this repo config; all tests passed.)
