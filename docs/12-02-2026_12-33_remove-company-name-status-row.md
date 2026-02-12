# Remove status component above company name in Company settings

**Date:** 12-02-2026 12:33

## What changed
- Removed the save-status strip (`Saving...` / `Saved`) that rendered above the company name input in the Company settings header area.
- Kept the existing company image upload, company name input, and `Manage billing` button layout intact.
- Removed now-unused save-status state and icon import from `CompanyTab`.

## Files updated
- `src/app/components/settings-popup/CompanyTab.tsx`

## Validation
- `npx vitest run src/app/components/settings-popup/CompanyTab.test.tsx` ✅
- `npx eslint src/app/components/settings-popup/CompanyTab.tsx` ✅
