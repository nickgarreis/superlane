# Settings delete button strong red styling

## Date
- 13-02-2026 10:31

## Goal
- Update the `Delete Workspace` button styling to a stronger red treatment with:
  - strong red background
  - border matching the red background color
  - white text

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/SettingsDangerZoneSection.tsx`:
  - added `SOLID_DANGER_BUTTON_CLASS` token for shared solid red button styling.
  - applied the shared class to both header (`layout="button"`) and panel action variants.
  - updated the confirmation dialog `Delete Workspace` button to the same strong red + matching border + white text style.

## Validation
- `npx vitest run src/app/components/settings-popup/SettingsDangerZoneSection.test.tsx src/app/components/SettingsPopup.test.tsx` ✅
