# Adjust Manage billing icon alignment and spacing

## Date
- 12-02-2026 13:56

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/CompanyTab.tsx`.
- Changed the `Manage billing` button from absolute-positioned icon layout to inline flex layout.
- Replaced button classes with `inline-flex items-center gap-1` to keep icon vertically centered and reduce spacing.
- Simplified icon classes to `pointer-events-none shrink-0` and removed absolute top/right positioning.

## Validation
- `npx eslint src/app/components/settings-popup/CompanyTab.tsx` ✅
- `npx vitest run src/app/components/settings-popup/CompanyTab.test.tsx` ✅
