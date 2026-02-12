# Inbox remove project context tag

## Date
- 12-02-2026 15:39

## Goal
Remove the `Project` context tag from inbox activity records.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/rows/ProjectActivityRow.tsx`:
  - removed `Project` context item from project activity row tags
- Updated `/Users/nick/Designagency/src/app/components/activities-page/rows/TaskActivityRow.tsx`:
  - removed `Project` context item from task activity row tags
- Updated `/Users/nick/Designagency/src/app/components/activities-page/rows/FileActivityRow.tsx`:
  - removed `Project` context item from file activity row tags
- Updated `/Users/nick/Designagency/src/app/components/activities-page/rows/CollaborationActivityRow.tsx`:
  - removed `Project` context item from collaboration activity row tags
- Updated `/Users/nick/Designagency/src/app/components/activities-page/rows/ActivityRows.test.tsx`:
  - removed assertion that expected the `Project` context tag text in project row rendering

## Validation
- `npx eslint src/app/components/activities-page/rows/ProjectActivityRow.tsx src/app/components/activities-page/rows/TaskActivityRow.tsx src/app/components/activities-page/rows/FileActivityRow.tsx src/app/components/activities-page/rows/CollaborationActivityRow.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx` ✅
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
