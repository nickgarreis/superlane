import { AuthKit, type AuthFunctions } from "@convex-dev/workos-authkit";
import { ConvexError, v } from "convex/values";
import { components, internal } from "./_generated/api";
import { action, internalQuery, query } from "./_generated/server";
import type { DataModel } from "./_generated/dataModel";
import {
  syncWorkspaceMemberFromOrganizationMembership,
  upsertWorkosOrganizationMembership,
} from "./lib/workosOrganization";
import { getSiteUrlEnv, getWorkosRuntimeEnv } from "./lib/env";
import { logError, logInfo } from "./lib/logging";

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
    "invitation.created",
    "invitation.resent",
    "invitation.revoked",
    "invitation.accepted",
  ],
});

const fullName = (firstName?: string | null, lastName?: string | null, email?: string | null) => {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  if (name.length > 0) {
    return name;
  }
  return email ?? "Unknown user";
};

const normalizeEmail = (value: string | null | undefined): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized.length === 0 || !normalized.includes("@")) {
    return null;
  }
  return normalized;
};

const maskEmailForLogs = (value: string): string => {
  const [localPart = "", domainPart = ""] = value.split("@");
  if (!domainPart) {
    return "***";
  }
  const maskedLocal = localPart.length <= 2 ? "***" : `${localPart.slice(0, 2)}***`;
  return `${maskedLocal}@${domainPart}`;
};

const PASSWORD_RESET_RETURN_TO_BY_SOURCE = {
  login: "/tasks",
  settings: "/settings?tab=Account",
} as const;

type IndexEqQuery = {
  eq: (field: string, value: string) => unknown;
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
    .withIndex("by_workosOrganizationId", (q: IndexEqQuery) =>
      q.eq("workosOrganizationId", workosOrganizationId),
    )
    .unique();

  if (!workspace) {
    return;
  }

  const appUser = await ctx.db
    .query("users")
    .withIndex("by_workosUserId", (q: IndexEqQuery) =>
      q.eq("workosUserId", workosUserId),
    )
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
    .withIndex("by_workosOrganizationId", (q: IndexEqQuery) =>
      q.eq("workosOrganizationId", workosOrganizationId),
    )
    .collect();

  await Promise.all(
    memberships.map((membership: { _id: string }) =>
      ctx.db.patch(membership._id, {
        organizationName,
        updatedAt: now,
      }),
    ),
  );
};

const syncInvitationEvent = async (
  ctx: any,
  event: {
    data: {
      id?: string;
      email?: string;
      state?: "pending" | "accepted" | "expired" | "revoked";
      organizationId?: string | null;
      expiresAt?: string;
      inviterUserId?: string | null;
    };
  },
) => {
  const invitationId = event.data.id;
  const organizationId = event.data.organizationId;
  const email = event.data.email;
  const state = event.data.state;
  const expiresAt = event.data.expiresAt;

  if (!invitationId || !organizationId || !email || !state || !expiresAt) {
    return;
  }

  const workspace = await ctx.db
    .query("workspaces")
    .withIndex("by_workosOrganizationId", (q: IndexEqQuery) =>
      q.eq("workosOrganizationId", organizationId),
    )
    .unique();

  if (!workspace) {
    return;
  }

  const now = Date.now();
  const existing = await ctx.db
    .query("workspaceInvitations")
    .withIndex("by_invitationId", (q: IndexEqQuery) =>
      q.eq("invitationId", invitationId),
    )
    .unique();

  const patch = {
    workspaceId: workspace._id,
    workosOrganizationId: organizationId,
    invitationId,
    email,
    state,
    requestedRole: existing?.requestedRole ?? "member",
    expiresAt,
    inviterWorkosUserId: event.data.inviterUserId ?? undefined,
    updatedAt: now,
  };

  if (existing) {
    await ctx.db.patch(existing._id, patch);
    return;
  }

  await ctx.db.insert("workspaceInvitations", {
    ...patch,
    createdAt: now,
  });
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
      .withIndex("by_workosOrganizationId", (q) => q.eq("workosOrganizationId", workosOrganizationId))
      .collect();

    await Promise.all(
      organizationMemberships.map((membership) =>
        ctx.db.patch(membership._id, {
          status: "removed",
          updatedAt: now,
        }),
      ),
    );

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_workosOrganizationId", (q) => q.eq("workosOrganizationId", workosOrganizationId))
      .unique();

    if (!workspace) {
      return;
    }

    const workspaceMembers = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", workspace._id))
      .collect();

    await Promise.all(
      workspaceMembers.map((membership) =>
        ctx.db.patch(membership._id, {
          status: "removed",
          updatedAt: now,
        }),
      ),
    );
  },

  "invitation.created": async (ctx, event) => {
    await syncInvitationEvent(ctx, event);
  },

  "invitation.resent": async (ctx, event) => {
    await syncInvitationEvent(ctx, event);
  },

  "invitation.revoked": async (ctx, event) => {
    await syncInvitationEvent(ctx, event);
  },

  "invitation.accepted": async (ctx, event) => {
    await syncInvitationEvent(ctx, event);
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

export const getUserByWorkosUserId = internalQuery({
  args: {
    workosUserId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_workosUserId", (q) => q.eq("workosUserId", args.workosUserId))
      .unique();
  },
});

export const requestPasswordReset = action({
  args: v.object({
    source: v.union(v.literal("login"), v.literal("settings")),
    email: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const { siteUrl } = getSiteUrlEnv();
    const passwordResetUrl = new URL("/reset-password", siteUrl);
    passwordResetUrl.searchParams.set(
      "returnTo",
      PASSWORD_RESET_RETURN_TO_BY_SOURCE[args.source],
    );

    let targetEmail: string | null = null;
    if (args.source === "login") {
      targetEmail = normalizeEmail(args.email);
      if (!targetEmail) {
        logInfo(
          "auth.requestPasswordReset",
          "Skipped password reset request from login due to missing normalized email",
          { source: args.source },
        );
        return { accepted: true } as const;
      }
    } else {
      const identity = await ctx.auth.getUserIdentity();
      const workosUserId = identity?.subject;
      if (!workosUserId) {
        logInfo(
          "auth.requestPasswordReset",
          "Skipped settings password reset request due to missing auth identity",
          { source: args.source },
        );
        return { accepted: true } as const;
      }
      const currentUser = await ctx.runQuery(internal.auth.getUserByWorkosUserId, {
        workosUserId,
      });
      targetEmail = normalizeEmail(currentUser?.email);
    }

    if (!targetEmail) {
      logInfo(
        "auth.requestPasswordReset",
        "Skipped password reset request due to missing normalized email",
        { source: args.source },
      );
      return { accepted: true } as const;
    }

    try {
      await authKit.workos.userManagement.sendPasswordResetEmail({
        email: targetEmail,
        passwordResetUrl: passwordResetUrl.toString(),
      });
    } catch (error) {
      logError(
        "auth.requestPasswordReset",
        "Failed to dispatch password reset email",
        {
          source: args.source,
          email: maskEmailForLogs(targetEmail),
          error,
        },
      );
    }

    return { accepted: true } as const;
  },
});
