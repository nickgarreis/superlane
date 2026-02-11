import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireProjectRole, requireProjectRoleById } from "./lib/auth";
import { logError } from "./lib/logging";

const NOTIFICATION_DISPATCH_DELAY_MS = 30_000;

const formatRelativeTime = (timestamp: number, now: number) => {
  const diffSeconds = Math.max(0, Math.floor((now - timestamp) / 1000));

  if (diffSeconds < 60) return "Just now";

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const listForProject = query({
  args: {
    projectPublicId: v.string(),
  },
  handler: async (ctx, args) => {
    const { project } = await requireProjectRole(ctx, args.projectPublicId, "member");
    const comments = await ctx.db
      .query("projectComments")
      .withIndex("by_projectPublicId", (q) => q.eq("projectPublicId", project.publicId))
      .collect();

    if (comments.length === 0) {
      return [];
    }

    let reactionRows = await ctx.db
      .query("commentReactions")
      .withIndex("by_projectPublicId", (q: any) => q.eq("projectPublicId", project.publicId))
      .collect();

    // Legacy fallback for rows created before reaction denormalization backfill.
    if (reactionRows.length === 0) {
      reactionRows = (
        await Promise.all(
          comments.map((comment) =>
            ctx.db
              .query("commentReactions")
              .withIndex("by_commentId", (q) => q.eq("commentId", comment._id))
              .collect(),
          ),
        )
      ).flat();
    }

    const userIds = new Set(comments.map((comment) => comment.authorUserId));
    reactionRows.forEach((reaction) => userIds.add(reaction.userId));

    const users = await Promise.all(Array.from(userIds).map((userId) => ctx.db.get(userId)));
    const userMap = new Map(users.filter(Boolean).map((user) => [user!._id, user!]));

    const reactionMap = new Map<string, Map<string, { users: string[]; userIds: string[] }>>();
    reactionRows.forEach((reaction) => {
      const user = userMap.get(reaction.userId);
      const userName = user?.name ?? "Unknown user";
      const userId = String(reaction.userId);

      const key = String(reaction.commentId);
      if (!reactionMap.has(key)) {
        reactionMap.set(key, new Map());
      }

      const emojiUsers = reactionMap.get(key)!;
      if (!emojiUsers.has(reaction.emoji)) {
        emojiUsers.set(reaction.emoji, { users: [], userIds: [] });
      }

      const entry = emojiUsers.get(reaction.emoji)!;
      entry.users.push(userName);
      entry.userIds.push(userId);
    });

    const now = Date.now();

    type CommentNode = {
      id: string;
      parentCommentId?: string;
      createdAt: number;
      data: {
        id: string;
        author: { userId: string; name: string; avatar: string };
        content: string;
        timestamp: string;
        replies: Array<any>;
        resolved: boolean;
        edited: boolean;
        reactions: Array<{ emoji: string; users: string[]; userIds: string[] }>;
      };
    };

    const nodeMap = new Map<string, CommentNode>();
    comments.forEach((comment) => {
      const author = userMap.get(comment.authorUserId);
      const reactionByEmoji = reactionMap.get(String(comment._id));

      nodeMap.set(String(comment._id), {
        id: String(comment._id),
        parentCommentId: comment.parentCommentId ? String(comment.parentCommentId) : undefined,
        createdAt: comment.createdAt,
        data: {
          id: String(comment._id),
          author: {
            userId: String(comment.authorUserId),
            name: comment.authorSnapshotName ?? author?.name ?? "Unknown user",
            avatar: comment.authorSnapshotAvatarUrl ?? author?.avatarUrl ?? "",
          },
          content: comment.content,
          timestamp: formatRelativeTime(comment.createdAt, now),
          replies: [],
          resolved: comment.resolved,
          edited: comment.edited,
          reactions: reactionByEmoji
            ? Array.from(reactionByEmoji.entries()).map(([emoji, reaction]) => ({
                emoji,
                users: reaction.users,
                userIds: reaction.userIds,
              }))
            : [],
        },
      });
    });

    const topLevel: Array<CommentNode["data"] & { __createdAt: number }> = [];

    const orderedNodes = Array.from(nodeMap.values()).sort((a, b) => a.createdAt - b.createdAt);
    orderedNodes.forEach((node) => {
      const enrichedNode = {
        ...node.data,
        __createdAt: node.createdAt,
      };

      if (node.parentCommentId) {
        const parent = nodeMap.get(node.parentCommentId);
        if (parent) {
          (parent.data.replies as Array<any>).push(enrichedNode);
          return;
        }
      }

      topLevel.push(enrichedNode);
    });

    const sortRepliesByCreatedAt = (list: Array<any>) => {
      list.sort((a, b) => (a.__createdAt ?? 0) - (b.__createdAt ?? 0));
      list.forEach((item) => {
        if (item.replies?.length) {
          sortRepliesByCreatedAt(item.replies);
        }
      });
    };

    topLevel.forEach((thread) => {
      if (thread.replies?.length) {
        sortRepliesByCreatedAt(thread.replies);
      }
    });

    topLevel.sort((a, b) => b.__createdAt - a.__createdAt);

    const stripInternalTimestamp = (list: Array<any>): Array<any> =>
      list.map((item) => ({
        id: item.id,
        author: item.author,
        content: item.content,
        timestamp: item.timestamp,
        replies: stripInternalTimestamp(item.replies ?? []),
        resolved: item.resolved,
        edited: item.edited,
        reactions: (item.reactions ?? []).map((reaction: any) => ({
          emoji: reaction.emoji,
          users: reaction.users ?? [],
          userIds: reaction.userIds ?? [],
        })),
      }));

    return stripInternalTimestamp(topLevel);
  },
});

export const create = mutation({
  args: {
    projectPublicId: v.string(),
    content: v.string(),
    parentCommentId: v.optional(v.id("projectComments")),
  },
  handler: async (ctx, args) => {
    const trimmedContent = args.content.trim();
    if (!trimmedContent) {
      throw new ConvexError("Comment content is required");
    }

    const { appUser, project } = await requireProjectRole(ctx, args.projectPublicId, "member");

    if (args.parentCommentId) {
      const parent = await ctx.db.get(args.parentCommentId);
      if (!parent || parent.projectId !== project._id) {
        throw new ConvexError("Parent comment not found");
      }
    }

    const now = Date.now();

    const commentId = await ctx.db.insert("projectComments", {
      workspaceId: project.workspaceId,
      projectId: project._id,
      projectPublicId: project.publicId,
      parentCommentId: args.parentCommentId,
      authorUserId: appUser._id,
      authorSnapshotName: appUser.name ?? "Unknown user",
      authorSnapshotAvatarUrl: appUser.avatarUrl ?? undefined,
      content: trimmedContent,
      resolved: false,
      edited: false,
      createdAt: now,
      updatedAt: now,
    });

    try {
      await ctx.scheduler.runAfter(NOTIFICATION_DISPATCH_DELAY_MS, internal.notificationsEmail.sendTeamActivityForComment, {
        workspaceId: project.workspaceId,
        actorUserId: appUser._id,
        actorName: appUser.name ?? appUser.email ?? "Unknown user",
        projectPublicId: project.publicId,
        projectName: project.name,
        commentContent: trimmedContent,
        isReply: Boolean(args.parentCommentId),
      });
    } catch (error) {
      logError("comments.create", "Failed to schedule team activity email notification", {
        error,
        projectPublicId: project.publicId,
      });
    }

    return { commentId };
  },
});

export const update = mutation({
  args: {
    commentId: v.id("projectComments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const trimmedContent = args.content.trim();
    if (!trimmedContent) {
      throw new ConvexError("Comment content is required");
    }

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new ConvexError("Comment not found");
    }

    const { appUser } = await requireProjectRoleById(ctx, comment.projectId, "member");

    if (comment.authorUserId !== appUser._id) {
      throw new ConvexError("Forbidden");
    }

    await ctx.db.patch(comment._id, {
      content: trimmedContent,
      edited: true,
      updatedAt: Date.now(),
    });

    return { commentId: comment._id };
  },
});

const deleteCommentThread = async (ctx: any, commentId: any) => {
  const children = await ctx.db
    .query("projectComments")
    .withIndex("by_parentCommentId", (q: any) => q.eq("parentCommentId", commentId))
    .collect();

  for (const child of children) {
    await deleteCommentThread(ctx, child._id);
  }

  const reactions = await ctx.db
    .query("commentReactions")
    .withIndex("by_commentId", (q: any) => q.eq("commentId", commentId))
    .collect();

  await Promise.all(reactions.map((reaction: any) => ctx.db.delete(reaction._id)));
  await ctx.db.delete(commentId);
};

export const remove = mutation({
  args: {
    commentId: v.id("projectComments"),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      return { removed: false };
    }

    const { appUser } = await requireProjectRoleById(ctx, comment.projectId, "member");

    if (comment.authorUserId !== appUser._id) {
      throw new ConvexError("Forbidden");
    }

    await deleteCommentThread(ctx, comment._id);
    return { removed: true };
  },
});

