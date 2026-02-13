# Account social logo container tightened

## Date
- 13-02-2026 10:32

## Goal
- Remove inner spacing around the social auth provider logo and increase logo size.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.tsx`:
  - removed the fixed-size icon wrapper (`size-11` + center box layout) to avoid extra inner spacing.
  - switched to a tight inline icon wrapper (`shrink-0 txt-tone-primary leading-none`).
  - increased provider icon size from `20` to `24`.

## Validation
- `npx vitest run /Users/nick/Designagency/src/app/components/settings-popup/AccountTab.test.tsx` ✅
