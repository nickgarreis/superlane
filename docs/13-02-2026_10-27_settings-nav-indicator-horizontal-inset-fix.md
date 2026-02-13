# Settings nav indicator horizontal inset fix

## Date
- 13-02-2026 10:27

## Goal
- Fix asymmetric inner horizontal spacing in settings nav so left/right inset matches top/bottom inset.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - changed active-indicator position calculation from `offsetLeft`/`offsetWidth` to `getBoundingClientRect()` delta (`buttonRect.left - trackRect.left`, `buttonRect.width`).
  - kept the existing track/indicator visual padding (`top-1 bottom-1`) unchanged.

## Why
- `offset`-based positioning was producing inconsistent horizontal inset behavior in this layout.
- Bounds-based positioning aligns the active indicator to the visible button box consistently, preserving balanced inner spacing.

## Validation
- `npx vitest run /Users/nick/Designagency/src/app/components/SettingsPopup.test.tsx` ✅
