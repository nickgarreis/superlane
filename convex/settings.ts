import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { action, internalMutation, internalQuery, mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { authKit } from "./auth";
import { requireAuthUser, requireWorkspaceRole } from "./lib/auth";
import { hasRequiredWorkspaceRole } from "./lib/rbac";
import {
  assertAllowedMimeAndExtension,
  assertValidChecksumSha256,
  assertValidSize,
  ensureUniqueFileName,
  inferFileTypeFromName,
} from "./lib/filePolicy";
import { api, internal } from "./_generated/api";
import { logError, logInfo } from "./lib/logging";
import { DEFAULT_NOTIFICATION_EVENTS, normalizeNotificationEvents } from "./lib/notificationPreferences";

const TWO_MB_IN_BYTES = 2 * 1024 * 1024;

const AVATAR_ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
]);

const WORKSPACE_LOGO_ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
]);

const normalizeMimeType = (value: string) => value.trim().toLowerCase();

type WorkspaceDoc = Doc<"workspaces">;
type WorkspaceMemberDoc = Doc<"workspaceMembers">;
type UserDoc = Doc<"users">;
type SettingsCtx = QueryCtx | MutationCtx;

const computeDisplayName = (firstName?: string, lastName?: string, fallbackEmail?: string) => {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  return fullName.length > 0 ? fullName : (fallbackEmail ?? "Unknown user");
};

const getWorkspaceBySlug = async (ctx: SettingsCtx, slug: string): Promise<WorkspaceDoc> => {
  const workspace = await ctx.db
    .query("workspaces")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();

  if (!workspace || workspace.deletedAt != null) {
    throw new ConvexError("Workspace not found");
  }

  return workspace;
};

const validateStorageMetadata = async (
  ctx: SettingsCtx,
  args: {
    storageId: Id<"_storage">;
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

const getResolvedAvatarUrl = async (ctx: QueryCtx, user: UserDoc): Promise<string | null> => {
  if (typeof user.avatarUrl === "string" && user.avatarUrl.trim().length > 0) {
    return user.avatarUrl;
  }
  if (user.avatarStorageId) {
    return (await ctx.storage.getUrl(user.avatarStorageId)) ?? null;
  }
  return null;
};

const workspaceRoleValidator = v.union(v.literal("admin"), v.literal("member"));

const resolveCompanySettingsAccess = async (
  ctx: QueryCtx,
  workspaceSlug: string,
) => {
  const workspace = await getWorkspaceBySlug(ctx, workspaceSlug);
  const access = await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });
  return { workspace, access };
};

const mapCompanySummary = (workspace: WorkspaceDoc, role: "owner" | "admin" | "member") => ({
  workspace: {
    id: String(workspace._id),
    slug: workspace.slug,
    name: workspace.name,
    plan: workspace.plan,
    logo: workspace.logo ?? null,
    logoColor: workspace.logoColor ?? null,
    logoText: workspace.logoText ?? null,
    workosOrganizationId: workspace.workosOrganizationId ?? null,
  },
  capability: {
    hasOrganizationLink: Boolean(workspace.workosOrganizationId),
    canManageWorkspaceGeneral: hasRequiredWorkspaceRole(role, "admin"),
    canManageMembers: hasRequiredWorkspaceRole(role, "admin"),
    canManageBrandAssets: hasRequiredWorkspaceRole(role, "admin"),
    canDeleteWorkspace: role === "owner",
  },
  viewerRole: role,
});

const mapMembershipRowsToMembers = async (ctx: QueryCtx, membershipRows: WorkspaceMemberDoc[]) => {
  const uniqueUserIds = Array.from(new Set(membershipRows.map((membership) => String(membership.userId))));
  const userRows = await Promise.all(uniqueUserIds.map(async (userId) => {
    const sampleMembership = membershipRows.find((membership) => String(membership.userId) === userId);
    if (!sampleMembership) {
      return null;
    }
    const user = await ctx.db.get(sampleMembership.userId);
    if (!user) {
      return null;
    }
    return [userId, user] as const;
  }));
  const userById = new Map(userRows.filter((entry): entry is readonly [string, UserDoc] => entry !== null));
  const avatarByUserId = new Map<string, string | null>(
    await Promise.all(Array.from(userById.entries()).map(async ([userId, user]) => [
      userId,
      await getResolvedAvatarUrl(ctx, user),
    ] as const)),
  );

  return membershipRows.map((membership) => {
    const user = userById.get(String(membership.userId));
    if (!user) {
      return null;
    }
    return {
      userId: String(user._id),
      name: user.name,
      email: user.email ?? "",
      role: membership.role,
      status: membership.status,
      avatarUrl: avatarByUserId.get(String(membership.userId)) ?? null,
    };
  }).filter((member): member is NonNullable<typeof member> => member !== null);
};

