# Inbox activity record divider strokes removed

## Date
- 12-02-2026 16:04

## Goal
Remove the top/bottom separator strokes between activity records.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/activityChrome.ts`:
  - removed row divider classes (`border-b border-border-subtle-soft`) from `ACTIVITY_ROW_BASE_CLASS`
  - activity records are now separated by spacing only, without horizontal stroke separators

## Validation
- `npx eslint src/app/components/activities-page/activityChrome.ts` ✅
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
