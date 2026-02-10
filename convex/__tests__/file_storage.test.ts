import { convexTest } from "convex-test";
import workosAuthKitTest from "@convex-dev/workos-authkit/test";
import { beforeEach, describe, expect, test } from "vitest";
import { api, internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import schema from "../schema";

const modules = Object.fromEntries(
  Object.entries(import.meta.glob("../**/*.{ts,tsx}")).filter(
    ([path]) => !path.includes("/__tests__/"),
  ),
) as Record<string, () => Promise<unknown>>;

const IDENTITIES = {
  owner: { subject: "owner-storage-subject" },
  member: { subject: "member-storage-subject" },
  outsider: { subject: "outsider-storage-subject" },
} as const;

type SeededWorkspace = {
  workspaceId: Id<"workspaces">;
  workspaceSlug: string;
  ownerUserId: Id<"users">;
  memberUserId: Id<"users">;
};

type SeededProject = {
  projectId: Id<"projects">;
  projectPublicId: string;
};

const now = () => Date.now();

const sha256Hex = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((entry) => entry.toString(16).padStart(2, "0"))
    .join("");
};

describe("P0.2 file storage pipeline", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    t = convexTest(schema, modules);
    workosAuthKitTest.register(t, "workOSAuthKit");
  });

  const asOwner = () => t.withIdentity(IDENTITIES.owner);
  const asMember = () => t.withIdentity(IDENTITIES.member);
  const asOutsider = () => t.withIdentity(IDENTITIES.outsider);

  const seedWorkspace = async (): Promise<SeededWorkspace> =>
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
      await ctx.db.insert("users", {
        workosUserId: IDENTITIES.outsider.subject,
        name: "Outsider User",
        createdAt,
        updatedAt: createdAt,
      });

      const workspaceSlug = "workspace-storage";
      const workspaceId = await ctx.db.insert("workspaces", {
        slug: workspaceSlug,
        name: "Workspace Storage",
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

      return { workspaceId, workspaceSlug, ownerUserId, memberUserId };
    });

  const seedProject = async (workspace: SeededWorkspace): Promise<SeededProject> =>
    t.run(async (ctx) => {
      const createdAt = now();
      const projectPublicId = "project-storage";
      const projectId = await ctx.db.insert("projects", {
        publicId: projectPublicId,
        workspaceId: workspace.workspaceId,
        creatorUserId: workspace.ownerUserId,
        name: "Storage Project",
        description: "Storage testing project",
        category: "General",
        status: "Review",
        previousStatus: null,
        archived: false,
        archivedAt: null,
        completedAt: null,
        deletedAt: null,
        attachments: [],
        createdAt,
        updatedAt: createdAt,
      });
      return { projectId, projectPublicId };
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

  const storageBlobExists = async (storageId: Id<"_storage">) =>
    t.run(async (ctx) => (await ctx.storage.get(storageId)) !== null);

  test("generateUploadUrl enforces workspace membership", async () => {
    const workspace = await seedWorkspace();

    const allowed = await asMember().mutation(api.files.generateUploadUrl, {
      workspaceSlug: workspace.workspaceSlug,
    });
    expect(allowed.uploadUrl).toContain("http");

    await expect(
      asOutsider().mutation(api.files.generateUploadUrl, {
        workspaceSlug: workspace.workspaceSlug,
      }),
    ).rejects.toThrow("Forbidden");
  });

  test("finalizeProjectUpload stores metadata and supports authorized download URLs", async () => {
    const workspace = await seedWorkspace();
    const project = await seedProject(workspace);
    const stored = await storeBlob("hello world", "text/plain");

    const finalized = await asMember().action(api.files.finalizeProjectUpload, {
      projectPublicId: project.projectPublicId,
      tab: "Assets",
      name: "brief.txt",
      mimeType: stored.mimeType,
      sizeBytes: stored.sizeBytes,
      checksumSha256: stored.checksumSha256,
      storageId: stored.storageId,
    });

    const list = await asMember().query(api.files.listForProject, {
      projectPublicId: project.projectPublicId,
    });
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(finalized.fileId);
    expect(list[0].downloadable).toBe(true);
    expect(list[0].mimeType).toBe("text/plain");
    expect(list[0].sizeBytes).toBe(stored.sizeBytes);

    const download = await asMember().query(api.files.getDownloadUrl, {
      fileId: finalized.fileId,
    });
    expect(download.url).toContain("http");

    await expect(
      asOutsider().query(api.files.getDownloadUrl, {
        fileId: finalized.fileId,
      }),
    ).rejects.toThrow("Forbidden");
  });

  test("unsupported extension is rejected and uploaded blob is rolled back", async () => {
    const workspace = await seedWorkspace();
    const project = await seedProject(workspace);
    const stored = await storeBlob("echo hi", "text/plain");

    await expect(
      asMember().action(api.files.finalizeProjectUpload, {
        projectPublicId: project.projectPublicId,
        tab: "Assets",
        name: "shell.sh",
        mimeType: stored.mimeType,
        sizeBytes: stored.sizeBytes,
        checksumSha256: stored.checksumSha256,
        storageId: stored.storageId,
      }),
    ).rejects.toThrow("Unsupported file type");

    const listed = await asMember().query(api.files.listForProject, {
      projectPublicId: project.projectPublicId,
    });
    expect(listed).toHaveLength(0);
    await expect(storageBlobExists(stored.storageId)).resolves.toBe(false);
  });

  test("fig uploads require strict MIME type and valid fig header signature", async () => {
    const workspace = await seedWorkspace();
    const project = await seedProject(workspace);

    const genericMimeFig = await storeBlob("fig-kiwi-invalid-mime", "application/octet-stream");
    await expect(
      asMember().action(api.files.finalizeProjectUpload, {
        projectPublicId: project.projectPublicId,
        tab: "Assets",
        name: "design.fig",
        mimeType: genericMimeFig.mimeType,
        sizeBytes: genericMimeFig.sizeBytes,
        checksumSha256: genericMimeFig.checksumSha256,
        storageId: genericMimeFig.storageId,
      }),
    ).rejects.toThrow("Unsupported file type");
    await expect(storageBlobExists(genericMimeFig.storageId)).resolves.toBe(false);

    const invalidSignatureFig = await storeBlob("not-a-fig-header", "application/x-fig");
    await expect(
      asMember().action(api.files.finalizeProjectUpload, {
        projectPublicId: project.projectPublicId,
        tab: "Assets",
        name: "wireframe.fig",
        mimeType: invalidSignatureFig.mimeType,
        sizeBytes: invalidSignatureFig.sizeBytes,
        checksumSha256: invalidSignatureFig.checksumSha256,
        storageId: invalidSignatureFig.storageId,
      }),
    ).rejects.toThrow("Invalid Figma file content");
    await expect(storageBlobExists(invalidSignatureFig.storageId)).resolves.toBe(false);

    const validFig = await storeBlob("fig-kiwi-valid-file", "application/x-fig");
    await asMember().action(api.files.finalizeProjectUpload, {
      projectPublicId: project.projectPublicId,
      tab: "Assets",
      name: "valid.fig",
      mimeType: validFig.mimeType,
      sizeBytes: validFig.sizeBytes,
      checksumSha256: validFig.checksumSha256,
      storageId: validFig.storageId,
    });
  });

  test("duplicate names auto-rename and max file count is enforced", async () => {
    const workspace = await seedWorkspace();
    const project = await seedProject(workspace);

    const first = await storeBlob("file-1", "application/pdf");
    const second = await storeBlob("file-2", "application/pdf");

    const firstUpload = await asMember().action(api.files.finalizeProjectUpload, {
      projectPublicId: project.projectPublicId,
      tab: "Assets",
      name: "proposal.pdf",
      mimeType: first.mimeType,
      sizeBytes: first.sizeBytes,
      checksumSha256: first.checksumSha256,
      storageId: first.storageId,
    });

    const secondUpload = await asMember().action(api.files.finalizeProjectUpload, {
      projectPublicId: project.projectPublicId,
      tab: "Assets",
      name: "proposal.pdf",
      mimeType: second.mimeType,
      sizeBytes: second.sizeBytes,
      checksumSha256: second.checksumSha256,
      storageId: second.storageId,
    });

    const listed = await asMember().query(api.files.listForProject, {
      projectPublicId: project.projectPublicId,
    });
    const names = listed.map((entry: any) => entry.name);
    expect(names).toContain("proposal.pdf");
    expect(names).toContain("proposal (2).pdf");
    expect(secondUpload.name).toBe("proposal (2).pdf");
    expect(firstUpload.name).toBe("proposal.pdf");

    await t.run(async (ctx) => {
      const createdAt = now();
      for (let i = 0; i < 23; i += 1) {
        await ctx.db.insert("projectFiles", {
          workspaceId: workspace.workspaceId,
          projectId: project.projectId,
          projectPublicId: project.projectPublicId,
          tab: "Assets",
          name: `seed-${i}.pdf`,
          type: "PDF",
          displayDateEpochMs: createdAt,
          deletedAt: null,
          purgeAfterAt: null,
          createdAt,
          updatedAt: createdAt,
        });
      }
    });

    const overflow = await storeBlob("overflow", "application/pdf");
    await expect(
      asMember().action(api.files.finalizeProjectUpload, {
        projectPublicId: project.projectPublicId,
        tab: "Assets",
        name: "overflow.pdf",
        mimeType: overflow.mimeType,
        sizeBytes: overflow.sizeBytes,
        checksumSha256: overflow.checksumSha256,
        storageId: overflow.storageId,
      }),
    ).rejects.toThrow("File limit reached for this project");
  });

  test("remove performs logical delete, hides from queries, and blocks downloads", async () => {
    const workspace = await seedWorkspace();
    const project = await seedProject(workspace);
    const stored = await storeBlob("remove-me", "text/plain");

    const uploaded = await asMember().action(api.files.finalizeProjectUpload, {
      projectPublicId: project.projectPublicId,
      tab: "Assets",
      name: "remove.txt",
      mimeType: stored.mimeType,
      sizeBytes: stored.sizeBytes,
      checksumSha256: stored.checksumSha256,
      storageId: stored.storageId,
    });

    await asMember().mutation(api.files.remove, { fileId: uploaded.fileId });

    await t.run(async (ctx) => {
      const row = await ctx.db.get(uploaded.fileId as Id<"projectFiles">);
      expect(row?.deletedAt).not.toBeNull();
      expect(row?.purgeAfterAt).not.toBeNull();
    });

    const listed = await asMember().query(api.files.listForWorkspace, {
      workspaceSlug: workspace.workspaceSlug,
    });
    expect(listed).toHaveLength(0);

    await expect(
      asMember().query(api.files.getDownloadUrl, { fileId: uploaded.fileId }),
    ).rejects.toThrow("File not found");
  });

  test("archived/completed projects block file mutations but keep download access", async () => {
    const workspace = await seedWorkspace();
    const project = await seedProject(workspace);
    const baselineStored = await storeBlob("baseline", "text/plain");

    const uploaded = await asMember().action(api.files.finalizeProjectUpload, {
      projectPublicId: project.projectPublicId,
      tab: "Assets",
      name: "baseline.txt",
      mimeType: baselineStored.mimeType,
      sizeBytes: baselineStored.sizeBytes,
      checksumSha256: baselineStored.checksumSha256,
      storageId: baselineStored.storageId,
    });

    await asOwner().mutation(api.projects.setStatus, {
      publicId: project.projectPublicId,
      status: "Completed",
    });

    const completedBlockedUpload = await storeBlob("completed-blocked", "text/plain");
    await expect(
      asMember().action(api.files.finalizeProjectUpload, {
        projectPublicId: project.projectPublicId,
        tab: "Assets",
        name: "completed-blocked.txt",
        mimeType: completedBlockedUpload.mimeType,
        sizeBytes: completedBlockedUpload.sizeBytes,
        checksumSha256: completedBlockedUpload.checksumSha256,
        storageId: completedBlockedUpload.storageId,
      }),
    ).rejects.toThrow("Files can only be modified for active projects");
    await expect(storageBlobExists(completedBlockedUpload.storageId)).resolves.toBe(false);

    await expect(
      asMember().mutation(api.files.remove, { fileId: uploaded.fileId }),
    ).rejects.toThrow("Files can only be modified for active projects");

    const completedDownload = await asMember().query(api.files.getDownloadUrl, {
      fileId: uploaded.fileId,
    });
    expect(completedDownload.url).toContain("http");

    await asOwner().mutation(api.projects.setStatus, {
      publicId: project.projectPublicId,
      status: "Active",
    });
    await asOwner().mutation(api.projects.archive, {
      publicId: project.projectPublicId,
    });

    const archivedBlockedUpload = await storeBlob("archived-blocked", "text/plain");
    await expect(
      asMember().action(api.files.finalizeProjectUpload, {
        projectPublicId: project.projectPublicId,
        tab: "Assets",
        name: "archived-blocked.txt",
        mimeType: archivedBlockedUpload.mimeType,
        sizeBytes: archivedBlockedUpload.sizeBytes,
        checksumSha256: archivedBlockedUpload.checksumSha256,
        storageId: archivedBlockedUpload.storageId,
      }),
    ).rejects.toThrow("Files can only be modified for active projects");
    await expect(storageBlobExists(archivedBlockedUpload.storageId)).resolves.toBe(false);

    await expect(
      asMember().mutation(api.files.remove, { fileId: uploaded.fileId }),
    ).rejects.toThrow("Files can only be modified for active projects");

    const archivedDownload = await asMember().query(api.files.getDownloadUrl, {
      fileId: uploaded.fileId,
    });
    expect(archivedDownload.url).toContain("http");
  });

  test("pending draft uploads are consumed on project create and can be discarded", async () => {
    const workspace = await seedWorkspace();
    const pendingStored = await storeBlob("draft-file", "application/pdf");
    const draftSessionId = "draft-session-1";

    const pending = await asMember().action(api.files.finalizePendingDraftAttachmentUpload, {
      workspaceSlug: workspace.workspaceSlug,
      draftSessionId,
      name: "brief.pdf",
      mimeType: pendingStored.mimeType,
      sizeBytes: pendingStored.sizeBytes,
      checksumSha256: pendingStored.checksumSha256,
      storageId: pendingStored.storageId,
    });

    const created = await asMember().mutation(api.projects.create, {
      workspaceSlug: workspace.workspaceSlug,
      name: "Draft Upload Project",
      category: "General",
      status: "Draft",
      attachmentPendingUploadIds: [pending.pendingUploadId],
    });

    await t.run(async (ctx) => {
      const pendingRow = await ctx.db.get(pending.pendingUploadId as Id<"pendingFileUploads">);
      expect(pendingRow).toBeNull();

      const files = await (ctx.db as any)
        .query("projectFiles")
        .withIndex("by_projectId", (q: any) => q.eq("projectId", created.projectId))
        .collect();
      expect(files.length).toBe(1);
      expect(files[0].tab).toBe("Attachments");
      expect(files[0].source).toBe("importedAttachment");
      expect(files[0].storageId).toBe(pendingStored.storageId);

      const project = await ctx.db.get(created.projectId);
      expect(project?.attachments?.length).toBe(1);
    });

    const discardStored = await storeBlob("discard-me", "application/pdf");
    const pendingToDiscard = await asMember().action(api.files.finalizePendingDraftAttachmentUpload, {
      workspaceSlug: workspace.workspaceSlug,
      draftSessionId: "draft-session-2",
      name: "discard.pdf",
      mimeType: discardStored.mimeType,
      sizeBytes: discardStored.sizeBytes,
      checksumSha256: discardStored.checksumSha256,
      storageId: discardStored.storageId,
    });

    await asMember().mutation(api.files.discardPendingUpload, {
      pendingUploadId: pendingToDiscard.pendingUploadId,
    });

    await t.run(async (ctx) => {
      const pendingRow = await ctx.db.get(pendingToDiscard.pendingUploadId as Id<"pendingFileUploads">);
      expect(pendingRow).toBeNull();
      const metadata = await ctx.db.system.get(discardStored.storageId);
      expect(metadata).toBeNull();
    });
  });

  test("internal purge removes expired deleted files, stale pending uploads, and legacy cleanup works", async () => {
    const workspace = await seedWorkspace();
    const project = await seedProject(workspace);
    const deletedStored = await storeBlob("expired-file", "application/pdf");
    const stalePendingStored = await storeBlob("stale-pending", "application/pdf");

    const seeded = await t.run(async (ctx) => {
      const seededNow = now();
      const fileId = await ctx.db.insert("projectFiles", {
        workspaceId: workspace.workspaceId,
        projectId: project.projectId,
        projectPublicId: project.projectPublicId,
        tab: "Assets",
        name: "expired.pdf",
        type: "PDF",
        storageId: deletedStored.storageId,
        mimeType: "application/pdf",
        sizeBytes: deletedStored.sizeBytes,
        checksumSha256: deletedStored.checksumSha256,
        displayDateEpochMs: seededNow,
        deletedAt: seededNow - (35 * 24 * 60 * 60 * 1000),
        purgeAfterAt: seededNow - 1,
        createdAt: seededNow,
        updatedAt: seededNow,
      });

      const pendingId = await ctx.db.insert("pendingFileUploads", {
        workspaceId: workspace.workspaceId,
        uploaderUserId: workspace.memberUserId,
        draftSessionId: "stale-session",
        name: "stale.pdf",
        mimeType: "application/pdf",
        sizeBytes: stalePendingStored.sizeBytes,
        checksumSha256: stalePendingStored.checksumSha256,
        storageId: stalePendingStored.storageId,
        consumedAt: null,
        createdAt: seededNow - (2 * 24 * 60 * 60 * 1000),
        updatedAt: seededNow - (2 * 24 * 60 * 60 * 1000),
      });

      const legacyFileId = await ctx.db.insert("projectFiles", {
        workspaceId: workspace.workspaceId,
        projectId: project.projectId,
        projectPublicId: project.projectPublicId,
        tab: "Assets",
        name: "legacy.txt",
        type: "TXT",
        displayDateEpochMs: seededNow,
        createdAt: seededNow,
        updatedAt: seededNow,
      });

      return { fileId, pendingId, legacyFileId };
    });

    await asOwner().mutation(internal.files.internalPurgeDeletedFiles, {});

    await t.run(async (ctx) => {
      expect(await ctx.db.get(seeded.fileId)).toBeNull();
      expect(await ctx.db.get(seeded.pendingId)).toBeNull();
      expect(await ctx.db.system.get(deletedStored.storageId)).toBeNull();
      expect(await ctx.db.system.get(stalePendingStored.storageId)).toBeNull();
    });

    const dryRun = await asOwner().mutation(internal.files.runLegacyMetadataCleanup, {
      dryRun: true,
      batchSize: 10,
    });
    expect(dryRun.targetCount).toBe(1);
    expect(dryRun.deletedCount).toBe(0);

    const execute = await asOwner().mutation(internal.files.runLegacyMetadataCleanup, {
      dryRun: false,
      batchSize: 10,
    });
    expect(execute.deletedCount).toBe(1);

    await t.run(async (ctx) => {
      expect(await ctx.db.get(seeded.legacyFileId)).toBeNull();
    });
  });
});
