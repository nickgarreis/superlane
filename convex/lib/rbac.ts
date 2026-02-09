export type WorkspaceRole = "owner" | "admin" | "member";

type RbacEntry =
  | {
      access: "authenticated";
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
  "workspaces.create": { access: "authenticated" },
  "workspaces.ensureDefaultWorkspace": { access: "authenticated" },
  "workspaces.update": { access: "minimumRole", minimumRole: "admin" },
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
  "tasks.bulkReplaceForWorkspace": { access: "minimumRole", minimumRole: "member" },

  "files.create": { access: "minimumRole", minimumRole: "member" },
  "files.remove": { access: "minimumRole", minimumRole: "member" },

  "comments.create": { access: "minimumRole", minimumRole: "member" },
  "comments.toggleReaction": { access: "minimumRole", minimumRole: "member" },
  "comments.toggleResolved": { access: "minimumRole", minimumRole: "member" },
  "comments.update": {
    access: "authorOrMinimumRole",
    minimumRole: "admin",
  },
  "comments.remove": {
    access: "authorOrMinimumRole",
    minimumRole: "admin",
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
