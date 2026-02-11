import { v } from "convex/values";
import { query, type QueryCtx } from "./_generated/server";
import {
  buildProvisioningContext,
  getAccessibleWorkspaceContext,
  resolveAvatarUrl,
} from "./lib/dashboardContext";

const workspaceBootstrapHandler = async (ctx: QueryCtx, args: { activeWorkspaceSlug?: string }) => {
  const access = await getAccessibleWorkspaceContext(ctx, args);

  if (!access.provisioned) {
    return buildProvisioningContext(access.authUser);
  }

  return {
    viewer: {
      id: access.appUser._id,
      workosUserId: access.appUser.workosUserId,
      name: access.appUser.name,
      email: access.appUser.email ?? null,
      avatarUrl: await resolveAvatarUrl(ctx, access.appUser),
    },
    workspaces: access.workspaces,
    activeWorkspace: access.activeWorkspace,
    activeWorkspaceSlug: access.activeWorkspace?.slug ?? null,
  };
};

export const getWorkspaceBootstrap = query({
  args: {
    activeWorkspaceSlug: v.optional(v.string()),
  },
  handler: workspaceBootstrapHandler,
});
