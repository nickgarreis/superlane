import { ConvexError, v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireProjectRole, requireProjectRoleById } from "./lib/auth";
import { logError } from "./lib/logging";
import { logWorkspaceActivityForActorUser } from "./lib/activityEvents";

const NOTIFICATION_DISPATCH_DELAY_MS = 30_000;
type ProjectCommentDoc = Doc<"projectComments">;
type CommentReactionDoc = Doc<"commentReactions">;
type UserDoc = Doc<"users">;
type ReactionUsers = { users: string[]; userIds: string[] };
type ReactionSummary = { emoji: string; users: string[]; userIds: string[] };
type ReactionSummarySnapshot = NonNullable<ProjectCommentDoc["reactionSummary"]>;
type LegacyCommentNode = {
  id: string;
  author: { userId: string; name: string; avatar: string };
  content: string;
  timestamp: string;
  replies: LegacyCommentNode[];
  resolved: boolean;
  edited: boolean;
  reactions: ReactionSummary[];
  __createdAt?: number;
};

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

const parseMentionTokens = (content: string) => {
  const matches = content.matchAll(/@([a-zA-Z0-9._-]+)/g);
  return Array.from(new Set(Array.from(matches, (match) => match[1]))).slice(0, 20);
};

const buildReactionSummarySnapshot = (
  reactions: CommentReactionDoc[],
): ReactionSummarySnapshot => {
  const userIdsByEmoji = new Map<string, Set<Id<"users">>>();
  for (const reaction of reactions) {
    if (!userIdsByEmoji.has(reaction.emoji)) {
      userIdsByEmoji.set(reaction.emoji, new Set<Id<"users">>());
    }
    userIdsByEmoji.get(reaction.emoji)!.add(reaction.userId);
  }

  return Array.from(userIdsByEmoji.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([emoji, userIds]) => ({
      emoji,
      userIds: Array.from(userIds).sort((left, right) =>
        String(left).localeCompare(String(right)),
      ),
    }));
};

const hydrateReactionSummaryForResponse = async (
  ctx: QueryCtx | MutationCtx,
  summarySnapshot: ReactionSummarySnapshot,
): Promise<ReactionSummary[]> => {
  if (summarySnapshot.length === 0) {
    return [];
  }

  const uniqueUserIds = Array.from(
    new Set(summarySnapshot.flatMap((entry) => entry.userIds)),
  );
  const userRows = await Promise.all(
    uniqueUserIds.map((userId) => ctx.db.get(userId)),
  );
  const userNameById = new Map(
    userRows
      .filter((user): user is UserDoc => user !== null)
      .map((user) => [String(user._id), user.name] as const),
  );

  return summarySnapshot.map((entry) => ({
    emoji: entry.emoji,
    userIds: entry.userIds.map((userId) => String(userId)),
    users: entry.userIds.map(
      (userId) => userNameById.get(String(userId)) ?? "Unknown user",
    ),
  }));
};

const incrementParentReplyCount = async (
  ctx: MutationCtx,
  parentCommentId: Id<"projectComments">,
) => {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const parent = await ctx.db.get(parentCommentId);
      if (!parent) {
        return;
      }
      if (typeof parent.replyCount !== "number" || !Number.isFinite(parent.replyCount)) {
        break;
      }

      await ctx.db.patch(parent._id, {
        replyCount: Math.max(0, Math.floor(parent.replyCount)) + 1,
      });
      return;
    } catch (error) {
      if (attempt === 2) {
        throw error;
      }
    }
  }

  const parent = await ctx.db.get(parentCommentId);
  if (!parent) {
    return;
  }
  const replies = await ctx.db
    .query("projectComments")
    .withIndex("by_parentCommentId", (q) => q.eq("parentCommentId", parent._id))
    .collect();
  await ctx.db.patch(parent._id, {
    replyCount: replies.length,
  });
};

