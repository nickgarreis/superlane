# Draft/Review popup header row for back navigation

## Date
- 12-02-2026

## Goal
Fix overlap where the `Back to draft & pending projects` action collided with popup content (including `Your Project is in Review`).

## What changed
- Updated `/Users/nick/Designagency/src/app/components/create-project-popup/CreateProjectWizardDialog.tsx`:
  - replaced absolute-positioned back action on steps 2–4 with a dedicated in-flow header row (`back` left, `close` right)
  - kept existing absolute close behavior only for step 2/3 when draft/pending back navigation is not active
  - adjusted step 3 title top spacing when header row is present so content remains visually separated
  - passed `showCloseButton` into `StepReview` to avoid rendering a duplicate close button

- Updated `/Users/nick/Designagency/src/app/components/create-project-popup/steps/StepReview.tsx`:
  - added optional `showCloseButton` prop (default `true`)
  - conditionally renders the internal floating close button
  - tightens top spacing when the external header controls are used

## Validation
- `npx eslint src/app/components/create-project-popup/CreateProjectWizardDialog.tsx src/app/components/create-project-popup/steps/StepReview.tsx` ✅
- `npx vitest run src/app/components/create-project-popup/CreateProjectWizardDialog.test.tsx src/app/dashboard/components/DashboardPopups.test.tsx` ✅
