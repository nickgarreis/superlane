# Favicon full-bleed fix

**Date:** 11-02-2026 19:23

## What changed
- Removed fixed `width`/`height` attributes from favicon SVG sources so rasterization uses the full `viewBox` area:
  - `logo.svg`
  - `public/logo.svg`
  - `public/favicon.svg`
  - `public/safari-pinned-tab.svg`
- Regenerated all favicon/app icon PNG assets from the corrected SVG source:
  - `public/favicon-16x16.png`
  - `public/favicon-32x32.png`
  - `public/favicon-48x48.png`
  - `public/apple-touch-icon.png`
  - `public/android-chrome-192x192.png`
  - `public/android-chrome-512x512.png`
- Rebuilt `public/favicon.ico` to include multi-size icon entries (16x16, 32x32, 48x48) using the corrected full-bleed PNGs.

## Root cause
- The favicon SVG files had explicit dimensions (`width="64" height="64"`).
- The rasterization path that produced PNG/ICO assets treated the icon art as a fixed-size object and placed it on larger canvases, causing visible empty space in favicon renders.

## Validation
- Verified generated PNG corner pixels are all opaque brand background color (no transparent margin).
- Confirmed `favicon.ico` now contains multiple embedded icon sizes.
- Visual spot-check passed for `public/favicon-32x32.png` and `public/apple-touch-icon.png`.
