import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { requireWorkspaceRole } from "./lib/auth";
import {
  buildProvisioningContext,
  buildProvisioningSnapshot,
  getAccessibleWorkspaceContext,
  listWorkspaceMembers,
  resolveAvatarUrl,
} from "./lib/dashboardContext";

const loadActiveProjectsForWorkspace = async (ctx: any, workspaceId: any) => {
  const projects = await ctx.db
    .query("projects")
    .withIndex("by_workspaceId", (q: any) => q.eq("workspaceId", workspaceId))
    .collect();

  return projects.filter((project: any) => project.deletedAt == null);
};

const loadVisibleWorkspaceTasks = async (
  ctx: any,
  workspaceId: any,
  activeProjectIds: Set<string>,
) => {
  const tasks = await ctx.db
    .query("tasks")
    .withIndex("by_workspace_position", (q: any) => q.eq("workspaceId", workspaceId))
    .collect();

  return tasks.filter((task: any) =>
    task.projectId == null || activeProjectIds.has(String(task.projectId)));
};

const hydrateProjectCreators = async (ctx: any, activeProjects: any[]) => {
  const creatorUserIdsToResolve = Array.from(
    new Set(
      activeProjects
        .filter((project: any) => !project.creatorSnapshotName)
        .map((project: any) => project.creatorUserId),
    ),
  );

  const creatorRows = await Promise.all(
    creatorUserIdsToResolve.map(async (creatorUserId) => {
      if (!creatorUserId) {
        return null;
      }

      try {
        const creatorUser = await ctx.db.get(creatorUserId);
        return creatorUser ? [String(creatorUserId), creatorUser] : null;
      } catch {
        return null;
      }
    }),
  );
  const creatorRowById = new Map(
    creatorRows.filter((entry): entry is [string, any] => entry !== null),
  );

  return Promise.all(activeProjects.map(async (project: any) => {
    const creatorRow = creatorRowById.get(String(project.creatorUserId));
    const creatorName = project.creatorSnapshotName ?? creatorRow?.name ?? "Unknown user";
    const creatorAvatar = project.creatorSnapshotAvatarUrl
      ?? (creatorRow ? await resolveAvatarUrl(ctx, creatorRow) : null)
      ?? "";

    return {
      ...project,
      creator: {
        userId: String(project.creatorUserId),
        name: creatorName,
        avatarUrl: creatorAvatar,
      },
    };
  }));
};

export const getWorkspaceContext = query({
  args: {
    activeWorkspaceSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const access = await getAccessibleWorkspaceContext(ctx, args);

    if (!access.provisioned) {
      return buildProvisioningContext(access.authUser);
    }

    return {
      viewer: {
        id: access.appUser._id,
        workosUserId: access.appUser.workosUserId,
        name: access.appUser.name,
        email: access.appUser.email ?? null,
        avatarUrl: await resolveAvatarUrl(ctx, access.appUser),
      },
      workspaces: access.workspaces,
      activeWorkspace: access.activeWorkspace,
      activeWorkspaceSlug: access.activeWorkspace?.slug ?? null,
    };
  },
});

export const getActiveWorkspaceSummary = query({
  args: {
    workspaceSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q: any) => q.eq("slug", args.workspaceSlug))
      .unique();

    if (!workspace || workspace.deletedAt != null) {
      throw new ConvexError("Workspace not found");
    }

    const access = await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });
    const activeProjects = await loadActiveProjectsForWorkspace(ctx, workspace._id);
    const activeProjectIds = new Set<string>(
      activeProjects.map((project: any) => String(project._id)),
    );
    const visibleTasks = await loadVisibleWorkspaceTasks(ctx, workspace._id, activeProjectIds);

    const members = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspaceId", (q: any) => q.eq("workspaceId", workspace._id))
      .collect();

    const files = await ctx.db
      .query("projectFiles")
      .withIndex("by_workspace_deletedAt_displayDateEpochMs", (q: any) =>
        q.eq("workspaceId", workspace._id).eq("deletedAt", null),
      )
      .collect();

    return {
      workspace: {
        id: String(workspace._id),
        slug: workspace.slug,
        name: workspace.name,
        plan: workspace.plan,
      },
      counts: {
        activeProjects: activeProjects.length,
        visibleTasks: visibleTasks.length,
        activeMembers: members.filter((member: any) => member.status === "active").length,
        activeFiles: files.filter((file: any) => file.storageId != null).length,
      },
      viewerRole: access.membership.role,
    };
  },
});

export const getSnapshot = query({
  args: {
    activeWorkspaceSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const access = await getAccessibleWorkspaceContext(ctx, args);

    if (!access.provisioned) {
      return buildProvisioningSnapshot(access.authUser);
    }

    const workspaceMembers = await listWorkspaceMembers(ctx, {
      activeWorkspace: access.activeWorkspace,
      appUser: access.appUser,
    });

    const activeProjects = access.activeWorkspace
      ? await loadActiveProjectsForWorkspace(ctx, access.activeWorkspace._id)
      : [];
    activeProjects.sort((a: any, b: any) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));

    const activeProjectIds = new Set<string>(
      activeProjects.map((project: any) => String(project._id)),
    );
    const visibleTasks = access.activeWorkspace
      ? await loadVisibleWorkspaceTasks(ctx, access.activeWorkspace._id, activeProjectIds)
      : [];
    visibleTasks.sort((a: any, b: any) => {
      const positionA = typeof a.position === "number" ? a.position : Number.POSITIVE_INFINITY;
      const positionB = typeof b.position === "number" ? b.position : Number.POSITIVE_INFINITY;
      return positionA - positionB;
    });

    const projectsWithCreators = await hydrateProjectCreators(ctx, activeProjects);

    return {
      viewer: {
        id: access.appUser._id,
        workosUserId: access.appUser.workosUserId,
        name: access.appUser.name,
        email: access.appUser.email ?? null,
        avatarUrl: await resolveAvatarUrl(ctx, access.appUser),
      },
      workspaces: access.workspaces,
      activeWorkspace: access.activeWorkspace,
      activeWorkspaceSlug: access.activeWorkspace?.slug ?? null,
      projects: projectsWithCreators,
      tasks: visibleTasks,
      workspaceMembers,
    };
  },
});
