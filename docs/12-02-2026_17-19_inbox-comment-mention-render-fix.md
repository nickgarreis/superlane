# Inbox comment mention rendering fix

## Date
- 12-02-2026 17:19

## Goal
Render user mentions inside inbox `Added a comment` activity descriptions with the same mention badge style used in the comments panel (instead of showing raw `@[user:...]` tokens).

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/rows/CollaborationActivityRow.tsx`:
  - added `commentSnippetContent` to branch snippet rendering by mode.
  - in `mentionMode="inbox"`, comment snippets now render through `renderCommentContent(commentSnippet, onMentionClick)`.
  - plain mode keeps existing quoted-text behavior.

- Updated `/Users/nick/Designagency/src/app/components/activities-page/rows/ActivityRows.test.tsx`:
  - added regression test for inbox collaboration `comment_added` rows where `message` contains `@[user:Nick Garreis]`.
  - verifies raw token is not rendered and mention click dispatches `onMentionClick("user", "Nick Garreis")`.

## Behavior change
- Inbox activity descriptions for comment events now display user mentions as styled mention badges (same renderer as comments panel), with proper mention click behavior.
- Raw mention token strings like `@[user:Nick Garreis]` are no longer shown in inbox comment snippets.

## Validation
- `npx eslint src/app/components/activities-page/rows/CollaborationActivityRow.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx` ✅
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
