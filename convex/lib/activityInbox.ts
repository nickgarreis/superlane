import { ConvexError } from "convex/values";
import type { Id } from "../_generated/dataModel";

type UnsafeValue = any;
type UnsafeCtx = {
  db: UnsafeValue;
  storage: UnsafeValue;
};

export const getWorkspaceBySlug = async (ctx: UnsafeCtx, workspaceSlug: string) => {
  const workspace = await ctx.db
    .query("workspaces")
    .withIndex("by_slug", (q: UnsafeValue) => q.eq("slug", workspaceSlug))
    .unique();
  if (!workspace || workspace.deletedAt != null) {
    throw new ConvexError("Workspace not found");
  }
  return workspace;
};

const recountWorkspaceActivityEvents = async (
  ctx: UnsafeCtx,
  workspaceId: UnsafeValue,
) => {
  const events = await ctx.db
    .query("workspaceActivityEvents")
    .withIndex("by_workspace_createdAt", (q: UnsafeValue) =>
      q.eq("workspaceId", workspaceId),
    )
    .collect();
  return events.length;
};

const countWorkspaceActivityEvents = (workspace: UnsafeValue) =>
  Math.max(0, Number(workspace.activityEventCount ?? 0));

export const initializeWorkspaceActivityEventCount = async (
  ctx: UnsafeCtx,
  workspace: UnsafeValue,
) => {
  if (typeof workspace.activityEventCount === "number") {
    return countWorkspaceActivityEvents(workspace);
  }
  const counted = await recountWorkspaceActivityEvents(ctx, workspace._id);
  await ctx.db.patch(workspace._id, {
    activityEventCount: counted,
  });
  return counted;
};

export const resolveWorkspaceActivityEventCount = async (
  ctx: UnsafeCtx,
  workspace: UnsafeValue,
) => {
  if (typeof workspace.activityEventCount === "number") {
    return countWorkspaceActivityEvents(workspace);
  }
  // Query contexts are read-only; rely on seeded/backfilled counters there.
  if (typeof ctx.db.patch === "function") {
    return initializeWorkspaceActivityEventCount(ctx, workspace);
  }
  return 0;
};

export const getWorkspaceInboxState = async (
  ctx: UnsafeCtx,
  workspaceId: UnsafeValue,
  userId: UnsafeValue,
) =>
  ctx.db
    .query("workspaceActivityInboxStates")
    .withIndex("by_workspace_user", (q: UnsafeValue) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId),
    )
    .unique();

export const getReadReceiptActivityEventIds = async (
  ctx: UnsafeCtx,
  workspaceId: UnsafeValue,
  userId: UnsafeValue,
  activityEventIds: UnsafeValue[],
) => {
  if (activityEventIds.length === 0) {
    return new Set<string>();
  }
  const queryByWorkspaceUser = ctx.db
    .query("workspaceActivityReadReceipts")
    .withIndex("by_workspace_user", (q: UnsafeValue) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId),
    );

  const readReceipts =
    activityEventIds.length === 1
      ? await queryByWorkspaceUser
          .filter((q: UnsafeValue) =>
            q.eq(q.field("activityEventId"), activityEventIds[0]),
          )
          .collect()
      : await queryByWorkspaceUser
          .filter((q: UnsafeValue) =>
            q.or(
              ...activityEventIds.map((activityEventId) =>
                q.eq(q.field("activityEventId"), activityEventId),
              ),
            ),
          )
          .collect();

  return new Set<string>(
    readReceipts.map((receipt: UnsafeValue) => String(receipt.activityEventId)),
  );
};

export const getDismissedActivityEventIds = async (
  ctx: UnsafeCtx,
  workspaceId: UnsafeValue,
  userId: UnsafeValue,
  activityEventIds: UnsafeValue[],
) => {
  if (activityEventIds.length === 0) {
    return new Set<string>();
  }
  const queryByWorkspaceUser = ctx.db
    .query("workspaceActivityDismissals")
    .withIndex("by_workspace_user", (q: UnsafeValue) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId),
    );

  const dismissals =
    activityEventIds.length === 1
      ? await queryByWorkspaceUser
          .filter((q: UnsafeValue) =>
            q.eq(q.field("activityEventId"), activityEventIds[0]),
          )
          .collect()
      : await queryByWorkspaceUser
          .filter((q: UnsafeValue) =>
            q.or(
              ...activityEventIds.map((activityEventId) =>
                q.eq(q.field("activityEventId"), activityEventId),
              ),
            ),
          )
          .collect();

  return new Set<string>(
    dismissals.map((dismissal: UnsafeValue) => String(dismissal.activityEventId)),
  );
};

export const findWorkspaceIdsMissingActivityCount = async (
  ctx: UnsafeCtx,
  maxWorkspaces: number,
): Promise<Id<"workspaces">[]> => {
  const workspaces = await ctx.db.query("workspaces").collect();
  const missingWorkspaceIds: Id<"workspaces">[] = [];

  for (const workspace of workspaces as Array<{
    _id: Id<"workspaces">;
    deletedAt?: number | null;
    activityEventCount?: number;
  }>) {
    if (workspace.deletedAt != null || typeof workspace.activityEventCount === "number") {
      continue;
    }
    missingWorkspaceIds.push(workspace._id);
    if (missingWorkspaceIds.length >= maxWorkspaces) {
      break;
    }
  }

  return missingWorkspaceIds;
};

export const resolveTargetUserAvatarUrl = async (
  ctx: UnsafeCtx,
  user: UnsafeValue,
) => {
  const avatarUrl = typeof user?.avatarUrl === "string" ? user.avatarUrl.trim() : "";
  if (avatarUrl.length > 0) {
    return avatarUrl;
  }
  if (user?.avatarStorageId) {
    return (await ctx.storage.getUrl(user.avatarStorageId)) ?? null;
  }
  return null;
};
