# Popup Design + Color Token Unification

**Date:** 11-02-2026 11:39

## Summary
Aligned all popup shells to the `CreateProjectPopup` chrome and replaced popup-related hardcoded color literals with design tokens.

## What I changed
- Added shared popup chrome constants in `/Users/nick/Designagency/src/app/components/popup/popupChrome.ts`:
  - Shared overlay base/center classes
  - Shared popup shell class
  - Shared shell border class
  - Shared close-button class

- Updated popup components to use the shared popup chrome:
  - `/Users/nick/Designagency/src/app/components/create-project-popup/CreateProjectWizardDialog.tsx`
  - `/Users/nick/Designagency/src/app/components/create-workspace-popup/CreateWorkspacePopup.tsx`
  - `/Users/nick/Designagency/src/app/components/SearchPopup.tsx`
  - `/Users/nick/Designagency/src/app/components/CompletedProjectsPopup.tsx`
  - `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`
  - `/Users/nick/Designagency/src/app/components/FeedbackPopup.tsx`

- Added/expanded popup color + shadow tokens in `/Users/nick/Designagency/src/styles/theme.css` for:
  - Popup surfaces/borders/controls
  - Feedback accents
  - Review/status colors
  - File-type badge colors
  - Popup shadow presets

- Replaced remaining popup hardcoded colors with existing exact tokens or newly added tokens in:
  - `/Users/nick/Designagency/src/app/components/create-project-popup/WizardCloseButton.tsx`
  - `/Users/nick/Designagency/src/app/components/create-project-popup/CreateProjectWizardConfirmDialogs.tsx`
  - `/Users/nick/Designagency/src/app/components/create-project-popup/steps/StepDetailsStep2.tsx`
  - `/Users/nick/Designagency/src/app/components/create-project-popup/steps/StepDetailsStep3.tsx`
  - `/Users/nick/Designagency/src/app/components/create-project-popup/steps/StepReview.tsx`
  - `/Users/nick/Designagency/src/app/components/search-popup/SearchPopupListItems.tsx`
  - `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.tsx`
  - `/Users/nick/Designagency/src/app/components/settings-popup/BillingTab.tsx`
  - `/Users/nick/Designagency/src/app/components/settings-popup/CompanyBrandAssetsSection.tsx`
  - `/Users/nick/Designagency/src/app/components/settings-popup/InviteMemberForm.tsx`
  - `/Users/nick/Designagency/src/app/components/settings-popup/MemberRow.tsx`
  - `/Users/nick/Designagency/src/app/components/settings-popup/NotificationsTab.tsx`

## Validation
- `npm run lint` passed.
- `npm run test:frontend -- src/app/components/SearchPopup.test.tsx src/app/components/FeedbackPopup.test.tsx src/app/components/CompletedProjectsPopup.test.tsx src/app/components/SettingsPopup.test.tsx src/app/components/create-project-popup/CreateProjectWizardDialog.test.tsx` passed.
- `npm run typecheck` failed due existing Convex/backend nullability issues unrelated to these popup/style changes:
  - `convex/lib/dashboardContext.ts:122`
  - `convex/lib/dashboardContext.ts:216`
  - `convex/settings.ts:783`
  - `convex/settings.ts:837`
