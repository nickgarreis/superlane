# Task Table Alignment & Dropdown Z-Index Fix

**Date:** 09-02-2026 22:15

## Problems

1. **Column misalignment** — The header columns (Project, Due Date, Assignee) did not align with the corresponding row columns. The delete button in task rows had no fixed width (`p-1.5` padding = ~26px) while the header spacer was `w-7` (28px), causing a 2px offset across all right-side columns.

2. **Dropdown clipping** — The due date picker, user selection, and project selection dropdowns were being cut off by subsequent task rows. Two root causes:
   - `content-visibility: auto` on `.project-task-row` in `theme.css` applied CSS containment (`contain: layout style paint`) which clips overflow, preventing dropdowns from rendering outside their row bounds.
   - Sibling task rows painted over dropdowns from earlier rows because no z-index elevation was applied to the row with the active dropdown.

## Changes

### `src/app/components/ProjectTasks.tsx`
- Wrapped the delete button in a `w-7` container div to match the header spacer width, ensuring all right-side columns align precisely.
- Added dynamic `z-50` class to task rows that have an open dropdown (calendar, assignee, or project), so their absolutely-positioned dropdowns render above sibling rows.
- Changed the `.map()` callback from implicit return to block body to support the `hasOpenDropdown` variable.

### `src/styles/theme.css`
- Removed `.project-task-row` from the `content-visibility: auto` rule. This CSS property creates paint containment that clips dropdown overflow. File rows and chat rows still benefit from the optimization.

## Validation
- `npm run build` passes cleanly.
