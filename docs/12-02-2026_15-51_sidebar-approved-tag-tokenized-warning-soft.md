# Sidebar approved tag tokenized warning soft style

## Date
- 12-02-2026 15:51

## Goal
Remove hardcoded color values from the sidebar `Approved` tag and use the existing design token system for text, background, and border.

## What changed
- Updated `/Users/nick/Designagency/src/styles/theme.css`:
  - added new utility `tone-warning-soft` using token variables only:
    - `color: var(--text-tone-warning)`
    - `border-color: var(--activity-collaboration-border)`
    - `background-color: var(--activity-collaboration-bg)`

- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarItem.tsx`:
  - replaced hardcoded hex+opacity classes on the `Approved` tag with token utility:
    - from `txt-tone-warning border-[#f59e0b]/35 bg-[#f59e0b]/12`
    - to `tone-warning-soft border`

## Validation
- `npm run test -- src/app/components/sidebar/SidebarProjectsSection.test.tsx src/app/components/Sidebar.test.tsx` ✅

