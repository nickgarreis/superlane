# Activity record hover effect removed

## Date
- 12-02-2026 16:27

## Goal
Remove the hover effect from activity records.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/activityChrome.ts`:
  - removed the row hover background class from `ACTIVITY_ROW_BASE_CLASS`
  - row class no longer applies `hover:bg-surface-hover-subtle`

## Behavior change
- Activity records no longer change background color on hover.

## Validation
- `npx eslint src/app/components/activities-page/activityChrome.ts` ✅
