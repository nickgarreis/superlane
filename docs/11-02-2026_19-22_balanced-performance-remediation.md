# Balanced Performance Remediation (Complete)

**Date:** 11-02-2026 19:22

## Progress so far
- Updated `convex/schema.ts`:
  - added `workspaceMembers` index `by_userId_status`.
  - added `projectFiles` index `by_workspace_projectPublicId_active_displayDateEpochMs`.
  - added optional `projectComments.reactionSummary` denormalized field.
- Updated `convex/lib/dashboardContext.ts`:
  - switched user membership read path to `by_userId_status` to avoid collect+filter.
- Updated `convex/files.ts`:
  - removed iterative over-fetch pagination loop for project/workspace file listing paths.
  - switched project-scoped queries to direct index-aligned pagination.
- Updated `convex/comments.ts`:
  - introduced reaction summary snapshot helpers.
  - updated paginated comment/reply reads to use `reactionSummary` first and per-comment legacy fallback when missing.
  - initialized new comments with `reactionSummary: []`.
  - updated `toggleReaction` to recompute and persist `reactionSummary` after add/remove.
- Updated `convex/performanceBackfills.ts`:
  - added `backfillProjectCommentReactionSummary` mutation.
- Updated frontend performance paths:
  - `src/app/dashboard/useDashboardData.ts`: conditional `includeArchived`, tuned page sizes (projects/tasks/files/settings).
  - `src/app/dashboard/DashboardShell.tsx`: removed global DnD provider.
  - `src/app/dashboard/components/DashboardSidebarDndBoundary.tsx`: new lazy DnD boundary component.
  - `src/app/dashboard/components/DashboardChrome.tsx`: lazy-loads DnD boundary around Sidebar.
  - `src/app/components/project-tasks/ProjectTaskRow.tsx`: wrapped in `React.memo` with targeted comparator.
  - `src/app/components/search-popup/useSearchPopupData.tsx`: staged memoized matching with fast exits and result caps.
- Updated tests:
  - `convex/__tests__/comments_and_pending_uploads.test.ts` (reactionSummary + fallback + backfill coverage).
  - `convex/__tests__/file_storage.test.ts` (project-scoped pagination stability with mixed visibility rows).
  - `src/app/dashboard/components/DashboardChrome.test.tsx` (updated mock target for new lazy DnD boundary).
  - `src/app/dashboard/useDashboardData.test.tsx` (assertions for conditional archived subscription behavior).

## Validation status
- `npm run typecheck`: **pass**.
- `npm run test:backend -- convex/__tests__/comments_and_pending_uploads.test.ts convex/__tests__/file_storage.test.ts`: **pass** (script also executed full backend suite; all passing).
- `npm run test:frontend -- src/app/dashboard/useDashboardData.test.tsx src/app/dashboard/components/DashboardChrome.test.tsx src/app/components/search-popup/useSearchPopupData.test.tsx`: **pass** (script also executed full frontend suite; all passing).
- `npm run build`: **pass**.
- `npm run perf:report`: **pass**.
- `npm run lint:checks`: **fails on pre-existing non-remediation issue**:
  - `convex/devSeed.ts` exceeds feature file size guard (`1079` lines, limit `500`).

## Notes
- This remediation intentionally preserved API response shapes for frontend consumers.
- Legacy fallback branches for reactions are still present for safe rollout and can be removed after production backfill completion.
