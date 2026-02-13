# Settings nav buttons UI refresh

## Date
- 13-02-2026 10:18

## Goal
- Restyle settings panel navigation buttons to use a darker grouped container, no inter-button gaps, no button backgrounds, and an animated active-state background.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - imported `motion` from `motion/react`.
  - replaced the segmented button row with a grouped dark strip (`bg-bg-muted-surface`) wrapper.
  - removed per-button border/background styling and removed spacing between adjacent buttons.
  - added a separate active indicator element:
    - `motion.span` with `layoutId="settings-nav-active-indicator"`
    - light gray background (`bg-surface-active-soft`)
    - `rounded-[6px]` corners
    - spring transition so the indicator smoothly flows to the next active button.

## Validation
- `npx vitest run src/app/components/SettingsPopup.test.tsx` ✅
