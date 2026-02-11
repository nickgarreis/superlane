# Expanded Project Service Catalog in Create Project Wizard

**Date:** 11-02-2026 13:33

## Summary
Added four new service types to the Create Project wizard and introduced service-specific scope options for each, while centralizing service/scope configuration for consistency across wizard, review, and edit flows.

## What Changed
- Added shared service configuration in `/Users/nick/Designagency/src/app/lib/projectServices.ts`:
  - New selectable services:
    - `Web Design`
    - `Branding`
    - `Presentation`
    - `Email Design`
    - `Product design`
  - New scope sets:
    - **Branding:** `From scratch`, `Refresh an existing brand`, `General brand assets`, `Brand guidelines`, `Logo design`, `Icons`, `Other`
    - **Presentation:** `Create something new`, `Revamp something existing`, `Refine something existing`, `Edit something existing`
    - **Email Design:** `Create something new`, `Revamp something existing`, `Refine something existing`, `Edit something existing`
    - **Product design:** `Web & mobile app design`, `Dashboard design`, `Digital assets (e.g. graphics or animations)`, `Product Design MVP`, `Other`
  - Added shared alias normalization + job-label helpers used by dashboard and wizard.
- Updated `/Users/nick/Designagency/src/app/components/create-project-popup/steps/StepService.tsx` to render service chips from the shared service catalog.
- Updated `/Users/nick/Designagency/src/app/components/create-project-popup/steps/StepDetails.tsx` to resolve scope label/options via shared service config instead of Web Design-only hardcoded logic.
- Updated `/Users/nick/Designagency/src/app/components/create-project-popup/CreateProjectWizardDialog.tsx` to clear selected scope when switching to a different service.
- Updated `/Users/nick/Designagency/src/app/components/create-project-popup/hooks/useCreateProjectWizardController.ts`, `/Users/nick/Designagency/src/app/components/create-project-popup/hooks/useWizardEffects.ts`, and `/Users/nick/Designagency/src/app/dashboard/hooks/projectActionMappers.ts` to reuse shared service alias normalization.
- Updated `/Users/nick/Designagency/src/app/components/create-project-popup/steps/StepDetailsStep2.tsx` to accept readonly scope arrays.
- Added coverage in `/Users/nick/Designagency/src/app/lib/projectServices.test.ts` for alias normalization, new service scope config, and unknown-service fallback behavior.

## Validation
- `npx eslint src/app/lib/projectServices.ts src/app/lib/projectServices.test.ts src/app/components/create-project-popup/CreateProjectWizardDialog.tsx src/app/components/create-project-popup/steps/StepService.tsx src/app/components/create-project-popup/steps/StepDetails.tsx src/app/components/create-project-popup/steps/StepDetailsStep2.tsx src/app/components/create-project-popup/hooks/useWizardSubmission.ts src/app/components/create-project-popup/hooks/useCreateProjectWizardController.ts src/app/components/create-project-popup/hooks/useWizardEffects.ts src/app/dashboard/hooks/projectActionMappers.ts` (pass)
- `npx vitest run src/app/lib/projectServices.test.ts src/app/components/create-project-popup/CreateProjectWizardDialog.test.tsx` (pass)
