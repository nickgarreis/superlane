# Favicon and SEO metadata

**Date:** 11-02-2026 18:43

## What changed
- Added favicon and web app icon assets under `public/` using the provided `logo.svg` source.
- Added social preview image asset under `public/` using the provided `social_banner.png` source.
- Added `public/site.webmanifest` for PWA/browser icon declarations.
- Updated `index.html` head metadata with:
  - favicon/icon links (`svg`, `ico`, `png`, apple touch, mask icon, manifest)
  - SEO baseline tags (`title`, `description`, `theme-color`, `robots`)
  - Open Graph tags (`og:type`, `og:site_name`, `og:title`, `og:description`, `og:image`, width/height)
  - Twitter card tags (`summary_large_image`, title/description/image)
- Added route-aware document title support in `src/app/App.tsx` via a small hook.
- Added SEO title mapping helper in `src/app/lib/seo.ts`.
- Added tests for title mapping in `src/app/lib/seo.test.ts`.

## Asset outputs
- `public/favicon.svg`
- `public/favicon.ico`
- `public/favicon-16x16.png`
- `public/favicon-32x32.png`
- `public/favicon-48x48.png`
- `public/apple-touch-icon.png`
- `public/android-chrome-192x192.png`
- `public/android-chrome-512x512.png`
- `public/safari-pinned-tab.svg`
- `public/site.webmanifest`
- `public/social_banner.png`

## Validation
- Ran `npm run test:frontend -- src/app/lib/seo.test.ts src/app/App.test.tsx`.
- Result: pass (`54` files, `166` tests passed).
- Ran `npm run build`.
- Result: pass, production bundle generated with updated `dist/index.html` metadata.
