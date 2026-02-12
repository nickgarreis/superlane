# Remove top stroke above Tasks and Activities table headers

**Date:** 12-02-2026 12:24

## What changed
- Removed the top border on the Tasks table wrapper so there is no stroke above the header row.
- Removed the top border on the Activities table wrapper so there is no stroke above the header row.
- Kept the header-to-body separator stroke in both tables.

## Files updated
- `src/app/components/ProjectTasks.tsx`
- `src/app/components/activities-page/ActivitiesView.tsx`

## Validation
- `npx vitest run src/app/components/ProjectTasks.test.tsx src/app/components/Activities.test.tsx` ✅
- `npx eslint src/app/components/ProjectTasks.tsx src/app/components/activities-page/ActivitiesView.tsx` ✅
