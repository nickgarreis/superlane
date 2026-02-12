import { ConvexError, v } from "convex/values";
import { makeFunctionReference } from "convex/server";
import type { Id } from "./_generated/dataModel";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { authKit } from "./auth";
import { requireAuthUser, requireWorkspaceMember, requireWorkspaceRole } from "./lib/auth";
import { logError } from "./lib/logging";
import { hasActiveOrganizationMembershipForWorkspace } from "./lib/workosOrganization";

const workosMembershipStatusValidator = v.union(
  v.literal("active"),
  v.literal("pending"),
  v.literal("inactive"),
  v.literal("removed"),
);
const organizationMembershipSeedValidator = v.object({
  membershipId: v.string(),
  workosOrganizationId: v.string(),
  workosUserId: v.string(),
  organizationName: v.optional(v.string()),
  roleSlug: v.optional(v.string()),
  status: workosMembershipStatusValidator,
});

type WorkspaceRole = "owner" | "admin" | "member";
type WorkspaceMemberStatus = "active" | "invited" | "removed";
type WorkosMembershipStatus = "active" | "pending" | "inactive" | "removed";
type WorkspaceMemberAuditEvent =
  | "pending_removal_scheduled"
  | "pending_removal_cleared"
  | "removed_after_grace";

type OrganizationMembershipSeed = {
  membershipId: string;
  workosOrganizationId: string;
  workosUserId: string;
  organizationName?: string;
  roleSlug?: string;
  status: WorkosMembershipStatus;
};

const DEFAULT_WORKSPACE_MEMBER_PENDING_REMOVAL_GRACE_MS = 24 * 60 * 60 * 1000;
const WORKSPACE_MEMBER_REMOVAL_GRACE_ENV_VAR = "WORKSPACE_MEMBER_REMOVAL_GRACE_MS";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "workspace";

const ensureUniqueWorkspaceSlug = async (ctx: any, base: string) => {
  let candidate = base;
  let i = 2;

  while (true) {
    const exists = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q: any) => q.eq("slug", candidate))
      .unique();
    if (!exists) {
      return candidate;
    }
    candidate = `${base}-${i}`;
    i += 1;
  }
};

const mapWorkspaceRoleToWorkosRoleSlug = (role: WorkspaceRole): "admin" | "member" =>
  role === "member" ? "member" : "admin";

const normalizeMembershipStatus = (value: string | null | undefined): WorkosMembershipStatus => {
  switch ((value ?? "").toLowerCase()) {
    case "active":
      return "active";
    case "pending":
      return "pending";
    case "removed":
      return "removed";
    case "inactive":
    default:
      return "inactive";
  }
};

