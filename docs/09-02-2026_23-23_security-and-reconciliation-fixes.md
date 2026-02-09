# Changes made

## Scope
Implemented four targeted fixes:
1. Hardened the Figma asset resolver against path traversal.
2. Corrected component-size warning classification boundaries.
3. Reset missing dialog confirmation state when the create-project wizard closes.
4. Surfaced reconciliation failures in workspace settings actions.

## File updates

### config/figmaAssetResolver.ts
- Introduced `baseDir` (`../src/assets`) and resolve imports relative to it.
- Stripped null bytes from the incoming asset path before resolution.
- Added containment validation using `path.relative(baseDir, resolvedPath)` and `path.isAbsolute(relativePath)`.
- Throw an error for invalid traversal attempts instead of returning an escaped path.

### scripts/quality/check-component-size.mjs
- Updated warning filter to only include components where:
  - `lines > WARN_COMPONENT_LINES`
  - `lines <= MAX_COMPONENT_LINES`
- Keeps hard-limit violations exclusively in the error path.

### src/app/components/create-project-popup/CreateProjectWizardDialog.tsx
- In the close/reset `useEffect`, added `setShowDeleteProjectConfirm(false)`.
- Ensures the project delete confirmation state does not leak across dialog sessions.

### src/app/dashboard/useDashboardWorkspaceActions.ts
- Captured `Promise.allSettled(...)` results in `runWorkspaceSettingsReconciliation`.
- Added per-action rejected-settlement logging with explicit action labels:
  - `reconcileWorkspaceInvitationsAction`
  - `reconcileWorkspaceOrganizationMembershipsAction`
- Logs both failure context and rejection reason via `console.error`.

## Validation
- `npm run lint` passed.
- `npm run typecheck` passed.
