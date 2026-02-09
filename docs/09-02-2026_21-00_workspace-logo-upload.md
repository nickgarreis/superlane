# Workspace Logo Upload

**Date:** 2026-02-09 21:00
**Type:** Feature

## Summary

Added the ability for workspace admins/owners to upload, replace, and remove a workspace profile image (logo) from the Company tab in Settings.

## Changes

### Schema (`convex/schema.ts`)
- Added `logoStorageId: v.optional(v.id("_storage"))` to the `workspaces` table to track the Convex storage blob for cleanup on replacement/removal.

### Backend (`convex/settings.ts`)
- Added `WORKSPACE_LOGO_ALLOWED_MIME` set (PNG, JPEG, GIF, WebP).
- **`generateWorkspaceLogoUploadUrl`** — mutation requiring admin role, returns signed upload URL.
- **`finalizeWorkspaceLogoUpload`** — mutation that validates MIME type, 2MB size limit, checksum, and storage metadata; resolves storage URL and patches `workspace.logo` + `logoStorageId`; cleans up previous storage blob on replacement; rolls back uploaded blob on validation failure.
- **`removeWorkspaceLogo`** — mutation requiring admin role, clears `logo`, `logoStorageId`, `logoColor`, and `logoText` fields, deletes the storage blob.

### Frontend (`src/app/DashboardApp.tsx`)
- Registered three new mutation hooks: `generateWorkspaceLogoUploadUrl`, `finalizeWorkspaceLogoUpload`, `removeWorkspaceLogo`.
- Added `handleUploadWorkspaceLogo` callback following the established 3-step pattern (compute SHA-256 → get signed URL → POST file → finalize).
- Added `handleRemoveWorkspaceLogo` callback.
- Both callbacks passed as props to `LazySettingsPopup`.

### UI (`src/app/components/SettingsPopup.tsx`)
- Added `onUploadWorkspaceLogo` and `onRemoveWorkspaceLogo` to `SettingsPopupProps` and `WorkspaceSettings` prop types.
- Added hidden file input (`image/png, image/jpeg, image/gif, image/webp`) with ref.
- Added camera icon hover overlay on the 80x80 workspace avatar (click triggers file picker).
- Added "Upload" and "Remove" buttons below the avatar, gated by admin/owner capability.
- Added `logoBusy` loading state to disable buttons during upload/removal.
- Toast notifications on success/error for both upload and removal.

## Data Flow

1. User clicks avatar or "Upload" button → file picker opens
2. File selected → `handleUploadWorkspaceLogo(file)` called
3. SHA-256 checksum computed client-side
4. Signed upload URL obtained via `generateWorkspaceLogoUploadUrl`
5. File POSTed to Convex storage
6. `finalizeWorkspaceLogoUpload` validates and patches workspace record
7. Convex subscription auto-updates all connected clients (sidebar + settings popup)

## Files Modified

- `convex/schema.ts`
- `convex/settings.ts`
- `src/app/DashboardApp.tsx`
- `src/app/components/SettingsPopup.tsx`
