# File storage + search popup fixes

**Date:** 11-02-2026 19:29

## What changed
- Updated `convex/__tests__/file_storage.test.ts` in the `secondProject` inline insert path for the cursor-stability test.
  - Added missing `attachments: []` to align the inserted `projects` row with the schema and existing `seedProject` helper behavior.
- Updated `src/app/components/search-popup/useSearchPopupData.tsx` quick actions filtering loop.
  - Moved the `MAX_ACTION_RESULTS` break condition inside the match block so the loop only breaks after a matched action is actually pushed.

## Why
- The inline `projects` insert omitted a field that other test setup paths already include, creating schema mismatch risk.
- The quick actions loop could stop after iterating `MAX_ACTION_RESULTS` items even when very few items matched, causing missing expected matches.

## Validation
- Ran `npm run test:backend -- convex/__tests__/file_storage.test.ts` (pass).
- Ran `npm run test:frontend -- src/app/components/search-popup/useSearchPopupData.test.tsx` (pass).
