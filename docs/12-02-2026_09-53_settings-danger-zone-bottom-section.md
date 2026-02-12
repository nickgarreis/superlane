# Settings danger zone moved to bottom section

**Date:** 12-02-2026 09:53

## What changed
- Added `/Users/nick/Designagency/src/app/components/settings-popup/SettingsDangerZoneSection.tsx`:
  - New dedicated danger-zone section component for workspace deletion.
  - Preserves confirmation dialog, permission gating, disabled state, and delete mutation behavior.

- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - Removed danger-zone rendering from `CompanyTab` usage.
  - Added `SettingsDangerZoneSection` as a separate section at the bottom of the settings page.

- Updated `/Users/nick/Designagency/src/app/components/settings-popup/CompanyTab.tsx`:
  - Removed inlined danger-zone UI and related delete logic/state.
  - Kept company general/members/brand-asset functionality intact.

- Updated tests:
  - `/Users/nick/Designagency/src/app/components/settings-popup/CompanyTab.test.tsx`
    - Removed delete-workspace assertions from `CompanyTab`.
  - Added `/Users/nick/Designagency/src/app/components/settings-popup/SettingsDangerZoneSection.test.tsx`
    - Verifies delete action still confirms and calls `onSoftDeleteWorkspace`.

## Why
- Match request to place danger actions at the very bottom in a separate section.
- Keep destructive actions isolated from regular company settings.

## Validation
- `npx eslint src/app/components/SettingsPopup.tsx src/app/components/settings-popup/CompanyTab.tsx src/app/components/settings-popup/CompanyTab.test.tsx src/app/components/settings-popup/SettingsDangerZoneSection.tsx src/app/components/settings-popup/SettingsDangerZoneSection.test.tsx` ✅
- `npm run test:frontend -- src/app/components/settings-popup/CompanyTab.test.tsx src/app/components/settings-popup/SettingsDangerZoneSection.test.tsx src/app/components/SettingsPopup.test.tsx` ✅
- `npm run typecheck:frontend` ✅
