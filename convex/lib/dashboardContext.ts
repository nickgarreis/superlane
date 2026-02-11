import { ConvexError } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { getResolvedAuthUser, requireAuthUser } from "./auth";

export const buildProvisioningSnapshot = (authUser: {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profilePictureUrl?: string | null;
}) => {
  const name =
    [authUser.firstName, authUser.lastName].filter(Boolean).join(" ").trim() ||
    authUser.email ||
    "Unknown user";

  return {
    viewer: {
      id: null,
      workosUserId: authUser.id,
      name,
      email: authUser.email ?? null,
      avatarUrl: authUser.profilePictureUrl ?? null,
    },
    workspaces: [],
    activeWorkspace: null,
    activeWorkspaceSlug: null,
    projects: [],
    tasks: [],
    workspaceMembers: [],
  };
};

export const buildProvisioningContext = (authUser: {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profilePictureUrl?: string | null;
}) => {
  const base = buildProvisioningSnapshot(authUser);
  return {
    viewer: base.viewer,
    workspaces: base.workspaces,
    activeWorkspace: base.activeWorkspace,
    activeWorkspaceSlug: base.activeWorkspaceSlug,
  };
};

type AppUserDoc = Doc<"users">;
type WorkspaceDoc = Doc<"workspaces">;
type WorkspaceMemberDoc = Doc<"workspaceMembers">;

export const resolveAvatarUrl = async (ctx: QueryCtx, appUser: AppUserDoc) => {
  // Prefer persisted URL to avoid repeated storage URL lookups on hot query paths.
  if (typeof appUser.avatarUrl === "string" && appUser.avatarUrl.trim().length > 0) {
    return appUser.avatarUrl;
  }
  if (appUser.avatarStorageId) {
    return (await ctx.storage.getUrl(appUser.avatarStorageId)) ?? null;
  }
  return null;
};

type DashboardAccess = {
  provisioned: true;
  appUser: AppUserDoc;
  authUser: null;
  workspaces: WorkspaceDoc[];
  activeWorkspace: WorkspaceDoc | null;
} | {
  provisioned: false;
  authUser: {
    id: string;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    profilePictureUrl?: string | null;
  };
  appUser: null;
  workspaces: WorkspaceDoc[];
  activeWorkspace: null;
};

export const getAccessibleWorkspaceContext = async (
  ctx: QueryCtx,
  args: { activeWorkspaceSlug?: string },
): Promise<DashboardAccess> => {
  let appUser: AppUserDoc;
  try {
    ({ appUser } = await requireAuthUser(ctx));
  } catch (error) {
    if (
      error instanceof ConvexError &&
      error.message === "Authenticated user is not provisioned"
    ) {
      const authUser = await getResolvedAuthUser(ctx);
      if (!authUser) {
        throw new ConvexError("Unauthorized");
      }
      return {
        provisioned: false as const,
        authUser,
        appUser: null,
        workspaces: [],
        activeWorkspace: null,
      };
    }
    throw error;
  }

  const memberships = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_userId", (q) => q.eq("userId", appUser._id))
    .collect();
  const activeMemberships = memberships.filter((membership) => membership.status === "active");

  const workspaceCandidates = (
    await Promise.all(activeMemberships.map((membership) => ctx.db.get(membership.workspaceId)))
  ).filter((workspace): workspace is WorkspaceDoc => workspace !== null && workspace.deletedAt == null);

  const orgMemberships = await ctx.db
    .query("workosOrganizationMemberships")
    .withIndex("by_workosUserId", (q) => q.eq("workosUserId", appUser.workosUserId))
    .collect();
  const activeOrganizationIds = new Set(
    orgMemberships
      .filter((membership) => membership.status === "active")
      .map((membership) => membership.workosOrganizationId),
  );
  const workspacesWithOrgAccess = workspaceCandidates.map((workspace) => {
    if (!workspace.workosOrganizationId) {
      return workspace;
    }
    return activeOrganizationIds.has(workspace.workosOrganizationId)
      ? workspace
      : null;
  });

  const workspaces = workspacesWithOrgAccess
    .filter((workspace): workspace is WorkspaceDoc => workspace !== null)
    .sort((a, b) => a.name.localeCompare(b.name));

  const desiredWorkspace = args.activeWorkspaceSlug
    ? workspaces.find((workspace) => workspace.slug === args.activeWorkspaceSlug)
    : undefined;

  return {
    provisioned: true as const,
    appUser,
    authUser: null,
    workspaces,
    activeWorkspace: desiredWorkspace ?? workspaces[0] ?? null,
  };
};

export type SnapshotWorkspaceMember = {
  userId: string;
  workosUserId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: "owner" | "admin" | "member";
  isViewer: boolean;
};

type WorkspaceMembersHydrationArgs = {
  membershipRows: WorkspaceMemberDoc[];
  viewerUserId: Id<"users">;
  sortResults?: boolean;
};

export const hydrateWorkspaceMembers = async (
  ctx: QueryCtx,
  args: WorkspaceMembersHydrationArgs,
): Promise<SnapshotWorkspaceMember[]> => {
  if (args.membershipRows.length === 0) {
    return [];
  }

  const uniqueUserIds = Array.from(
    new Set(args.membershipRows.map((membership) => String(membership.userId))),
  );
  const userRows = await Promise.all(
    uniqueUserIds.map(async (userId) => {
      const sampleMembership = args.membershipRows.find(
        (membership) => String(membership.userId) === userId,
      );
      if (!sampleMembership) {
        return null;
      }
      const user = await ctx.db.get(sampleMembership.userId);
      return user ? ([userId, user] as const) : null;
    }),
  );
  const userById = new Map(
    userRows.filter(
      (entry): entry is readonly [string, AppUserDoc] => entry !== null,
    ),
  );
  const members = await Promise.all(
    args.membershipRows.map(async (membership) => {
      const memberUser = userById.get(String(membership.userId));
      if (!memberUser) {
        return null;
      }

      return {
        userId: String(memberUser._id),
        workosUserId: memberUser.workosUserId,
        name: membership.nameSnapshot ?? memberUser.name,
        email: membership.emailSnapshot ?? memberUser.email ?? "",
        avatarUrl:
          membership.avatarUrlSnapshot ??
          (await resolveAvatarUrl(ctx, memberUser)),
        role: membership.role,
        isViewer: String(memberUser._id) === String(args.viewerUserId),
      } satisfies SnapshotWorkspaceMember;
    }),
  );

  const resolved = members.filter((member): member is SnapshotWorkspaceMember => member !== null);
  if (args.sortResults === false) {
    return resolved;
  }

  return resolved.sort((a, b) => {
    if (a.isViewer && !b.isViewer) return -1;
    if (!a.isViewer && b.isViewer) return 1;
    return a.name.localeCompare(b.name);
  });
};

export const listWorkspaceMembers = async (
  ctx: QueryCtx,
  args: {
    activeWorkspace: WorkspaceDoc | null;
    appUser: AppUserDoc | null;
  },
): Promise<SnapshotWorkspaceMember[]> => {
  const activeWorkspace = args.activeWorkspace;
  if (!activeWorkspace || !args.appUser) {
    return [];
  }

  const workspaceMemberships = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_workspace_status_joinedAt", (q) =>
      q.eq("workspaceId", activeWorkspace._id).eq("status", "active"))
    .collect();

  return hydrateWorkspaceMembers(ctx, {
    membershipRows: workspaceMemberships,
    viewerUserId: args.appUser._id,
  });
};
