# Service Icons Set To Fit (Not Fill)

**Date:** 11-02-2026 13:50

## Summary
Updated service icon rendering so mapped service images use fit behavior (`contain`) instead of fill/crop behavior (`cover`).

## What Changed
- Updated `/Users/nick/Designagency/src/app/components/ProjectLogo.tsx`:
  - Changed image class from `object-cover` to `object-contain` for service image rendering.

## Notes
- All service icon assets (`Web Design`, `Branding`, `Presentation`, `Email Design`, `Product design`, `Custom`) are rendered via `ProjectLogo`, so this applies everywhere those icons appear in the app.

## Validation
- `npx eslint /Users/nick/Designagency/src/app/components/ProjectLogo.tsx` (pass)
