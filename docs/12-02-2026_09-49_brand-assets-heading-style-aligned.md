# Brand assets heading style aligned

**Date:** 12-02-2026 09:49

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/CompanyBrandAssetsSection.tsx`:
  - Changed the `Brand Assets` heading to match the same style as `Members (N)`:
    - `txt-role-body-md font-medium txt-tone-subtle uppercase tracking-wider`
  - Updated heading content to `Brand Assets (N)` using current brand asset count.
  - Removed subtitle text: `Workspace-level brand files.`

## Why
- Match requested visual style parity with the members headline and remove extra explanatory copy.

## Validation
- `npx eslint src/app/components/settings-popup/CompanyBrandAssetsSection.tsx` ✅
- `npm run test:frontend -- src/app/components/settings-popup/CompanyTab.test.tsx src/app/components/SettingsPopup.test.tsx` ✅
