# Activity record hover effect removed

## Date
- 12-02-2026 16:56

## Goal
Remove hover effect for activity records.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/activityChrome.ts`:
  - changed `ACTIVITY_ROW_BASE_CLASS` from `... py-5 transition-colors hover:bg-surface-hover-subtle` to `... py-5`

## Behavior change
- Activity records no longer change background on hover.

## Validation
- `npx eslint src/app/components/activities-page/activityChrome.ts` ✅
