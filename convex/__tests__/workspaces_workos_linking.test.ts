import { convexTest } from "convex-test";
import workosAuthKitTest from "@convex-dev/workos-authkit/test";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { api, internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { authKit } from "../auth";
import schema from "../schema";
import { syncWorkspaceMemberFromOrganizationMembership } from "../lib/workosOrganization";

const modules = Object.fromEntries(
  Object.entries(import.meta.glob("../**/*.{ts,tsx}")).filter(
    ([path]) => !path.includes("/__tests__/"),
  ),
) as Record<string, () => Promise<unknown>>;

const IDENTITIES = {
  owner: { subject: "owner-workspace-link-subject" },
  admin: { subject: "admin-workspace-link-subject" },
  member: { subject: "member-workspace-link-subject" },
  extra: { subject: "extra-workspace-link-subject" },
} as const;

const now = () => Date.now();

const mockOrganization = (id: string, name: string) =>
  ({
    object: "organization",
    id,
    name,
    allowProfilesOutsideOrganization: false,
    domains: [],
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
    externalId: null,
    metadata: {},
  }) as any;

const mockOrganizationMembership = (
  id: string,
  organizationId: string,
  userId: string,
  roleSlug: string,
  status: "active" | "pending" | "inactive" | "removed" = "active",
  organizationName = "Workspace Org",
) =>
  ({
    object: "organization_membership",
    id,
    organizationId,
    userId,
    role: { slug: roleSlug },
    roles: [{ slug: roleSlug }],
    status,
    organizationName,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  }) as any;

describe("workspace WorkOS organization linking", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    vi.restoreAllMocks();
    t = convexTest(schema, modules);
    workosAuthKitTest.register(t, "workOSAuthKit");
  });

  const asOwner = () => t.withIdentity(IDENTITIES.owner);

  test("create provisions linked workspace and owner organization membership cache row", async () => {
    vi.spyOn(authKit.workos.organizations, "createOrganization")
      .mockResolvedValue(mockOrganization("org_ws_create", "Create Workspace"));
    const createMembershipSpy = vi.spyOn(authKit.workos.userManagement, "createOrganizationMembership")
      .mockResolvedValue(
        mockOrganizationMembership(
          "membership_owner_create",
          "org_ws_create",
          IDENTITIES.owner.subject,
          "admin",
        ),
      );

    const result = await asOwner().action(api.workspaces.create, {
      name: "Create Workspace",
    });

    await t.run(async (ctx) => {
      const workspace = await ctx.db
        .query("workspaces") as any;
      const workspaceRow = await workspace
        .withIndex("by_slug", (q: any) => q.eq("slug", result.slug))
        .unique();
      expect(workspaceRow).not.toBeNull();
      expect(workspaceRow?.workosOrganizationId).toBe("org_ws_create");

      const ownerUser = await ctx.db
        .query("users") as any;
      const ownerUserRow = await ownerUser
        .withIndex("by_workosUserId", (q: any) => q.eq("workosUserId", IDENTITIES.owner.subject))
        .unique();
      expect(ownerUserRow).not.toBeNull();

      const cachedMembership = await ctx.db
        .query("workosOrganizationMemberships") as any;
      const cachedMembershipRow = await cachedMembership
        .withIndex("by_workosOrganizationId_workosUserId", (q: any) =>
          q.eq("workosOrganizationId", "org_ws_create").eq("workosUserId", IDENTITIES.owner.subject),
        )
        .unique();
      expect(cachedMembershipRow).not.toBeNull();
      expect(cachedMembershipRow?.status).toBe("active");
      expect(cachedMembershipRow?.roleSlug).toBe("admin");
    });

    expect(createMembershipSpy).toHaveBeenCalledWith({
      organizationId: "org_ws_create",
      userId: IDENTITIES.owner.subject,
      roleSlug: "admin",
    });
  });

  test("create fails without writing workspace when WorkOS organization provisioning fails", async () => {
    vi.spyOn(authKit.workos.organizations, "createOrganization")
      .mockRejectedValue(new Error("WorkOS down"));

    await expect(
      asOwner().action(api.workspaces.create, {
        name: "Provision Failure Workspace",
      }),
    ).rejects.toThrow("Failed to provision WorkOS organization for workspace");

    await t.run(async (ctx) => {
      const workspaces = await ctx.db.query("workspaces").collect();
      expect(workspaces).toHaveLength(0);
    });
  });

  test("create rolls back WorkOS organization if local workspace write fails", async () => {
    vi.spyOn(authKit.workos.organizations, "createOrganization")
      .mockResolvedValue(mockOrganization("org_collision", "Collision Workspace"));
    vi.spyOn(authKit.workos.userManagement, "createOrganizationMembership")
      .mockResolvedValue(
        mockOrganizationMembership(
          "membership_owner_collision",
          "org_collision",
          IDENTITIES.owner.subject,
          "admin",
        ),
      );
    const deleteOrganizationSpy = vi.spyOn(authKit.workos.organizations, "deleteOrganization")
      .mockResolvedValue(undefined);

    await t.run(async (ctx) => {
      const createdAt = now();
      const ownerUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.extra.subject,
        name: "Existing Owner",
        createdAt,
        updatedAt: createdAt,
      });

      await ctx.db.insert("workspaces", {
        slug: "existing-mapped",
        name: "Existing Mapped",
        plan: "Free Plan",
        ownerUserId,
        workosOrganizationId: "org_collision",
        createdAt,
        updatedAt: createdAt,
      });
    });

    await expect(
      asOwner().action(api.workspaces.create, {
        name: "Collision Workspace",
      }),
    ).rejects.toThrow("Organization is already linked to a workspace");

    expect(deleteOrganizationSpy).toHaveBeenCalledWith("org_collision");
  });

  test("ensureDefaultWorkspace provisions linked workspace when none is accessible", async () => {
    vi.spyOn(authKit.workos.organizations, "createOrganization")
      .mockResolvedValue(mockOrganization("org_default", "Owner Workspace"));
    vi.spyOn(authKit.workos.userManagement, "createOrganizationMembership")
      .mockResolvedValue(
        mockOrganizationMembership(
          "membership_owner_default",
          "org_default",
          IDENTITIES.owner.subject,
          "admin",
        ),
      );

    const result = await asOwner().action(api.workspaces.ensureDefaultWorkspace, {});
    expect(result.created).toBe(true);

    await t.run(async (ctx) => {
      const workspace = await ctx.db
        .query("workspaces") as any;
      const workspaceRow = await workspace
        .withIndex("by_slug", (q: any) => q.eq("slug", result.slug))
        .unique();
      expect(workspaceRow).not.toBeNull();
      expect(workspaceRow?.workosOrganizationId).toBe("org_default");
    });
  });

  test("ensureDefaultWorkspace does not remove inaccessible memberships during resolution", async () => {
    vi.spyOn(authKit.workos.organizations, "createOrganization")
      .mockResolvedValue(mockOrganization("org_default_no_side_effect", "Owner Workspace"));
    vi.spyOn(authKit.workos.userManagement, "createOrganizationMembership")
      .mockResolvedValue(
        mockOrganizationMembership(
          "membership_owner_default_no_side_effect",
          "org_default_no_side_effect",
          IDENTITIES.owner.subject,
          "admin",
        ),
      );

    const seeded = await t.run(async (ctx) => {
      const createdAt = now();
      const ownerUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.owner.subject,
        name: "Owner User",
        createdAt,
        updatedAt: createdAt,
      });

      const workspaceId = await ctx.db.insert("workspaces", {
        slug: "legacy-workspace",
        name: "Legacy Workspace",
        plan: "Free Plan",
        ownerUserId,
        workosOrganizationId: "org_legacy",
        createdAt,
        updatedAt: createdAt,
      });

      const membershipId = await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId: ownerUserId,
        role: "owner",
        status: "active",
        joinedAt: createdAt,
        createdAt,
        updatedAt: createdAt,
      });

      return { membershipId };
    });

    const result = await asOwner().action(api.workspaces.ensureDefaultWorkspace, {});
    expect(result.created).toBe(true);

    await t.run(async (ctx) => {
      const membership = await ctx.db.get(seeded.membershipId);
      expect(membership?.status).toBe("active");
      expect(membership?.pendingRemovalAt).toBeUndefined();
    });
  });

  test("internal cleanup schedules and removes memberships after grace period", async () => {
    const seeded = await t.run(async (ctx) => {
      const createdAt = now();
      const ownerUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.owner.subject,
        name: "Owner User",
        createdAt,
        updatedAt: createdAt,
      });

      const workspaceId = await ctx.db.insert("workspaces", {
        slug: "cleanup-workspace",
        name: "Cleanup Workspace",
        plan: "Free Plan",
        ownerUserId,
        workosOrganizationId: "org_cleanup_missing_membership",
        createdAt,
        updatedAt: createdAt,
      });

      const workspaceMembershipId = await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId: ownerUserId,
        role: "owner",
        status: "active",
        joinedAt: createdAt,
        createdAt,
        updatedAt: createdAt,
      });

      return { workspaceMembershipId };
    });

    const scheduled = await asOwner().mutation(internal.workspaces.internalCleanupPendingWorkspaceMemberRemovals, {
      gracePeriodMs: 60_000,
    });
    expect(scheduled.scheduledPendingRemovalCount).toBe(1);
    expect(scheduled.removedMembershipCount).toBe(0);

    await t.run(async (ctx) => {
      const membership = await ctx.db.get(seeded.workspaceMembershipId);
      expect(membership?.status).toBe("active");
      expect(typeof membership?.pendingRemovalAt).toBe("number");

      const auditLogs = await ctx.db
        .query("workspaceMemberAuditLogs") as any;
      const logs = await auditLogs
        .withIndex("by_workspaceMemberId", (q: any) => q.eq("workspaceMemberId", seeded.workspaceMembershipId))
        .collect();
      expect(logs.some((entry: any) => entry.eventType === "pending_removal_scheduled")).toBe(true);
    });

    const removed = await asOwner().mutation(internal.workspaces.internalCleanupPendingWorkspaceMemberRemovals, {
      gracePeriodMs: 0,
    });
    expect(removed.removedMembershipCount).toBe(1);

    await t.run(async (ctx) => {
      const membership = await ctx.db.get(seeded.workspaceMembershipId);
      expect(membership?.status).toBe("removed");
      expect(membership?.pendingRemovalAt).toBeNull();

      const auditLogs = await ctx.db
        .query("workspaceMemberAuditLogs") as any;
      const logs = await auditLogs
        .withIndex("by_workspaceMemberId", (q: any) => q.eq("workspaceMemberId", seeded.workspaceMembershipId))
        .collect();
      expect(logs.some((entry: any) => entry.eventType === "removed_after_grace")).toBe(true);
    });
  });

  test("ensureOrganizationLink links existing unlinked workspace and provisions active members", async () => {
    const createOrganizationSpy = vi.spyOn(authKit.workos.organizations, "createOrganization")
      .mockResolvedValue(mockOrganization("org_backfill", "Backfill Workspace"));
    const createMembershipSpy = vi.spyOn(authKit.workos.userManagement, "createOrganizationMembership")
      .mockImplementation(async (options: any) =>
        mockOrganizationMembership(
          `membership_${options.userId}`,
          options.organizationId,
          options.userId,
          options.roleSlug,
          "active",
          "Backfill Workspace",
        ));

    const seeded = await t.run(async (ctx) => {
      const createdAt = now();
      const ownerUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.owner.subject,
        name: "Owner User",
        createdAt,
        updatedAt: createdAt,
      });
      const adminUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.admin.subject,
        name: "Admin User",
        createdAt,
        updatedAt: createdAt,
      });
      const memberUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.member.subject,
        name: "Member User",
        createdAt,
        updatedAt: createdAt,
      });
      const removedUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.extra.subject,
        name: "Removed User",
        createdAt,
        updatedAt: createdAt,
      });

      const workspaceId = await ctx.db.insert("workspaces", {
        slug: "workspace-backfill",
        name: "Backfill Workspace",
        plan: "Pro",
        ownerUserId,
        createdAt,
        updatedAt: createdAt,
      });

      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId: ownerUserId,
        role: "owner",
        status: "active",
        joinedAt: createdAt,
        createdAt,
        updatedAt: createdAt,
      });
      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId: adminUserId,
        role: "admin",
        status: "active",
        joinedAt: createdAt,
        createdAt,
        updatedAt: createdAt,
      });
      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId: memberUserId,
        role: "member",
        status: "active",
        joinedAt: createdAt,
        createdAt,
        updatedAt: createdAt,
      });
      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId: removedUserId,
        role: "member",
        status: "removed",
        joinedAt: createdAt,
        createdAt,
        updatedAt: createdAt,
      });

      return {
        workspaceId,
        slug: "workspace-backfill",
      };
    });

    const result = await asOwner().action(api.workspaces.ensureOrganizationLink, {
      workspaceSlug: seeded.slug,
    });

    expect(result.alreadyLinked).toBe(false);
    expect(result.workosOrganizationId).toBe("org_backfill");
    expect(result.linkedMembersCount).toBe(3);
    expect(createOrganizationSpy).toHaveBeenCalledTimes(1);
    expect(createMembershipSpy).toHaveBeenCalledTimes(3);

    const roleSlugByUserId = new Map<string, string>(
      createMembershipSpy.mock.calls.map((call) => [call[0].userId as string, call[0].roleSlug as string]),
    );
    expect(roleSlugByUserId.get(IDENTITIES.owner.subject)).toBe("admin");
    expect(roleSlugByUserId.get(IDENTITIES.admin.subject)).toBe("admin");
    expect(roleSlugByUserId.get(IDENTITIES.member.subject)).toBe("member");

    await t.run(async (ctx) => {
      const workspace = await ctx.db.get(seeded.workspaceId);
      expect(workspace?.workosOrganizationId).toBe("org_backfill");

      const memberships = await ctx.db
        .query("workosOrganizationMemberships") as any;
      const membershipRows = await memberships
        .withIndex("by_workosOrganizationId", (q: any) => q.eq("workosOrganizationId", "org_backfill"))
        .collect();
      expect(membershipRows).toHaveLength(3);
    });
  });

  test("ensureOrganizationLink is idempotent for already-linked workspace", async () => {
    const createOrganizationSpy = vi.spyOn(authKit.workos.organizations, "createOrganization")
      .mockRejectedValue(new Error("should not be called"));

    const seeded = await t.run(async (ctx) => {
      const createdAt = now();
      const ownerUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.owner.subject,
        name: "Owner User",
        createdAt,
        updatedAt: createdAt,
      });

      const workspaceId = await ctx.db.insert("workspaces", {
        slug: "workspace-already-linked",
        name: "Already Linked",
        plan: "Pro",
        ownerUserId,
        workosOrganizationId: "org_existing_link",
        createdAt,
        updatedAt: createdAt,
      });

      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId: ownerUserId,
        role: "owner",
        status: "active",
        joinedAt: createdAt,
        createdAt,
        updatedAt: createdAt,
      });

      await ctx.db.insert("workosOrganizationMemberships", {
        membershipId: "membership_existing_owner",
        workosOrganizationId: "org_existing_link",
        workosUserId: IDENTITIES.owner.subject,
        roleSlug: "admin",
        status: "active",
        createdAt,
        updatedAt: createdAt,
      });

      return { slug: "workspace-already-linked" };
    });

    const result = await asOwner().action(api.workspaces.ensureOrganizationLink, {
      workspaceSlug: seeded.slug,
    });

    expect(result.alreadyLinked).toBe(true);
    expect(result.workosOrganizationId).toBe("org_existing_link");
    expect(result.linkedMembersCount).toBe(0);
    expect(createOrganizationSpy).not.toHaveBeenCalled();
  });

  test("organization sync preserves owner role", async () => {
    await t.run(async (ctx) => {
      const createdAt = now();
      const ownerUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.owner.subject,
        name: "Owner User",
        createdAt,
        updatedAt: createdAt,
      });

      const workspaceId = await ctx.db.insert("workspaces", {
        slug: "owner-preserved-workspace",
        name: "Owner Preserved Workspace",
        plan: "Pro",
        ownerUserId,
        workosOrganizationId: "org_owner_preserve",
        createdAt,
        updatedAt: createdAt,
      });

      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId: ownerUserId,
        role: "owner",
        status: "active",
        joinedAt: createdAt,
        createdAt,
        updatedAt: createdAt,
      });

      await syncWorkspaceMemberFromOrganizationMembership(ctx, {
        workspaceId,
        userId: ownerUserId,
        roleSlug: "member",
        status: "active",
        now: createdAt + 1,
      });

      const membership = await ctx.db
        .query("workspaceMembers") as any;
      const membershipRow = await membership
        .withIndex("by_workspace_user", (q: any) =>
          q.eq("workspaceId", workspaceId).eq("userId", ownerUserId),
        )
        .unique();
      expect(membershipRow?.role).toBe("owner");
      expect(membershipRow?.status).toBe("active");
    });
  });
});
