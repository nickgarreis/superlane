# Modal transition suspense fallback suppression

## Date
- 13-02-2026 11:38

## Goal
- Remove the reload-like full-screen loading flash during modal-to-modal transitions (notably Search -> Draft/Pending/Completed detail routes).

## What changed
- Updated `/Users/nick/Designagency/src/app/dashboard/components/DashboardPopups.tsx`:
  - Added modal transition tracking refs:
    - `wasAnyPopupOpenRef`
    - `suppressNextPopupFallbackRef`
  - Added computed popup-open state across all modal surfaces.
  - Replaced hardcoded `PopupLoadingFallback` in all popup `Suspense` boundaries with a dynamic `popupFallback`:
    - `null` during modal-to-modal transitions
    - full-screen fallback only for non-transition cold loads.
  - In `handleSearchNavigate`, set `suppressNextPopupFallbackRef.current = true` before navigating to:
    - `completed-project:*`
    - `draft-project:*`
    - `pending-project:*`
  - Added effect to clear one-shot suppression once the next popup is open.

## Why
- The previous implementation always rendered a full-screen suspense overlay whenever the destination lazy module was still resolving, which looked like an app/page reload.
- This change keeps transitions visually continuous for popup handoffs while preserving fallback behavior for true cold-start modal mounts.

## Validation
- `npx eslint src/app/dashboard/components/DashboardPopups.tsx` ✅
- `npx vitest run src/app/dashboard/components/DashboardPopups.test.tsx` ✅
