# Targeted A11y + Runtime Hardening Fixes

**Date:** 10-02-2026 22:31

## Summary
Implemented the requested targeted fixes across project task UI, search popup quick actions, settings member management, dashboard slug normalization, and global event listener stability.

## Changes

- `src/app/components/project-tasks/AddTaskRow.tsx`
  - Added an accessible input label via `aria-label="New task title"`.

- `src/app/components/project-tasks/useProjectTaskHandlers.ts`
  - Updated `handleProjectSelect` to close project selector on successful selection by calling `setOpenProjectTaskId(null)` after `onUpdateTasks(newTasks)`.

- `src/app/components/project-tasks/useTaskHighlight.ts`
  - Updated effect cleanup to always clear timeout and remove `task-row-flash` class.
  - Kept `onHighlightDone?.()` invocation only in timeout callback.

- `src/app/components/search-popup/SearchPopupResults.tsx`
  - Hardened quick action click path by resolving handler first and invoking only if it is a function.

- `src/app/components/search-popup/useSearchPopupKeyboard.ts`
  - Hardened Enter-key quick action execution with a function check before calling the handler.

- `src/app/components/settings-popup/CompanyTab.test.tsx`
  - Updated debounce test to coalesce rapid typing into one call by removing intermediate timer advance.
  - Added assertion that `onUpdateWorkspaceGeneral` is called once with `{ name: "Workspace Renamed" }`.

- `src/app/components/settings-popup/InviteMemberForm.tsx`
  - Added trigger accessibility attributes: `aria-expanded`, `aria-haspopup="listbox"`, `aria-controls`, `aria-disabled`.
  - Added dropdown semantics: `role="listbox"` on menu and `role="option"` + `aria-selected` on options.
  - Added Escape key listener/effect to close the role menu.
  - Kept trigger focusable under denied state by relying on `DeniedAction` interception instead of disabling for denied permissions.

- `src/app/components/settings-popup/MemberRow.tsx`
  - Added non-empty avatar alt fallback (`name || email || "User avatar"`).
  - Replaced fire-and-forget role/remove handlers with async `await` + `try/catch` and surfaced errors via `reportUiError` + toast.

- `src/app/dashboard/storage.ts`
  - Normalized workspace slug values to lowercase before validation and persistence.

- `src/app/lib/hooks/useGlobalEventListener.ts`
  - Added stable options keying for effect dependencies to avoid re-subscribe churn from inline option object identities.
  - Kept listener behavior via refs and documented memoization guidance for callers.

- `src/app/lib/hooks/useGlobalEventListener.test.ts`
  - Added regression test ensuring equivalent inline options do not cause unnecessary re-subscription.

## Validation

- `npx eslint src/app/components/project-tasks/AddTaskRow.tsx src/app/components/project-tasks/useProjectTaskHandlers.ts src/app/components/project-tasks/useTaskHighlight.ts src/app/components/search-popup/SearchPopupResults.tsx src/app/components/search-popup/useSearchPopupKeyboard.ts src/app/components/settings-popup/CompanyTab.test.tsx src/app/components/settings-popup/InviteMemberForm.tsx src/app/components/settings-popup/MemberRow.tsx src/app/dashboard/storage.ts src/app/lib/hooks/useGlobalEventListener.ts src/app/lib/hooks/useGlobalEventListener.test.ts` ✅
- `npx vitest run src/app/components/settings-popup/CompanyTab.test.tsx src/app/lib/hooks/useGlobalEventListener.test.ts` ✅
- `npx vitest run src/app/components/settings-popup/CompanyMembersSection.test.tsx` ✅
- `npm run typecheck:frontend` ✅