const parsePositiveIntegerEnv = (value: string | undefined) => {
  if (!value) {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

const resolvePendingRemovalGracePeriodMs = () =>
  parsePositiveIntegerEnv(process.env[WORKSPACE_MEMBER_REMOVAL_GRACE_ENV_VAR]) ??
  DEFAULT_WORKSPACE_MEMBER_PENDING_REMOVAL_GRACE_MS;

const writeWorkspaceMemberAuditLog = async (
  ctx: any,
  args: {
    workspaceMemberId: Id<"workspaceMembers">;
    workspaceId: Id<"workspaces">;
    userId: Id<"users">;
    eventType: WorkspaceMemberAuditEvent;
    reason: string;
    previousStatus: WorkspaceMemberStatus;
    nextStatus: WorkspaceMemberStatus;
    pendingRemovalAt?: number;
    createdAt: number;
  },
) => {
  await ctx.db.insert("workspaceMemberAuditLogs", {
    workspaceMemberId: args.workspaceMemberId,
    workspaceId: args.workspaceId,
    userId: args.userId,
    eventType: args.eventType,
    reason: args.reason,
    previousStatus: args.previousStatus,
    nextStatus: args.nextStatus,
    pendingRemovalAt: args.pendingRemovalAt,
    createdAt: args.createdAt,
  });
};

const rollbackOrganizationProvisioning = async (
  organizationId: string,
  context: Record<string, unknown>,
) => {
  try {
    await authKit.workos.organizations.deleteOrganization(organizationId);
  } catch (rollbackError) {
    logError("workspaces.rollbackOrganizationProvisioning", "Failed to rollback WorkOS organization provisioning", {
      organizationId,
      rollbackError,
      ...context,
    });
  }
};

const provisionOrganizationForWorkspace = async (
  args: {
    workspaceName: string;
    members: Array<{
      workosUserId: string;
      workspaceRole: WorkspaceRole;
    }>;
  },
): Promise<{ organizationId: string; memberships: OrganizationMembershipSeed[] }> => {
  let organizationId: string | null = null;

  try {
    const organization = await authKit.workos.organizations.createOrganization({
      name: args.workspaceName,
    });
    organizationId = organization.id;

    const memberships: OrganizationMembershipSeed[] = [];
    for (const member of args.members) {
      const requestedRoleSlug = mapWorkspaceRoleToWorkosRoleSlug(member.workspaceRole);
      const membership = await authKit.workos.userManagement.createOrganizationMembership({
        organizationId,
        userId: member.workosUserId,
        roleSlug: requestedRoleSlug,
      });

      memberships.push({
        membershipId: membership.id,
        workosOrganizationId: organizationId,
        workosUserId: member.workosUserId,
        organizationName: membership.organizationName ?? organization.name,
        roleSlug: membership.role?.slug ?? membership.roles?.[0]?.slug ?? requestedRoleSlug,
        status: normalizeMembershipStatus(membership.status),
      });
    }

    return {
      organizationId,
      memberships,
    };
  } catch (error) {
    if (organizationId) {
      await rollbackOrganizationProvisioning(organizationId, {
        workspaceName: args.workspaceName,
        stage: "provisioning",
      });
    }
    throw new ConvexError("Failed to provision WorkOS organization for workspace");
  }
};

const upsertOrganizationMembershipCacheRows = async (
  ctx: any,
  memberships: OrganizationMembershipSeed[],
  now: number,
) => {
  for (const membership of memberships) {
    const existing = await ctx.db
      .query("workosOrganizationMemberships")
      .withIndex("by_membershipId", (q: any) => q.eq("membershipId", membership.membershipId))
      .unique();

    const patch = {
      membershipId: membership.membershipId,
      workosOrganizationId: membership.workosOrganizationId,
      workosUserId: membership.workosUserId,
      organizationName: membership.organizationName,
      roleSlug: membership.roleSlug,
      status: membership.status,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
    } else {
      await ctx.db.insert("workosOrganizationMemberships", {
        ...patch,
        createdAt: now,
      });
    }
  }
};

const getProvisioningAuthContextRef = makeFunctionReference<"mutation">(
  "workspaces:internalGetProvisioningAuthContext",
);
const createWorkspaceWithOrganizationRef = makeFunctionReference<"mutation">(
  "workspaces:internalCreateWorkspaceWithOrganization",
);
const resolveDefaultWorkspaceAccessRef = makeFunctionReference<"query">(
  "workspaces:internalResolveDefaultWorkspaceAccess",
);
const getOrganizationLinkContextRef = makeFunctionReference<"query">(
  "workspaces:internalGetOrganizationLinkContext",
);
const linkWorkspaceOrganizationRef = makeFunctionReference<"mutation">(
  "workspaces:internalLinkWorkspaceOrganization",
);

export const internalGetProvisioningAuthContext = internalMutation({
  args: {},
  handler: async (ctx) => {
    const { appUser } = await requireAuthUser(ctx);
    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_userId", (q: any) => q.eq("userId", appUser._id))
      .collect();
    const activeMemberships = memberships.filter((membership: any) => membership.status === "active");

    let hasAccessibleMembership = false;
    let hasAccessibleOwnerMembership = false;
    for (const membership of activeMemberships) {
      const workspace = await ctx.db.get(membership.workspaceId);
      if (!workspace || workspace.deletedAt != null) {
        continue;
      }

      const hasOrganizationAccess = await hasActiveOrganizationMembershipForWorkspace(
        ctx,
        workspace,
        appUser.workosUserId,
      );
      if (!hasOrganizationAccess) {
        continue;
      }

      hasAccessibleMembership = true;
      if (membership.role === "owner") {
        hasAccessibleOwnerMembership = true;
        break;
      }
    }

    return {
      userId: appUser._id,
      workosUserId: appUser.workosUserId,
      name: appUser.name,
      hasAccessibleMembership,
      hasAccessibleOwnerMembership,
    };
  },
});

export const internalCreateWorkspaceWithOrganization = internalMutation({
  args: {
    name: v.string(),
    plan: v.optional(v.string()),
    logo: v.optional(v.string()),
    logoColor: v.optional(v.string()),
    logoText: v.optional(v.string()),
    ownerUserId: v.id("users"),
    workosOrganizationId: v.string(),
    organizationMemberships: v.array(organizationMembershipSeedValidator),
  },
  handler: async (ctx, args) => {
    const workspaceName = args.name.trim();
    if (!workspaceName) {
      throw new ConvexError("Workspace name is required");
    }

    const mappedWorkspace = await ctx.db
      .query("workspaces")
      .withIndex("by_workosOrganizationId", (q: any) =>
        q.eq("workosOrganizationId", args.workosOrganizationId),
      )
      .unique();

    if (mappedWorkspace) {
      throw new ConvexError("Organization is already linked to a workspace");
    }

    const baseSlug = slugify(workspaceName);
    const slug = await ensureUniqueWorkspaceSlug(ctx, baseSlug);
    const now = Date.now();

    const workspaceId = await ctx.db.insert("workspaces", {
      slug,
      name: workspaceName,
      plan: args.plan ?? "Free Plan",
      logo: args.logo,
      logoColor: args.logoColor,
      logoText: args.logoText ?? workspaceName.charAt(0).toUpperCase(),
      ownerUserId: args.ownerUserId,
      workosOrganizationId: args.workosOrganizationId,
      createdAt: now,
      updatedAt: now,
    });

    const ownerUser = await ctx.db.get(args.ownerUserId);
    await ctx.db.insert("workspaceMembers", {
      workspaceId,
      userId: args.ownerUserId,
      nameSnapshot: ownerUser?.name ?? "Unknown user",
      emailSnapshot: ownerUser?.email ?? "",
      avatarUrlSnapshot: ownerUser?.avatarUrl ?? null,
      role: "owner",
      status: "active",
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await upsertOrganizationMembershipCacheRows(ctx, args.organizationMemberships, now);

    return { workspaceId, slug };
  },
});

export const internalResolveDefaultWorkspaceAccess = internalQuery({
  args: {
    userId: v.id("users"),
    workosUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    for (const membership of memberships) {
      if (membership.status !== "active") {
        continue;
      }

      const workspace = await ctx.db.get(membership.workspaceId);
      if (!workspace) {
        continue;
      }
      if (workspace.deletedAt != null) {
        continue;
      }

      const hasOrgAccess = await hasActiveOrganizationMembershipForWorkspace(
        ctx,
        workspace,
        args.workosUserId,
      );

      if (hasOrgAccess) {
        return { slug: workspace.slug };
      }
    }

    return { slug: null as string | null };
  },
});

export const internalCleanupPendingWorkspaceMemberRemovals = internalMutation({
  args: {
    gracePeriodMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const gracePeriodMs = args.gracePeriodMs ?? resolvePendingRemovalGracePeriodMs();
    const removalCutoff = now - gracePeriodMs;

    const activeMemberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    let scheduledPendingRemovalCount = 0;
    let clearedPendingRemovalCount = 0;
    let removedMembershipCount = 0;

    for (const membership of activeMemberships) {
      const workspace = await ctx.db.get(membership.workspaceId);
      const user = await ctx.db.get(membership.userId);
      const workspaceExists = workspace != null;
      const workspaceIsDeleted = workspace?.deletedAt != null;
      const userExists = user != null;

      const hasOrgAccess = workspaceExists && !workspaceIsDeleted && userExists
        ? await hasActiveOrganizationMembershipForWorkspace(ctx, workspace, user.workosUserId)
        : false;

      if (hasOrgAccess) {
        if (membership.pendingRemovalAt != null) {
          await ctx.db.patch(membership._id, {
            pendingRemovalAt: null,
            updatedAt: now,
          });
          await writeWorkspaceMemberAuditLog(ctx, {
            workspaceMemberId: membership._id,
            workspaceId: membership.workspaceId,
            userId: membership.userId,
            eventType: "pending_removal_cleared",
            reason: "organization_membership_restored",
            previousStatus: "active",
            nextStatus: "active",
            pendingRemovalAt: membership.pendingRemovalAt,
            createdAt: now,
          });
          clearedPendingRemovalCount += 1;
        }
        continue;
      }

      const reason = !workspaceExists
        ? "workspace_missing"
        : workspaceIsDeleted
          ? "workspace_deleted"
          : !userExists
            ? "user_missing"
            : "organization_membership_inactive";

      if (membership.pendingRemovalAt == null) {
        await ctx.db.patch(membership._id, {
          pendingRemovalAt: now,
          updatedAt: now,
        });
        await writeWorkspaceMemberAuditLog(ctx, {
          workspaceMemberId: membership._id,
          workspaceId: membership.workspaceId,
          userId: membership.userId,
          eventType: "pending_removal_scheduled",
          reason,
          previousStatus: "active",
          nextStatus: "active",
          pendingRemovalAt: now,
          createdAt: now,
        });
        scheduledPendingRemovalCount += 1;
        continue;
      }

      if (membership.pendingRemovalAt > removalCutoff) {
        continue;
      }

      await ctx.db.patch(membership._id, {
        status: "removed",
        pendingRemovalAt: null,
        updatedAt: now,
      });
      await writeWorkspaceMemberAuditLog(ctx, {
        workspaceMemberId: membership._id,
        workspaceId: membership.workspaceId,
        userId: membership.userId,
        eventType: "removed_after_grace",
        reason,
        previousStatus: "active",
        nextStatus: "removed",
        pendingRemovalAt: membership.pendingRemovalAt,
        createdAt: now,
      });
      removedMembershipCount += 1;
    }

    return {
      scannedMembershipCount: activeMemberships.length,
      scheduledPendingRemovalCount,
      clearedPendingRemovalCount,
      removedMembershipCount,
      gracePeriodMs,
    };
  },
});

export const internalGetOrganizationLinkContext = internalQuery({
  args: {
    workspaceSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q) => q.eq("slug", args.workspaceSlug))
      .unique();

    if (!workspace || workspace.deletedAt != null) {
      throw new ConvexError("Workspace not found");
    }

    const { appUser } = await requireWorkspaceRole(ctx, workspace._id, "owner", { workspace });
    const membershipRows = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspaceId", (q: any) => q.eq("workspaceId", workspace._id))
      .collect();

    const activeMembers: Array<{
      userId: Id<"users">;
      workosUserId: string;
      workspaceRole: WorkspaceRole;
    }> = [];

    for (const membership of membershipRows) {
      if (membership.status !== "active") {
        continue;
      }

      const user = await ctx.db.get(membership.userId);
      if (!user) {
        continue;
      }

      activeMembers.push({
        userId: user._id,
        workosUserId: user.workosUserId,
        workspaceRole: membership.role,
      });
    }

    return {
      workspaceId: workspace._id,
      workspaceSlug: workspace.slug,
      workspaceName: workspace.name,
      workosOrganizationId: workspace.workosOrganizationId ?? null,
      actorUserId: appUser._id,
      activeMembers,
    };
  },
});

export const internalLinkWorkspaceOrganization = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    workosOrganizationId: v.string(),
    organizationMemberships: v.array(organizationMembershipSeedValidator),
    updatedByUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.deletedAt != null) {
      throw new ConvexError("Workspace not found");
    }

    if (workspace.workosOrganizationId) {
      if (workspace.workosOrganizationId !== args.workosOrganizationId) {
        throw new ConvexError("Workspace is already linked to another WorkOS organization");
      }

      return {
        workspaceSlug: workspace.slug,
        workosOrganizationId: workspace.workosOrganizationId,
        linkedMembersCount: 0,
        alreadyLinked: true,
      };
    }

    const mappedWorkspace = await ctx.db
      .query("workspaces")
      .withIndex("by_workosOrganizationId", (q: any) =>
        q.eq("workosOrganizationId", args.workosOrganizationId),
      )
      .unique();

    if (mappedWorkspace && mappedWorkspace._id !== workspace._id) {
      throw new ConvexError("Organization is already linked to a workspace");
    }

    const now = Date.now();
    await ctx.db.patch(workspace._id, {
      workosOrganizationId: args.workosOrganizationId,
      updatedAt: now,
      updatedByUserId: args.updatedByUserId,
    });

    await upsertOrganizationMembershipCacheRows(ctx, args.organizationMemberships, now);

    return {
      workspaceSlug: workspace.slug,
      workosOrganizationId: args.workosOrganizationId,
      linkedMembersCount: args.organizationMemberships.length,
      alreadyLinked: false,
    };
  },
});

