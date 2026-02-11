# Settings Popup Main + Main Content Corner Removal

**Date:** 11-02-2026 11:46

## Summary
Removed corner radius from the Settings popup's main shell and main content container.

## Changes
- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - Added `rounded-none` to the outer shell container (main container).
  - Changed the inner main-content container from `rounded-[20px]` to `rounded-none`.

## Validation
- Ran `npm run test:frontend -- src/app/components/SettingsPopup.test.tsx`.
- Result: pass (frontend test suite executed by script, all tests passed).
