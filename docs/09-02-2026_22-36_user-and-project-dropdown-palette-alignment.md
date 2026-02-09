# User and Project Dropdown Palette Alignment

**Date:** 09-02-2026 22:36

## Summary

Updated user and project dropdown colors to match the calendar dropdown palette, without changing layout, spacing, interactions, or behavior.

## Changes

### `/Users/nick/Designagency/src/app/components/ProjectTasks.tsx`
- Updated color tokens for all project dropdown variants (new-task selector and task-row project selector):
  - Dropdown panel background to `rgba(30,31,32,0.98)`.
  - Dropdown border to `rgba(232,232,232,0.12)`.
  - Muted label text to `rgba(232,232,232,0.44)`.
  - Hover/active row background to `rgba(232,232,232,0.08)`.
  - Placeholder dot color to `rgba(232,232,232,0.22)`.
- Updated user (assignee) dropdown colors to the same palette:
  - Same panel background and border.
  - Same muted label/no-data text color.
  - Same hover/selected row background.
- Updated assignee selected check icon color from blue to red (`#ef4444`) to align with the shared accent used in the calendar selection state.

## Validation

- `npm run lint` ✅
- `npm run typecheck` ✅
