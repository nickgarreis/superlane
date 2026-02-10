# Targeted Quality and Accessibility Fixes

**Date:** 10-02-2026

## Summary
Implemented the requested fixes across popup tests, wizard accessibility, file-section tooltip behavior tests, main-content highlight clearing, and task-row assignee/initials robustness.

## Changes

### 1) Feedback popup test isolation and timer cleanup
- Updated `src/app/components/FeedbackPopup.test.tsx`:
  - Added `beforeEach(() => toastSuccessMock.mockClear())` to prevent call leakage across tests.
  - Added `afterEach(() => vi.useRealTimers())` to always restore timers even if a test fails.
  - Removed in-test `vi.useRealTimers()` from the submit test.

### 2) Project name input accessibility
- Updated `src/app/components/create-project-popup/steps/StepDetailsStep2.tsx`:
  - Added a semantic label with `htmlFor` and an input `id` (`project-name`) for the project name field.
  - Kept visible label text as exactly `Project name`.

### 3) Attachment action button semantics/accessibility
- Updated `src/app/components/create-project-popup/steps/StepDetailsStep3.tsx`:
  - Added `type="button"` to Retry and Remove actions.
  - Added descriptive `aria-label`s:
    - `Retry upload for <file name>`
    - `Remove <file name>`

### 4) File tooltip test stabilization
- Updated `src/app/components/main-content/FileSection.test.tsx`:
  - Switched disabled-upload tooltip interaction from `fireEvent.click` to async `userEvent.hover(addButton)`.
  - Kept assertion that `handleUploadClick` is not called.
  - Kept tooltip text assertion and added `userEvent.unhover(addButton)` cleanup.

### 5) Pending file highlight cleanup behavior
- Updated `src/app/components/main-content/useMainContentHighlighting.ts`:
  - Ensured `onClearPendingHighlight?.()` is called for file highlights even when no matching file is found.
  - Preserved existing behavior for `setActiveTab(...)` and `setHighlightedFileId(...)` when a match exists.

### 6) Task-row assignee comparison and initials hardening
- Updated `src/app/components/project-tasks/ProjectTaskRow.tsx`:
  - Replaced duplicated selected-assignee checks with a single helper based on `member.userId` comparison.
  - Added one derived `selectedAssigneeUserId` and reused `isSelectedAssignee(member)` in all three spots.
  - Hardened `getInitials(name: string)`:
    - trims/coerces input,
    - filters empty segments,
    - builds initials from up to two parts,
    - falls back to first two chars for one-part names,
    - returns `"?"` when no usable characters are present.

### 7) Type compatibility for optional assignee id
- Updated:
  - `src/app/types.ts`
  - `src/app/lib/mappers.ts`
- Added optional `assignee.userId?: string` typing compatibility to support stable-ID-based comparisons without breaking existing data.

## Validation
- `npx vitest run src/app/components/FeedbackPopup.test.tsx src/app/components/main-content/FileSection.test.tsx src/app/components/ProjectTasks.test.tsx src/app/components/MainContent.test.tsx` ✅
- `npm run typecheck:frontend` ✅
- `npx eslint src/app/components/FeedbackPopup.test.tsx src/app/components/create-project-popup/steps/StepDetailsStep2.tsx src/app/components/create-project-popup/steps/StepDetailsStep3.tsx src/app/components/main-content/FileSection.test.tsx src/app/components/main-content/useMainContentHighlighting.ts src/app/components/project-tasks/ProjectTaskRow.tsx src/app/types.ts src/app/lib/mappers.ts` ✅
