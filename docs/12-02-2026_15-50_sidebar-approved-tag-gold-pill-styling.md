# Sidebar approved tag gold pill styling

## Date
- 12-02-2026 15:50

## Goal
Adjust the sidebar `Approved` tag styling to include a light gold background and a matching gold stroke.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarItem.tsx`:
  - changed the `Approved` tag from plain text to a pill style with:
    - light gold background: `bg-[#f59e0b]/12`
    - gold stroke: `border border-[#f59e0b]/35`
    - rounded shape + horizontal padding: `rounded-full px-2`
  - kept `txt-tone-warning` for gold text tone consistency.

## Validation
- `npm run test -- src/app/components/sidebar/SidebarProjectsSection.test.tsx src/app/components/Sidebar.test.tsx` ✅

