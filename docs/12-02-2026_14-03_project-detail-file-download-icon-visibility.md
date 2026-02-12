# Project detail file records: download icon visibility fix

## Date
- 12-02-2026 14:03

## Problem
- In project detail file records, action icons (including Download) were effectively hidden because the action container used `opacity-0` and only became visible on row hover.
- In non-hover contexts this looked like the download icon was removed.

## Changes made
- Updated `/Users/nick/Designagency/src/app/components/main-content/MainContentFileRows.tsx`.
- Changed file-row action container classes in both virtualized and non-virtualized render paths:
  - From: `opacity-0 group-hover:opacity-100 ...`
  - To: `opacity-100 ...`
- This keeps download/remove icons visible for each file record in project detail.

## Validation
- `npx eslint src/app/components/main-content/MainContentFileRows.tsx` ✅
- `npx vitest run src/app/components/MainContent.test.tsx` ✅
