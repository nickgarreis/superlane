# Calendar Position & Layout Fix

**Date:** 09-02-2026 22:30

## Problems

1. **Excessive inner padding** — The DayPicker base CSS (`react-day-picker/dist/style.css`) applies `.rdp-month { margin: 0 1em }` (16px horizontal margins inside the calendar). Combined with the `p-4` (16px) container padding and the `w-[280px]` fixed width, the calendar's internal grid was squeezed with large visible gaps on top, left, and bottom.

2. **Calendar exceeding parent on the right** — The total horizontal space required (table 224px + month margin 32px = 256px) exceeded the available inner width (280px - 32px padding = 248px), causing the day grid to overflow beyond the container's right edge.

3. **Overflow clipping** — The calendar dropdown used `position: absolute` inside containers with `overflow-hidden` and `overflow-y-auto`, causing it to be clipped when near the bottom of the viewport.

4. **Missing base CSS** — `ProjectTasks.tsx` didn't import the DayPicker base stylesheet. Layout styles were only available if the lazy-loaded `CreateProjectWizardDialog` had been opened first.

## Changes

### `src/styles/theme.css`

- **Reset `.rdp-month` margin to `0`** — eliminates the 16px side margins from the base stylesheet that caused the overflow.
- **Set `.rdp-table { width: 100% }`** — table fills its container naturally.
- **Fixed `.rdp-caption` layout** — explicit flex layout with `margin-bottom: 8px` for consistent header spacing.
- **Added `.rdp-caption_label { padding: 0 }`** — removes stray padding from the month label.
- **Added `.rdp-nav` flex layout** — navigation buttons align cleanly with a 2px gap.
- **Refined `.rdp-nav_button`** — 28px square with explicit flex centering and border-radius.
- **Refined `.rdp-head_cell`** — 11px font, removed fixed height, tighter padding.
- **Added `.rdp-cell { padding: 1px }`** — compact cell spacing.
- **Explicit day sizing** — `width` and `height` pinned to `var(--rdp-cell-size)`.

### `src/app/components/ProjectTasks.tsx`

- **Added `import "react-day-picker/dist/style.css"`** — ensures base DayPicker layout is always loaded.
- **Added portal rendering** — calendar renders via `createPortal` at `document.body` level with `position: fixed`, escaping overflow containers.
- **Removed fixed `w-[280px]`** — container auto-sizes to fit content. Padding reduced from `p-4` to `p-3`.
- **Smart viewport-aware positioning** — drops below trigger by default, flips above when insufficient space, clamps horizontally.

## Validation

- `tsc --noEmit` passes cleanly.
- `npm run build` passes cleanly.
- Calendar visually verified — compact layout, no overflow, proper day grid alignment.
