import { ConvexError, v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { query } from "./_generated/server";
import { requireWorkspaceRole } from "./lib/auth";
import { hydrateWorkspaceMembers } from "./lib/dashboardContext";

export const listWorkspaceMembers = query({
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

    const { appUser } = await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });

    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_status_joinedAt", (q) =>
        q.eq("workspaceId", workspace._id).eq("status", "active"))
      .collect();
    const sorted = await hydrateWorkspaceMembers(ctx, {
      membershipRows: memberships,
      viewerUserId: appUser._id,
    });

    return { members: sorted };
  },
});

export const getViewerMembership = query({
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

    const { appUser, membership } = await requireWorkspaceRole(
      ctx,
      workspace._id,
      "member",
      { workspace },
    );
    return {
      userId: String(appUser._id),
      role: membership.role,
      isViewer: true,
    };
  },
});

export const listWorkspaceMembersPaginated = query({
  args: {
    workspaceSlug: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q) => q.eq("slug", args.workspaceSlug))
      .unique();

    if (!workspace || workspace.deletedAt != null) {
      throw new ConvexError("Workspace not found");
    }

    const { appUser } = await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });
    const paginated = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_status_joinedAt", (q) =>
        q.eq("workspaceId", workspace._id).eq("status", "active"))
      .paginate(args.paginationOpts);

    const members = await hydrateWorkspaceMembers(ctx, {
      membershipRows: paginated.page,
      viewerUserId: appUser._id,
      sortResults: false,
    });

    return {
      ...paginated,
      page: members,
    };
  },
});

export const listWorkspaceMembersLite = query({
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

    const { appUser } = await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });
    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_status_joinedAt", (q) =>
        q.eq("workspaceId", workspace._id).eq("status", "active"))
      .collect();
    const membershipByUserId = new Map(
      memberships.map((membership) => [String(membership.userId), membership] as const),
    );
    const missingSnapshotUserIds = Array.from(
      new Set(
        memberships
          .filter((membership) => !membership.nameSnapshot)
          .map((membership) => String(membership.userId)),
      ),
    );
    const userFallbackRows = await Promise.all(
      missingSnapshotUserIds.map(async (userId) => {
        const membership = membershipByUserId.get(userId);
        if (!membership) {
          return null;
        }
        const user = await ctx.db.get(membership.userId);
        return user ? ([userId, user.name] as const) : null;
      }),
    );
    const fallbackNameByUserId = new Map(
      userFallbackRows.filter(
        (entry): entry is readonly [string, string] => entry !== null,
      ),
    );

    const members = memberships.map((membership) => ({
      userId: String(membership.userId),
      name:
        membership.nameSnapshot ??
        fallbackNameByUserId.get(String(membership.userId)) ??
        "Unknown user",
      role: membership.role,
      isViewer: String(membership.userId) === String(appUser._id),
    }));

    return { members };
  },
});
