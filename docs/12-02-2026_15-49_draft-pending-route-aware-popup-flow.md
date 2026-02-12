# Draft & pending route-aware popup flow

## Date
- 12-02-2026 15:49

## Goal
Implement the new combined `Drafts & pending projects` popup flow with route-aware list/detail behavior, remove Draft/Review from active sidebar listings, and add wizard-level back navigation to the combined list.

## What changed
- Updated `/Users/nick/Designagency/src/app/components/create-project-popup/CreateProjectWizardDialog.tsx`:
  - added top-left back action rendering with text `Back to draft & pending projects` when the callback is provided
  - wired back action for step 1 and step 2/3/4 layouts
- Updated `/Users/nick/Designagency/src/app/components/create-project-popup/hooks/useCreateProjectWizardController.ts`:
  - switched `setShowCloseConfirm` passthrough to submission-layer handler so back-target close intents are cleared correctly
- Updated `/Users/nick/Designagency/src/app/components/sidebar/partitionProjects.test.ts`:
  - now verifies three-way partitioning (`activeProjects`, `draftPendingProjects`, `completedProjects`)
- Updated `/Users/nick/Designagency/src/app/lib/seo.test.ts`:
  - added assertions for `/drafts`, `/pending`, `/drafts/:id`, `/pending/:id`
- Updated `/Users/nick/Designagency/src/app/dashboard/useDashboardNavigation.test.tsx`:
  - added route-derived draft/pending state tests
  - added `from` preservation tests for open/close/detail/back callbacks
- Replaced `/Users/nick/Designagency/src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.test.tsx`:
  - now validates redirect behavior to `/drafts/:id` and `/pending/:id`
  - validates origin preservation from archive and active project routes
  - keeps completed-project popup + redirect coverage, including same-route status transition handling
- Added `/Users/nick/Designagency/src/app/components/DraftPendingProjectsPopup.test.tsx`:
  - covers list filtering, row click status mapping, invalid detail fallback, and route-kind canonicalization
- Updated `/Users/nick/Designagency/src/app/dashboard/components/DashboardPopups.test.tsx`:
  - added draft/pending popup wiring tests for list, detail open, close, and back-to-list behavior
- Updated `/Users/nick/Designagency/src/app/components/create-project-popup/CreateProjectWizardDialog.test.tsx`:
  - added wizard back-button tests for direct back and unsaved-confirm flow

## Validation
- `npm test -- src/app/dashboard/useDashboardNavigation.test.tsx src/app/dashboard/hooks/useDraftReviewProjectRouteGuard.test.tsx src/app/components/sidebar/partitionProjects.test.ts src/app/components/sidebar/SidebarProjectsSection.test.tsx src/app/components/DraftPendingProjectsPopup.test.tsx src/app/dashboard/components/DashboardPopups.test.tsx src/app/components/create-project-popup/CreateProjectWizardDialog.test.tsx src/app/lib/seo.test.ts` ✅
