# Account login method list row gap increase

## Date
- 13-02-2026 12:06

## Goal
- Increase visual spacing between listed login methods in Settings > Account.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/account-tab/AuthMethodRows.tsx`:
  - changed auth methods list wrapper gap from `gap-3` to `gap-4` (`flex flex-col gap-4`).
  - kept per-row layout, icon alignment, labels, and actions unchanged.

## Validation
- `npx vitest run src/app/components/settings-popup/AccountTab.test.tsx` ✅

## Notes
- This is a UI-only spacing adjustment for row-to-row separation between listed auth methods.
