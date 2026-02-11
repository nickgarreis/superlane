import { ConvexError, v } from "convex/values";
import { makeFunctionReference, paginationOptsValidator } from "convex/server";
import type { Doc, Id } from "./_generated/dataModel";
import { action, internalMutation, mutation, query, type ActionCtx, type MutationCtx, type QueryCtx } from "./_generated/server";
import { requireProjectRole, requireProjectRoleById, requireWorkspaceRole } from "./lib/auth";
import {
  assertAllowedFileSignature,
  assertAllowedMimeAndExtension,
  assertValidChecksumSha256,
  assertValidSize,
  ensureUniqueFileName,
  FILE_RETENTION_MS,
  inferFileTypeFromName,
  MAX_FILES_PER_PROJECT,
  STALE_PENDING_UPLOAD_MS,
} from "./lib/filePolicy";
import { syncProjectAttachmentMirror } from "./lib/projectAttachments";
import { fileTabValidator } from "./lib/validators";
import { assertFiniteEpochMs, parseDisplayDateEpochMs } from "./lib/dateNormalization";

const UPLOAD_SOURCE_VALIDATOR = v.union(v.literal("upload"), v.literal("importedAttachment"));
const FINALIZE_PROJECT_UPLOAD_ARGS = {
  projectPublicId: v.string(),
  tab: fileTabValidator,
  name: v.string(),
  mimeType: v.string(),
  sizeBytes: v.number(),
  checksumSha256: v.string(),
  storageId: v.id("_storage"),
  displayDateEpochMs: v.optional(v.number()),
  source: v.optional(UPLOAD_SOURCE_VALIDATOR),
} as const;

const FINALIZE_PENDING_DRAFT_UPLOAD_ARGS = {
  workspaceSlug: v.string(),
  draftSessionId: v.string(),
  name: v.string(),
  mimeType: v.string(),
  sizeBytes: v.number(),
  checksumSha256: v.string(),
  storageId: v.id("_storage"),
} as const;

const internalFinalizeProjectUploadRef = makeFunctionReference<"mutation">(
  "files:internalFinalizeProjectUpload",
);
const internalFinalizePendingDraftAttachmentUploadRef = makeFunctionReference<"mutation">(
  "files:internalFinalizePendingDraftAttachmentUpload",
);

const mapProjectFile = (file: Doc<"projectFiles">) => ({
  id: file._id,
  projectPublicId: file.projectPublicId,
  tab: file.tab,
  name: file.name,
  type: file.type,
  displayDateEpochMs: file.displayDateEpochMs,
  thumbnailRef: file.thumbnailRef ?? null,
  mimeType: file.mimeType ?? null,
  sizeBytes: file.sizeBytes ?? null,
  downloadable: file.storageId != null,
  createdAt: file.createdAt,
  updatedAt: file.updatedAt,
});

const normalizeMimeType = (value: string) => value.trim().toLowerCase();

const FILE_SIGNATURE_MAX_BYTES = 32;

const validateFileSignature = async (
  ctx: Pick<ActionCtx, "storage">,
  storageId: Id<"_storage">,
  name: string,
) => {
  if (!name.toLowerCase().endsWith(".fig")) {
    return;
  }

  const blob = await ctx.storage.get(storageId);
  if (!blob) {
    throw new ConvexError("Uploaded file not found");
  }

  const filePrefixBytes = new Uint8Array(
    await blob.slice(0, FILE_SIGNATURE_MAX_BYTES).arrayBuffer(),
  );
  assertAllowedFileSignature(name, filePrefixBytes);
};

const validateStorageMetadata = async (
  ctx: QueryCtx | MutationCtx,
  args: {
    storageId: Id<"_storage">;
    name: string;
    sizeBytes: number;
    checksumSha256: string;
    mimeType: string;
  },
) => {
  const metadata = await ctx.db.system.get(args.storageId);
  if (!metadata) {
    throw new ConvexError("Uploaded file not found");
  }

  if (metadata.size !== args.sizeBytes) {
    throw new ConvexError("Uploaded file size mismatch");
  }

  const contentType = metadata.contentType;
  if (typeof contentType === "string" && contentType.trim().length > 0) {
    const expectedMime = normalizeMimeType(args.mimeType);
    const actualMime = normalizeMimeType(contentType);
    if (actualMime !== expectedMime) {
      throw new ConvexError("Uploaded file type mismatch");
    }
  }

  const normalizedChecksum = args.checksumSha256.toLowerCase();
  const storageChecksum = typeof metadata.sha256 === "string" ? metadata.sha256.toLowerCase() : "";
  if (storageChecksum.length === 64 && storageChecksum !== normalizedChecksum) {
    throw new ConvexError("Uploaded file checksum mismatch");
  }
};

