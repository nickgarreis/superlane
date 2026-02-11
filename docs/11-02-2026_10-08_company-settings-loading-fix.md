# Company Settings Loading Fix

**Date:** 11-02-2026 10:08

## Issue
When opening Settings on the default `Account` tab and then switching to `Company`, the UI stayed on:
- `Loading company settings...`

## Root Cause
`useDashboardData` only executed company settings queries when:
- settings popup is open **and**
- route tab query param is `Company`.

But tab switching inside `SettingsPopup` is local UI state and does not update the route `tab` param. That meant company queries stayed skipped (`"skip"`) after switching to Company inside the modal, leaving `companySummary` as `undefined` and the loading state never resolving.

## Changes
- Updated `src/app/dashboard/useDashboardData.ts`:
  - Added `shouldLoadCompanySettings` guard based on:
    - authenticated
    - resolved workspace slug exists
    - settings popup is open
  - Removed dependence on `settingsTab === "Company"` for:
    - `api.settings.getCompanySettingsSummary`
    - `api.settings.listCompanyMembers`
    - `api.settings.listPendingInvitations`
    - `api.settings.listBrandAssets`

- Added regression test in `src/app/dashboard/useDashboardData.test.tsx`:
  - `loads company settings queries while settings is open even when tab is Account`
  - Verifies company queries execute with `{ workspaceSlug: "alpha" }` even when `settingsTab` is `Account`.

## Validation
- `npm test -- src/app/dashboard/useDashboardData.test.tsx`
- `npx eslint src/app/dashboard/useDashboardData.ts src/app/dashboard/useDashboardData.test.tsx`
