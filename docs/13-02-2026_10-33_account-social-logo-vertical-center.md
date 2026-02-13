# Account social logo vertical center

## Date
- 13-02-2026 10:33

## Goal
- Vertically center the social auth provider logo in the account social-login row.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.tsx`:
  - added `self-center` to the provider icon wrapper class so the logo aligns vertically to the row content center.

## Validation
- `npx vitest run /Users/nick/Designagency/src/app/components/settings-popup/AccountTab.test.tsx` ✅
