# Completed comments empty-state text style alignment

## Date
- 13-02-2026 13:12

## Goal
- Match completed-project comments empty-state message typography to the tasks-table empty-state notification style.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/main-content/CompletedProjectCommentsHistory.tsx`:
  - Changed the empty-state message class from `txt-role-body-md text-text-muted-medium` to `txt-role-body-md text-white/20 italic`.
  - This now matches the tasks-table notification style used in `/Users/nick/Designagency/src/app/components/project-tasks/ProjectTaskRows.tsx` for "No tasks yet. Click \"Add Task\" to create one.".

## Validation
- `npm run test:frontend -- src/app/components/main-content/CompletedProjectCommentsHistory.test.tsx` ✅