const collectActiveProjectFiles = async (
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
) => {
  const files = await ctx.db
    .query("projectFiles")
    .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
    .collect();
  return files.filter((file) => file.deletedAt == null);
};

const projectAllowsFileMutations = (project: Doc<"projects">) =>
  project.deletedAt == null
  && project.archived !== true
  && project.status !== "Completed"
  && project.completedAt == null;

const assertProjectAllowsFileMutations = (project: Doc<"projects">) => {
  if (!projectAllowsFileMutations(project)) {
    throw new ConvexError("Files can only be modified for active projects");
  }
};

const finalizeProjectUploadCore = async (
  ctx: MutationCtx,
  args: {
    projectPublicId: string;
    tab: "Assets" | "Contract" | "Attachments";
    name: string;
    mimeType: string;
    sizeBytes: number;
    checksumSha256: string;
    storageId: Id<"_storage">;
    displayDateEpochMs?: number;
    source?: "upload" | "importedAttachment";
  },
) => {
  const { project } = await requireProjectRole(ctx, args.projectPublicId, "member");
  assertProjectAllowsFileMutations(project);

  const normalizedMimeType = normalizeMimeType(args.mimeType);
  const trimmedName = args.name.trim();

  let fileId: Id<"projectFiles"> | null = null;
  try {
    if (trimmedName.length === 0) {
      throw new ConvexError("File name is required");
    }

    assertValidSize(args.sizeBytes);
    assertValidChecksumSha256(args.checksumSha256);
    assertAllowedMimeAndExtension(trimmedName, normalizedMimeType);
    await validateStorageMetadata(ctx, {
      storageId: args.storageId,
      name: trimmedName,
      sizeBytes: args.sizeBytes,
      checksumSha256: args.checksumSha256,
      mimeType: normalizedMimeType,
    });

    const now = Date.now();
    const parsedDisplayDateEpochMs = parseDisplayDateEpochMs(args.displayDateEpochMs, now);
    const displayDateEpochMs = assertFiniteEpochMs(parsedDisplayDateEpochMs, "displayDateEpochMs");
    const activeFiles = await collectActiveProjectFiles(ctx, project._id);

    if (activeFiles.length >= MAX_FILES_PER_PROJECT) {
      throw new ConvexError("File limit reached for this project");
    }

    const existingNamesForTab = activeFiles
      .filter((file) => file.tab === args.tab)
      .map((file) => file.name);
    const finalName = ensureUniqueFileName(trimmedName, existingNamesForTab);
    const source = args.source ?? "upload";

    fileId = await ctx.db.insert("projectFiles", {
      workspaceId: project.workspaceId,
      projectId: project._id,
      projectPublicId: project.publicId,
      projectDeletedAt: project.deletedAt ?? null,
      tab: args.tab,
      name: finalName,
      type: inferFileTypeFromName(finalName),
      storageId: args.storageId,
      mimeType: normalizedMimeType,
      sizeBytes: args.sizeBytes,
      checksumSha256: args.checksumSha256.toLowerCase(),
      displayDateEpochMs,
      source,
      deletedAt: null,
      purgeAfterAt: null,
      createdAt: now,
      updatedAt: now,
    });

    if (args.tab === "Attachments") {
      await syncProjectAttachmentMirror(ctx, project);
    }

    return {
      fileId,
      name: finalName,
      type: inferFileTypeFromName(finalName),
      projectPublicId: project.publicId,
    };
  } catch (error) {
    if (fileId) {
      try {
        await ctx.db.delete(fileId);
      } catch {
        // best effort rollback
      }
    }
    try {
      await ctx.storage.delete(args.storageId);
    } catch {
      // best effort rollback
    }
    throw error;
  }
};

const getWorkspaceBySlug = async (
  ctx: QueryCtx | MutationCtx,
  workspaceSlug: string,
) => {
  const workspace = await ctx.db
    .query("workspaces")
    .withIndex("by_slug", (q) => q.eq("slug", workspaceSlug))
    .unique();

  if (!workspace) {
    throw new ConvexError("Workspace not found");
  }
  if (workspace.deletedAt != null) {
    throw new ConvexError("Workspace not found");
  }

  return workspace;
};

