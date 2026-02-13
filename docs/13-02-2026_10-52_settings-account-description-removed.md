# Settings account description removed

## Date
- 13-02-2026 10:52

## Goal
- Remove the `Manage your personal profile and preferences.` text from the settings panel.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - removed the Account section description string from `SETTINGS_SECTIONS`.
  - changed `description` in section metadata from required to optional.
  - rendered the description paragraph only when `section.description` is present.

## Validation
- `npx vitest run src/app/components/SettingsPopup.test.tsx` ✅
