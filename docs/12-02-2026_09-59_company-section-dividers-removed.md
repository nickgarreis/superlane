# Company section dividers removed

**Date:** 12-02-2026 09:59

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/CompanyTab.tsx`:
  - Removed divider lines between:
    - workspace settings block
    - members table section
    - company files (brand assets) section
  - Removed unused `DIVIDER_SUBTLE_CLASS` import.

## Why
- Match request to remove the separators between workspace settings, members table, and company files in Company settings.

## Validation
- `npx eslint src/app/components/settings-popup/CompanyTab.tsx` ✅
- `npm run test:frontend -- src/app/components/settings-popup/CompanyTab.test.tsx src/app/components/SettingsPopup.test.tsx` ✅
