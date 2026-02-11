# Web Design Service Image Replacement

**Date:** 11-02-2026 09:49

## Summary
Replaced the current Web Design service image with the user-provided AVIF asset.

## Changes
- Added new image asset:
  - `src/assets/web-design-service.avif` (copied from `/Users/nick/Downloads/AyewBjWWtBR1CCCHRf1jTwlj14.avif`).
- Updated Web Design icon import in:
  - `src/app/components/ProjectLogo.tsx`
  - from `figma:asset/820413fdaa936753e0f9da0659b241aa9b517efb.png`
  - to `../../assets/web-design-service.avif`

## Validation
- Confirmed `ProjectLogo` category mapping for `web design` and `webdesign` now resolves to the new AVIF asset.
