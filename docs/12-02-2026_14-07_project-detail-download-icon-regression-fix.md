# Project detail download icon regression fix

## Date
- 12-02-2026 14:07

## Problem
- In project detail file rows, Trash icon appeared but Download icon was missing despite hover behavior being correct.
- The icon render condition is `file.downloadable !== false`, but mapper logic was coercing missing `downloadable` to `false`.

## Root cause
- `/Users/nick/Designagency/src/app/lib/mappers.ts` used:
  - `downloadable: file.downloadable ?? false`
- When backend/client data omitted `downloadable` (undefined), this converted it to `false`, which suppressed only the Download icon.

## Changes made
- Updated `/Users/nick/Designagency/src/app/lib/mappers.ts`:
  - `downloadable: file.downloadable`
- Hover-only action visibility in `/Users/nick/Designagency/src/app/components/main-content/MainContentFileRows.tsx` remains unchanged.
- Added regression tests in `/Users/nick/Designagency/src/app/lib/mappers.test.ts`:
  - Undefined `downloadable` stays undefined.
  - Explicit `downloadable: false` stays false.

## Validation
- `npx eslint src/app/lib/mappers.ts src/app/lib/mappers.test.ts src/app/components/main-content/MainContentFileRows.tsx` ✅
- `npx vitest run src/app/lib/mappers.test.ts src/app/components/MainContent.test.tsx` ✅
