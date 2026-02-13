# Create-project option animation stabilization

## Date
- 13-02-2026 12:59

## Goal
- Fix the create-project flow option animations (step 1 service pills and step 2 scope/job pills) so they no longer show a final upward pull after the initial rise-in animation.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/create-project-popup/steps/StepService.tsx`:
  - Added an explicit entrance easing constant for option pills.
  - Changed service-pill entrance transitions to `type: "tween"` with the shared ease curve to remove spring-style overshoot.
  - Replaced `transition-all` with `transition-colors` on service pills so transform is not included in CSS transitions.
- Updated `/Users/nick/Designagency/src/app/components/create-project-popup/steps/StepDetailsStep2.tsx`:
  - Added the same explicit entrance easing constant for scope/job option pills.
  - Changed scope/job pill entrance transitions to `type: "tween"` with the shared ease curve.
  - Replaced `transition-all` with `transition-colors` on scope/job pills.

## Validation
- `npx eslint src/app/components/create-project-popup/steps/StepService.tsx src/app/components/create-project-popup/steps/StepDetailsStep2.tsx` ✅
- `npm run test:frontend -- src/app/components/create-project-popup/CreateProjectWizardDialog.test.tsx` ✅
