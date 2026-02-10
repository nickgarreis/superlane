# Frontend Targeted Safety and Accessibility Fixes

**Date:** 10-02-2026 14:09

## Summary
Implemented the requested fixes across mention handling, sidebar interactions, comment actions, DOM cursor offset logic, and dashboard shell tests.

## Changes

- `src/app/components/MentionTextarea.tsx`
  - Hardened initials generation in mention dropdown to handle extra/consecutive whitespace safely.
  - Updated `UserInitials` to use whitespace-safe parsing and `charAt(0)`.

- `src/app/components/Sidebar.tsx`
  - Removed unused `onArchiveProject`/`onUnarchiveProject` props from `SidebarProps`.

- `src/app/dashboard/components/DashboardChrome.tsx`
  - Removed now-invalid `onArchiveProject`/`onUnarchiveProject` prop plumbing to `Sidebar`.

- `src/app/dashboard/useDashboardOrchestration.ts`
  - Removed `onArchiveProject`/`onUnarchiveProject` from `chromeProps` payload.

- `src/app/components/Sidebar.test.tsx`
  - Updated Sidebar call sites to stop passing removed props.

- `src/app/components/chat-sidebar/CommentActions.tsx`
  - Added `menuRef` for the more-actions menu.
  - Added click-outside close effect using a short `setTimeout` to avoid immediate close on open click.
  - Ensured timeout/listener cleanup and typed event handler.

- `src/app/components/chat-sidebar/CommentItem.tsx`
  - Replaced invalid nested `isReply` prop usage with `isTopLevel={false}`.

- `src/app/components/chat-sidebar/commentItemTypes.ts`
  - Removed unused `isReply` from `CommentItemViewProps`.

- `src/app/components/mentions/mentionDom.ts`
  - Fixed `getCursorOffset` for element `range.startContainer` by summing child content length up to `range.startOffset`.
  - Refactored `setCursorAtOffset` result tracking to explicit node/offset variables.

- `src/app/components/mentions/mentionParser.ts`
  - Hardened `userInitialsHTML` against consecutive spaces and empty words.
  - Escaped computed initials before interpolating into HTML.
  - Extended `escapeHtml` to also encode single quotes.

- `src/app/components/sidebar/SidebarItem.tsx`
  - Changed badge rendering guard from falsy to explicit nullish check so `0` displays.
  - Replaced non-semantic action `<div>` wrappers with semantic `<button type="button">` controls while preserving behavior/styles.

- `src/app/components/sidebar/SidebarProfileMenu.tsx`
  - Wired `Help & Support` to a real handler (`window.open` support URL).
  - Added keyboard/ARIA support to profile toggle (`role`, `tabIndex`, Enter/Space, `aria-expanded`, label).
  - Converted dropdown action rows to semantic buttons with `role="menuitem"`.
  - Added `role="menu"`, Escape close handling, and focus management (move focus into menu on open and return to trigger on close).

- `src/app/components/sidebar/SidebarWorkspaceSwitcher.tsx`
  - Replaced non-semantic trigger `<div>` with keyboard-accessible `<button type="button">` and `aria-expanded`.

- `src/app/dashboard/DashboardShell.test.tsx`
  - Updated mocked dashboard components to render serialized props (`JSON.stringify(props)`).
  - Updated assertions to match deterministic serialized values.

## Validation

- `npm run test:frontend -- src/app/dashboard/DashboardShell.test.tsx src/app/components/Sidebar.test.tsx src/app/components/MentionTextarea.test.tsx src/app/components/sidebar/SidebarProjectsSection.test.tsx` ✅
- `npx vitest run src/app/components/MentionTextarea.test.tsx src/app/components/Sidebar.test.tsx src/app/dashboard/DashboardShell.test.tsx src/app/components/chat-sidebar/CommentItem.test.tsx` ✅
- `npx eslint src/app/components/MentionTextarea.tsx src/app/components/Sidebar.tsx src/app/components/Sidebar.test.tsx src/app/components/chat-sidebar/CommentActions.tsx src/app/components/chat-sidebar/CommentItem.tsx src/app/components/chat-sidebar/commentItemTypes.ts src/app/components/mentions/mentionDom.ts src/app/components/mentions/mentionParser.ts src/app/components/sidebar/SidebarItem.tsx src/app/components/sidebar/SidebarProfileMenu.tsx src/app/components/sidebar/SidebarWorkspaceSwitcher.tsx src/app/dashboard/components/DashboardChrome.tsx src/app/dashboard/DashboardShell.test.tsx src/app/dashboard/useDashboardOrchestration.ts` ✅
- `npm run typecheck:frontend` ❌ (pre-existing unrelated errors: `ProjectFileTab` not exported in dashboard types wiring)
