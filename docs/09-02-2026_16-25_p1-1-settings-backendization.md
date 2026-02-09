# P1.1 Settings Backendization (Expanded Company Scope)

## Summary
Implemented P1.1 with expanded Company scope:
- Backendized Account, Notifications, Company Members, Brand Assets, and Workspace soft-delete.
- Kept Billing panel read-only/non-functional.
- Wired settings orchestration through `src/app/App.tsx` and new Convex settings APIs.

## Backend Changes

### New Convex module
- Added `convex/settings.ts` with:
  - Queries:
    - `getAccountSettings`
    - `getNotificationPreferences`
    - `getCompanySettings`
  - Mutations:
    - `generateAvatarUploadUrl`
    - `finalizeAvatarUpload`
    - `removeAvatar`
    - `saveNotificationPreferences`
    - `updateWorkspaceGeneral`
    - `generateBrandAssetUploadUrl`
    - `finalizeBrandAssetUpload`
    - `removeBrandAsset`
    - `softDeleteWorkspace`
  - Actions (WorkOS-first flows):
    - `updateAccountProfile`
    - `inviteWorkspaceMember`
    - `resendWorkspaceInvitation`
    - `revokeWorkspaceInvitation`
    - `changeWorkspaceMemberRole`
    - `removeWorkspaceMember`
    - `reconcileWorkspaceInvitations`
  - Internal helpers for invitation/member sync and action context lookups.

### Schema updates
- Updated `convex/schema.ts`:
  - `users`: added `avatarStorageId`.
  - `workspaces`: added `deletedAt`, `deletedByUserId`.
  - Added `notificationPreferences` table.
  - Added `workspaceInvitations` table.
  - Added `workspaceBrandAssets` table.

### Existing backend modules updated
- `convex/lib/auth.ts`: treats soft-deleted workspaces as not found.
- `convex/dashboard.ts`:
  - excludes soft-deleted workspaces from snapshot.
  - resolves viewer avatar from `avatarStorageId` when present.
- `convex/auth.ts`:
  - added invitation events to additional event types.
  - added invitation event sync into `workspaceInvitations` cache.
- `convex/lib/rbac.ts`:
  - added settings/company/brand/delete related RBAC matrix entries.
- `convex/workspaces.ts`:
  - guards against operating on deleted workspaces.
  - ensures deleted workspaces are skipped in default workspace selection.
- `convex/files.ts`:
  - workspace lookup now rejects soft-deleted workspaces.

## Frontend Changes

### App orchestration
- Updated `src/app/App.tsx`:
  - added tab-specific settings queries and all settings mutations/actions.
  - added account/avatar/notification/company handler functions.
  - added reconciliation calls after company membership/invitation operations:
    - `settings.reconcileWorkspaceInvitations`
    - `organizationSync.reconcileWorkspaceOrganizationMemberships`
  - wired expanded props into `SettingsPopup`.

### Settings UI refactor
- Rewrote `src/app/components/SettingsPopup.tsx` into controlled backend-driven flows:
  - Account:
    - editable first/last/email
    - avatar upload/remove wired to backend
  - Notifications:
    - normalized channel/event toggles persisted via explicit save
    - removed push banner section
  - Company:
    - backend workspace general update
    - real members + role changes + removal
    - pending invites with resend/revoke
    - org-link gating message
    - real brand assets upload/list/download/remove
    - owner-only soft delete action
  - Billing:
    - read-only “coming soon” presentation

## Tests
- Added `convex/__tests__/settings_p11.test.ts` covering:
  - notification defaults and persistence round-trip
  - avatar upload lifecycle + replacement cleanup + removal
  - brand asset admin-only management
  - workspace soft-delete visibility/access behavior

## Validation
Executed successfully:
- `npm run typecheck`
- `npm run build`
- `npm run test:rbac`
