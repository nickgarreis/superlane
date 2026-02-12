# Remove notifications autosave status text

**Date:** 12-02-2026 13:47

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/NotificationsTab.tsx`.
- Removed the footer autosave status text block that showed:
  - `Changes pending...`
  - `Auto-saving...`
  - `Saved`
- Removed related local status state/timers that only powered that UI text.
- Kept existing autosave behavior for toggle changes (debounced save + error toast) intact.

## Validation
- `npx vitest run src/app/components/settings-popup/NotificationsTab.test.tsx` ✅
- `npx eslint src/app/components/settings-popup/NotificationsTab.tsx` ✅
