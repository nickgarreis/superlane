import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { requireWorkspaceRole } from "./lib/auth";
import {
  syncWorkspaceMemberFromOrganizationMembership,
  upsertWorkosOrganizationMembership,
} from "./lib/workosOrganization";
import { logWorkspaceActivity } from "./lib/activityEvents";

const membershipSnapshotValidator = v.object({
  membershipId: v.string(),
  workosUserId: v.string(),
  status: v.union(v.literal("active"), v.literal("pending"), v.literal("inactive"), v.literal("removed")),
  organizationName: v.optional(v.string()),
  roleSlug: v.optional(v.string()),
});

export const getReconciliationContext = internalQuery({
  args: {
    workspaceSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q) => q.eq("slug", args.workspaceSlug))
      .unique();

    if (!workspace) {
      throw new ConvexError("Workspace not found");
    }

    await requireWorkspaceRole(ctx, workspace._id, "admin", { workspace });

    if (!workspace.workosOrganizationId) {
      throw new ConvexError("Workspace is not linked to a WorkOS organization");
    }

    return {
      workspaceId: workspace._id,
      workosOrganizationId: workspace.workosOrganizationId,
      workspaceSlug: workspace.slug,
    };
  },
});

export const applyOrganizationMembershipSnapshot = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    workosOrganizationId: v.string(),
    memberships: v.array(membershipSnapshotValidator),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      throw new ConvexError("Workspace not found");
    }

    if (workspace.workosOrganizationId !== args.workosOrganizationId) {
      throw new ConvexError("Workspace organization mapping mismatch");
    }

    const now = Date.now();
    const existingRows = await ctx.db
      .query("workosOrganizationMemberships")
      .withIndex("by_workosOrganizationId", (q) =>
        q.eq("workosOrganizationId", args.workosOrganizationId),
      )
      .collect();
    const seenMembershipIds = new Set<string>();

    let syncedWorkspaceMembers = 0;
    for (const membership of args.memberships) {
      seenMembershipIds.add(membership.membershipId);

      await upsertWorkosOrganizationMembership(ctx, {
        membershipId: membership.membershipId,
        workosOrganizationId: args.workosOrganizationId,
        workosUserId: membership.workosUserId,
        status: membership.status,
        organizationName: membership.organizationName,
        roleSlug: membership.roleSlug,
        now,
      });

      const appUser = await ctx.db
        .query("users")
        .withIndex("by_workosUserId", (q) => q.eq("workosUserId", membership.workosUserId))
        .unique();

      if (!appUser) {
        continue;
      }

      await syncWorkspaceMemberFromOrganizationMembership(ctx, {
        workspaceId: args.workspaceId,
        userId: appUser._id,
        roleSlug: membership.roleSlug,
        status: membership.status,
        now,
      });
      syncedWorkspaceMembers += 1;
    }

    let removedMemberships = 0;
    for (const existingRow of existingRows) {
      if (seenMembershipIds.has(existingRow.membershipId)) {
        continue;
      }

      await ctx.db.patch(existingRow._id, {
        status: "removed",
        updatedAt: now,
      });
      removedMemberships += 1;

      const appUser = await ctx.db
        .query("users")
        .withIndex("by_workosUserId", (q) => q.eq("workosUserId", existingRow.workosUserId))
        .unique();

      if (!appUser) {
        continue;
      }

      await syncWorkspaceMemberFromOrganizationMembership(ctx, {
        workspaceId: args.workspaceId,
        userId: appUser._id,
        status: "removed",
        now,
      });
    }

    await logWorkspaceActivity(ctx, {
      workspaceId: args.workspaceId,
      kind: "organization",
      action: "organization_membership_sync",
      actor: { type: "system", name: "System" },
      message: JSON.stringify({
        importedMemberships: args.memberships.length,
        syncedWorkspaceMembers,
        removedMemberships,
      }),
    });

    return {
      workspaceId: args.workspaceId,
      importedMemberships: args.memberships.length,
      syncedWorkspaceMembers,
      removedMemberships,
    };
  },
});