export const getAccountSettings = query({
  args: {},
  handler: async (ctx) => {
    const { appUser } = await requireAuthUser(ctx);

    return {
      firstName: appUser.firstName ?? "",
      lastName: appUser.lastName ?? "",
      email: appUser.email ?? "",
      avatarUrl: await getResolvedAvatarUrl(ctx, appUser),
    };
  },
});

export const getNotificationPreferences = query({
  args: {},
  handler: async (ctx) => {
    const { appUser } = await requireAuthUser(ctx);

    const row = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", appUser._id))
      .unique();

    if (!row) {
      return {
        events: DEFAULT_NOTIFICATION_EVENTS,
        exists: false,
      };
    }

    return {
      events: normalizeNotificationEvents(row as any),
      exists: true,
    };
  },
});

export const saveNotificationPreferences = mutation({
  args: {
    events: v.object({
      eventNotifications: v.boolean(),
      teamActivities: v.boolean(),
      productUpdates: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const { appUser } = await requireAuthUser(ctx);
    const existing = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", appUser._id))
      .unique();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        events: args.events,
        channels: undefined,
        updatedAt: now,
      });
      return { updated: true };
    }

    await ctx.db.insert("notificationPreferences", {
      userId: appUser._id,
      events: args.events,
      createdAt: now,
      updatedAt: now,
    });

    return { updated: true };
  },
});

export const generateAvatarUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuthUser(ctx);
    return {
      uploadUrl: await ctx.storage.generateUploadUrl(),
    };
  },
});

export const finalizeAvatarUpload = mutation({
  args: {
    storageId: v.id("_storage"),
    mimeType: v.string(),
    sizeBytes: v.number(),
    checksumSha256: v.string(),
  },
  handler: async (ctx, args) => {
    const { appUser } = await requireAuthUser(ctx);

    const normalizedMimeType = normalizeMimeType(args.mimeType);

    try {
      if (!AVATAR_ALLOWED_MIME.has(normalizedMimeType)) {
        throw new ConvexError("Unsupported avatar file type");
      }
      assertValidChecksumSha256(args.checksumSha256);
      if (!Number.isFinite(args.sizeBytes) || args.sizeBytes <= 0) {
        throw new ConvexError("Invalid file size");
      }
      if (args.sizeBytes > TWO_MB_IN_BYTES) {
        throw new ConvexError("Avatar exceeds max size of 2MB");
      }

      await validateStorageMetadata(ctx, {
        storageId: args.storageId,
        sizeBytes: args.sizeBytes,
        checksumSha256: args.checksumSha256,
        mimeType: normalizedMimeType,
      });

      const previousStorageId = appUser.avatarStorageId ?? null;
      const now = Date.now();
      const resolvedUrl = (await ctx.storage.getUrl(args.storageId)) ?? undefined;
      await ctx.db.patch(appUser._id, {
        avatarStorageId: args.storageId,
        avatarUrl: resolvedUrl,
        updatedAt: now,
      });

      if (previousStorageId && String(previousStorageId) !== String(args.storageId)) {
        await ctx.storage.delete(previousStorageId);
      }

      return {
        avatarUrl: resolvedUrl ?? null,
      };
    } catch (error) {
      await ctx.storage.delete(args.storageId);
      throw error;
    }
  },
});

export const removeAvatar = mutation({
  args: {},
  handler: async (ctx) => {
    const { appUser } = await requireAuthUser(ctx);
    const previousStorageId = appUser.avatarStorageId ?? null;

    await ctx.db.patch(appUser._id, {
      avatarStorageId: undefined,
      avatarUrl: undefined,
      updatedAt: Date.now(),
    });

    if (previousStorageId) {
      await ctx.storage.delete(previousStorageId);
    }

    return { removed: true };
  },
});

export const getCompanySettingsSummary = query({
  args: {
    workspaceSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { workspace, access } = await resolveCompanySettingsAccess(ctx, args.workspaceSlug);
    return mapCompanySummary(workspace, access.membership.role);
  },
});

export const listCompanyMembers = query({
  args: {
    workspaceSlug: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const { workspace } = await resolveCompanySettingsAccess(ctx, args.workspaceSlug);
    const paginated = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_status_joinedAt", (q) =>
        q.eq("workspaceId", workspace._id).eq("status", "active"))
      .paginate(args.paginationOpts);

    const members = await mapMembershipRowsToMembers(ctx, paginated.page);
    return {
      ...paginated,
      page: members,
    };
  },
});

