# Settings Race and Rollback Hardening

## Summary
Implemented targeted consistency and render-stability fixes across settings flows:
- Prevented workspace soft-delete navigation race in the app state layer.
- Added rollback safeguards for account profile updates that span WorkOS + local DB.
- Added rollback + durable reconciliation scheduling for member removal when local DB mutation fails after WorkOS delete.
- Extracted `ToggleRow` out of `NotificationSettings` to avoid creating a new component type on every render.

## Changes

### `src/app/App.tsx`
- Updated `handleSoftDeleteWorkspace` to:
  - validate `resolvedWorkspaceSlug`
  - call `setActiveWorkspaceSlug(null)` before `softDeleteWorkspaceMutation`
  - wrap mutation in `try/catch`
  - restore slug with `setActiveWorkspaceSlug(resolvedWorkspaceSlug)` on failure
  - navigate to `"/tasks"` only after successful delete

### `convex/settings.ts`
- Updated `updateAccountProfile` action:
  - captured current WorkOS profile via `workos.userManagement.getUser`
  - normalized next values once (`nextFirstName`, `nextLastName`, `nextEmail`)
  - wrapped `internal.settings.internalApplyAccountProfileUpdate` in `try/catch`
  - on local mutation failure, attempted WorkOS rollback via `workos.userManagement.updateUser` using captured previous profile values
  - added explicit failure logging for both local mutation failure and rollback failure

- Updated member-removal consistency flow:
  - expanded `internal.settings.internalGetWorkspaceRemovalContext` response with rollback metadata:
    - `workspaceSlug`
    - `workosOrganizationId`
    - `targetWorkosUserId`
    - `targetRole`
  - wrapped `ctx.runMutation(internal.settings.internalRemoveWorkspaceMember)` in `try/catch` inside `removeWorkspaceMember`
  - on local mutation failure, attempted WorkOS membership rollback using `authKit.workos.userManagement.createOrganizationMembership`
  - if rollback fails, enqueued durable reconciliation via `ctx.scheduler.runAfter(0, api.organizationSync.reconcileWorkspaceOrganizationMemberships, { workspaceSlug })`
  - added error logging around rollback and reconciliation enqueue paths

### `src/app/components/SettingsPopup.tsx`
- Moved `ToggleRow` from inside `NotificationSettings` to top-level module scope.
- Preserved:
  - existing props (`label`, `description`, `checked`, `onToggle`)
  - `className` styling
  - `motion.div` layout + spring transition
  - `cn` usage

## Validation
- `npm run build` ✅
- `npm run typecheck` ✅
