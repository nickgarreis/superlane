import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import {
  buildBrandAssetPrefix,
  buildCommentMarker,
  buildDraftSessionPrefix,
  buildFilePrefix,
  buildInvitationPrefix,
  buildOrgMembershipPrefix,
  buildProjectPrefix,
  buildTaskPrefix,
  buildUserPrefix,
  deleteStorageObjectIfPresent,
  getWorkspaceUsers,
  hasPrefix,
  type ResetSummary,
  type SeedOperationArgs,
  type UserDoc,
} from "./devSeedShared";

export const deleteSeedRows = async (
  ctx: MutationCtx,
  args: SeedOperationArgs,
): Promise<ResetSummary> => {
  const projectPrefix = buildProjectPrefix(args.namespace);
  const taskPrefix = buildTaskPrefix(args.namespace);
  const userPrefix = buildUserPrefix(args.namespace);
  const filePrefix = buildFilePrefix(args.namespace);
  const draftSessionPrefix = buildDraftSessionPrefix(args.namespace);
  const invitationPrefix = buildInvitationPrefix(args.namespace);
  const brandAssetPrefix = buildBrandAssetPrefix(args.namespace);
  const orgMembershipPrefix = buildOrgMembershipPrefix(args.namespace);
  const commentMarker = buildCommentMarker(args.namespace);

  const [
    projectRows,
    taskRows,
    commentRows,
    reactionRows,
    fileRows,
    pendingUploadRows,
    brandAssetRows,
    invitationRows,
    membershipRows,
  ] = await Promise.all([
    ctx.db
      .query("projects")
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", args.workspace._id))
      .collect(),
    ctx.db
      .query("tasks")
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", args.workspace._id))
      .collect(),
    ctx.db
      .query("projectComments")
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", args.workspace._id))
      .collect(),
    ctx.db
      .query("commentReactions")
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", args.workspace._id))
      .collect(),
    ctx.db
      .query("projectFiles")
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", args.workspace._id))
      .collect(),
    ctx.db
      .query("pendingFileUploads")
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", args.workspace._id))
      .collect(),
    ctx.db
      .query("workspaceBrandAssets")
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", args.workspace._id))
      .collect(),
    ctx.db
      .query("workspaceInvitations")
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", args.workspace._id))
      .collect(),
    ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", args.workspace._id))
      .collect(),
  ]);

  const seededProjects = projectRows.filter((project) => hasPrefix(project.publicId, projectPrefix));
  const seededProjectPublicIds = new Set(seededProjects.map((project) => project.publicId));
  const seededCommentRows = commentRows.filter(
    (comment) =>
      seededProjectPublicIds.has(comment.projectPublicId) || comment.content.includes(commentMarker),
  );
  const seededCommentIds = new Set(seededCommentRows.map((comment) => String(comment._id)));
  const seededReactions = reactionRows.filter(
    (reaction) =>
      seededCommentIds.has(String(reaction.commentId)) ||
      (reaction.projectPublicId != null && seededProjectPublicIds.has(reaction.projectPublicId)),
  );
  const seededTasks = taskRows.filter(
    (task) => hasPrefix(task.taskId, taskPrefix) || (task.projectPublicId != null && seededProjectPublicIds.has(task.projectPublicId)),
  );
  const seededFiles = fileRows.filter(
    (file) => hasPrefix(file.name, filePrefix) || seededProjectPublicIds.has(file.projectPublicId),
  );
  const seededPendingUploads = pendingUploadRows.filter(
    (upload) => hasPrefix(upload.draftSessionId, draftSessionPrefix) || hasPrefix(upload.name, filePrefix),
  );
  const seededBrandAssets = brandAssetRows.filter((asset) => hasPrefix(asset.name, brandAssetPrefix));
  const seededInvitations = invitationRows.filter(
    (invitation) =>
      hasPrefix(invitation.invitationId, invitationPrefix) ||
      hasPrefix(invitation.email, `${args.namespace}-invite+`),
  );

  const workspaceUsersById = await getWorkspaceUsers(ctx, membershipRows);
  const seededMemberships = membershipRows.filter((membership) => {
    const user = workspaceUsersById.get(String(membership.userId));
    return hasPrefix(user?.workosUserId, userPrefix);
  });
  const seededUsers = seededMemberships
    .map((membership) => workspaceUsersById.get(String(membership.userId)))
    .filter((user): user is UserDoc => user !== undefined);

  const seededNotificationPreferences = (
    await Promise.all(
      seededUsers.map((user) =>
        ctx.db
          .query("notificationPreferences")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .unique(),
      ),
    )
  ).filter((preference): preference is Doc<"notificationPreferences"> => preference !== null);

  const seededOrganizationMemberships = args.workspace.workosOrganizationId
    ? (
      await ctx.db
        .query("workosOrganizationMemberships")
        .withIndex("by_workosOrganizationId", (q) =>
          q.eq("workosOrganizationId", args.workspace.workosOrganizationId as string)
        )
        .collect()
    ).filter(
      (membership) =>
        hasPrefix(membership.membershipId, orgMembershipPrefix) ||
        hasPrefix(membership.workosUserId, userPrefix),
    )
    : [];

  for (const reaction of seededReactions) {
    await ctx.db.delete(reaction._id);
  }
  for (const comment of seededCommentRows) {
    await ctx.db.delete(comment._id);
  }
  for (const task of seededTasks) {
    await ctx.db.delete(task._id);
  }
  for (const file of seededFiles) {
    await deleteStorageObjectIfPresent(ctx, file.storageId);
    await ctx.db.delete(file._id);
  }
  for (const upload of seededPendingUploads) {
    await deleteStorageObjectIfPresent(ctx, upload.storageId);
    await ctx.db.delete(upload._id);
  }
  for (const asset of seededBrandAssets) {
    await deleteStorageObjectIfPresent(ctx, asset.storageId);
    await ctx.db.delete(asset._id);
  }
  for (const invitation of seededInvitations) {
    await ctx.db.delete(invitation._id);
  }
  for (const organizationMembership of seededOrganizationMemberships) {
    await ctx.db.delete(organizationMembership._id);
  }
  for (const project of seededProjects) {
    await ctx.db.delete(project._id);
  }
  for (const preference of seededNotificationPreferences) {
    await ctx.db.delete(preference._id);
  }
  for (const membership of seededMemberships) {
    await ctx.db.delete(membership._id);
  }
  for (const user of seededUsers) {
    await ctx.db.delete(user._id);
  }

  return {
    workspaceSlug: args.workspace.slug,
    profile: args.profile,
    namespace: args.namespace,
    deleted: {
      workosOrganizationMemberships: seededOrganizationMemberships.length,
      invitations: seededInvitations.length,
      reactions: seededReactions.length,
      comments: seededCommentRows.length,
      files: seededFiles.length,
      pendingUploads: seededPendingUploads.length,
      brandAssets: seededBrandAssets.length,
      tasks: seededTasks.length,
      projects: seededProjects.length,
      notificationPreferences: seededNotificationPreferences.length,
      workspaceMembers: seededMemberships.length,
      users: seededUsers.length,
    },
  };
};
