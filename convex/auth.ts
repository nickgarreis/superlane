import { AuthKit, type AuthFunctions } from "@convex-dev/workos-authkit";
import { ConvexError } from "convex/values";
import { components, internal } from "./_generated/api";
import { query } from "./_generated/server";
import type { DataModel } from "./_generated/dataModel";
import {
  syncWorkspaceMemberFromOrganizationMembership,
  upsertWorkosOrganizationMembership,
} from "./lib/workosOrganization";
import { getWorkosRuntimeEnv } from "./lib/env";

const authFunctions: AuthFunctions = internal.auth;
const workosEnv = getWorkosRuntimeEnv();

export const authKit = new AuthKit<DataModel>(components.workOSAuthKit, {
  authFunctions,
  clientId: workosEnv.workosClientId,
  apiKey: workosEnv.workosApiKey,
  webhookSecret: workosEnv.workosWebhookSecret,
  actionSecret: workosEnv.workosActionSecret,
  additionalEventTypes: [
    "organization_membership.created",
    "organization_membership.updated",
    "organization_membership.deleted",
    "organization.created",
    "organization.updated",
    "organization.deleted",
  ],
});

const fullName = (firstName?: string | null, lastName?: string | null, email?: string | null) => {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  if (name.length > 0) {
    return name;
  }
  return email ?? "Unknown user";
};

const syncOrganizationMembershipEvent = async (
  ctx: any,
  event: {
    data: {
      id?: string;
      organizationId?: string;
      organizationName?: string;
      userId?: string;
      status?: string;
      role?: { slug?: string };
      roles?: Array<{ slug?: string }>;
    };
  },
  forcedStatus?: "removed",
) => {
  const membershipId = event.data.id;
  const workosOrganizationId = event.data.organizationId;
  const workosUserId = event.data.userId;

  if (!membershipId || !workosOrganizationId || !workosUserId) {
    return;
  }

  const now = Date.now();
  const roleSlug = event.data.role?.slug ?? event.data.roles?.[0]?.slug;
  const status = forcedStatus ?? event.data.status ?? "inactive";

  await upsertWorkosOrganizationMembership(ctx, {
    membershipId,
    workosOrganizationId,
    workosUserId,
    status,
    organizationName: event.data.organizationName,
    roleSlug,
    now,
  });

  const workspace = await ctx.db
    .query("workspaces")
    .withIndex("by_workosOrganizationId", (q: any) => q.eq("workosOrganizationId", workosOrganizationId))
    .unique();

  if (!workspace) {
    return;
  }

  const appUser = await ctx.db
    .query("users")
    .withIndex("by_workosUserId", (q: any) => q.eq("workosUserId", workosUserId))
    .unique();

  if (!appUser) {
    return;
  }

  await syncWorkspaceMemberFromOrganizationMembership(ctx, {
    workspaceId: workspace._id,
    userId: appUser._id,
    roleSlug,
    status,
    now,
  });
};

const syncOrganizationNameEvent = async (
  ctx: any,
  event: {
    data: {
      id?: string;
      name?: string;
    };
  },
) => {
  const workosOrganizationId = event.data.id;
  const organizationName = event.data.name;

  if (!workosOrganizationId || !organizationName) {
    return;
  }

  const now = Date.now();
  const memberships = await ctx.db
    .query("workosOrganizationMemberships")
    .withIndex("by_workosOrganizationId", (q: any) =>
      q.eq("workosOrganizationId", workosOrganizationId),
    )
    .collect();

  await Promise.all(
    memberships.map((membership: any) =>
      ctx.db.patch(membership._id, {
        organizationName,
        updatedAt: now,
      }),
    ),
  );
};

export const { authKitEvent } = authKit.events({
  "user.created": async (ctx, event) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_workosUserId", (q) => q.eq("workosUserId", event.data.id))
      .unique();

    const patch = {
      workosUserId: event.data.id,
      email: event.data.email ?? undefined,
      firstName: event.data.firstName ?? undefined,
      lastName: event.data.lastName ?? undefined,
      name: fullName(event.data.firstName, event.data.lastName, event.data.email),
      avatarUrl: event.data.profilePictureUrl ?? undefined,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return;
    }

    await ctx.db.insert("users", {
      ...patch,
      createdAt: now,
    });
  },

  "user.updated": async (ctx, event) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_workosUserId", (q) => q.eq("workosUserId", event.data.id))
      .unique();

    const patch = {
      workosUserId: event.data.id,
      email: event.data.email ?? undefined,
      firstName: event.data.firstName ?? undefined,
      lastName: event.data.lastName ?? undefined,
      name: fullName(event.data.firstName, event.data.lastName, event.data.email),
      avatarUrl: event.data.profilePictureUrl ?? undefined,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return;
    }

    await ctx.db.insert("users", {
      ...patch,
      createdAt: now,
    });
  },

  "user.deleted": async (ctx, event) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_workosUserId", (q) => q.eq("workosUserId", event.data.id))
      .unique();

    if (!existing) {
      return;
    }

    await ctx.db.delete(existing._id);
  },

  "organization_membership.created": async (ctx, event) => {
    await syncOrganizationMembershipEvent(ctx, event);
  },

  "organization_membership.updated": async (ctx, event) => {
    await syncOrganizationMembershipEvent(ctx, event);
  },

  "organization_membership.deleted": async (ctx, event) => {
    await syncOrganizationMembershipEvent(ctx, event, "removed");
  },

  "organization.created": async (ctx, event) => {
    await syncOrganizationNameEvent(ctx, event);
  },

  "organization.updated": async (ctx, event) => {
    await syncOrganizationNameEvent(ctx, event);
  },

  "organization.deleted": async (ctx, event) => {
    const workosOrganizationId = event.data.id;
    if (!workosOrganizationId) {
      return;
    }

    const now = Date.now();
    const organizationMemberships = await ctx.db
      .query("workosOrganizationMemberships")
      .withIndex("by_workosOrganizationId", (q: any) => q.eq("workosOrganizationId", workosOrganizationId))
      .collect();

    await Promise.all(
      organizationMemberships.map((membership: any) =>
        ctx.db.patch(membership._id, {
          status: "removed",
          updatedAt: now,
        }),
      ),
    );

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_workosOrganizationId", (q: any) => q.eq("workosOrganizationId", workosOrganizationId))
      .unique();

    if (!workspace) {
      return;
    }

    const workspaceMembers = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspaceId", (q: any) => q.eq("workspaceId", workspace._id))
      .collect();

    await Promise.all(
      workspaceMembers.map((membership: any) =>
        ctx.db.patch(membership._id, {
          status: "removed",
          updatedAt: now,
        }),
      ),
    );
  },
});

export const { authKitAction } = authKit.actions({
  authentication: async (_ctx, _action, response) => {
    return response.allow();
  },
  userRegistration: async (_ctx, _action, response) => {
    return response.allow();
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authKit.getAuthUser(ctx);
    if (!authUser) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_workosUserId", (q) => q.eq("workosUserId", authUser.id))
      .unique();

    if (!user) {
      throw new ConvexError("Authenticated user is not synced yet.");
    }

    return user;
  },
});
