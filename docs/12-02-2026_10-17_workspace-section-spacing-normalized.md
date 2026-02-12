# Workspace section spacing normalized

**Date:** 12-02-2026 10:17

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/SettingsDangerZoneSection.tsx`:
  - Added optional `showTitle` prop (default `true`) to control rendering of the internal `Danger Zone` heading.
  - When `showTitle` is `false`, section content renders without the extra heading/gap.

- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - In the `Workspace` section, render `SettingsDangerZoneSection` with `showTitle={false}`.

## Why
- Ensure consistent visual spacing/rhythm across the four settings sections (`My Account`, `Notifications`, `Company`, `Workspace`) by avoiding duplicated section heading spacing in the Workspace section.

## Validation
- `npx eslint src/app/components/SettingsPopup.tsx src/app/components/settings-popup/SettingsDangerZoneSection.tsx` ✅
- `npx vitest run src/app/components/SettingsPopup.test.tsx src/app/components/settings-popup/SettingsDangerZoneSection.test.tsx` ✅
