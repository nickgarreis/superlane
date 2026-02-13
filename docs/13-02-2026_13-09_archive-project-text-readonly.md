# Archive project headline/description read-only

## Date
- 13-02-2026 13:09

## Goal
- Ensure archived project headline and description are not editable.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/main-content/ProjectOverview.tsx`:
  - Tightened inline text edit eligibility from `project.archived || project.status.label === "Active"` to `!project.archived && project.status.label === "Active"`.
  - Result: archived projects now render project name/description as non-editable content.

- Updated `/Users/nick/Designagency/src/app/components/MainContent.test.tsx`:
  - Replaced the archive-detail editable expectation with a non-editable regression test.
  - Added assertions that both archive headline and description have `contenteditable="false"` and do not trigger `updateProject` on input/blur.

## Validation
- `npm run test:frontend -- src/app/components/MainContent.test.tsx` ✅
- `npx eslint src/app/components/main-content/ProjectOverview.tsx src/app/components/MainContent.test.tsx` ✅
