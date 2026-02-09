# Search Popup Highlight Navigation Reliability Fix

**Date:** 2026-02-09 20:47
**Type:** UX Improvement

## Summary

Fixed search-result navigation so task/file clicks reliably scroll to and flash the target row in the destination project (same behavior as `@mention` clicks).

## Root Cause

`pendingHighlight` state was not scoped to a target project and could be consumed/cleared by the currently rendered `MainContent` during navigation, before the destination project view mounted.

## Changes

### `src/app/DashboardApp.tsx`

1. Extended `PendingHighlight` with `projectId`.
2. Updated `SearchPopup` highlight callback wiring to persist `{ projectId, ...highlight }`.

### `src/app/components/MainContent.tsx`

1. Updated `pendingHighlight` prop type to include optional `projectId`.
2. Added guard to only consume highlight when `pendingHighlight.projectId` matches `project.id`.
3. Changed behavior to clear pending highlight only after successful consumption.
4. Improved file matching to prefer same `fileTab` + `fileName`, with name fallback.

## Verification

- `npm run typecheck` ✅
- `npm run test:frontend` ✅

## Files Modified

- `src/app/DashboardApp.tsx`
- `src/app/components/MainContent.tsx`
- `docs/09-02-2026_20-47_search-highlight-navigation-fix.md`
