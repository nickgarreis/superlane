# Project ID, Token, and Wizard Copy Fixes

**Date:** 09-02-2026 23:03

## Summary

Implemented three targeted fixes:
- Corrected wizard copy and simplified step config typing.
- Aligned project name fallback usage when generating public IDs.
- Hardened secure token generation to require cryptographic APIs and return a consistent token format.

## Changes

### `/Users/nick/Designagency/src/app/components/create-project-popup/CreateProjectWizardDialog.tsx`
- Updated step 3 title from `"Lets explore some possibilities"` to `"Let's explore some possibilities"`.
- Removed unnecessary type assertion in `getStep2Config`:
  - `jobIcons: ... ? WEB_DESIGN_SCOPE_ICONS : null`

### `/Users/nick/Designagency/src/app/dashboard/DashboardShell.tsx`
- Added `finalName` normalization before public ID creation:
  - `const finalName = projectData.name || "Untitled Project"`
- Passed `finalName` to both `buildProjectPublicId(finalName)` and `createProjectMutation({ name: finalName, ... })` to prevent mismatches.

### `/Users/nick/Designagency/src/app/lib/id.ts`
- Removed insecure `Math.random` fallback from `createSecureToken`.
- Added explicit error when secure crypto APIs are unavailable.
- Normalized token formatting to hexadecimal across both branches:
  - `crypto.randomUUID()` branch now returns contiguous hex (hyphens removed) and supports requested lengths.
  - `createRandomTokenFromBytes()` now converts bytes to hex (instead of base36) for consistent charset/format.

## Validation

- `npm run typecheck` ✅
