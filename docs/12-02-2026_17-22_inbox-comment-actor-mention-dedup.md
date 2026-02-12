# Inbox comment actor mention dedup

## Date
- 12-02-2026 17:22

## Goal
Remove duplicate actor mention rendering under the created-at/meta area for inbox `comment_added` activities when the snippet is only the same actor mention already shown in the title.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/rows/CollaborationActivityRow.tsx`:
  - parses comment snippet mention tokens via `parseMentionToken`.
  - compares snippet user-mention label with actor label using `sanitizeMentionLabel`.
  - suppresses snippet rendering only when all are true:
    - `mentionMode === "inbox"`
    - `action === "comment_added"`
    - snippet is a user mention token
    - snippet user matches the actor mention shown in the title.
  - keeps normal snippet rendering for all other cases.

- Updated `/Users/nick/Designagency/src/app/components/activities-page/rows/ActivityRows.test.tsx`:
  - added test ensuring actor mention is rendered once (title only) when message is `@[user:<actor>]`.
  - kept mention-click behavior validation.

## Behavior change
- Inbox `comment_added` rows no longer show the same actor mention twice (title + snippet/meta area).
- Comment snippets continue to render for non-duplicate content.

## Validation
- `npx eslint src/app/components/activities-page/rows/CollaborationActivityRow.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx` ✅
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
