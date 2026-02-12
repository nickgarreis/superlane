# Tasks page mutable-only sync fix

**Date:** 12-02-2026 12:09

## What changed

### Backend
- Added new paginated query in `/Users/nick/Designagency/convex/tasks.ts`:
  - `tasks.listMutableForWorkspace({ workspaceSlug, paginationOpts })`
- Behavior:
  - Includes unassigned tasks (`projectPublicId == null`).
  - Includes project-linked tasks only when the project satisfies `projectAllowsTaskMutations(...)`.
  - Excludes tasks linked to archived/completed/draft/review projects.
- Implementation details:
  - Uses `paginateWorkspaceTasksWithFilter(...)` to avoid first-page starvation when early rows are filtered out.
  - Reuses existing `projectAllowsTaskMutations` lifecycle predicate.
- Kept `tasks.listForWorkspace` unchanged for compatibility.

### Frontend
- Switched workspace Tasks page feed in `/Users/nick/Designagency/src/app/dashboard/useDashboardData.ts`:
  - from `api.tasks.listForWorkspace`
  - to `api.tasks.listMutableForWorkspace`
- Updated `/Users/nick/Designagency/src/app/components/Tasks.tsx`:
  - Added `mutableWorkspaceTasks` filtering so inactive-project tasks are hidden at component level as well.
  - Removed project-id normalization that force-cleared non-active project IDs.
  - Workspace update payload now preserves `projectId` values instead of detaching tasks.
- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardProjectActions.ts`:
  - Task update toast now includes backend error message when present:
    - `Failed to update tasks: <error>`

### Tests
- Added backend coverage:
  - `/Users/nick/Designagency/convex/__tests__/tasks_list_mutable_for_workspace.test.ts`
  - Verifies mutable-only filtering and pagination across filtered-out rows.
- Updated Tasks page tests:
  - `/Users/nick/Designagency/src/app/components/Tasks.test.tsx`
  - Verifies inactive-project tasks are hidden and updates preserve `projectId`.
- Added workspace sync hook tests:
  - `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardTaskSync.test.tsx`
  - Verifies applyDiff payloads and reorder behavior for visible-task edits/add/remove flows.
- Updated project actions hook tests:
  - `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardProjectActions.test.tsx`
  - Verifies backend task-sync error details are surfaced in toast.

## Validation
- `npx vitest run convex/__tests__/tasks_list_mutable_for_workspace.test.ts src/app/components/Tasks.test.tsx src/app/dashboard/hooks/useDashboardProjectActions.test.tsx src/app/dashboard/hooks/useDashboardTaskSync.test.tsx` ✅
- `npm run lint` ✅
- `npm run typecheck:backend` ✅
- `npm run typecheck` ⚠️ fails in pre-existing frontend file:
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/TaskActivityRow.tsx:86`
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/TaskActivityRow.tsx:87`
  - Error: `number | null` passed where `number` is required.
