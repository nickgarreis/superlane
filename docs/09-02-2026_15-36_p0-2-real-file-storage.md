# P0.2 Real File Storage Pipeline Implementation

## Summary
Implemented P0.2 end-to-end for real file storage in Convex:
- Byte-backed uploads for project files (`Assets`, `Contract`, `Attachments`)
- Immediate byte upload for `CreateProjectPopup` attachments with pending-upload consumption on project create/update
- Authorized per-click download URL resolution
- Server-side file policy enforcement (MIME+extension allowlist, size, checksum)
- Logical delete + 30-day retention with daily purge cron
- Legacy metadata-only cleanup endpoint

## Backend Changes

### Schema
Updated `convex/schema.ts`:
- Extended `projectFiles` with:
  - `storageId`, `mimeType`, `sizeBytes`, `checksumSha256`
  - `deletedAt`, `deletedByUserId`, `purgeAfterAt`
- Added indexes:
  - `by_projectId_deletedAt`
  - `by_purgeAfterAt`
- Added `pendingFileUploads` table and indexes:
  - `by_draftSessionId`, `by_workspaceId`, `by_uploaderUserId`, `by_createdAt`

### New backend helpers
- `convex/lib/filePolicy.ts`
  - max size: 100MB
  - max count: 25 files/project
  - retention constants (30 days)
  - allowed MIME+extension policy
  - checksum + duplicate-name helpers
- `convex/lib/projectAttachments.ts`
  - mirrors `Attachments` tab file rows back into `projects.attachments`

### File API lifecycle (`convex/files.ts`)
Added:
- `generateUploadUrl`
- `finalizeProjectUpload`
- `finalizePendingDraftAttachmentUpload`
- `discardPendingUpload`
- `discardPendingUploadsForSession`
- `getDownloadUrl`
- `runLegacyMetadataCleanup`
- `internalPurgeDeletedFiles` (internal)

Changed:
- `listForWorkspace` / `listForProject` now return only active, storage-backed files
- `remove` now performs logical delete (`deletedAt` + `purgeAfterAt`)
- Kept deprecated `create` as compatibility wrapper

### Project integration (`convex/projects.ts`)
- `projects.create` and `projects.update` now accept `attachmentPendingUploadIds`
- Consumes pending uploads into `projectFiles` (`source: importedAttachment`)
- `projects.attachments` is synced from `projectFiles` (read-only mirror)
- `projects.remove` now also marks project files logically deleted with 30-day purge window

### Retention cron
Added `convex/crons.ts`:
- Daily job invoking `internal.files.internalPurgeDeletedFiles`
- Purges expired logically-deleted files
- Cleans stale unconsumed pending uploads (>24h)

## Frontend Changes

### `src/app/App.tsx`
- Replaced metadata-only upload path with:
  - checksum (Web Crypto SHA-256)
  - signed upload (`generateUploadUrl` + POST bytes)
  - finalize mutation (`finalizeProjectUpload` / `finalizePendingDraftAttachmentUpload`)
- Added pending-upload management for popup session:
  - remove single pending upload
  - discard full draft session on unsaved close
- Passed `attachmentPendingUploadIds` to `projects.create/update`
- Added per-file download handler via `api.files.getDownloadUrl`

### `src/app/components/CreateProjectPopup.tsx`
- Attachments changed from `File[]` to tracked upload-state records
- Immediate upload on drop
- Per-file retry/remove actions
- Draft session discard on unsaved close
- Submit now sends `attachmentPendingUploadIds`

### `src/app/components/MainContent.tsx`
- Added explicit `Download` button on file rows
- Kept separate remove action

### `src/app/types.ts`
- Extended `ProjectFileData` with storage metadata fields and `downloadable`
- Added `PendingDraftAttachmentUpload` type

## Tests
Added `convex/__tests__/file_storage.test.ts` covering:
- upload URL auth
- finalize + metadata persistence
- type/extension rejection behavior
- duplicate rename
- max file count enforcement
- logical delete visibility rules
- pending upload consume/discard behavior
- internal purge and legacy cleanup endpoint behavior

## Migration / Cleanup Commands

### Command invocation (prepared and validated in code)
- Dry run:
  - `await runLegacyMetadataCleanup({ dryRun: true, batchSize: 500 })`
- Execute:
  - `await runLegacyMetadataCleanup({ dryRun: false, batchSize: 500 })`

### Counts in this implementation run
- Production/staging migration command execution: **not executed in this code run**
- Automated test coverage for cleanup path: **executed via `convex/__tests__/file_storage.test.ts`**

## Validation Run
Executed successfully:
- `npm run lint`
- `npm run typecheck`
- `npx vitest run convex/__tests__`
- `npm run build`

## Operational Notes
- Retention now intentionally uses delayed purge semantics for file deletion (logical delete + daily 30-day purge).
- Legacy metadata-only rows are no longer surfaced by file listing queries.
- Finalizer rollback is implemented to reduce orphaned storage objects when finalize fails.
