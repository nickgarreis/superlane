# Vertically center workspace name in settings tab

## Date
- 13-02-2026 12:48

## Goal
- Vertically center the workspace name field relative to the workspace logo in the Settings > Company tab header row.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/CompanyTab.tsx`:
  - Changed the header row layout container from `items-start` to `items-center` so the workspace name input is centered on the same vertical axis as the logo.

## Validation
- `npm run test:frontend -- src/app/components/settings-popup/CompanyTab.test.tsx` ✅
- `npx eslint src/app/components/settings-popup/CompanyTab.tsx` ✅
