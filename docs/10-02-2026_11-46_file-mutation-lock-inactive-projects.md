# Lock File Upload/Removal For Archived And Completed Projects

**Date:** 2026-02-10 11:46

## Summary

Restricted project file mutations so uploads and removals are blocked when a project is archived or completed. File downloads remain available.

## Changes

- **`convex/files.ts`**
  - Added file mutation lifecycle guard:
    - project must not be archived
    - project status must not be `Completed`
    - `completedAt` must be `null`
  - Enforced guard in:
    - `finalizeProjectUploadCore` (covers `finalizeProjectUpload` and deprecated `create` flow)
    - `remove`
  - Error returned when blocked:
    - `Files can only be modified for active projects`

- **`src/app/components/MainContent.tsx`**
  - Added `canMutateProjectFiles` derived state for project detail views.
  - Disabled/guarded upload trigger and file input handling when project is archived/completed.
  - Disabled/guarded file remove action in file rows when project is archived/completed.
  - Kept download action unchanged so files remain downloadable.
  - Added locked UI state + tooltip reason:
    - `Files can only be modified for active projects`

- **`convex/__tests__/file_storage.test.ts`**
  - Added regression test asserting:
    - upload blocked for completed projects
    - remove blocked for completed projects
    - upload blocked for archived projects
    - remove blocked for archived projects
    - download still works in both completed and archived states

## Validation

- `npx eslint convex/files.ts convex/__tests__/file_storage.test.ts src/app/components/MainContent.tsx` ✅
- `npm run test:backend -- convex/__tests__/file_storage.test.ts convex/__tests__/rbac.test.ts` ✅
- `npm run typecheck:frontend` ⚠️ fails due pre-existing unrelated syntax errors in `src/app/components/search-popup/useSearchPopupData.ts`
