# Sidebar button label top padding removal

## Date
- 13-02-2026 12:33

## Goal
- Remove the 2px top padding from text labels in sidebar buttons.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarItem.tsx`:
  - Removed `pt-0.5` from the sidebar item label span class (`txt-role-body-md ...`).
  - This affects text rendering for all sidebar item buttons that use `SidebarItem` (e.g. Search, Tasks, Archive, Inbox, Create Project, and project rows).

## Validation
- `npm run test:frontend -- src/app/components/sidebar/SidebarPrimaryActions.test.tsx src/app/components/Sidebar.test.tsx` ✅
- `npx eslint src/app/components/sidebar/SidebarItem.tsx` ✅
