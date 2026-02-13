# Settings Google social logo replacement

## Date
- 13-02-2026 10:42

## Goal
- Replace the Google social provider icon shown in the settings account panel with the newly added `google logo.svg` asset.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.tsx`:
  - imported `/Users/nick/Designagency/google logo.svg` as `googleSocialLogo`.
  - added a `GoogleAuthIcon` component that renders the provided SVG asset at the same size used by provider icons.
  - changed `resolveAuthMethodIcon("GoogleOAuth")` to return `GoogleAuthIcon` instead of the `Chrome` icon from `lucide-react`.

## Validation
- `npx vitest run src/app/components/settings-popup/AccountTab.test.tsx` ✅
