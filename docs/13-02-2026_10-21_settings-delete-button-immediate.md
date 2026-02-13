# Settings delete workspace button immediate render

## Date
- 13-02-2026 10:21

## Goal
- Remove the 1-2 second delay before the `Delete Workspace` action appears in the settings header.
- Show the action immediately based on viewer role while company settings data is still loading.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - accepted/used `viewerRole` in the popup props.
  - rendered `SettingsDangerZoneSection` in the header controls unconditionally instead of gating on `company`.
  - passed `viewerRole` into `SettingsDangerZoneSection` so existing fallback permission logic can work immediately while company data is still loading.

- Updated `/Users/nick/Designagency/src/app/dashboard/components/DashboardPopups.tsx`:
  - passed `viewerIdentity.role` to `SettingsPopup` as `viewerRole`.

## Tests updated
- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.test.tsx`:
  - added regression test confirming owner sees enabled `Delete Workspace` button immediately with `company: null` and `loadingCompany: true`.

- Updated `/Users/nick/Designagency/src/app/components/settings-popup/SettingsDangerZoneSection.test.tsx`:
  - added fallback-role tests for loading state:
    - owner can open/confirm delete flow when `company` is null.
    - admin is disabled.
    - unknown role is disabled.

- Updated `/Users/nick/Designagency/src/app/dashboard/components/DashboardPopups.test.tsx`:
  - updated settings popup mock to accept `viewerRole`.
  - added test verifying role passthrough to `SettingsPopup`.

## Validation
- `npx vitest run src/app/components/SettingsPopup.test.tsx src/app/components/settings-popup/SettingsDangerZoneSection.test.tsx src/app/dashboard/components/DashboardPopups.test.tsx` ✅
- `npm run lint` ⚠️ failed due existing size-check violations unrelated to this change:
  - `convex/activities.ts` (>500 lines)
  - `src/app/dashboard/useDashboardNavigation.ts` (>500 lines)
- `npm run typecheck` ✅
