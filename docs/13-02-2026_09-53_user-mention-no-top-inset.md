# User mention leading visual excludes top inset

## Date
- 13-02-2026 09:53

## Goal
Keep the `2px` top inset for task/file icons, but do not apply that inset to user mention profile initials.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/mentions/renderCommentContent.tsx`:
  - added `hasIconTopInset = isTask || isFile`.
  - changed leading visual wrapper class to `cn("shrink-0", hasIconTopInset ? "pt-[2px]" : undefined)`.
  - result: task/file mentions keep `pt-[2px]`; user mentions render without it.

- Updated `/Users/nick/Designagency/src/app/components/MentionTextarea.test.tsx`:
  - added regression test `does not apply top icon padding to user mentions`.
  - verifies user mention leading visual includes `shrink-0` and excludes `pt-[2px]`.

## Validation
- `npx vitest run src/app/components/MentionTextarea.test.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
- `npx eslint src/app/components/mentions/renderCommentContent.tsx src/app/components/MentionTextarea.test.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx` ✅
