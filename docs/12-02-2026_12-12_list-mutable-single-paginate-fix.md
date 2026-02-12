# Fix listMutableForWorkspace Convex multi-paginate runtime error

**Date:** 12-02-2026 12:12

## Problem
- Runtime error in `tasks.listMutableForWorkspace`:
  - `This query or mutation function ran multiple paginated queries. Convex only supports a single paginated query in each function.`
- Source was `paginateWorkspaceTasksWithFilter(...)` in `convex/lib/taskPagination.ts`, which loops and calls `.paginate(...)` multiple times per query invocation.

## What changed

### Backend query fix
- Updated `/Users/nick/Designagency/convex/tasks.ts`:
  - `listMutableForWorkspace` no longer uses `paginateWorkspaceTasksWithFilter`.
  - It now performs exactly one paginated query:
    - `query("tasks").withIndex("by_workspace_projectDeletedAt_position").paginate(args.paginationOpts)`
  - Applies mutable-project filtering on the returned page in-memory:
    - keep task if `projectPublicId == null`
    - or project is in `mutableProjectPublicIds` (derived via `projectAllowsTaskMutations`).
- Removed unused import of `paginateWorkspaceTasksWithFilter` from `convex/tasks.ts`.

### Test update
- Updated `/Users/nick/Designagency/convex/__tests__/tasks_list_mutable_for_workspace.test.ts`:
  - Reworked pagination assertion to iterate cursors and collect mutable task ids across pages.
  - Kept invariant checks that archived/completed/draft/review linked tasks are never returned.

## Validation
- `npx vitest run convex/__tests__/tasks_list_mutable_for_workspace.test.ts` ✅
- `npm run typecheck:backend` ✅

## Note
- This resolves the Convex runtime crash by enforcing single-`paginate()` per query function.
