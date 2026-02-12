# Inbox table top stroke removed

## Date
- 12-02-2026 16:17

## Goal
Remove the top stroke from the inbox activity table.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/InboxSidebarPanel.tsx`:
  - removed the top separator stroke from the inbox activity table header by deleting `border-b border-border-subtle-soft` from the `Activity` header row
  - removed the inbox empty-state top stroke by replacing `ACTIVITY_EMPTY_STATE_CLASS` with a local class string that has no `border-t`
  - removed the now-unused `ACTIVITY_EMPTY_STATE_CLASS` import

## Validation
- `npx eslint src/app/components/InboxSidebarPanel.tsx` ✅
- `npx vitest run src/app/components/InboxSidebarPanel.test.tsx` ✅
