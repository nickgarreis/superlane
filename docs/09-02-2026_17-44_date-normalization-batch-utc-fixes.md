# Date Normalization Batch + UTC Fixes

## Summary
Implemented targeted fixes across Convex and frontend date utilities/tests:

1. Replaced memory-heavy batch reads in normalization planning with query-level limiting:
- `ctx.db.query("projects").take(batchSize)`
- `ctx.db.query("tasks").take(batchSize)`
- `ctx.db.query("projectFiles").take(batchSize)`
- `ctx.db.query("workspaceBrandAssets").take(batchSize)`

2. Hardened `parseDisplayDateEpochMs` against non-finite numeric inputs so `normalizeString` is never called with numbers:
- finite number input still returns as-is
- non-finite number input now returns validated `fallbackEpochMs` or `null`
- string normalization now only receives string/null

3. Fixed `parseTaskDueDateEpochMs` year inference for `Mon dd` values:
- uses `createdAt` UTC month/day as reference
- rolls target year forward when parsed month/day is earlier than `createdAt`

4. Updated frontend date-only conversion to use UTC components:
- `toUtcNoonEpochMsFromDateOnly` now uses `getUTCFullYear/getUTCMonth/getUTCDate`

5. Made round-trip date helper test timezone-stable:
- replaced local `new Date(2026, 1, 9, ...)` with `new Date(Date.UTC(2026, 1, 9, ...))`
- added explicit UTC-noon epoch assertion for deterministic round-trip behavior

6. Added parser regression assertions:
- `Mon dd` parsing rolls to next year when `createdAt` is later in the year
- non-finite numeric display dates (`NaN`, `Infinity`) safely use fallback/null paths without string normalization errors

## Files Updated
- `/Users/nick/Designagency/convex/dateNormalization.ts`
- `/Users/nick/Designagency/convex/lib/dateNormalization.ts`
- `/Users/nick/Designagency/convex/__tests__/date_normalization.test.ts`
- `/Users/nick/Designagency/src/app/lib/dates.ts`
- `/Users/nick/Designagency/src/app/lib/dates.test.ts`

## Validation
- `npx vitest run convex/__tests__/date_normalization.test.ts src/app/lib/dates.test.ts` ✅
- `npm run typecheck` ✅
