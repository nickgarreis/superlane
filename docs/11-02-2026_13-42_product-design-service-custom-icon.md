# Product Design Service Custom Icon

**Date:** 11-02-2026 13:42

## Summary
Configured the `Product design` service to use the uploaded custom AVIF image instead of the default Outlook-style fallback icon.

## What Changed
- Copied uploaded image into project assets:
  - `/Users/nick/Designagency/src/assets/product-design-service.avif`
- Updated service icon mapping in:
  - `/Users/nick/Designagency/src/app/components/ProjectLogo.tsx`
- Added `Product design` icon import and map entries:
  - `import imgProductDesign from "../../assets/product-design-service.avif"`
  - `"product design": imgProductDesign`
  - `productdesign: imgProductDesign`

## Validation
- `npx eslint /Users/nick/Designagency/src/app/components/ProjectLogo.tsx` (pass)
