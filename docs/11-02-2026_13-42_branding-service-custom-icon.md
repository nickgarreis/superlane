# Branding Service Custom Icon

**Date:** 11-02-2026 13:42

## Summary
Configured the `Branding` service to use the uploaded custom AVIF image instead of the default Outlook-style fallback icon.

## What Changed
- Copied uploaded image into project assets:
  - `/Users/nick/Designagency/src/assets/branding-service.avif`
- Updated service icon mapping in:
  - `/Users/nick/Designagency/src/app/components/ProjectLogo.tsx`
- Added `Branding` icon import and map entry:
  - `import imgBranding from "../../assets/branding-service.avif"`
  - `branding: imgBranding`

## Validation
- `npx eslint /Users/nick/Designagency/src/app/components/ProjectLogo.tsx` (pass)
