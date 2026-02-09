# Task Add Lock Tooltip: Minimal UI + Faster Hover

**Date:** 09-02-2026 23:07

## Summary

Refined the locked `+ Add Task` hover message so it matches the project’s minimal UI style and appears faster.

## Changes

### `/Users/nick/Designagency/src/app/components/ProjectTasks.tsx`
- Replaced native browser tooltip (`title`) with an inline custom tooltip.
- Styled tooltip to match existing minimal overlays/dropdowns:
  - dark translucent surface (`rgba(30,31,32,0.98)`)
  - subtle border (`rgba(232,232,232,0.12)`)
  - compact rounded shape and muted text.
- Tooltip now appears immediately on hover with a short transition (`duration-75`) and no browser delay.
- Kept the same message text:
  - `Tasks can only be created for active projects`

## Validation

- `npx eslint src/app/components/ProjectTasks.tsx` ✅
