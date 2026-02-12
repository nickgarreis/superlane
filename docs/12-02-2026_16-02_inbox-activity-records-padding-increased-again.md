# Inbox activity records padding increased again

## Date
- 12-02-2026 16:02

## Goal
Add even more top and bottom inner padding to activity records.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/activityChrome.ts`:
  - increased activity row vertical padding from `py-4` to `py-5`

- Updated `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`:
  - adjusted top-right unread action icon vertical offset from `top-4` to `top-5` to align with the taller row padding

## Validation
- `npx eslint src/app/components/activities-page/activityChrome.ts src/app/components/activities-page/ActivityRowShell.tsx` ✅
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
