import { ConvexError } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { authKit } from "../auth";
import { hasRequiredWorkspaceRole, type WorkspaceRole } from "./rbac";
import { requireActiveOrganizationMembershipForWorkspace } from "./workosOrganization";

type ResolvedAuthUser = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profilePictureUrl?: string | null;
};

type IndexEqBuilder = {
  eq: (field: string, value: unknown) => IndexEqBuilder;
};

const toNonEmptyString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const splitDisplayName = (value: string | undefined): { firstName?: string; lastName?: string } => {
  if (!value) {
    return {};
  }
  const parts = value.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return {};
  }
  if (parts.length === 1) {
    return { firstName: parts[0] };
  }
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
};

const buildAuthUserFromIdentity = (identity: any): ResolvedAuthUser | null => {
  const id = toNonEmptyString(identity?.subject);
  if (!id) {
    return null;
  }

  const normalizedFirstName = toNonEmptyString(identity?.givenName)
    ?? toNonEmptyString(identity?.given_name)
    ?? toNonEmptyString(identity?.firstName)
    ?? toNonEmptyString(identity?.first_name);

  const normalizedLastName = toNonEmptyString(identity?.familyName)
    ?? toNonEmptyString(identity?.family_name)
    ?? toNonEmptyString(identity?.lastName)
    ?? toNonEmptyString(identity?.last_name);

  const splitName = splitDisplayName(
    toNonEmptyString(identity?.name) ?? toNonEmptyString(identity?.preferredUsername),
  );

  return {
    id,
    email: toNonEmptyString(identity?.email),
    firstName: normalizedFirstName ?? splitName.firstName,
    lastName: normalizedLastName ?? splitName.lastName,
    profilePictureUrl: toNonEmptyString(identity?.pictureUrl)
      ?? toNonEmptyString(identity?.picture)
      ?? toNonEmptyString(identity?.profilePictureUrl),
  };
};

async function resolveAuthUser(ctx: any): Promise<ResolvedAuthUser | null> {
  const authUser = await authKit.getAuthUser(ctx);
  if (authUser) {
    return authUser;
  }

  const identity = await ctx.auth.getUserIdentity();
  return buildAuthUserFromIdentity(identity);
}

export async function requireAuthUser(ctx: any) {
  const authUser = await resolveAuthUser(ctx);
  if (!authUser) {
    throw new ConvexError("Unauthorized");
  }

  let appUser = await ctx.db
    .query("users")
    .withIndex(
      "by_workosUserId",
      (q: IndexEqBuilder) => q.eq("workosUserId", authUser.id),
    )
    .unique();

  if (!appUser) {
    if (typeof ctx.db.insert !== "function") {
      throw new ConvexError("Authenticated user is not provisioned");
    }

    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      workosUserId: authUser.id,
      email: authUser.email ?? undefined,
      firstName: authUser.firstName ?? undefined,
      lastName: authUser.lastName ?? undefined,
      name:
        [authUser.firstName, authUser.lastName].filter(Boolean).join(" ").trim() ||
        authUser.email ||
        "Unknown user",
      avatarUrl: authUser.profilePictureUrl ?? undefined,
      createdAt: now,
      updatedAt: now,
    });
    appUser = await ctx.db.get(userId);
  }

  if (!appUser) {
    throw new ConvexError("Unable to resolve application user");
  }

  return { authUser, appUser };
}

export async function getResolvedAuthUser(ctx: any): Promise<ResolvedAuthUser | null> {
  return resolveAuthUser(ctx);
}

export async function requireWorkspaceMember(
  ctx: any,
  workspaceId: Id<"workspaces">,
  options?: { allowInvited?: boolean; workspace?: any },
) {
  const { appUser } = await requireAuthUser(ctx);

  const membership = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_workspace_user", (q: IndexEqBuilder) =>
      q.eq("workspaceId", workspaceId).eq("userId", appUser._id),
    )
    .unique();

  if (!membership) {
    throw new ConvexError("Forbidden");
  }

  if (membership.status !== "active" && !(options?.allowInvited && membership.status === "invited")) {
    throw new ConvexError("Forbidden");
  }

  const workspace = options?.workspace ?? (await ctx.db.get(workspaceId));
  if (!workspace) {
    throw new ConvexError("Workspace not found");
  }
  if (workspace.deletedAt != null) {
    throw new ConvexError("Workspace not found");
  }

  const organizationMembership = await requireActiveOrganizationMembershipForWorkspace(
    ctx,
    workspace,
    appUser.workosUserId,
  );

  return { membership, appUser, workspace, organizationMembership };
}

export async function requireWorkspaceRole(
  ctx: any,
  workspaceId: Id<"workspaces">,
  minimumRole: WorkspaceRole,
  options?: { allowInvited?: boolean; workspace?: any },
) {
  const access = await requireWorkspaceMember(ctx, workspaceId, options);
  if (!hasRequiredWorkspaceRole(access.membership.role, minimumRole)) {
    throw new ConvexError("Forbidden");
  }
  return access;
}

const ensureActiveProject = (project: any) => {
  if (!project || project.deletedAt != null) {
    throw new ConvexError("Project not found");
  }
  return project;
};

const getActiveProjectByPublicId = async (ctx: any, publicId: string) => {
  const project = await ctx.db
    .query("projects")
    .withIndex("by_publicId", (q: IndexEqBuilder) => q.eq("publicId", publicId))
    .unique();

  return ensureActiveProject(project);
};

const getActiveProjectById = async (ctx: any, projectId: Id<"projects">) => {
  const project = await ctx.db.get(projectId);
  return ensureActiveProject(project);
};

export async function requireProjectRole(
  ctx: any,
  publicId: string,
  minimumRole: WorkspaceRole,
) {
  const project = await getActiveProjectByPublicId(ctx, publicId);
  const access = await requireWorkspaceRole(ctx, project.workspaceId, minimumRole);
  return {
    project,
    ...access,
  };
}

export async function requireProjectRoleById(
  ctx: any,
  projectId: Id<"projects">,
  minimumRole: WorkspaceRole,
) {
  const project = await getActiveProjectById(ctx, projectId);
  const access = await requireWorkspaceRole(ctx, project.workspaceId, minimumRole);
  return {
    project,
    ...access,
  };
}
