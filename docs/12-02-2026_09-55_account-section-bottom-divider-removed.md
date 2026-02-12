# Account section bottom divider removed

**Date:** 12-02-2026 09:55

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.tsx`:
  - Removed the bottom divider classes from the main account content row.
  - Class changed from `flex items-start gap-5 pb-6 border-b border-border-subtle-soft` to `flex items-start gap-5 pb-6`.

## Why
- Match request to remove the divider at the bottom of the account section.

## Validation
- `npx eslint src/app/components/settings-popup/AccountTab.tsx` ✅
- `npm run test:frontend -- src/app/components/settings-popup/AccountTab.test.tsx src/app/components/SettingsPopup.test.tsx` ✅
