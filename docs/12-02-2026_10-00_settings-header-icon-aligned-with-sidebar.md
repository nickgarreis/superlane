# Settings header icon aligned with sidebar

**Date:** 12-02-2026 10:00

## What changed
- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - Added the same `Settings` icon (`lucide-react`, size `16`) used in the sidebar settings button.
  - Icon is placed to the left of the `Settings` headline in the popup header.

## Why
- Match requested visual consistency between sidebar settings action and settings popup header.

## Validation
- `npx eslint src/app/components/SettingsPopup.tsx` ✅
- `npm run test:frontend -- src/app/components/SettingsPopup.test.tsx` ✅
