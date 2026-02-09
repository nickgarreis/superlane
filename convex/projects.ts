import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import {
  draftDataValidator,
  projectStatusValidator,
  reviewCommentValidator,
} from "./lib/validators";
import { requireProjectRole, requireWorkspaceRole } from "./lib/auth";
import { ensureUniqueFileName, FILE_RETENTION_MS, inferFileTypeFromName, MAX_FILES_PER_PROJECT } from "./lib/filePolicy";
import { syncProjectAttachmentMirror } from "./lib/projectAttachments";
import { hasRequiredWorkspaceRole } from "./lib/rbac";

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

const consumePendingUploadsForProject = async (
  ctx: any,
  args: {
    project: { _id: any; workspaceId: any; publicId: string };
    appUserId: any;
    pendingUploadIds: any[];
  },
) => {
  if (args.pendingUploadIds.length === 0) {
    return;
  }

  const activeFiles = (
    await ctx.db
      .query("projectFiles")
      .withIndex("by_projectId", (q: any) => q.eq("projectId", args.project._id))
      .collect()
  ).filter((file: any) => file.deletedAt == null);

  if (activeFiles.length + args.pendingUploadIds.length > MAX_FILES_PER_PROJECT) {
    throw new ConvexError("File limit reached for this project");
  }

  const pendingUploads = await Promise.all(
    args.pendingUploadIds.map((pendingUploadId) => ctx.db.get(pendingUploadId)),
  );
  const now = Date.now();
  const attachmentNames = new Set<string>(
    activeFiles.filter((file: any) => file.tab === "Attachments").map((file: any) => file.name),
  );

  for (let index = 0; index < pendingUploads.length; index += 1) {
    const pendingUpload = pendingUploads[index];
    if (!pendingUpload) {
      throw new ConvexError("Pending upload not found");
    }
    if (String(pendingUpload.workspaceId) !== String(args.project.workspaceId)) {
      throw new ConvexError("Pending upload workspace mismatch");
    }
    if (String(pendingUpload.uploaderUserId) !== String(args.appUserId)) {
      throw new ConvexError("Forbidden");
    }

    const finalName = ensureUniqueFileName(pendingUpload.name, attachmentNames);
    attachmentNames.add(finalName);

    await ctx.db.insert("projectFiles", {
      workspaceId: args.project.workspaceId,
      projectId: args.project._id,
      projectPublicId: args.project.publicId,
      tab: "Attachments",
      name: finalName,
      type: inferFileTypeFromName(finalName),
      storageId: pendingUpload.storageId,
      mimeType: pendingUpload.mimeType,
      sizeBytes: pendingUpload.sizeBytes,
      checksumSha256: pendingUpload.checksumSha256,
      displayDate: new Date(now).toISOString(),
      source: "importedAttachment",
      deletedAt: null,
      purgeAfterAt: null,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.delete(pendingUpload._id);
  }
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
    attachmentPendingUploadIds: v.optional(v.array(v.id("pendingFileUploads"))),
    draftData: v.optional(v.union(draftDataValidator, v.null())),
    reviewComments: v.optional(v.array(reviewCommentValidator)),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q) => q.eq("slug", args.workspaceSlug))
      .unique();

    if (!workspace) {
      throw new ConvexError("Workspace not found");
    }

    const { appUser } = await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });

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
      deletedAt: null,
      draftData: args.draftData ?? null,
      attachments: [],
      reviewComments: args.reviewComments,
      createdAt: now,
      updatedAt: now,
    });

    const projectRef = { _id: projectId, workspaceId: workspace._id, publicId };
    await consumePendingUploadsForProject(ctx, {
      project: projectRef,
      appUserId: appUser._id,
      pendingUploadIds: args.attachmentPendingUploadIds ?? [],
    });
    await syncProjectAttachmentMirror(ctx, projectRef);

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
    attachmentPendingUploadIds: v.optional(v.array(v.id("pendingFileUploads"))),
    draftData: v.optional(v.union(draftDataValidator, v.null())),
    reviewComments: v.optional(v.array(reviewCommentValidator)),
  },
  handler: async (ctx, args) => {
    const { project, appUser, membership } = await requireProjectRole(ctx, args.publicId, "member");

    const patch: Record<string, unknown> = {
      updatedAt: Date.now(),
      updatedByUserId: appUser._id,
    };

    if (args.name !== undefined) patch.name = args.name;
    if (args.description !== undefined) patch.description = args.description;
    if (args.category !== undefined) patch.category = args.category;
    if (args.scope !== undefined) patch.scope = args.scope;
    if (args.deadline !== undefined) patch.deadline = args.deadline;
    if (args.draftData !== undefined) patch.draftData = args.draftData;
    if (args.reviewComments !== undefined) patch.reviewComments = args.reviewComments;

    if (args.status !== undefined) {
      if (!hasRequiredWorkspaceRole(membership.role, "admin")) {
        throw new ConvexError("Forbidden");
      }
      patch.status = args.status;
      patch.archived = false;
      patch.previousStatus = null;
      patch.archivedAt = null;
      patch.completedAt = args.status === "Completed" ? Date.now() : null;
      patch.statusUpdatedByUserId = appUser._id;
    }

    await ctx.db.patch(project._id, patch);
    if (args.attachmentPendingUploadIds && args.attachmentPendingUploadIds.length > 0) {
      await consumePendingUploadsForProject(ctx, {
        project,
        appUserId: appUser._id,
        pendingUploadIds: args.attachmentPendingUploadIds,
      });
    }
    await syncProjectAttachmentMirror(ctx, project);

    return { publicId: project.publicId };
  },
});

