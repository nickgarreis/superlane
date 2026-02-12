# Completed popup revert redirect to active detail

## Date
- 12-02-2026 14:46

## Goal
When reverting a project from Completed to Active inside the completed-project detail popup, close the completed-project popup and redirect to that project's active detail route.

## What changed
- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardProjectActions.ts`:
  - Added completed-popup context inputs (`isCompletedProjectsOpen`, `completedProjectDetailId`, `closeCompletedProjectsPopup`).
  - Enhanced `handleUpdateProjectStatus` to detect the specific flow:
    - status change `Completed -> Active`
    - completed-project popup is open
    - selected completed detail ID matches target project ID
  - On successful mutation in that flow, the handler now:
    1. closes the completed projects popup
    2. navigates to `project:{id}`
  - Existing Completed success toast behavior remains unchanged.

- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardActionLayer.ts`:
  - Wired the new navigation context values from `useDashboardNavigation` into `useDashboardProjectActions`.

- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardProjectActions.test.tsx`:
  - Added regression test proving revert-from-completed-detail-popup closes the popup and navigates to `project:project-1`.

## Validation
- `npx vitest run src/app/dashboard/hooks/useDashboardProjectActions.test.tsx src/app/dashboard/hooks/useDashboardActionLayer.test.tsx` ✅ (`useDashboardProjectActions` suite passed)
- `npx eslint src/app/dashboard/hooks/useDashboardProjectActions.ts src/app/dashboard/hooks/useDashboardActionLayer.ts src/app/dashboard/hooks/useDashboardProjectActions.test.tsx` ✅
- `npm run typecheck` ✅
- `npx vitest run src/app/components/CompletedProjectsPopup.test.tsx` ✅
