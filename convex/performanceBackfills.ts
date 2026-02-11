import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireWorkspaceRole } from "./lib/auth";

const clampLimit = (value: number | undefined) => {
  const normalized = Math.floor(Number(value ?? 5000));
  if (!Number.isFinite(normalized) || normalized <= 0) {
    return 5000;
  }
  return Math.min(normalized, 20000);
};

const resolveUserAvatarForBackfill = async (ctx: any, user: any) => {
  if (typeof user?.avatarUrl === "string" && user.avatarUrl.trim().length > 0) {
    return user.avatarUrl;
  }
  if (user?.avatarStorageId) {
    return (await ctx.storage.getUrl(user.avatarStorageId)) ?? "";
  }
  return "";
};

export const backfillWorkspaceDenormalizedFields = mutation({
  args: {
    workspaceSlug: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q: any) => q.eq("slug", args.workspaceSlug))
      .unique();

    if (!workspace || workspace.deletedAt != null) {
      throw new ConvexError("Workspace not found");
    }

    await requireWorkspaceRole(ctx, workspace._id, "owner", { workspace });
    const maxPatches = clampLimit(args.limit);
    let remaining = maxPatches;

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_workspaceId", (q: any) => q.eq("workspaceId", workspace._id))
      .collect();
    const projectByPublicId = new Map(
      projects.map((project: any) => [project.publicId, project]),
    );
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_workspaceId", (q: any) => q.eq("workspaceId", workspace._id))
      .collect();
    const files = await ctx.db
      .query("projectFiles")
      .withIndex("by_workspaceId", (q: any) => q.eq("workspaceId", workspace._id))
      .collect();
    const comments = await ctx.db
      .query("projectComments")
      .withIndex("by_workspaceId", (q: any) => q.eq("workspaceId", workspace._id))
      .collect();

    const userIds = new Set([
      ...projects.map((project: any) => String(project.creatorUserId)),
      ...comments.map((comment: any) => String(comment.authorUserId)),
    ]);
    const userRows = await Promise.all(
      Array.from(userIds).map(async (userId) => {
        const matchedProject = projects.find((project: any) => String(project.creatorUserId) === userId);
        if (matchedProject) {
          const user = await ctx.db.get(matchedProject.creatorUserId);
          return user ? [userId, user] : null;
        }

        const matchedComment = comments.find((comment: any) => String(comment.authorUserId) === userId);
        if (!matchedComment) {
          return null;
        }
        const user = await ctx.db.get(matchedComment.authorUserId);
        return user ? [userId, user] : null;
      }),
    );
    const usersById = new Map(
      userRows.filter((entry): entry is [string, any] => entry !== null),
    );

    let patchedProjects = 0;
    for (const project of projects) {
      if (remaining <= 0) {
        break;
      }
      const needsName = typeof project.creatorSnapshotName !== "string" || project.creatorSnapshotName.trim().length === 0;
      const needsAvatar = typeof project.creatorSnapshotAvatarUrl !== "string";
      if (!needsName && !needsAvatar) {
        continue;
      }

      const creator = usersById.get(String(project.creatorUserId));
      const patch: Record<string, unknown> = {};
      if (needsName) {
        patch.creatorSnapshotName = creator?.name ?? "Unknown user";
      }
      if (needsAvatar) {
        patch.creatorSnapshotAvatarUrl = await resolveUserAvatarForBackfill(ctx, creator);
      }

      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(project._id, patch);
        patchedProjects += 1;
        remaining -= 1;
      }
    }

    let patchedComments = 0;
    for (const comment of comments) {
      if (remaining <= 0) {
        break;
      }
      const needsName = typeof comment.authorSnapshotName !== "string" || comment.authorSnapshotName.trim().length === 0;
      const needsAvatar = typeof comment.authorSnapshotAvatarUrl !== "string";
      if (!needsName && !needsAvatar) {
        continue;
      }

      const author = usersById.get(String(comment.authorUserId));
      const patch: Record<string, unknown> = {};
      if (needsName) {
        patch.authorSnapshotName = author?.name ?? "Unknown user";
      }
      if (needsAvatar) {
        patch.authorSnapshotAvatarUrl = await resolveUserAvatarForBackfill(ctx, author);
      }

      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(comment._id, patch);
        patchedComments += 1;
        remaining -= 1;
      }
    }

    let patchedTasks = 0;
    for (const task of tasks) {
      if (remaining <= 0) {
        break;
      }

      const targetProject = typeof task.projectPublicId === "string"
        ? projectByPublicId.get(task.projectPublicId) ?? null
        : null;
      const targetProjectDeletedAt = targetProject?.deletedAt ?? null;
      if (task.projectDeletedAt === targetProjectDeletedAt) {
        continue;
      }

      await ctx.db.patch(task._id, {
        projectDeletedAt: targetProjectDeletedAt,
      });
      patchedTasks += 1;
      remaining -= 1;
    }

    let patchedFiles = 0;
    for (const file of files) {
      if (remaining <= 0) {
        break;
      }

      const targetProject = projectByPublicId.get(file.projectPublicId) ?? null;
      const targetProjectDeletedAt = targetProject?.deletedAt ?? null;
      if (file.projectDeletedAt === targetProjectDeletedAt) {
        continue;
      }

      await ctx.db.patch(file._id, {
        projectDeletedAt: targetProjectDeletedAt,
      });
      patchedFiles += 1;
      remaining -= 1;
    }

    const commentsById = new Map(
      comments.map((comment: any) => [String(comment._id), comment]),
    );
    const reactionGroups = await Promise.all(
      comments.map((comment: any) =>
        ctx.db
          .query("commentReactions")
          .withIndex("by_commentId", (q: any) => q.eq("commentId", comment._id))
          .collect()),
    );
    const reactions = reactionGroups.flat();
    let patchedReactions = 0;
    for (const reaction of reactions) {
      if (remaining <= 0) {
        break;
      }
      const comment = commentsById.get(String(reaction.commentId));
      if (!comment) {
        continue;
      }
      const needsProjectPublicId = typeof reaction.projectPublicId !== "string" || reaction.projectPublicId.trim().length === 0;
      const needsWorkspaceId = reaction.workspaceId == null;
      if (!needsProjectPublicId && !needsWorkspaceId) {
        continue;
      }

      const patch: Record<string, unknown> = {};
      if (needsProjectPublicId) {
        patch.projectPublicId = comment.projectPublicId;
      }
      if (needsWorkspaceId) {
        patch.workspaceId = comment.workspaceId;
      }

      await ctx.db.patch(reaction._id, patch);
      patchedReactions += 1;
      remaining -= 1;
    }

    return {
      workspaceSlug: workspace.slug,
      maxPatches,
      applied: patchedProjects + patchedComments + patchedTasks + patchedFiles + patchedReactions,
      patchedProjects,
      patchedComments,
      patchedTasks,
      patchedFiles,
      patchedReactions,
      exhaustedLimit: remaining === 0,
    };
  },
});