export const create = action({
  args: {
    name: v.string(),
    plan: v.optional(v.string()),
    logo: v.optional(v.string()),
    logoColor: v.optional(v.string()),
    logoText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authContext = await ctx.runMutation(getProvisioningAuthContextRef as any, {});
    if (authContext.hasAccessibleMembership && !authContext.hasAccessibleOwnerMembership) {
      throw new ConvexError("Only workspace owners can create workspaces");
    }

    const workspaceName = args.name.trim();
    if (!workspaceName) {
      throw new ConvexError("Workspace name is required");
    }

    const provisioned = await provisionOrganizationForWorkspace({
      workspaceName,
      members: [{ workosUserId: authContext.workosUserId, workspaceRole: "owner" }],
    });

    try {
      return await ctx.runMutation(createWorkspaceWithOrganizationRef as any, {
        name: workspaceName,
        plan: args.plan,
        logo: args.logo,
        logoColor: args.logoColor,
        logoText: args.logoText,
        ownerUserId: authContext.userId,
        workosOrganizationId: provisioned.organizationId,
        organizationMemberships: provisioned.memberships,
      });
    } catch (error) {
      await rollbackOrganizationProvisioning(provisioned.organizationId, {
        workspaceName,
        stage: "createWorkspaceMutation",
      });
      throw error;
    }
  },
});