export const setStatus = mutation({
  args: {
    publicId: v.string(),
    status: projectStatusValidator,
  },
  handler: async (ctx, args) => {
    const { project, appUser } = await requireProjectRole(ctx, args.publicId, "admin");

    const now = Date.now();

    await ctx.db.patch(project._id, {
      status: args.status,
      archived: false,
      previousStatus: null,
      archivedAt: null,
      completedAt: args.status === "Completed" ? now : null,
      updatedAt: now,
      statusUpdatedByUserId: appUser._id,
    });

    return { publicId: project.publicId };
  },
});

export const archive = mutation({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, args) => {
    const { project, appUser } = await requireProjectRole(ctx, args.publicId, "admin");
    const now = Date.now();

    await ctx.db.patch(project._id, {
      archived: true,
      archivedAt: now,
      previousStatus: project.status,
      updatedAt: now,
      archivedByUserId: appUser._id,
    });

    return { publicId: project.publicId };
  },
});

export const unarchive = mutation({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, args) => {
    const { project, appUser } = await requireProjectRole(ctx, args.publicId, "admin");
    const now = Date.now();

    await ctx.db.patch(project._id, {
      archived: false,
      archivedAt: null,
      status: project.previousStatus ?? "Review",
      previousStatus: null,
      updatedAt: now,
      unarchivedByUserId: appUser._id,
    });

    return { publicId: project.publicId };
  },
});

export const remove = mutation({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, args) => {
    const { project, appUser } = await requireProjectRole(ctx, args.publicId, "admin");
    const now = Date.now();

    const activeProjectFiles = await ctx.db
      .query("projectFiles")
      .withIndex("by_projectId", (q: any) => q.eq("projectId", project._id))
      .collect();
    await Promise.all(
      activeProjectFiles
        .filter((file: any) => file.deletedAt == null)
        .map((file: any) =>
          ctx.db.patch(file._id, {
            deletedAt: now,
            deletedByUserId: appUser._id,
            purgeAfterAt: now + FILE_RETENTION_MS,
            updatedAt: now,
          }),
        ),
    );

    await ctx.db.patch(project._id, {
      deletedAt: now,
      deletedByUserId: appUser._id,
      updatedAt: now,
    });

    return { publicId: args.publicId };
  },
});

export const updateReviewComments = mutation({
  args: {
    publicId: v.string(),
    comments: v.array(reviewCommentValidator),
  },
  handler: async (ctx, args) => {
    const { project } = await requireProjectRole(ctx, args.publicId, "member");

    await ctx.db.patch(project._id, {
      reviewComments: args.comments,
      updatedAt: Date.now(),
    });

    return { publicId: project.publicId };
  },
});
