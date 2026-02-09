# Search and Mention Highlight Color Unification (Grey)

**Date:** 2026-02-09 20:49
**Type:** UX Polish

## Summary

Unified task and file row highlight flashes to a neutral grey tone so navigation highlights feel consistent across the app.

## Changes

### `/src/styles/theme.css`

1. Updated `@keyframes taskRowFlash` from blue-tinted values to neutral grey (`rgba(255,255,255, ...)`).
2. Updated `@keyframes fileRowFlash` from orange-tinted values to the same neutral grey sequence.
3. Kept animation timing and behavior unchanged (`1.6s ease-out`).

## Verification

- `npm run test:frontend` ✅

## Files Modified

- `src/styles/theme.css`
- `docs/09-02-2026_20-49_search-highlight-grey-unification.md`
