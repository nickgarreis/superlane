# Sidebar button stroke fade removed

## Date
- 12-02-2026 16:06

## Goal
Remove the color-fade effect from the top separator strokes around the `Drafts & pending projects` and `Completed` rows in the sidebar.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/sidebar/SidebarProjectsSection.tsx`:
  - replaced gradient divider class above the draft/pending row with a solid subtle border color (`bg-border-subtle-soft`)
  - replaced gradient divider class between draft/pending and completed rows with the same solid subtle border color (`bg-border-subtle-soft`)

## Validation
- `npx eslint src/app/components/sidebar/SidebarProjectsSection.tsx` ✅
- `npm test -- src/app/components/sidebar/SidebarProjectsSection.test.tsx` ✅