export const listPendingInvitations = query({
  args: {
    workspaceSlug: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const { workspace } = await resolveCompanySettingsAccess(ctx, args.workspaceSlug);
    const paginated = await ctx.db
      .query("workspaceInvitations")
      .withIndex("by_workspace_state_createdAt", (q) =>
        q.eq("workspaceId", workspace._id).eq("state", "pending"))
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...paginated,
      page: paginated.page.map((invitation: any) => ({
        invitationId: invitation.invitationId,
        email: invitation.email,
        state: invitation.state,
        requestedRole: invitation.requestedRole ?? "member",
        expiresAt: invitation.expiresAt,
      })),
    };
  },
});

export const listBrandAssets = query({
  args: {
    workspaceSlug: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const { workspace } = await resolveCompanySettingsAccess(ctx, args.workspaceSlug);
    const paginated = await ctx.db
      .query("workspaceBrandAssets")
      .withIndex("by_workspace_deletedAt_displayDateEpochMs", (q) =>
        q.eq("workspaceId", workspace._id).eq("deletedAt", null))
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...paginated,
      page: paginated.page.map((asset: any) => ({
        id: String(asset._id),
        name: asset.name,
        type: asset.type,
        displayDateEpochMs: asset.displayDateEpochMs,
        sizeBytes: asset.sizeBytes,
        mimeType: asset.mimeType,
        downloadUrl: null,
      })),
    };
  },
});

export const getBrandAssetDownloadUrl = query({
  args: {
    workspaceSlug: v.string(),
    brandAssetId: v.id("workspaceBrandAssets"),
  },
  handler: async (ctx, args) => {
    const { workspace } = await resolveCompanySettingsAccess(ctx, args.workspaceSlug);
    const asset = await ctx.db.get(args.brandAssetId);
    if (!asset || String(asset.workspaceId) !== String(workspace._id) || asset.deletedAt != null) {
      throw new ConvexError("Brand asset not found");
    }

    return {
      downloadUrl: (await ctx.storage.getUrl(asset.storageId)) ?? null,
    };
  },
});

export const updateWorkspaceGeneral = mutation({
  args: {
    workspaceSlug: v.string(),
    name: v.optional(v.string()),
    logo: v.optional(v.string()),
    logoColor: v.optional(v.string()),
    logoText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    const { appUser } = await requireWorkspaceRole(ctx, workspace._id, "admin", { workspace });

    const patch: Record<string, unknown> = {
      updatedAt: Date.now(),
      updatedByUserId: appUser._id,
    };

    if (args.name !== undefined) patch.name = args.name;
    if (args.logo !== undefined) patch.logo = args.logo;
    if (args.logoColor !== undefined) patch.logoColor = args.logoColor;
    if (args.logoText !== undefined) patch.logoText = args.logoText;

    await ctx.db.patch(workspace._id, patch);

    return { updated: true };
  },
});

export const generateWorkspaceLogoUploadUrl = mutation({
  args: {
    workspaceSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    await requireWorkspaceRole(ctx, workspace._id, "admin", { workspace });

    return {
      uploadUrl: await ctx.storage.generateUploadUrl(),
    };
  },
});

export const finalizeWorkspaceLogoUpload = mutation({
  args: {
    workspaceSlug: v.string(),
    storageId: v.id("_storage"),
    mimeType: v.string(),
    sizeBytes: v.number(),
    checksumSha256: v.string(),
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    const { appUser } = await requireWorkspaceRole(ctx, workspace._id, "admin", { workspace });

    const normalizedMimeType = normalizeMimeType(args.mimeType);

    try {
      if (!WORKSPACE_LOGO_ALLOWED_MIME.has(normalizedMimeType)) {
        throw new ConvexError("Unsupported workspace logo file type. Use PNG, JPG, GIF, or WebP.");
      }
      assertValidChecksumSha256(args.checksumSha256);
      if (!Number.isFinite(args.sizeBytes) || args.sizeBytes <= 0) {
        throw new ConvexError("Invalid file size");
      }
      if (args.sizeBytes > TWO_MB_IN_BYTES) {
        throw new ConvexError("Workspace logo exceeds max size of 2MB");
      }

      await validateStorageMetadata(ctx, {
        storageId: args.storageId,
        sizeBytes: args.sizeBytes,
        checksumSha256: args.checksumSha256,
        mimeType: normalizedMimeType,
      });

      const previousStorageId = workspace.logoStorageId ?? null;
      const now = Date.now();
      const resolvedUrl = (await ctx.storage.getUrl(args.storageId)) ?? undefined;

      await ctx.db.patch(workspace._id, {
        logo: resolvedUrl,
        logoStorageId: args.storageId,
        updatedAt: now,
        updatedByUserId: appUser._id,
      });

      if (previousStorageId && String(previousStorageId) !== String(args.storageId)) {
        await ctx.storage.delete(previousStorageId);
      }

      return {
        logoUrl: resolvedUrl ?? null,
      };
    } catch (error) {
      await ctx.storage.delete(args.storageId);
      throw error;
    }
  },
});

