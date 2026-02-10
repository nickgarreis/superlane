# Wizard + Quality Fixes

**Date:** 10-02-2026 21:18

## Summary
Applied targeted stability and correctness fixes across create-project wizard hooks, feature-size quality script path resolution, and dashboard workspace action tests.

## Changes

- `scripts/quality/check-feature-file-size.mjs`
  - Switched ESM path conversion to `fileURLToPath(import.meta.url)`.
  - Updated `ROOT` computation to avoid Windows pathname issues.

- `src/app/components/create-project-popup/hooks/useWizardEffects.ts`
  - Consolidated competing draft/review initialization effects into one effect.
  - Added explicit priority: `reviewProject` initialization first, otherwise `initialDraftData`.
  - Preserved category label mapping via `reviewCategoryLabels`.
  - Ensured all key setters are applied in one place (`setSelectedService`, `setProjectName`, `setSelectedJob`, `setDescription`, `setDeadline`, `setReviewComments`, `setIsAIEnabled`, `setStep`).

- `src/app/components/create-project-popup/hooks/useWizardReviewActions.ts`
  - Guarded `handleAddComment` against missing `user.userId` before constructing `ReviewComment`.
  - Prevents comments with undefined `author.userId`, preserving ownership checks in deletion flow.
  - Updated save-confirm flow to avoid closing when `createProject` returns `null` while `onCreate` exists.

- `src/app/components/create-project-popup/hooks/useWizardSubmission.ts`
  - Normalized AI-enabled comparisons using booleans to avoid false-positive draft dirtiness.
  - Updated new-project unsaved-work checks to include `attachments.length > 0` in both non-edit branches.
  - Changed uploading guard in `createProject` to return resolved `null` (no rejected Promise) after single toast.
  - Updated review submit flow to avoid stepping forward when `createProject` returns `null` and `onCreate` exists.
  - Made delete-draft fire-and-forget path explicit with Promise chain and error handling (`reportUiError` + toast) so failures are not silently swallowed.

- `src/app/dashboard/useDashboardWorkspaceActions.test.tsx`
  - Added assertion for `removeAvatarMutation` invocation payload.
  - Added assertion for `removeBrandAssetMutation` payload with workspace slug and brand asset id.

## Validation

- `npx eslint scripts/quality/check-feature-file-size.mjs src/app/components/create-project-popup/hooks/useWizardEffects.ts src/app/components/create-project-popup/hooks/useWizardReviewActions.ts src/app/components/create-project-popup/hooks/useWizardSubmission.ts src/app/dashboard/useDashboardWorkspaceActions.test.tsx` ✅
- `npm run typecheck:frontend` ✅
- `npx vitest run src/app/dashboard/useDashboardWorkspaceActions.test.tsx` ✅
- `npx vitest run src/app/components/create-project-popup/CreateProjectWizardDialog.test.tsx` ✅
- `node scripts/quality/check-feature-file-size.mjs` ✅
