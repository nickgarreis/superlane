import { ConvexError } from "convex/values";
import { getResolvedAuthUser, requireAuthUser } from "./auth";
import { hasActiveOrganizationMembershipForWorkspace } from "./workosOrganization";

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

export const resolveAvatarUrl = async (ctx: any, appUser: any) => {
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
  appUser: any;
  authUser: null;
  workspaces: any[];
  activeWorkspace: any | null;
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
  workspaces: any[];
  activeWorkspace: null;
};

export const getAccessibleWorkspaceContext = async (
  ctx: any,
  args: { activeWorkspaceSlug?: string },
): Promise<DashboardAccess> => {
  let appUser: any;
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
    .withIndex("by_userId", (q: any) => q.eq("userId", appUser._id))
    .collect();
  const activeMemberships = memberships.filter((membership: any) => membership.status === "active");

  const workspaceCandidates = (
    await Promise.all(activeMemberships.map((membership: any) => ctx.db.get(membership.workspaceId)))
  ).filter((workspace: any) => Boolean(workspace) && workspace.deletedAt == null);

  const workspacesWithOrgAccess = await Promise.all(
    workspaceCandidates.map(async (workspace: any) => {
      const hasOrgAccess = await hasActiveOrganizationMembershipForWorkspace(
        ctx,
        workspace,
        appUser.workosUserId,
      );
      return hasOrgAccess ? workspace : null;
    }),
  );

  const workspaces = workspacesWithOrgAccess
    .filter(Boolean)
    .sort((a: any, b: any) => a.name.localeCompare(b.name));

  const desiredWorkspace = args.activeWorkspaceSlug
    ? workspaces.find((workspace: any) => workspace.slug === args.activeWorkspaceSlug)
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

export const listWorkspaceMembers = async (
  ctx: any,
  args: {
    activeWorkspace: any;
    appUser: any;
  },
): Promise<SnapshotWorkspaceMember[]> => {
  if (!args.activeWorkspace || !args.appUser) {
    return [];
  }

  const workspaceMemberships = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_workspaceId", (q: any) => q.eq("workspaceId", args.activeWorkspace._id))
    .collect();
  const activeWorkspaceMemberships = workspaceMemberships.filter(
    (membership: any) => membership.status === "active",
  );

  const members = await Promise.all(
    activeWorkspaceMemberships.map(async (membership: any) => {
      const memberUser = await ctx.db.get(membership.userId);
      if (!memberUser) {
        return null;
      }

      return {
        userId: String(memberUser._id),
        workosUserId: memberUser.workosUserId,
        name: memberUser.name,
        email: memberUser.email ?? "",
        avatarUrl: await resolveAvatarUrl(ctx, memberUser),
        role: membership.role,
        isViewer: String(memberUser._id) === String(args.appUser._id),
      } satisfies SnapshotWorkspaceMember;
    }),
  );

  return members
    .filter((member): member is SnapshotWorkspaceMember => member !== null)
    .sort((a, b) => {
      if (a.isViewer && !b.isViewer) return -1;
      if (!a.isViewer && b.isViewer) return 1;
      return a.name.localeCompare(b.name);
    });
};
