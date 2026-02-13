# Settings panel height reduction

## Date
- 13-02-2026 10:10

## Goal
- Reduce the visual height of the Settings popup panel.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - changed panel height class from `h-[min(92vh,760px)]` to `h-[min(88vh,700px)]`.
  - this lowers both the viewport-relative cap and absolute max height while preserving existing scroll behavior.

## Validation
- `npx vitest run src/app/components/SettingsPopup.test.tsx` ✅
