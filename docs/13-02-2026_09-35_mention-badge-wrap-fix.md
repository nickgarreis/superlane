# Mention badge wrap fix for long activity labels

## Date
- 13-02-2026 09:35

## Goal
Prevent long task/project/user mention labels from overflowing activity records by introducing aggressive line-break behavior in shared mention badges.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/mentions/renderCommentContent.tsx`:
  - removed `whitespace-nowrap` from mention badge root.
  - added `max-w-full min-w-0` on mention badge root so badges can shrink inside constrained containers.
  - added `min-w-0 break-all [overflow-wrap:anywhere]` on mention label text so long unspaced tokens can wrap.
  - preserved click handling, pulse animation class toggling, and mention type icon/initial rendering.

- Updated `/Users/nick/Designagency/src/app/components/MentionTextarea.test.tsx`:
  - added regression test `renders long mention labels with wrap-safe classes`.
  - verifies long mention labels include `break-all`, `min-w-0`, and `[overflow-wrap:anywhere]`.
  - verifies mention badge container includes `max-w-full min-w-0`.

- Updated `/Users/nick/Designagency/src/app/components/activities-page/rows/ActivityRows.test.tsx`:
  - added regression test `uses wrap-safe mention classes for long inbox project titles`.
  - verifies inbox mention-mode project title mentions use the same wrap-safe classes.

## Validation
- `npx vitest run src/app/components/MentionTextarea.test.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
- `npx eslint src/app/components/mentions/renderCommentContent.tsx src/app/components/MentionTextarea.test.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx` ✅
