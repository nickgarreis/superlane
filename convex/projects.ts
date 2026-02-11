import { ConvexError, v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  draftDataValidator,
  projectStatusValidator,
  reviewCommentValidator,
} from "./lib/validators";
import { requireProjectRole, requireWorkspaceRole } from "./lib/auth";
import { ensureUniqueFileName, FILE_RETENTION_MS, inferFileTypeFromName, MAX_FILES_PER_PROJECT } from "./lib/filePolicy";
import { syncProjectAttachmentMirror } from "./lib/projectAttachments";
import { hasRequiredWorkspaceRole } from "./lib/rbac";
import { assertFiniteEpochMs } from "./lib/dateNormalization";
import { logError } from "./lib/logging";

const NOTIFICATION_DISPATCH_DELAY_MS = 30_000;

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

const normalizeOptionalEpochMs = (
  value: number | null | undefined,
  label: string,
) => {
  if (value === undefined || value === null) {
    return null;
  }
  return assertFiniteEpochMs(value, label);
};

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

const resolveCreatorAvatar = async (ctx: any, creatorRow: any) => {
  if (typeof creatorRow?.avatarUrl === "string" && creatorRow.avatarUrl.trim().length > 0) {
    return creatorRow.avatarUrl;
  }
  if (creatorRow?.avatarStorageId) {
    return (await ctx.storage.getUrl(creatorRow.avatarStorageId)) ?? "";
  }
  return "";
};

export const listForWorkspace = query({
  args: {
    workspaceSlug: v.string(),
    includeArchived: v.optional(v.boolean()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });

    const includeArchived = args.includeArchived ?? false;
    const paginated = includeArchived
      ? await ctx.db
          .query("projects")
          .withIndex("by_workspace_deletedAt_updatedAt_createdAt", (q: any) =>
            q.eq("workspaceId", workspace._id).eq("deletedAt", null))
          .order("desc")
          .paginate(args.paginationOpts)
      : await ctx.db
          .query("projects")
          .withIndex("by_workspace_archived_deletedAt_updatedAt_createdAt", (q: any) =>
            q.eq("workspaceId", workspace._id).eq("archived", false).eq("deletedAt", null))
          .order("desc")
          .paginate(args.paginationOpts);

    const creatorIdsToResolve = Array.from(
      new Set(
        paginated.page
          .filter((project: any) => !project.creatorSnapshotName)
          .map((project: any) => project.creatorUserId),
      ),
    );
    const creatorRows = await Promise.all(
      creatorIdsToResolve.map(async (creatorUserId) => {
        if (!creatorUserId) {
          return null;
        }

        try {
          const creator = await ctx.db.get(creatorUserId);
          return creator ? [String(creatorUserId), creator] : null;
        } catch {
          return null;
        }
      }),
    );
    const creatorById = new Map(
      creatorRows.filter((entry): entry is [string, any] => entry !== null),
    );

    const page = await Promise.all(paginated.page.map(async (project: any) => {
      const creatorRow = creatorById.get(String(project.creatorUserId));
      const creatorName = project.creatorSnapshotName ?? creatorRow?.name ?? "Unknown user";
      const creatorAvatarUrl = project.creatorSnapshotAvatarUrl
        ?? (creatorRow ? await resolveCreatorAvatar(ctx, creatorRow) : "");

      return {
        ...project,
        creator: {
          userId: String(project.creatorUserId),
          name: creatorName,
          avatarUrl: creatorAvatarUrl || "",
        },
      };
    }));

    return {
      ...paginated,
      page,
    };
  },
});

const resolveLifecycleEventType = (previousStatus: string | null, nextStatus: string) => {
  if (nextStatus === "Review" && previousStatus !== "Review") {
    return "submitted" as const;
  }
  if (previousStatus === "Review" && nextStatus === "Active") {
    return "reviewApproved" as const;
  }
  if (nextStatus === "Completed" && previousStatus !== "Completed") {
    return "completed" as const;
  }
  return null;
};

const scheduleProjectLifecycleNotification = async (
  ctx: any,
  args: {
    workspaceId: any;
    projectPublicId: string;
    projectName: string;
    actorUserId: any;
    actorName: string;
    previousStatus: string | null;
    nextStatus: string;
  },
) => {
  const eventType = resolveLifecycleEventType(args.previousStatus, args.nextStatus);
  if (!eventType) {
    return;
  }

  try {
    await ctx.scheduler.runAfter(NOTIFICATION_DISPATCH_DELAY_MS, internal.notificationsEmail.sendProjectLifecycleEvent, {
      workspaceId: args.workspaceId,
      actorUserId: args.actorUserId,
      actorName: args.actorName,
      projectPublicId: args.projectPublicId,
      projectName: args.projectName,
      eventType,
      previousStatus: args.previousStatus ?? undefined,
      nextStatus: args.nextStatus,
    });
  } catch (error) {
    logError("projects.lifecycleNotification", "Failed to schedule lifecycle email notification", {
      error,
      projectPublicId: args.projectPublicId,
      nextStatus: args.nextStatus,
      previousStatus: args.previousStatus,
    });
  }
};

