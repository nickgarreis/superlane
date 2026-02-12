# Inbox mark-read icon top-right

## Date
- 12-02-2026 15:37

## Goal
Make the unread "Mark read" control icon-only and position it at the top-right of each activity row.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`:
  - replaced text button with icon-only button using `Check` icon
  - added accessibility labels (`aria-label="Mark read"`, `title="Mark read"`)
  - positioned unread action button at row top-right via absolute positioning
  - kept type badge in the vertical content flow
  - added conditional right padding to content (`pr-10`) when unread action button is present to avoid overlap

## Validation
- `npx eslint src/app/components/activities-page/ActivityRowShell.tsx src/app/components/InboxSidebarPanel.test.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx` ✅
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
