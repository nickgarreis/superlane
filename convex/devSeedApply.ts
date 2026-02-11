import { ConvexError } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { inferFileTypeFromName } from "./lib/filePolicy";
import { syncProjectAttachmentMirror } from "./lib/projectAttachments";
import {
  buildChecksum,
  buildCommentMarker,
  buildFilePrefix,
  buildInvitationPrefix,
  buildProjectPrefix,
  buildTaskPrefix,
  buildUserPrefix,
  DAY_MS,
  HOUR_MS,
  type SeedOperationArgs,
  type SeedSummary,
  type SeedUserBlueprint,
  type WorkspaceDoc,
} from "./devSeedShared";
import {
  buildFileBlueprints,
  buildProjectBlueprints,
  buildTaskBlueprints,
  buildUserBlueprints,
} from "./devSeedBlueprints";
import { deleteSeedRows } from "./devSeedReset";

const upsertSeedUser = async (
  ctx: MutationCtx,
  args: {
    namespace: string;
    workspace: WorkspaceDoc;
    blueprint: SeedUserBlueprint;
    now: number;
  },
) => {
  const workosUserId = `${buildUserPrefix(args.namespace)}${args.blueprint.key}`;
  const email = `${args.namespace}-${args.blueprint.key}@example.com`;
  const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(`${args.namespace}-${args.blueprint.key}`)}`;

  const existing = await ctx.db
    .query("users")
    .withIndex("by_workosUserId", (q) => q.eq("workosUserId", workosUserId))
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, {
      email,
      firstName: args.blueprint.name.split(" ")[0] ?? args.blueprint.name,
      lastName: args.blueprint.name.split(" ").slice(1).join(" ") || undefined,
      name: args.blueprint.name,
      avatarUrl,
      updatedAt: args.now,
    });
  } else {
    await ctx.db.insert("users", {
      workosUserId,
      email,
      firstName: args.blueprint.name.split(" ")[0] ?? args.blueprint.name,
      lastName: args.blueprint.name.split(" ").slice(1).join(" ") || undefined,
      name: args.blueprint.name,
      avatarUrl,
      createdAt: args.now,
      updatedAt: args.now,
    });
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_workosUserId", (q) => q.eq("workosUserId", workosUserId))
    .unique();

  if (!user) {
    throw new ConvexError(`Unable to resolve seeded user ${args.blueprint.key}`);
  }

  const existingMembership = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_workspace_user", (q) => q.eq("workspaceId", args.workspace._id).eq("userId", user._id))
    .unique();

  const membershipPatch = {
    role: args.blueprint.role,
    status: args.blueprint.status,
    pendingRemovalAt: null,
    nameSnapshot: user.name,
    emailSnapshot: user.email ?? "",
    avatarUrlSnapshot: user.avatarUrl ?? null,
    updatedAt: args.now,
  } as const;

  if (existingMembership) {
    await ctx.db.patch(existingMembership._id, membershipPatch);
  } else {
    await ctx.db.insert("workspaceMembers", {
      workspaceId: args.workspace._id,
      userId: user._id,
      joinedAt: args.now,
      createdAt: args.now,
      ...membershipPatch,
    });
  }

  return {
    key: args.blueprint.key,
    role: args.blueprint.role,
    status: args.blueprint.status,
    user,
  };
};

const getNextTaskPosition = async (ctx: MutationCtx, workspaceId: Id<"workspaces">) => {
  const latestTask = await ctx.db
    .query("tasks")
    .withIndex("by_workspace_projectDeletedAt_position", (q) =>
      q.eq("workspaceId", workspaceId).eq("projectDeletedAt", null)
    )
    .order("desc")
    .first();

  return typeof latestTask?.position === "number" ? latestTask.position + 1 : 0;
};

export const applySeedRows = async (
  ctx: MutationCtx,
  args: SeedOperationArgs,
): Promise<SeedSummary> => {
  const reset = await deleteSeedRows(ctx, args);

  const now = Date.now();
  const ownerUser = await ctx.db.get(args.workspace.ownerUserId);
  if (!ownerUser) {
    throw new ConvexError("Workspace owner user was not found");
  }

  const userBlueprints = buildUserBlueprints(args.profile);
  const seededUsers = await Promise.all(
    userBlueprints.map((blueprint) =>
      upsertSeedUser(ctx, {
        namespace: args.namespace,
        workspace: args.workspace,
        blueprint,
        now,
      })
    ),
  );

  const peopleByKey = new Map<string, typeof ownerUser>();
  peopleByKey.set("owner", ownerUser);
  for (const entry of seededUsers) {
    peopleByKey.set(entry.key, entry.user);
  }

  const projectBlueprints = buildProjectBlueprints(args.profile);
  const createdProjects: Array<{
    key: string;
    projectId: Id<"projects">;
    publicId: string;
    status: "Active" | "Draft" | "Review" | "Completed";
    archived: boolean;
  }> = [];

  for (const [index, blueprint] of projectBlueprints.entries()) {
    const creator = peopleByKey.get(blueprint.creatorKey) ?? ownerUser;
    const createdAt = now - (projectBlueprints.length - index) * HOUR_MS;
    const deadlineEpochMs = blueprint.deadlineOffsetDays == null
      ? null
      : now + blueprint.deadlineOffsetDays * DAY_MS;
    const completedAt = blueprint.status === "Completed" ? now - DAY_MS : null;
    const archivedAt = blueprint.archived ? now - (12 * HOUR_MS) : null;
    const publicId = `${buildProjectPrefix(args.namespace)}${index + 1}`;

    const projectId = await ctx.db.insert("projects", {
      publicId,
      workspaceId: args.workspace._id,
      creatorUserId: creator._id,
      creatorSnapshotName: creator.name,
      creatorSnapshotAvatarUrl: creator.avatarUrl ?? "",
      name: blueprint.name,
      description: blueprint.description,
      category: blueprint.category,
      scope: blueprint.scope,
      deadlineEpochMs,
      status: blueprint.status,
      previousStatus: blueprint.previousStatus,
      archived: blueprint.archived,
      archivedAt,
      completedAt,
      deletedAt: null,
      createdAt,
      updatedAt: createdAt,
      draftData: blueprint.includeDraftData
        ? {
          selectedService: blueprint.category,
          projectName: blueprint.name,
          selectedJob: blueprint.scope ?? "General scope",
          description: blueprint.description,
          isAIEnabled: false,
          deadlineEpochMs,
          lastStep: 4,
        }
        : null,
      reviewComments: blueprint.includeReviewComment
        ? [
          {
            id: `${args.namespace}-review-comment-${index + 1}`,
            author: {
              userId: String(ownerUser._id),
              name: ownerUser.name,
              avatar: ownerUser.avatarUrl ?? "",
            },
            content: `${buildCommentMarker(args.namespace)} Initial review notes added.`,
            timestamp: new Date(createdAt + HOUR_MS).toISOString(),
          },
        ]
        : [],
    });

    createdProjects.push({
      key: blueprint.key,
      projectId,
      publicId,
      status: blueprint.status,
      archived: blueprint.archived,
    });
  }

  const projectByKey = new Map(createdProjects.map((project) => [project.key, project]));

  let createdTaskCount = 0;
  let nextPosition = await getNextTaskPosition(ctx, args.workspace._id);
  const taskBlueprints = buildTaskBlueprints(args.profile, projectBlueprints);

  for (const [index, blueprint] of taskBlueprints.entries()) {
    const assignee = peopleByKey.get(blueprint.assigneeKey) ?? ownerUser;
    const targetProject = blueprint.projectKey ? projectByKey.get(blueprint.projectKey) ?? null : null;
    const createdAt = now + (index + 1) * 1000;
    const dueDateEpochMs = blueprint.dueOffsetDays == null ? null : now + blueprint.dueOffsetDays * DAY_MS;

    await ctx.db.insert("tasks", {
      workspaceId: args.workspace._id,
      projectId: targetProject?.projectId ?? null,
      projectPublicId: targetProject?.publicId ?? null,
      projectDeletedAt: null,
      taskId: `${buildTaskPrefix(args.namespace)}${index + 1}`,
      title: blueprint.title,
      assignee: {
        userId: String(assignee._id),
        name: assignee.name,
        avatar: assignee.avatarUrl ?? "",
      },
      dueDateEpochMs,
      completed: blueprint.completed,
      position: nextPosition,
      createdAt,
      updatedAt: createdAt,
    });
    nextPosition += 1;
    createdTaskCount += 1;
  }

  const refreshedWorkspace = await ctx.db.get(args.workspace._id);
  if (refreshedWorkspace) {
    const currentNextPosition = refreshedWorkspace.nextTaskPosition;
    if (typeof currentNextPosition !== "number" || currentNextPosition < nextPosition) {
      await ctx.db.patch(args.workspace._id, {
        nextTaskPosition: nextPosition,
        updatedAt: now,
      });
    }
  }

  let createdFileCount = 0;
  const fileBlueprints = buildFileBlueprints(args.profile, projectBlueprints);
  for (const [index, blueprint] of fileBlueprints.entries()) {
    const targetProject = projectByKey.get(blueprint.projectKey);
    if (!targetProject) {
      continue;
    }

    const fileName = `${buildFilePrefix(args.namespace)}${index + 1}-${blueprint.name}`;
    const createdAt = now + (index + 1) * HOUR_MS;

    await ctx.db.insert("projectFiles", {
      workspaceId: args.workspace._id,
      projectId: targetProject.projectId,
      projectPublicId: targetProject.publicId,
      projectDeletedAt: null,
      tab: blueprint.tab,
      name: fileName,
      type: inferFileTypeFromName(fileName),
      mimeType: blueprint.mimeType,
      sizeBytes: blueprint.content.length,
      checksumSha256: buildChecksum(`${args.namespace}-file-${index + 1}`),
      displayDateEpochMs: createdAt,
      source: "upload",
      deletedAt: null,
      purgeAfterAt: null,
      createdAt,
      updatedAt: createdAt,
    });
    createdFileCount += 1;
  }

  for (const project of createdProjects) {
    await syncProjectAttachmentMirror(ctx, {
      _id: project.projectId,
      publicId: project.publicId,
    });
  }

  const commentProject = projectByKey.get("active-client-portal") ?? createdProjects[0];
  if (!commentProject) {
    throw new ConvexError("Unable to seed comments because no projects were created");
  }

  const seededCommentMarker = buildCommentMarker(args.namespace);
  const commentAuthorA = peopleByKey.get("owner") ?? ownerUser;
  const commentAuthorB = peopleByKey.get(args.profile === "minimal" ? "teammate" : "designer") ?? ownerUser;
  const commentAuthorC = peopleByKey.get(args.profile === "minimal" ? "teammate" : "developer") ?? ownerUser;

  const topCommentId = await ctx.db.insert("projectComments", {
    workspaceId: args.workspace._id,
    projectId: commentProject.projectId,
    projectPublicId: commentProject.publicId,
    authorUserId: commentAuthorA._id,
    authorSnapshotName: commentAuthorA.name,
    authorSnapshotAvatarUrl: commentAuthorA.avatarUrl ?? "",
    content: `${seededCommentMarker} Kickoff notes are ready for review.`,
    resolved: false,
    edited: false,
    createdAt: now + 5 * HOUR_MS,
    updatedAt: now + 5 * HOUR_MS,
  });

  await ctx.db.insert("projectComments", {
    workspaceId: args.workspace._id,
    projectId: commentProject.projectId,
    projectPublicId: commentProject.publicId,
    parentCommentId: topCommentId,
    authorUserId: commentAuthorB._id,
    authorSnapshotName: commentAuthorB.name,
    authorSnapshotAvatarUrl: commentAuthorB.avatarUrl ?? "",
    content: `${seededCommentMarker} Added responsive navigation alternatives.`,
    resolved: false,
    edited: false,
    createdAt: now + 6 * HOUR_MS,
    updatedAt: now + 6 * HOUR_MS,
  });

  const resolvedCommentId = await ctx.db.insert("projectComments", {
    workspaceId: args.workspace._id,
    projectId: commentProject.projectId,
    projectPublicId: commentProject.publicId,
    authorUserId: commentAuthorC._id,
    authorSnapshotName: commentAuthorC.name,
    authorSnapshotAvatarUrl: commentAuthorC.avatarUrl ?? "",
    resolvedByUserId: ownerUser._id,
    content: `${seededCommentMarker} Hand-off checklist has been completed.`,
    resolved: true,
    edited: false,
    createdAt: now + 7 * HOUR_MS,
    updatedAt: now + 8 * HOUR_MS,
  });

  await ctx.db.insert("commentReactions", {
    commentId: topCommentId,
    projectPublicId: commentProject.publicId,
    workspaceId: args.workspace._id,
    emoji: "thumbs_up",
    userId: commentAuthorB._id,
    createdAt: now + 6 * HOUR_MS + 5 * 60 * 1000,
  });

  await ctx.db.insert("commentReactions", {
    commentId: resolvedCommentId,
    projectPublicId: commentProject.publicId,
    workspaceId: args.workspace._id,
    emoji: "done",
    userId: commentAuthorA._id,
    createdAt: now + 8 * HOUR_MS + 5 * 60 * 1000,
  });

  let invitationCount = 0;
  if (args.profile === "full") {
    await ctx.db.insert("workspaceInvitations", {
      workspaceId: args.workspace._id,
      workosOrganizationId: args.workspace.workosOrganizationId ?? `${args.namespace}-org`,
      invitationId: `${buildInvitationPrefix(args.namespace)}1`,
      email: `${args.namespace}-invite+1@example.com`,
      state: "pending",
      requestedRole: "member",
      expiresAt: new Date(now + 7 * DAY_MS).toISOString(),
      inviterWorkosUserId: ownerUser.workosUserId,
      createdAt: now,
      updatedAt: now,
    });
    invitationCount = 1;
  }

  const brandAssetCount = 0;

  return {
    workspaceSlug: args.workspace.slug,
    profile: args.profile,
    namespace: args.namespace,
    reset,
    created: {
      users: seededUsers.length,
      workspaceMembers: seededUsers.length,
      projects: createdProjects.length,
      tasks: createdTaskCount,
      files: createdFileCount,
      comments: 3,
      reactions: 2,
      invitations: invitationCount,
      brandAssets: brandAssetCount,
    },
  };
};
