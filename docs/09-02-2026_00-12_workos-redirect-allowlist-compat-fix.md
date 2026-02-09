# WorkOS Redirect Allowlist Compatibility Fix

## Issue
- WorkOS events showed `authentication.sso_failed` with:
  - `error.code: redirect_uri_invalid`
  - `The redirect_uri 'http://localhost:5173/auth/callback' is not on your allow list.`

## What Was Changed

### 1) Switched local dev redirect URI back to the currently allow-listed root URL
- Updated `/Users/nick/Designagency/.env.local`:
  - `VITE_WORKOS_REDIRECT_URI=http://localhost:5173`

### 2) Removed forced callback-path normalization
- Updated `/Users/nick/Designagency/src/main.tsx`:
  - `AuthKitProvider.redirectUri` now uses the configured URI as-is (or `window.location.origin` in dev fallback).
  - This avoids forcing `/auth/callback` when WorkOS allow list only contains root.

### 3) Preserved error visibility with root callback flow
- Added `/Users/nick/Designagency/src/app/components/RootPage.tsx`.
- Updated `/Users/nick/Designagency/src/app/App.tsx` to render `RootPage` on `/`.
- Behavior:
  - If WorkOS returns to `/` with `error` query params (no `code`), root now forwards to `/login` or `/signup` (based on stored auth mode) and keeps `error`/`error_description` + `returnTo`.
  - This prevents silent failures when callback responses land on root.

## Result
- Local login/signup no longer fails with `redirect_uri_invalid` for the callback-path URI.
- Error responses are still surfaced on auth pages instead of being hidden on `/`.
- Existing `/auth/callback` route remains available for future use if/when that URI is added to WorkOS allow list.

## Validation
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run build` ✅
