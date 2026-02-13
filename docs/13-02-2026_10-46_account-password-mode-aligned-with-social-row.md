# Account password mode aligned with social row

## Date
- 13-02-2026 10:46

## Goal
- Move the password-auth view into the same horizontal position/anchor used by the social-auth view in the account settings section.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.tsx`:
  - introduced `AUTH_MODE_ROW_CLASS` to share the same row layout between auth modes.
  - wrapped password-auth controls in that shared row layout.
  - added a leading hidden spacer (`size-6`) for password mode to match the social mode’s icon slot width, so both modes start from the same visual position.

## Validation
- `npx vitest run src/app/components/settings-popup/AccountTab.test.tsx` ✅
