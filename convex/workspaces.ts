import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuthUser, requireWorkspaceMember, requireWorkspaceRole } from "./lib/auth";
import { hasActiveOrganizationMembershipForWorkspace } from "./lib/workosOrganization";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "workspace";

const ensureUniqueWorkspaceSlug = async (ctx: any, base: string) => {
  let candidate = base;
  let i = 2;

  while (true) {
    const exists = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q: any) => q.eq("slug", candidate))
      .unique();
    if (!exists) {
      return candidate;
    }
    candidate = `${base}-${i}`;
    i += 1;
  }
};

export const create = mutation({
  args: {
    name: v.string(),
    plan: v.optional(v.string()),
    logo: v.optional(v.string()),
    logoColor: v.optional(v.string()),
    logoText: v.optional(v.string()),
    workosOrganizationId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { appUser } = await requireAuthUser(ctx);

    const baseSlug = slugify(args.name);
    const slug = await ensureUniqueWorkspaceSlug(ctx, baseSlug);
    const now = Date.now();

    if (args.workosOrganizationId) {
      const mappedWorkspace = await ctx.db
        .query("workspaces")
        .withIndex("by_workosOrganizationId", (q: any) =>
          q.eq("workosOrganizationId", args.workosOrganizationId),
        )
        .unique();

      if (mappedWorkspace) {
        throw new ConvexError("Organization is already linked to a workspace");
      }
    }

    const workspaceId = await ctx.db.insert("workspaces", {
      slug,
      name: args.name,
      plan: args.plan ?? "Free Plan",
      logo: args.logo,
      logoColor: args.logoColor,
      logoText: args.logoText ?? args.name.charAt(0).toUpperCase(),
      ownerUserId: appUser._id,
      workosOrganizationId: args.workosOrganizationId,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("workspaceMembers", {
      workspaceId,
      userId: appUser._id,
      role: "owner",
      status: "active",
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return { workspaceId, slug };
  },
});

export const update = mutation({
  args: {
    slug: v.string(),
    name: v.optional(v.string()),
    plan: v.optional(v.string()),
    logo: v.optional(v.string()),
    logoColor: v.optional(v.string()),
    logoText: v.optional(v.string()),
    workosOrganizationId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!workspace) {
      throw new ConvexError("Workspace not found");
    }
    if (workspace.deletedAt != null) {
      throw new ConvexError("Workspace not found");
    }

    const { appUser, membership } = await requireWorkspaceRole(ctx, workspace._id, "admin", {
      workspace,
    });

    if (args.workosOrganizationId !== undefined && args.workosOrganizationId !== workspace.workosOrganizationId) {
      if (membership.role !== "owner") {
        throw new ConvexError("Forbidden");
      }

      const mappedWorkspace = await ctx.db
        .query("workspaces")
        .withIndex("by_workosOrganizationId", (q: any) =>
          q.eq("workosOrganizationId", args.workosOrganizationId),
        )
        .unique();

      if (mappedWorkspace && mappedWorkspace._id !== workspace._id) {
        throw new ConvexError("Organization is already linked to another workspace");
      }
    }

    const patch: Record<string, unknown> = {
      updatedAt: Date.now(),
      updatedByUserId: appUser._id,
    };

    if (args.name !== undefined) patch.name = args.name;
    if (args.plan !== undefined) patch.plan = args.plan;
    if (args.logo !== undefined) patch.logo = args.logo;
    if (args.logoColor !== undefined) patch.logoColor = args.logoColor;
    if (args.logoText !== undefined) patch.logoText = args.logoText;
    if (args.workosOrganizationId !== undefined) patch.workosOrganizationId = args.workosOrganizationId;

    await ctx.db.patch(workspace._id, patch);

    return { slug: workspace.slug };
  },
});

export const switchWorkspace = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!workspace) {
      return null;
    }
    if (workspace.deletedAt != null) {
      return null;
    }

    await requireWorkspaceMember(ctx, workspace._id, { workspace });

    return {
      slug: workspace.slug,
      name: workspace.name,
    };
  },
});

export const ensureDefaultWorkspace = mutation({
  args: {},
  handler: async (ctx) => {
    const { appUser } = await requireAuthUser(ctx);

    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_userId", (q) => q.eq("userId", appUser._id))
      .collect();

    const now = Date.now();
    for (const membership of memberships) {
      if (membership.status !== "active") {
        continue;
      }

      const workspace = await ctx.db.get(membership.workspaceId);
      if (!workspace) {
        continue;
      }
      if (workspace.deletedAt != null) {
        await ctx.db.patch(membership._id, {
          status: "removed",
          updatedAt: now,
        });
        continue;
      }

      const hasOrgAccess = await hasActiveOrganizationMembershipForWorkspace(
        ctx,
        workspace,
        appUser.workosUserId,
      );

      if (hasOrgAccess) {
        return { created: false, slug: workspace.slug };
      }

      await ctx.db.patch(membership._id, {
        status: "removed",
        updatedAt: now,
      });
    }

    const trimmedUserName = appUser.name.trim();
    const workspaceNamePrefix = trimmedUserName ? trimmedUserName.split(/\s+/)[0] : "My";
    const defaultWorkspaceName = `${workspaceNamePrefix} Workspace`;
    const baseSlug = slugify(defaultWorkspaceName);
    const slug = await ensureUniqueWorkspaceSlug(ctx, baseSlug);

    const workspaceId = await ctx.db.insert("workspaces", {
      slug,
      name: defaultWorkspaceName,
      plan: "Free Plan",
      logoColor: "#193cb8",
      logoText: (workspaceNamePrefix.charAt(0) || "W").toUpperCase(),
      ownerUserId: appUser._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("workspaceMembers", {
      workspaceId,
      userId: appUser._id,
      role: "owner",
      status: "active",
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return { created: true, slug };
  },
});
