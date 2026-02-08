# Figma Asset Build Fix

## What Changed
- Updated `/Users/nick/Designagency/vite.config.ts` by adding a `figma-asset-resolver` Vite plugin.
- The plugin resolves imports starting with `figma:asset/` to absolute files under `/Users/nick/Designagency/src/assets/`.

## Why
- Production build failed because Rollup could not resolve Figma Make asset imports (example: `figma:asset/fea98b130b1d6a04ebf9c88afab5cd53fbd3e447.png`).
- The asset files were present on disk, but resolver logic for the `figma:asset/` scheme was missing.

## Validation
- Ran `./node_modules/.bin/vite build`.
- Build completed successfully with emitted PNG assets and no unresolved `figma:asset/*` errors.
- Remaining output only includes a chunk-size warning, not a build failure.
