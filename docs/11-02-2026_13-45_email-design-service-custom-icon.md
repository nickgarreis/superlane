# Email Design Service Custom Icon

**Date:** 11-02-2026 13:45

## Summary
Configured the `Email Design` service to use the uploaded custom AVIF image instead of the default Outlook-style fallback icon.

## What Changed
- Copied uploaded image into project assets:
  - `/Users/nick/Designagency/src/assets/email-design-service.avif`
- Updated service icon mapping in:
  - `/Users/nick/Designagency/src/app/components/ProjectLogo.tsx`
- Added `Email Design` icon import and map entries:
  - `import imgEmailDesign from "../../assets/email-design-service.avif"`
  - `"email design": imgEmailDesign`
  - `emaildesign: imgEmailDesign`

## Validation
- `npx eslint /Users/nick/Designagency/src/app/components/ProjectLogo.tsx` (pass)
