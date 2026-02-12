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