const getReactionAndUserMaps = async (
  args: {
    ctx: QueryCtx;
    comments: ProjectCommentDoc[];
  },
) => {
  const { ctx, comments } = args;
  if (comments.length === 0) {
    return {
      reactionMap: new Map<string, Map<string, ReactionUsers>>(),
      userMap: new Map<Id<"users">, UserDoc>(),
    };
  }

  const commentsMissingSnapshot = comments.filter(
    (comment) => comment.reactionSummary === undefined,
  );
  const fallbackReactionsByCommentId = new Map<string, CommentReactionDoc[]>(
    await Promise.all(
      commentsMissingSnapshot.map(async (comment) => [
        String(comment._id),
        await ctx.db
          .query("commentReactions")
          .withIndex("by_commentId", (q) => q.eq("commentId", comment._id))
          .collect(),
      ] as const),
    ),
  );

  const userIds = new Set(comments.map((comment) => comment.authorUserId));
  for (const comment of comments) {
    if (comment.reactionSummary !== undefined) {
      comment.reactionSummary.forEach((summary) => {
        summary.userIds.forEach((userId) => userIds.add(userId));
      });
      continue;
    }

    const fallbackReactions = fallbackReactionsByCommentId.get(String(comment._id)) ?? [];
    fallbackReactions.forEach((reaction) => userIds.add(reaction.userId));
  }

  const users = await Promise.all(Array.from(userIds).map((userId) => ctx.db.get(userId)));
  const userMap = new Map(
    users
      .filter((user): user is UserDoc => Boolean(user))
      .map((user) => [user._id, user] as const),
  );

  const reactionMap = new Map<string, Map<string, ReactionUsers>>();
  for (const comment of comments) {
    const reactionsForComment = new Map<string, ReactionUsers>();
    if (comment.reactionSummary !== undefined) {
      for (const reaction of comment.reactionSummary) {
        reactionsForComment.set(reaction.emoji, {
          users: reaction.userIds.map(
            (userId) => userMap.get(userId)?.name ?? "Unknown user",
          ),
          userIds: reaction.userIds.map((userId) => String(userId)),
        });
      }
    } else {
      const fallbackReactions = fallbackReactionsByCommentId.get(String(comment._id)) ?? [];
      for (const reaction of fallbackReactions) {
        if (!reactionsForComment.has(reaction.emoji)) {
          reactionsForComment.set(reaction.emoji, { users: [], userIds: [] });
        }
        const entry = reactionsForComment.get(reaction.emoji)!;
        entry.users.push(userMap.get(reaction.userId)?.name ?? "Unknown user");
        entry.userIds.push(String(reaction.userId));
      }
    }

    if (reactionsForComment.size > 0) {
      reactionMap.set(String(comment._id), reactionsForComment);
    }
  }

  return { reactionMap, userMap };
};

const getReplyCountMapForParents = async (
  ctx: QueryCtx,
  parentComments: ProjectCommentDoc[],
) => {
  if (parentComments.length === 0) {
    return new Map<string, number>();
  }

  const counts = new Map<string, number>();
  const parentsMissingSnapshotCount: ProjectCommentDoc[] = [];
  for (const parent of parentComments) {
    if (typeof parent.replyCount === "number" && Number.isFinite(parent.replyCount)) {
      counts.set(String(parent._id), Math.max(0, Math.floor(parent.replyCount)));
      continue;
    }
    parentsMissingSnapshotCount.push(parent);
  }
  if (parentsMissingSnapshotCount.length === 0) {
    return counts;
  }

  const fallbackCounts = await Promise.all(
    parentsMissingSnapshotCount.map(async (parent) => {
      const replies = await ctx.db
        .query("projectComments")
        .withIndex("by_parentCommentId", (q) => q.eq("parentCommentId", parent._id))
        .collect();
      return [String(parent._id), replies.length] as const;
    }),
  );
  fallbackCounts.forEach(([parentId, count]) => {
    counts.set(parentId, count);
  });

  return counts;
};

