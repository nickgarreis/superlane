# Linked identity sync unreachable cleanup removal

## Date
- 13-02-2026 12:23

## Goal
- Remove unreachable post-loop linked identity sync cleanup/reporting from the dashboard data layer retry loop.

## What changed
- Updated `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardDataLayer.ts`:
  - Removed dead code after the linked identity sync retry `for` loop that reset `linkedIdentitySyncSignatureRef` and reported `Linked identity sync exhausted retries`.
  - Removed now-unneeded `lastReason` tracking that only fed the unreachable report path.
  - Kept existing in-loop return paths unchanged, including the existing final-attempt/non-retryable cleanup (`linkedIdentitySyncSignatureRef.current = null`) and error reporting behavior.

## Validation
- `npx eslint src/app/dashboard/hooks/useDashboardDataLayer.ts` ✅
