# Social login security section switch

## Date
- 12-02-2026 14:40

## Issue
- Users authenticated via Google/Apple/SSO/non-password methods saw password reset controls in Settings.
- Triggering reset from those accounts can lead to confusing flows where no password change step is actually available.

## Decision / rule
- UI-only enforcement in Settings -> Account.
- Classification rule: any `authenticationMethod` other than `"Password"` is treated as non-password.
- Rendering behavior:
  - `Password` session: show `Security` section and reset-link controls.
  - non-`Password` session: hide `Security`; show `Social login` section with non-password guidance.

## Changes made
- Extended account settings UI model with auth-session fields:
  - `/Users/nick/Designagency/src/app/components/settings-popup/types.ts`
- Threaded AuthKit `authenticationMethod` through dashboard data flow:
  - `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardDataLayer.ts`
  - `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardViewBindings.ts`
- Added deterministic auth-method -> social label derivation and account shape enrichment:
  - `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardSettingsData.ts`
- Replaced `Security` with conditional `Security`/`Social login` section in account UI:
  - `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.tsx`
- Updated/added tests:
  - `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.test.tsx`
  - `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardSettingsData.test.tsx`
  - `/Users/nick/Designagency/src/app/components/SettingsPopup.test.tsx`

## Backend scope
- No backend changes.
- `api.auth.requestPasswordReset` behavior is intentionally unchanged for this task.

## Validation evidence
- `npm run test:frontend -- AccountTab` ✅
- `npm run test:frontend -- useDashboardSettingsData` ✅
- `npm run test:frontend` ✅
- `npm run typecheck` ✅
