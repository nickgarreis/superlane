# Accessibility and ARIA Fixes

**Date:** 10-02-2026 14:52

## Summary
Applied targeted accessibility updates for chat sidebar controls, mention dropdown semantics, and project back-navigation labeling.

## Changes

- `src/app/components/chat-sidebar/ChatSidebarView.tsx`
  - Added `aria-label="Close sidebar"` to the close (X) button.
  - Added `aria-expanded`, `aria-controls`, and dynamic `aria-label` to the resolved-threads toggle button.
  - Added stable container id `resolved-threads-panel` to the resolved threads panel for `aria-controls` linkage.

- `src/app/components/mentions/MentionDropdown.tsx`
  - Added listbox semantics to dropdown root: `role="listbox"`, `aria-label="Mentions"`, `aria-hidden`, and `aria-activedescendant`.
  - Added unique option ids per item.
  - Added item semantics to each option button: `role="option"` and `aria-selected={index === selectedIndex}`.

- `src/app/components/main-content/ProjectOverview.tsx`
  - Replaced hardcoded back label with dynamic `navigationActions.backTo` label.
  - Added fallback label (`Archive`) when `backTo` is missing.
  - Kept navigation behavior on `navigationActions.back` unchanged.

## Validation

- `npx eslint src/app/components/chat-sidebar/ChatSidebarView.tsx src/app/components/mentions/MentionDropdown.tsx src/app/components/main-content/ProjectOverview.tsx` ✅
