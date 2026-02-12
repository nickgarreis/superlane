# Task activity row redesign (due date focus)

**Date:** 12-02-2026 11:51

## What changed
- Redesigned the `task` activity record component in `src/app/components/activities-page/rows/TaskActivityRow.tsx` with a deeper focus on `due_date_changed` events.
- Replaced raw epoch-based due date copy with structured, human-readable schedule details:
  - clear task identity,
  - before/after due date panels,
  - shift summary (`Moved X days later/earlier`, `Added/Removed due date`),
  - urgency badge (`Overdue`, `Due today`, `Due tomorrow`, etc.).
- Improved `assignee_changed` readability with a compact “from → to” detail panel.
- Updated task row action titles to be clearer for schedule/assignee/project-move events.

## Why
- The previous `due_date_changed` UI exposed raw timestamp strings in the title and did not help users quickly understand scheduling impact.
- This redesign optimizes scanability and decision-making by surfacing the exact schedule delta and current urgency state directly in-row.

## Validation
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx` ✅
- `npx eslint src/app/components/activities-page/rows/TaskActivityRow.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx` ✅