type ReviewCommentRecord = {
  id: string;
  author: {
    userId?: string;
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
};

const normalizeReviewCommentForAuthor = (
  comment: ReviewCommentRecord,
  appUser: { _id: unknown; name?: string; avatarUrl?: string | null },
): ReviewCommentRecord => ({
  id: comment.id,
  author: {
    userId: String(appUser._id),
    name: appUser.name ?? "Unknown user",
    avatar: appUser.avatarUrl ?? "",
  },
  content: comment.content,
  timestamp: comment.timestamp,
});

const reviewCommentsEqual = (left: ReviewCommentRecord, right: ReviewCommentRecord) =>
  left.id === right.id
  && left.content === right.content
  && left.timestamp === right.timestamp
  && left.author.name === right.author.name
  && left.author.avatar === right.author.avatar
  && (left.author.userId ?? null) === (right.author.userId ?? null);

const enforceReviewCommentOwnership = (args: {
  existingComments: ReviewCommentRecord[] | undefined;
  nextComments: ReviewCommentRecord[];
  appUser: { _id: unknown; name?: string; avatarUrl?: string | null };
}) => {
  const viewerUserId = String(args.appUser._id);
  const existing = args.existingComments ?? [];
  const existingById = new Map(existing.map((comment) => [comment.id, comment]));
  const seenIds = new Set<string>();
  const normalizedComments: ReviewCommentRecord[] = [];

  for (const nextComment of args.nextComments) {
    if (seenIds.has(nextComment.id)) {
      throw new ConvexError("Duplicate review comment id");
    }
    seenIds.add(nextComment.id);

    const existingComment = existingById.get(nextComment.id);
    if (!existingComment) {
      if (nextComment.author.userId && nextComment.author.userId !== viewerUserId) {
        throw new ConvexError("Forbidden");
      }
      normalizedComments.push(normalizeReviewCommentForAuthor(nextComment, args.appUser));
      continue;
    }

    if (existingComment.author.userId !== viewerUserId) {
      if (!reviewCommentsEqual(nextComment, existingComment)) {
        throw new ConvexError("Forbidden");
      }
      normalizedComments.push(existingComment);
      continue;
    }

    normalizedComments.push(normalizeReviewCommentForAuthor(nextComment, args.appUser));
  }

  for (const existingComment of existing) {
    if (seenIds.has(existingComment.id)) {
      continue;
    }
    if (existingComment.author.userId !== viewerUserId) {
      throw new ConvexError("Forbidden");
    }
  }

  return normalizedComments;
};

const consumePendingUploadsForProject = async (
  ctx: any,
  args: {
    project: { _id: any; workspaceId: any; publicId: string; deletedAt?: number | null };
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
      projectDeletedAt: args.project.deletedAt ?? null,
      tab: "Attachments",
      name: finalName,
      type: inferFileTypeFromName(finalName),
      storageId: pendingUpload.storageId,
      mimeType: pendingUpload.mimeType,
      sizeBytes: pendingUpload.sizeBytes,
      checksumSha256: pendingUpload.checksumSha256,
      displayDateEpochMs: now,
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
    deadlineEpochMs: v.optional(v.union(v.number(), v.null())),
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
    const deadlineEpochMs = normalizeOptionalEpochMs(args.deadlineEpochMs, "deadlineEpochMs");

    const projectId = await ctx.db.insert("projects", {
      publicId,
      workspaceId: workspace._id,
      creatorUserId: appUser._id,
      creatorSnapshotName: appUser.name ?? "Unknown user",
      creatorSnapshotAvatarUrl: appUser.avatarUrl ?? undefined,
      name: args.name,
      description: args.description ?? "",
      category: args.category,
      scope: args.scope,
      deadlineEpochMs,
      status,
      previousStatus: null,
      archived: false,
      archivedAt: null,
      completedAt: status === "Completed" ? now : null,
      deletedAt: null,
      draftData: args.draftData ?? null,
      attachments: [],
      reviewComments: args.reviewComments
        ? enforceReviewCommentOwnership({
            existingComments: [],
            nextComments: args.reviewComments as ReviewCommentRecord[],
            appUser,
          })
        : undefined,
      createdAt: now,
      updatedAt: now,
    });

    const projectRef = { _id: projectId, workspaceId: workspace._id, publicId, deletedAt: null };
    await consumePendingUploadsForProject(ctx, {
      project: projectRef,
      appUserId: appUser._id,
      pendingUploadIds: args.attachmentPendingUploadIds ?? [],
    });
    await syncProjectAttachmentMirror(ctx, projectRef);
    await scheduleProjectLifecycleNotification(ctx, {
      workspaceId: workspace._id,
      projectPublicId: publicId,
      projectName: args.name,
      actorUserId: appUser._id,
      actorName: appUser.name ?? appUser.email ?? "Unknown user",
      previousStatus: null,
      nextStatus: status,
    });

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
    deadlineEpochMs: v.optional(v.union(v.number(), v.null())),
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
      // Remove legacy pre-normalization field when this row is touched.
      deadline: undefined,
    };

    if (args.name !== undefined) patch.name = args.name;
    if (args.description !== undefined) patch.description = args.description;
    if (args.category !== undefined) patch.category = args.category;
    if (args.scope !== undefined) patch.scope = args.scope;
    if (args.deadlineEpochMs !== undefined) {
      patch.deadlineEpochMs = normalizeOptionalEpochMs(args.deadlineEpochMs, "deadlineEpochMs");
    }
    if (args.draftData !== undefined) patch.draftData = args.draftData;
    if (args.reviewComments !== undefined) {
      patch.reviewComments = enforceReviewCommentOwnership({
        existingComments: (project.reviewComments ?? []) as ReviewCommentRecord[],
        nextComments: args.reviewComments as ReviewCommentRecord[],
        appUser,
      });
    }

    if (args.status !== undefined) {
      if (!hasRequiredWorkspaceRole(membership.role, "admin")) {
        throw new ConvexError("Forbidden");
      }
      if (project.status === "Review" && args.status === "Active" && membership.role !== "owner") {
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

    if (args.status !== undefined) {
      const updatedName = args.name ?? project.name;
      await scheduleProjectLifecycleNotification(ctx, {
        workspaceId: project.workspaceId,
        projectPublicId: project.publicId,
        projectName: updatedName,
        actorUserId: appUser._id,
        actorName: appUser.name ?? appUser.email ?? "Unknown user",
        previousStatus: project.status,
        nextStatus: args.status,
      });
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
    const { project, appUser, membership } = await requireProjectRole(ctx, args.publicId, "admin");

    if (project.status === "Review" && args.status === "Active" && membership.role !== "owner") {
      throw new ConvexError("Forbidden");
    }

    const now = Date.now();

    await ctx.db.patch(project._id, {
      deadline: undefined,
      status: args.status,
      archived: false,
      previousStatus: null,
      archivedAt: null,
      completedAt: args.status === "Completed" ? now : null,
      updatedAt: now,
      statusUpdatedByUserId: appUser._id,
    });

    await scheduleProjectLifecycleNotification(ctx, {
      workspaceId: project.workspaceId,
      projectPublicId: project.publicId,
      projectName: project.name,
      actorUserId: appUser._id,
      actorName: appUser.name ?? appUser.email ?? "Unknown user",
      previousStatus: project.status,
      nextStatus: args.status,
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
      deadline: undefined,
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
      deadline: undefined,
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
            projectDeletedAt: now,
            deletedAt: now,
            deletedByUserId: appUser._id,
            purgeAfterAt: now + FILE_RETENTION_MS,
            updatedAt: now,
          }),
        ),
    );

    await ctx.db.patch(project._id, {
      deadline: undefined,
      deletedAt: now,
      deletedByUserId: appUser._id,
      updatedAt: now,
    });

    const projectTasks = await ctx.db
      .query("tasks")
      .withIndex("by_projectPublicId", (q: any) => q.eq("projectPublicId", project.publicId))
      .collect();

    await Promise.all(
      projectTasks.map((task: any) =>
        ctx.db.patch(task._id, {
          projectDeletedAt: now,
          updatedAt: now,
        })),
    );

    return { publicId: args.publicId };
  },
});

export const updateReviewComments = mutation({
  args: {
    publicId: v.string(),
    comments: v.array(reviewCommentValidator),
  },
  handler: async (ctx, args) => {
    const { project, appUser } = await requireProjectRole(ctx, args.publicId, "member");

    await ctx.db.patch(project._id, {
      deadline: undefined,
      reviewComments: enforceReviewCommentOwnership({
        existingComments: (project.reviewComments ?? []) as ReviewCommentRecord[],
        nextComments: args.comments as ReviewCommentRecord[],
        appUser,
      }),
      updatedByUserId: appUser._id,
      updatedAt: Date.now(),
    });

    return { publicId: project.publicId };
  },
});
