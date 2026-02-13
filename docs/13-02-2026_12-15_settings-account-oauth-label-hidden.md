# Settings account login methods hide OAuth label

## Date
- 13-02-2026 12:15

## Goal
- Remove the `OAuth` text shown in Settings > Account login method rows.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/account-tab/AuthMethodRows.tsx`:
  - added `shouldShowMethodLabel` guard so method labels are hidden when value is `OAuth`.
  - kept all other method labels (e.g. Single Sign-On, Passkey, External auth) unchanged.
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.test.tsx`:
  - adjusted assertions to confirm `OAuth` is not rendered in account login method rows.

## Validation
- `npx vitest run src/app/components/settings-popup/AccountTab.test.tsx` ✅
