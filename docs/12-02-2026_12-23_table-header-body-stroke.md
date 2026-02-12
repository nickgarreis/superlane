# Add header/body stroke to Tasks, Archive, and Activities tables

**Date:** 12-02-2026 12:23

## What changed
- Added a separator stroke between table header and body in Tasks by adding a bottom border to `ProjectTaskTableHeader`.
- Added a separator stroke between table header and body in Archive by adding a bottom border to the archive table header row.
- Added a separator stroke between table header and body in Activities by adding a bottom border to the activities table header row.

## Files updated
- `src/app/components/project-tasks/ProjectTaskTableHeader.tsx`
- `src/app/components/ArchivePage.tsx`
- `src/app/components/activities-page/ActivitiesView.tsx`

## Validation
- `npx vitest run src/app/components/ArchivePage.test.tsx src/app/components/Activities.test.tsx src/app/components/ProjectTasks.test.tsx` ✅
- `npx eslint src/app/components/project-tasks/ProjectTaskTableHeader.tsx src/app/components/ArchivePage.tsx src/app/components/activities-page/ActivitiesView.tsx` ✅
