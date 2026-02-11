import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { requireWorkspaceRole } from "./lib/auth";

const resolveAvatarUrl = async (ctx: any, user: any) => {
  if (typeof user.avatarUrl === "string" && user.avatarUrl.trim().length > 0) {
    return user.avatarUrl;
  }
  if (user.avatarStorageId) {
    return (await ctx.storage.getUrl(user.avatarStorageId)) ?? null;
  }
  return null;
};

export const listWorkspaceMembers = query({
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

    const { appUser } = await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });

    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspaceId", (q: any) => q.eq("workspaceId", workspace._id))
      .collect();

    const activeMemberships = memberships.filter((membership: any) => membership.status === "active");
    const users = await Promise.all(activeMemberships.map((membership: any) => ctx.db.get(membership.userId)));

    const members = await Promise.all(activeMemberships.map(async (membership: any, index: number) => {
      const user: any = users[index];
      if (!user) {
        return null;
      }

      return {
        userId: String(user._id),
        workosUserId: user.workosUserId,
        name: user.name,
        email: user.email ?? "",
        avatarUrl: await resolveAvatarUrl(ctx, user),
        role: membership.role,
        isViewer: String(user._id) === String(appUser._id),
      };
    }));

    const resolvedMembers = members.filter(
      (member): member is {
        userId: string;
        workosUserId: string;
        name: string;
        email: string;
        avatarUrl: string | null;
        role: "owner" | "admin" | "member";
        isViewer: boolean;
      } => member !== null,
    );

    const sorted = resolvedMembers.sort((a, b) => {
      if (a.isViewer && !b.isViewer) return -1;
      if (!a.isViewer && b.isViewer) return 1;
      const aName = a.name ?? "";
      const bName = b.name ?? "";
      return aName.localeCompare(bName);
    });

    return { members: sorted };
  },
});
