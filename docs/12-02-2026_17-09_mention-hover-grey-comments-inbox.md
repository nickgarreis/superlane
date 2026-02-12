# Mention hover affordance for comments and inbox

## Date
- 12-02-2026 17:09

## Goal
Add a grey hover background on clickable `@` mentions so users can clearly see they are interactive in both comments and inbox activity rows.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/mentions/renderCommentContent.tsx`:
  - refined `MentionBadge` classes in the clickable state to include:
    - `hover:bg-surface-hover-soft`
    - `active:bg-surface-active-soft`
  - added `rounded-[4px]` with small `px/py` badge padding so the hover/active background is visually clear.

## Behavior change
- Clickable mentions now show a subtle grey background on hover and a pressed grey background on active state.
- This applies to all surfaces using `renderCommentContent`, including:
  - chat comments
  - inbox activity mention titles

## Validation
- `npx eslint src/app/components/mentions/renderCommentContent.tsx` ✅
- `npx vitest run src/app/components/MentionTextarea.test.tsx src/app/components/InboxSidebarPanel.test.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx` ✅
- `npx vitest run src/app/components/MentionTextarea.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
