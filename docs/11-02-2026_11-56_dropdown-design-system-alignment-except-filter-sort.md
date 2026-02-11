# Dropdown Design System Alignment (Except Filter/Sort)

**Date:** 11-02-2026 11:56

## Summary
Aligned non-filter/sort dropdown components to the same design system style used by the comments project selection dropdown (surface, border, shadow, spacing, hover, selected-state treatment).

## Changes
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/InviteMemberForm.tsx`:
  - Restyled invite role trigger and dropdown panel.
  - Unified option row hover/selected visuals with check indicator.
- Updated `/Users/nick/Designagency/src/app/components/settings-popup/MemberRow.tsx`:
  - Restyled role trigger and dropdown panel.
  - Unified option row hover/selected visuals with check indicator.
- Updated `/Users/nick/Designagency/src/app/components/main-content/MenuIcon.tsx`:
  - Restyled project actions dropdown surface and row item styling.
- Updated `/Users/nick/Designagency/src/app/components/project-tasks/ProjectTaskRow.tsx`:
  - Restyled project and assignee dropdown surfaces.
  - Unified option row hover/selected visuals and selected check indicators.
- Updated `/Users/nick/Designagency/src/app/components/mentions/MentionDropdown.tsx`:
  - Aligned panel shadow and row hover/selected treatments.
- Updated `/Users/nick/Designagency/src/app/components/chat-sidebar/CommentActions.tsx`:
  - Restyled comment more-actions dropdown panel and action rows.
- Updated `/Users/nick/Designagency/src/app/components/chat-sidebar/ReactionPicker.tsx`:
  - Aligned picker surface radius/shadow treatment.

## Explicitly Not Changed
- Filter dropdowns.
- Sort dropdowns.

## Validation
- Ran `npm run test:frontend -- src/app/components/settings-popup/CompanyMembersSection.test.tsx src/app/components/ProjectTasks.test.tsx src/app/components/MentionTextarea.test.tsx src/app/components/chat-sidebar/CommentItem.test.tsx src/app/components/chat-sidebar/ChatSidebarPanel.test.tsx src/app/components/MainContent.test.tsx`.
- Result: pass (frontend suite executed by script; all tests passed).
