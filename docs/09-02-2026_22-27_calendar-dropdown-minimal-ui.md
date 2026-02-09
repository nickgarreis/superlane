# Calendar Dropdown Minimal UI Refresh

**Date:** 09-02-2026 22:27

## Summary

Updated the calendar dropdown UI to a more minimal, project-consistent dark style across both task and project creation flows.

## Changes

### `/Users/nick/Designagency/src/styles/theme.css`
- Refined shared `.rdp-dark-theme` styles for DayPicker to reduce visual weight.
- Shifted selection styling from bright red to neutral monochrome emphasis.
- Tightened typography and spacing:
  - Smaller caption label and weekday labels.
  - Slightly smaller day cells.
  - Subtle letter spacing for headers.
- Updated interaction states:
  - Softer hover feedback.
  - Subtle bordered selected/today states.
  - Muted outside/disabled day contrast for cleaner hierarchy.
- Simplified nav button styling with low-contrast borders and restrained hover behavior.

### `/Users/nick/Designagency/src/app/components/ProjectTasks.tsx`
- Updated portaled calendar dropdown container classes to a compact minimal panel:
  - Reduced padding.
  - Smaller corner radius.
  - Softer shadow.
  - Subtle border and near-opaque neutral surface.

### `/Users/nick/Designagency/src/app/components/create-project-popup/CreateProjectWizardDialog.tsx`
- Matched the create-project calendar dropdown container styling with the task calendar panel for consistency.

## Validation

- `npm run lint` ✅
- `npm run typecheck` ✅
