# WorkOS Loop Diagnostics + Callback Hardening

## Issue
Auth still appeared to loop back to `/` after WorkOS button clicks, without clear user-visible error details.

## Changes Made

### 1. Added explicit redirect callback handling
Updated `/Users/nick/Designagency/src/main.tsx`:
- Added `onRedirectCallback` to `AuthKitProvider`.
- Behavior:
  - If callback `state.returnTo` differs from current path, navigate there.
  - Otherwise hard reload current page to force post-callback auth state reconciliation.

### 2. Added optional custom WorkOS API hostname support
Updated `/Users/nick/Designagency/src/main.tsx`:
- Added support for optional env var `VITE_WORKOS_API_HOSTNAME`.
- Passes it to `AuthKitProvider` when present.

### 3. Surfaced WorkOS callback query errors in UI
Updated `/Users/nick/Designagency/src/app/components/AuthPage.tsx`:
- Reads `error` and `error_description` from URL query params.
- Displays them on the auth page so redirect rejection/config issues are visible immediately.

### 4. Added auth attempt marker in OAuth state
Updated `/Users/nick/Designagency/src/app/components/AuthPage.tsx`:
- Included `authAttemptAt` in state payload when generating sign-in/sign-up URLs.

## Validation
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run build` ✅

## Result
Auth flow now has explicit callback reconciliation and visible callback error diagnostics, reducing silent loops and making WorkOS-side rejection causes observable on `/`.
