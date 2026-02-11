# Performance Remediation Cutover Progress

**Date:** 10-02-2026 23:26

## Summary
Started implementing the requested single-cutover performance remediation plan (React + Convex, 5k-task target). Work in this checkpoint is focused on backend/query/mutation contracts and frontend data-layer cutover scaffolding.

## Changes Made So Far

### Backend schema + validators
- Updated `convex/schema.ts` with additive fields/indexes for performance-oriented denormalization and query paths:
  - `projects`: added `creatorSnapshotName`, `creatorSnapshotAvatarUrl`
  - `projectComments`: added `authorSnapshotName`, `authorSnapshotAvatarUrl`
  - `commentReactions`: added `projectPublicId`, `workspaceId`, indexes `by_projectPublicId`, `by_workspaceId`
  - `tasks`: added indexes `by_workspace_taskId`, `by_workspace_position`, `by_projectPublicId_position`
  - `projectFiles`: added index `by_workspace_deletedAt_displayDateEpochMs`
- Updated `convex/lib/validators.ts`:
  - `taskAssigneeValidator` now includes optional `userId`

### Dashboard query surface refactor
- Replaced `convex/dashboard.ts` with:
  - `getWorkspaceContext` (lightweight shell context)
  - `getActiveWorkspaceSummary` (workspace-level counts/metadata)
  - legacy-compatible `getSnapshot` retained and internally modernized
- Added logic to prefer persisted avatar URLs first on hot query paths.

### New paginated domain queries/mutation foundations
- Updated `convex/projects.ts`:
  - Added `projects.listForWorkspace({ workspaceSlug, includeArchived?, paginationOpts })`
  - Added creator snapshot usage and fallback resolution
  - Project create now writes creator snapshot fields
- Replaced `convex/tasks.ts` with:
  - New queries: `tasks.listForWorkspace`, `tasks.listForProject`
  - New mutations: `tasks.create`, `tasks.update`, `tasks.remove`, `tasks.reorder`
  - Kept `replaceForProject`/`replaceForWorkspace`/`bulkReplaceForWorkspace` for compatibility
- Updated `convex/files.ts`:
  - `files.listForWorkspace` now supports pagination and optional `projectPublicId` filter
  - Uses indexed workspace/deleted path instead of broad full-collection scan

### Query efficiency hardening
- Updated `convex/comments.ts`:
  - `listForProject` now prefers one indexed reaction lookup (`by_projectPublicId`) with legacy fallback
  - Comment creation stores author snapshot fields
  - New reactions write denormalized `projectPublicId` + `workspaceId`
- Updated avatar URL resolution hot paths:
  - `convex/collaboration.ts`
  - `convex/settings.ts`

### Frontend data-layer and task action cutover (in progress)
- Updated `src/app/dashboard/useDashboardData.ts`:
  - switched from `api.dashboard.getSnapshot` to `api.dashboard.getWorkspaceContext`
  - introduced paginated view-scoped queries for projects/tasks/files
- Updated task identity mapping:
  - `src/app/lib/mappers.ts` now maps assignee `userId`
  - `src/app/components/project-tasks/useProjectTaskHandlers.ts` now sets assignee `userId`
  - `src/app/dashboard/hooks/projectActionMappers.ts` now includes assignee `userId`
- Updated action wiring:
  - `src/app/dashboard/hooks/useDashboardApiHandlers.ts` now exposes `tasks.create/update/remove/reorder`
  - `src/app/dashboard/hooks/useDashboardActionLayer.ts` now passes new task handlers to project actions
  - `src/app/dashboard/hooks/useDashboardProjectActions.ts` replaced with delta-based sync logic for project/workspace tasks using granular task mutations

## Current Status
- Implementation is **in progress**.
- No full validation pass has been run yet after this checkpoint.
- Next steps are frontend virtualization, migration/backfill handlers, and comprehensive test + perf verification.