export const removeWorkspaceLogo = mutation({
  args: {
    workspaceSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    const { appUser } = await requireWorkspaceRole(ctx, workspace._id, "admin", { workspace });

    const previousStorageId = workspace.logoStorageId ?? null;
    const now = Date.now();

    await ctx.db.patch(workspace._id, {
      logo: undefined,
      logoStorageId: undefined,
      logoColor: undefined,
      logoText: undefined,
      updatedAt: now,
      updatedByUserId: appUser._id,
    });

    if (previousStorageId) {
      await ctx.storage.delete(previousStorageId);
    }

    return { removed: true };
  },
});

export const generateBrandAssetUploadUrl = mutation({
  args: {
    workspaceSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    await requireWorkspaceRole(ctx, workspace._id, "admin", { workspace });

    return {
      uploadUrl: await ctx.storage.generateUploadUrl(),
    };
  },
});

export const finalizeBrandAssetUpload = mutation({
  args: {
    workspaceSlug: v.string(),
    name: v.string(),
    mimeType: v.string(),
    sizeBytes: v.number(),
    checksumSha256: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    const { appUser } = await requireWorkspaceRole(ctx, workspace._id, "admin", { workspace });

    const trimmedName = args.name.trim();
    const normalizedMimeType = normalizeMimeType(args.mimeType);

    try {
      if (!trimmedName) {
        throw new ConvexError("File name is required");
      }

      assertValidSize(args.sizeBytes);
      assertValidChecksumSha256(args.checksumSha256);
      assertAllowedMimeAndExtension(trimmedName, normalizedMimeType);

      await validateStorageMetadata(ctx, {
        storageId: args.storageId,
        sizeBytes: args.sizeBytes,
        checksumSha256: args.checksumSha256,
        mimeType: normalizedMimeType,
      });

      const existing = await ctx.db
        .query("workspaceBrandAssets")
        .withIndex("by_workspace_deletedAt", (q) => q.eq("workspaceId", workspace._id).eq("deletedAt", null))
        .collect();

      const finalName = ensureUniqueFileName(trimmedName, existing.map((entry: any) => entry.name));
      const now = Date.now();

      const assetId = await ctx.db.insert("workspaceBrandAssets", {
        workspaceId: workspace._id,
        name: finalName,
        type: inferFileTypeFromName(finalName),
        storageId: args.storageId,
        mimeType: normalizedMimeType,
        sizeBytes: args.sizeBytes,
        checksumSha256: args.checksumSha256.toLowerCase(),
        displayDateEpochMs: now,
        createdByUserId: appUser._id,
        deletedAt: null,
        createdAt: now,
        updatedAt: now,
      });

      return {
        id: String(assetId),
        name: finalName,
      };
    } catch (error) {
      await ctx.storage.delete(args.storageId);
      throw error;
    }
  },
});

export const removeBrandAsset = mutation({
  args: {
    workspaceSlug: v.string(),
    brandAssetId: v.id("workspaceBrandAssets"),
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    const { appUser } = await requireWorkspaceRole(ctx, workspace._id, "admin", { workspace });

    const asset = await ctx.db.get(args.brandAssetId);
    if (!asset || String(asset.workspaceId) !== String(workspace._id) || asset.deletedAt != null) {
      throw new ConvexError("Brand asset not found");
    }

    await ctx.db.patch(asset._id, {
      deletedAt: Date.now(),
      deletedByUserId: appUser._id,
      updatedAt: Date.now(),
    });

    await ctx.storage.delete(asset.storageId);

    return { removed: true };
  },
});

export const softDeleteWorkspace = mutation({
  args: {
    workspaceSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    const { appUser } = await requireWorkspaceRole(ctx, workspace._id, "owner", { workspace });

    const now = Date.now();

    await ctx.db.patch(workspace._id, {
      deletedAt: now,
      deletedByUserId: appUser._id,
      updatedAt: now,
      updatedByUserId: appUser._id,
    });

    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", workspace._id))
      .collect();

    await Promise.all(
      memberships.map((membership: any) =>
        ctx.db.patch(membership._id, {
          status: "removed",
          updatedAt: now,
        }),
      ),
    );

    return { removed: true };
  },
});

