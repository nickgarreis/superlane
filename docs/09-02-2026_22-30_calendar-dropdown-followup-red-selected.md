# Calendar Dropdown Follow-up Styling Adjustments

**Date:** 09-02-2026 22:30

## Summary

Applied requested follow-up changes to calendar dropdown visuals:
- reduced inner panel padding,
- removed special highlight for the current date,
- restored red selected-date background styling.

## Changes

### `/Users/nick/Designagency/src/styles/theme.css`
- Restored selected day styling to red:
  - `background-color: #ef4444`
  - hover `#dc2626`
  - circular selected marker (`border-radius: 50%`)
  - stronger selected weight (`font-weight: 700`)
- Removed current-day emphasis by resetting `rdp-day_today` to transparent background/border and normal day weight.

### `/Users/nick/Designagency/src/app/components/ProjectTasks.tsx`
- Reduced calendar dropdown inner panel padding from `p-2.5` to `p-2`.

### `/Users/nick/Designagency/src/app/components/create-project-popup/CreateProjectWizardDialog.tsx`
- Reduced calendar dropdown inner panel padding from `p-2.5` to `p-2`.

## Validation

- `npm run lint` ✅
- `npm run typecheck` ✅
