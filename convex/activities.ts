import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { requireWorkspaceRole } from "./lib/auth";
import type { ActivityKind } from "./lib/activityEvents";

const activityKindValidator = v.union(
  v.literal("project"),
  v.literal("task"),
  v.literal("collaboration"),
  v.literal("file"),
  v.literal("membership"),
  v.literal("workspace"),
  v.literal("organization"),
);

export const listForWorkspace = query({
  args: {
    workspaceSlug: v.string(),
    kinds: v.optional(v.array(activityKindValidator)),
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

    await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });

    const paginated = await ctx.db
      .query("workspaceActivityEvents")
      .withIndex("by_workspace_createdAt", (q) => q.eq("workspaceId", workspace._id))
      .order("desc")
      .paginate(args.paginationOpts);

    const kindSet = args.kinds ? new Set<ActivityKind>(args.kinds) : null;
    const filtered = paginated.page.filter((event) =>
      !kindSet || kindSet.has(event.kind as ActivityKind),
    );

    return {
      ...paginated,
      page: filtered.map((event) => ({
        id: String(event._id),
        kind: event.kind,
        action: event.action,
        actorType: event.actorType,
        actorUserId: event.actorUserId ? String(event.actorUserId) : null,
        actorName: event.actorName,
        actorAvatarUrl: event.actorAvatarUrl ?? null,
        projectPublicId: event.projectPublicId ?? null,
        projectName: event.projectName ?? null,
        projectVisibility: event.projectVisibility ?? "workspace",
        projectOwnerUserId: event.projectOwnerUserId
          ? String(event.projectOwnerUserId)
          : null,
        taskId: event.taskId ?? null,
        taskTitle: event.taskTitle ?? null,
        fileName: event.fileName ?? null,
        fileTab: event.fileTab ?? null,
        targetUserId: event.targetUserId ? String(event.targetUserId) : null,
        targetUserName: event.targetUserName ?? null,
        targetRole: event.targetRole ?? null,
        fromValue: event.fromValue ?? null,
        toValue: event.toValue ?? null,
        message: event.message ?? null,
        errorCode: event.errorCode ?? null,
        createdAt: event.createdAt,
      })),
    };
  },
});
