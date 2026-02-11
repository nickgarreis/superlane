import { ConvexError } from "convex/values";
import type { Id } from "../_generated/dataModel";

type WorkspaceRole = "owner" | "admin" | "member";
type WorkspaceMemberStatus = "active" | "invited" | "removed";
type WorkosMembershipStatus = "active" | "pending" | "inactive" | "removed";

type WorkspaceWithOrganization = {
  _id: Id<"workspaces">;
  workosOrganizationId?: string;
};

const normalizeStatus = (status?: string | null): WorkosMembershipStatus => {
  switch ((status ?? "").toLowerCase()) {
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

const mapStatusToWorkspaceStatus = (status: WorkosMembershipStatus): WorkspaceMemberStatus => {
  switch (status) {
    case "active":
      return "active";
    case "pending":
      return "invited";
    case "inactive":
    case "removed":
    default:
      return "removed";
  }
};

const mapRoleToWorkspaceRole = (roleSlug?: string | null): WorkspaceRole => {
  const normalizedRole = (roleSlug ?? "").toLowerCase();
  if (normalizedRole.includes("owner")) {
    return "owner";
  }
  if (normalizedRole.includes("admin")) {
    return "admin";
  }
  return "member";
};

export async function hasActiveOrganizationMembershipForWorkspace(
  ctx: any,
  workspace: WorkspaceWithOrganization,
  workosUserId: string,
) {
  if (!workspace.workosOrganizationId) {
    return true;
  }

  const membership = await ctx.db
    .query("workosOrganizationMemberships")
    .withIndex("by_workosOrganizationId_workosUserId", (q: any) =>
      q.eq("workosOrganizationId", workspace.workosOrganizationId).eq("workosUserId", workosUserId),
    )
    .unique();

  return membership?.status === "active";
}

export async function requireActiveOrganizationMembershipForWorkspace(
  ctx: any,
  workspace: WorkspaceWithOrganization,
  workosUserId: string,
) {
  if (!workspace.workosOrganizationId) {
    return null;
  }

  const membership = await ctx.db
    .query("workosOrganizationMemberships")
    .withIndex("by_workosOrganizationId_workosUserId", (q: any) =>
      q.eq("workosOrganizationId", workspace.workosOrganizationId).eq("workosUserId", workosUserId),
    )
    .unique();

  if (!membership || membership.status !== "active") {
    throw new ConvexError("Forbidden");
  }

  return membership;
}

export async function upsertWorkosOrganizationMembership(
  ctx: any,
  args: {
    membershipId: string;
    workosOrganizationId: string;
    workosUserId: string;
    status?: string | null;
    organizationName?: string | null;
    roleSlug?: string | null;
    now?: number;
  },
) {
  const now = args.now ?? Date.now();
  const normalizedStatus = normalizeStatus(args.status);
  const existing = await ctx.db
    .query("workosOrganizationMemberships")
    .withIndex("by_membershipId", (q: any) => q.eq("membershipId", args.membershipId))
    .unique();

  const patch = {
    membershipId: args.membershipId,
    workosOrganizationId: args.workosOrganizationId,
    workosUserId: args.workosUserId,
    organizationName: args.organizationName ?? undefined,
    roleSlug: args.roleSlug ?? undefined,
    status: normalizedStatus,
    updatedAt: now,
  };

  if (existing) {
    await ctx.db.patch(existing._id, patch);
    return normalizedStatus;
  }

  await ctx.db.insert("workosOrganizationMemberships", {
    ...patch,
    createdAt: now,
  });

  return normalizedStatus;
}

export async function syncWorkspaceMemberFromOrganizationMembership(
  ctx: any,
  args: {
    workspaceId: Id<"workspaces">;
    userId: Id<"users">;
    roleSlug?: string | null;
    status?: string | null;
    now?: number;
  },
) {
  const now = args.now ?? Date.now();
  const workspaceStatus = mapStatusToWorkspaceStatus(normalizeStatus(args.status));
  const workspaceRole = mapRoleToWorkspaceRole(args.roleSlug);
  const targetUser = await ctx.db.get(args.userId);
  if (!targetUser) {
    throw new Error(`User not found: ${args.userId}`);
  }
  const nameSnapshot = targetUser.name ?? "";
  const emailSnapshot = targetUser.email ?? "";
  const avatarUrlSnapshot = targetUser.avatarUrl ?? null;

  const existing = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_workspace_user", (q: any) =>
      q.eq("workspaceId", args.workspaceId).eq("userId", args.userId),
    )
    .unique();

  if (existing) {
    const nextRole: WorkspaceRole = existing.role === "owner" ? "owner" : workspaceRole;
    await ctx.db.patch(existing._id, {
      role: nextRole,
      status: workspaceStatus,
      nameSnapshot,
      emailSnapshot,
      avatarUrlSnapshot,
      updatedAt: now,
    });
    return { created: false, role: nextRole, status: workspaceStatus };
  }

  await ctx.db.insert("workspaceMembers", {
    workspaceId: args.workspaceId,
    userId: args.userId,
    nameSnapshot,
    emailSnapshot,
    avatarUrlSnapshot,
    role: workspaceRole,
    status: workspaceStatus,
    joinedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  return { created: true, role: workspaceRole, status: workspaceStatus };
}
