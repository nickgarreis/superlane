# Settings heading size increase

## Date
- 13-02-2026 10:13

## Goal
- Increase the size of the `Settings` heading in the settings panel header.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - changed the heading class from `txt-role-body-lg` to `txt-role-body-xl` for the top `Settings` title.

## Why
- `txt-role-body-xl` increases the title text size while preserving the existing font family/weight pattern used in the popup.

## Validation
- `npx vitest run src/app/components/SettingsPopup.test.tsx` ✅
