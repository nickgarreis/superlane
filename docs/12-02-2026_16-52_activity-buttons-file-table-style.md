# Activity action buttons aligned to file table style

## Date
- 12-02-2026 16:52

## Goal
Make inbox activity `Mark read` and `Delete` buttons match the visual design language used by file table action buttons.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/ui/controlChrome.ts`:
  - added shared table-action icon button tokens:
    - `TABLE_ACTION_ICON_BUTTON_CLASS`
    - `TABLE_ACTION_ICON_BUTTON_SUCCESS_HOVER_CLASS`
    - `TABLE_ACTION_ICON_BUTTON_DANGER_HOVER_CLASS`
- Updated `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`:
  - replaced filled icon button classes on `Mark read` and `Dismiss activity` with the new table-action token classes.
- Updated `/Users/nick/Designagency/src/app/components/main-content/MainContentFileRows.tsx`:
  - switched file remove action buttons (virtualized and non-virtualized rows) to the same shared table-action token classes.

## Behavior change
- Activity row action buttons now visually match file table action buttons:
  - subtle icon-first base style
  - success/danger hover states
  - consistent size, radius, and transitions
- File table remove action now uses the same shared tokenized class source as activity actions.

## Validation
- `npx eslint src/app/components/ui/controlChrome.ts src/app/components/activities-page/ActivityRowShell.tsx src/app/components/main-content/MainContentFileRows.tsx` ✅
- `npx vitest run src/app/components/InboxSidebarPanel.test.tsx src/app/components/MainContent.test.tsx` ✅
