import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import {
  attachmentValidator,
  draftDataValidator,
  projectStatusValidator,
  reviewCommentValidator,
} from "./lib/validators";
import { requireAuthUser, requireWorkspaceMember } from "./lib/auth";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "project";

const ensureUniqueProjectPublicId = async (ctx: any, base: string) => {
  let candidate = base;
  let i = 2;

  while (true) {
    const existing = await ctx.db
      .query("projects")
      .withIndex("by_publicId", (q: any) => q.eq("publicId", candidate))
      .unique();
    if (!existing) {
      return candidate;
    }
    candidate = `${base}-${i}`;
    i += 1;
  }
};

const getProjectForMember = async (ctx: any, projectPublicId: string) => {
  const project = await ctx.db
    .query("projects")
    .withIndex("by_publicId", (q: any) => q.eq("publicId", projectPublicId))
    .unique();

  if (!project) {
    throw new ConvexError("Project not found");
  }

  await requireWorkspaceMember(ctx, project.workspaceId);

  return project;
};

const syncAttachmentFiles = async (
  ctx: any,
  project: { _id: any; workspaceId: any; publicId: string },
  attachments: Array<{ name: string; type: string; date: string; img: string }>,
) => {
  const existingFiles = await ctx.db
    .query("projectFiles")
    .withIndex("by_projectPublicId", (q: any) => q.eq("projectPublicId", project.publicId))
    .collect();

  const existingAttachmentFiles = existingFiles.filter((file: any) => file.tab === "Attachments");
  await Promise.all(existingAttachmentFiles.map((file: any) => ctx.db.delete(file._id)));

  if (attachments.length === 0) {
    return;
  }

  const now = Date.now();
  await Promise.all(
    attachments.map((attachment) =>
      ctx.db.insert("projectFiles", {
        workspaceId: project.workspaceId,
        projectId: project._id,
        projectPublicId: project.publicId,
        tab: "Attachments",
        name: attachment.name,
        type: attachment.type,
        displayDate: attachment.date,
        thumbnailRef: attachment.img,
        source: "importedAttachment",
        createdAt: now,
        updatedAt: now,
      }),
    ),
  );
};

export const create = mutation({
  args: {
    workspaceSlug: v.string(),
    publicId: v.optional(v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    scope: v.optional(v.string()),
    deadline: v.optional(v.string()),
    status: v.optional(projectStatusValidator),
    attachments: v.optional(v.array(attachmentValidator)),
    draftData: v.optional(v.union(draftDataValidator, v.null())),
    reviewComments: v.optional(v.array(reviewCommentValidator)),
  },
  handler: async (ctx, args) => {
    const { appUser } = await requireAuthUser(ctx);

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q) => q.eq("slug", args.workspaceSlug))
      .unique();

    if (!workspace) {
      throw new ConvexError("Workspace not found");
    }

    await requireWorkspaceMember(ctx, workspace._id);

    const basePublicId = args.publicId && args.publicId.length > 0
      ? args.publicId
      : `${slugify(args.name)}-${Date.now()}`;
    const publicId = await ensureUniqueProjectPublicId(ctx, basePublicId);

    const now = Date.now();
    const status = args.status ?? "Draft";

    const projectId = await ctx.db.insert("projects", {
      publicId,
      workspaceId: workspace._id,
      creatorUserId: appUser._id,
      name: args.name,
      description: args.description ?? "",
      category: args.category,
      scope: args.scope,
      deadline: args.deadline,
      status,
      previousStatus: null,
      archived: false,
      archivedAt: null,
      completedAt: status === "Completed" ? now : null,
      draftData: args.draftData ?? null,
      attachments: args.attachments,
      reviewComments: args.reviewComments,
      createdAt: now,
      updatedAt: now,
    });

    await syncAttachmentFiles(
      ctx,
      { _id: projectId, workspaceId: workspace._id, publicId },
      args.attachments ?? [],
    );

    return { projectId, publicId };
  },
});

