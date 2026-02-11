# Heading Uppercase Enforcement

**Date:** 11-02-2026 11:13

## Summary
Enforced all heading typography to render in uppercase.

## Changes
- Added `text-transform: uppercase` to heading role utilities in `src/styles/theme.css`:
  - `txt-role-hero`
  - `txt-role-screen-title`
  - `txt-role-page-title`
  - `txt-role-panel-title`
  - `txt-role-section-title`
- Added `text-transform: uppercase` to default heading element styles in `src/styles/theme.css`:
  - `h1`, `h2`, `h3`, `h4`

## Validation
- Confirmed uppercase transform is present on all heading role utilities.
- Confirmed uppercase transform is present on base heading tags (`h1`-`h4`).
