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
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", workspace._id))
      .collect();

    const activeMemberships = memberships.filter((membership) => membership.status === "active");
    const sorted = await hydrateWorkspaceMembers(ctx, {
      membershipRows: activeMemberships,
      viewerUserId: appUser._id,
    });

    return { members: sorted };
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
