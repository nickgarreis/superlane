# Inbox remove unread dot indicator

## Date
- 12-02-2026 15:36

## Goal
Use only the left colored border to indicate unread activity rows and remove the unread dot marker.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`:
  - removed the unread dot element rendered before the activity title
  - kept unread left border styling unchanged

## Validation
- `npx eslint src/app/components/activities-page/ActivityRowShell.tsx` ✅
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
