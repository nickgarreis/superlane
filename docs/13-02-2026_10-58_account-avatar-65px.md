# Account avatar 65px

## Date
- 13-02-2026 10:58

## Goal
- Make the profile image in the settings account panel 65x65px.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.tsx`:
  - changed avatar wrapper size class from `size-[88px]` to `size-[65px]`.

## Validation
- `npx vitest run src/app/components/settings-popup/AccountTab.test.tsx` ✅
