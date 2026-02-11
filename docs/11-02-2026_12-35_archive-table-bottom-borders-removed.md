# Archive Table Bottom Borders Removed

**Date:** 11-02-2026 12:35

## Summary
Removed bottom border dividers from the archive table on the archive page so the header and rows no longer render bottom lines.

## Changes
- Updated `/Users/nick/Designagency/src/app/components/ArchivePage.tsx`:
  - Removed `border-b border-white/5` from the archive table header row.
  - Removed `border-b border-white/5` from each archive project row.

## Validation
- Ran `npm run test:frontend -- src/app/components/ArchivePage.test.tsx`.
- Result: pass (frontend suite executed and all tests passed).
