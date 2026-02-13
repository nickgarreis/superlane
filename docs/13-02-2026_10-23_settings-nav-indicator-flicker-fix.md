# Settings nav indicator flicker fix

## Date
- 13-02-2026 10:23

## Goal
- Fix active nav highlight flicker/disappear behavior when switching between settings tabs.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - added a persistent active-indicator element inside the nav track (always mounted).
  - replaced per-button conditional active background rendering with one shared indicator.
  - indicator position/width now sync from active button refs (`offsetLeft`, `offsetWidth`).
  - added `useLayoutEffect` + resize listener to keep indicator aligned and avoid visual gaps.
  - kept the same visual style (`bg-surface-active-soft`, `rounded-[6px]`) and smooth movement.

## Why
- The previous approach remounted active backgrounds per button, which could briefly clear the highlight during rapid state transitions.
- A single persistent indicator removes that unmount/remount flicker.

## Validation
- `npx vitest run /Users/nick/Designagency/src/app/components/SettingsPopup.test.tsx` ✅
