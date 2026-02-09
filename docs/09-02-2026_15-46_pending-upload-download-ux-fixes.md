# Pending Upload + Download UX Fixes

## Summary
Implemented four targeted reliability/UX fixes across Convex and the React app:
- Removed redundant pending-upload patching before delete during project consume flow.
- Updated pending-upload cleanup logic to no longer rely on `consumedAt` flags for rows that should be deleted.
- Hardened project file download flow with URL validation before `window.open`.
- Added error handling for draft-session pending-upload discard flow.
- Added explicit upload-in-progress user feedback in create-project flow and disabled footer next/submit while uploads are still running.

## Files Changed
- `convex/projects.ts`
  - In `consumePendingUploadsForProject`, removed:
    - `pendingUpload.consumedAt != null` guard.
    - `ctx.db.patch(pendingUpload._id, { projectId, projectPublicId, consumedAt, updatedAt })`.
  - Kept only `ctx.db.delete(pendingUpload._id)` after successful insertion into `projectFiles`.

- `convex/files.ts`
  - `discardPendingUploadsForSession`: removed `row.consumedAt == null` filter from scoped rows.
  - `internalPurgeDeletedFiles`: removed `upload.consumedAt == null` from stale-pending filter.

- `src/app/App.tsx`
  - `handleDiscardDraftSessionUploads` now wraps `discardPendingUploadsForSessionMutation(...)` in `try/catch`.
  - Catch now logs context (`draftSessionId`, `workspaceSlug`) and shows `toast.error("Failed to discard draft uploads")`.
  - `handleDownloadProjectFile` now validates `result.url` before `window.open`:
    - requires non-empty string and `http/https` prefix.
    - on invalid value logs error context and shows `toast.error("Failed to download file")`.
    - preserved existing `.catch` network/error handler.

- `src/app/components/CreateProjectPopup.tsx`
  - Added `isUploading` derived from `attachments.some((file) => file.status === "uploading")`.
  - Added `isNextDisabled` and wired footer `handleNext` button `disabled` + visual state to include uploading state on submit step.
  - In `createProject`, added toast feedback before early return when uploads are still in progress:
    - `toast.error("Please wait for attachments to finish uploading")`.

## Validation
Executed successfully:
- `npm run typecheck`
- `npm run build`
- `npm run test:rbac`
