# Remove billing section and add manage blling button

**Date:** 12-02-2026 09:58

## What changed
- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - Removed the Billing section from visible settings sections (header chips + body section list).
  - Removed Billing content rendering from the settings body.
  - Added tab normalization so incoming `Billing` tab states resolve to `Company` (keeps routing/state stable when older links or tab params use `Billing`).

- Updated `/Users/nick/Designagency/src/app/components/settings-popup/CompanyTab.tsx`:
  - Removed visible `Workspace Name` headline text.
  - Added `Manage blling` button directly below the workspace-name input.
  - Button currently shows a lightweight toast placeholder (`Billing management is coming soon`).

- Updated tests:
  - `/Users/nick/Designagency/src/app/components/SettingsPopup.test.tsx`
    - Updated expectations to confirm Billing heading/button are no longer rendered.
  - `/Users/nick/Designagency/src/app/components/settings-popup/CompanyTab.test.tsx`
    - Added assertions that `Workspace Name` text is removed and `Manage blling` button is present.

## Why
- Match request to remove the Billing section and replace it with a billing-management entry point in Company settings.

## Validation
- `npx eslint src/app/components/SettingsPopup.tsx src/app/components/SettingsPopup.test.tsx src/app/components/settings-popup/CompanyTab.tsx src/app/components/settings-popup/CompanyTab.test.tsx` ✅
- `npm run test:frontend -- src/app/components/settings-popup/CompanyTab.test.tsx src/app/components/SettingsPopup.test.tsx` ✅
- `npm run typecheck:frontend` ✅
