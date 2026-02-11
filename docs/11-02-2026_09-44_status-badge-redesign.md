# Status Badge Redesign

**Date:** 11-02-2026 09:44

## Summary
Implemented the new status badge visual style using icon + text only (no badge background/border), with per-status icons and the requested accent color.

## Changes

### `src/app/components/status/StatusBadgeIcon.tsx`
- Added a reusable status icon component for badge rendering.
- Mapped project statuses to fitting icons:
  - `Draft` → `CircleDashed`
  - `Review` → `Eye`
  - `Active` → `PlayCircle`
  - `Completed` → `CheckCircle2`
  - Archived state uses `Archive`

### `src/app/components/main-content/ProjectOverview.tsx`
- Replaced the previous static vector status icon with `StatusBadgeIcon`.
- Updated badge layout to match the new style:
  - `display: inline-flex`
  - `padding: 4px 0`
  - `align-items: center`
  - `gap: 6px`
  - large pill radius (`16777200px`)
- Removed status background fill and border visuals.
- Applied requested icon/text color `#29FD7D` for non-archived projects.
- Preserved archived state treatment with neutral gray (`#9CA3AF`).

### `src/app/components/search-popup/SearchPopupListItems.tsx`
- Replaced the previous dot-based status chip indicator with `StatusBadgeIcon`.
- Applied the same inline badge style and color treatment (`#29FD7D`, no background/border).

## Validation
- `npm run lint` ✅