export const listForWorkspace = query({
  args: {
    workspaceSlug: v.string(),
    projectPublicId: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });

    const normalizedProjectPublicId = typeof args.projectPublicId === "string"
      ? args.projectPublicId.trim()
      : "";
    const paginated = normalizedProjectPublicId.length > 0
      ? await ctx.db
          .query("projectFiles")
          .withIndex(
            "by_workspace_projectPublicId_active_displayDateEpochMs",
            (q) =>
              q
                .eq("workspaceId", workspace._id)
                .eq("projectPublicId", normalizedProjectPublicId)
                .eq("projectDeletedAt", null)
                .eq("deletedAt", null),
          )
          .order("desc")
          .paginate(args.paginationOpts)
      : await ctx.db
          .query("projectFiles")
          .withIndex(
            "by_workspace_projectDeletedAt_deletedAt_displayDateEpochMs",
            (q) =>
              q
                .eq("workspaceId", workspace._id)
                .eq("projectDeletedAt", null)
                .eq("deletedAt", null),
          )
          .order("desc")
          .paginate(args.paginationOpts);

    return {
      ...paginated,
      page: paginated.page.map(mapProjectFile),
    };
  },
});

export const listForProjectPaginated = query({
  args: {
    projectPublicId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const { project } = await requireProjectRole(ctx, args.projectPublicId, "member");
    const paginated = await ctx.db
      .query("projectFiles")
      .withIndex(
        "by_workspace_projectPublicId_active_displayDateEpochMs",
        (q) =>
          q
            .eq("workspaceId", project.workspaceId)
            .eq("projectPublicId", project.publicId)
            .eq("projectDeletedAt", null)
            .eq("deletedAt", null),
      )
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...paginated,
      page: paginated.page.map(mapProjectFile),
    };
  },
});

export const generateUploadUrl = mutation({
  args: {
    workspaceSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });
    const uploadUrl = await ctx.storage.generateUploadUrl();
    return { uploadUrl };
  },
});

export const finalizeProjectUpload = action({
  args: FINALIZE_PROJECT_UPLOAD_ARGS,
  handler: async (ctx, args) => {
    try {
      await validateFileSignature(ctx, args.storageId, args.name.trim());
      return await ctx.runMutation(internalFinalizeProjectUploadRef as any, args);
    } catch (error) {
      try {
        await ctx.storage.delete(args.storageId);
      } catch {
        // best effort rollback
      }
      throw error;
    }
  },
});

export const internalFinalizeProjectUpload = internalMutation({
  args: FINALIZE_PROJECT_UPLOAD_ARGS,
  handler: async (ctx, args) =>
    finalizeProjectUploadCore(ctx, {
      projectPublicId: args.projectPublicId,
      tab: args.tab,
      name: args.name,
      mimeType: args.mimeType,
      sizeBytes: args.sizeBytes,
      checksumSha256: args.checksumSha256,
      storageId: args.storageId,
      displayDateEpochMs: args.displayDateEpochMs,
      source: args.source,
    }),
});

export const finalizePendingDraftAttachmentUpload = action({
  args: FINALIZE_PENDING_DRAFT_UPLOAD_ARGS,
  handler: async (ctx, args) => {
    try {
      await validateFileSignature(ctx, args.storageId, args.name.trim());
      return await ctx.runMutation(internalFinalizePendingDraftAttachmentUploadRef as any, args);
    } catch (error) {
      try {
        await ctx.storage.delete(args.storageId);
      } catch {
        // best effort rollback
      }
      throw error;
    }
  },
});

