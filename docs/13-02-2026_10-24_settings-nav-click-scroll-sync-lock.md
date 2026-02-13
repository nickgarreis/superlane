# Settings nav click scroll sync lock

## Date
- 13-02-2026 10:24

## Goal
- Remove lag/backtracking of the settings nav active indicator when clicking nav buttons.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`:
  - added a click-navigation scroll lock (`navScrollTargetTopRef`) so scroll-based active-section syncing is temporarily paused during programmatic smooth scroll.
  - released the lock when the target scroll position is reached (with small tolerance) or after a safety timeout.
  - prevented `handleContentScroll` from overriding clicked active state while programmatic scroll is still in-flight.
  - added cleanup for lock timeout on unmount.

## Why
- Click navigation previously set the active tab immediately, but `handleContentScroll` could reset it to the previous section until the target section entered threshold, causing visible lag/back-jump.

## Validation
- `npx vitest run /Users/nick/Designagency/src/app/components/SettingsPopup.test.tsx` ✅
