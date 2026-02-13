# Linked login sync hardening (logs-only frontend errors)

## Date
- 13-02-2026 12:00

## Goal
- Implement linked-login sync reliability improvements so all linked providers can converge in Account settings.
- Keep sync failures operationally visible in logs only (no frontend error UI).

## What changed
- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardDataLayer.ts`:
  - Added bounded retry flow for linked identity sync with delays `[0, 300, 1000, 2500]` ms.
  - Treats non-throw sync responses with `synced: false` as retry/terminal outcomes.
  - On terminal failure, reports via `reportUiError(..., { showToast: false })` with diagnostic details.
  - No toast/banner/inline error UI added for sync failures.
  - Sync signature now keys on `user.id + authenticationMethod` instead of email.

- Updated `/Users/nick/Designagency/convex/auth.ts`:
  - `syncCurrentUserLinkedIdentityProvidersImpl` now persists a baseline provider set (`existing + sessionAuthenticationMethod`) before WorkOS identities fetch.
  - On WorkOS sync failure, returns `sync_failed` with the persisted baseline provider list, enabling fallback persistence.
  - Added explicit structured logs for soft-fail reasons:
    - `unauthorized`
    - `not_provisioned`
    - `sync_failed`
  - Switched `runQuery`/`runMutation` calls in the sync helper to internal function references (`internal.auth.*`) for function-reference-safe execution.

- Added backend tests in `/Users/nick/Designagency/convex/__tests__/auth_linked_identity_sync.test.ts`:
  - session provider persists when WorkOS identities fetch fails.
  - provider merge behavior for existing + session + WorkOS identities.
  - `not_provisioned` path returns expected result and skips WorkOS identities call.

- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardDataLayer.test.tsx`:
  - added retry-path assertion for soft-fail then success.
  - added terminal soft-fail assertion that logs with `showToast: false`.
  - added explicit guard that no `toast.error` is emitted by linked-login sync failures.

- Updated `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.test.tsx`:
  - added assertion that stale/missing linked providers do not render sync failure messaging in the settings UI.

## Validation
- `npx vitest run convex/__tests__/auth_linked_identity_sync.test.ts` ✅
- `npx vitest run src/app/dashboard/hooks/useDashboardDataLayer.test.tsx src/app/components/settings-popup/AccountTab.test.tsx` ✅
- `npm run typecheck` ✅

## Notes
- Backend test output includes expected structured log lines for simulated `sync_failed` and `not_provisioned` paths.
- Observability for linked-login sync failures remains logs-only by design.
