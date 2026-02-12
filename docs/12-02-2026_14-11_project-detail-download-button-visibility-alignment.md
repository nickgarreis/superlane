# Project detail download button visibility alignment with brand assets table

## Date
- 12-02-2026 14:11

## Problem
- In project detail file rows, only the Trash icon showed on hover for some records.
- Brand assets rows showed Download + Trash consistently.

## Comparison findings
- `/Users/nick/Designagency/src/app/components/settings-popup/CompanyBrandAssetsSection.tsx`
  - Always renders the Download button in each row.
- `/Users/nick/Designagency/src/app/components/main-content/MainContentFileRows.tsx`
  - Previously rendered Download only when `file.downloadable !== false`.
  - For files marked `downloadable: false`, Download icon was omitted entirely while Trash remained visible.

## Changes made
- Updated `/Users/nick/Designagency/src/app/components/main-content/MainContentFileRows.tsx`:
  - Always render the Download icon button in both virtualized and non-virtualized row paths.
  - Preserve hover-only visibility behavior (`opacity-0 group-hover:opacity-100`) exactly as before.
  - When `file.downloadable === false`, Download button is shown as disabled-style (`opacity-40`, `cursor-not-allowed`) and click is ignored.

- Updated tests in `/Users/nick/Designagency/src/app/components/MainContent.test.tsx`:
  - Added regression test to verify non-downloadable file rows still show the Download control but do not invoke download action.

## Validation
- `npx eslint src/app/components/main-content/MainContentFileRows.tsx src/app/components/MainContent.test.tsx src/app/lib/mappers.ts src/app/lib/mappers.test.ts` ✅
- `npx vitest run src/app/components/MainContent.test.tsx src/app/lib/mappers.test.ts` ✅
