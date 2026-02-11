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
  owner: { subject: "owner-performance-subject" },
} as const;

const PROJECT_COUNT = 50;
const TASKS_PER_PROJECT = 100;
const FILES_PER_PROJECT = 40;
const COMMENT_COUNT = 1000;
const REPLIES_PER_SEEDED_THREAD = 3;

type SeededWorkspace = {
  workspaceSlug: string;
  projectPublicIds: string[];
  replyParentCommentId: Id<"projectComments">;
};

describe("performance scaling query contracts", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    t = convexTest(schema, modules);
    workosAuthKitTest.register(t, "workOSAuthKit");
  });

  const asOwner = () => t.withIdentity(IDENTITIES.owner);

  const seedLargeWorkspace = async (): Promise<SeededWorkspace> =>
    t.run(async (ctx) => {
      const createdAt = Date.now();
      const ownerUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.owner.subject,
        name: "Performance Owner",
        email: "perf-owner@example.com",
        createdAt,
        updatedAt: createdAt,
      });
      const workspaceSlug = "workspace-performance";
      const workspaceId = await ctx.db.insert("workspaces", {
        slug: workspaceSlug,
        name: "Workspace Performance",
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

      const projectRows: Array<{ id: Id<"projects">; publicId: string }> = [];
      for (let index = 0; index < PROJECT_COUNT; index += 1) {
        const publicId = `perf-project-${index + 1}`;
        const projectId = await ctx.db.insert("projects", {
          publicId,
          workspaceId,
          creatorUserId: ownerUserId,
          creatorSnapshotName: "Performance Owner",
          creatorSnapshotAvatarUrl: "",
          name: `Perf Project ${index + 1}`,
          description: "Perf seeded project",
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
        projectRows.push({ id: projectId, publicId });
      }

      let taskPosition = 0;
      for (const project of projectRows) {
        for (let index = 0; index < TASKS_PER_PROJECT; index += 1) {
          await ctx.db.insert("tasks", {
            workspaceId,
            projectId: project.id,
            projectPublicId: project.publicId,
            projectDeletedAt: null,
            taskId: `perf-task-${taskPosition + 1}`,
            title: `Perf task ${taskPosition + 1}`,
            assignee: { userId: String(ownerUserId), name: "Performance Owner", avatar: "" },
            dueDateEpochMs: null,
            completed: false,
            position: taskPosition,
            createdAt,
            updatedAt: createdAt,
          });
          taskPosition += 1;
        }
      }

      const sharedStorageId = await ctx.storage.store(
        new Blob(["performance-file-seed"], { type: "application/octet-stream" }),
      );

      for (const project of projectRows) {
        for (let index = 0; index < FILES_PER_PROJECT; index += 1) {
          const fileIndex = index + 1;
          await ctx.db.insert("projectFiles", {
            workspaceId,
            projectId: project.id,
            projectPublicId: project.publicId,
            projectDeletedAt: null,
            tab: "Assets",
            name: `perf-file-${project.publicId}-${fileIndex}.png`,
            type: "PNG",
            storageId: sharedStorageId,
            mimeType: "image/png",
            sizeBytes: 1,
            checksumSha256: "performance-seed",
            displayDateEpochMs: createdAt + fileIndex,
            deletedAt: null,
            createdAt,
            updatedAt: createdAt,
          });
        }
      }

      const commentsProject = projectRows[0];
      const replyParentCommentIds: Id<"projectComments">[] = [];
      for (let index = 0; index < COMMENT_COUNT; index += 1) {
        const commentId = await ctx.db.insert("projectComments", {
          workspaceId,
          projectId: commentsProject.id,
          projectPublicId: commentsProject.publicId,
          authorUserId: ownerUserId,
          authorSnapshotName: "Performance Owner",
          authorSnapshotAvatarUrl: "",
          content: `Perf comment ${index + 1}`,
          resolved: false,
          edited: false,
          createdAt: createdAt + index,
          updatedAt: createdAt + index,
        });
        if (index % 200 === 0) {
          replyParentCommentIds.push(commentId);
        }

        if (index % 20 === 0) {
          await ctx.db.insert("commentReactions", {
            commentId,
            projectPublicId: commentsProject.publicId,
            workspaceId,
            emoji: "👍",
            userId: ownerUserId,
            createdAt: createdAt + index,
          });
        }
      }
      for (const [threadIndex, parentCommentId] of replyParentCommentIds.entries()) {
        for (let replyIndex = 0; replyIndex < REPLIES_PER_SEEDED_THREAD; replyIndex += 1) {
          const ts = createdAt + COMMENT_COUNT + threadIndex * 10 + replyIndex;
          await ctx.db.insert("projectComments", {
            workspaceId,
            projectId: commentsProject.id,
            projectPublicId: commentsProject.publicId,
            parentCommentId,
            authorUserId: ownerUserId,
            authorSnapshotName: "Performance Owner",
            authorSnapshotAvatarUrl: "",
            content: `Perf reply ${threadIndex + 1}-${replyIndex + 1}`,
            resolved: false,
            edited: false,
            createdAt: ts,
            updatedAt: ts,
          });
        }
      }

      return {
        workspaceSlug,
        projectPublicIds: projectRows.map((project) => project.publicId),
        replyParentCommentId: replyParentCommentIds[0],
      };
    });

  test("serves 5k-task scale with scoped payload contracts", async () => {
    const seeded = await seedLargeWorkspace();

    const workspaceContext = await asOwner().query(api.dashboard.getWorkspaceBootstrap, {
      activeWorkspaceSlug: seeded.workspaceSlug,
    });
    expect(workspaceContext.activeWorkspaceSlug).toBe(seeded.workspaceSlug);
    expect("projects" in workspaceContext).toBe(false);
    expect("tasks" in workspaceContext).toBe(false);

    const projectsPage = await asOwner().query(api.projects.listForWorkspace, {
      workspaceSlug: seeded.workspaceSlug,
      includeArchived: true,
      paginationOpts: { cursor: null, numItems: 200 },
    });
    expect(projectsPage.page).toHaveLength(PROJECT_COUNT);
    expect(projectsPage.isDone).toBe(true);

    const tasksFirstPage = await asOwner().query(api.tasks.listForWorkspace, {
      workspaceSlug: seeded.workspaceSlug,
      paginationOpts: { cursor: null, numItems: 300 },
    });
    expect(tasksFirstPage.page).toHaveLength(300);
    expect(tasksFirstPage.page[0]?.position).toBe(0);
    expect(tasksFirstPage.isDone).toBe(false);
    expect(tasksFirstPage.continueCursor).toBeTypeOf("string");

    const tasksSecondPage = await asOwner().query(api.tasks.listForWorkspace, {
      workspaceSlug: seeded.workspaceSlug,
      paginationOpts: { cursor: tasksFirstPage.continueCursor, numItems: 300 },
    });
    expect(tasksSecondPage.page).toHaveLength(300);
    expect(tasksSecondPage.page[0]?.position).toBe(300);

    const filesFirstPage = await asOwner().query(api.files.listForWorkspace, {
      workspaceSlug: seeded.workspaceSlug,
      paginationOpts: { cursor: null, numItems: 250 },
    });
    expect(filesFirstPage.page).toHaveLength(250);
    expect(filesFirstPage.isDone).toBe(false);

    const filesSecondPage = await asOwner().query(api.files.listForWorkspace, {
      workspaceSlug: seeded.workspaceSlug,
      paginationOpts: { cursor: filesFirstPage.continueCursor, numItems: 250 },
    });
    expect(filesSecondPage.page).toHaveLength(250);

    const comments = await asOwner().query(api.comments.listForProject, {
      projectPublicId: seeded.projectPublicIds[0],
    });
    expect(comments).toHaveLength(COMMENT_COUNT);
    expect(comments[0]?.content).toBe(`Perf comment ${COMMENT_COUNT}`);
    expect(comments.some((comment: any) =>
      comment.reactions.some((reaction: any) =>
        reaction.emoji === "👍" && reaction.userIds.length > 0))).toBe(true);

    const paginatedThreadsFirstPage = await asOwner().query(api.comments.listThreadsPaginated, {
      projectPublicId: seeded.projectPublicIds[0],
      paginationOpts: { cursor: null, numItems: 250 },
    });
    expect(paginatedThreadsFirstPage.page).toHaveLength(250);
    expect(paginatedThreadsFirstPage.page[0]?.content).toBe(`Perf comment ${COMMENT_COUNT}`);
    expect(paginatedThreadsFirstPage.page[0]?.parentCommentId).toBeNull();
    expect(paginatedThreadsFirstPage.isDone).toBe(false);
    expect(paginatedThreadsFirstPage.continueCursor).toBeTypeOf("string");

    const paginatedThreadsSecondPage = await asOwner().query(api.comments.listThreadsPaginated, {
      projectPublicId: seeded.projectPublicIds[0],
      paginationOpts: { cursor: paginatedThreadsFirstPage.continueCursor, numItems: 250 },
    });
    expect(paginatedThreadsSecondPage.page).toHaveLength(250);
    expect(paginatedThreadsSecondPage.page[0]?.content).toBe(`Perf comment ${COMMENT_COUNT - 250}`);

    const paginatedReplies = await asOwner().query(api.comments.listReplies, {
      parentCommentId: seeded.replyParentCommentId,
      paginationOpts: { cursor: null, numItems: 10 },
    });
    expect(paginatedReplies.page).toHaveLength(REPLIES_PER_SEEDED_THREAD);
    expect(
      paginatedReplies.page.every(
        (reply: any) => reply.parentCommentId === String(seeded.replyParentCommentId),
      ),
    ).toBe(true);
  }, 30_000);

  test("filters workspace bootstrap access across many org-linked memberships", async () => {
    const seeded = await t.run(async (ctx) => {
      const createdAt = Date.now();
      const ownerUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.owner.subject,
        name: "Multi Workspace Owner",
        email: "multi-owner@example.com",
        createdAt,
        updatedAt: createdAt,
      });
      const expectedAccessibleSlugs: string[] = [];

      for (let index = 0; index < 24; index += 1) {
        const workspaceSlug = `workspace-multi-${index + 1}`;
        const workosOrganizationId = `org-${index + 1}`;
        const workspaceId = await ctx.db.insert("workspaces", {
          slug: workspaceSlug,
          name: `Workspace Multi ${index + 1}`,
          plan: "Pro",
          ownerUserId,
          workosOrganizationId,
          createdAt,
          updatedAt: createdAt,
        });
        await ctx.db.insert("workspaceMembers", {
          workspaceId,
          userId: ownerUserId,
          role: "owner",
          status: "active",
          joinedAt: createdAt + index,
          createdAt: createdAt + index,
          updatedAt: createdAt + index,
        });

        const membershipStatus = index % 2 === 0 ? "active" : "inactive";
        if (membershipStatus === "active") {
          expectedAccessibleSlugs.push(workspaceSlug);
        }
        await ctx.db.insert("workosOrganizationMemberships", {
          membershipId: `membership-${index + 1}`,
          workosOrganizationId,
          workosUserId: IDENTITIES.owner.subject,
          organizationName: `Org ${index + 1}`,
          roleSlug: "admin",
          status: membershipStatus,
          createdAt: createdAt + index,
          updatedAt: createdAt + index,
        });
      }

      return { expectedAccessibleSlugs };
    });

    const snapshot = await asOwner().query(api.dashboard.getWorkspaceBootstrap, {
      activeWorkspaceSlug: seeded.expectedAccessibleSlugs[0],
    });
    expect(snapshot.workspaces.map((workspace: any) => workspace.slug)).toEqual(
      [...seeded.expectedAccessibleSlugs].sort((a, b) => a.localeCompare(b)),
    );
    expect(snapshot.activeWorkspaceSlug).toBe(seeded.expectedAccessibleSlugs[0]);
  });
});
