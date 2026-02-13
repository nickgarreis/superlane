# Settings heading size and vertical centering

## Date
- 13-02-2026 10:28

## Goal
- Increase the `Settings` heading size slightly and vertically center it in the settings header row.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - changed the header row alignment from `items-start` to `items-center`.
  - increased header icon size from `16` to `17`.
  - increased heading size by adding `text-[18px] leading-[1.35]` to the `Settings` title.
  - removed `mt-0.5` from the close button class so it aligns vertically with the centered header row.

## Validation
- `npx vitest run /Users/nick/Designagency/src/app/components/SettingsPopup.test.tsx` ✅
