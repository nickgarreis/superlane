# AccountTab error tone + draft/review route origin guard

## Date
- 12-02-2026

## Goal
Address two UI/navigation issues:
- make password reset error feedback visually distinct from success feedback in Account settings
- prevent project detail routes from being recorded as navigation origin in draft/review project route guard

## What changed
- Updated password reset error text tone in:
  - `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.tsx`
  - changed error message class from `txt-tone-faint` to `txt-tone-danger` for `passwordResetStatus === "error"`

- Updated origin path tracking logic in:
  - `/Users/nick/Designagency/src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.ts`
  - added `isProjectRoute(path)` predicate using `/project/` prefix
  - changed `lastOriginPathRef.current` update to run only when previous path exists and is not a project route
  - kept `previousPathRef.current = locationPathname` behavior unchanged

## Validation
- `npm run lint -- src/app/components/settings-popup/AccountTab.tsx src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.ts` ✅
