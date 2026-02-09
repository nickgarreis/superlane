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
  owner: { subject: "owner-comments-subject" },
  member: { subject: "member-comments-subject" },
  memberTwo: { subject: "member-two-comments-subject" },
  outsider: { subject: "outsider-comments-subject" },
} as const;

type SeededWorkspace = {
  workspaceId: Id<"workspaces">;
  workspaceSlug: string;
  ownerUserId: Id<"users">;
  memberUserId: Id<"users">;
  memberTwoUserId: Id<"users">;
  projectPublicId: string;
  commentId: Id<"projectComments">;
};

const now = () => Date.now();

const sha256Hex = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((entry) => entry.toString(16).padStart(2, "0"))
    .join("");
};

describe("P2.2 critical test gaps: comments + pending uploads", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    t = convexTest(schema, modules);
    workosAuthKitTest.register(t, "workOSAuthKit");
  });

  const asOwner = () => t.withIdentity(IDENTITIES.owner);
  const asMember = () => t.withIdentity(IDENTITIES.member);
  const asMemberTwo = () => t.withIdentity(IDENTITIES.memberTwo);
  const asOutsider = () => t.withIdentity(IDENTITIES.outsider);

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

  const seedWorkspaceWithProjectComment = async (): Promise<SeededWorkspace> =>
    t.run(async (ctx) => {
      const createdAt = now();
      const ownerUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.owner.subject,
        name: "Owner User",
        createdAt,
        updatedAt: createdAt,
      });
      const memberUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.member.subject,
        name: "Member User",
        createdAt,
        updatedAt: createdAt,
      });
      const memberTwoUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.memberTwo.subject,
        name: "Member Two User",
        createdAt,
        updatedAt: createdAt,
      });

      const workspaceSlug = "workspace-comments";
      const workspaceId = await ctx.db.insert("workspaces", {
        slug: workspaceSlug,
        name: "Workspace Comments",
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
        userId: memberUserId,
        role: "member",
        status: "active",
        joinedAt: createdAt,
        createdAt,
        updatedAt: createdAt,
      });
      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId: memberTwoUserId,
        role: "member",
        status: "active",
        joinedAt: createdAt,
        createdAt,
        updatedAt: createdAt,
      });

      const projectPublicId = "project-comments";
      const projectId = await ctx.db.insert("projects", {
        publicId: projectPublicId,
        workspaceId,
        creatorUserId: ownerUserId,
        name: "Comments Project",
        description: "Comments testing project",
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
        content: "Initial comment",
        resolved: false,
        edited: false,
        createdAt,
        updatedAt: createdAt,
      });

      return {
        workspaceId,
        workspaceSlug,
        ownerUserId,
        memberUserId,
        memberTwoUserId,
        projectPublicId,
        commentId,
      };
    });

  test("toggleReaction supports add/remove semantics and multi-user reaction attribution", async () => {
    const seeded = await seedWorkspaceWithProjectComment();

    const first = await asOwner().mutation(api.comments.toggleReaction, {
      commentId: seeded.commentId,
      emoji: "🔥",
    });
    expect(first.active).toBe(true);

    const second = await asOwner().mutation(api.comments.toggleReaction, {
      commentId: seeded.commentId,
      emoji: "🔥",
    });
    expect(second.active).toBe(false);

    const third = await asMemberTwo().mutation(api.comments.toggleReaction, {
      commentId: seeded.commentId,
      emoji: "🔥",
    });
    expect(third.active).toBe(true);

    const comments = await asMember().query(api.comments.listForProject, {
      projectPublicId: seeded.projectPublicId,
    });
    expect(comments).toHaveLength(1);
    const reaction = (comments[0].reactions ?? []).find((entry: any) => entry.emoji === "🔥");
    expect(reaction).toBeDefined();
    expect(reaction?.userIds ?? []).toEqual([String(seeded.memberTwoUserId)]);

    await expect(
      asOutsider().mutation(api.comments.toggleReaction, {
        commentId: seeded.commentId,
        emoji: "🔥",
      }),
    ).rejects.toThrow("Forbidden");
  });

  test("discardPendingUploadsForSession removes only current uploader rows and is idempotent", async () => {
    const seeded = await seedWorkspaceWithProjectComment();

    const sameSessionOne = await storeBlob("same-session-1", "application/pdf");
    const sameSessionTwo = await storeBlob("same-session-2", "application/pdf");
    const differentSession = await storeBlob("different-session", "application/pdf");
    const ownerSession = await storeBlob("owner-session", "application/pdf");

    const draftSessionId = "draft-session-owner-check";

    const uploadOne = await asMember().action(api.files.finalizePendingDraftAttachmentUpload, {
      workspaceSlug: seeded.workspaceSlug,
      draftSessionId,
      name: "same-1.pdf",
      mimeType: sameSessionOne.mimeType,
      sizeBytes: sameSessionOne.sizeBytes,
      checksumSha256: sameSessionOne.checksumSha256,
      storageId: sameSessionOne.storageId,
    });

    const uploadTwo = await asMember().action(api.files.finalizePendingDraftAttachmentUpload, {
      workspaceSlug: seeded.workspaceSlug,
      draftSessionId,
      name: "same-2.pdf",
      mimeType: sameSessionTwo.mimeType,
      sizeBytes: sameSessionTwo.sizeBytes,
      checksumSha256: sameSessionTwo.checksumSha256,
      storageId: sameSessionTwo.storageId,
    });

    const uploadDifferent = await asMember().action(api.files.finalizePendingDraftAttachmentUpload, {
      workspaceSlug: seeded.workspaceSlug,
      draftSessionId: "draft-session-other",
      name: "different.pdf",
      mimeType: differentSession.mimeType,
      sizeBytes: differentSession.sizeBytes,
      checksumSha256: differentSession.checksumSha256,
      storageId: differentSession.storageId,
    });

    const uploadOwner = await asOwner().action(api.files.finalizePendingDraftAttachmentUpload, {
      workspaceSlug: seeded.workspaceSlug,
      draftSessionId,
      name: "owner.pdf",
      mimeType: ownerSession.mimeType,
      sizeBytes: ownerSession.sizeBytes,
      checksumSha256: ownerSession.checksumSha256,
      storageId: ownerSession.storageId,
    });

    const removed = await asMember().mutation(api.files.discardPendingUploadsForSession, {
      workspaceSlug: seeded.workspaceSlug,
      draftSessionId,
    });
    expect(removed.removedCount).toBe(2);

    await t.run(async (ctx) => {
      expect(await ctx.db.get(uploadOne.pendingUploadId as Id<"pendingFileUploads">)).toBeNull();
      expect(await ctx.db.get(uploadTwo.pendingUploadId as Id<"pendingFileUploads">)).toBeNull();
      expect(await ctx.db.get(uploadDifferent.pendingUploadId as Id<"pendingFileUploads">)).not.toBeNull();
      expect(await ctx.db.get(uploadOwner.pendingUploadId as Id<"pendingFileUploads">)).not.toBeNull();

      expect(await ctx.db.system.get(sameSessionOne.storageId)).toBeNull();
      expect(await ctx.db.system.get(sameSessionTwo.storageId)).toBeNull();
      expect(await ctx.db.system.get(differentSession.storageId)).not.toBeNull();
      expect(await ctx.db.system.get(ownerSession.storageId)).not.toBeNull();
    });

    const repeated = await asMember().mutation(api.files.discardPendingUploadsForSession, {
      workspaceSlug: seeded.workspaceSlug,
      draftSessionId,
    });
    expect(repeated.removedCount).toBe(0);

    await expect(
      asOutsider().mutation(api.files.discardPendingUploadsForSession, {
        workspaceSlug: seeded.workspaceSlug,
        draftSessionId,
      }),
    ).rejects.toThrow("Forbidden");
  });
});
