# File Tables: Icon-Only Action Buttons

**Date:** 2026-02-09 21:45
**Type:** UI Consistency

## Summary

Replaced text-based "Download" and "Remove" buttons in all file tables with icon-only action buttons, matching the pattern already used in the Company Settings > Brand Assets table.

## Pattern

The icon buttons use lucide-react `Download` (blue, size 14) and `Trash2` (red on hover, size 14) icons, shown on row hover via `opacity-0 group-hover:opacity-100` transition. Both include `title` attributes for tooltip accessibility.

## Changes

### `src/app/components/MainContent.tsx`

1. **Added `Trash2` import** from lucide-react (alongside existing `Download`).
2. **Removed `DeleteButton` import** from `../../imports/DeleteButton` — no longer used.
3. **Replaced file row action buttons** (text "Download" pill + `DeleteButton` component) with icon-only buttons:
   - Download icon: `text-[#58AFFF] hover:text-[#7fc0ff]`
   - Trash icon: `text-white/20 hover:bg-red-500/10 hover:text-red-500 rounded-lg`

### `src/app/components/BrandAssets.tsx`

1. **Added `Download` and `Trash2` imports** from lucide-react.
2. **Removed `DeleteButton` import** from `../../imports/DeleteButton` — no longer used.
3. **Replaced `DeleteButton` wrapper** with two icon-only buttons (Download + Trash2), matching the same styling pattern.

## Files Modified

- `src/app/components/MainContent.tsx`
- `src/app/components/BrandAssets.tsx`
