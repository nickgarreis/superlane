# Fig Upload Rollback Hardening

## Summary
Implemented server-side finalize rollback hardening for uploaded blobs by ensuring finalize operations run through actions that can delete storage objects outside failed mutation transactions.

## What Changed
- Updated `convex/files.ts`:
  - Added stable internal mutation references via `makeFunctionReference` for:
    - `files:internalFinalizeProjectUpload`
    - `files:internalFinalizePendingDraftAttachmentUpload`
  - Kept `finalizeProjectUpload` and `finalizePendingDraftAttachmentUpload` as public actions.
  - Public action handlers now:
    - Validate `.fig` file signature bytes from storage (`ctx.storage.get(...).slice(...)` + `assertAllowedFileSignature(...)`).
    - Execute DB writes through internal mutations.
    - On any failure, perform best-effort `ctx.storage.delete(storageId)` and rethrow.
  - This guarantees rollback cleanup for rejected finalize calls is not lost to mutation rollback semantics.

## Validation
Executed:
- `npx convex codegen`
- `WORKOS_CLIENT_ID=test-client WORKOS_API_KEY=test-api WORKOS_WEBHOOK_SECRET=test-webhook WORKOS_ACTION_SECRET=test-action npx vitest run convex/__tests__/file_storage.test.ts`
- `WORKOS_CLIENT_ID=test-client WORKOS_API_KEY=test-api WORKOS_WEBHOOK_SECRET=test-webhook WORKOS_ACTION_SECRET=test-action npm run typecheck`
- `npm run build`

All commands completed successfully.
