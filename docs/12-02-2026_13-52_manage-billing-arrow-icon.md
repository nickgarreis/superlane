# Add top-right arrow icon to Manage billing button

## Date
- 12-02-2026 13:52

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/CompanyTab.tsx`.
- Imported `ArrowUpRight` from `lucide-react`.
- Updated the `Manage billing` button to be `relative` and reserved right-side padding for an icon.
- Added an `ArrowUpRight` icon positioned at the top-right inside the button (`absolute top-1.5 right-2`) with `aria-hidden` and `pointer-events-none`.

## Validation
- `npx eslint src/app/components/settings-popup/CompanyTab.tsx` ✅
- `npx vitest run src/app/components/settings-popup/CompanyTab.test.tsx` ✅
