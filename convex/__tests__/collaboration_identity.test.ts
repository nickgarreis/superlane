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
  owner: { subject: "owner-collaboration-subject" },
  admin: { subject: "admin-collaboration-subject" },
  member: { subject: "member-collaboration-subject" },
  outsider: { subject: "outsider-collaboration-subject" },
} as const;

type SeededWorkspace = {
  workspaceId: Id<"workspaces">;
  workspaceSlug: string;
  ownerUserId: Id<"users">;
  adminUserId: Id<"users">;
  memberUserId: Id<"users">;
  projectPublicId: string;
};

const now = () => Date.now();

const sha256Hex = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((entry) => entry.toString(16).padStart(2, "0"))
    .join("");
};

describe("P1.2/P1.3 identity propagation contracts", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    t = convexTest(schema, modules);
    workosAuthKitTest.register(t, "workOSAuthKit");
  });

  const asOwner = () => t.withIdentity(IDENTITIES.owner);
  const asAdmin = () => t.withIdentity(IDENTITIES.admin);
  const asMember = () => t.withIdentity(IDENTITIES.member);
  const asOutsider = () => t.withIdentity(IDENTITIES.outsider);

  const storeBlob = async (contents: string, contentType: string) => {
    const blob = new Blob([contents], { type: contentType });
    const checksumSha256 = await sha256Hex(contents);
    return t.run(async (ctx) => ctx.storage.store(blob, { sha256: checksumSha256 }));
  };

  const seedWorkspace = async (): Promise<SeededWorkspace> => {
    const adminAvatarStorageId = await storeBlob("admin-avatar", "image/png");

    return t.run(async (ctx) => {
      const createdAt = now();
      const ownerUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.owner.subject,
        name: "Owner User",
        email: "owner@example.com",
        avatarUrl: "https://example.com/owner-avatar.png",
        createdAt,
        updatedAt: createdAt,
      });
      const adminUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.admin.subject,
        name: "Admin User",
        email: "admin@example.com",
        avatarUrl: "https://example.com/admin-fallback-avatar.png",
        avatarStorageId: adminAvatarStorageId,
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
      const removedUserId = await ctx.db.insert("users", {
        workosUserId: "removed-collaboration-subject",
        name: "Removed User",
        email: "removed@example.com",
        createdAt,
        updatedAt: createdAt,
      });
      await ctx.db.insert("users", {
        workosUserId: IDENTITIES.outsider.subject,
        name: "Outsider User",
        email: "outsider@example.com",
        createdAt,
        updatedAt: createdAt,
      });

      const workspaceSlug = "workspace-collaboration";
      const workspaceId = await ctx.db.insert("workspaces", {
        slug: workspaceSlug,
        name: "Workspace Collaboration",
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
        joinedAt: createdAt + 1,
        createdAt: createdAt + 1,
        updatedAt: createdAt + 1,
      });
      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId: memberUserId,
        role: "member",
        status: "active",
        joinedAt: createdAt + 2,
        createdAt: createdAt + 2,
        updatedAt: createdAt + 2,
      });
      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId: removedUserId,
        role: "member",
        status: "removed",
        joinedAt: createdAt + 3,
        createdAt: createdAt + 3,
        updatedAt: createdAt + 3,
      });

      const projectPublicId = "project-collaboration";
      const projectId = await ctx.db.insert("projects", {
        publicId: projectPublicId,
        workspaceId,
        creatorUserId: ownerUserId,
        name: "Collaboration Project",
        description: "Identity contract checks",
        category: "General",
        status: "Active",
        previousStatus: null,
        archived: false,
        archivedAt: null,
        completedAt: null,
        deletedAt: null,
        createdAt,
        updatedAt: createdAt,
      });

      const commentId = await ctx.db.insert("projectComments", {
        workspaceId,
        projectId,
        projectPublicId,
        authorUserId: memberUserId,
        content: "Initial thread",
        resolved: false,
        edited: false,
        createdAt,
        updatedAt: createdAt,
      });

      await ctx.db.insert("commentReactions", {
        commentId,
        emoji: "👍",
        userId: adminUserId,
        createdAt,
      });

      return {
        workspaceId,
        workspaceSlug,
        ownerUserId,
        adminUserId,
        memberUserId,
        projectPublicId,
      };
    });
  };

  test("listWorkspaceMembers returns active members with viewer-first sorting and resolved avatars", async () => {
    const workspace = await seedWorkspace();

    const result = await asAdmin().query(api.collaboration.listWorkspaceMembers, {
      workspaceSlug: workspace.workspaceSlug,
    });

    expect(result.members).toHaveLength(3);
    expect(result.members[0].userId).toBe(String(workspace.adminUserId));
    expect(result.members[0].isViewer).toBe(true);

    const namesAfterViewer = result.members.slice(1).map((entry: any) => entry.name);
    expect(namesAfterViewer).toEqual(["Member User", "Owner User"]);

    const adminMember = result.members.find((entry: any) => entry.userId === String(workspace.adminUserId));
    expect(adminMember?.avatarUrl).toContain("http");
    expect(adminMember?.avatarUrl).not.toBe("https://example.com/admin-fallback-avatar.png");

    const ownerMember = result.members.find((entry: any) => entry.userId === String(workspace.ownerUserId));
    expect(ownerMember?.avatarUrl).toBe("https://example.com/owner-avatar.png");
  });

  test("listWorkspaceMembers enforces workspace membership", async () => {
    const workspace = await seedWorkspace();

    await expect(
      asOutsider().query(api.collaboration.listWorkspaceMembers, {
        workspaceSlug: workspace.workspaceSlug,
      }),
    ).rejects.toThrow("Forbidden");
  });

  test("comments and dashboard include stable user ids for identity attribution", async () => {
    const workspace = await seedWorkspace();

    const comments = await asOwner().query(api.comments.listForProject, {
      projectPublicId: workspace.projectPublicId,
    });
    expect(comments).toHaveLength(1);
    expect(comments[0].author.userId).toBe(String(workspace.memberUserId));
    expect(comments[0].reactions?.[0]?.userIds ?? []).toContain(String(workspace.adminUserId));
    expect(comments[0].reactions?.[0]?.users ?? []).toContain("Admin User");

    const snapshot = await asOwner().query(api.dashboard.getSnapshot, {
      activeWorkspaceSlug: workspace.workspaceSlug,
    });
    expect(snapshot.projects).toHaveLength(1);
    expect(snapshot.projects[0].creator.userId).toBe(String(workspace.ownerUserId));
    expect(snapshot.projects[0].creator.name).toBe("Owner User");
    expect(snapshot.projects[0].creator.avatarUrl).toBe("https://example.com/owner-avatar.png");
    expect(snapshot.workspaceMembers).toHaveLength(3);
    expect(snapshot.workspaceMembers[0].userId).toBe(String(workspace.ownerUserId));
    expect(snapshot.workspaceMembers[0].isViewer).toBe(true);
    const memberNames = snapshot.workspaceMembers.slice(1).map((member: any) => member.name);
    expect(memberNames).toEqual(["Admin User", "Member User"]);
    expect(
      snapshot.workspaceMembers.find((member: any) => member.userId === String(workspace.ownerUserId)),
    ).toEqual(
      expect.objectContaining({
        email: "owner@example.com",
        role: "owner",
      }),
    );
  });
});
