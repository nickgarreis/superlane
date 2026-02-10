# Settings Avatar Transition Stabilization

**Date:** 2026-02-10 11:45

## Context
When opening account settings, the profile image could appear to "zoom out" due to a fast source swap during initial render (fallback avatar source resolving first, then account settings avatar resolving shortly after).

## Changes

- **`src/app/dashboard/useDashboardData.ts`**
  - Changed `getAccountSettings` query loading condition from `isAuthenticated && isSettingsOpen` to `isAuthenticated`.
  - This preloads account settings so account data is typically ready before the popup opens.

- **`src/app/dashboard/hooks/useDashboardSettingsData.ts`**
  - Added `fallbackAvatarUrl` argument.
  - Updated fallback account avatar source order to:
    1. `fallbackAvatarUrl`
    2. `user?.profilePictureUrl`
    3. `null`
  - This prioritizes the in-app viewer avatar source and reduces visible avatar source jumps.

- **`src/app/dashboard/DashboardShell.tsx`**
  - Passed `fallbackAvatarUrl: viewerIdentity.avatarUrl ?? viewerFallback.avatarUrl` into `useDashboardSettingsData`.

## Validation

- `npx eslint src/app/dashboard/DashboardShell.tsx src/app/dashboard/useDashboardData.ts src/app/dashboard/hooks/useDashboardSettingsData.ts` ✅
- `npm run typecheck` ✅