const mapCommentFeedRow = (args: {
  comment: ProjectCommentDoc;
  userMap: Map<Id<"users">, UserDoc>;
  reactionMap: Map<string, Map<string, ReactionUsers>>;
  replyCount: number;
}) => {
  const { comment, userMap, reactionMap, replyCount } = args;
  const author = userMap.get(comment.authorUserId);
  const reactionByEmoji = reactionMap.get(String(comment._id));
  return {
    id: String(comment._id),
    parentCommentId: comment.parentCommentId ? String(comment.parentCommentId) : null,
    author: {
      userId: String(comment.authorUserId),
      name: comment.authorSnapshotName ?? author?.name ?? "Unknown user",
      avatar: comment.authorSnapshotAvatarUrl ?? author?.avatarUrl ?? "",
    },
    content: comment.content,
    createdAtEpochMs: comment.createdAt,
    updatedAtEpochMs: comment.updatedAt,
    resolved: comment.resolved,
    edited: comment.edited,
    replyCount,
    reactions: reactionByEmoji
      ? Array.from(reactionByEmoji.entries()).map(([emoji, reaction]) => ({
          emoji,
          users: reaction.users,
          userIds: reaction.userIds,
        }))
      : [],
  };
};

export const listThreadsPaginated = query({
  args: {
    projectPublicId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const { project } = await requireProjectRole(ctx, args.projectPublicId, "member");
    const paginated = await ctx.db
      .query("projectComments")
      .withIndex("by_projectPublicId_parentCommentId_createdAt", (q) =>
        q.eq("projectPublicId", project.publicId).eq("parentCommentId", undefined),
      )
      .order("desc")
      .paginate(args.paginationOpts);

    const { reactionMap, userMap } = await getReactionAndUserMaps({
      ctx,
      comments: paginated.page,
    });
    const replyCounts = await getReplyCountMapForParents(ctx, paginated.page);

    return {
      ...paginated,
      page: paginated.page.map((comment) =>
        mapCommentFeedRow({
          comment,
          userMap,
          reactionMap,
          replyCount: replyCounts.get(String(comment._id)) ?? 0,
        })),
    };
  },
});

