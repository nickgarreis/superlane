# Convex ↔ WorkOS Auth Bridge Fix (Force Refresh)

## Issue
WorkOS login could complete, but the app still stayed on the unauthenticated auth page (`/`) and appeared to loop back.

## Root Cause
The previously used bridge (`@convex-dev/workos` wrapper) did not pass Convex's `forceRefreshToken` flag into WorkOS `getAccessToken`, which can cause token acquisition to remain stale/fail during auth transition.

## Changes Made
Updated `/Users/nick/Designagency/src/app/providers/ConvexProviderWithAuthKit.tsx`:
- Replaced package wrapper usage with a local `ConvexProviderWithAuth` bridge.
- Added custom `fetchAccessToken({ forceRefreshToken })` that calls:
  - `getAccessToken({ forceRefresh: forceRefreshToken })`
- Preserved auth state mapping:
  - `isLoading`
  - `isAuthenticated: !!user`

## Validation
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run build` ✅

## Result
Convex token fetching now respects force-refresh semantics from Convex during auth state transitions, reducing WorkOS-login-to-unauthenticated loop behavior.
