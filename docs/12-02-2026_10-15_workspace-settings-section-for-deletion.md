# Workspace deletion moved to dedicated Workspace settings section

**Date:** 12-02-2026 10:15

## What changed
- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - Added a new `Workspace` section/tab to the settings header.
  - Moved `SettingsDangerZoneSection` rendering out of the Company section and into the new Workspace section.
  - Added `Workspace` to section refs and section metadata so scroll sync and active-tab highlighting work with four tabs.

- Updated settings tab types to include `Workspace` while preserving `Billing` compatibility:
  - `/Users/nick/Designagency/src/app/components/settings-popup/types.ts`
  - `/Users/nick/Designagency/src/app/dashboard/types.ts`

- Updated `onOpenSettings` tab-union props to include `Workspace`:
  - `/Users/nick/Designagency/src/app/components/Sidebar.tsx`
  - `/Users/nick/Designagency/src/app/components/sidebar/types.ts`
  - `/Users/nick/Designagency/src/app/dashboard/components/DashboardChrome.tsx`
  - `/Users/nick/Designagency/src/app/dashboard/components/DashboardChrome.test.tsx`

- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.test.tsx`:
  - Added assertions for the new `Workspace` header tab and section heading.

## Why
- Match requested IA/UX change: Workspace deletion controls should be in a dedicated `Workspace` settings area, not within Company settings.

## Validation
- `npx eslint src/app/components/SettingsPopup.tsx src/app/components/SettingsPopup.test.tsx src/app/components/settings-popup/types.ts src/app/dashboard/types.ts src/app/components/Sidebar.tsx src/app/components/sidebar/types.ts src/app/dashboard/components/DashboardChrome.tsx src/app/dashboard/components/DashboardChrome.test.tsx` ✅
- `npx vitest run src/app/components/SettingsPopup.test.tsx src/app/dashboard/components/DashboardChrome.test.tsx src/app/components/settings-popup/SettingsDangerZoneSection.test.tsx` ✅
- `npm run typecheck` ✅
