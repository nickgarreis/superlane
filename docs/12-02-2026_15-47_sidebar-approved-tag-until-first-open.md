# Sidebar approved tag until first open

## Date
- 12-02-2026 15:47

## Goal
Implement a per-user, backend-persisted "Approved" sidebar tag that appears after Review -> Active approval and remains visible until that specific user opens the project detail route for the first time.

## What changed

### Backend
- Updated `/Users/nick/Designagency/convex/schema.ts`:
  - Added `lastApprovedAt` to `projects`.
  - Added new `projectApprovalReads` table with indexes:
    - `by_workspace_user`
    - `by_workspace_user_project`

- Updated `/Users/nick/Designagency/convex/projects.ts`:
  - Added `resolveLastApprovedAt` helper to enforce transition semantics.
  - Added query `listApprovalReadsForWorkspace`.
  - Added mutation `markApprovalSeen` (idempotent upsert per user/project/workspace).
  - Applied lifecycle updates:
    - Set `lastApprovedAt` on `Review -> Active`.
    - Preserve when status is unchanged.
    - Clear on other actual status transitions.
    - Initialize/clear defaults in create/unarchive/normalization paths.

### Frontend data + behavior
- Updated `/Users/nick/Designagency/src/app/types.ts`:
  - Added `lastApprovedAt` to `ProjectData` and `DbProjectRecord`.

- Updated `/Users/nick/Designagency/src/app/lib/mappers.ts`:
  - Added `lastApprovedAt` in snapshot type and UI mapping.

- Added `/Users/nick/Designagency/src/app/dashboard/lib/approvalReads.ts`:
  - Shared helper to compute approved/unseen sidebar project ids from projects + approval reads.

- Updated `/Users/nick/Designagency/src/app/dashboard/useDashboardData.ts`:
  - Queried `api.projects.listApprovalReadsForWorkspace`.
  - Computed `approvedSidebarProjectIds` for active, non-archived, unseen-approved projects.

- Updated `/Users/nick/Designagency/src/app/dashboard/useDashboardData.types.ts`:
  - Added `approvedSidebarProjectIds` to `UseDashboardDataResult`.

- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardApiHandlers.ts`:
  - Added `markApprovalSeenMutation`.

- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardActionLayer.ts`:
  - Added route-based effect for `project:{id}` views to mark approval as seen.
  - Added dedupe key `projectId:lastApprovedAt` to avoid repeated calls.

### Sidebar rendering
- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardViewBindings.ts`:
  - Passed `approvedSidebarProjectIds` into chrome/sidebar props.

- Updated `/Users/nick/Designagency/src/app/dashboard/components/DashboardChrome.tsx`:
  - Accepted and passed through `approvedSidebarProjectIds`.

- Updated `/Users/nick/Designagency/src/app/components/Sidebar.tsx`:
  - Accepted and passed through `approvedSidebarProjectIds`.

- Updated `/Users/nick/Designagency/src/app/components/sidebar/types.ts`:
  - Added `approvedSidebarProjectIds` to project-section props.

- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarProjectsSection.tsx`:
  - Computed approved set and passed `isApproved` to row items.

- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarItem.tsx`:
  - Added `isApproved` row flag.
  - Rendered gold `Approved` tag using warning tone token.

### Tests
- Updated `/Users/nick/Designagency/convex/__tests__/projects_lifecycle_invariants.test.ts`:
  - Added coverage for:
    - `setStatus` approval timestamp semantics
    - `update` approval timestamp semantics
    - per-user idempotent approval-read behavior
  - Updated unarchive assertions to confirm `lastApprovedAt` reset.

- Updated frontend tests:
  - `/Users/nick/Designagency/src/app/components/sidebar/SidebarProjectsSection.test.tsx`
  - `/Users/nick/Designagency/src/app/components/Sidebar.test.tsx`
  - `/Users/nick/Designagency/src/app/dashboard/useDashboardData.test.tsx`
  - `/Users/nick/Designagency/src/app/dashboard/components/DashboardChrome.test.tsx`
  - `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardDataLayer.test.tsx`
  - `/Users/nick/Designagency/src/app/dashboard/useDashboardOrchestration.test.tsx`

## Validation
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run test -- src/app/components/sidebar/SidebarProjectsSection.test.tsx src/app/dashboard/useDashboardData.test.tsx src/app/dashboard/components/DashboardChrome.test.tsx src/app/dashboard/hooks/useDashboardDataLayer.test.tsx src/app/dashboard/useDashboardOrchestration.test.tsx convex/__tests__/projects_lifecycle_invariants.test.ts` ✅

