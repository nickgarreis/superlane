# Dashboard API handlers test count fix

## Date
- 13-02-2026 10:03

## Goal
- Unblock frontend test suite by updating stale handler-count expectation in `useDashboardApiHandlers` test.

## What changed
- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardApiHandlers.test.tsx`:
  - changed expected key count from `45` to `47` in `maps convex action/mutation hooks into dashboard handlers`.

## Why
- The hook currently exposes 47 handlers, while the test still asserted 45.
- This mismatch caused a deterministic failure in `npm run test:frontend`.

## Validation
- `npx vitest run src/app/dashboard/hooks/useDashboardApiHandlers.test.tsx` ✅
- `npm run test:frontend` ✅ (`68` files, `283` tests passed)
