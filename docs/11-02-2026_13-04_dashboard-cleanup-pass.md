# Dashboard Cleanup Pass (Minimal + Targeted)

**Date:** 11-02-2026 13:04

## Summary
Implemented a dashboard-only consistency pass focused on tokenizing neutral surfaces and unifying repeated control styles across search, settings, and chat surfaces without changing behavior, routing, data flow, or backend APIs.

## Files Changed
- `/Users/nick/Designagency/src/styles/theme.css`
- `/Users/nick/Designagency/src/styles/tailwind.css`
- `/Users/nick/Designagency/src/app/components/ui/controlChrome.ts` (new)
- `/Users/nick/Designagency/src/app/components/SearchPopup.tsx`
- `/Users/nick/Designagency/src/app/components/search-popup/SearchPopupInput.tsx`
- `/Users/nick/Designagency/src/app/components/search-popup/SearchPopupListItems.tsx`
- `/Users/nick/Designagency/src/app/components/search-popup/SearchPopupResults.tsx`
- `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`
- `/Users/nick/Designagency/src/app/components/settings-popup/AccountTab.tsx`
- `/Users/nick/Designagency/src/app/components/settings-popup/CompanyTab.tsx`
- `/Users/nick/Designagency/src/app/components/settings-popup/InviteMemberForm.tsx`
- `/Users/nick/Designagency/src/app/components/settings-popup/MemberRow.tsx`
- `/Users/nick/Designagency/src/app/components/settings-popup/NotificationsTab.tsx`
- `/Users/nick/Designagency/src/app/components/settings-popup/PendingInvitationRow.tsx`
- `/Users/nick/Designagency/src/app/components/chat-sidebar/ChatSidebarView.tsx`
- `/Users/nick/Designagency/src/app/components/chat-sidebar/CommentActions.tsx`
- `/Users/nick/Designagency/src/app/components/chat-sidebar/CommentComposerInline.tsx`
- `/Users/nick/Designagency/src/app/components/chat-sidebar/ProjectDropdown.tsx`
- `/Users/nick/Designagency/src/app/components/chat-sidebar/CommentItem.tsx`

## Token Additions
Added neutral semantic tokens in `theme.css` and exposed them in `@theme inline`:
- `--surface-hover-subtle`
- `--surface-hover-soft`
- `--surface-active-soft`
- `--surface-muted-soft`
- `--border-subtle-soft`
- `--border-soft`
- `--text-muted-weak`
- `--text-muted-medium`

Mapped color tokens:
- `--color-surface-hover-subtle`
- `--color-surface-hover-soft`
- `--color-surface-active-soft`
- `--color-surface-muted-soft`
- `--color-border-subtle-soft`
- `--color-border-soft`
- `--color-text-muted-weak`
- `--color-text-muted-medium`

## Shared Chrome Additions
Created `controlChrome.ts` with reusable class constants:
- `PRIMARY_ACTION_BUTTON_CLASS`
- `SECONDARY_ACTION_BUTTON_CLASS`
- `GHOST_ICON_BUTTON_CLASS`
- `UNDERLINE_INPUT_CLASS`
- `SOFT_INPUT_CLASS`
- `ROW_HOVER_CLASS`
- `KBD_PILL_CLASS`
- `DIVIDER_SUBTLE_CLASS`

Also added `@source '../app/components/ui/controlChrome.ts';` in `tailwind.css` to ensure these utility class strings are included by Tailwind scanning.

## Visual Consistency Outcomes
- Replaced repeated raw neutral `white/*` styles in search, settings, and chat with semantic token classes.
- Unified keyboard hint pills, row hover states, soft input surfaces, and primary/secondary button patterns.
- Normalized member and pending invitation row styling, including avatar fallback treatment.
- Applied targeted layering cleanup in touched chat dropdown surfaces using existing `Z_LAYERS` values.

## Validation
- `npm run lint` (pass)
- `npm run test:frontend` (pass)

## Notes
- No backend mutations, schema changes, or route changes.
- No edits were made in `/Users/nick/Designagency/src/imports/`.