export const internalFinalizePendingDraftAttachmentUpload = internalMutation({
  args: FINALIZE_PENDING_DRAFT_UPLOAD_ARGS,
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    const { appUser } = await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });

    const normalizedName = args.name.trim();
    const trimmedSessionId = args.draftSessionId.trim();
    if (normalizedName.length === 0) {
      throw new ConvexError("File name is required");
    }
    if (trimmedSessionId.length === 0) {
      throw new ConvexError("Draft session is required");
    }

    const normalizedMimeType = normalizeMimeType(args.mimeType);
    assertValidSize(args.sizeBytes);
    assertValidChecksumSha256(args.checksumSha256);
    assertAllowedMimeAndExtension(normalizedName, normalizedMimeType);
    await validateStorageMetadata(ctx, {
      storageId: args.storageId,
      name: normalizedName,
      sizeBytes: args.sizeBytes,
      checksumSha256: args.checksumSha256,
      mimeType: normalizedMimeType,
    });

    const now = Date.now();
    const pendingUploadId = await ctx.db.insert("pendingFileUploads", {
      workspaceId: workspace._id,
      uploaderUserId: appUser._id,
      draftSessionId: trimmedSessionId,
      name: normalizedName,
      mimeType: normalizedMimeType,
      sizeBytes: args.sizeBytes,
      checksumSha256: args.checksumSha256.toLowerCase(),
      storageId: args.storageId,
      consumedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    return {
      pendingUploadId,
      name: normalizedName,
      type: inferFileTypeFromName(normalizedName),
      mimeType: normalizedMimeType,
      sizeBytes: args.sizeBytes,
    };
  },
});

export const discardPendingUpload = mutation({
  args: {
    pendingUploadId: v.id("pendingFileUploads"),
  },
  handler: async (ctx, args) => {
    const pendingUpload = await ctx.db.get(args.pendingUploadId);
    if (!pendingUpload) {
      return { removed: false };
    }

    const { appUser } = await requireWorkspaceRole(ctx, pendingUpload.workspaceId, "member");
    if (String(pendingUpload.uploaderUserId) !== String(appUser._id)) {
      throw new ConvexError("Forbidden");
    }

    try {
      await ctx.storage.delete(pendingUpload.storageId);
    } catch {
      // best effort cleanup
    }
    await ctx.db.delete(pendingUpload._id);
    return { removed: true };
  },
});

export const discardPendingUploadsForSession = mutation({
  args: {
    workspaceSlug: v.string(),
    draftSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    const { appUser } = await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });

    const pendingUploads = await ctx.db
      .query("pendingFileUploads")
      .withIndex("by_draftSessionId", (q) => q.eq("draftSessionId", args.draftSessionId))
      .collect();

    const scoped = pendingUploads.filter(
      (row: any) =>
        String(row.workspaceId) === String(workspace._id) &&
        String(row.uploaderUserId) === String(appUser._id),
    );

    let removedCount = 0;
    for (const row of scoped) {
      try {
        await ctx.storage.delete(row.storageId);
      } catch {
        // best effort cleanup
      }
      await ctx.db.delete(row._id);
      removedCount += 1;
    }

    return { removedCount };
  },
});

export const getDownloadUrl = query({
  args: {
    fileId: v.id("projectFiles"),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file || file.deletedAt != null || file.storageId == null) {
      throw new ConvexError("File not found");
    }

    await requireProjectRoleById(ctx, file.projectId, "member");
    const url = await ctx.storage.getUrl(file.storageId);
    if (!url) {
      throw new ConvexError("File not found");
    }

    return {
      url,
      name: file.name,
      mimeType: file.mimeType ?? null,
    };
  },
});

// Deprecated compatibility wrapper for previous metadata-only upload flow.
export const create = mutation({
  args: {
    projectPublicId: v.string(),
    tab: fileTabValidator,
    name: v.string(),
    type: v.optional(v.string()),
    displayDateEpochMs: v.optional(v.number()),
    thumbnailRef: v.optional(v.string()),
    mimeType: v.optional(v.string()),
    sizeBytes: v.optional(v.number()),
    checksumSha256: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    if (!args.storageId || !args.mimeType || !args.sizeBytes || !args.checksumSha256) {
      throw new ConvexError("Deprecated create flow requires storage metadata");
    }

    const result = await finalizeProjectUploadCore(ctx, {
      projectPublicId: args.projectPublicId,
      tab: args.tab,
      name: args.name,
      mimeType: args.mimeType,
      sizeBytes: args.sizeBytes,
      checksumSha256: args.checksumSha256,
      storageId: args.storageId,
      displayDateEpochMs: args.displayDateEpochMs,
      source: "upload",
    });

    return { fileId: result.fileId };
  },
});

export const remove = mutation({
  args: {
    fileId: v.id("projectFiles"),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      return { removed: false };
    }

    const { appUser, project } = await requireProjectRoleById(ctx, file.projectId, "member");
    assertProjectAllowsFileMutations(project);
    if (file.deletedAt != null) {
      return { removed: false };
    }

    const now = Date.now();

    await ctx.db.patch(file._id, {
      deletedAt: now,
      deletedByUserId: appUser._id,
      purgeAfterAt: now + FILE_RETENTION_MS,
      updatedAt: now,
    });

    if (file.tab === "Attachments") {
      await syncProjectAttachmentMirror(ctx, project);
    }

    return { removed: true, projectPublicId: file.projectPublicId };
  },
});

