# Settings account section top padding

## Date
- 13-02-2026 10:53

## Goal
- Add top padding to the Account section in the settings panel.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - made the section wrapper class conditional with `cn(...)`.
  - added `pt-2` only when `section.id === "Account"`.

## Validation
- `npx vitest run src/app/components/SettingsPopup.test.tsx` ✅
