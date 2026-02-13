# Plan: Display Multiple Login Methods (Google + Email) in Account Settings

## Goal
When a user has authenticated with more than one provider over time (for example Google, then Email/Password), show all linked login methods in the Account auth section instead of only the current session method.

## WorkOS Capability
Yes. WorkOS supports this through user identities and identity linking.
- Current-session auth method is available in AuthKit.
- Full linked identities can be fetched via WorkOS User Management identities API.

## Implementation Plan

1. Persist linked identity providers on the app user record.
- Extend `users` schema with a field like `linkedIdentityProviders?: string[]`.
- Store normalized provider keys (for example: `google`, `email_password`).

2. Sync linked identities from WorkOS on authentication.
- Add a Convex internal action to call WorkOS identities API for the authenticated WorkOS user.
- Map identities to provider list and write them via an internal mutation.
- Trigger this sync after successful auth so data remains fresh.

3. Expose linked providers in settings query.
- Update `convex/settings.ts` `getAccountSettings` to return `linkedIdentityProviders`.
- Keep existing `authMethod` for current-session behavior where needed.

4. Thread linked-provider data to frontend settings state.
- Update `useDashboardSettingsData` mapping and related types to include `linkedIdentityProviders`.
- Keep backward-safe defaults (empty array) if not present.

5. Render multiple auth rows in `AccountTab`.
- For password session users, always show:
- `Signed in with Email` row.
- Additional rows for linked social providers (for example Google) when present.
- For social session users, keep existing social row and also show email row when linked.

6. Keep existing credentials editing behavior unchanged.
- `Edit email & password` popup flow stays tied to email/password credentials.
- No behavior change to reset-password flow.

7. Add/adjust tests.
- Convex settings query test: returns linked providers.
- Dashboard mapping test: provider list flows through.
- `AccountTab` tests:
- Shows both rows when both providers are linked.
- Still shows single row when only one provider exists.
- Social-only behavior remains correct.

## Validation
- `npm run typecheck`
- `npx vitest run src/app/components/settings-popup/AccountTab.test.tsx`
- `npx vitest run src/app/dashboard/hooks/useDashboardSettingsData.test.ts`
- Optional integration sanity: `npx vitest run src/app/components/SettingsPopup.test.tsx`

## Notes
- No external API contract changes.
- UI copy remains consistent with existing auth-row pattern.
