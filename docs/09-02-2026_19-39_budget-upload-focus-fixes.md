# Budget Parsing + Upload Callback + Sidebar Focus Fixes

## Summary
Applied three targeted fixes:

- Hardened performance budget metric parsing to reject missing/invalid values instead of allowing `NaN`.
- Stabilized workspace slug resolution usage in draft upload/discard callbacks by memoizing resolver and using it in dependency arrays.
- Made Sidebar intent target keyboard-focusable so `onFocus` can actually fire.

## Files Updated

- `/Users/nick/Designagency/scripts/performance/check-budgets.mjs`
  - Added `parseFiniteMetric()` to validate each configured budget metric.
  - Added `assertFiniteMetrics()` and applied it to both measured and budget metric maps before checks.
  - Replaced direct `Number(...)` coercion in `budgets` with validated parsing.

- `/Users/nick/Designagency/src/app/DashboardApp.tsx`
  - Converted `resolveUploadWorkspaceSlug` to `useCallback` with `[activeWorkspace?.id, resolvedWorkspaceSlug]`.
  - Updated `handleUploadDraftAttachment` dependencies to include `resolveUploadWorkspaceSlug`.
  - Updated `handleDiscardDraftSessionUploads` dependencies to include `resolveUploadWorkspaceSlug`.

- `/Users/nick/Designagency/src/app/components/Sidebar.tsx`
  - Added `tabIndex={onIntent ? 0 : undefined}` on the project row container so `onFocus={onIntent}` is reachable via keyboard.

## Validation

- `npm run lint` ✅
- `npm run typecheck` ✅
