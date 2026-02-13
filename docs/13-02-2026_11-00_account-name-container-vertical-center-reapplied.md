# Account name container vertical center reapplied

## Date
- 13-02-2026 11:00

## Goal
- Reapply vertical centering for the first and last name container in the settings account panel.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.tsx`:
  - added `self-center` back to the first/last-name wrapper (`div` beside the avatar).
- Left avatar size unchanged at `size-[88px]`.

## Validation
- `npx vitest run src/app/components/settings-popup/AccountTab.test.tsx` ✅
