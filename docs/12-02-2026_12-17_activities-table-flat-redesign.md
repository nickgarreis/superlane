# Activities table flat redesign

**Date:** 12-02-2026 12:17

## What changed
- Redesigned Activities list container and rows to match the flat table style used in Tasks/Archive.
- Removed card-like row presentation:
  - no per-row background blocks,
  - no rounded row corners,
  - no separated row gaps.
- Switched to separator-based table structure:
  - list now uses a top border + row dividers,
  - added table-style header row (`Activity` / `Type`).
- Updated activity type label presentation to align as a right-side column (instead of pill-style badges).
- Flattened task-specific activity details (`due_date_changed`, `assignee_changed`) to inline textual metadata (no inner rounded/background cards).

## Files updated
- `src/app/components/activities-page/activityChrome.ts`
- `src/app/components/activities-page/ActivityRowShell.tsx`
- `src/app/components/activities-page/ActivitiesView.tsx`
- `src/app/components/activities-page/rows/TaskActivityRow.tsx`

## Validation
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/Activities.test.tsx` ✅
- `npx eslint src/app/components/activities-page/ActivityRowShell.tsx src/app/components/activities-page/ActivitiesView.tsx src/app/components/activities-page/activityChrome.ts src/app/components/activities-page/rows/TaskActivityRow.tsx` ✅
