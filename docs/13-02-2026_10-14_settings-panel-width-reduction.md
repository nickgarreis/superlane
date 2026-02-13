# Settings panel width reduction

## Date
- 13-02-2026 10:14

## Goal
- Reduce the visual width of the Settings popup panel a bit.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - changed panel max width class from `max-w-[700px]` to `max-w-[660px]`.
  - kept the previously reduced height class `h-[min(88vh,700px)]` unchanged.

## Validation
- `npx vitest run src/app/components/SettingsPopup.test.tsx` ✅
