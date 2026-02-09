# Tasks Page: Project Dropdown UI Alignment + Creation Stability

**Date:** 2026-02-09 20:30
**Type:** UI Consistency / Bug Fix

## Summary

Fixed task creation instability on the Tasks page and replaced the project selector UI with the same interaction pattern used by the Due Date column (inline trigger + popover menu), removing the mismatched native select style.

## Changes

### `src/app/components/ProjectTasks.tsx`
- Added project dropdown state:
  - `openProjectTaskId`
  - `isNewTaskProjectOpen`
- Updated global dropdown backdrop logic so project popovers close consistently with existing calendar/assignee popovers.
- Replaced **add-row project `<select>`** with due-date-style inline trigger + animated popover menu.
  - Supports explicit `No project` display in the add row.
- Replaced **per-row project `<select>`** with due-date-style inline trigger + animated popover menu (`Move to project`).
- Fixed creation fallback:
  - New task creation no longer fails when no project is explicitly selected.
  - Resolves target project as: selected project -> default project -> first active project option.

## Validation

- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run test:frontend` ✅
