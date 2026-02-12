# Settings body max width removed

**Date:** 12-02-2026 09:51

## What changed
- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - Removed `max-w-[680px]` from the settings body wrapper class.
  - Wrapper changed from `mx-auto w-full max-w-[680px] px-5 py-4 sm:px-7` to `mx-auto w-full px-5 py-4 sm:px-7`.

## Why
- Match request to let settings body fill available parent width.

## Validation
- `npx eslint src/app/components/SettingsPopup.tsx` ✅
- `npm run test:frontend -- src/app/components/SettingsPopup.test.tsx` ✅
