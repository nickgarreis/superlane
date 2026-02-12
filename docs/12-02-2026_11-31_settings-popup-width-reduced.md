# Settings popup width reduced

**Date:** 12-02-2026 11:31

## What changed
- Reduced the settings popup shell max width from `760px` to `700px`.
- Updated file: `src/app/components/SettingsPopup.tsx`.

## Why
- Match request to make the settings dialog less wide while preserving existing layout and behavior.

## Validation
- `npx vitest run src/app/components/SettingsPopup.test.tsx` ✅
