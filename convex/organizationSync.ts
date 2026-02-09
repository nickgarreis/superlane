import { ConvexError, v } from "convex/values";
import { makeFunctionReference } from "convex/server";
import { action } from "./_generated/server";
import { authKit } from "./auth";

const getReconciliationContextRef = makeFunctionReference<"query">(
  "organizationSyncInternal:getReconciliationContext",
);
const applyOrganizationMembershipSnapshotRef = makeFunctionReference<"mutation">(
  "organizationSyncInternal:applyOrganizationMembershipSnapshot",
);

export const reconcileWorkspaceOrganizationMemberships = action({
  args: {
    workspaceSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const context = await ctx.runQuery(getReconciliationContextRef as any, { workspaceSlug: args.workspaceSlug });
    if (!context || !context.workspaceId || !context.workspaceSlug || !context.workosOrganizationId) {
      throw new ConvexError(
        `Unable to reconcile organization memberships: missing reconciliation context for workspace "${args.workspaceSlug}"`,
      );
    }

    const memberships = await authKit.workos.userManagement
      .listOrganizationMemberships({
        organizationId: context.workosOrganizationId,
      })
      .then((result) => result.autoPagination());

    const normalizedMemberships = memberships.map((membership) => ({
      membershipId: membership.id,
      workosUserId: membership.userId,
      status: membership.status,
      organizationName: membership.organizationName,
      roleSlug: membership.role?.slug ?? membership.roles?.[0]?.slug ?? undefined,
    }));

    const result = await ctx.runMutation(applyOrganizationMembershipSnapshotRef as any, {
      workspaceId: context.workspaceId,
      workosOrganizationId: context.workosOrganizationId,
      memberships: normalizedMemberships,
    });

    return {
      workspaceSlug: context.workspaceSlug,
      organizationId: context.workosOrganizationId,
      ...result,
    };
  },
});
