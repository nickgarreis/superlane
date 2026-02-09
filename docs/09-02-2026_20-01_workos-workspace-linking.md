# WorkOS Workspace Linking: Creation + Backfill

## Summary
Implemented end-to-end WorkOS organization linking for workspace lifecycle:

- New workspace creation now provisions a WorkOS organization and owner membership before local DB insert.
- Default workspace creation now follows the same WorkOS-first provisioning flow.
- Added owner-only backfill action to link existing unlinked workspaces and provision memberships for all active members.
- Added rollback behavior to delete newly created WorkOS organizations if local DB writes fail after provisioning.
- Preserved app-level `owner` semantics during org-sync role updates (no owner demotion).
- Added frontend auto-link trigger for owners when viewing an unlinked workspace in Company settings context.

## Backend Changes

### `convex/workspaces.ts`
- Converted `create` from mutation to action with WorkOS organization provisioning.
- Converted `ensureDefaultWorkspace` from mutation to action with WorkOS organization provisioning.
- Added `ensureOrganizationLink` action for owner-only backfill on existing unlinked workspaces.
- Added internal DB primitives:
  - `internalGetProvisioningAuthContext`
  - `internalCreateWorkspaceWithOrganization`
  - `internalResolveDefaultWorkspaceAccess`
  - `internalGetOrganizationLinkContext`
  - `internalLinkWorkspaceOrganization`
- Added shared helpers for:
  - role mapping (`owner/admin -> admin`, `member -> member`)
  - WorkOS membership status normalization
  - WorkOS rollback on failed local writes
  - upsert of `workosOrganizationMemberships` cache rows

### `convex/lib/workosOrganization.ts`
- Updated `syncWorkspaceMemberFromOrganizationMembership` to preserve existing local `owner` role while still syncing status.

### `convex/lib/rbac.ts`
- Added RBAC entry for `workspaces.ensureOrganizationLink` (owner-only) and updated notes for action-based workspace provisioning entries.

## Frontend Changes

### `src/app/DashboardApp.tsx`
- Switched workspace APIs from mutation hooks to action hooks:
  - `api.workspaces.create`
  - `api.workspaces.ensureDefaultWorkspace`
- Added `api.workspaces.ensureOrganizationLink` action hook.
- Added guarded auto-link effect:
  - runs once per workspace slug
  - only when workspace is unlinked and viewer role is `owner`
  - attempts backfill link and triggers reconciliation refresh on success

## Tests

### New test file
- Added `convex/__tests__/workspaces_workos_linking.test.ts` covering:
  - linked workspace creation with membership cache write
  - provisioning failure with no workspace write
  - rollback on DB failure after organization creation
  - default workspace linked provisioning
  - owner-only backfill link for existing unlinked workspace with active-member provisioning
  - idempotent no-op for already linked workspace
  - owner role preservation during org-sync

## Validation
Executed successfully:
- `npm run lint`
- `npm run typecheck`
- `npm run test:backend`
- `npm run test:frontend`
- `npm run build`
