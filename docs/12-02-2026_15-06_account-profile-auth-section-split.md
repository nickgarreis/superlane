# Account profile/auth section split

## Date
- 12-02-2026 15:06

## Goal
Move login-related account controls below profile details so the profile section only contains avatar + name fields.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.tsx`:
  - Split the account layout into two sections:
    - top profile section: profile image + first name + last name only,
    - bottom auth section (below divider):
      - password sessions: email + non-editable password + reset button,
      - non-password sessions: social/external login provider card.
  - Kept all existing behavior (autosave, avatar upload, password reset flow/status) unchanged.

## Validation
- `npm run test:frontend -- AccountTab` ✅
- `npx eslint src/app/components/settings-popup/AccountTab.tsx src/app/components/settings-popup/AccountTab.test.tsx` ✅
- `npm run typecheck` ✅
