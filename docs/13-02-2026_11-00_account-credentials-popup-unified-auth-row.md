# Account credentials popup + unified auth row

## Date
- 13-02-2026 11:00

## Goal
- Replace password-session inline email/password controls with the same summary-row style used by social auth.
- Add an "Edit email & password" popup with explicit email save, password reset link flow, and unsaved-change discard confirmation.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.tsx`:
  - password-auth mode now renders a summary row with `Mail` icon, heading `Signed in with Email`, email text, and a right-side `Edit email & password` button.
  - removed inline email/password editor from main account view for password sessions.
  - added credentials modal (`Edit email & password`) with:
    - editable `Email Address` input
    - read-only password placeholder and `Reset password` action
    - explicit `Save`/`Cancel` footer actions
  - added discard confirmation dialog (`Discard email changes?`) when closing modal with unsaved email edits.
  - split email state into:
    - canonical `accountEmail` for row display + autosave payloads
    - `credentialsEmailDraft` for modal editing
  - preserved first/last name autosave behavior and updated autosave payload to always use canonical `accountEmail`.
  - added save-race guard for popup save by canceling pending autosave timer/run state before explicit credentials save.

- Updated `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.test.tsx`:
  - replaced old inline-password assertions with password summary-row assertions.
  - added popup behavior tests for open/save/reset/discard-confirm flows.
  - retained social-auth row behavior coverage.

## Validation
- `npx vitest run src/app/components/settings-popup/AccountTab.test.tsx` ✅ (7 tests)
- `npx vitest run src/app/components/SettingsPopup.test.tsx` ✅ (3 tests)
