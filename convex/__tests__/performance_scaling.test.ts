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

type SeededWorkspace = {
  workspaceSlug: string;
  projectPublicIds: string[];
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

      return {
        workspaceSlug,
        projectPublicIds: projectRows.map((project) => project.publicId),
      };
    });

  test("serves 5k-task scale with scoped payload contracts", async () => {
    const seeded = await seedLargeWorkspace();

    const workspaceContext = await asOwner().query(api.dashboard.getWorkspaceContext, {
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

    const tasksPage = await asOwner().query(api.tasks.listForWorkspace, {
      workspaceSlug: seeded.workspaceSlug,
      paginationOpts: { cursor: null, numItems: 6000 },
    });
    expect(tasksPage.page).toHaveLength(PROJECT_COUNT * TASKS_PER_PROJECT);
    expect(tasksPage.page[0]?.position).toBe(0);
    expect(tasksPage.page[tasksPage.page.length - 1]?.position).toBe((PROJECT_COUNT * TASKS_PER_PROJECT) - 1);
    expect(tasksPage.isDone).toBe(true);

    const filesPage = await asOwner().query(api.files.listForWorkspace, {
      workspaceSlug: seeded.workspaceSlug,
      paginationOpts: { cursor: null, numItems: 2500 },
    });
    expect(filesPage.page).toHaveLength(PROJECT_COUNT * FILES_PER_PROJECT);
    expect(filesPage.isDone).toBe(true);

    const comments = await asOwner().query(api.comments.listForProject, {
      projectPublicId: seeded.projectPublicIds[0],
    });
    expect(comments).toHaveLength(COMMENT_COUNT);
    expect(comments[0]?.content).toBe(`Perf comment ${COMMENT_COUNT}`);
    expect(comments.some((comment: any) =>
      comment.reactions.some((reaction: any) =>
        reaction.emoji === "👍" && reaction.userIds.length > 0))).toBe(true);
  }, 30_000);
});
