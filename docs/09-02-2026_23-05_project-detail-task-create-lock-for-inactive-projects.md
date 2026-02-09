# Project Detail: Lock Task Creation For Inactive Projects

**Date:** 09-02-2026 23:05

## Summary

Disabled task creation from the Project Detail task table when the project is not active.

When a project is archived or completed:
- `+ Add Task` is visually dimmed (reduced opacity).
- Hovering over the button shows: `Tasks can only be created for active projects`.
- Clicking `+ Add Task` does nothing.
- If the task creation row is already open, it is automatically closed and discarded.

## Changes

### `/Users/nick/Designagency/src/app/components/ProjectTasks.tsx`
- Added optional props:
  - `canAddTasks?: boolean`
  - `addTaskDisabledMessage?: string`
- Updated header `+ Add Task` button to support locked mode:
  - reduced opacity + `cursor-not-allowed`
  - tooltip via `title`
  - click guarded when locked
- Added effect to cancel an open add-task row if `canAddTasks` becomes false.

### `/Users/nick/Designagency/src/app/components/MainContent.tsx`
- Added `canCreateProjectTasks` derived state:
  - `!project.archived && project.status.label === "Active" && !project.completedAt`
- Passed task-creation lock props to `ProjectTasks`:
  - `canAddTasks={canCreateProjectTasks}`
  - `addTaskDisabledMessage="Tasks can only be created for active projects"`

## Validation

- `npx eslint src/app/components/ProjectTasks.tsx src/app/components/MainContent.tsx` ✅
