# Account section gap reduced

## Date
- 12-02-2026 15:08

## Goal
Reduce vertical spacing between profile and login/auth sections in Settings -> Account.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.tsx`:
  - Reduced top padding on the auth section wrapper from `pt-5` to `pt-3`.

## Validation
- `npm run test:frontend -- AccountTab` ✅
- `npx eslint src/app/components/settings-popup/AccountTab.tsx` ✅
