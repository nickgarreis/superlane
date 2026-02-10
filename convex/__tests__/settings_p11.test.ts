import { convexTest } from "convex-test";
import workosAuthKitTest from "@convex-dev/workos-authkit/test";
import { beforeEach, describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import schema from "../schema";

const modules = Object.fromEntries(
  Object.entries(import.meta.glob("../**/*.{ts,tsx}")).filter(
    ([path]) => !path.includes("/__tests__/"),
  ),
) as Record<string, () => Promise<unknown>>;

const IDENTITIES = {
  owner: { subject: "owner-settings-subject" },
  admin: { subject: "admin-settings-subject" },
  member: { subject: "member-settings-subject" },
} as const;

type SeededWorkspace = {
  workspaceId: Id<"workspaces">;
  workspaceSlug: string;
  ownerUserId: Id<"users">;
  adminUserId: Id<"users">;
  memberUserId: Id<"users">;
};

const now = () => Date.now();

const sha256Hex = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((entry) => entry.toString(16).padStart(2, "0"))
    .join("");
};

describe("P1.1 settings backendization", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    t = convexTest(schema, modules);
    workosAuthKitTest.register(t, "workOSAuthKit");
  });

  const asOwner = () => t.withIdentity(IDENTITIES.owner);
  const asAdmin = () => t.withIdentity(IDENTITIES.admin);
  const asMember = () => t.withIdentity(IDENTITIES.member);

  const seedWorkspace = async (): Promise<SeededWorkspace> =>
    t.run(async (ctx) => {
      const createdAt = now();
      const ownerUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.owner.subject,
        name: "Owner User",
        email: "owner@example.com",
        createdAt,
        updatedAt: createdAt,
      });
      const adminUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.admin.subject,
        name: "Admin User",
        email: "admin@example.com",
        createdAt,
        updatedAt: createdAt,
      });
      const memberUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.member.subject,
        name: "Member User",
        email: "member@example.com",
        createdAt,
        updatedAt: createdAt,
      });

      const workspaceSlug = "workspace-settings";
      const workspaceId = await ctx.db.insert("workspaces", {
        slug: workspaceSlug,
        name: "Workspace Settings",
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

      return {
        workspaceId,
        workspaceSlug,
        ownerUserId,
        adminUserId,
        memberUserId,
      };
    });

  const storeBlob = async (contents: string, contentType: string) => {
    const blob = new Blob([contents], { type: contentType });
    const checksumSha256 = await sha256Hex(contents);
    const storageId = await t.run(async (ctx) => ctx.storage.store(blob, { sha256: checksumSha256 }));
    return {
      storageId,
      checksumSha256,
      sizeBytes: blob.size,
      mimeType: contentType,
    };
  };

  test("notification preferences default and save round-trip", async () => {
    await seedWorkspace();

    const defaults = await asMember().query(api.settings.getNotificationPreferences, {});
    expect(defaults.exists).toBe(false);
    expect(defaults.events.eventNotifications).toBe(true);
    expect(defaults.events.teamActivities).toBe(true);
    expect(defaults.events.productUpdates).toBe(true);

    await asMember().mutation(api.settings.saveNotificationPreferences, {
      events: {
        eventNotifications: false,
        teamActivities: true,
        productUpdates: false,
      },
    });

    const updated = await asMember().query(api.settings.getNotificationPreferences, {});
    expect(updated.exists).toBe(true);
    expect(updated.events.eventNotifications).toBe(false);
    expect(updated.events.teamActivities).toBe(true);
    expect(updated.events.productUpdates).toBe(false);
  });

  test("notification preferences normalize legacy channels + teamActivity shape", async () => {
    const workspace = await seedWorkspace();
    const createdAt = now();

    await t.run(async (ctx) => {
      await ctx.db.insert("notificationPreferences", {
        userId: workspace.memberUserId,
        channels: {
          email: false,
          desktop: true,
        },
        events: {
          productUpdates: false,
          teamActivity: true,
        } as any,
        createdAt,
        updatedAt: createdAt,
      } as any);
    });

    const normalized = await asMember().query(api.settings.getNotificationPreferences, {});
    expect(normalized.exists).toBe(true);
    expect(normalized.events.eventNotifications).toBe(false);
    expect(normalized.events.teamActivities).toBe(true);
    expect(normalized.events.productUpdates).toBe(false);
  });

  test("avatar upload validates and replaces prior storage blob", async () => {
    await seedWorkspace();
    const first = await storeBlob("first-avatar", "image/png");
    const second = await storeBlob("second-avatar", "image/png");

    await asMember().mutation(api.settings.finalizeAvatarUpload, {
      storageId: first.storageId,
      mimeType: first.mimeType,
      sizeBytes: first.sizeBytes,
      checksumSha256: first.checksumSha256,
    });

    await asMember().mutation(api.settings.finalizeAvatarUpload, {
      storageId: second.storageId,
      mimeType: second.mimeType,
      sizeBytes: second.sizeBytes,
      checksumSha256: second.checksumSha256,
    });

    const firstStillExists = await t.run(async (ctx) => (await ctx.storage.get(first.storageId)) !== null);
    expect(firstStillExists).toBe(false);

    const account = await asMember().query(api.settings.getAccountSettings, {});
    expect(account.avatarUrl).toContain("http");

    await asMember().mutation(api.settings.removeAvatar, {});

    const secondStillExists = await t.run(async (ctx) => (await ctx.storage.get(second.storageId)) !== null);
    expect(secondStillExists).toBe(false);

    const noAvatar = await asMember().query(api.settings.getAccountSettings, {});
    expect(noAvatar.avatarUrl).toBeNull();
  });

  test("brand assets enforce admin role for management", async () => {
    const workspace = await seedWorkspace();
    const stored = await storeBlob("brand-asset", "text/plain");

    await expect(
      asMember().mutation(api.settings.finalizeBrandAssetUpload, {
        workspaceSlug: workspace.workspaceSlug,
        name: "brand.txt",
        mimeType: stored.mimeType,
        sizeBytes: stored.sizeBytes,
        checksumSha256: stored.checksumSha256,
        storageId: stored.storageId,
      }),
    ).rejects.toThrow("Forbidden");

    const uploaded = await asAdmin().mutation(api.settings.finalizeBrandAssetUpload, {
      workspaceSlug: workspace.workspaceSlug,
      name: "brand.txt",
      mimeType: stored.mimeType,
      sizeBytes: stored.sizeBytes,
      checksumSha256: stored.checksumSha256,
      storageId: stored.storageId,
    });

    const company = await asMember().query(api.settings.getCompanySettings, {
      workspaceSlug: workspace.workspaceSlug,
    });
    expect(company.brandAssets).toHaveLength(1);

    await asAdmin().mutation(api.settings.removeBrandAsset, {
      workspaceSlug: workspace.workspaceSlug,
      brandAssetId: uploaded.id as Id<"workspaceBrandAssets">,
    });

    const afterRemove = await asMember().query(api.settings.getCompanySettings, {
      workspaceSlug: workspace.workspaceSlug,
    });
    expect(afterRemove.brandAssets).toHaveLength(0);
  });

  test("workspace soft delete removes visibility and access", async () => {
    const workspace = await seedWorkspace();

    await asOwner().mutation(api.settings.softDeleteWorkspace, {
      workspaceSlug: workspace.workspaceSlug,
    });

    const snapshot = await asOwner().query(api.dashboard.getSnapshot, {
      activeWorkspaceSlug: workspace.workspaceSlug,
    });

    expect(snapshot.workspaces.find((entry: any) => entry.slug === workspace.workspaceSlug)).toBeUndefined();

    await expect(
      asOwner().query(api.settings.getCompanySettings, {
        workspaceSlug: workspace.workspaceSlug,
      }),
    ).rejects.toThrow("Workspace not found");

    await t.run(async (ctx) => {
      const memberships = await (ctx.db
        .query("workspaceMembers") as any)
        .withIndex("by_workspaceId", (q: any) => q.eq("workspaceId", workspace.workspaceId))
        .collect();
      expect(memberships.every((entry: any) => entry.status === "removed")).toBe(true);
    });
  });
});
