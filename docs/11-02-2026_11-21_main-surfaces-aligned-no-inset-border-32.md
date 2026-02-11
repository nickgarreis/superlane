# Main Surface Alignment Across Pages

**Date:** 11-02-2026 11:21

## Summary
Applied the main content surface style updates to the other page-level views.

## Changes
- Updated `/Users/nick/Designagency/src/app/components/Tasks.tsx`:
  - Replaced `bg-bg-surface m-[8px] border border-white/5 rounded-[32px]` with `bg-bg-surface rounded-none`.
- Updated `/Users/nick/Designagency/src/app/components/ArchivePage.tsx`:
  - Replaced `bg-bg-surface m-[8px] border border-white/5 rounded-[32px]` with `bg-bg-surface rounded-none`.

## Validation
- Confirmed `MainContent`, `Tasks`, and `ArchivePage` now all use `bg-bg-surface rounded-none` on the primary surface wrapper.
- Confirmed those wrappers no longer contain `m-[8px]`, `border border-white/5`, or `rounded-[32px]`.