export const update = mutation({
  args: {
    publicId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    scope: v.optional(v.string()),
    deadline: v.optional(v.string()),
    status: v.optional(projectStatusValidator),
    attachments: v.optional(v.array(attachmentValidator)),
    draftData: v.optional(v.union(draftDataValidator, v.null())),
    reviewComments: v.optional(v.array(reviewCommentValidator)),
  },
  handler: async (ctx, args) => {
    const project = await getProjectForMember(ctx, args.publicId);

    const patch: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) patch.name = args.name;
    if (args.description !== undefined) patch.description = args.description;
    if (args.category !== undefined) patch.category = args.category;
    if (args.scope !== undefined) patch.scope = args.scope;
    if (args.deadline !== undefined) patch.deadline = args.deadline;
    if (args.attachments !== undefined) patch.attachments = args.attachments;
    if (args.draftData !== undefined) patch.draftData = args.draftData;
    if (args.reviewComments !== undefined) patch.reviewComments = args.reviewComments;

    if (args.status !== undefined) {
      patch.status = args.status;
      patch.archived = false;
      patch.previousStatus = null;
      patch.archivedAt = null;
      patch.completedAt = args.status === "Completed" ? Date.now() : null;
    }

    await ctx.db.patch(project._id, patch);
    if (args.attachments !== undefined) {
      await syncAttachmentFiles(ctx, project, args.attachments);
    }

    return { publicId: project.publicId };
  },
});

export const setStatus = mutation({
  args: {
    publicId: v.string(),
    status: projectStatusValidator,
  },
  handler: async (ctx, args) => {
    const project = await getProjectForMember(ctx, args.publicId);

    const now = Date.now();

    await ctx.db.patch(project._id, {
      status: args.status,
      archived: false,
      previousStatus: null,
      archivedAt: null,
      completedAt: args.status === "Completed" ? now : null,
      updatedAt: now,
    });

    return { publicId: project.publicId };
  },
});

export const archive = mutation({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, args) => {
    const project = await getProjectForMember(ctx, args.publicId);
    const now = Date.now();

    await ctx.db.patch(project._id, {
      archived: true,
      archivedAt: now,
      previousStatus: project.status,
      updatedAt: now,
    });

    return { publicId: project.publicId };
  },
});

export const unarchive = mutation({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, args) => {
    const project = await getProjectForMember(ctx, args.publicId);
    const now = Date.now();

    await ctx.db.patch(project._id, {
      archived: false,
      archivedAt: null,
      status: project.previousStatus ?? "Review",
      previousStatus: null,
      updatedAt: now,
    });

    return { publicId: project.publicId };
  },
});

export const remove = mutation({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, args) => {
    const project = await getProjectForMember(ctx, args.publicId);

    const [tasks, files, comments] = await Promise.all([
      ctx.db
      .query("tasks")
      .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
      .collect(),
      ctx.db
        .query("projectFiles")
        .withIndex("by_projectId", (q: any) => q.eq("projectId", project._id))
        .collect(),
      ctx.db
        .query("projectComments")
        .withIndex("by_projectId", (q: any) => q.eq("projectId", project._id))
        .collect(),
    ]);

    const reactions = (
      await Promise.all(
        comments.map((comment: any) =>
          ctx.db
            .query("commentReactions")
            .withIndex("by_commentId", (q: any) => q.eq("commentId", comment._id))
            .collect(),
        ),
      )
    ).flat();

    await Promise.all([
      ...tasks.map((task: any) => ctx.db.delete(task._id)),
      ...files.map((file: any) => ctx.db.delete(file._id)),
      ...reactions.map((reaction: any) => ctx.db.delete(reaction._id)),
      ...comments.map((comment: any) => ctx.db.delete(comment._id)),
    ]);
    await ctx.db.delete(project._id);

    return { publicId: args.publicId };
  },
});

export const updateReviewComments = mutation({
  args: {
    publicId: v.string(),
    comments: v.array(reviewCommentValidator),
  },
  handler: async (ctx, args) => {
    const project = await getProjectForMember(ctx, args.publicId);

    await ctx.db.patch(project._id, {
      reviewComments: args.comments,
      updatedAt: Date.now(),
    });

    return { publicId: project.publicId };
  },
});
