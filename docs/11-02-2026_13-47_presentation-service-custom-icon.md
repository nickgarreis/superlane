# Presentation Service Custom Icon

**Date:** 11-02-2026 13:47

## Summary
Configured the `Presentation` service to use the uploaded custom AVIF image instead of the default Outlook-style fallback icon.

## What Changed
- Copied uploaded image into project assets:
  - `/Users/nick/Designagency/src/assets/presentation-service.avif`
- Updated service icon mapping in:
  - `/Users/nick/Designagency/src/app/components/ProjectLogo.tsx`
- Added `Presentation` icon import and map entry:
  - `import imgPresentation from "../../assets/presentation-service.avif"`
  - `presentation: imgPresentation`

## Validation
- `npx eslint /Users/nick/Designagency/src/app/components/ProjectLogo.tsx` (pass)
- SHA-256 checksum match for copied asset:
  - `bb5775f8a33b9a5fa6d47ec5016f22ac1faf4b8bdd9c2b4eec9f7fa9e88e8737`
