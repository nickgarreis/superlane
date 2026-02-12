# Create project step-1 auto-advance and next-button removal

## Date
- 12-02-2026 16:11

## Goal
In the first page of the create-project popup, immediately route users to step 2 when they select a service, and remove the `Next` button from step 1 only.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/create-project-popup/CreateProjectWizardDialog.tsx`:
  - step-1 service selection now advances to step 2 immediately (`setStep(2)`)
  - selecting a different service still resets the selected job; selecting the same service no longer clears job selection
  - step-1 no longer renders the `Next` button; `Next` remains for later steps
- Updated `/Users/nick/Designagency/src/app/components/create-project-popup/steps/StepService.tsx`:
  - removed guard that blocked re-selecting the currently selected service so any service click can trigger the step advance callback
- Updated `/Users/nick/Designagency/src/app/components/create-project-popup/CreateProjectWizardDialog.test.tsx`:
  - added test coverage for step-1 `Next` button absence and immediate transition to step 2 after selecting a service
  - added test ensuring users can still advance when clicking the already-selected service after navigating back to step 1

## Validation
- `npm test -- src/app/components/create-project-popup/CreateProjectWizardDialog.test.tsx` ✅
- `npx eslint src/app/components/create-project-popup/CreateProjectWizardDialog.tsx src/app/components/create-project-popup/steps/StepService.tsx src/app/components/create-project-popup/CreateProjectWizardDialog.test.tsx` ✅