export const listReplies = query({
  args: {
    parentCommentId: v.id("projectComments"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const parent = await ctx.db.get(args.parentCommentId);
    if (!parent) {
      throw new ConvexError("Comment not found");
    }

    await requireProjectRoleById(ctx, parent.projectId, "member");
    const paginated = await ctx.db
      .query("projectComments")
      .withIndex("by_parentCommentId", (q) => q.eq("parentCommentId", parent._id))
      .order("asc")
      .paginate(args.paginationOpts);
    const { reactionMap, userMap } = await getReactionAndUserMaps({
      ctx,
      comments: paginated.page,
    });
    const replyCounts = await getReplyCountMapForParents(ctx, paginated.page);

    return {
      ...paginated,
      page: paginated.page.map((comment) =>
        mapCommentFeedRow({
          comment,
          userMap,
          reactionMap,
          replyCount: replyCounts.get(String(comment._id)) ?? 0,
        })),
    };
  },
});

// Legacy full-graph endpoint kept for backward compatibility.
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
      .withIndex("by_projectPublicId", (q) => q.eq("projectPublicId", project.publicId))
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
      data: LegacyCommentNode;
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

    const topLevel: LegacyCommentNode[] = [];

    const orderedNodes = Array.from(nodeMap.values()).sort((a, b) => a.createdAt - b.createdAt);
    orderedNodes.forEach((node) => {
      const enrichedNode = {
        ...node.data,
        __createdAt: node.createdAt,
      };

      if (node.parentCommentId) {
        const parent = nodeMap.get(node.parentCommentId);
        if (parent) {
          parent.data.replies.push(enrichedNode);
          return;
        }
      }

      topLevel.push(enrichedNode);
    });

    const sortRepliesByCreatedAt = (list: LegacyCommentNode[]) => {
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

    topLevel.sort((a, b) => (b.__createdAt ?? 0) - (a.__createdAt ?? 0));

    const stripInternalTimestamp = (list: LegacyCommentNode[]): LegacyCommentNode[] =>
      list.map((item) => ({
        id: item.id,
        author: item.author,
        content: item.content,
        timestamp: item.timestamp,
        replies: stripInternalTimestamp(item.replies ?? []),
        resolved: item.resolved,
        edited: item.edited,
        reactions: (item.reactions ?? []).map((reaction) => ({
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

    let parent: ProjectCommentDoc | null = null;
    if (args.parentCommentId) {
      parent = await ctx.db.get(args.parentCommentId);
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
      replyCount: 0,
      reactionSummary: [],
      resolved: false,
      edited: false,
      createdAt: now,
      updatedAt: now,
    });
    if (parent) {
      await incrementParentReplyCount(ctx, parent._id);
    }
    try {
      await logWorkspaceActivityForActorUser(ctx, {
        workspaceId: project.workspaceId,
        kind: "collaboration",
        action: "comment_added",
        actorUser: appUser,
        projectPublicId: project.publicId,
        projectName: project.name,
        message: trimmedContent,
      });
    } catch (error) {
      logError("comments.create", "Failed to log comment_added activity", {
        error,
        projectPublicId: project.publicId,
      });
    }
    for (const mention of parseMentionTokens(trimmedContent)) {
      try {
        await logWorkspaceActivityForActorUser(ctx, {
          workspaceId: project.workspaceId,
          kind: "collaboration",
          action: "mention_added",
          actorUser: appUser,
          projectPublicId: project.publicId,
          projectName: project.name,
          message: mention,
        });
      } catch (error) {
        logError("comments.create", "Failed to log mention_added activity", {
          error,
          projectPublicId: project.publicId,
          mention,
        });
      }
    }

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

    const { appUser, project } = await requireProjectRoleById(
      ctx,
      comment.projectId,
      "member",
    );

    if (comment.authorUserId !== appUser._id) {
      throw new ConvexError("Forbidden");
    }

    const updatedAtEpochMs = Date.now();
    await ctx.db.patch(comment._id, {
      content: trimmedContent,
      edited: true,
      updatedAt: updatedAtEpochMs,
    });
    await logWorkspaceActivityForActorUser(ctx, {
      workspaceId: project.workspaceId,
      kind: "collaboration",
      action: "comment_edited",
      actorUser: appUser,
      projectPublicId: project.publicId,
      projectName: project.name,
      message: trimmedContent,
    });

    return { commentId: comment._id, updatedAtEpochMs };
  },
});

const deleteCommentThread = async (
  ctx: MutationCtx,
  comment: ProjectCommentDoc,
): Promise<ProjectCommentDoc[]> => {
  const commentsToDelete: ProjectCommentDoc[] = [];
  const stack: ProjectCommentDoc[] = [comment];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }

    commentsToDelete.push(current);
    const children = await ctx.db
      .query("projectComments")
      .withIndex("by_parentCommentId", (q) => q.eq("parentCommentId", current._id))
      .collect();
    for (const child of children) {
      stack.push(child);
    }
  }

  return commentsToDelete;
};

const decrementParentReplyCount = async (
  ctx: MutationCtx,
  args: { parentCommentId: Id<"projectComments">; decrementBy: number },
) => {
  const parent = await ctx.db.get(args.parentCommentId);
  if (!parent) {
    return;
  }

  if (typeof parent.replyCount === "number" && Number.isFinite(parent.replyCount)) {
    await ctx.db.patch(parent._id, {
      replyCount: Math.max(
        0,
        Math.floor(parent.replyCount) - Math.max(0, Math.floor(args.decrementBy)),
      ),
    });
    return;
  }

  const remainingReplies = await ctx.db
    .query("projectComments")
    .withIndex("by_parentCommentId", (q) => q.eq("parentCommentId", parent._id))
    .collect();
  await ctx.db.patch(parent._id, {
    replyCount: remainingReplies.length,
  });
};

const removeCommentsAndReactions = async (
  ctx: MutationCtx,
  comments: ProjectCommentDoc[],
) => {
  for (const comment of comments) {
    const reactions = await ctx.db
      .query("commentReactions")
      .withIndex("by_commentId", (q) => q.eq("commentId", comment._id))
      .collect();

    await Promise.all(reactions.map((reaction) => ctx.db.delete(reaction._id)));
  }
  await Promise.all(comments.map((comment) => ctx.db.delete(comment._id)));
};

export const remove = mutation({
  args: {
    commentId: v.id("projectComments"),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      return {
        removed: false,
        removedCommentId: String(args.commentId),
        parentCommentId: null,
      };
    }

    const { appUser, project } = await requireProjectRoleById(
      ctx,
      comment.projectId,
      "member",
    );

    if (comment.authorUserId !== appUser._id) {
      throw new ConvexError("Forbidden");
    }

    const commentsToDelete = await deleteCommentThread(ctx, comment);
    const commentsToDeleteById = new Set(
      commentsToDelete.map((entry) => String(entry._id)),
    );
    await removeCommentsAndReactions(ctx, commentsToDelete);

    const parentDecrements = new Map<Id<"projectComments">, number>();
    commentsToDelete.forEach((entry) => {
      if (!entry.parentCommentId) {
        return;
      }
      if (commentsToDeleteById.has(String(entry.parentCommentId))) {
        return;
      }
      parentDecrements.set(
        entry.parentCommentId,
        (parentDecrements.get(entry.parentCommentId) ?? 0) + 1,
      );
    });
    await Promise.all(
      Array.from(parentDecrements.entries()).map(([parentCommentId, decrementBy]) =>
        decrementParentReplyCount(ctx, { parentCommentId, decrementBy }),
      ),
    );
    await logWorkspaceActivityForActorUser(ctx, {
      workspaceId: project.workspaceId,
      kind: "collaboration",
      action: "comment_deleted",
      actorUser: appUser,
      projectPublicId: project.publicId,
      projectName: project.name,
    });
    return {
      removed: true,
      removedCommentId: String(comment._id),
      parentCommentId: comment.parentCommentId
        ? String(comment.parentCommentId)
        : null,
    };
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

    const { appUser, project } = await requireProjectRoleById(
      ctx,
      comment.projectId,
      "member",
    );

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

    const { appUser, project } = await requireProjectRoleById(
      ctx,
      comment.projectId,
      "member",
    );

    const existing = await ctx.db
      .query("commentReactions")
      .withIndex("by_comment_emoji_user", (q) =>
        q.eq("commentId", comment._id).eq("emoji", args.emoji).eq("userId", appUser._id),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      const currentReactions = await ctx.db
        .query("commentReactions")
        .withIndex("by_commentId", (q) => q.eq("commentId", comment._id))
        .collect();
      const reactionSummarySnapshot = buildReactionSummarySnapshot(currentReactions);
      await ctx.db.patch(comment._id, {
        reactionSummary: reactionSummarySnapshot,
      });
      const reactionSummary = await hydrateReactionSummaryForResponse(
        ctx,
        reactionSummarySnapshot,
      );
      await logWorkspaceActivityForActorUser(ctx, {
        workspaceId: project.workspaceId,
        kind: "collaboration",
        action: "reaction_removed",
        actorUser: appUser,
        projectPublicId: project.publicId,
        projectName: project.name,
        message: args.emoji,
      });
      return {
        commentId: comment._id,
        emoji: args.emoji,
        active: false,
        reactionSummary,
      };
    }

    await ctx.db.insert("commentReactions", {
      commentId: comment._id,
      projectPublicId: comment.projectPublicId,
      workspaceId: comment.workspaceId,
      emoji: args.emoji,
      userId: appUser._id,
      createdAt: Date.now(),
    });
    const currentReactions = await ctx.db
      .query("commentReactions")
      .withIndex("by_commentId", (q) => q.eq("commentId", comment._id))
      .collect();
    const reactionSummarySnapshot = buildReactionSummarySnapshot(currentReactions);
    await ctx.db.patch(comment._id, {
      reactionSummary: reactionSummarySnapshot,
    });
    const reactionSummary = await hydrateReactionSummaryForResponse(
      ctx,
      reactionSummarySnapshot,
    );
    await logWorkspaceActivityForActorUser(ctx, {
      workspaceId: project.workspaceId,
      kind: "collaboration",
      action: "reaction_added",
      actorUser: appUser,
      projectPublicId: project.publicId,
      projectName: project.name,
      message: args.emoji,
    });
    return {
      commentId: comment._id,
      emoji: args.emoji,
      active: true,
      reactionSummary,
    };
  },
});
