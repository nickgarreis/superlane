# Inbox trash hover token parity with file rows

## Date
- 12-02-2026 16:55

## Goal
Ensure inbox activity-row trash button uses the same hover logic as file-table row trash button (red icon + soft red background) using tokens only.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/ui/controlChrome.ts`:
  - added composed shared tokens:
    - `TABLE_ACTION_ICON_BUTTON_SUCCESS_CLASS`
    - `TABLE_ACTION_ICON_BUTTON_DANGER_CLASS`
  - both compose existing base/hover tokens; no hardcoded colors added.
- Updated `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`:
  - `Mark read` now uses `TABLE_ACTION_ICON_BUTTON_SUCCESS_CLASS`
  - `Dismiss activity` (trash) now uses `TABLE_ACTION_ICON_BUTTON_DANGER_CLASS`
- Updated `/Users/nick/Designagency/src/app/components/main-content/MainContentFileRows.tsx`:
  - file row remove button now uses `TABLE_ACTION_ICON_BUTTON_DANGER_CLASS` in both virtualized and non-virtualized paths.

## Behavior change
- Inbox trash hover behavior is now guaranteed identical to file table trash hover behavior through one shared danger button token class.

## Validation
- `npx eslint src/app/components/ui/controlChrome.ts src/app/components/activities-page/ActivityRowShell.tsx src/app/components/main-content/MainContentFileRows.tsx` ✅
- `npx vitest run src/app/components/InboxSidebarPanel.test.tsx src/app/components/MainContent.test.tsx` ✅
