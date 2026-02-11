# Cleanup Pagination and Scroll Guards

**Date:** 11-02-2026 10:01

## Summary
Implemented five requested fixes across Convex and React to prevent full-table memory loads, avoid task position collisions, guard duplicate infinite-scroll requests, and stabilize a dashboard query callback.

## Changes
- `convex/files.ts`
  - Updated `runLegacyMetadataCleanup` to stop using `ctx.db.query("projectFiles").collect()`.
  - Added indexed target fetch using `by_storageId` with `.take(batchSize)` for rows missing `storageId`.
  - Added a legacy fallback query for explicit `storageId == null` rows.
  - Kept confirm-token enforcement for non-dry runs.
- `convex/schema.ts`
  - Added index: `projectFiles.by_storageId` on `storageId`.
- `convex/lib/taskDiffMutation.ts`
  - Added `POSITION_STRIDE = 1000`.
  - Changed reorder patching to compute an offset from unchanged tasks and assign
    `position = reorderOffset + index * POSITION_STRIDE`.
  - This avoids collisions with tasks not included in `orderedTaskIds`.
- `src/app/components/SearchPopup.tsx`
  - Added `isLoadingRef` guard for `handleResultsScroll`.
  - Set guard before `loadMoreWorkspaceFiles(100)` and reset via effect when `workspaceFilesPaginationStatus !== "LoadingMore"`.
- `src/app/components/Tasks.tsx`
  - Added `isLoadingMoreRef` guard for `handleTasksScroll`.
  - Set guard before `loadMoreWorkspaceTasks(100)` and reset via effect when `tasksPaginationStatus !== "LoadingMore"`.
- `src/app/dashboard/hooks/useDashboardDataLayer.ts`
  - Added memoized `getBrandAssetDownloadUrlQuery` via `useCallback`.
  - Added null-safe guard: return `null` when query result is falsy before accessing `downloadUrl`.

## Validation
- `npm run typecheck`
- `npx vitest run convex/__tests__/tasks_apply_diff.test.ts convex/__tests__/file_storage.test.ts`
- `npx eslint convex/files.ts convex/lib/taskDiffMutation.ts src/app/components/SearchPopup.tsx src/app/components/Tasks.tsx src/app/dashboard/hooks/useDashboardDataLayer.ts convex/schema.ts`