export const internalGetWorkspaceManagerContext = internalQuery({
  args: {
    workspaceSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    const { appUser, membership } = await requireWorkspaceRole(ctx, workspace._id, "admin", { workspace });

    return {
      workspaceId: workspace._id,
      workspaceSlug: workspace.slug,
      workosOrganizationId: workspace.workosOrganizationId ?? null,
      actorRole: membership.role,
      actorWorkosUserId: appUser.workosUserId,
    };
  },
});

export const internalGetWorkspaceInvitationContext = internalQuery({
  args: {
    workspaceSlug: v.string(),
    invitationId: v.string(),
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    await requireWorkspaceRole(ctx, workspace._id, "admin", { workspace });

    const invitation = await ctx.db
      .query("workspaceInvitations")
      .withIndex("by_invitationId", (q) => q.eq("invitationId", args.invitationId))
      .unique();

    if (!invitation || String(invitation.workspaceId) !== String(workspace._id)) {
      throw new ConvexError("Invitation not found");
    }

    return {
      workspaceId: workspace._id,
      workosOrganizationId: workspace.workosOrganizationId ?? null,
      requestedRole: invitation.requestedRole ?? "member",
    };
  },
});

export const internalGetWorkspaceRoleChangeContext = internalQuery({
  args: {
    workspaceSlug: v.string(),
    targetUserId: v.id("users"),
    role: workspaceRoleValidator,
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    const { membership: actorMembership } = await requireWorkspaceRole(ctx, workspace._id, "admin", { workspace });

    if (!workspace.workosOrganizationId) {
      throw new ConvexError("Workspace is not linked to WorkOS organization");
    }

    const targetMembership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_user", (q) => q.eq("workspaceId", workspace._id).eq("userId", args.targetUserId))
      .unique();

    if (!targetMembership || targetMembership.status !== "active") {
      throw new ConvexError("Workspace member not found");
    }

    if (targetMembership.role === "owner" && actorMembership.role !== "owner") {
      throw new ConvexError("Forbidden");
    }

    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser) {
      throw new ConvexError("Workspace member not found");
    }

    const orgMembership = await ctx.db
      .query("workosOrganizationMemberships")
      .withIndex("by_workosOrganizationId_workosUserId", (q) =>
        q.eq("workosOrganizationId", workspace.workosOrganizationId).eq("workosUserId", targetUser.workosUserId),
      )
      .unique();

    if (!orgMembership) {
      throw new ConvexError("Organization membership not found");
    }

    return {
      workspaceId: workspace._id,
      targetUserId: targetUser._id,
      organizationMembershipId: orgMembership.membershipId,
    };
  },
});

export const internalGetWorkspaceRemovalContext = internalQuery({
  args: {
    workspaceSlug: v.string(),
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    const { membership: actorMembership } = await requireWorkspaceRole(ctx, workspace._id, "admin", { workspace });

    if (!workspace.workosOrganizationId) {
      throw new ConvexError("Workspace is not linked to WorkOS organization");
    }

    const targetMembership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_user", (q) => q.eq("workspaceId", workspace._id).eq("userId", args.targetUserId))
      .unique();

    if (!targetMembership || targetMembership.status !== "active") {
      throw new ConvexError("Workspace member not found");
    }

    if (targetMembership.role === "owner" && actorMembership.role !== "owner") {
      throw new ConvexError("Forbidden");
    }

    if (targetMembership.role === "owner") {
      throw new ConvexError("Owner cannot be removed in this flow");
    }

    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser) {
      throw new ConvexError("Workspace member not found");
    }

    const orgMembership = await ctx.db
      .query("workosOrganizationMemberships")
      .withIndex("by_workosOrganizationId_workosUserId", (q) =>
        q.eq("workosOrganizationId", workspace.workosOrganizationId).eq("workosUserId", targetUser.workosUserId),
      )
      .unique();

    if (!orgMembership) {
      throw new ConvexError("Organization membership not found");
    }

    return {
      workspaceSlug: workspace.slug,
      workspaceId: workspace._id,
      workosOrganizationId: workspace.workosOrganizationId,
      targetUserId: targetUser._id,
      targetWorkosUserId: targetUser.workosUserId,
      targetRole: targetMembership.role,
      organizationMembershipId: orgMembership.membershipId,
    };
  },
});

export const internalGetCurrentAuthContext = internalQuery({
  args: {},
  handler: async (ctx) => {
    const { appUser } = await requireAuthUser(ctx);
    return {
      userId: appUser._id,
      workosUserId: appUser.workosUserId,
      email: appUser.email ?? null,
    };
  },
});

