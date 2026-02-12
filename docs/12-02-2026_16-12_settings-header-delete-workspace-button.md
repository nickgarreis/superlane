# Settings header delete workspace button repositioned

## Date
- 12-02-2026 16:12

## Goal
Move the `Delete Workspace` action to the far right of the Settings section tabs row (`My Account`, `Notifications`, `Company`) in the Settings popup header.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - moved the delete action from the body workspace danger section to the header tabs row
  - aligned the tabs into a flexible left container and rendered the delete action as a right-aligned header control
  - removed the in-body `Workspace` section card rendering so the action is no longer duplicated
  - normalized legacy `Workspace`/`Billing` tab inputs to `Company` for stable initial section selection

- Updated `/Users/nick/Designagency/src/app/components/settings-popup/SettingsDangerZoneSection.tsx`:
  - added `layout` prop with `panel` (default) and `button` variants
  - extracted the delete action and confirmation dialog so the same deletion flow works in both layouts
  - added compact rounded header-button styling for the new `button` layout

- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.test.tsx`:
  - added assertion that `Delete Workspace` button is rendered in the popup controls view

## Validation
- `npx eslint src/app/components/SettingsPopup.tsx src/app/components/settings-popup/SettingsDangerZoneSection.tsx src/app/components/SettingsPopup.test.tsx` ✅
- `npx vitest run src/app/components/SettingsPopup.test.tsx src/app/components/settings-popup/SettingsDangerZoneSection.test.tsx` ✅
