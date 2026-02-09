# React Types, Menu Scroll Handling, and Create Flow Fixes

**Date:** 09-02-2026 22:16

## Changes

### `package.json`
- Updated `@types/react` from `^19.2.13` to `^18.2.0`.
- Updated `@types/react-dom` from `^19.2.3` to `^18.2.0`.
- Kept `peerDependencies.react` and `peerDependencies.react-dom` at `18.3.1` so type packages and peer constraints now align with React 18.

### `src/app/components/chat-sidebar/ChatSidebarPanel.tsx`
- Extended the existing menu dismissal effect to also close open menus on scroll.
- Added scroll listeners on `window` and the scrollable comment list container (`scrollRef.current`) while menus are open.
- Added cleanup for those listeners in the effect return.
- Added a `CommentItem` effect that listens for scroll when that item's more-menu is open (`activeMoreMenu === comment.id` and `menuPos` exists) and closes it via `onSetActiveMoreMenu(null)`, preventing fixed-position menu misalignment during scroll.

### `src/app/components/create-project-popup/useDraftAttachments.ts`
- Refactored `handleRemoveAttachment` to move `onRemovePendingAttachment` side-effect outside the `setAttachments` state updater.
- It now:
  - Reads the target attachment by `clientId` first,
  - Performs synchronous state removal with `setAttachments(prev => prev.filter(...))`,
  - Calls `onRemovePendingAttachment` once (with error handling) when a `pendingUploadId` exists.

### `src/app/components/create-project-popup/CreateProjectWizardDialog.tsx`
- Fixed typo: `Project descripton` -> `Project description`.
- Changed `onCreate` prop typing to allow async handling: `(data) => Promise<unknown> | void`.
- Updated `createProject` to return a `Promise<void>` and propagate `onCreate` completion.
- Updated `handleNext` to be async and `await createProject("Review")`; now advances to step 4 only after successful project creation.
- Added try/catch in `handleNext` to handle failures and show error toast.
- Updated `handleConfirmSave` to async/await with error handling.
- Wrapped draft revert `onCreate` call with `Promise.resolve(...).catch(...)` to avoid unhandled async rejections.

### `src/app/dashboard/DashboardShell.tsx`
- Updated `handleCreateProject` to be async and return `Promise<void>`.
- Switched project create/update mutation flow from fire-and-forget (`void ...then`) to `await` with `try/catch`, and re-throw on failure so popup callers can prevent advancing on errors.
- Normalized `companySettings.members`, `companySettings.pendingInvitations`, and `companySettings.brandAssets` before passing to settings popup by filtering out `null` entries to satisfy strict typing.

### `src/app/dashboard/types.ts`
- Updated `ProjectCommands.createOrUpdateProject` return type from `void` to `Promise<void>` to match awaited create/update behavior.

### `src/app/dashboard/useDashboardCommands.ts`
- Updated `handleCreateProject` argument type to return `Promise<void>` and keep command typings consistent end-to-end.

### `src/app/components/settings-popup/CompanyBrandAssetsSection.tsx`
- Updated `aria-disabled` value from string literals to a boolean (`!canManageBrandAssets`) to satisfy React 18 `Booleanish` typing.

## Validation
- `npm run lint` ✅
- `npm run typecheck` ✅
