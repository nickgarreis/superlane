# Search Popup Null Safety + Navigation Destination Type Alignment

**Date:** 2026-02-09 21:19
**Type:** Type safety hardening

## Summary

Implemented two targeted type-safety fixes:

1. `SearchPopup` task indexing now defensively handles missing assignee names by deriving `assigneeName` with a fallback of `"Unassigned"`.
2. Dashboard navigation back-target typing now uses a shared alias so `MainContentNavigationActions.backTo` and `DashboardContentModel.backTo` are aligned.

## Changes

### `/src/app/components/SearchPopup.tsx`

- Added `assigneeName` derivation with fallback:
  - `const assigneeName = task.assignee?.name?.trim() || "Unassigned";`
- Reused `assigneeName` for both:
  - `assigneeName` field in `taskIndex.push(...)`
  - task `searchable` string composition

### `/src/app/dashboard/types.ts`

- Added shared alias:
  - `export type NavigationDestination = "archive";`
- Updated `MainContentNavigationActions.backTo`:
  - from `string` to `NavigationDestination`
- Updated `DashboardContentModel` (`kind: "main"`) `backTo`:
  - from string literal to `NavigationDestination`

## Verification

- `npm run typecheck` ✅

## Files Modified

- `src/app/components/SearchPopup.tsx`
- `src/app/dashboard/types.ts`
- `docs/09-02-2026_21-19_searchpopup-navigationdestination-hardening.md`
