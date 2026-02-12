# Remove activity context line labels

## Date
- 12-02-2026 16:34

## Goal
Remove remaining context label strings like `Task: define the site layout` from activity rows.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`:
  - removed rendering of the additional context line (`Label: value • Label: value`)
  - activity rows now show title/meta, optional important pill, and any explicit row message content only

- Updated `/Users/nick/Designagency/src/app/components/activities-page/rows/ActivityRows.test.tsx`:
  - adjusted workspace/org assertions that previously expected `From:/To:/Imported:/Synced:/Removed:` context labels

## Behavior change
- Context strings like `Task: ...` are no longer displayed in activity records.

## Validation
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
- `npx eslint src/app/components/activities-page/ActivityRowShell.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx` ✅
