# Completed comments headline match tasks toolbar

## Date
- 13-02-2026 13:16

## Goal
- Make the completed comments headline use the exact same style as the Tasks header shown in completed project detail.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/main-content/CompletedProjectCommentsHistory.tsx`:
  - Changed headline class from `tracking-tight txt-role-page-title txt-tone-primary` to `txt-role-body-md font-medium txt-tone-subtle uppercase tracking-wider`.
- Root cause of prior mismatch:
  - Previous change matched the Tasks **page title** style.
  - In completed project detail, the visible Tasks heading comes from `/Users/nick/Designagency/src/app/components/project-tasks/TasksToolbar.tsx`, which uses the class above.

## Validation
- `npm run test:frontend -- src/app/components/main-content/CompletedProjectCommentsHistory.test.tsx` ✅
