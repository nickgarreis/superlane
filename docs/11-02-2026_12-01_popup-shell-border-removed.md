# Popup Shell Border Removed

**Date:** 11-02-2026 12:01

## Summary
Removed the outer shell border from shared popup chrome so popups no longer render a container border.

## Changes
- Updated `/Users/nick/Designagency/src/app/components/popup/popupChrome.ts`:
  - Changed `POPUP_SHELL_BORDER_CLASS` to remove `border border-bg-surface`.
  - Preserved positioning, z-index, pointer event behavior, and inherited rounding so layout/interaction remain unchanged.

## Impacted Popups
This shared class is used by popup shells such as:
- Search popup
- Create project popup
- Feedback popup (including report bug)
- Settings popup
- Create workspace popup
- Completed projects popup

## Validation
- Ran `npm run test:frontend -- src/app/components/SearchPopup.test.tsx src/app/components/FeedbackPopup.test.tsx src/app/components/create-project-popup/CreateProjectWizardDialog.test.tsx src/app/components/SettingsPopup.test.tsx`.
- Result: pass.
