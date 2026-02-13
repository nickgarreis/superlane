# Archived task-row disabled visuals

## Date
- 13-02-2026 13:02

## Goal
- Ensure archived project task rows clearly communicate read-only state by dimming the task title and checkbox in addition to existing due-date/assignee dimming.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/project-tasks/ProjectTaskRow.tsx`:
  - Added explicit state class variables for checkbox and task title based on `taskIsEditable` and `task.completed`.
  - Applied muted checkbox styles when editing is disabled, including completed tasks (no active accent color in read-only mode).
  - Applied muted title color for incomplete tasks when editing is disabled.
- Updated `/Users/nick/Designagency/src/app/components/ProjectTasks.test.tsx`:
  - Added a regression test that verifies non-editable rows dim both task titles and checkbox visuals (including completed-task checkbox styling).

## Validation
- `npx eslint src/app/components/project-tasks/ProjectTaskRow.tsx src/app/components/ProjectTasks.test.tsx` ✅
- `npm run test:frontend -- src/app/components/ProjectTasks.test.tsx` ✅
