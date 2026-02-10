# Chat Sidebar and Create Project Popup Accessibility/Transition Fixes

**Date:** 2026-02-10 11:35

## Scope
Applied targeted fixes across chat sidebar and create-project popup components to resolve transition utility conflicts, keyboard accessibility gaps, ARIA metadata issues, transient-state reset behavior, and small copy/indexing correctness issues.

## Changes

- **`src/app/components/chat-sidebar/CommentItem.tsx`**
  - Reply button class updated from mixed `transition-colors` + `transition-opacity` to `transition-all` while preserving text/hover/spacing/rounded/opacity/group-hover classes.
  - Resolve button computed class updated from mixed transition utilities to unified `transition` + existing `duration-150`.

- **`src/app/components/chat-sidebar/ProjectDropdown.tsx`**
  - Added `React.useEffect` Escape-key handler that closes dropdown via `onOpenChange(false)` only while `isOpen` is true, with proper add/remove listener cleanup.
  - Added trigger button ARIA attributes: `aria-expanded={isOpen}`, `aria-haspopup="menu"`, and dynamic `aria-label` including current project name.

- **`src/app/components/chat-sidebar/useChatSidebarState.ts`**
  - Project-change reset effect now also clears `inputValue` and closes dropdown via `setInputValue("")` and `setIsDropdownOpen(false)`.

- **`src/app/components/create-project-popup/steps/StepDetails.tsx`**
  - AI toggle now supports keyboard and assistive tech with `role="switch"`, `aria-checked`, `tabIndex={0}`, `aria-label`, and Enter/Space key handling.
  - Deadline selector now behaves like a keyboard-accessible button with `role="button"`, `tabIndex={0}`, Enter/Space key toggle handling, and meaningful `aria-haspopup`/`aria-expanded`/`aria-label` attributes.

- **`src/app/components/create-project-popup/steps/StepReview.tsx`**
  - Replaced brittle `idx < 3` condition with `idx < NEXT_STEPS.length - 1` for adaptive spacing.

- **`src/app/components/create-project-popup/steps/StepService.tsx`**
  - Corrected copy: “Choose the service that fit your needs.” → “Choose the service that fits your needs.”

## Validation

- `npx eslint src/app/components/chat-sidebar/CommentItem.tsx src/app/components/chat-sidebar/ProjectDropdown.tsx src/app/components/chat-sidebar/useChatSidebarState.ts src/app/components/create-project-popup/steps/StepDetails.tsx src/app/components/create-project-popup/steps/StepReview.tsx src/app/components/create-project-popup/steps/StepService.tsx` ✅
- `npm run typecheck` ✅
