# WorkOS linked logins implementation

## Date
- 13-02-2026 11:24

## Goal
- Implement `/Users/nick/Designagency/workos-linked-logins-plan.md` so account settings can display multiple linked login methods (for example Email + Google), backed by WorkOS identity sync.

## What changed
- Backend schema:
  - Updated `/Users/nick/Designagency/convex/schema.ts` to add optional `users.linkedIdentityProviders: string[]`.
- Backend auth sync:
  - Updated `/Users/nick/Designagency/convex/auth.ts` with:
    - provider-key normalization helpers,
    - `internalSetLinkedIdentityProviders` internal mutation,
    - `internalSyncCurrentUserLinkedIdentityProviders` internal action,
    - `syncCurrentUserLinkedIdentityProviders` public action for frontend trigger.
  - Sync now pulls WorkOS user identities (`getUserIdentities`), merges with current session auth method, normalizes/deduplicates provider keys, and stores them on the app user.
- Settings query exposure:
  - Updated `/Users/nick/Designagency/convex/settings.ts` `getAccountSettings` to return normalized `linkedIdentityProviders`.
- Frontend data threading:
  - Updated `/Users/nick/Designagency/src/app/components/settings-popup/types.ts` (`AccountSettingsData`) to include `linkedIdentityProviders`.
  - Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardSettingsData.ts` to map and normalize the provider list.
  - Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardApiHandlers.ts` to expose `syncCurrentUserLinkedIdentityProvidersAction`.
  - Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardDataLayer.ts` to trigger provider sync after authenticated dashboard load.
- Account UI rendering:
  - Updated `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.tsx` to render multiple auth rows:
    - password session: always Email row + linked social rows,
    - social session: social row + Email row when linked.
  - Credentials editing remains tied to the Email row (`Edit email & password`).

## Tests and validation
- Passed:
  - `npm run typecheck`
  - `npx vitest run src/app/components/settings-popup/AccountTab.test.tsx src/app/dashboard/hooks/useDashboardSettingsData.test.tsx`
  - `npx vitest run convex/__tests__/settings_p11.test.ts`
  - `npx vitest run src/app/dashboard/hooks/useDashboardApiHandlers.test.tsx src/app/dashboard/hooks/useDashboardDataLayer.test.tsx`
- Lint note:
  - `npm run lint` fails on existing component-size guard for `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.tsx` (>500 lines).

## Updated tests
- `/Users/nick/Designagency/convex/__tests__/settings_p11.test.ts`
  - Added coverage for normalized `linkedIdentityProviders` returned by `getAccountSettings`.
- `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardSettingsData.test.tsx`
  - Added provider-list mapping assertions.
- `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.test.tsx`
  - Added linked multi-provider rendering scenarios while preserving social-only behavior.
- `/Users/nick/Designagency/src/app/components/SettingsPopup.test.tsx`
  - Updated account fixture shape.
- `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardApiHandlers.test.tsx`
  - Updated action count and new sync action assertion.
- `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardDataLayer.test.tsx`
  - Updated handler mock shape.
