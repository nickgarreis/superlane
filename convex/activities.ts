import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";
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

const getWorkspaceBySlug = async (ctx: any, workspaceSlug: string) => {
  const workspace = await ctx.db
    .query("workspaces")
    .withIndex("by_slug", (q: any) => q.eq("slug", workspaceSlug))
    .unique();
  if (!workspace || workspace.deletedAt != null) {
    throw new ConvexError("Workspace not found");
  }
  return workspace;
};

const recountWorkspaceActivityEvents = async (ctx: any, workspaceId: any) => {
  let cursor: string | null = null;
  let total = 0;
  while (true) {
    const page: any = await ctx.db
      .query("workspaceActivityEvents")
      .withIndex("by_workspace_createdAt", (q: any) => q.eq("workspaceId", workspaceId))
      .paginate({
        cursor,
        numItems: 256,
      });
    total += page.page.length;
    if (page.isDone) {
      break;
    }
    cursor = page.continueCursor;
  }
  return total;
};

const countWorkspaceActivityEvents = (workspace: any) =>
  Math.max(0, Number(workspace.activityEventCount ?? 0));

const initializeWorkspaceActivityEventCount = async (ctx: any, workspace: any) => {
  if (typeof workspace.activityEventCount === "number") {
    return countWorkspaceActivityEvents(workspace);
  }
  const counted = await recountWorkspaceActivityEvents(ctx, workspace._id);
  await ctx.db.patch(workspace._id, {
    activityEventCount: counted,
  });
  return counted;
};

const resolveWorkspaceActivityEventCount = async (ctx: any, workspace: any) => {
  if (typeof workspace.activityEventCount === "number") {
    return countWorkspaceActivityEvents(workspace);
  }
  // Query contexts are read-only; rely on seeded/backfilled counters there.
  if (typeof ctx.db.patch === "function") {
    return initializeWorkspaceActivityEventCount(ctx, workspace);
  }
  return 0;
};

const getWorkspaceInboxState = async (
  ctx: any,
  workspaceId: any,
  userId: any,
) =>
  ctx.db
    .query("workspaceActivityInboxStates")
    .withIndex("by_workspace_user", (q: any) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId),
    )
    .unique();

const getReadReceiptActivityEventIds = async (
  ctx: any,
  workspaceId: any,
  userId: any,
  activityEventIds: any[],
) => {
  if (activityEventIds.length === 0) {
    return new Set<string>();
  }
  const queryByWorkspaceUser = ctx.db
    .query("workspaceActivityReadReceipts")
    .withIndex("by_workspace_user", (q: any) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId),
    );

  const readReceipts =
    activityEventIds.length === 1
      ? await queryByWorkspaceUser
          .filter((q: any) => q.eq(q.field("activityEventId"), activityEventIds[0]))
          .collect()
      : await queryByWorkspaceUser
          .filter((q: any) =>
            q.or(
              ...activityEventIds.map((activityEventId) =>
                q.eq(q.field("activityEventId"), activityEventId),
              ),
            ),
          )
          .collect();

  return new Set<string>(readReceipts.map((receipt: any) => String(receipt.activityEventId)));
};

const findWorkspaceIdsMissingActivityCount = async (ctx: any, maxWorkspaces: number) => {
  let cursor: string | null = null;
  const workspaceIds: Id<"workspaces">[] = [];

  while (workspaceIds.length < maxWorkspaces) {
    const page: any = await ctx.db.query("workspaces").paginate({
      cursor,
      numItems: 128,
    });
    for (const workspace of page.page as any[]) {
      if (workspace.deletedAt != null || typeof workspace.activityEventCount === "number") {
        continue;
      }
      workspaceIds.push(workspace._id as Id<"workspaces">);
      if (workspaceIds.length >= maxWorkspaces) {
        break;
      }
    }
    if (page.isDone) {
      break;
    }
    cursor = page.continueCursor;
  }

  return workspaceIds;
};

export const listForWorkspace = query({
  args: {
    workspaceSlug: v.string(),
    kinds: v.optional(v.array(activityKindValidator)),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    const { appUser } = await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });

    const paginated = await ctx.db
      .query("workspaceActivityEvents")
      .withIndex("by_workspace_createdAt", (q) => q.eq("workspaceId", workspace._id))
      .order("desc")
      .paginate(args.paginationOpts);

    const kindSet = args.kinds ? new Set<ActivityKind>(args.kinds) : null;
    const filtered = paginated.page.filter((event) =>
      !kindSet || kindSet.has(event.kind as ActivityKind),
    );
    const inboxState = await getWorkspaceInboxState(ctx, workspace._id, appUser._id);
    const markAllCutoffAt =
      typeof inboxState?.markAllCutoffAt === "number"
        ? inboxState.markAllCutoffAt
        : 0;

    const candidateEventIds = filtered
      .filter((event) => event.createdAt >= markAllCutoffAt)
      .map((event) => event._id);
    const readReceiptActivityEventIds = await getReadReceiptActivityEventIds(
      ctx,
      workspace._id,
      appUser._id,
      candidateEventIds,
    );
    const readStatusByIndex = filtered.map(
      (event) =>
        event.createdAt < markAllCutoffAt ||
        readReceiptActivityEventIds.has(String(event._id)),
    );

    return {
      ...paginated,
      page: filtered.map((event, index) => ({
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
        isRead: readStatusByIndex[index] ?? false,
      })),
    };
  },
});

