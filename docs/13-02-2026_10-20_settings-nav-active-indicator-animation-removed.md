# Settings nav active indicator animation removed

## Date
- 13-02-2026 10:20

## Goal
- Remove buggy active-indicator animation in settings navigation buttons.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - removed `motion` import from `motion/react`.
  - replaced animated `motion.span` active indicator with a static `<span>` active indicator.
  - kept the same active-state visual styling (`bg-surface-active-soft`, `rounded-[6px]`) without motion.

## Why
- The animated transition produced a visible double-move glitch during active state changes.

## Validation
- `npx vitest run /Users/nick/Designagency/src/app/components/SettingsPopup.test.tsx` ✅
