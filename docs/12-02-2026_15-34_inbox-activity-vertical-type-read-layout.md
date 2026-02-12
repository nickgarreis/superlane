# Inbox activity vertical type/read layout

## Date
- 12-02-2026 15:34

## Goal
Stack activity description content, type, and "Mark read" action vertically within each inbox row instead of placing type/read controls side-by-side on the right.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`:
  - moved type badge and unread "Mark read" button into a vertical block under the row content
  - removed the right-side type/read control placement

- Updated `/Users/nick/Designagency/src/app/components/activities-page/activityChrome.ts`:
  - changed `ACTIVITY_KIND_BADGE_BASE_CLASS` from right-column alignment styles to inline badge styles for in-flow vertical rendering

- Updated `/Users/nick/Designagency/src/app/components/InboxSidebarPanel.tsx`:
  - removed side-column "Type" header, keeping a single "Activity" list header that matches stacked row content

## Validation
- `npx eslint src/app/components/activities-page/activityChrome.ts src/app/components/activities-page/ActivityRowShell.tsx src/app/components/InboxSidebarPanel.tsx` ✅
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
