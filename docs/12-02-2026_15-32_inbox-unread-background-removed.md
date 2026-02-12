# Inbox unread background removed

## Date
- 12-02-2026 15:32

## Goal
Remove the unread activity row background highlight while preserving unread affordances.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`:
  - removed `bg-accent-soft-bg` from unread row styling
  - kept unread left accent rail (`border-l-2`) and unread dot indicator unchanged

## Validation
- `npx eslint src/app/components/activities-page/ActivityRowShell.tsx` ✅
