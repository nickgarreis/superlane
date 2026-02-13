# Tasks page active-project-only visibility

## Date
- 13-02-2026 13:07

## Goal
- Ensure the Tasks page only shows tasks that belong to active, non-archived projects.

## What changed
- Updated `/Users/nick/Designagency/convex/tasks.ts`:
  - `listMutableForWorkspace` now filters paginated rows to only tasks with a non-null `projectPublicId` that belongs to a mutable (active) project.
  - Unassigned tasks are no longer returned by this query.

- Updated `/Users/nick/Designagency/src/app/components/Tasks.tsx`:
  - Tightened `mutableWorkspaceTasks` filtering to require a valid active `projectId`.
  - Tasks without a project are no longer included in Tasks-page visible rows.

- Updated `/Users/nick/Designagency/src/app/components/tasks-page/TasksView.tsx`:
  - Passed active project options into `ProjectTasks`.
  - Set `defaultProjectId` to the first active project so new Tasks-page task creation is tied to an active project by default.

- Updated `/Users/nick/Designagency/convex/__tests__/tasks_list_mutable_for_workspace.test.ts`:
  - Adjusted expected results to assert only active-project tasks are returned.
  - Kept unassigned/inactive fixtures and now verify they are excluded.

- Updated `/Users/nick/Designagency/src/app/components/Tasks.test.tsx`:
  - Updated expectations so unassigned tasks are not rendered on the Tasks page.
  - Added assertion that active-project options/default assignment are passed into `ProjectTasks`.

## Validation
- `npx vitest run convex/__tests__/tasks_list_mutable_for_workspace.test.ts src/app/components/Tasks.test.tsx` ✅
- `npx eslint convex/tasks.ts convex/__tests__/tasks_list_mutable_for_workspace.test.ts src/app/components/Tasks.tsx src/app/components/Tasks.test.tsx src/app/components/tasks-page/TasksView.tsx` ✅
