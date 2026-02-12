# Auth returnTo and AccountTab prop cleanup

## Date
- 12-02-2026 14:19

## Goal
- Fix targeted auth flow and settings typing/test issues:
  - Forgot-password test should assert no `signIn` call after the async reset flow completes.
  - Authenticated redirect destination should treat auth routes with query/hash as auth pages.
  - Remove unused `onRemoveAvatar` prop from `AccountTab` component contract.

## Changes made
- Updated `/Users/nick/Designagency/src/app/components/AuthPage.test.tsx`:
  - Moved `expect(signIn).not.toHaveBeenCalled()` from mount-time to after forgot-password submission + async assertions.
  - Adjusted authenticated signup redirect test input to cover query-string variant (`returnTo=/login?foo=bar`), still expecting `/tasks`.

- Updated `/Users/nick/Designagency/src/app/components/AuthPage.tsx`:
  - Hardened `authenticatedDestination` memo by normalizing `returnTo` with a null-safe fallback and deriving pathname without query/hash.
  - Auth route detection now compares the normalized pathname (`/login`, `/signup`, `/auth/callback`, `/reset-password`) before redirecting authenticated users to `/tasks`.

- Updated `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.tsx`:
  - Removed `onRemoveAvatar` from `AccountTabProps` since the current UI has no remove-avatar action.

- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - Removed now-invalid `onRemoveAvatar` prop pass-through to `AccountTab`.
  - Removed `onRemoveAvatar` from `SettingsPopup` destructuring because it is no longer used in this component.

- Updated `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.test.tsx`:
  - Removed `onRemoveAvatar` from `AccountTab` test renders and removed the unused expectation tied to that prop.

## Validation
- `npx vitest run src/app/components/AuthPage.test.tsx src/app/components/auth_routing.test.tsx src/app/components/settings-popup/AccountTab.test.tsx src/app/components/SettingsPopup.test.tsx` ✅
- `npx eslint src/app/components/AuthPage.tsx src/app/components/AuthPage.test.tsx src/app/components/SettingsPopup.tsx src/app/components/settings-popup/AccountTab.tsx src/app/components/settings-popup/AccountTab.test.tsx` ✅
