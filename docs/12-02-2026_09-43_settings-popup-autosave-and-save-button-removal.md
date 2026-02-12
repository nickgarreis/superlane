# Settings popup auto-save and save button removal

**Date:** 12-02-2026 09:43

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.tsx`:
  - Replaced manual save flow with debounced auto-save (`700ms`) for first name, last name, and email.
  - Added lightweight auto-save status messaging (`Changes pending...`, `Auto-saving...`, `Saved`).
  - Removed the `Save Changes` button.
  - Kept avatar upload/remove actions unchanged.

- Updated `/Users/nick/Designagency/src/app/components/settings-popup/NotificationsTab.tsx`:
  - Replaced manual save flow with debounced auto-save (`700ms`) after toggle changes.
  - Added lightweight auto-save status messaging (`Changes pending...`, `Auto-saving...`, `Saved`).
  - Removed the `Save Changes` button.
  - Preserved synchronization with upstream settings data while avoiding overwrite of local edits.

- Updated tests:
  - `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.test.tsx`
    - Reworked save test to assert debounced auto-save call instead of clicking a save button.
    - Added assertion that `Save Changes` button is not rendered.
  - `/Users/nick/Designagency/src/app/components/settings-popup/NotificationsTab.test.tsx`
    - Reworked save test to assert debounced auto-save call after toggle change.
    - Added assertion that `Save Changes` button is not rendered.

## Why
- Align settings UX with an auto-save model across the page and remove manual save controls.
- Reduce click friction while preserving existing backend mutation behavior.

## Validation
- `rg -n "Save Changes" src/app/components/settings-popup src/app/components/SettingsPopup.tsx` (only test assertions remain) ✅
- `npx eslint src/app/components/settings-popup/AccountTab.tsx src/app/components/settings-popup/NotificationsTab.tsx src/app/components/settings-popup/AccountTab.test.tsx src/app/components/settings-popup/NotificationsTab.test.tsx` ✅
- `npm run test:frontend -- src/app/components/settings-popup/AccountTab.test.tsx src/app/components/settings-popup/NotificationsTab.test.tsx src/app/components/SettingsPopup.test.tsx` ✅
