# Activities: remove avatar-adjacent letter circle, restore type column

**Date:** 12-02-2026 12:22

## What changed
- Re-added the right-side activity type component and the `Type` header column.
- Removed the small letter-in-circle activity icon next to the user avatar in each activity row.
- Simplified row component props by removing `iconLabel` usage across all activity row renderers.

## Files updated
- `src/app/components/activities-page/ActivityRowShell.tsx`
- `src/app/components/activities-page/ActivitiesView.tsx`
- `src/app/components/activities-page/activityChrome.ts`
- `src/app/components/activities-page/rows/ProjectActivityRow.tsx`
- `src/app/components/activities-page/rows/TaskActivityRow.tsx`
- `src/app/components/activities-page/rows/CollaborationActivityRow.tsx`
- `src/app/components/activities-page/rows/FileActivityRow.tsx`
- `src/app/components/activities-page/rows/MembershipActivityRow.tsx`
- `src/app/components/activities-page/rows/WorkspaceActivityRow.tsx`

## Validation
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/Activities.test.tsx` ✅
- `npx eslint src/app/components/activities-page/ActivityRowShell.tsx src/app/components/activities-page/ActivitiesView.tsx src/app/components/activities-page/activityChrome.ts src/app/components/activities-page/rows/ProjectActivityRow.tsx src/app/components/activities-page/rows/TaskActivityRow.tsx src/app/components/activities-page/rows/CollaborationActivityRow.tsx src/app/components/activities-page/rows/FileActivityRow.tsx src/app/components/activities-page/rows/MembershipActivityRow.tsx src/app/components/activities-page/rows/WorkspaceActivityRow.tsx` ✅