export const update = mutation({
  args: {
    slug: v.string(),
    name: v.optional(v.string()),
    plan: v.optional(v.string()),
    logo: v.optional(v.string()),
    logoColor: v.optional(v.string()),
    logoText: v.optional(v.string()),
    workosOrganizationId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!workspace) {
      throw new ConvexError("Workspace not found");
    }
    if (workspace.deletedAt != null) {
      throw new ConvexError("Workspace not found");
    }

    const { appUser, membership } = await requireWorkspaceRole(ctx, workspace._id, "admin", {
      workspace,
    });

    if (args.workosOrganizationId !== undefined && args.workosOrganizationId !== workspace.workosOrganizationId) {
      if (membership.role !== "owner") {
        throw new ConvexError("Forbidden");
      }

      const mappedWorkspace = await ctx.db
        .query("workspaces")
        .withIndex("by_workosOrganizationId", (q: any) =>
          q.eq("workosOrganizationId", args.workosOrganizationId),
        )
        .unique();

      if (mappedWorkspace && mappedWorkspace._id !== workspace._id) {
        throw new ConvexError("Organization is already linked to another workspace");
      }
    }

    const patch: Record<string, unknown> = {
      updatedAt: Date.now(),
      updatedByUserId: appUser._id,
    };

    if (args.name !== undefined) patch.name = args.name;
    if (args.plan !== undefined) patch.plan = args.plan;
    if (args.logo !== undefined) patch.logo = args.logo;
    if (args.logoColor !== undefined) patch.logoColor = args.logoColor;
    if (args.logoText !== undefined) patch.logoText = args.logoText;
    if (args.workosOrganizationId !== undefined) patch.workosOrganizationId = args.workosOrganizationId;

    await ctx.db.patch(workspace._id, patch);

    return { slug: workspace.slug };
  },
});

