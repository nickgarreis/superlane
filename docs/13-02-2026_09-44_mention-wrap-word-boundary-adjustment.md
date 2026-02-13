# Mention wrap adjusted to preserve whole words

## Date
- 13-02-2026 09:44

## Goal
Avoid breaking normal short words (for example, `refresh`) in the middle at line ends while still preventing overflow for long mention labels.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/mentions/renderCommentContent.tsx`:
  - changed mention label wrapping class from `break-all [overflow-wrap:anywhere]` to `break-words`.
  - kept `min-w-0` on label and `max-w-full min-w-0` on mention badge container.
  - preserved all click behavior and mention visuals.

- Updated `/Users/nick/Designagency/src/app/components/MentionTextarea.test.tsx`:
  - regression expectations now assert `break-words` and ensure `break-all` is not present.

- Updated `/Users/nick/Designagency/src/app/components/activities-page/rows/ActivityRows.test.tsx`:
  - inbox long-name mention regression now asserts `break-words` and ensures `break-all` is not present.

## Validation
- `npx vitest run src/app/components/MentionTextarea.test.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
- `npx eslint src/app/components/mentions/renderCommentContent.tsx src/app/components/MentionTextarea.test.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx` ✅
