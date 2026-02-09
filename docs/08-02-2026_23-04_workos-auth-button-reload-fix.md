# WorkOS Auth Button Reload Fix

## Issue
On the unauthenticated `/` page, clicking `Sign in with WorkOS` or `Sign up with WorkOS` appeared to just reload without entering the hosted auth flow.

## Changes Made

### 1. Made auth button flow explicit and failure-visible
Updated `/Users/nick/Designagency/src/app/components/AuthPage.tsx`:
- Switched from direct `signIn()` / `signUp()` calls to explicit URL generation:
  - `getSignInUrl(...)`
  - `getSignUpUrl(...)`
- Added hard redirect via `window.location.assign(destination)`.
- Added runtime guard for empty/invalid destination URL.
- Added visible inline error message when auth URL generation fails, so failures are no longer silent.

### 2. Hardened AuthKit provider config for local development
Updated `/Users/nick/Designagency/src/main.tsx`:
- In dev mode, force redirect URI to `window.location.origin` to prevent origin drift issues.
- Set `devMode={import.meta.env.DEV}` explicitly on `AuthKitProvider`.

## Validation
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run build` ✅

## Result
Auth button actions now explicitly compute a WorkOS authorization URL and navigate to it. If URL generation fails, users now see a clear error instead of an apparent no-op/reload.
