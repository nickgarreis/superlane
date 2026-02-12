# Inbox activity remove user profile display

## Date
- 12-02-2026 15:35

## Goal
Remove displayed user profile information from inbox activity rows.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`:
  - removed avatar/profile visual block from each activity row
  - kept row content, type badge, and unread controls intact

- Updated `/Users/nick/Designagency/src/app/components/activities-page/activityFormatting.ts`:
  - changed row meta text to show only relative time
  - removed `By {actor}` attribution in the rendered inbox row metadata

## Validation
- `npx eslint src/app/components/activities-page/ActivityRowShell.tsx src/app/components/activities-page/activityFormatting.ts src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
