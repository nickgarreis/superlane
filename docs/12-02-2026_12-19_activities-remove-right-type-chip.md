# Activities: remove right-side type chip/column

**Date:** 12-02-2026 12:19

## What changed
- Removed the right-side activity type element from each activity row.
- Removed the corresponding `Type` table header column so layout stays clean/aligned.
- Kept the rest of the flat table styling (separator rows, no card backgrounds, no rounded row blocks).

## Files updated
- `src/app/components/activities-page/ActivityRowShell.tsx`
- `src/app/components/activities-page/ActivitiesView.tsx`
- `src/app/components/activities-page/activityChrome.ts`

## Validation
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/Activities.test.tsx` ✅
- `npx eslint src/app/components/activities-page/ActivityRowShell.tsx src/app/components/activities-page/ActivitiesView.tsx src/app/components/activities-page/activityChrome.ts` ✅
