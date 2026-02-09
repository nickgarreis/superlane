# Convex + WorkOS Plan Execution Continued (Phase 2: Strict Org Enforcement + Reconciliation)

## Scope Executed
Continued execution of `/Users/nick/Designagency/docs/08-02-2026_21-12_convex-workos-integration-plan.md` by implementing the remaining phase-2 hardening item:
- strict WorkOS organization enforcement for workspace access
- org membership sync path (webhook + reconciliation)
- drift-repair reconciliation action

## Backend Changes

### 1. Schema updates for strict org enforcement
Updated `/Users/nick/Designagency/convex/schema.ts`:
- Added index on `workspaces`:
  - `by_workosOrganizationId`
- Added new table `workosOrganizationMemberships`:
  - `membershipId`, `workosOrganizationId`, `workosUserId`, optional `organizationName`, optional `roleSlug`, `status`, timestamps
  - indexes:
    - `by_membershipId`
    - `by_workosOrganizationId`
    - `by_workosUserId`
    - `by_workosOrganizationId_workosUserId`

### 2. Shared org membership sync/enforcement helpers
Added `/Users/nick/Designagency/convex/lib/workosOrganization.ts` with helpers to:
- require active WorkOS org membership for mapped workspaces
- check org membership presence without throwing
- upsert synced WorkOS org memberships
- map WorkOS role/status to app `workspaceMembers` role/status and sync rows

### 3. Strict access enforcement in auth helper
Updated `/Users/nick/Designagency/convex/lib/auth.ts`:
- `requireWorkspaceMember` now also enforces active org membership when `workspace.workosOrganizationId` is set
- returns resolved `workspace` + `organizationMembership` in addition to app membership/user

### 4. Snapshot filtering + default workspace behavior
Updated `/Users/nick/Designagency/convex/dashboard.ts`:
- `getSnapshot` now filters active workspaces by org membership sync state for strict access

Updated `/Users/nick/Designagency/convex/workspaces.ts`:
- `create`/`update` now guard against duplicate org-to-workspace mapping
- `switchWorkspace` uses strict workspace/org access checks
- `ensureDefaultWorkspace` now ignores stale memberships that no longer satisfy org access, marks them removed, then creates a default workspace if needed

### 5. WorkOS webhook event sync expansion
Updated `/Users/nick/Designagency/convex/auth.ts`:
- Enabled additional WorkOS event types in AuthKit:
  - `organization_membership.created`
  - `organization_membership.updated`
  - `organization_membership.deleted`
  - `organization_membership.added`
  - `organization_membership.removed`
  - `organization.deleted`
- Added handlers to:
  - upsert `workosOrganizationMemberships`
  - sync `workspaceMembers` role/status from organization membership state
  - mark org-linked memberships/workspace members as removed when organization is deleted

### 6. Reconciliation API to repair drift
Added `/Users/nick/Designagency/convex/organizationSync.ts`:
- `reconcileWorkspaceOrganizationMemberships` (public action)
  - fetches authoritative org memberships from WorkOS API
- `getReconciliationContext` (internal query)
  - validates caller access (`owner`/`admin`) and workspace org linkage
- `applyOrganizationMembershipSnapshot` (internal mutation)
  - applies fetched snapshot into `workosOrganizationMemberships`
  - syncs `workspaceMembers`
  - marks removed memberships not present in snapshot

## Validation Executed
All commands succeeded:
- `npx convex codegen`
- `npm run build`

## Result
The remaining phase-2 strict org enforcement item is now implemented end-to-end:
- workspace access is no longer based only on app membership rows
- org membership sync now keeps app membership state aligned
- reconciliation action is available to repair drift from missed/stale event updates
