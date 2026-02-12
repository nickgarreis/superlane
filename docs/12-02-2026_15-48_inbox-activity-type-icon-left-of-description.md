# Inbox activity type icon left of description

## Date
- 12-02-2026 15:48

## Goal
Display the activity type icon on the left side of each row, before the activity description/content.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`:
  - moved activity type icon badge from below the content block to the left side of the row
  - removed the old in-content type icon block
  - kept accessibility labels (`aria-label`, `title`, `sr-only`) on the icon badge
  - kept top-right unread action icon behavior unchanged

## Validation
- `npx eslint src/app/components/activities-page/ActivityRowShell.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
