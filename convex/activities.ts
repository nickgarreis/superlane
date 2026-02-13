import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";
import { requireWorkspaceRole } from "./lib/auth";
import type { ActivityKind } from "./lib/activityEvents";
import {
  findWorkspaceIdsMissingActivityCount,
  getDismissedActivityEventIds,
  getReadReceiptActivityEventIds,
  getWorkspaceBySlug,
  getWorkspaceInboxState,
  initializeWorkspaceActivityEventCount,
  resolveTargetUserAvatarUrl,
  resolveWorkspaceActivityEventCount,
} from "./lib/activityInbox";

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
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    const { appUser } = await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });

    const paginated = await ctx.db
      .query("workspaceActivityEvents")
      .withIndex("by_workspace_createdAt", (q) => q.eq("workspaceId", workspace._id))
      .order("desc")
      .paginate(args.paginationOpts);

    const kindSet = args.kinds ? new Set<ActivityKind>(args.kinds) : null;
    const filteredByKind = paginated.page.filter((event) =>
      !kindSet || kindSet.has(event.kind as ActivityKind),
    );
    const dismissedActivityEventIds = await getDismissedActivityEventIds(
      ctx,
      workspace._id,
      appUser._id,
      filteredByKind.map((event) => event._id),
    );
    const filtered = filteredByKind.filter(
      (event) => !dismissedActivityEventIds.has(String(event._id)),
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
    const readStatusByEventId = new Map<string, boolean>(
      filtered.map((event) => [
        String(event._id),
        event.createdAt < markAllCutoffAt ||
        readReceiptActivityEventIds.has(String(event._id)),
      ]),
    );

    const projectPublicIds = Array.from(
      new Set(
        filtered
          .map((event) => event.projectPublicId)
          .filter(
            (projectPublicId): projectPublicId is string =>
              typeof projectPublicId === "string" && projectPublicId.trim().length > 0,
          ),
      ),
    );
    const projectRows = await Promise.all(
      projectPublicIds.map((projectPublicId) =>
        ctx.db
          .query("projects")
          .withIndex("by_publicId", (q) => q.eq("publicId", projectPublicId))
          .unique(),
      ),
    );
    const projectCategoryByPublicId = new Map<string, string>();
    for (const project of projectRows) {
      if (!project || project.workspaceId !== workspace._id) {
        continue;
      }
      const category = typeof project.category === "string" ? project.category.trim() : "";
      if (category.length === 0) {
        continue;
      }
      projectCategoryByPublicId.set(project.publicId, category);
    }

    const targetUserIds = Array.from(
      new Set(
        filtered
          .map((event) => event.targetUserId)
          .filter((targetUserId): targetUserId is Id<"users"> => Boolean(targetUserId)),
      ),
    );
    const targetUsers = await Promise.all(
      targetUserIds.map((targetUserId) => ctx.db.get(targetUserId)),
    );
    const targetUserAvatarUrlById = new Map<string, string>();
    for (const user of targetUsers) {
      if (!user) {
        continue;
      }
      const avatarUrl = await resolveTargetUserAvatarUrl(ctx, user);
      if (!avatarUrl) {
        continue;
      }
      targetUserAvatarUrlById.set(String(user._id), avatarUrl);
    }

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
        projectCategory:
          event.projectPublicId
            ? (projectCategoryByPublicId.get(event.projectPublicId) ?? null)
            : null,
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
        targetUserAvatarUrl: event.targetUserId
          ? (targetUserAvatarUrlById.get(String(event.targetUserId)) ?? null)
          : null,
        targetRole: event.targetRole ?? null,
        fromValue: event.fromValue ?? null,
        toValue: event.toValue ?? null,
        message: event.message ?? null,
        errorCode: event.errorCode ?? null,
        createdAt: event.createdAt,
        isRead: readStatusByEventId.get(String(event._id)) ?? false,
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

    const existingDismissal = await ctx.db
      .query("workspaceActivityDismissals")
      .withIndex("by_workspace_user_activityEvent", (q) =>
        q
          .eq("workspaceId", workspace._id)
          .eq("userId", appUser._id)
          .eq("activityEventId", activityEvent._id),
      )
      .unique();
    if (existingDismissal) {
      return {
        unreadCount: Math.max(0, Number(inboxState.unreadCount ?? 0)),
        alreadyRead: true,
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
      .withIndex("by_workspace_user_activityEvent", (q) =>
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

export const dismissActivity = mutation({
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

    const existingDismissal = await ctx.db
      .query("workspaceActivityDismissals")
      .withIndex("by_workspace_user_activityEvent", (q) =>
        q
          .eq("workspaceId", workspace._id)
          .eq("userId", appUser._id)
          .eq("activityEventId", activityEvent._id),
      )
      .unique();
    if (existingDismissal) {
      return {
        dismissed: false,
        alreadyDismissed: true,
        unreadCount: Math.max(0, Number(inboxState.unreadCount ?? 0)),
      };
    }

    const isUnreadByMarkAllCutoff = activityEvent.createdAt >= inboxState.markAllCutoffAt;
    let wasUnread = isUnreadByMarkAllCutoff;
    if (wasUnread) {
      const existingReceipt = await ctx.db
        .query("workspaceActivityReadReceipts")
        .withIndex("by_workspace_user_activityEvent", (q) =>
          q
            .eq("workspaceId", workspace._id)
            .eq("userId", appUser._id)
            .eq("activityEventId", activityEvent._id),
        )
        .unique();
      if (existingReceipt) {
        wasUnread = false;
      }
    }

    await ctx.db.insert("workspaceActivityDismissals", {
      workspaceId: workspace._id,
      userId: appUser._id,
      activityEventId: activityEvent._id,
      dismissedAt: now,
      createdAt: now,
    });

    const nextUnreadCount = wasUnread
      ? Math.max(0, Number(inboxState.unreadCount ?? 0) - 1)
      : Math.max(0, Number(inboxState.unreadCount ?? 0));
    if (wasUnread) {
      await ctx.db.patch(inboxState._id, {
        unreadCount: nextUnreadCount,
        updatedAt: now,
      });
    }

    return {
      dismissed: true,
      alreadyDismissed: false,
      unreadCount: nextUnreadCount,
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
