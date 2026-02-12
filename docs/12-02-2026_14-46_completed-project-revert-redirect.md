# Completed project revert redirect to active detail

## Date
- 12-02-2026 14:46

## Goal
- When reverting a project from `Completed` to `Active` inside the completed-project detail popup, route the user to that project's active detail page instead of falling back to the completed-projects list popup.

## Changes made
- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardProjectActions.ts`:
  - Added completed-popup context inputs (`isCompletedProjectsOpen`, `completedProjectDetailId`, `closeCompletedProjectsPopup`).
  - In `handleUpdateProjectStatus`, added a targeted success path for:
    - status change to `Active`,
    - currently open completed-project detail popup,
    - matching project id,
    - project currently in completed/non-archived state.
  - On this path, the popup is closed and navigation moves to `project:{id}`.
- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardActionLayer.ts`:
  - Wired navigation state fields into `useDashboardProjectActions` so the hook can detect popup-detail revert context.
- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardProjectActions.test.tsx`:
  - Added regression test: reverting from completed detail popup closes popup and navigates to `project:project-1`.

## Validation
- `npx vitest run src/app/dashboard/hooks/useDashboardProjectActions.test.tsx src/app/dashboard/hooks/useDashboardActionLayer.test.tsx` ✅
- `npx eslint src/app/dashboard/hooks/useDashboardProjectActions.ts src/app/dashboard/hooks/useDashboardActionLayer.ts src/app/dashboard/hooks/useDashboardProjectActions.test.tsx` ✅
