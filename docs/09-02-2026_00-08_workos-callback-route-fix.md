# WorkOS Callback Route Fix (`/login` and `/signup` redirect issue)

## Problem
- Visiting `/login` or `/signup` appeared to immediately return users to `/`.
- WorkOS auth callback errors were effectively invisible in the UI because they landed on `/`, not on auth pages.

## Root Cause
1. `VITE_WORKOS_REDIRECT_URI` was configured to the app root (`http://localhost:5173`), so WorkOS always returned to `/`.
2. The WorkOS SDK only processes redirect callbacks when `code` exists and the current pathname matches the configured redirect pathname.
3. Error responses (`error`, `error_description`) do not include `code`, so callback handler logic did not run, leaving the app on `/`.

## Changes Made

### 1) Added dedicated public callback route
- Added `/Users/nick/Designagency/src/app/components/AuthCallbackPage.tsx`
- Added route in `/Users/nick/Designagency/src/app/App.tsx`:
  - `/auth/callback` (public)
- Behavior:
  - Shows a “Completing secure sign-in...” state during normal callback processing.
  - If callback has no `code`, redirects to `/login` or `/signup` with surfaced error query params.

### 2) Persisted attempted auth mode
- Extended `/Users/nick/Designagency/src/app/lib/authReturnTo.ts` with:
  - `storeAuthMode`
  - `readStoredAuthMode`
  - `clearStoredAuthMode`
- Updated `/Users/nick/Designagency/src/app/components/AuthPage.tsx` to store mode before redirecting to WorkOS.

### 3) Normalized WorkOS redirect URI to callback path
- Updated `/Users/nick/Designagency/src/main.tsx`:
  - Added redirect URI normalization so root path (`/`) is converted to `/auth/callback`.
  - Dev fallback now defaults to `${window.location.origin}/auth/callback`.
  - Clears stored auth mode in redirect callback cleanup.

### 4) Updated local dev env redirect URI
- Updated `/Users/nick/Designagency/.env.local`:
  - `VITE_WORKOS_REDIRECT_URI=http://localhost:5173/auth/callback`

## Result
- `/login` and `/signup` now remain stable entry points for auth initiation.
- WorkOS callbacks resolve through `/auth/callback` instead of `/`.
- Callback errors are routed back to auth pages and shown to the user instead of looking like a silent bounce to root.
- Note: WorkOS app settings must allow `http://localhost:5173/auth/callback` as a redirect URI.

## Validation
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run build` ✅
