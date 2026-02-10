# Remove Logo Buttons & Auto-Save Company Settings

**Date:** 2026-02-10 13:45

## Changes

Removed the "Upload logo" and "Remove logo" buttons from the Company settings tab. The logo avatar already supports click-to-upload (with a camera icon overlay on hover), so uploading is handled by clicking the avatar directly — no separate button needed. The workspace name was already auto-saved via debounce.

## Files Modified

- `src/app/components/settings-popup/CompanyTab.tsx` — Removed the two buttons, the `handleRemoveLogo` function, and the `onRemoveWorkspaceLogo` prop
- `src/app/components/settings-popup/types.ts` — Removed `onRemoveWorkspaceLogo` from `SettingsPopupProps`
- `src/app/components/SettingsPopup.tsx` — Removed `onRemoveWorkspaceLogo` prop destructuring and JSX usage
- `src/app/dashboard/useDashboardWorkspaceActions.ts` — Removed `handleRemoveWorkspaceLogo` callback, its return entry, and the `removeWorkspaceLogoMutation` param from the hook's type/destructuring
- `src/app/dashboard/DashboardShell.tsx` — Removed `removeWorkspaceLogoMutation` declaration and its pass-through to the hook and `SettingsPopup`

## Verification

- `npm run typecheck` — passes
- `npm run lint` — passes
