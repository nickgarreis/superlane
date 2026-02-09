export type WorkspaceRole = "owner" | "admin" | "member";

type RbacEntry =
  | {
      access: "authenticated";
      notes?: string;
    }
  | {
      access: "minimumRole";
      minimumRole: WorkspaceRole;
      notes?: string;
    }
  | {
      access: "authorOrMinimumRole";
      minimumRole: WorkspaceRole;
      notes?: string;
    }
  | {
      access: "system";
      notes?: string;
    };

export const ROLE_RANK: Record<WorkspaceRole, number> = {
  member: 1,
  admin: 2,
  owner: 3,
};

export const hasRequiredWorkspaceRole = (
  role: WorkspaceRole,
  minimumRole: WorkspaceRole,
): boolean => ROLE_RANK[role] >= ROLE_RANK[minimumRole];

export const RBAC_MATRIX = {
  "workspaces.create": {
    access: "authenticated",
    notes: "Action-orchestrated WorkOS organization provisioning at create time.",
  },
  "workspaces.ensureDefaultWorkspace": {
    access: "authenticated",
    notes: "Action-orchestrated default workspace creation with WorkOS organization provisioning.",
  },
  "workspaces.ensureOrganizationLink": {
    access: "minimumRole",
    minimumRole: "owner",
    notes: "Owner-only backfill to link existing unlinked workspace to WorkOS organization.",
  },
  "workspaces.update": { access: "minimumRole", minimumRole: "admin" },
  "workspaces.softDelete": { access: "minimumRole", minimumRole: "owner" },
  "workspaces.update.workosOrganizationId": {
    access: "minimumRole",
    minimumRole: "owner",
    notes: "Changing WorkOS organization mapping is owner-only.",
  },

  "projects.create": { access: "minimumRole", minimumRole: "member" },
  "projects.update": { access: "minimumRole", minimumRole: "member" },
  "projects.updateReviewComments": { access: "minimumRole", minimumRole: "member" },
  "projects.setStatus": { access: "minimumRole", minimumRole: "admin" },
  "projects.archive": { access: "minimumRole", minimumRole: "admin" },
  "projects.unarchive": { access: "minimumRole", minimumRole: "admin" },
  "projects.remove": { access: "minimumRole", minimumRole: "admin" },

  "tasks.replaceForProject": { access: "minimumRole", minimumRole: "member" },
  "tasks.replaceForWorkspace": { access: "minimumRole", minimumRole: "member" },
  "tasks.bulkReplaceForWorkspace": { access: "minimumRole", minimumRole: "member" },

  "files.create": { access: "minimumRole", minimumRole: "member" },
  "files.remove": { access: "minimumRole", minimumRole: "member" },

  "settings.account.updateProfile": { access: "authenticated" },
  "settings.account.avatar": { access: "authenticated" },
  "settings.notifications.update": { access: "authenticated" },
  "settings.company.members.invite": { access: "minimumRole", minimumRole: "admin" },
  "settings.company.members.changeRole": { access: "minimumRole", minimumRole: "admin" },
  "settings.company.members.remove": { access: "minimumRole", minimumRole: "admin" },
  "settings.company.invitations.resend": { access: "minimumRole", minimumRole: "admin" },
  "settings.company.invitations.revoke": { access: "minimumRole", minimumRole: "admin" },
  "settings.company.brandAssets.manage": { access: "minimumRole", minimumRole: "admin" },

  "comments.create": { access: "minimumRole", minimumRole: "member" },
  "comments.toggleReaction": { access: "minimumRole", minimumRole: "member" },
  "comments.toggleResolved": { access: "minimumRole", minimumRole: "member" },
  "comments.update": {
    access: "minimumRole",
    minimumRole: "member",
    notes: "Member access with additional author-only enforcement in the mutation handler.",
  },
  "comments.remove": {
    access: "minimumRole",
    minimumRole: "member",
    notes: "Member access with additional author-only enforcement in the mutation handler.",
  },

  "organizationSync.reconcileWorkspaceOrganizationMemberships": {
    access: "system",
    notes: "Owner/admin gate enforced by internal context query.",
  },
  "organizationSyncInternal.applyOrganizationMembershipSnapshot": {
    access: "system",
    notes: "Internal-only mutation path.",
  },
} satisfies Record<string, RbacEntry>;
