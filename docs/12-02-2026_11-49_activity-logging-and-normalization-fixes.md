# Activity logging hardening and normalization fixes

**Date:** 12-02-2026 11:49

## What changed
- Hardened comment activity logging in `convex/comments.ts`:
  - Wrapped `comment_added` activity emission in `try/catch`.
  - Added per-mention `try/catch` when logging `mention_added` so one failed mention log does not stop the loop or abort comment creation.
  - Added structured `logError(...)` entries for failures.

- Corrected file upload conflict semantics in `convex/files.ts`:
  - Renamed duplicate-name detection flag from `isReplacement` to `conflictDetected`.
  - Replaced activity action `replaced` with `uploaded_with_conflict` when a duplicate base name is detected.
  - Kept activity `fileName` tied to `finalName` (the actual stored unique filename).

- Preserved original upload errors in `convex/files.ts`:
  - Wrapped `ctx.runMutation(internalLogUploadFailureRef, ...)` in `try/catch`.
  - Swallowed secondary logging failures so they do not override the original upload exception.
  - Continued to rethrow the original `error`.

- Normalized assignee/project comparison behavior in `convex/tasks.ts`:
  - Trimmed previous assignee name before comparing against trimmed incoming assignee name.
  - Used consistent trimmed values for `fromValue`/`toValue` in `assignee_changed` events.
  - Normalized empty-string project IDs to `null` for comparison and for moved-project activity logging.
  - Used normalized next project ID for `projectPublicId` in task activity logs.

- Fixed avatar alt fallback in `src/app/components/activities-page/ActivityRowShell.tsx`:
  - Avoided empty/leading-space alt text by deriving safe fallback alt text (`"avatar"` or initial-based fallback).

- Updated activity row copy in `src/app/components/activities-page/rows/FileActivityRow.tsx`:
  - Added handling for `uploaded_with_conflict` (`Uploaded <name> (name conflict)`).

- Added frontend test coverage in `src/app/components/activities-page/rows/ActivityRows.test.tsx`:
  - Added assertion for `uploaded_with_conflict` rendering.

## Validation
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx` ✅
- `npm run typecheck` ✅
- `npx eslint convex/comments.ts convex/files.ts convex/tasks.ts src/app/components/activities-page/ActivityRowShell.tsx src/app/components/activities-page/rows/FileActivityRow.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx` ✅
