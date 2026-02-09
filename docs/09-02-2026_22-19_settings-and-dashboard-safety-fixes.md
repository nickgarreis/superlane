# Settings and Dashboard Safety Fixes

**Date:** 09-02-2026 22:19

## Changes

### `/Users/nick/Designagency/src/app/components/settings-popup/types.ts`
- Updated `CompanySettingsData` arrays to non-nullable contracts:
  - `members: CompanyMember[]`
  - `pendingInvitations: CompanyPendingInvitation[]`
  - `brandAssets: CompanyBrandAsset[]`

### `/Users/nick/Designagency/src/app/components/settings-popup/CompanyTab.tsx`
- Removed local null-filtering/type-guard code for company collections.
- Switched to direct usage of the now non-nullable arrays:
  - `const members = company?.members ?? []`
  - `const pendingInvitations = company?.pendingInvitations ?? []`
  - `const brandAssets = company?.brandAssets ?? []`

### `/Users/nick/Designagency/src/app/dashboard/DashboardShell.tsx`
- Prevented default-workspace creation retry loops by keeping `defaultWorkspaceRequestedRef.current` set after a failed `ensureDefaultWorkspace` attempt.
- Replaced `Date.now()` fallback project ID generation with a cryptographically strong suffix:
  - Added `getProjectPublicIdSuffix()` (`crypto.randomUUID()` preferred, `crypto.getRandomValues()` fallback).
  - Added `buildGeneratedProjectPublicId(name)` and used it in `publicId` assignment.
- Added accessibility attributes to decorative empty-state logo image:
  - `alt=""`
  - `aria-hidden="true"`
- Expanded company data normalization passed to settings popup by filtering nulls from:
  - `members`
  - `pendingInvitations`
  - `brandAssets`

### `/Users/nick/Designagency/src/app/dashboard/useDashboardData.ts`
- Updated active workspace selection to compare against `workspace.slug`.
- Wrapped active workspace lookup in `useMemo` with dependencies on:
  - `workspaces`
  - `snapshot?.activeWorkspaceSlug`
  - `activeWorkspaceSlug`

### `/Users/nick/Designagency/src/app/types.ts`
- Added `slug: string` to `Workspace` type.

### `/Users/nick/Designagency/src/app/lib/mappers.ts`
- Updated `mapWorkspacesToUi()` to set both:
  - `id: workspace.slug`
  - `slug: workspace.slug`

## Validation
- `npm run typecheck` ✅
- `npm run lint` ✅
