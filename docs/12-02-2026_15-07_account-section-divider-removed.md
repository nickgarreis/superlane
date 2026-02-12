# Account section divider removed

## Date
- 12-02-2026 15:07

## Goal
Remove the stroke/divider between profile and login/auth sections in Settings -> Account.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.tsx`:
  - Removed `border-t border-border-soft` from the auth section container.
  - Kept spacing (`pt-5`) and all behavior unchanged.

## Validation
- `npm run test:frontend -- AccountTab` ✅
- `npx eslint src/app/components/settings-popup/AccountTab.tsx` ✅
