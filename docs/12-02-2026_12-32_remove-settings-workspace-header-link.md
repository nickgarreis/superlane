# Remove Workspace header link from settings popup

**Date:** 12-02-2026 12:32

## What changed
- Removed the `Workspace` item from the top settings header navigation pills.
- Kept the Workspace danger-zone section in the scrollable content so functionality remains available without a header shortcut.
- Updated the settings popup test to assert that the Workspace header button is no longer rendered.

## Files updated
- `src/app/components/SettingsPopup.tsx`
- `src/app/components/SettingsPopup.test.tsx`

## Validation
- `npx vitest run src/app/components/SettingsPopup.test.tsx` ✅
- `npx eslint src/app/components/SettingsPopup.tsx src/app/components/SettingsPopup.test.tsx` ✅
