# Targeted Regression Fixes

**Date:** 11-02-2026 00:04

## Summary
Implemented the requested backend and frontend hardening/performance fixes across dashboard hydration, paginated query correctness, task mutation normalization, backfill query scope, task creation concurrency, virtualization measurement, and dashboard data loading pagination behavior.

## Changes

### `convex/dashboard.ts`
- Hardened creator hydration in `hydrateProjectCreators` so invalid/bad IDs cannot crash the batch:
  - Wrapped `ctx.db.get(creatorUserId)` in guard + `try/catch` and return `null` on invalid lookup.
- Simplified `creatorRowById` creation by removing redundant `.map((entry) => entry)` after filter.

### `convex/files.ts`
- Reworked `listForWorkspace` pagination flow to avoid page shrink from post-pagination filtering:
  - Added `paginateProjectFilesWithFilter` over-fetch loop that keeps requesting from `paginate` until enough valid rows are accumulated or source is exhausted.
  - Added server-side `deletedAt` filtering in the query path for `projectPublicId` branch using indexed query.
  - Ensured `activeProjectIds` / `projectId` / `storageId` constraints are applied during paginated page assembly before final mapping.
  - Kept `mapProjectFile` as the final mapping step.

### `convex/lib/dashboardContext.ts`
- Added null guard in `listWorkspaceMembers` for `args.appUser`.
- Function now returns `[]` when `activeWorkspace` or `appUser` is missing, preventing `appUser._id` access crashes.

### `convex/lib/taskMutations.ts`
- Normalized/validated `task.completed` in both insert paths:
  - `replaceProjectTasks`
  - `replaceWorkspaceTasksLegacy`
- Enforced `typeof task.completed === "boolean"`; throws a clear `ConvexError` when invalid.

### `convex/performanceBackfills.ts`
- Removed global `commentReactions` collection scan.
- Replaced with comment-scoped reaction fetches using `by_commentId` across workspace comments to keep reaction processing scoped to relevant workspace data.

### `convex/projects.ts`
- Fixed cursor pagination correctness by removing post-pagination sort/filter behavior.
- `listForWorkspace` now:
  - filters `deletedAt` in indexed query before pagination,
  - returns rows in index-backed descending update order,
  - avoids client-side re-sort of `paginated.page`.

### `convex/tasks.ts` + `convex/lib/taskPagination.ts`
- Fixed workspace task page shrink by applying active-project filtering during paginated page assembly (not after final page).
- Fixed concurrent create position race:
  - added optional `position` arg support,
  - added `reserveTaskPosition` helper to reserve next position via workspace counter update,
  - removed `lastTask + 1` race-prone derivation.

### `convex/schema.ts`
- Added `workspaces.nextTaskPosition` (optional number) for atomic-like position reservation flow.
- Added composite indexes used for pre-pagination filtering/sorting in `projects`.
- Added composite index for workspace+projectPublicId+deletedAt+displayDate on `projectFiles`.

### `src/app/components/chat-sidebar/ChatSidebarPanel.tsx`
- Added required `data-index={virtualItem.index}` to the same element that receives `measureElement` ref for unresolved virtualized comments.

### `src/app/dashboard/useDashboardData.ts`
- Replaced hardcoded bulk `numItems: 5000` loading with cursor-based paginated loading:
  - switched to `usePaginatedQuery` for projects, tasks, and files,
  - set sensible page size constant (`100`),
  - added continuation effects that call `loadMore` while status is `CanLoadMore`.

### `src/app/dashboard/useDashboardData.test.tsx`
- Updated mocks/tests to account for `usePaginatedQuery` and new query call patterns.

## Validation
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run test:backend` ✅
- `npm run test:frontend` ✅
