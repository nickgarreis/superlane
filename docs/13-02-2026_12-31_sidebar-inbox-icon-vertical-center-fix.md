# Sidebar inbox icon vertical centering fix

## Date
- 13-02-2026 12:31

## Goal
- Restore vertical centering of the sidebar Inbox icon after adding the unread dot on the icon corner.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarPrimaryActions.tsx`:
  - Replaced the Inbox icon wrapper from `span` with `inline-flex` to a block-level `div` with `flex` layout.
  - Added `leading-none` on the icon wrapper to remove baseline line-height offset.
  - Kept unread dot absolute positioning unchanged (`-top-0.5 -right-0.5`).

## Validation
- `npm run test:frontend -- src/app/components/sidebar/SidebarPrimaryActions.test.tsx src/app/components/Sidebar.test.tsx` ✅
- `npx eslint src/app/components/sidebar/SidebarPrimaryActions.tsx` ✅
