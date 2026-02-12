# Inbox scroll region horizontal padding increased

## Date
- 12-02-2026 16:54

## Goal
Add more inner left/right padding to the inbox scroll region.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/InboxSidebarPanel.tsx`:
  - changed `inbox-scroll-region` horizontal padding from `px-4` to `px-6`
  - kept vertical padding as `py-4`

## Behavior change
- Inbox scroll content now has more left and right inner spacing.

## Validation
- `npx eslint src/app/components/InboxSidebarPanel.tsx` ✅
- `npx vitest run src/app/components/InboxSidebarPanel.test.tsx` ✅
