# Completed comments headline style alignment

## Date
- 13-02-2026 13:13

## Goal
- Match the "Comments history" headline style to the exact style used by the "Tasks" headline.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/main-content/CompletedProjectCommentsHistory.tsx`:
  - Changed the heading class from `txt-role-page-title txt-tone-primary` to `tracking-tight txt-role-page-title txt-tone-primary`.
  - This now matches the class style used by the "Tasks" page headline in `/Users/nick/Designagency/src/app/components/tasks-page/TasksView.tsx`.

## Validation
- `npm run test:frontend -- src/app/components/main-content/CompletedProjectCommentsHistory.test.tsx` ✅
