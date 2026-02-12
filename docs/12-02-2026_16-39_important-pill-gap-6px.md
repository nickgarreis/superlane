# Important pill gap set to 6px

## Date
- 12-02-2026 16:39

## Goal
Set the gap between created-at metadata text and the `Important` tag to 6px.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`:
  - changed meta row spacing from `gap-2` (8px) to `gap-1.5` (6px)

## Behavior change
- The spacing between created-at text and `Important` pill is now 6px.

## Validation
- `npx eslint src/app/components/activities-page/ActivityRowShell.tsx` ✅
