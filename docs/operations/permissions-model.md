# Permissions Model

## Roles

- `owner`
- `admin`
- `member`

Role hierarchy:
- `owner` > `admin` > `member`

Source of truth:
- `convex/lib/rbac.ts`

## Current RBAC Matrix (Operational Summary)

- `workspaces.create`: authenticated
- `workspaces.ensureDefaultWorkspace`: authenticated
- `workspaces.update`: admin+
- `workspaces.softDelete`: owner
- `workspaces.update.workosOrganizationId`: owner

- `projects.create`: member+
- `projects.update`: member+
- `projects.updateReviewComments`: member+
- `projects.setStatus`: admin+
- `projects.archive`: admin+
- `projects.unarchive`: admin+
- `projects.remove`: admin+

- `tasks.replaceForProject`: member+
- `tasks.bulkReplaceForWorkspace`: member+

- `files.create`: member+
- `files.remove`: member+

- `settings.account.updateProfile`: authenticated
- `settings.account.avatar`: authenticated
- `settings.notifications.update`: authenticated
- `settings.company.members.invite`: admin+
- `settings.company.members.changeRole`: admin+
- `settings.company.members.remove`: admin+
- `settings.company.invitations.resend`: admin+
- `settings.company.invitations.revoke`: admin+
- `settings.company.brandAssets.manage`: admin+

- `comments.create`: member+
- `comments.toggleReaction`: member+
- `comments.toggleResolved`: member+
- `comments.update`: author or admin+
- `comments.remove`: author or admin+

- `organizationSync.reconcileWorkspaceOrganizationMemberships`: system path
- `organizationSyncInternal.applyOrganizationMembershipSnapshot`: internal system path

## Validation

Run:
- `npm run test:rbac`

Expected result:
- Role-gated mutation tests pass.
