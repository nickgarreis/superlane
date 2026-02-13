import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  attachmentValidator,
  draftDataValidator,
  fileTabValidator,
  projectVisibilityValidator,
  projectStatusValidator,
  reviewCommentValidator,
  taskAssigneeValidator,
} from "./lib/validators";

const notificationEventsValidator = v.object({
  eventNotifications: v.boolean(),
  teamActivities: v.boolean(),
  productUpdates: v.boolean(),
});

const legacyNotificationEventsValidator = v.object({
  productUpdates: v.boolean(),
  teamActivity: v.boolean(),
});

export default defineSchema({
  users: defineTable({
    workosUserId: v.string(),
    email: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
    linkedIdentityProviders: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_workosUserId", ["workosUserId"]),

  workspaces: defineTable({
    slug: v.string(),
    name: v.string(),
    plan: v.string(),
    logo: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
    logoColor: v.optional(v.string()),
    logoText: v.optional(v.string()),
    ownerUserId: v.id("users"),
    workosOrganizationId: v.optional(v.string()),
    deletedAt: v.optional(v.union(v.number(), v.null())),
    deletedByUserId: v.optional(v.id("users")),
    updatedByUserId: v.optional(v.id("users")),
    nextTaskPosition: v.optional(v.number()),
    activityEventCount: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_ownerUserId", ["ownerUserId"])
    .index("by_workosOrganizationId", ["workosOrganizationId"]),

  workspaceMembers: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    nameSnapshot: v.optional(v.string()),
    emailSnapshot: v.optional(v.string()),
    avatarUrlSnapshot: v.optional(v.union(v.string(), v.null())),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
    status: v.union(v.literal("active"), v.literal("invited"), v.literal("removed")),
    pendingRemovalAt: v.optional(v.union(v.number(), v.null())),
    joinedAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_status", ["userId", "status"])
    .index("by_status", ["status"])
    .index("by_workspaceId", ["workspaceId"])
    .index("by_workspace_status_joinedAt", ["workspaceId", "status", "joinedAt"])
    .index("by_workspace_user", ["workspaceId", "userId"]),

  workspaceMemberAuditLogs: defineTable({
    workspaceMemberId: v.id("workspaceMembers"),
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    eventType: v.union(
      v.literal("pending_removal_scheduled"),
      v.literal("pending_removal_cleared"),
      v.literal("removed_after_grace"),
    ),
    reason: v.string(),
    previousStatus: v.union(v.literal("active"), v.literal("invited"), v.literal("removed")),
    nextStatus: v.union(v.literal("active"), v.literal("invited"), v.literal("removed")),
    pendingRemovalAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_workspaceMemberId", ["workspaceMemberId"])
    .index("by_workspaceId", ["workspaceId"])
    .index("by_userId", ["userId"]),

  workspaceActivityEvents: defineTable({
    workspaceId: v.id("workspaces"),
    kind: v.union(
      v.literal("project"),
      v.literal("task"),
      v.literal("collaboration"),
      v.literal("file"),
      v.literal("membership"),
      v.literal("workspace"),
      v.literal("organization"),
    ),
    action: v.string(),
    actorType: v.union(v.literal("user"), v.literal("system")),
    actorUserId: v.optional(v.id("users")),
    actorName: v.string(),
    actorAvatarUrl: v.optional(v.union(v.string(), v.null())),
    projectPublicId: v.optional(v.string()),
    projectName: v.optional(v.string()),
    projectVisibility: v.optional(projectVisibilityValidator),
    projectOwnerUserId: v.optional(v.id("users")),
    taskId: v.optional(v.string()),
    taskTitle: v.optional(v.string()),
    fileName: v.optional(v.string()),
    fileTab: v.optional(fileTabValidator),
    targetUserId: v.optional(v.id("users")),
    targetUserName: v.optional(v.string()),
    targetRole: v.optional(v.union(v.literal("owner"), v.literal("admin"), v.literal("member"))),
    fromValue: v.optional(v.string()),
    toValue: v.optional(v.string()),
    message: v.optional(v.string()),
    errorCode: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_workspace_createdAt", ["workspaceId", "createdAt"])
    .index("by_workspace_kind_createdAt", ["workspaceId", "kind", "createdAt"])
    .index("by_workspace_project_createdAt", ["workspaceId", "projectPublicId", "createdAt"]),

  workspaceActivityInboxStates: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    unreadCount: v.number(),
    markAllCutoffAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace_user", ["workspaceId", "userId"])
    .index("by_workspaceId", ["workspaceId"])
    .index("by_userId", ["userId"]),

  workspaceActivityReadReceipts: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    activityEventId: v.id("workspaceActivityEvents"),
    readAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_workspace_user_activityEvent", ["workspaceId", "userId", "activityEventId"])
    .index("by_workspace_user", ["workspaceId", "userId"]),

  workspaceActivityDismissals: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    activityEventId: v.id("workspaceActivityEvents"),
    dismissedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_workspace_user_activityEvent", ["workspaceId", "userId", "activityEventId"])
    .index("by_workspace_user", ["workspaceId", "userId"]),

  notificationPreferences: defineTable({
    userId: v.id("users"),
    channels: v.optional(
      v.object({
        email: v.boolean(),
        desktop: v.boolean(),
      }),
    ),
    events: v.union(notificationEventsValidator, legacyNotificationEventsValidator),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  workspaceInvitations: defineTable({
    workspaceId: v.id("workspaces"),
    workosOrganizationId: v.string(),
    invitationId: v.string(),
    email: v.string(),
    state: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("expired"),
      v.literal("revoked"),
    ),
    requestedRole: v.optional(v.union(v.literal("admin"), v.literal("member"))),
    expiresAt: v.string(),
    inviterWorkosUserId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspaceId", ["workspaceId"])
    .index("by_invitationId", ["invitationId"])
    .index("by_workspace_state", ["workspaceId", "state"])
    .index("by_workspace_state_createdAt", ["workspaceId", "state", "createdAt"]),

  workspaceBrandAssets: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    type: v.string(),
    storageId: v.id("_storage"),
    mimeType: v.string(),
    sizeBytes: v.number(),
    checksumSha256: v.string(),
    displayDateEpochMs: v.number(),
    // Legacy compatibility for pre-normalization rows.
    displayDate: v.optional(v.union(v.string(), v.null())),
    createdByUserId: v.id("users"),
    deletedAt: v.optional(v.union(v.number(), v.null())),
    deletedByUserId: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspaceId", ["workspaceId"])
    .index("by_workspace_deletedAt", ["workspaceId", "deletedAt"])
    .index("by_workspace_deletedAt_displayDateEpochMs", ["workspaceId", "deletedAt", "displayDateEpochMs"]),

  projects: defineTable({
    publicId: v.string(),
    workspaceId: v.id("workspaces"),
    creatorUserId: v.id("users"),
    creatorSnapshotName: v.optional(v.string()),
    creatorSnapshotAvatarUrl: v.optional(v.string()),
    ownerUserId: v.optional(v.id("users")),
    ownerSnapshotName: v.optional(v.string()),
    ownerSnapshotAvatarUrl: v.optional(v.union(v.string(), v.null())),
    visibility: v.optional(projectVisibilityValidator),
    name: v.string(),
    description: v.string(),
    category: v.string(),
    scope: v.optional(v.string()),
    deadlineEpochMs: v.optional(v.union(v.number(), v.null())),
    // Legacy compatibility for pre-normalization rows.
    deadline: v.optional(v.union(v.string(), v.null())),
    status: projectStatusValidator,
    previousStatus: v.optional(v.union(projectStatusValidator, v.null())),
    lastApprovedAt: v.optional(v.union(v.number(), v.null())),
    archived: v.boolean(),
    archivedAt: v.optional(v.union(v.number(), v.null())),
    completedAt: v.optional(v.union(v.number(), v.null())),
    deletedAt: v.optional(v.union(v.number(), v.null())),
    deletedByUserId: v.optional(v.id("users")),
    updatedByUserId: v.optional(v.id("users")),
    statusUpdatedByUserId: v.optional(v.id("users")),
    archivedByUserId: v.optional(v.id("users")),
    unarchivedByUserId: v.optional(v.union(v.id("users"), v.null())),
    draftData: v.optional(v.union(draftDataValidator, v.null())),
    attachments: v.optional(v.array(attachmentValidator)),
    reviewComments: v.optional(v.array(reviewCommentValidator)),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_publicId", ["publicId"])
    .index("by_workspaceId", ["workspaceId"])
    .index("by_workspace_status", ["workspaceId", "status"])
    .index("by_workspace_archived", ["workspaceId", "archived"])
    .index("by_workspace_deletedAt_updatedAt_createdAt", ["workspaceId", "deletedAt", "updatedAt", "createdAt"])
    .index("by_workspace_archived_deletedAt_updatedAt_createdAt", [
      "workspaceId",
      "archived",
      "deletedAt",
      "updatedAt",
      "createdAt",
    ])
    .index("by_workspace_deadlineEpochMs", ["workspaceId", "deadlineEpochMs"]),

  projectApprovalReads: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    projectPublicId: v.string(),
    lastSeenApprovedAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace_user", ["workspaceId", "userId"])
    .index("by_workspace_user_project", ["workspaceId", "userId", "projectPublicId"]),

  tasks: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.union(v.id("projects"), v.null()),
    projectPublicId: v.union(v.string(), v.null()),
    projectOwnerUserId: v.optional(v.id("users")),
    projectVisibility: v.optional(projectVisibilityValidator),
    projectDeletedAt: v.optional(v.union(v.number(), v.null())),
    taskId: v.string(),
    title: v.string(),
    assignee: taskAssigneeValidator,
    dueDateEpochMs: v.optional(v.union(v.number(), v.null())),
    // Legacy compatibility for pre-normalization rows.
    dueDate: v.optional(v.union(v.string(), v.null())),
    completed: v.boolean(),
    position: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_projectId", ["projectId"])
    .index("by_projectPublicId", ["projectPublicId"])
    .index("by_workspaceId", ["workspaceId"])
    .index("by_workspace_taskId", ["workspaceId", "taskId"])
    .index("by_workspace_position", ["workspaceId", "position"])
    .index("by_workspace_projectDeletedAt_position", ["workspaceId", "projectDeletedAt", "position"])
    .index("by_workspace_projectPublicId", ["workspaceId", "projectPublicId"])
    .index("by_projectPublicId_position", ["projectPublicId", "position"])
    .index("by_project_dueDateEpochMs", ["projectId", "dueDateEpochMs"])
    .index("by_workspace_dueDateEpochMs", ["workspaceId", "dueDateEpochMs"]),

  projectFiles: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    projectPublicId: v.string(),
    projectOwnerUserId: v.optional(v.id("users")),
    projectVisibility: v.optional(projectVisibilityValidator),
    projectDeletedAt: v.optional(v.union(v.number(), v.null())),
    tab: fileTabValidator,
    name: v.string(),
    type: v.string(),
    storageId: v.optional(v.id("_storage")),
    mimeType: v.optional(v.string()),
    sizeBytes: v.optional(v.number()),
    checksumSha256: v.optional(v.string()),
    displayDateEpochMs: v.number(),
    // Legacy compatibility for pre-normalization rows.
    displayDate: v.optional(v.union(v.string(), v.null())),
    thumbnailRef: v.optional(v.string()),
    source: v.optional(v.union(v.literal("upload"), v.literal("importedAttachment"))),
    deletedAt: v.optional(v.union(v.number(), v.null())),
    deletedByUserId: v.optional(v.id("users")),
    purgeAfterAt: v.optional(v.union(v.number(), v.null())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_projectId", ["projectId"])
    .index("by_projectId_deletedAt", ["projectId", "deletedAt"])
    .index("by_projectPublicId", ["projectPublicId"])
    .index("by_workspaceId", ["workspaceId"])
    .index("by_workspace_deletedAt_displayDateEpochMs", ["workspaceId", "deletedAt", "displayDateEpochMs"])
    .index("by_workspace_projectDeletedAt_deletedAt_displayDateEpochMs", ["workspaceId", "projectDeletedAt", "deletedAt", "displayDateEpochMs"])
    .index("by_workspace_projectPublicId", ["workspaceId", "projectPublicId"])
    .index(
      "by_workspace_projectPublicId_active_displayDateEpochMs",
      [
        "workspaceId",
        "projectPublicId",
        "projectDeletedAt",
        "deletedAt",
        "displayDateEpochMs",
      ],
    )
    .index("by_workspace_projectPublicId_deletedAt_displayDateEpochMs", [
      "workspaceId",
      "projectPublicId",
      "deletedAt",
      "displayDateEpochMs",
    ])
    .index("by_workspace_tab", ["workspaceId", "tab"])
    .index("by_storageId", ["storageId"])
    .index("by_purgeAfterAt", ["purgeAfterAt"])
    .index("by_workspace_displayDateEpochMs", ["workspaceId", "displayDateEpochMs"]),

  pendingFileUploads: defineTable({
    workspaceId: v.id("workspaces"),
    uploaderUserId: v.id("users"),
    draftSessionId: v.string(),
    name: v.string(),
    mimeType: v.string(),
    sizeBytes: v.number(),
    checksumSha256: v.string(),
    storageId: v.id("_storage"),
    projectId: v.optional(v.id("projects")),
    projectPublicId: v.optional(v.string()),
    consumedAt: v.optional(v.union(v.number(), v.null())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_draftSessionId", ["draftSessionId"])
    .index("by_workspace_uploader_draftSessionId", [
      "workspaceId",
      "uploaderUserId",
      "draftSessionId",
    ])
    .index("by_workspaceId", ["workspaceId"])
    .index("by_uploaderUserId", ["uploaderUserId"])
    .index("by_createdAt", ["createdAt"]),

  projectComments: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    projectPublicId: v.string(),
    parentCommentId: v.optional(v.id("projectComments")),
    authorUserId: v.id("users"),
    authorSnapshotName: v.optional(v.string()),
    authorSnapshotAvatarUrl: v.optional(v.string()),
    replyCount: v.optional(v.number()),
    reactionSummary: v.optional(v.array(v.object({
      emoji: v.string(),
      userIds: v.array(v.id("users")),
    }))),
    resolvedByUserId: v.optional(v.id("users")),
    content: v.string(),
    resolved: v.boolean(),
    edited: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_projectId", ["projectId"])
    .index("by_projectPublicId", ["projectPublicId"])
    .index("by_projectPublicId_parentCommentId_createdAt", [
      "projectPublicId",
      "parentCommentId",
      "createdAt",
    ])
    .index("by_parentCommentId", ["parentCommentId"])
    .index("by_workspaceId", ["workspaceId"])
    .index("by_authorUserId", ["authorUserId"]),

  commentReactions: defineTable({
    commentId: v.id("projectComments"),
    projectPublicId: v.optional(v.string()),
    workspaceId: v.optional(v.id("workspaces")),
    emoji: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_commentId", ["commentId"])
    .index("by_projectPublicId", ["projectPublicId"])
    .index("by_workspaceId", ["workspaceId"])
    .index("by_comment_emoji", ["commentId", "emoji"])
    .index("by_comment_emoji_user", ["commentId", "emoji", "userId"])
    .index("by_userId", ["userId"]),

  workosOrganizationMemberships: defineTable({
    membershipId: v.string(),
    workosOrganizationId: v.string(),
    workosUserId: v.string(),
    organizationName: v.optional(v.string()),
    roleSlug: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("pending"),
      v.literal("inactive"),
      v.literal("removed"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_membershipId", ["membershipId"])
    .index("by_workosOrganizationId", ["workosOrganizationId"])
    .index("by_workosUserId", ["workosUserId"])
    .index("by_workosOrganizationId_workosUserId", ["workosOrganizationId", "workosUserId"]),
});
