import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  attachmentValidator,
  draftDataValidator,
  fileTabValidator,
  projectStatusValidator,
  reviewCommentValidator,
  taskAssigneeValidator,
} from "./lib/validators";

export default defineSchema({
  users: defineTable({
    workosUserId: v.string(),
    email: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_workosUserId", ["workosUserId"]),

  workspaces: defineTable({
    slug: v.string(),
    name: v.string(),
    plan: v.string(),
    logo: v.optional(v.string()),
    logoColor: v.optional(v.string()),
    logoText: v.optional(v.string()),
    ownerUserId: v.id("users"),
    workosOrganizationId: v.optional(v.string()),
    updatedByUserId: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_ownerUserId", ["ownerUserId"])
    .index("by_workosOrganizationId", ["workosOrganizationId"]),

  workspaceMembers: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
    status: v.union(v.literal("active"), v.literal("invited"), v.literal("removed")),
    joinedAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_workspaceId", ["workspaceId"])
    .index("by_workspace_user", ["workspaceId", "userId"]),

  projects: defineTable({
    publicId: v.string(),
    workspaceId: v.id("workspaces"),
    creatorUserId: v.id("users"),
    name: v.string(),
    description: v.string(),
    category: v.string(),
    scope: v.optional(v.string()),
    deadline: v.optional(v.string()),
    status: projectStatusValidator,
    previousStatus: v.optional(v.union(projectStatusValidator, v.null())),
    archived: v.boolean(),
    archivedAt: v.optional(v.union(v.number(), v.null())),
    completedAt: v.optional(v.union(v.number(), v.null())),
    deletedAt: v.optional(v.union(v.number(), v.null())),
    deletedByUserId: v.optional(v.id("users")),
    updatedByUserId: v.optional(v.id("users")),
    statusUpdatedByUserId: v.optional(v.id("users")),
    archivedByUserId: v.optional(v.id("users")),
    unarchivedByUserId: v.optional(v.id("users")),
    draftData: v.optional(v.union(draftDataValidator, v.null())),
    attachments: v.optional(v.array(attachmentValidator)),
    reviewComments: v.optional(v.array(reviewCommentValidator)),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_publicId", ["publicId"])
    .index("by_workspaceId", ["workspaceId"])
    .index("by_workspace_status", ["workspaceId", "status"])
    .index("by_workspace_archived", ["workspaceId", "archived"]),

  tasks: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    projectPublicId: v.string(),
    taskId: v.string(),
    title: v.string(),
    assignee: taskAssigneeValidator,
    dueDate: v.string(),
    completed: v.boolean(),
    position: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_projectId", ["projectId"])
    .index("by_projectPublicId", ["projectPublicId"])
    .index("by_workspaceId", ["workspaceId"])
    .index("by_workspace_projectPublicId", ["workspaceId", "projectPublicId"]),

  projectFiles: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    projectPublicId: v.string(),
    tab: fileTabValidator,
    name: v.string(),
    type: v.string(),
    storageId: v.optional(v.id("_storage")),
    mimeType: v.optional(v.string()),
    sizeBytes: v.optional(v.number()),
    checksumSha256: v.optional(v.string()),
    displayDate: v.string(),
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
    .index("by_workspace_projectPublicId", ["workspaceId", "projectPublicId"])
    .index("by_workspace_tab", ["workspaceId", "tab"])
    .index("by_purgeAfterAt", ["purgeAfterAt"]),

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
    .index("by_workspaceId", ["workspaceId"])
    .index("by_uploaderUserId", ["uploaderUserId"])
    .index("by_createdAt", ["createdAt"]),

  projectComments: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    projectPublicId: v.string(),
    parentCommentId: v.optional(v.id("projectComments")),
    authorUserId: v.id("users"),
    resolvedByUserId: v.optional(v.id("users")),
    content: v.string(),
    resolved: v.boolean(),
    edited: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_projectId", ["projectId"])
    .index("by_projectPublicId", ["projectPublicId"])
    .index("by_parentCommentId", ["parentCommentId"])
    .index("by_workspaceId", ["workspaceId"])
    .index("by_authorUserId", ["authorUserId"]),

  commentReactions: defineTable({
    commentId: v.id("projectComments"),
    emoji: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_commentId", ["commentId"])
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