export const ensureDefaultWorkspace = action({
  args: {},
  handler: async (ctx) => {
    const authContext = await ctx.runMutation(getProvisioningAuthContextRef as any, {});
    const existing = await ctx.runQuery(resolveDefaultWorkspaceAccessRef as any, {
      userId: authContext.userId,
      workosUserId: authContext.workosUserId,
    });

    if (existing.slug) {
      return { created: false, slug: existing.slug };
    }

    const trimmedUserName = authContext.name.trim();
    const workspaceNamePrefix = trimmedUserName ? trimmedUserName.split(/\s+/)[0] : "My";
    const defaultWorkspaceName = `${workspaceNamePrefix} Workspace`;
    const logoText = (workspaceNamePrefix.charAt(0) || "W").toUpperCase();

    const provisioned = await provisionOrganizationForWorkspace({
      workspaceName: defaultWorkspaceName,
      members: [{ workosUserId: authContext.workosUserId, workspaceRole: "owner" }],
    });

    try {
      const created = await ctx.runMutation(createWorkspaceWithOrganizationRef as any, {
        name: defaultWorkspaceName,
        plan: "Free Plan",
        logoColor: "#193cb8",
        logoText,
        ownerUserId: authContext.userId,
        workosOrganizationId: provisioned.organizationId,
        organizationMemberships: provisioned.memberships,
      });
      return { created: true, slug: created.slug };
    } catch (error) {
      await rollbackOrganizationProvisioning(provisioned.organizationId, {
        workspaceName: defaultWorkspaceName,
        stage: "ensureDefaultWorkspace",
      });
      throw error;
    }
  },
});

