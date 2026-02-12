# Activity records horizontal inner padding removed

## Date
- 12-02-2026 16:47

## Goal
Remove left and right inner padding from activity records in the inbox activities list.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/activityChrome.ts`:
  - changed `ACTIVITY_ROW_BASE_CLASS` from `... px-4 py-5 ...` to `... py-5 ...`
  - this removes horizontal (`left/right`) inner padding from all activity record rows that use `ActivityRowShell`

## Behavior change
- Activity records no longer have built-in left/right inner spacing.
- Record content now aligns flush to the row container edges horizontally.

## Validation
- `npx eslint src/app/components/activities-page/activityChrome.ts` ✅
