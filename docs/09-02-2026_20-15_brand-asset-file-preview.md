# Brand Asset File Preview Thumbnails

**Date:** 09-02-2026 20:15
**Scope:** UI — WorkspaceSettings brand asset rows

## What changed

Re-implemented file preview thumbnails on brand asset rows in the Settings popup (WorkspaceSettings component).

### File modified

- `src/app/components/SettingsPopup.tsx`

### Changes

1. **Added Figma thumbnail asset imports** — same 5 static file-type icons already used in `MainContent.tsx` (`imgFile1`–`imgFile5`), plus a `FILE_THUMBNAIL_BY_TYPE` lookup map.

2. **Added `getAssetPreviewSrc` helper** — picks the best preview source for a brand asset:
   - If the asset has an `image/*` MIME type and a `downloadUrl`, uses the real file URL as a live image preview.
   - Otherwise, falls back to the static type-appropriate icon (e.g. PDF icon for `.pdf` files).

3. **Refactored brand asset row markup** — changed from a flat text-only layout to a three-part row matching the project file rows in `MainContent.tsx`:
   - `[thumbnail]  [name + metadata]  [download] [remove]`
   - Thumbnail container: `w-10 h-12`, white background, rounded, `object-cover` image.
   - Row styling: `gap-4`, `p-3`, `rounded-xl`, `hover:bg-white/5` for visual consistency.

### No backend changes

The `downloadUrl` (resolved from `storageId`) and `mimeType` fields were already returned by the `getCompanySettings` query in `convex/settings.ts`. No schema or API modifications were needed.
