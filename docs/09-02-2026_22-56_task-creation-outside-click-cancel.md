# Task Creation Row: Outside Click Cancels Draft

**Date:** 09-02-2026 22:56

## Summary

Updated task creation so clicking anywhere outside the task creation row abandons creation and clears the draft title.

## Changes

### `/Users/nick/Designagency/src/app/components/ProjectTasks.tsx`
- Added a shared `handleCancelAddTask` callback that clears `newTaskTitle` and exits adding mode.
- Added `addTaskRowRef` and a `pointerdown` document listener while `isAdding` is true.
- Outside-row pointer interactions now call `handleCancelAddTask`.
- Attached the ref to the add-row container (`motion.div`).
- Updated `Escape` handling to reuse `handleCancelAddTask`.
- Removed the input `onBlur` conditional close behavior.

## Validation

- `npx eslint src/app/components/ProjectTasks.tsx` ✅
- `npm run test:frontend` ❌ (existing workspace-level test environment issue unrelated to this change)
  - Failed to resolve `figma:asset/...png` import from `/Users/nick/Designagency/src/app/components/ProjectLogo.tsx` during `CreateProjectWizardDialog.test.tsx` setup.
