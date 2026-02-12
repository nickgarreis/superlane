# Convex env runtime fixes

**Date:** 11-02-2026 23:05

## What changed
- Updated `/Users/nick/Designagency/convex/workspaces.ts`:
  - Replaced long env var lookup `WORKSPACE_MEMBER_PENDING_REMOVAL_GRACE_MS` with shorter key `WORKSPACE_MEMBER_REMOVAL_GRACE_MS` (Convex env name limit is `< 40` chars).
  - Existing default behavior is preserved via `DEFAULT_WORKSPACE_MEMBER_PENDING_REMOVAL_GRACE_MS` when env is unset/invalid.

- Updated `/Users/nick/Designagency/convex/notificationsEmail.ts`:
  - Changed `getNotificationsFromAddress()` to return `null` instead of throwing when `NOTIFICATIONS_FROM_EMAIL` is missing.
  - Added early return in `sendForToggle()` that logs a structured warning and returns a summary with:
    - `queuedRecipients: 0`
    - `failedRecipients: 0`
    - `skippedMissingFromAddress` count
  - This prevents scheduled/internal notification jobs from crashing when sender env is not configured.

- Updated `/Users/nick/Designagency/convex/__tests__/notifications_email.test.ts`:
  - Added test `notification dispatch skips safely when NOTIFICATIONS_FROM_EMAIL is missing`.
  - Verifies notification dispatch now degrades safely instead of throwing.

## Why
- Convex rejects env names longer than 39 characters, causing `internalCleanupPendingWorkspaceMemberRemovals` to throw at runtime.
- Missing `NOTIFICATIONS_FROM_EMAIL` should not crash comment/status background notification dispatch paths.

## Validation
- `npx vitest run --config vitest.backend.config.ts convex/__tests__/notifications_email.test.ts` ✅
- `npm run typecheck` ✅
- `npx vitest run --config vitest.backend.config.ts convex/__tests__/workspaces_workos_linking.test.ts` ✅
