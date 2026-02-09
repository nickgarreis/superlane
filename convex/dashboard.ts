import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { getResolvedAuthUser, requireAuthUser } from "./lib/auth";
import { hasActiveOrganizationMembershipForWorkspace } from "./lib/workosOrganization";

const buildProvisioningSnapshot = (authUser: {
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
  };
};

const resolveAvatarUrl = async (ctx: any, appUser: any) => {
  if (appUser.avatarStorageId) {
    return (await ctx.storage.getUrl(appUser.avatarStorageId)) ?? null;
  }
  return appUser.avatarUrl ?? null;
};

export const getSnapshot = query({
  args: {
    activeWorkspaceSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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
        return buildProvisioningSnapshot(authUser);
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

    const activeWorkspace = desiredWorkspace ?? workspaces[0] ?? null;

    const projects = activeWorkspace
      ? await ctx.db
          .query("projects")
          .withIndex("by_workspaceId", (q) => q.eq("workspaceId", activeWorkspace._id))
          .collect()
      : [];
    const activeProjects = projects.filter((project) => project.deletedAt == null);
    const activeProjectIds = new Set(activeProjects.map((project) => String(project._id)));

    const tasks = activeWorkspace
      ? await ctx.db
          .query("tasks")
          .withIndex("by_workspaceId", (q) => q.eq("workspaceId", activeWorkspace._id))
          .collect()
      : [];
    const visibleTasks = tasks.filter((task) => activeProjectIds.has(String(task.projectId)));

    activeProjects.sort((a, b) => {
      const updatedAtA = typeof a.updatedAt === "number" ? a.updatedAt : 0;
      const updatedAtB = typeof b.updatedAt === "number" ? b.updatedAt : 0;
      return updatedAtB - updatedAtA;
    });
    visibleTasks.sort((a, b) => {
      const positionA = typeof a.position === "number" ? a.position : Number.POSITIVE_INFINITY;
      const positionB = typeof b.position === "number" ? b.position : Number.POSITIVE_INFINITY;
      return positionA - positionB;
    });

    return {
      viewer: {
        id: appUser._id,
        workosUserId: appUser.workosUserId,
        name: appUser.name,
        email: appUser.email ?? null,
        avatarUrl: await resolveAvatarUrl(ctx, appUser),
      },
      workspaces,
      activeWorkspace,
      activeWorkspaceSlug: activeWorkspace?.slug ?? null,
      projects: activeProjects,
      tasks: visibleTasks,
    };
  },
});
