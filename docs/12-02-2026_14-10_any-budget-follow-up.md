# Any usage budget follow-up

**Date:** 12-02-2026 14:10

## Goal
Reduce repo-wide `any` token usage to satisfy `config/quality/any-usage-budgets.json` total budget.

## What changed
- Updated `/Users/nick/Designagency/convex/auth.ts`.
- Replaced multiple explicit callback parameter annotations from `: any` to inferred or explicit non-`any` shapes in org/invitation sync helpers.
- Added local callback helper type:
  - `IndexEqQuery` with `eq(field, value)` signature for `withIndex` callbacks where inference could not flow due `ctx: any` helper signatures.
- Kept runtime behavior unchanged; this pass is type-annotation cleanup only.

## Result
- Any budget improved from `206` to `195` total.
- Repo now passes the any usage gate.

## Validation
- `node scripts/quality/check-any-usage.mjs` ✅
  - `PASS any usage total: 195 (budget 200)`
- `npm run typecheck:backend` ✅
- `npm run lint` ✅
