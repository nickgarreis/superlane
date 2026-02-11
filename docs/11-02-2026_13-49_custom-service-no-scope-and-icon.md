# Custom Service Added (No Scope + Custom Icon)

**Date:** 11-02-2026 13:49

## Summary
Added a new `Custom` service option to the Create Project wizard, configured it to have no scope selection, and mapped it to the uploaded custom AVIF service icon.

## What Changed
- Updated `/Users/nick/Designagency/src/app/lib/projectServices.ts`:
  - Added `Custom` to `CREATE_PROJECT_SERVICES`.
  - Added `Custom` service config with empty `jobOptions` (no scopes).
  - Added `custom` alias in `SERVICE_NAME_ALIASES`.
  - Added `serviceRequiresJobSelection()` helper.
- Updated `/Users/nick/Designagency/src/app/components/create-project-popup/steps/StepDetailsStep2.tsx`:
  - Scope chip section now renders only when there are job/scope options.
  - For `Custom`, only project name is required on step 2.
- Updated `/Users/nick/Designagency/src/app/components/create-project-popup/hooks/useWizardSubmission.ts`:
  - Step 2 validation now requires `selectedJob` only for services that have scope options.
- Copied uploaded image into project assets:
  - `/Users/nick/Designagency/src/assets/custom-service.avif`
  - Source: `/Users/nick/Downloads/e9gzfl3eQDuCty2Uad86KYvx3xo.avif`
- Updated `/Users/nick/Designagency/src/app/components/ProjectLogo.tsx`:
  - Added `imgCustom` import.
  - Added `custom: imgCustom` to `SERVICE_ICON_MAP`.
- Updated tests in `/Users/nick/Designagency/src/app/lib/projectServices.test.ts`:
  - Added coverage for `custom` alias and no-scope behavior.

## Validation
- `npx eslint /Users/nick/Designagency/src/app/lib/projectServices.ts /Users/nick/Designagency/src/app/lib/projectServices.test.ts /Users/nick/Designagency/src/app/components/create-project-popup/steps/StepDetailsStep2.tsx /Users/nick/Designagency/src/app/components/create-project-popup/hooks/useWizardSubmission.ts /Users/nick/Designagency/src/app/components/ProjectLogo.tsx` (pass)
- `npx vitest run /Users/nick/Designagency/src/app/lib/projectServices.test.ts /Users/nick/Designagency/src/app/components/create-project-popup/CreateProjectWizardDialog.test.tsx` (pass)
