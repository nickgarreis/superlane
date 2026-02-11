# Geist Mono Heading Token System (Completed)

**Date:** 11-02-2026

## Objective
Implement semantic text style tokens and enforce `Geist Mono` bold (`700`) for all heading roles across `src/app`, while keeping body/caption/meta text on `Roboto`.

## What Was Implemented
- Added `Geist Mono` import (700 only) alongside existing `Roboto` in `src/styles/fonts.css`.
- Added and confirmed typography token split in `src/styles/theme.css`:
  - `--font-family-heading: "Geist Mono", "Roboto Mono", monospace`
  - `--font-family-app: "Roboto", sans-serif`
- Confirmed heading semantic roles define heading font + bold:
  - `txt-role-hero`
  - `txt-role-screen-title`
  - `txt-role-page-title`
  - `txt-role-panel-title`
  - `txt-role-section-title`
- Confirmed base element mapping in `@layer base` for `h1`, `h2`, `h3`, `h4` uses heading token font + `700`.
- Migrated remaining heading usages in `src/app` to remove conflicting weight overrides (`font-medium`) where heading roles are used.
- Updated marketing hero heading usage to rely on semantic heading role.
- Replaced Sonner toast hardcoded font family with tokenized app font variable.

## Strict Enforcement / CI Gate
- Added text style token gate script:
  - `scripts/quality/check-text-style-tokens.mjs`
- Wired it into `package.json` via `lint:checks`.
- Extended gate rules to block:
  - arbitrary font utilities (`font-[...]`)
  - non-token font family utilities (`font-sans`, `font-serif`, `font-mono`)
  - heading role weight overrides (e.g. `txt-role-page-title` with `font-medium`)
  - arbitrary text size / line-height / tracking / hardcoded text colors
  - inline typography style drift for font/size/line-height/tracking unless tokenized (`var(...)`) or safe inheritance.

## Regression Fixes During Validation
- Fixed accessible label regression in `src/app/components/main-content/FileSection.tsx`:
  - Restored `Add asset` (space preserved in accessible name).
- Fixed ESLint `curly` violations found during lint run in:
  - `src/app/components/ArchivePage.tsx`
  - `src/app/components/CompletedProjectsPopup.tsx`
  - `src/app/components/create-project-popup/hooks/useWizardSubmission.ts`
  - `src/app/components/project-tasks/useWorkspaceTaskFiltering.ts`
  - `src/app/dashboard/hooks/useDashboardProjectActions.ts`

## Validation Results
- `npm run lint` ✅
- `npm run test:frontend` ✅
- `npm run build` ✅