export const getUnreadSummary = query({
  args: {
    workspaceSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    const { appUser } = await requireWorkspaceRole(ctx, workspace._id, "member", {
      workspace,
    });
    const inboxState = await getWorkspaceInboxState(ctx, workspace._id, appUser._id);
    if (inboxState) {
      return {
        unreadCount: Math.max(0, Number(inboxState.unreadCount ?? 0)),
      };
    }
    return {
      unreadCount: await resolveWorkspaceActivityEventCount(ctx, workspace),
    };
  },
});

export const initializeWorkspaceActivityCount = mutation({
  args: {
    workspaceSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });
    return {
      activityEventCount: await initializeWorkspaceActivityEventCount(ctx, workspace),
    };
  },
});

export const internalBackfillWorkspaceActivityCounts = internalMutation({
  args: {
    maxWorkspaces: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const maxWorkspaces = Math.max(1, Math.floor(args.maxWorkspaces ?? 25));
    const workspaceIds = await findWorkspaceIdsMissingActivityCount(ctx, maxWorkspaces);

    let updatedWorkspaceCount = 0;
    for (const workspaceId of workspaceIds) {
      const workspace = await ctx.db.get(workspaceId);
      if (!workspace || workspace.deletedAt != null) {
        continue;
      }
      if (typeof workspace.activityEventCount === "number") {
        continue;
      }
      await initializeWorkspaceActivityEventCount(ctx, workspace);
      updatedWorkspaceCount += 1;
    }

    return {
      updatedWorkspaceCount,
    };
  },
});

export const markActivityRead = mutation({
  args: {
    workspaceSlug: v.string(),
    activityEventId: v.id("workspaceActivityEvents"),
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    const { appUser } = await requireWorkspaceRole(ctx, workspace._id, "member", {
      workspace,
    });
    const activityEvent = await ctx.db.get(args.activityEventId);
    if (!activityEvent || activityEvent.workspaceId !== workspace._id) {
      throw new ConvexError("Activity not found");
    }

    const now = Date.now();
    let inboxState = await getWorkspaceInboxState(ctx, workspace._id, appUser._id);
    if (!inboxState) {
      const unreadCount = await resolveWorkspaceActivityEventCount(ctx, workspace);
      const inboxStateId = await ctx.db.insert("workspaceActivityInboxStates", {
        workspaceId: workspace._id,
        userId: appUser._id,
        unreadCount,
        markAllCutoffAt: 0,
        createdAt: now,
        updatedAt: now,
      });
      inboxState = {
        _id: inboxStateId,
        workspaceId: workspace._id,
        userId: appUser._id,
        unreadCount,
        markAllCutoffAt: 0,
      };
    }

    if (activityEvent.createdAt < inboxState.markAllCutoffAt) {
      return {
        unreadCount: Math.max(0, Number(inboxState.unreadCount ?? 0)),
        alreadyRead: true,
      };
    }

    const existingReceipt = await ctx.db
      .query("workspaceActivityReadReceipts")
      .withIndex("by_workspace_user_activityEvent", (q: any) =>
        q
          .eq("workspaceId", workspace._id)
          .eq("userId", appUser._id)
          .eq("activityEventId", activityEvent._id),
      )
      .unique();
    if (existingReceipt) {
      return {
        unreadCount: Math.max(0, Number(inboxState.unreadCount ?? 0)),
        alreadyRead: true,
      };
    }

    await ctx.db.insert("workspaceActivityReadReceipts", {
      workspaceId: workspace._id,
      userId: appUser._id,
      activityEventId: activityEvent._id,
      readAt: now,
      createdAt: now,
    });

    const nextUnreadCount = Math.max(0, Number(inboxState.unreadCount ?? 0) - 1);
    await ctx.db.patch(inboxState._id, {
      unreadCount: nextUnreadCount,
      updatedAt: now,
    });

    return {
      unreadCount: nextUnreadCount,
      alreadyRead: false,
    };
  },
});

export const markAllRead = mutation({
  args: {
    workspaceSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    const { appUser } = await requireWorkspaceRole(ctx, workspace._id, "member", {
      workspace,
    });
    const now = Date.now();
    const existingInboxState = await getWorkspaceInboxState(
      ctx,
      workspace._id,
      appUser._id,
    );
    if (!existingInboxState) {
      await ctx.db.insert("workspaceActivityInboxStates", {
        workspaceId: workspace._id,
        userId: appUser._id,
        unreadCount: 0,
        markAllCutoffAt: now,
        createdAt: now,
        updatedAt: now,
      });
      return {
        unreadCount: 0,
      };
    }

    await ctx.db.patch(existingInboxState._id, {
      unreadCount: 0,
      markAllCutoffAt: now,
      updatedAt: now,
    });
    return {
      unreadCount: 0,
    };
  },
});
