# Performance Cutover: Dashboard/Convex Incremental Loading + Query Hardening

## Scope
Implemented the single-cutover performance remediation across Convex backend + React dashboard client.

## Backend changes
- Added denormalized deletion fields + indexes in `convex/schema.ts`:
  - `tasks.projectDeletedAt`
  - `projectFiles.projectDeletedAt`
  - `tasks.by_workspace_projectDeletedAt_position`
  - `projectFiles.by_workspace_projectDeletedAt_deletedAt_displayDateEpochMs`
  - `workspaceMembers.by_workspace_status_joinedAt`
  - `workspaceInvitations.by_workspace_state_createdAt`
- Added backfill support in `convex/performanceBackfills.ts` for `projectDeletedAt` on tasks/files.
- Updated project/task/file write paths to keep `projectDeletedAt` synchronized (`convex/projects.ts`, `convex/tasks.ts`, `convex/files.ts`, `convex/lib/taskMutations.ts`).
- Rewrote workspace task/file listing hot paths to avoid project `.collect()` joins and rely on indexed filtering.
- Added `tasks.applyDiff` mutation and extracted implementation into `convex/lib/taskDiffMutation.ts`.
- Added `files.listForProjectPaginated` while retaining compatibility `files.listForProject`.
- Added `dashboard.getWorkspaceBootstrap` and switched dashboard shell consumption to bootstrap payload.
- Split company settings query surface in `convex/settings.ts`:
  - `getCompanySettingsSummary`
  - `listCompanyMembers`
  - `listPendingInvitations`
  - `listBrandAssets`
  - `getBrandAssetDownloadUrl`
- Optimized purge cron path in `convex/files.ts` to indexed batched scans (`by_purgeAfterAt`, `by_createdAt`) and guarded legacy cleanup execution with explicit confirmation token.

## Frontend changes
- Removed eager pagination-drain behavior from `src/app/dashboard/useDashboardData.ts`.
- Dashboard now fetches first pages by default and exposes explicit load-more controls:
  - workspace tasks
  - project files
  - workspace files (search intent)
- Added scroll-boundary incremental loading in:
  - `src/app/components/Tasks.tsx`
  - `src/app/components/MainContent.tsx`
  - `src/app/components/search-popup/SearchPopupResults.tsx`
- Search popup now receives workspace file pagination status + `loadMoreWorkspaceFiles` and triggers demand-driven pagination near list end.
- Replaced task mutation fan-out in client with one diff call per interaction via `tasks.applyDiff` (`useDashboardTaskSync.ts`, action wiring).
- Settings UI now hydrates Company tab via split query model and resolves brand-asset download URLs on click.

## Test updates
- Added `convex/__tests__/tasks_apply_diff.test.ts` for:
  - authorization
  - apply/create/update/remove/reorder correctness
  - idempotent no-op behavior for repeated remove/update calls
- Extended settings tests (`convex/__tests__/settings_p11.test.ts`) for split settings queries and on-demand brand asset URL resolution.
- Extended scaling test (`convex/__tests__/performance_scaling.test.ts`) for incremental pagination behavior and bootstrap contract.
- Updated dashboard hook/component tests for new API signatures and pagination call shape.

## Validation run
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm test` ✅
- `npm run build` ✅
- `npm run perf:check` ✅
