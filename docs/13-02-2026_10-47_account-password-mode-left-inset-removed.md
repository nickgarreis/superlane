# Account password mode left inset removed

## Date
- 13-02-2026 10:47

## Goal
- Remove the left inner padding/inset from the email/password auth mode in account settings.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.tsx`:
  - removed the leading spacer element (`size-6`) from the password-auth row layout.
  - kept the rest of the layout unchanged.

## Validation
- `npx vitest run src/app/components/settings-popup/AccountTab.test.tsx` ✅
