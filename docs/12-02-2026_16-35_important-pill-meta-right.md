# Important pill moved to meta row right side

## Date
- 12-02-2026 16:35

## Goal
Place the `Important` tag to the right of the created-at/meta part of activity rows.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`:
  - removed `Important` pill from the title line
  - moved `Important` pill into the meta row
  - meta row is now a flex container; pill uses `ml-auto` so it appears on the right of the created-at text

## Behavior change
- `Important` now appears on the same line as created-at metadata, aligned to the right.

## Validation
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
- `npx eslint src/app/components/activities-page/ActivityRowShell.tsx` ✅
