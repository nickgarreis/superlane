# Tasks Page: Unassigned Project Support

**Date:** 2026-02-09 20:37
**Type:** Tasks Data Model / UX Behavior Fix

## Summary

Implemented persistent "No project" support for tasks created/edited on the Tasks page.

This fixes automatic project assignment on task creation and keeps Project Detail behavior unchanged:
- Tasks page: project can remain empty (like due date).
- Project detail page: tasks remain implicitly tied to that project.

## Backend Changes

### `convex/schema.ts`
- Updated task linkage fields to allow unassigned tasks:
  - `projectId: v.union(v.id("projects"), v.null())`
  - `projectPublicId: v.union(v.string(), v.null())`

### `convex/lib/validators.ts`
- Added `workspaceTaskInputValidator` with optional nullable `projectPublicId` for workspace-level task replacement.

### `convex/tasks.ts`
- Added `replaceForWorkspace` mutation:
  - Replaces all tasks in a workspace from Tasks page payload.
  - Persists `projectId/projectPublicId` as `null` when task has no project.
  - Validates assigned project IDs against active projects in the workspace.
- Existing `replaceForProject` logic remains unchanged for project detail usage.

### `convex/lib/rbac.ts`
- Added RBAC entry for `tasks.replaceForWorkspace` (`member` minimum role).

### `convex/dashboard.ts`
- Updated task visibility logic to include unassigned tasks:
  - includes rows with `projectId == null`
  - still includes project-linked rows only when project is active

## Frontend Changes

### `src/app/lib/mappers.ts`
- Updated snapshot task type to allow nullable `projectPublicId`.
- Updated `mapProjectsToUi` to skip unassigned tasks when building per-project task lists.
- Added `mapWorkspaceTasksToUi` for Tasks page flat list (with optional `projectId`).

### `src/app/DashboardApp.tsx`
- Added `replaceWorkspaceTasksMutation` hook and `handleReplaceWorkspaceTasks` callback.
- Tasks page now uses workspace-level task updates (`replaceForWorkspace`) instead of per-project replacement.
- Project detail pages still use `replaceForProject` via `handleUpdateProject`.

### `src/app/components/Tasks.tsx`
- Switched data source to flat `workspaceTasks` prop.
- Reworked update merge logic to preserve hidden rows and persist unassigned tasks.
- Kept project filters scoped to active project IDs.
- Tasks page now passes `defaultProjectId={null}` to prevent auto-assignment.

### `src/app/components/ProjectTasks.tsx`
- In project-column mode, task creation no longer forces a project.
- Added explicit "No project" option in the row project popover.
- Project popovers keep the same interaction style as due-date popovers.

## Validation

- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run test:frontend` ✅
- `npm run build` ✅
