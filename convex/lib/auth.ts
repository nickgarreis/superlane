import { ConvexError } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { authKit } from "../auth";
import { requireActiveOrganizationMembershipForWorkspace } from "./workosOrganization";

export async function requireAuthUser(ctx: any) {
  const authUser = await authKit.getAuthUser(ctx);
  if (!authUser) {
    throw new ConvexError("Unauthorized");
  }

  let appUser = await ctx.db
    .query("users")
    .withIndex("by_workosUserId", (q: any) => q.eq("workosUserId", authUser.id))
    .unique();

  if (!appUser) {
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      workosUserId: authUser.id,
      email: authUser.email ?? undefined,
      firstName: authUser.firstName ?? undefined,
      lastName: authUser.lastName ?? undefined,
      name:
        [authUser.firstName, authUser.lastName].filter(Boolean).join(" ").trim() ||
        authUser.email ||
        "Unknown user",
      avatarUrl: authUser.profilePictureUrl ?? undefined,
      createdAt: now,
      updatedAt: now,
    });
    appUser = await ctx.db.get(userId);
  }

  if (!appUser) {
    throw new ConvexError("Unable to resolve application user");
  }

  return { authUser, appUser };
}

export async function requireWorkspaceMember(
  ctx: any,
  workspaceId: Id<"workspaces">,
  options?: { allowInvited?: boolean; workspace?: any },
) {
  const { appUser } = await requireAuthUser(ctx);

  const membership = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_workspace_user", (q: any) =>
      q.eq("workspaceId", workspaceId).eq("userId", appUser._id),
    )
    .unique();

  if (!membership) {
    throw new ConvexError("Forbidden");
  }

  if (membership.status !== "active" && !(options?.allowInvited && membership.status === "invited")) {
    throw new ConvexError("Forbidden");
  }

  const workspace = options?.workspace ?? (await ctx.db.get(workspaceId));
  if (!workspace) {
    throw new ConvexError("Workspace not found");
  }

  const organizationMembership = await requireActiveOrganizationMembershipForWorkspace(
    ctx,
    workspace,
    appUser.workosUserId,
  );

  return { membership, appUser, workspace, organizationMembership };
}
