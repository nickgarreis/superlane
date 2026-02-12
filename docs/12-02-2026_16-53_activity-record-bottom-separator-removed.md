# Activity record bottom separator removed

## Date
- 12-02-2026 16:53

## Goal
Remove the bottom stroke that separates activity records in the inbox activity list.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/activityChrome.ts`:
  - removed `border-b border-border-subtle-soft` from `ACTIVITY_ROW_BASE_CLASS`
  - kept row spacing and hover styling unchanged

## Behavior change
- Activity records no longer show a bottom separator line between rows.

## Validation
- `npx eslint src/app/components/activities-page/activityChrome.ts` ✅
