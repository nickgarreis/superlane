# Tasks Page: Active Project Assignment Column

**Date:** 2026-02-09 20:20
**Type:** UI / Task Assignment Fix

## Summary

Updated the Tasks page so tasks can be explicitly assigned to **Active** projects via a dedicated Project column. This removes the implicit "first project" fallback behavior that caused confusion about where new tasks were stored.

## Changes

### `src/app/components/Tasks.tsx`
- Scoped Tasks-page task list to active, non-archived projects (`status.label === "Active"`).
- Added active-project-aware filtering and cleanup of stale filter selections.
- Reworked `handleUpdateTasks` to:
  - persist task updates per project,
  - support moving tasks between active projects,
  - remove deleted tasks from their project,
  - update only changed projects.
- Disabled "Add Task" when no active projects exist.
- Passed project assignment metadata into `ProjectTasks` (`showProjectColumn`, `projectOptions`, `defaultProjectId`).

### `src/app/components/ProjectTasks.tsx`
- Added optional project assignment props:
  - `showProjectColumn`
  - `projectOptions`
  - `defaultProjectId`
- Added a visible **Project** column layout when enabled.
- Added per-row project selector for reassigning tasks.
- Added project selector in the add-task row for new tasks.
- Prevented task creation in project-column mode when no active project is available.
- Added empty-state message for missing active projects.

### `src/app/types.ts`
- Extended `Task` with optional `projectId` for Tasks-page cross-project editing.

## Validation

- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run test:frontend` ✅
- `npm run build` ✅