export const backfillWorkspaceMemberSnapshots = mutation({
  args: {
    workspaceSlug: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q: any) => q.eq("slug", args.workspaceSlug))
      .unique();

    if (!workspace || workspace.deletedAt != null) {
      throw new ConvexError("Workspace not found");
    }

    await requireWorkspaceRole(ctx, workspace._id, "owner", { workspace });
    const maxPatches = clampLimit(args.limit);
    let remaining = maxPatches;

    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspaceId", (q: any) => q.eq("workspaceId", workspace._id))
      .collect();

    const uniqueUserIds = Array.from(
      new Set(memberships.map((membership: any) => String(membership.userId))),
    );
    const membershipByUserId = new Map(
      memberships.map((membership: any) => [String(membership.userId), membership] as const),
    );
    const usersById = new Map(
      (
        await Promise.all(
          uniqueUserIds.map(async (userId) => {
            const membership = membershipByUserId.get(userId);
            if (!membership) {
              return null;
            }
            const user = await ctx.db.get(membership.userId);
            return user ? ([userId, user] as const) : null;
          }),
        )
      ).filter((entry): entry is readonly [string, any] => entry !== null),
    );

    let patchedMemberships = 0;
    for (const membership of memberships) {
      if (remaining <= 0) {
        break;
      }

      const needsName = membership.nameSnapshot === undefined;
      const needsEmail = membership.emailSnapshot === undefined;
      const needsAvatar = membership.avatarUrlSnapshot === undefined;
      if (!needsName && !needsEmail && !needsAvatar) {
        continue;
      }

      const user = usersById.get(String(membership.userId));
      const patch: Record<string, unknown> = {};
      if (needsName) {
        patch.nameSnapshot = user?.name ?? "Unknown user";
      }
      if (needsEmail) {
        patch.emailSnapshot = user?.email ?? "";
      }
      if (needsAvatar) {
        const resolvedAvatar = await resolveUserAvatarForBackfill(ctx, user);
        patch.avatarUrlSnapshot = resolvedAvatar || null;
      }

      await ctx.db.patch(membership._id, patch);
      patchedMemberships += 1;
      remaining -= 1;
    }

    return {
      workspaceSlug: workspace.slug,
      maxPatches,
      patchedMemberships,
      exhaustedLimit: remaining === 0,
    };
  },
});

export const backfillProjectCommentReplyCounts = mutation({
  args: {
    workspaceSlug: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q: any) => q.eq("slug", args.workspaceSlug))
      .unique();
    if (!workspace || workspace.deletedAt != null) {
      throw new ConvexError("Workspace not found");
    }

    await requireWorkspaceRole(ctx, workspace._id, "owner", { workspace });
    const maxPatches = clampLimit(args.limit);
    let remaining = maxPatches;

    const comments = await ctx.db
      .query("projectComments")
      .withIndex("by_workspaceId", (q: any) => q.eq("workspaceId", workspace._id))
      .collect();
    const replyCountByParentId = new Map<string, number>();
    comments.forEach((comment: any) => {
      if (!comment.parentCommentId) {
        return;
      }
      const parentId = String(comment.parentCommentId);
      replyCountByParentId.set(parentId, (replyCountByParentId.get(parentId) ?? 0) + 1);
    });

    let patchedComments = 0;
    for (const comment of comments) {
      if (remaining <= 0) {
        break;
      }
      if (comment.replyCount !== undefined) {
        continue;
      }
      await ctx.db.patch(comment._id, {
        replyCount: replyCountByParentId.get(String(comment._id)) ?? 0,
      });
      patchedComments += 1;
      remaining -= 1;
    }

    return {
      workspaceSlug: workspace.slug,
      maxPatches,
      patchedComments,
      exhaustedLimit: remaining === 0,
    };
  },
});
