# Remove manage billing button from company settings

## Date
- 13-02-2026 12:38

## Goal
- Remove the `Manage billing` button from the Company section in the settings panel.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/CompanyTab.tsx`:
  - Removed the `Manage billing` action button from the company header area.
  - Removed now-unused `ArrowUpRight` icon import.
  - Removed now-unused `SECONDARY_ACTION_BUTTON_CLASS` import.
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/CompanyTab.test.tsx`:
  - Replaced the previous assertion that expected the `Manage billing` button with an assertion confirming it is not rendered.

## Validation
- `npm run test:frontend -- src/app/components/settings-popup/CompanyTab.test.tsx` ✅
- `npx eslint src/app/components/settings-popup/CompanyTab.tsx src/app/components/settings-popup/CompanyTab.test.tsx` ✅
