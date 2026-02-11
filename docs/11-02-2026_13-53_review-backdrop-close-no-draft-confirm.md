# Review Backdrop Close Skips Draft Prompt

**Date:** 11-02-2026 13:53

## Summary
Fixed a wizard close-flow bug where clicking the backdrop on step 4 ("Your Project is in Review") incorrectly opened the "Save as draft?" confirmation.

## What Changed
- Updated `/Users/nick/Designagency/src/app/components/create-project-popup/hooks/useWizardSubmission.ts`:
  - `handleCloseClick` now treats `step === 4` the same as `reviewProject` mode and closes immediately.
  - Added `step` to the callback dependency list.
- Updated `/Users/nick/Designagency/src/app/components/create-project-popup/CreateProjectWizardDialog.test.tsx`:
  - Added regression test `closes without draft confirmation when clicking backdrop on step 4`.

## Validation
- `npx vitest run src/app/components/create-project-popup/CreateProjectWizardDialog.test.tsx` (pass)
