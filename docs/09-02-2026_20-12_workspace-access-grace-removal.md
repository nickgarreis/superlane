# Workspace Access Graceful Removal Cleanup

**Date:** 2026-02-09 20:12
**Type:** Reliability / Access Control Hardening

## Summary

Refactored default workspace resolution to be read-only and moved membership removal to a deferred cleanup flow with a grace period.

## Changes

### Default workspace resolver (`convex/workspaces.ts`)
- Converted `internalResolveDefaultWorkspaceAccess` from `internalMutation` to `internalQuery`.
- Removed all immediate membership status patching from this resolver.
- Resolver now performs read-only access checks (`hasActiveOrganizationMembershipForWorkspace`) and only returns the first accessible workspace slug.
- Updated `ensureDefaultWorkspace` to call this resolver via `ctx.runQuery(...)`.

### Workspace member soft-removal state (`convex/schema.ts`)
- Added `pendingRemovalAt` to `workspaceMembers` as an optional `number | null`.
- Added `by_status` index on `workspaceMembers` for cleanup scanning.

### Deferred cleanup worker (`convex/workspaces.ts`)
- Added new internal mutation: `internalCleanupPendingWorkspaceMemberRemovals`.
- Behavior:
  1. Scans active workspace memberships.
  2. If org/workspace/user access is invalid, schedules pending removal by setting `pendingRemovalAt`.
  3. If access is restored before grace expires, clears `pendingRemovalAt`.
  4. Only sets `status: "removed"` when `pendingRemovalAt` is older than the configured grace period.
- Grace period is configurable via optional mutation arg or env var:
  - `WORKSPACE_MEMBER_PENDING_REMOVAL_GRACE_MS`
  - defaults to 24 hours.

### Audit logging (`convex/schema.ts`, `convex/workspaces.ts`)
- Added new table `workspaceMemberAuditLogs`.
- Cleanup worker writes audit events for:
  - `pending_removal_scheduled`
  - `pending_removal_cleared`
  - `removed_after_grace`
- Each log captures membership/workspace/user IDs, reason, previous/next status, and timestamp.

### Scheduler (`convex/crons.ts`)
- Added hourly cron:
  - `cleanup-pending-workspace-member-removals`
  - invokes `internal.workspaces.internalCleanupPendingWorkspaceMemberRemovals`.

## Tests

Updated backend tests in `convex/__tests__/workspaces_workos_linking.test.ts`:
- Added coverage that `ensureDefaultWorkspace` no longer removes inaccessible memberships during resolution.
- Added coverage for the deferred cleanup lifecycle (schedule pending removal, then remove after grace) and audit log writes.

## Validation

- `npm run typecheck` ✅
- `npm run test:backend -- workspaces_workos_linking.test.ts` ✅
- `npm run lint` ✅
