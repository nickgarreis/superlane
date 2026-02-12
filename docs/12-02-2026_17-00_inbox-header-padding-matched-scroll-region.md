# Inbox header horizontal padding matched to scroll region

## Date
- 12-02-2026 17:00

## Goal
Make the inbox header (close button/title area) use the same inner left/right padding as `inbox-scroll-region`.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/InboxSidebarPanel.tsx`:
  - changed header container class from `px-4` to `px-6`
  - this now matches `inbox-scroll-region` horizontal padding (`px-6`)

## Behavior change
- Inbox header content aligns with the scroll region content horizontally.

## Validation
- `npx eslint src/app/components/InboxSidebarPanel.tsx` ✅
- `npx vitest run src/app/components/InboxSidebarPanel.test.tsx` ✅
