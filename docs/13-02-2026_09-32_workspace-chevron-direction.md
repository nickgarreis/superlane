# Workspace dropdown chevron direction updated

## Date
- 13-02-2026

## Goal
Make the workspace dropdown chevron point upward when closed and downward when open.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarWorkspaceSwitcher.tsx`:
  - changed icon import from `ChevronDown` to `ChevronUp`.
  - kept the open-state transform `rotate-180`, which now flips the up icon downward when the dropdown is open.

## Validation
- `npx vitest run src/app/components/Sidebar.test.tsx` ✅