export const ensureOrganizationLink = action({
  args: {
    workspaceSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const context = await ctx.runQuery(getOrganizationLinkContextRef as any, {
      workspaceSlug: args.workspaceSlug,
    });

    if (context.workosOrganizationId) {
      return {
        workspaceSlug: context.workspaceSlug,
        workosOrganizationId: context.workosOrganizationId,
        linkedMembersCount: 0,
        alreadyLinked: true,
      };
    }

    if (context.activeMembers.length === 0) {
      throw new ConvexError("Workspace has no active members to link");
    }

    const provisioned = await provisionOrganizationForWorkspace({
      workspaceName: context.workspaceName,
      members: context.activeMembers.map((member: any) => ({
        workosUserId: member.workosUserId,
        workspaceRole: member.workspaceRole,
      })),
    });

    try {
      return await ctx.runMutation(linkWorkspaceOrganizationRef as any, {
        workspaceId: context.workspaceId,
        workosOrganizationId: provisioned.organizationId,
        organizationMemberships: provisioned.memberships,
        updatedByUserId: context.actorUserId,
      });
    } catch (error) {
      await rollbackOrganizationProvisioning(provisioned.organizationId, {
        workspaceSlug: context.workspaceSlug,
        stage: "ensureOrganizationLink",
      });
      throw error;
    }
  },
});

export const switchWorkspace = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!workspace) {
      return null;
    }
    if (workspace.deletedAt != null) {
      return null;
    }

    await requireWorkspaceMember(ctx, workspace._id, { workspace });

    return {
      slug: workspace.slug,
      name: workspace.name,
    };
  },
});
