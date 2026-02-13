# Sidebar dropdown hover background removed

## Date
- 13-02-2026

## Goal
Remove the gray hover background effect from the sidebar workspace dropdown trigger and sidebar user dropdown trigger.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/sidebar/sidebarChrome.ts`:
  - removed `hover:bg-control-surface-muted` from `SIDEBAR_PILL_TRIGGER_INTERACTIVE_CLASS`.
  - this class is used only by:
    - `SidebarWorkspaceSwitcher` (workspace dropdown trigger)
    - `SidebarProfileMenu` (user/profile dropdown trigger)

## Validation
- `npx vitest run src/app/components/Sidebar.test.tsx src/app/components/sidebar/SidebarProfileMenu.test.tsx` ✅
