# Task Table Bottom Borders Removed

**Date:** 11-02-2026 12:33

## Summary
Removed bottom border dividers from all shared task table surfaces so task rows and task headers render without bottom lines across dashboard task views.

## Changes
- Updated `/Users/nick/Designagency/src/app/components/project-tasks/ProjectTaskRow.tsx`:
  - Removed `border-b border-white/5` from the shared task row class list.
- Updated `/Users/nick/Designagency/src/app/components/project-tasks/AddTaskRow.tsx`:
  - Removed `border-b border-white/5` from the add-task row wrapper.
- Updated `/Users/nick/Designagency/src/app/components/project-tasks/ProjectTaskTableHeader.tsx`:
  - Removed `border-b border-white/5` from the task table header row.

## Validation
- Ran `npm run test:frontend -- src/app/components/ProjectTasks.test.tsx`.
- Result: pass (frontend suite executed and all tests passed).