export const toggleResolved = mutation({
  args: {
    commentId: v.id("projectComments"),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new ConvexError("Comment not found");
    }

    const { appUser } = await requireProjectRoleById(ctx, comment.projectId, "member");

    if (comment.authorUserId !== appUser._id) {
      throw new ConvexError("Forbidden");
    }

    await ctx.db.patch(comment._id, {
      resolved: !comment.resolved,
      resolvedByUserId: appUser._id,
      updatedAt: Date.now(),
    });

    return { commentId: comment._id, resolved: !comment.resolved, resolvedByUserId: appUser._id };
  },
});

export const toggleReaction = mutation({
  args: {
    commentId: v.id("projectComments"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new ConvexError("Comment not found");
    }

    const { appUser } = await requireProjectRoleById(ctx, comment.projectId, "member");

    const existing = await ctx.db
      .query("commentReactions")
      .withIndex("by_comment_emoji_user", (q) =>
        q.eq("commentId", comment._id).eq("emoji", args.emoji).eq("userId", appUser._id),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { commentId: comment._id, emoji: args.emoji, active: false };
    }

    await ctx.db.insert("commentReactions", {
      commentId: comment._id,
      projectPublicId: comment.projectPublicId,
      workspaceId: comment.workspaceId,
      emoji: args.emoji,
      userId: appUser._id,
      createdAt: Date.now(),
    });

    return { commentId: comment._id, emoji: args.emoji, active: true };
  },
});
