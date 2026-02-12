# Services label and project overview metadata update

## Date
- 12-02-2026 15:09

## Goal
- Rename the first-step heading in the project creation popup from `Solutions` to `Services`.
- Show `Service` in project detail metadata between `Status` and `Scope`.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/create-project-popup/steps/StepService.tsx`:
  - Changed step heading text from `Solutions` to `Services`.

- Updated `/Users/nick/Designagency/src/app/components/main-content/ProjectOverview.tsx`:
  - Inserted a new metadata block labeled `Service`.
  - Positioned it directly after `Status` and before `Scope`.
  - Rendered service value using `project.category`.

- Updated `/Users/nick/Designagency/src/app/components/create-project-popup/CreateProjectWizardDialog.test.tsx`:
  - Added a test asserting first-step label shows `Services` and does not show `Solutions`.

- Updated `/Users/nick/Designagency/src/app/components/MainContent.test.tsx`:
  - Added a test asserting metadata order in project detail: `Status` -> `Service` -> `Scope`.

## Validation
- `npx vitest run src/app/components/create-project-popup/CreateProjectWizardDialog.test.tsx src/app/components/MainContent.test.tsx` ✅
