# Settings Accessibility and Safety Fixes

**Date:** 09-02-2026

## Scope

Implemented requested fixes across settings popup components for accessibility, input safety, and debounce behavior.

## Changes

### `/src/app/components/settings-popup/AccountTab.tsx`
- Added keyboard accessibility to the avatar click target by adding `tabIndex={0}`, `role="button"`, `aria-label="Change avatar"`, and `onKeyDown` handling for `Enter`/`Space` to trigger the file picker.
- Added explicit label-input associations for account fields:
  - `First Name` label uses `htmlFor="firstName-input"` with matching input `id`.
  - `Last Name` label uses `htmlFor="lastName-input"` with matching input `id`.
  - `Email Address` label uses `htmlFor="email-input"` with matching input `id`.

### `/src/app/components/settings-popup/CompanyBrandAssetsSection.tsx`
- Updated `handleUploadBrandAsset` to capture the input element synchronously (`const input = event.currentTarget`) and clear via `input.value = ""` in `finally`.
- Updated upload label disabled behavior:
  - Conditional class behavior removes clickable affordance when disabled.
  - Added `aria-disabled` and `tabIndex` states tied to `canManageBrandAssets`.
  - Kept underlying input `disabled={!canManageBrandAssets}` and `onChange={handleUploadBrandAsset}`.

### `/src/app/components/settings-popup/CompanyMembersSection.tsx`
- Replaced direct `member.name.charAt(0).toUpperCase()` fallback with a safe computed fallback initial:
  - Uses first character from trimmed `member.name`, else trimmed `member.email`, else `"?"`.
  - Prevents calling string methods on undefined/empty values.

### `/src/app/components/settings-popup/CompanyTab.tsx`
- Fixed debounced workspace name save trigger behavior:
  - Added `hasEditedRef` to ensure autosave only runs after user edits.
  - Added `saveWorkspaceNameRef` to hold latest save callback and avoid effect retriggers due to callback identity changes.
  - Debounce effect now depends on `nameDraft`/permission and calls `saveWorkspaceNameRef.current`.
  - On `workspaceName` changes, clears pending debounce, resets edit flag, marks first render, and resets draft.
- Updated workspace name input:
  - Added `maxLength={100}`.
  - Added `disabled={!canManageMembers}` using existing logo-related permission capability.
  - Guarded `onChange` to no-op when disabled and set edit flag only on permitted edits.

### `/src/app/components/settings-popup/NotificationsTab.tsx`
- Updated toggle button semantics for screen readers:
  - Added `role="switch"`.
  - Added `aria-checked={checked}`.
  - Added `aria-labelledby` linked to a visible label id generated with `useId()`.

## Validation

- `npm run lint` passed.
- `npm run typecheck` passed.
