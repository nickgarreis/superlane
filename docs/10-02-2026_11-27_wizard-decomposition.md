# Create Project Wizard Decomposition

**Date:** 10-02-2026 11:27

## Scope
Reduced `CreateProjectWizardDialog.tsx` further by extracting service/details UI blocks and wizard orchestration logic into dedicated modules, while preserving behavior and existing tests.

## Changes

### 1) Extracted controller hook
- **New file:** `/Users/nick/Designagency/src/app/components/create-project-popup/hooks/useCreateProjectWizardController.ts`
- Moved wizard orchestration out of the dialog component:
  - reducer wiring and state transitions
  - draft/review initialization effects
  - upload/session lifecycle handling
  - create/update/draft persistence handlers
  - review comment actions and review approval/delete permissions
  - close/save/cancel/delete confirm logic

### 2) Extracted step components
- **New file:** `/Users/nick/Designagency/src/app/components/create-project-popup/steps/StepService.tsx`
  - step 1 service selection UI and keyboard interaction handling.
- **New file:** `/Users/nick/Designagency/src/app/components/create-project-popup/steps/StepDetails.tsx`
  - step 2 project name/scope section
  - step 3 description/attachments/AI toggle/deadline calendar section
  - exports `STEP_THREE_TITLE` and `getStepDetailsJobLabel` helper.

### 3) Slimmed dialog container
- **Updated file:** `/Users/nick/Designagency/src/app/components/create-project-popup/CreateProjectWizardDialog.tsx`
- Converted to composition-only container:
  - calls `useCreateProjectWizardController`
  - renders `StepService`, `StepDetails`, and existing `StepReview`
  - keeps shared shell/header/footer/confirm-dialog rendering

## Size impact
- `CreateProjectWizardDialog.tsx`: **957 → 277 lines**
- Component size gate now passes without warning for this file.

## Validation
- `npx eslint src/app/components/create-project-popup/CreateProjectWizardDialog.tsx src/app/components/create-project-popup/hooks/useCreateProjectWizardController.ts src/app/components/create-project-popup/steps/StepService.tsx src/app/components/create-project-popup/steps/StepDetails.tsx` ✅
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run test:frontend -- --run src/app/components/create-project-popup/CreateProjectWizardDialog.test.tsx` ✅
- `node scripts/quality/check-component-size.mjs` ✅

## Notes
- Existing expected stderr from the negative-path wizard test (`create failed`) remains unchanged and does not fail the suite.
