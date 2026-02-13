# Inbox brand asset mention routes to Company settings

## Date
- 13-02-2026 11:18

## Goal
- Fix inbox activity mention navigation so clicking a brand asset mention opens `Settings > Company` (not another section).

## What changed
- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardInboxActivityNavigation.ts`:
  - Added a top-level brand-asset action guard (`brand_asset_uploaded` / `brand_asset_removed`) that always routes to Company settings.
  - Preserves and forwards brand asset focus (`focus: { kind: "brandAsset", assetName }`) when file name is present.
  - Removed duplicate brand-asset-only handling from the workspace branch because this is now centralized.

- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - Added a programmatic scroll lock for section navigation so active-section sync cannot temporarily snap to another section during controlled scroll.
  - Applies to open-time section targeting and tab-button section targeting.

## Tests
- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardInboxActivityNavigation.test.tsx`:
  - Added a regression assertion that brand-asset actions route to Company settings even if the incoming activity kind is not `workspace`.

- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.test.tsx`:
  - Added a regression test that brand-asset focus opens with `Company` active even when `initialTab` is `Notifications`.

## Validation
- `npx vitest run src/app/dashboard/hooks/useDashboardInboxActivityNavigation.test.tsx src/app/components/SettingsPopup.test.tsx` ✅
- `npx eslint src/app/dashboard/hooks/useDashboardInboxActivityNavigation.ts src/app/dashboard/hooks/useDashboardInboxActivityNavigation.test.tsx src/app/components/SettingsPopup.tsx src/app/components/SettingsPopup.test.tsx` ✅
