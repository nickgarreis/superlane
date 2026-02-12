# Settings popup width and background token alignment

**Date:** 12-02-2026 09:40

## What changed
- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - Reduced popup shell width from `max-w-[920px]` to `max-w-[820px]`.
  - Reduced inner content width from `max-w-[760px]` to `max-w-[680px]`.
  - Changed the main scrollable settings page background from `bg-bg-surface` to `bg-bg-popup`.

## Why
- Match request to make the settings popup narrower.
- Ensure the full settings page surface uses the popup token (`#1e1f20` via `bg-bg-popup`).

## Validation
- `npx eslint src/app/components/SettingsPopup.tsx` ✅
- `npm run test:frontend -- src/app/components/SettingsPopup.test.tsx` ✅