export const runLegacyMetadataCleanup = internalMutation({
  args: {
    dryRun: v.boolean(),
    batchSize: v.optional(v.number()),
    confirmToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.dryRun && args.confirmToken !== "I_KNOW_WHAT_I_AM_DOING") {
      throw new ConvexError("confirmToken must be I_KNOW_WHAT_I_AM_DOING for non-dry-run cleanup");
    }
    const batchSize = Math.max(1, Math.min(args.batchSize ?? 100, 200));
    const targetsById = new Map<string, Doc<"projectFiles">>();

    const missingStorageIdRows = await ctx.db
      .query("projectFiles")
      .withIndex("by_storageId", (q) => q.eq("storageId", undefined))
      .take(batchSize);
    for (const file of missingStorageIdRows) {
      if (file.storageId == null) {
        targetsById.set(String(file._id), file);
      }
    }

    if (targetsById.size < batchSize) {
      const remaining = batchSize - targetsById.size;
      const explicitNullStorageRows = await ctx.db
        .query("projectFiles")
        .filter((q) => q.eq(q.field("storageId"), null))
        .take(remaining);
      for (const file of explicitNullStorageRows) {
        if (file.storageId == null) {
          targetsById.set(String(file._id), file);
        }
      }
    }

    const targets = Array.from(targetsById.values()).slice(0, batchSize);

    const affectedAttachmentProjects = new Set<string>();
    let deletedCount = 0;
    if (!args.dryRun) {
      for (const file of targets) {
        await ctx.db.delete(file._id);
        deletedCount += 1;
        if (file.tab === "Attachments") {
          affectedAttachmentProjects.add(file.projectPublicId);
        }
      }

      for (const publicId of affectedAttachmentProjects) {
        const project = await ctx.db
          .query("projects")
          .withIndex("by_publicId", (q) => q.eq("publicId", publicId))
          .unique();
        if (project && project.deletedAt == null) {
          await syncProjectAttachmentMirror(ctx, project);
        }
      }
    }

    return {
      dryRun: args.dryRun,
      scannedCount: targets.length,
      targetCount: targets.length,
      deletedCount,
    };
  },
});

export const internalPurgeDeletedFiles = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const batchSize = 500;
    const filesToPurge = await ctx.db
      .query("projectFiles")
      .withIndex("by_purgeAfterAt", (q) => q.lte("purgeAfterAt", now))
      .order("asc")
      .take(batchSize);

    const affectedAttachmentProjectPublicIds = new Set<string>();
    let purgedFileCount = 0;
    for (const file of filesToPurge) {
      if (file.deletedAt == null || file.purgeAfterAt == null || file.purgeAfterAt > now) {
        continue;
      }
      if (file.storageId) {
        try {
          await ctx.storage.delete(file.storageId);
        } catch {
          // best effort cleanup
        }
      }
      await ctx.db.delete(file._id);
      purgedFileCount += 1;
      if (file.tab === "Attachments") {
        affectedAttachmentProjectPublicIds.add(file.projectPublicId);
      }
    }

    for (const publicId of affectedAttachmentProjectPublicIds) {
      const project = await ctx.db
        .query("projects")
        .withIndex("by_publicId", (q) => q.eq("publicId", publicId))
        .unique();
      if (project && project.deletedAt == null) {
        await syncProjectAttachmentMirror(ctx, project);
      }
    }

    const staleCutoff = now - STALE_PENDING_UPLOAD_MS;
    const stalePendingUploads = await ctx.db
      .query("pendingFileUploads")
      .withIndex("by_createdAt", (q) => q.lte("createdAt", staleCutoff))
      .order("asc")
      .take(batchSize);

    let stalePendingDeletedCount = 0;
    for (const upload of stalePendingUploads) {
      try {
        await ctx.storage.delete(upload.storageId);
      } catch {
        // best effort cleanup
      }
      await ctx.db.delete(upload._id);
      stalePendingDeletedCount += 1;
    }

    return {
      purgedFileCount,
      stalePendingDeletedCount,
    };
  },
});
