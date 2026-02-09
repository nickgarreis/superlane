# Tasks Page: Default Empty Project Selection

**Date:** 2026-02-09 20:26
**Type:** UX Adjustment

## Summary

Updated the Tasks page task-assignment flow so the project selection defaults to empty instead of auto-selecting the first active project.

## Changes

### `src/app/components/ProjectTasks.tsx`
- Changed add-row project selector initialization to default to empty unless an explicit default project is provided.
- Removed automatic fallback to first active project when creating a task in project-column mode.
- Added reset behavior after task creation to return project selector to the default (empty in Tasks page mode).
- Added a "Select project" placeholder option when active projects exist.

### `src/app/components/Tasks.tsx`
- Removed first-active-project fallback from `defaultProjectId` resolution.
- Removed first-active-project fallback from task update routing for tasks without an explicit project ID.

## Validation

- `npm run typecheck` ✅
- `npm run lint` ✅
