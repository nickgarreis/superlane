# Settings popup width reduced further

**Date:** 12-02-2026 09:54

## What changed
- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - Reduced popup shell width from `max-w-[820px]` to `max-w-[760px]`.

## Why
- Match request to make the settings popup narrower again.

## Validation
- `npx eslint src/app/components/SettingsPopup.tsx` ✅
- `npm run test:frontend -- src/app/components/SettingsPopup.test.tsx` ✅
