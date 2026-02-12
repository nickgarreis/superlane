# SITE_URL password reset env canonicalization

## Date
- 12-02-2026 14:23

## Issue
- `auth:requestPasswordReset` crashed with:
  - `Missing required environment variable: APP_ORIGIN`

## Root cause
- Password reset URL generation in `convex/auth.ts` depended on `APP_ORIGIN`.
- Runtime Convex deployments were configured with `SITE_URL` (not `APP_ORIGIN`), so the action threw before dispatching WorkOS reset emails.

## Contract change
- Canonical backend env var for password reset origin changed from `APP_ORIGIN` to `SITE_URL`.
- Hard-fail behavior is preserved: missing/invalid `SITE_URL` still throws at runtime.

## Changes made
- Updated backend env accessor and usage:
  - `/Users/nick/Designagency/convex/lib/env.ts`
  - `/Users/nick/Designagency/convex/auth.ts`
- Updated env policy/check definitions:
  - `/Users/nick/Designagency/config/security/environment-matrix.json`
  - `/Users/nick/Designagency/scripts/security/check-env.mjs`
  - `/Users/nick/Designagency/convex/.env.example`
  - `/Users/nick/Designagency/docs/operations/environment-matrix.md`
- Updated backend tests:
  - `/Users/nick/Designagency/convex/__tests__/auth_password_reset.test.ts`
  - switched test env setup from `APP_ORIGIN` to `SITE_URL`
  - added negative test asserting missing `SITE_URL` throws and no WorkOS dispatch occurs

## Rollout / verification commands
- Verify env values:
  - `npx convex env get SITE_URL`
  - `npx convex env get SITE_URL --prod`
- Set if missing:
  - `npx convex env set SITE_URL <app-origin>`
  - `npx convex env set SITE_URL <app-origin> --prod`
- Post-deploy smoke checks:
  - login `Forgot password?` flow
  - settings `Send password reset link` flow

## Validation evidence
- `npm run security:env` ✅
- `npm run typecheck:backend` ✅
- `npm run test:backend` ✅ (`77` tests passed)
