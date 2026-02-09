# Project Update: A11y and Safety Fixes

**Date:** 09-02-2026 23:51

## Scope
Implemented the requested targeted fixes across Convex and frontend dashboard/wizard code.

## Changes made

### 1) Owner-only Review -> Active guard parity
- **File:** `/Users/nick/Designagency/convex/projects.ts`
- Added the same owner-only guard used in `setStatus` to the `update` mutation status path.
- New check in `update` now throws `new ConvexError("Forbidden")` when:
  - `project.status === "Review"`
  - `args.status === "Active"`
  - `membership.role !== "owner"`

### 2) Create-project close confirm dialog accessibility + keyboard/focus behavior
- **File:** `/Users/nick/Designagency/src/app/components/create-project-popup/CreateProjectWizardConfirmDialogs.tsx`
- Added dialog semantics for the close-confirm modal:
  - `role="dialog"`
  - `aria-modal="true"`
  - `aria-labelledby={...}` bound to title id
- Added overlay keyboard handling:
  - `onKeyDown` closes modal on `Escape`
  - `Tab`/`Shift+Tab` focus trap keeps focus within dialog while open
- Added focus management:
  - captures previously focused element before open
  - moves focus into dialog (first focusable, else dialog container)
  - restores prior focus on close/unmount
- Made close-confirm action buttons explicitly non-submitting:
  - `type="button"` on Cancel and Save buttons

### 3) Wizard close button a11y/non-submit behavior
- **File:** `/Users/nick/Designagency/src/app/components/create-project-popup/WizardCloseButton.tsx`
- Added optional prop `ariaLabel?: string`.
- Updated button attributes to:
  - `type="button"`
  - `aria-label={ariaLabel ?? "Close"}`
- Preserved existing `onClick` and `className` behavior.

### 4) File remove mutation feedback on non-removal
- **File:** `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardFileActions.ts`
- Added `else` branch in `handleRemoveProjectFile` mutation handler.
- When `result.removed` is false, now shows:
  - `toast.info("File not found or already removed")`

### 5) Preserve deadline in edit fallback draft
- **File:** `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardProjectActions.ts`
- In `handleEditProject` fallback draft object, changed:
  - `deadlineEpochMs: null`
  - to `deadlineEpochMs: project.deadlineEpochMs ?? null`
- Prevents losing existing deadline when `draftData` is missing.

### 6) Approve-review action error handling
- **File:** `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardProjectActions.ts`
- Wrapped `handleApproveReviewProject` mutation and success flow in `try/catch`.
- On success: keeps `toast.success` + `navigateView`.
- On failure: logs and surfaces `toast.error(...)` with contextual message.

### 7) Defensive company settings array coercion
- **File:** `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardSettingsData.ts`
- Hardened `settingsCompanyData` derivation by coercing to arrays with `Array.isArray` before `.filter()` for:
  - `members`
  - `pendingInvitations`
  - `brandAssets`
- Avoids runtime exceptions when fields are missing/null.

## Validation

- `npx eslint convex/projects.ts src/app/components/create-project-popup/CreateProjectWizardConfirmDialogs.tsx src/app/components/create-project-popup/WizardCloseButton.tsx src/app/dashboard/hooks/useDashboardFileActions.ts src/app/dashboard/hooks/useDashboardProjectActions.ts src/app/dashboard/hooks/useDashboardSettingsData.ts` ✅
- `npm run typecheck` ✅
- `npm run test:frontend -- --run src/app/components/create-project-popup/CreateProjectWizardDialog.test.tsx` ⚠️ fails due pre-existing `React is not defined` errors in `src/app/components/permissions/DeniedAction.tsx` and `src/app/components/permissions/DeniedAction.test.tsx` (not introduced by this patch)
- `npm run lint` ⚠️ fails due pre-existing repository issues unrelated to this patch:
  - existing `react-hooks/exhaustive-deps` warnings in other files
  - component-size gate failure for `src/app/components/chat-sidebar/ChatSidebarPanel.tsx` (>1200 lines)
