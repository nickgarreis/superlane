# Project detail download lock removal

## Date
- 12-02-2026 14:12

## Problem
- Download icon appeared in project detail file rows but was locked with `Download unavailable` and did not trigger download.

## Root cause
- `/Users/nick/Designagency/src/app/components/main-content/MainContentFileRows.tsx` had an explicit guard:
  - For `file.downloadable === false`, button title changed to `Download unavailable`, style changed to disabled, and click returned early.
- This diverged from settings brand assets behavior where download always attempts.

## Changes made
- Updated `/Users/nick/Designagency/src/app/components/main-content/MainContentFileRows.tsx`:
  - Removed `downloadable === false` lock guard in both virtualized and non-virtualized row paths.
  - Download icon is now always clickable on hover and always invokes `fileActions.download(file.id)`.
  - Restored uniform `title="Download"` and pointer styling.

- Updated `/Users/nick/Designagency/src/app/components/MainContent.test.tsx`:
  - Replaced unavailable-lock test with regression test asserting that even `downloadable: false` rows still attempt download.

## Validation
- `npx eslint src/app/components/main-content/MainContentFileRows.tsx src/app/components/MainContent.test.tsx` ✅
- `npx vitest run src/app/components/MainContent.test.tsx src/app/lib/mappers.test.ts` ✅
