import type { Id } from "../_generated/dataModel";

export type ActivityKind =
  | "project"
  | "task"
  | "collaboration"
  | "file"
  | "membership"
  | "workspace"
  | "organization";

type ActivityActor =
  | {
      type: "user";
      userId: Id<"users">;
      name?: string | null;
      avatarUrl?: string | null;
    }
  | {
      type: "system";
      name?: string;
    };

type ActivityEventInput = {
  workspaceId: Id<"workspaces">;
  kind: ActivityKind;
  action: string;
  actor: ActivityActor;
  createdAt?: number;
  projectPublicId?: string;
  projectName?: string;
  projectVisibility?: "workspace" | "private";
  projectOwnerUserId?: Id<"users">;
  taskId?: string;
  taskTitle?: string;
  fileName?: string;
  fileTab?: "Assets" | "Contract" | "Attachments";
  targetUserId?: Id<"users">;
  targetUserName?: string;
  targetRole?: "owner" | "admin" | "member";
  fromValue?: string;
  toValue?: string;
  message?: string;
  errorCode?: string;
};

const trimOptional = (value: string | null | undefined) => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const resolveUserDisplayName = (user: {
  name?: string | null;
  email?: string | null;
}) => trimOptional(user.name) ?? trimOptional(user.email) ?? "Unknown user";

export const resolveUserAvatar = (user: {
  avatarUrl?: string | null;
}): string | null => {
  const avatarUrl = trimOptional(user.avatarUrl);
  return avatarUrl ?? null;
};

const countWorkspaceActivityEvents = async (
  ctx: any,
  workspaceId: Id<"workspaces">,
) => {
  let cursor: string | null = null;
  let total = 0;
  while (true) {
    const page: any = await ctx.db
      .query("workspaceActivityEvents")
      .withIndex("by_workspace_createdAt", (q: any) => q.eq("workspaceId", workspaceId))
      .paginate({
        cursor,
        numItems: 256,
      });
    total += page.page.length;
    if (page.isDone) {
      break;
    }
    cursor = page.continueCursor;
  }
  return total;
};

const incrementWorkspaceActivityUnreadCounters = async (
  ctx: any,
  args: {
    workspaceId: Id<"workspaces">;
    nextActivityEventCount: number;
    timestamp: number;
  },
) => {
  const activeMembers = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_workspace_status_joinedAt", (q: any) =>
      q.eq("workspaceId", args.workspaceId).eq("status", "active"),
    )
    .collect();
  if (activeMembers.length === 0) {
    return;
  }

  const existingInboxStates = await ctx.db
    .query("workspaceActivityInboxStates")
    .withIndex("by_workspaceId", (q: any) => q.eq("workspaceId", args.workspaceId))
    .collect();
  const inboxStateByUserId = new Map<string, any>(
    existingInboxStates.map((entry: any) => [String(entry.userId), entry]),
  );

  for (const member of activeMembers) {
    const existingInboxState = inboxStateByUserId.get(String(member.userId));
    if (existingInboxState) {
      await ctx.db.patch(existingInboxState._id, {
        unreadCount: Math.max(0, Number(existingInboxState.unreadCount ?? 0)) + 1,
        updatedAt: args.timestamp,
      });
      continue;
    }
    await ctx.db.insert("workspaceActivityInboxStates", {
      workspaceId: args.workspaceId,
      userId: member.userId,
      unreadCount: args.nextActivityEventCount,
      markAllCutoffAt: 0,
      createdAt: args.timestamp,
      updatedAt: args.timestamp,
    });
  }
};

export const logWorkspaceActivity = async (ctx: any, input: ActivityEventInput) => {
  const createdAt = input.createdAt ?? Date.now();
  const actorName =
    input.actor.type === "system"
      ? trimOptional(input.actor.name) ?? "System"
      : trimOptional(input.actor.name) ?? "Unknown user";
  const actorAvatarUrl =
    input.actor.type === "user"
      ? (trimOptional(input.actor.avatarUrl) ?? null)
      : null;

  await ctx.db.insert("workspaceActivityEvents", {
    workspaceId: input.workspaceId,
    kind: input.kind,
    action: input.action,
    actorType: input.actor.type,
    actorUserId: input.actor.type === "user" ? input.actor.userId : undefined,
    actorName,
    actorAvatarUrl,
    projectPublicId: trimOptional(input.projectPublicId),
    projectName: trimOptional(input.projectName),
    projectVisibility: input.projectVisibility,
    projectOwnerUserId: input.projectOwnerUserId,
    taskId: trimOptional(input.taskId),
    taskTitle: trimOptional(input.taskTitle),
    fileName: trimOptional(input.fileName),
    fileTab: input.fileTab,
    targetUserId: input.targetUserId,
    targetUserName: trimOptional(input.targetUserName),
    targetRole: input.targetRole,
    fromValue: trimOptional(input.fromValue),
    toValue: trimOptional(input.toValue),
    message: trimOptional(input.message),
    errorCode: trimOptional(input.errorCode),
    createdAt,
  });

  const workspace = await ctx.db.get(input.workspaceId);
  if (!workspace || workspace.deletedAt != null) {
    return;
  }

  const nextActivityEventCount =
    typeof workspace.activityEventCount === "number"
      ? workspace.activityEventCount + 1
      : await countWorkspaceActivityEvents(ctx, workspace._id);
  await ctx.db.patch(workspace._id, {
    activityEventCount: nextActivityEventCount,
  });

  await incrementWorkspaceActivityUnreadCounters(ctx, {
    workspaceId: workspace._id,
    nextActivityEventCount,
    timestamp: createdAt,
  });
};

export const logWorkspaceActivityForActorUser = async (
  ctx: any,
  args: Omit<ActivityEventInput, "actor"> & {
    actorUser: {
      _id: Id<"users">;
      name?: string | null;
      email?: string | null;
      avatarUrl?: string | null;
    };
  },
) =>
  logWorkspaceActivity(ctx, {
    ...args,
    actor: {
      type: "user",
      userId: args.actorUser._id,
      name: resolveUserDisplayName(args.actorUser),
      avatarUrl: resolveUserAvatar(args.actorUser),
    },
  });
