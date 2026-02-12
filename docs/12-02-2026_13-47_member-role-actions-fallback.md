# Member role/remove action fallback for missing WorkOS membership cache

## Problem
- Changing a member role or removing a member could fail with a generic UI error (for example: `Failed to update member role`) when the local `workosOrganizationMemberships` cache did not contain the target member yet.
- Both flows previously depended on the cached `organizationMembershipId` before calling WorkOS.

## Changes made
- Updated `/Users/nick/Designagency/convex/settings.ts`:
  - Added `normalizeWorkosMembershipStatus()` helper.
  - Added `resolveOrganizationMembershipId()` helper that:
    - Uses cached `organizationMembershipId` when present.
    - Falls back to querying WorkOS organization memberships and selecting the target member’s active (or pending) membership by `workosUserId`.
  - Updated `internalGetWorkspaceRoleChangeContext` and `internalGetWorkspaceRemovalContext` to return `organizationMembershipId` as optional (`null` when cache row is missing) instead of throwing immediately.
  - Updated `changeWorkspaceMemberRole` action to resolve membership ID via fallback helper before `updateOrganizationMembership`.
  - Updated `removeWorkspaceMember` action to resolve membership ID via fallback helper before `deleteOrganizationMembership`.
  - Updated removal error logging to use the resolved membership ID value.

## Why this fixes the issue
- Role-change and removal no longer hard-fail solely because the local membership cache row is missing.
- The action can still locate the correct WorkOS organization membership directly and proceed.

## Validation
- `npm run typecheck` ✅
- `npm run test:backend -- settings_p11` ✅ (full backend suite executed by Vitest command and all tests passed)
