# Convex Query-Safe Auth Provisioning Fix

## Issue
After the previous auth fallback patch, Convex queries started failing with:
- `TypeError: e.db.insert is not a function`
- at `requireAuthUser` in `/Users/nick/Designagency/convex/lib/auth.ts`

This happened in `Q(dashboard:getSnapshot)` where `ctx.db` is read-only.

## Root Cause
`requireAuthUser` attempted to auto-create `users` rows even when called from a query context. In Convex, query contexts expose a `DatabaseReader` (no `insert`), so write calls crash.

## Changes Made

### 1) Made `requireAuthUser` query-safe
Updated `/Users/nick/Designagency/convex/lib/auth.ts`:
- Before creating a user, checks `typeof ctx.db.insert === "function"`.
- If writes are unavailable, throws `ConvexError("Authenticated user is not provisioned")` instead of calling `insert`.
- Exported `getResolvedAuthUser(ctx)` for safe identity reads without writes.

### 2) Added bootstrap path in dashboard snapshot query
Updated `/Users/nick/Designagency/convex/dashboard.ts`:
- Catches `Authenticated user is not provisioned` from `requireAuthUser`.
- Resolves auth identity via `getResolvedAuthUser(ctx)`.
- Returns an empty but valid snapshot (`workspaces: []`, `projects: []`, `tasks: []`) with viewer info from identity claims.

This allows the frontend to continue and trigger `ensureDefaultWorkspace` mutation, which runs in write-capable context and provisions the user/workspace correctly.

## Result
- No query-time write errors.
- First load after auth can self-heal by provisioning in mutation flow.
- Dashboard no longer whitescreens from query context auth provisioning.

## Validation
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run build` ✅
