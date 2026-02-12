# Activity context tags moved to description text

## Date
- 12-02-2026 16:29

## Goal
Remove activity context tags/chips (for example, `Task Design all components`) and keep all context info inside the row description/message area.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`:
  - replaced context-item chip rendering with a plain description line
  - context now renders as inline text format: `Label: value • Label: value`
  - removed bordered/background tag visuals from activity rows

- Updated `/Users/nick/Designagency/src/app/components/activities-page/rows/ActivityRows.test.tsx`:
  - adjusted assertions for inline context text (`From:`, `To:`, `Imported:`, `Synced:`, `Removed:`)

## Behavior change
- Activity rows no longer show context as tag-like badges.
- All context values are shown as readable inline description/message text.

## Validation
- `npx vitest run src/app/components/activities-page/rows/ActivityRows.test.tsx src/app/components/InboxSidebarPanel.test.tsx` ✅
- `npx eslint src/app/components/activities-page/ActivityRowShell.tsx src/app/components/activities-page/rows/ActivityRows.test.tsx` ✅
