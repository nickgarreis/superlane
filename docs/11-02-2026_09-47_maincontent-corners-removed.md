# MainContent Corner Radius Removal

**Date:** 11-02-2026 09:47

## Summary
Removed `32px` corner radius from the main content surface.

## Changes
- Updated `src/app/components/MainContent.tsx`:
  - Replaced `rounded-[32px]` with `rounded-none` on the main surface container.
  - Replaced `rounded-[32px]` with `rounded-none` on the overlay wrapper.

## Validation
- Verified `MainContent.tsx` no longer contains `rounded-[32px]` and now uses `rounded-none` for the affected wrappers.