export const internalApplyAccountProfileUpdate = internalMutation({
  args: {
    userId: v.id("users"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const current = await ctx.db.get(args.userId);
    if (!current) {
      throw new ConvexError("User not found");
    }

    const firstName = args.firstName ?? current.firstName;
    const lastName = args.lastName ?? current.lastName;
    const email = args.email ?? current.email;

    await ctx.db.patch(args.userId, {
      firstName,
      lastName,
      email,
      name: computeDisplayName(firstName, lastName, email),
      updatedAt: Date.now(),
    });
  },
});

export const internalUpsertWorkspaceInvitation = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    workosOrganizationId: v.string(),
    invitationId: v.string(),
    email: v.string(),
    state: v.union(v.literal("pending"), v.literal("accepted"), v.literal("expired"), v.literal("revoked")),
    requestedRole: v.optional(workspaceRoleValidator),
    expiresAt: v.string(),
    inviterWorkosUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("workspaceInvitations")
      .withIndex("by_invitationId", (q) => q.eq("invitationId", args.invitationId))
      .unique();

    const patch = {
      workspaceId: args.workspaceId,
      workosOrganizationId: args.workosOrganizationId,
      invitationId: args.invitationId,
      email: args.email,
      state: args.state,
      requestedRole: args.requestedRole ?? existing?.requestedRole ?? "member",
      expiresAt: args.expiresAt,
      inviterWorkosUserId: args.inviterWorkosUserId,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }

    return ctx.db.insert("workspaceInvitations", {
      ...patch,
      createdAt: now,
    });
  },
});

export const internalApplyWorkspaceInvitationSnapshot = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    workosOrganizationId: v.string(),
    invitations: v.array(v.object({
      invitationId: v.string(),
      email: v.string(),
      state: v.union(v.literal("pending"), v.literal("accepted"), v.literal("expired"), v.literal("revoked")),
      expiresAt: v.string(),
      inviterWorkosUserId: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existingRows = await ctx.db
      .query("workspaceInvitations")
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const byInvitationId = new Map(existingRows.map((row: any) => [row.invitationId, row]));
    const seen = new Set<string>();

    for (const invitation of args.invitations) {
      seen.add(invitation.invitationId);
      const existing = byInvitationId.get(invitation.invitationId);
      const patch = {
        workspaceId: args.workspaceId,
        workosOrganizationId: args.workosOrganizationId,
        invitationId: invitation.invitationId,
        email: invitation.email,
        state: invitation.state,
        requestedRole: existing?.requestedRole ?? "member",
        expiresAt: invitation.expiresAt,
        inviterWorkosUserId: invitation.inviterWorkosUserId,
        updatedAt: now,
      };

      if (existing) {
        await ctx.db.patch(existing._id, patch);
      } else {
        await ctx.db.insert("workspaceInvitations", {
          ...patch,
          createdAt: now,
        });
      }
    }

    await Promise.all(existingRows.map((row: any) => {
      if (seen.has(row.invitationId)) {
        return Promise.resolve();
      }

      if (row.state === "pending") {
        return ctx.db.patch(row._id, {
          state: "revoked",
          updatedAt: now,
        });
      }

      return Promise.resolve();
    }));

    return { updated: args.invitations.length };
  },
});

export const internalPatchWorkspaceMemberRole = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    role: workspaceRoleValidator,
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_user", (q) => q.eq("workspaceId", args.workspaceId).eq("userId", args.userId))
      .unique();

    if (!membership) {
      throw new ConvexError("Workspace member not found");
    }

    await ctx.db.patch(membership._id, {
      role: args.role,
      updatedAt: Date.now(),
    });
  },
});

export const internalRemoveWorkspaceMember = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_user", (q) => q.eq("workspaceId", args.workspaceId).eq("userId", args.userId))
      .unique();

    if (!membership) {
      throw new ConvexError("Workspace member not found");
    }

    await ctx.db.patch(membership._id, {
      status: "removed",
      updatedAt: Date.now(),
    });
  },
});

