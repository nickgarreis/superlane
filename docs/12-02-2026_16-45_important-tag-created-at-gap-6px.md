# Important tag created-at gap set to 6px

## Date
- 12-02-2026 16:45

## Goal
Ensure the `Important` tag in inbox activity rows is separated from the created-at metadata by only 6px.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`:
  - removed `ml-auto` from the `Important` pill
  - kept the parent meta row `gap-1.5` (6px), so the badge now sits directly next to created-at metadata with a 6px gap

## Behavior change
- `Important` is no longer pushed to the far right of the row.
- The distance between created-at metadata and `Important` is consistently 6px.

## Validation
- `npx eslint src/app/components/activities-page/ActivityRowShell.tsx` ✅
