# Account name container vertical center

## Date
- 13-02-2026 10:58

## Goal
- Vertically center the container that holds the first and last name fields in the settings panel.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.tsx`:
  - added `self-center` to the first/last-name container (`div` next to the avatar) so it is vertically centered within the row.

## Validation
- `npx vitest run src/app/components/settings-popup/AccountTab.test.tsx` ✅