export const updateAccountProfile = action({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const nextFirstName = args.firstName.trim();
    const nextLastName = args.lastName.trim();
    const nextEmail = args.email.trim().toLowerCase();
    const authContext = await ctx.runQuery(internal.settings.internalGetCurrentAuthContext, {});
    const previousWorkosProfile = await authKit.workos.userManagement.getUser(authContext.workosUserId);

    await authKit.workos.userManagement.updateUser({
      userId: authContext.workosUserId,
      firstName: nextFirstName,
      lastName: nextLastName,
      email: nextEmail,
    });

    try {
      await ctx.runMutation(internal.settings.internalApplyAccountProfileUpdate, {
        userId: authContext.userId,
        firstName: nextFirstName,
        lastName: nextLastName,
        email: nextEmail,
      });
    } catch (error) {
      logError("settings.updateAccountProfile", "Failed to apply local account profile update after WorkOS update", {
        userId: String(authContext.userId),
        workosUserId: authContext.workosUserId,
        error,
      });

      try {
        await authKit.workos.userManagement.updateUser({
          userId: authContext.workosUserId,
          firstName: previousWorkosProfile.firstName ?? undefined,
          lastName: previousWorkosProfile.lastName ?? undefined,
          email: previousWorkosProfile.email,
        });
      } catch (rollbackError) {
        logError("settings.updateAccountProfile", "Failed to rollback WorkOS account profile after local update failure", {
          userId: String(authContext.userId),
          workosUserId: authContext.workosUserId,
          rollbackError,
        });
      }

      throw error;
    }

    return { updated: true };
  },
});

export const inviteWorkspaceMember = action({
  args: {
    workspaceSlug: v.string(),
    email: v.string(),
    role: workspaceRoleValidator,
  },
  handler: async (ctx, args) => {
    const managementContext = await ctx.runQuery(internal.settings.internalGetWorkspaceManagerContext, {
      workspaceSlug: args.workspaceSlug,
    });

    if (!managementContext.workosOrganizationId) {
      throw new ConvexError("Workspace is not linked to WorkOS organization");
    }

    const invitation = await authKit.workos.userManagement.sendInvitation({
      email: args.email.trim().toLowerCase(),
      organizationId: managementContext.workosOrganizationId,
      inviterUserId: managementContext.actorWorkosUserId,
      roleSlug: args.role,
    });

    await ctx.runMutation(internal.settings.internalUpsertWorkspaceInvitation, {
      workspaceId: managementContext.workspaceId,
      workosOrganizationId: managementContext.workosOrganizationId,
      invitationId: invitation.id,
      email: invitation.email,
      state: invitation.state,
      requestedRole: args.role,
      expiresAt: invitation.expiresAt,
      inviterWorkosUserId: invitation.inviterUserId ?? undefined,
    });

    return {
      invitationId: invitation.id,
      state: invitation.state,
    };
  },
});

export const resendWorkspaceInvitation = action({
  args: {
    workspaceSlug: v.string(),
    invitationId: v.string(),
  },
  handler: async (ctx, args) => {
    const invitationContext = await ctx.runQuery(internal.settings.internalGetWorkspaceInvitationContext, {
      workspaceSlug: args.workspaceSlug,
      invitationId: args.invitationId,
    });

    if (!invitationContext.workosOrganizationId) {
      throw new ConvexError("Workspace is not linked to WorkOS organization");
    }

    const invitation = await authKit.workos.userManagement.resendInvitation(args.invitationId);

    await ctx.runMutation(internal.settings.internalUpsertWorkspaceInvitation, {
      workspaceId: invitationContext.workspaceId,
      workosOrganizationId: invitationContext.workosOrganizationId,
      invitationId: invitation.id,
      email: invitation.email,
      state: invitation.state,
      requestedRole: invitationContext.requestedRole,
      expiresAt: invitation.expiresAt,
      inviterWorkosUserId: invitation.inviterUserId ?? undefined,
    });

    return { resent: true };
  },
});

export const revokeWorkspaceInvitation = action({
  args: {
    workspaceSlug: v.string(),
    invitationId: v.string(),
  },
  handler: async (ctx, args) => {
    const invitationContext = await ctx.runQuery(internal.settings.internalGetWorkspaceInvitationContext, {
      workspaceSlug: args.workspaceSlug,
      invitationId: args.invitationId,
    });

    if (!invitationContext.workosOrganizationId) {
      throw new ConvexError("Workspace is not linked to WorkOS organization");
    }

    const invitation = await authKit.workos.userManagement.revokeInvitation(args.invitationId);

    await ctx.runMutation(internal.settings.internalUpsertWorkspaceInvitation, {
      workspaceId: invitationContext.workspaceId,
      workosOrganizationId: invitationContext.workosOrganizationId,
      invitationId: invitation.id,
      email: invitation.email,
      state: invitation.state,
      requestedRole: invitationContext.requestedRole,
      expiresAt: invitation.expiresAt,
      inviterWorkosUserId: invitation.inviterUserId ?? undefined,
    });

    return { revoked: true };
  },
});

