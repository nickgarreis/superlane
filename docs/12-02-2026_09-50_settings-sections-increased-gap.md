# Settings sections increased gap

**Date:** 12-02-2026 09:50

## What changed
- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - Added explicit vertical spacing between settings sections by wrapping section blocks in `flex flex-col gap-12`.
  - Kept section content, ordering, and behavior unchanged.

## Why
- Match request to increase visual separation between settings sections without reintroducing divider lines.

## Validation
- `npx eslint src/app/components/SettingsPopup.tsx` ✅
- `npm run test:frontend -- src/app/components/SettingsPopup.test.tsx` ✅
