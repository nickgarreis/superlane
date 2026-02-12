# Inbox trash hover effect token fix

## Date
- 12-02-2026 16:59

## Goal
Fix missing hover feedback on inbox activity-row trash button while keeping styling token-based and aligned with file table row actions.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/ui/controlChrome.ts`:
  - changed `TABLE_ACTION_ICON_BUTTON_DANGER_HOVER_CLASS` from `hover:bg-popup-danger-soft hover:txt-tone-danger` to `hover:bg-popup-danger-soft-strong hover:text-text-tone-danger`
  - changed `TABLE_ACTION_ICON_BUTTON_SUCCESS_HOVER_CLASS` from `hover:bg-status-completed-soft hover:txt-tone-success` to `hover:bg-status-completed-soft hover:text-text-tone-success`

## Behavior change
- Inbox activity trash button now shows a clear red icon + soft red background on hover.
- File table row trash button uses the same shared token class path, so hover behavior remains in parity.

## Validation
- `npx eslint src/app/components/ui/controlChrome.ts src/app/components/activities-page/ActivityRowShell.tsx src/app/components/main-content/MainContentFileRows.tsx` ✅
- `npx vitest run src/app/components/InboxSidebarPanel.test.tsx src/app/components/MainContent.test.tsx` ✅
