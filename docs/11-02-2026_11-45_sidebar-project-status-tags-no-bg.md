# Sidebar Project Status Tags: No Background / No Border

**Date:** 11-02-2026 11:45

## Summary
Updated the sidebar project status tags for draft and review items to use the requested minimal style: inline-flex, 19px height, vertical-only padding, centered content, and no badge background/border.

## Changes
- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarItem.tsx`:
  - Draft tag classes now use: `inline-flex`, `h-[19px]`, `py-[2px]`, `items-center`.
  - Review tag classes now use: `inline-flex`, `h-[19px]`, `py-[2px]`, `items-center`.
  - Removed visual badge treatment (`bg-*`, rounded pill treatment).
  - Updated draft label text from `Continue` to `Draft` to match status naming.

## Validation
- Ran `npm run test:frontend -- src/app/components/sidebar/SidebarProjectsSection.test.tsx` (pass).
