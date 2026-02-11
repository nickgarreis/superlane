# Performance Remediation Implementation

**Date:** 11-02-2026 19:53

## What changed
- Updated task-row prop stability in `src/app/components/ProjectTasks.tsx`:
  - Added module-level `EMPTY_PROJECT_OPTIONS` constant and used it as the default `projectOptions` value to prevent new-array identity churn on rerenders.
- Updated dashboard task-feed loading strategy in `src/app/dashboard/useDashboardData.ts`:
  - Added view-intent gating for workspace task subscriptions.
  - Added project-scoped task subscription (`api.tasks.listForProject`) for project/detail contexts when workspace-wide feed is not needed.
  - Added explicit feed flags (`usesWorkspaceTaskFeed`, `usesProjectTaskFeed`) to returned hook state.
- Updated Convex file-path query efficiency:
  - `convex/files.ts`: switched active project-file collection to `by_projectId_deletedAt` and refactored draft-session discard to use a fully scoped composite index query.
  - `convex/projects.ts`: switched project file reads in pending-upload consumption and project removal to `by_projectId_deletedAt` (removed in-memory deleted filtering).
- Updated schema index coverage in `convex/schema.ts`:
  - Added `pendingFileUploads` index `by_workspace_uploader_draftSessionId`.
- Updated task reorder mutation strategy in `convex/tasks.ts`:
  - Replaced full workspace task collection with id-scoped lookups via `by_workspace_taskId`.
  - Kept response shape stable while applying differential patching (skip patch when position is unchanged).
- Refactored search data path to reduce hook size and repeated work:
  - `src/app/components/search-popup/useSearchPopupData.tsx` now orchestrates smaller hooks.
  - Added `src/app/components/search-popup/useSearchIndex.ts` (index construction + per-entry cache reuse + bounded matching).
  - Added `src/app/components/search-popup/useSearchResults.tsx` (result projection/grouping).
  - Added `src/app/components/search-popup/useSearchDefaultContent.tsx` (default content/suggestions).
- Added/updated tests:
  - Added `convex/__tests__/tasks_reorder.test.ts` to verify no-op reorder does not patch unchanged tasks.
  - Added `src/app/components/ProjectTasksPerf.test.tsx` to verify stable default `projectOptions` reference across rerenders.
  - Updated `src/app/dashboard/useDashboardData.test.tsx` for new paginated query order and task-feed gating behavior.

## Validation
- `npm run build`: pass
- `npm run perf:report`: pass
- `npm run test:frontend`: pass
- `npm run test:backend`: pass
- `npm run typecheck`: pass
- `npm run lint`: fails on pre-existing non-remediation issue:
  - `convex/devSeed.ts` exceeds feature-file-size limit (`1079` lines, max `500`)

## Notes
- Component-size warning for touched search hook path was addressed by splitting `useSearchPopupData.tsx` into focused hooks.
- Remaining component-size warnings are pre-existing (`ProjectTaskRow.tsx`, `StepReview.tsx`) and unchanged in this remediation.
