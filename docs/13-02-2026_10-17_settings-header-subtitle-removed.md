# Settings header subtitle removed

## Date
- 13-02-2026 10:17

## Goal
- Remove the settings panel subtitle text: `Account and workspace preferences in one place.`

## What changed
- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - removed the subtitle `<p>` block under the main `Settings` heading in the header.

## Why
- Matches the requested cleaner header with only the title.

## Validation
- `npx vitest run src/app/components/SettingsPopup.test.tsx` ✅
