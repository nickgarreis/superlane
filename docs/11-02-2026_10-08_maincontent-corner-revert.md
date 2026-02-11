# MainContent Corner Revert

**Date:** 11-02-2026 10:08

## Summary
Reverted the earlier MainContent corner-radius removal and restored `32px` rounded corners.

## Changes
- Updated `src/app/components/MainContent.tsx`:
  - Restored `rounded-[32px]` on the main surface container.
  - Restored `rounded-[32px]` on the overlay wrapper.

## Validation
- Confirmed `MainContent.tsx` contains `rounded-[32px]` on both target wrappers.
- Confirmed `rounded-none` is no longer used on those wrappers.
