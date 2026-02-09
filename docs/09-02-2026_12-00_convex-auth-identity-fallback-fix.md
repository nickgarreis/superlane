# Convex Unauthorized After WorkOS Session (Identity Fallback Fix)

## Issue
- Users were successfully authenticating with WorkOS and being redirected to `/tasks`, but the dashboard stayed blank.
- Convex logs showed repeated:
  - `Q(dashboard:getSnapshot) Uncaught ConvexError: Unauthorized`
  - thrown from `requireAuthUser` in `convex/lib/auth.ts`.

## Root Cause
`requireAuthUser` relied exclusively on `authKit.getAuthUser(ctx)`. That helper returns `null` when the AuthKit component user record is not yet available (or sync is delayed/missing), even if the JWT identity is valid and Convex has authenticated the request.

This created a mismatch:
- Convex auth transport considered the user authenticated.
- App-level auth helper treated the same request as unauthorized.

## Changes Made
Updated `/Users/nick/Designagency/convex/lib/auth.ts`:

1. Added `resolveAuthUser(ctx)`:
- First tries `authKit.getAuthUser(ctx)` (existing behavior).
- Falls back to `ctx.auth.getUserIdentity()` and normalizes identity claims.

2. Added identity normalization helpers:
- `toNonEmptyString`
- `splitDisplayName`
- `buildAuthUserFromIdentity`

3. Updated `requireAuthUser`:
- Uses `resolveAuthUser(ctx)` instead of only `authKit.getAuthUser(ctx)`.
- Keeps the same `Unauthorized` error only when both sources are unavailable.

## Result
Authenticated requests no longer fail in `dashboard:getSnapshot` just because AuthKit user-sync data is absent/delayed. Users can load `/tasks` after successful WorkOS sign-in.

## Validation
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run build` ✅
