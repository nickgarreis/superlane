# Status Active Tokenization

**Date:** 11-02-2026 13:08

## Summary
Tokenized the Active status badge green color and removed the hard-coded color value from the project status map.

## What Changed
- Updated `/Users/nick/Designagency/src/styles/theme.css`:
  - Added `--status-active: #29fd7d;` to root tokens.
  - Added `--color-status-active: var(--status-active);` in `@theme inline` mappings.
- Updated `/Users/nick/Designagency/src/app/lib/status.ts`:
  - Changed `PROJECT_STATUS_STYLES.Active.color` from `#29FD7D` to `var(--status-active)`.

## Notes
- No behavior changes expected beyond sourcing the Active badge color from a reusable token.
- No tests were run for this styling token update.
