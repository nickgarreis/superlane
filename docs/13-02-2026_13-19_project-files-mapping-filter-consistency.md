# Project files mapping/filter consistency

## Date
- 13-02-2026 13:19

## Goal
- Make `buildProjectFilesByProject` apply the same mapping+filtering behavior for cached and active project file sources.

## What changed
- Updated `/Users/nick/Designagency/src/app/dashboard/useDashboardData.helpers.ts`:
  - Added a local helper `mapProjectFilesForProject(projectId, files)` that maps with `mapWorkspaceFilesToUi(files)` and filters by `file.projectPublicId === projectId`.
  - Switched both code paths to use the same helper:
    - cached entries loop (`cachedProjectFiles`)
    - active project assignment (`activeProjectPublicId` + `activeProjectFilesSource`)
- This removes the previous inconsistency where cached path filtered but active path did not.

## Validation
- `npm run test:frontend -- src/app/dashboard/useDashboardData.test.tsx` ✅
