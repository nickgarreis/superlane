# Account reset password button absolute and smaller

## Date
- 13-02-2026 10:48

## Goal
- Make the reset password button smaller and absolutely positioned so the password input container can occupy full width.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.tsx`:
  - changed the password input/button wrapper from flow layout to `relative` positioning.
  - made the password input full width with right padding (`w-full pr-28`) to reserve room for the overlaid button.
  - changed the reset button to a smaller style (`h-7`, `px-2`, `txt-role-body-xs`) and positioned it absolutely (`right-0 top-1/2 -translate-y-1/2`).

## Validation
- `npx vitest run src/app/components/settings-popup/AccountTab.test.tsx` ✅
