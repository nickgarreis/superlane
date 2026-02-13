# Mention icon top alignment for multi-line labels

## Date
- 13-02-2026 09:47

## Goal
When mention labels wrap to two lines, keep the leading icon/profile initials aligned to the top instead of vertically centered.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/mentions/renderCommentContent.tsx`:
  - changed mention badge root alignment from `items-center` to `items-start`.
  - this keeps the leading task/file icon or user initials pinned to the top edge of wrapped mention text.

- Updated `/Users/nick/Designagency/src/app/components/MentionTextarea.test.tsx`:
  - wrap-safe mention test now asserts badge root includes `items-start` and excludes `items-center`.

- Updated `/Users/nick/Designagency/src/app/components/activities-page/rows/ActivityRows.test.tsx`:
  - inbox long-name mention test now asserts badge root includes `items-start` and excludes `items-center`.

## Validation
- `npx vitest run src/app/components/MentionTextarea.test.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
- `npx eslint src/app/components/mentions/renderCommentContent.tsx src/app/components/MentionTextarea.test.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx` ✅
