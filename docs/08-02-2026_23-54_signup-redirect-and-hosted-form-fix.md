# Signup Redirect + Hosted Form Flow Fix

## Issue Reported
- Clicking the `/signup` page action could land the user back on `/`.
- `/signup` appeared to not show a signup form (only local UI controls).

## Root Cause Summary
1. The local `/signup` page only provided a bridge button, so users stayed on an intermediate page instead of being taken directly into the hosted WorkOS signup experience.
2. Return-path recovery depended only on OAuth `state.returnTo`; if state was missing/empty in edge cases, post-auth routing could fall back incorrectly.

## Changes Implemented

### 1. Added robust return-path persistence across auth redirects
- Added `/Users/nick/Designagency/src/app/lib/authReturnTo.ts`:
  - `storeReturnTo(path)`
  - `readStoredReturnTo()`
  - `clearStoredReturnTo()`
- Uses `sessionStorage` and path sanitization (`/`-prefixed only).

### 2. Hardened WorkOS redirect callback fallback
- Updated `/Users/nick/Designagency/src/main.tsx`:
  - Callback return target resolution now uses:
    1. OAuth `state.returnTo` (if valid)
    2. Stored session fallback (`authReturnTo`)
    3. `/tasks`
  - Clears stored fallback after callback resolution.

### 3. Updated AuthPage to drive hosted WorkOS auth directly
- Updated `/Users/nick/Designagency/src/app/components/AuthPage.tsx`:
  - Switched from `getSignInUrl/getSignUpUrl + window.location.assign` to direct `signIn/signUp` SDK methods.
  - Persists `returnTo` in session storage before launching WorkOS auth.
  - Auto-starts auth flow when opening `/login` or `/signup` (unless already authenticated/loading or callback error exists).
  - Keeps manual continue button as fallback.
  - Updated copy to clearly indicate redirect to secure hosted WorkOS form.

## Expected Behavior After Fix
- Visiting `/signup` automatically launches the hosted WorkOS signup form.
- If auto-launch fails, user can click “Continue to sign up”.
- After successful auth callback, user is routed back to intended path (or `/tasks` fallback), not incorrectly dropped on `/`.

## Validation
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run build` ✅
