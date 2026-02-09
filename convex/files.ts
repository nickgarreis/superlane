import { ConvexError, v } from "convex/values";
import { makeFunctionReference } from "convex/server";
import { action, internalMutation, mutation, query } from "./_generated/server";
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

const UPLOAD_SOURCE_VALIDATOR = v.union(v.literal("upload"), v.literal("importedAttachment"));
const FINALIZE_PROJECT_UPLOAD_ARGS = {
  projectPublicId: v.string(),
  tab: fileTabValidator,
  name: v.string(),
  mimeType: v.string(),
  sizeBytes: v.number(),
  checksumSha256: v.string(),
  storageId: v.id("_storage"),
  displayDate: v.optional(v.string()),
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

const mapProjectFile = (file: any) => ({
  id: file._id,
  projectPublicId: file.projectPublicId,
  tab: file.tab,
  name: file.name,
  type: file.type,
  displayDate: file.displayDate,
  thumbnailRef: file.thumbnailRef ?? null,
  mimeType: file.mimeType ?? null,
  sizeBytes: file.sizeBytes ?? null,
  downloadable: file.storageId != null,
  createdAt: file.createdAt,
  updatedAt: file.updatedAt,
});

const parseDisplayDate = (value: string | undefined, now: number) => {
  const date = new Date(value ?? now);
  if (Number.isNaN(date.getTime())) {
    throw new ConvexError("Invalid displayDate");
  }
  return date.toISOString();
};

const normalizeMimeType = (value: string) => value.trim().toLowerCase();

const FILE_SIGNATURE_MAX_BYTES = 32;

const validateFileSignature = async (ctx: any, storageId: any, name: string) => {
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
  ctx: any,
  args: {
    storageId: any;
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

  const contentType = (metadata as any).contentType;
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

const collectActiveProjectFiles = async (ctx: any, projectId: any) => {
  const files = await ctx.db
    .query("projectFiles")
    .withIndex("by_projectId", (q: any) => q.eq("projectId", projectId))
    .collect();
  return files.filter((file: any) => file.deletedAt == null);
};

const finalizeProjectUploadCore = async (
  ctx: any,
  args: {
    projectPublicId: string;
    tab: "Assets" | "Contract" | "Attachments";
    name: string;
    mimeType: string;
    sizeBytes: number;
    checksumSha256: string;
    storageId: any;
    displayDate?: string;
    source?: "upload" | "importedAttachment";
  },
) => {
  const { project } = await requireProjectRole(ctx, args.projectPublicId, "member");

  const normalizedMimeType = normalizeMimeType(args.mimeType);
  const trimmedName = args.name.trim();

  let fileId: any = null;
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
    const displayDate = parseDisplayDate(args.displayDate, now);
    const activeFiles = await collectActiveProjectFiles(ctx, project._id);

    if (activeFiles.length >= MAX_FILES_PER_PROJECT) {
      throw new ConvexError("File limit reached for this project");
    }

    const existingNamesForTab = activeFiles
      .filter((file: any) => file.tab === args.tab)
      .map((file: any) => file.name);
    const finalName = ensureUniqueFileName(trimmedName, existingNamesForTab);
    const source = args.source ?? "upload";

    fileId = await ctx.db.insert("projectFiles", {
      workspaceId: project.workspaceId,
      projectId: project._id,
      projectPublicId: project.publicId,
      tab: args.tab,
      name: finalName,
      type: inferFileTypeFromName(finalName),
      storageId: args.storageId,
      mimeType: normalizedMimeType,
      sizeBytes: args.sizeBytes,
      checksumSha256: args.checksumSha256.toLowerCase(),
      displayDate,
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

const getWorkspaceBySlug = async (ctx: any, workspaceSlug: string) => {
  const workspace = await ctx.db
    .query("workspaces")
    .withIndex("by_slug", (q: any) => q.eq("slug", workspaceSlug))
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
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_workspaceId", (q: any) => q.eq("workspaceId", workspace._id))
      .collect();
    const activeProjectIds = new Set(
      projects.filter((project: any) => project.deletedAt == null).map((project: any) => String(project._id)),
    );

    const files = await ctx.db
      .query("projectFiles")
      .withIndex("by_workspaceId", (q: any) => q.eq("workspaceId", workspace._id))
      .collect();

    const visibleFiles = files
      .filter(
        (file: any) =>
          activeProjectIds.has(String(file.projectId)) &&
          file.deletedAt == null &&
          file.storageId != null,
      )
      .sort((a: any, b: any) => b.createdAt - a.createdAt);

    return visibleFiles.map(mapProjectFile);
  },
});

export const listForProject = query({
  args: {
    projectPublicId: v.string(),
  },
  handler: async (ctx, args) => {
    const { project } = await requireProjectRole(ctx, args.projectPublicId, "member");
    const files = await ctx.db
      .query("projectFiles")
      .withIndex("by_projectPublicId", (q: any) => q.eq("projectPublicId", project.publicId))
      .collect();

    return files
      .filter((file: any) => file.deletedAt == null && file.storageId != null)
      .sort((a: any, b: any) => b.createdAt - a.createdAt)
      .map(mapProjectFile);
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
      displayDate: args.displayDate,
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
      .withIndex("by_draftSessionId", (q: any) => q.eq("draftSessionId", args.draftSessionId))
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
    displayDate: v.optional(v.string()),
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
      displayDate: args.displayDate,
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
  },
  handler: async (ctx, args) => {
    const batchSize = Math.max(1, Math.min(args.batchSize ?? 500, 2000));
    const files = await ctx.db.query("projectFiles").collect();
    const targets = files
      .filter((file: any) => file.storageId == null)
      .slice(0, batchSize);

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
          .withIndex("by_publicId", (q: any) => q.eq("publicId", publicId))
          .unique();
        if (project && project.deletedAt == null) {
          await syncProjectAttachmentMirror(ctx, project);
        }
      }
    }

    return {
      dryRun: args.dryRun,
      scannedCount: files.length,
      targetCount: targets.length,
      deletedCount,
    };
  },
});

export const internalPurgeDeletedFiles = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const allFiles = await ctx.db.query("projectFiles").collect();
    const filesToPurge = allFiles.filter(
      (file: any) => file.deletedAt != null && file.purgeAfterAt != null && file.purgeAfterAt <= now,
    );

    const affectedAttachmentProjectPublicIds = new Set<string>();
    let purgedFileCount = 0;
    for (const file of filesToPurge) {
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
        .withIndex("by_publicId", (q: any) => q.eq("publicId", publicId))
        .unique();
      if (project && project.deletedAt == null) {
        await syncProjectAttachmentMirror(ctx, project);
      }
    }

    const pendingUploads = await ctx.db.query("pendingFileUploads").collect();
    const staleCutoff = now - STALE_PENDING_UPLOAD_MS;
    const stalePendingUploads = pendingUploads.filter(
      (upload: any) => upload.createdAt <= staleCutoff,
    );

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
