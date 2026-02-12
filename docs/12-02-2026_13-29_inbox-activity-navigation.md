# Inbox Activity Click Navigation With Settings Focus Targets

## What was implemented

Implemented inbox activity row click navigation end-to-end by reusing existing dashboard navigation patterns and extending settings deep-link focus behavior.

### Navigation and URL contract

- Extended `/Users/nick/Designagency/src/app/dashboard/useDashboardNavigation.ts`:
  - Added `navigateViewPreservingInbox(view)` (view navigation without closing inbox).
  - Added `handleOpenSettingsWithFocus({ tab?, focus? })`.
  - Added derived `settingsFocusTarget` from settings query params.
  - Kept `navigateView` behavior unchanged (still closes inbox).
  - Kept `handleOpenSettings(tab?)` API unchanged by delegating to focus-aware method.

- Extended `/Users/nick/Designagency/src/app/dashboard/types.ts`:
  - Added `SettingsFocusTarget` union type.
  - Added parser/serializer helpers for settings focus query params:
    - `focusKind`, `focusUserId`, `focusEmail`, `focusAssetName`.

### Inbox activity click resolver

- Added `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardInboxActivityNavigation.ts`.
- Implemented deterministic activity-to-navigation mapping:
  - `project`: navigate to project or archive-project when present; toast if missing.
  - `task`: navigate to project + set task `pendingHighlight` (if `taskId`).
  - `file`: navigate to project + set file `pendingHighlight` (if `fileName`).
  - `collaboration`: navigate to project only.
  - `membership`: open `Settings > Company`, focus invitation/member when resolvable.
  - `workspace`: open `Settings > Company`, focus brand asset for brand-asset actions.
  - `organization`: open `Settings > Company`.

### Wiring through dashboard and inbox

- `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardViewBindings.ts`
  - Created `handleInboxActivityClick` via new resolver hook.
  - Passed callback to chrome props.
  - Passed `settingsFocusTarget` to popups props.

- `/Users/nick/Designagency/src/app/dashboard/components/DashboardChrome.tsx`
  - Added `onInboxActivityClick` prop and forwarded it to `InboxSidebarPanel`.

- `/Users/nick/Designagency/src/app/components/InboxSidebarPanel.tsx`
  - Added optional `onActivityClick` callback and passed per-row handlers.

### Activity row interactivity

- `/Users/nick/Designagency/src/app/components/activities-page/ActivityRowShell.tsx`
  - Added optional row interactivity (`onClick`, keyboard Enter/Space, `role="button"`, `tabIndex`).
  - Preserved existing visual style while adding pointer/focus affordances.
  - Prevented mark-read button from triggering row navigation (`stopPropagation`).

- Updated row components to pass optional click handlers:
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/ProjectActivityRow.tsx`
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/TaskActivityRow.tsx`
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/CollaborationActivityRow.tsx`
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/FileActivityRow.tsx`
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/MembershipActivityRow.tsx`
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/WorkspaceActivityRow.tsx`

### Settings focus handling

- `/Users/nick/Designagency/src/app/components/SettingsPopup.tsx`
  - Added `initialFocusTarget` support.
  - Auto-opens Company section when focus target is present.
  - Passes focus target to `CompanyTab`.

- `/Users/nick/Designagency/src/app/components/settings-popup/CompanyTab.tsx`
  - Accepts and forwards focus target to members and brand assets sections.

- `/Users/nick/Designagency/src/app/components/settings-popup/CompanyMembersSection.tsx`
  - Added member/invitation row refs.
  - Added focus resolution by `userId`/email.
  - Added scroll + flash behavior.

- `/Users/nick/Designagency/src/app/components/settings-popup/CompanyBrandAssetsSection.tsx`
  - Added brand asset row refs by normalized name.
  - Added scroll + flash behavior.

- `/Users/nick/Designagency/src/styles/theme.css`
  - Added `settingsRowFlash` animation and `.settings-row-flash` class.

## Tests updated/added

- Updated:
  - `/Users/nick/Designagency/src/app/dashboard/useDashboardNavigation.test.tsx`
    - focus query parsing
    - `handleOpenSettingsWithFocus` URL params
    - `navigateViewPreservingInbox` keeps inbox open
  - `/Users/nick/Designagency/src/app/components/InboxSidebarPanel.test.tsx`
    - clicking row invokes `onActivityClick(activity)`
  - `/Users/nick/Designagency/src/app/components/activities-page/rows/ActivityRows.test.tsx`
    - interactive shell click + keyboard behavior
  - `/Users/nick/Designagency/src/app/components/settings-popup/CompanyMembersSection.test.tsx`
    - focus by member userId
    - focus by invitation email
  - `/Users/nick/Designagency/src/app/dashboard/components/DashboardChrome.test.tsx`
    - verifies activity click callback forwarding
  - `/Users/nick/Designagency/src/app/dashboard/components/DashboardPopups.test.tsx`
    - updated props contract (`settingsFocusTarget`)

- Added:
  - `/Users/nick/Designagency/src/app/dashboard/hooks/useDashboardInboxActivityNavigation.test.tsx`
  - `/Users/nick/Designagency/src/app/components/settings-popup/CompanyBrandAssetsSection.test.tsx`

## Validation

Commands run:

- `npm run lint` ✅
- `npm run test:frontend` ✅

Notes:
- Existing non-fatal test stderr warnings related to other components (framer-motion ref warning and deliberate error-path logging) remain unchanged.