export const changeWorkspaceMemberRole = action({
  args: {
    workspaceSlug: v.string(),
    targetUserId: v.id("users"),
    role: workspaceRoleValidator,
  },
  handler: async (ctx, args) => {
    const roleContext = await ctx.runQuery(internal.settings.internalGetWorkspaceRoleChangeContext, {
      workspaceSlug: args.workspaceSlug,
      targetUserId: args.targetUserId,
      role: args.role,
    });

    await authKit.workos.userManagement.updateOrganizationMembership(roleContext.organizationMembershipId, {
      roleSlug: args.role,
    });

    await ctx.runMutation(internal.settings.internalPatchWorkspaceMemberRole, {
      workspaceId: roleContext.workspaceId,
      userId: roleContext.targetUserId,
      role: args.role,
    });

    return { updated: true };
  },
});

export const removeWorkspaceMember = action({
  args: {
    workspaceSlug: v.string(),
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const removalContext = await ctx.runQuery(internal.settings.internalGetWorkspaceRemovalContext, {
      workspaceSlug: args.workspaceSlug,
      targetUserId: args.targetUserId,
    });

    await authKit.workos.userManagement.deleteOrganizationMembership(removalContext.organizationMembershipId);

    try {
      await ctx.runMutation(internal.settings.internalRemoveWorkspaceMember, {
        workspaceId: removalContext.workspaceId,
        userId: removalContext.targetUserId,
      });
    } catch (error) {
      logError("settings.removeWorkspaceMember", "Failed to remove workspace member locally after WorkOS membership deletion", {
        workspaceSlug: removalContext.workspaceSlug,
        targetUserId: String(removalContext.targetUserId),
        organizationMembershipId: removalContext.organizationMembershipId,
        error,
      });

      try {
        await authKit.workos.userManagement.createOrganizationMembership({
          organizationId: removalContext.workosOrganizationId,
          userId: removalContext.targetWorkosUserId,
          roleSlug: removalContext.targetRole,
        });
      } catch (rollbackError) {
        logError("settings.removeWorkspaceMember", "Failed to rollback WorkOS membership deletion", {
          workspaceSlug: removalContext.workspaceSlug,
          targetUserId: String(removalContext.targetUserId),
          organizationMembershipId: removalContext.organizationMembershipId,
          rollbackError,
        });

        try {
          await ctx.scheduler.runAfter(0, api.organizationSync.reconcileWorkspaceOrganizationMemberships, {
            workspaceSlug: removalContext.workspaceSlug,
          });
          logInfo("settings.removeWorkspaceMember", "Enqueued durable organization membership reconciliation job", {
            workspaceSlug: removalContext.workspaceSlug,
            targetUserId: String(removalContext.targetUserId),
          });
        } catch (scheduleError) {
          logError("settings.removeWorkspaceMember", "Failed to enqueue organization membership reconciliation job", {
            workspaceSlug: removalContext.workspaceSlug,
            targetUserId: String(removalContext.targetUserId),
            scheduleError,
          });
        }
      }

      throw error;
    }

    return { removed: true };
  },
});

export const reconcileWorkspaceInvitations = action({
  args: {
    workspaceSlug: v.string(),
  },
  handler: async (ctx, args): Promise<{ synced: number }> => {
    const managementContext: any = await ctx.runQuery(internal.settings.internalGetWorkspaceManagerContext as any, {
      workspaceSlug: args.workspaceSlug,
    });

    if (!managementContext.workosOrganizationId) {
      throw new ConvexError("Workspace is not linked to WorkOS organization");
    }

    const invitations: any[] = await authKit.workos.userManagement
      .listInvitations({
        organizationId: managementContext.workosOrganizationId,
      })
      .then((result) => result.autoPagination());

    const normalized: Array<{
      invitationId: string;
      email: string;
      state: "pending" | "accepted" | "expired" | "revoked";
      expiresAt: string;
      inviterWorkosUserId?: string;
    }> = invitations
      .filter((invitation: any) => invitation.organizationId === managementContext.workosOrganizationId)
      .map((invitation: any) => ({
        invitationId: invitation.id,
        email: invitation.email,
        state: invitation.state,
        expiresAt: invitation.expiresAt,
        inviterWorkosUserId: invitation.inviterUserId ?? undefined,
      }));

    await ctx.runMutation(internal.settings.internalApplyWorkspaceInvitationSnapshot as any, {
      workspaceId: managementContext.workspaceId,
      workosOrganizationId: managementContext.workosOrganizationId,
      invitations: normalized,
    });

    return {
      synced: normalized.length,
    };
  },
});
