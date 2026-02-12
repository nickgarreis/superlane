# Account auth layout refresh

## Date
- 12-02-2026 14:55

## Goal
Improve Settings -> Account auth UX:
- Password sessions: show password beside email and remove separate security section.
- Non-password sessions: hide email/password row and show a clear auth-method row/card.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.tsx`:
  - Added inline password field (masked, read-only) next to editable email field for password-auth sessions.
  - Moved password reset action into that inline password row (`Reset password` button).
  - Removed the separate `Security` section.
  - Added non-password auth method card layout (provider + method family + raw method code) with visual icon/chip treatment for OAuth/SSO/passkey/external auth sessions.
  - Preserved existing autosave behavior and password reset mutation flow/status handling.

- Updated `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.test.tsx`:
  - Adjusted reset-flow test to assert inline password controls and button label.
  - Added assertions that `Security` heading is no longer rendered.
  - Added/updated non-password session test to verify social auth card rendering and hidden email/password controls.

## Validation
- `npm run test:frontend -- AccountTab` ✅
- `npx eslint src/app/components/settings-popup/AccountTab.tsx src/app/components/settings-popup/AccountTab.test.tsx` ✅
- `npm run typecheck` ✅
