# Password reset flow and account security UI

**Date:** 12-02-2026 14:05

## Summary
Implemented a WorkOS-hosted password reset flow across login and settings, added a public `/reset-password` handoff page, wired reset command plumbing through dashboard layers, and updated account/settings UI and tests.

## Behavior delivered
- Added `api.auth.requestPasswordReset` backend action with source-aware behavior:
  - `source="login"` uses provided email.
  - `source="settings"` resolves current authenticated user (via auth identity + user lookup).
- Reset URL is server-built using `APP_ORIGIN` and `/reset-password` with source-specific return targets:
  - login -> `/tasks`
  - settings -> `/settings?tab=Account`
- Enforced anti-enumeration response policy:
  - user-facing response always `{ accepted: true }`
  - failures logged server-side.
- Added public `/reset-password` page to read reset token and hand off to WorkOS hosted reset via `signIn({ passwordResetToken, state })`.
- Updated auth pages:
  - `/login` now supports inline forgot-password request UX.
  - authenticated users hitting `/login` or `/signup` are redirected into app-safe destination.
  - signup auto-start remains; login auto-start is disabled for forgot-password usability.
- Updated Settings -> Account tab with Security section and “Send password reset link” action.
- Preserved prior notification-settings UX request:
  - removed “Changes pending / Auto-saving / Saved” status text below notifications table while keeping autosave behavior.

## Changed files
- `/Users/nick/Designagency/convex/auth.ts`
- `/Users/nick/Designagency/convex/lib/env.ts`
- `/Users/nick/Designagency/convex/.env.example`
- `/Users/nick/Designagency/config/security/environment-matrix.json`
- `/Users/nick/Designagency/scripts/security/check-env.mjs`
- `/Users/nick/Designagency/docs/operations/environment-matrix.md`
- `/Users/nick/Designagency/convex/__tests__/auth_password_reset.test.ts`
- `/Users/nick/Designagency/src/app/App.tsx`
- `/Users/nick/Designagency/src/app/App.test.tsx`
- `/Users/nick/Designagency/src/app/components/AuthPage.tsx`
- `/Users/nick/Designagency/src/app/components/AuthPage.test.tsx`
- `/Users/nick/Designagency/src/app/components/ResetPasswordPage.tsx`
- `/Users/nick/Designagency/src/app/components/ResetPasswordPage.test.tsx`
- `/Users/nick/Designagency/src/app/lib/seo.ts`
- `/Users/nick/Designagency/src/app/lib/seo.test.ts`
- `/Users/nick/Designagency/src/app/components/settings-popup/types.ts`
- `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`
- `/Users/nick/Designagency/src/app/components/SettingsPopup.test.tsx`
- `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.tsx`
- `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.test.tsx`
- `/Users/nick/Designagency/src/app/components/settings-popup/NotificationsTab.tsx`
- `/Users/nick/Designagency/src/app/dashboard/types.ts`
- `/Users/nick/Designagency/src/app/dashboard/commands/createSettingsCommands.ts`
- `/Users/nick/Designagency/src/app/dashboard/useDashboardCommands.ts`
- `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardActionLayer.ts`
- `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardApiHandlers.ts`
- `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardApiHandlers.test.tsx`
- `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardDataLayer.ts`
- `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardDataLayer.test.tsx`
- `/Users/nick/Designagency/src/app/dashboard/useDashboardWorkspaceActions.ts`
- `/Users/nick/Designagency/src/app/dashboard/useDashboardWorkspaceActions.test.tsx`
- `/Users/nick/Designagency/src/app/dashboard/components/DashboardPopups.tsx`
- `/Users/nick/Designagency/src/app/dashboard/components/DashboardPopups.test.tsx`
- `/Users/nick/Designagency/src/app/dashboard/useDashboardOrchestration.test.tsx`

## Validation evidence
- `npx convex codegen` ✅
- `npm run typecheck` ✅
- `npm run test:frontend` ✅
- `npm run test:backend` ✅
- `npm run lint` ⚠️ fails on existing repo-level budget gate:
  - `FAIL any usage total: 206 (budget 200)`
- `npm run security:check` ⚠️ fails on existing test fixture secrets in repository:
  - `/Users/nick/Designagency/vitest.backend.config.ts` hardcoded test WorkOS secret values flagged by `security:secrets`.
