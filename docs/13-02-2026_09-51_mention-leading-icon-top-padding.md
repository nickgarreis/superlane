# Mention leading icon top padding adjustment

## Date
- 13-02-2026 09:51

## Goal
Add a small top inset to the leading mention visual (task/file icon or user profile initials) so wrapped mention badges have cleaner top spacing.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/mentions/renderCommentContent.tsx`:
  - wrapped the leading mention visual in a shared container with `shrink-0 pt-[2px]`.
  - applies to all mention types (`task`, `file`, `user`) consistently.
  - preserved top alignment (`items-start`), wrapping behavior (`break-words`), and click/pulse behavior.

- Updated `/Users/nick/Designagency/src/app/components/MentionTextarea.test.tsx`:
  - extended wrap-safe mention test to assert the leading visual wrapper contains `shrink-0 pt-[2px]`.

- Updated `/Users/nick/Designagency/src/app/components/activities-page/rows/ActivityRows.test.tsx`:
  - extended inbox long-name mention test to assert the leading visual wrapper contains `shrink-0 pt-[2px]`.

## Validation
- `npx vitest run src/app/components/MentionTextarea.test.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
- `npx eslint src/app/components/mentions/renderCommentContent.tsx src/app/components/MentionTextarea.test.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx` ✅
