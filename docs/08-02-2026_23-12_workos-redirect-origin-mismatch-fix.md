# WorkOS Redirect Origin Mismatch Fix

## Issue
Auth button clicks could appear as a reload/no-op when the app origin and redirect URI origin diverged (e.g. opening app on `127.0.0.1` while redirect URI is `localhost`, or vice versa).

## Changes Made

### 1. Respect explicit redirect URI in env
Updated `/Users/nick/Designagency/src/main.tsx`:
- Changed redirect URI resolution to prefer `VITE_WORKOS_REDIRECT_URI` whenever it is set.
- Fallback to `window.location.origin` only in dev when env value is missing.

### 2. Added mismatch warning in auth UI
Updated `/Users/nick/Designagency/src/app/components/AuthPage.tsx`:
- Added warning text when `window.location.origin` differs from `VITE_WORKOS_REDIRECT_URI` origin.
- Keeps auth failures diagnosable directly on the page.

## Validation
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run build` ✅

## Result
The app now uses your configured redirect URI as source of truth, reducing silent localhost/127.0.0.1 mismatch loops and making origin mismatch obvious in the UI.
