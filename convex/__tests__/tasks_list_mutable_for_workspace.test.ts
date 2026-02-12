import { convexTest } from "convex-test";
import workosAuthKitTest from "@convex-dev/workos-authkit/test";
import { beforeEach, describe, expect, test } from "vitest";
import type { Id } from "../_generated/dataModel";
import { api } from "../_generated/api";
import schema from "../schema";

const modules = Object.fromEntries(
  Object.entries(import.meta.glob("../**/*.{ts,tsx}")).filter(
    ([path]) => !path.includes("/__tests__/"),
  ),
) as Record<string, () => Promise<unknown>>;

const IDENTITIES = {
  owner: { subject: "owner-task-mutable-subject" },
  member: { subject: "member-task-mutable-subject" },
} as const;

type SeededWorkspace = {
  workspaceId: Id<"workspaces">;
  workspaceSlug: string;
  ownerUserId: Id<"users">;
  memberUserId: Id<"users">;
};

const now = () => Date.now();

describe("tasks.listMutableForWorkspace", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    t = convexTest(schema, modules);
    workosAuthKitTest.register(t, "workOSAuthKit");
  });

  const asMember = () => t.withIdentity(IDENTITIES.member);

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

      const workspaceSlug = "workspace-task-mutable";
      const workspaceId = await ctx.db.insert("workspaces", {
        slug: workspaceSlug,
        name: "Workspace Task Mutable",
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

  const seedProject = async (
    workspace: SeededWorkspace,
    args: {
      publicId: string;
      status: "Draft" | "Review" | "Active" | "Completed";
      archived?: boolean;
      completedAt?: number | null;
    },
  ) => {
    const projectId = await t.run(async (ctx) =>
      ctx.db.insert("projects", {
        publicId: args.publicId,
        workspaceId: workspace.workspaceId,
        creatorUserId: workspace.ownerUserId,
        name: args.publicId,
        description: `${args.publicId} description`,
        category: "General",
        status: args.status,
        previousStatus: null,
        archived: args.archived ?? false,
        archivedAt: args.archived ? now() : null,
        completedAt: args.completedAt ?? null,
        deletedAt: null,
        createdAt: now(),
        updatedAt: now(),
      }),
    );
    return { projectId, projectPublicId: args.publicId };
  };

  const seedTask = async (
    workspace: SeededWorkspace,
    args: {
      taskId: string;
      projectId?: Id<"projects"> | null;
      projectPublicId?: string | null;
      position: number;
    },
  ) =>
    t.run(async (ctx) => {
      await ctx.db.insert("tasks", {
        workspaceId: workspace.workspaceId,
        projectId: args.projectId ?? null,
        projectPublicId: args.projectPublicId ?? null,
        projectDeletedAt: null,
        taskId: args.taskId,
        title: args.taskId,
        assignee: { userId: String(workspace.memberUserId), name: "Member User", avatar: "" },
        dueDateEpochMs: null,
        completed: false,
        position: args.position,
        createdAt: now(),
        updatedAt: now(),
      });
    });

  test("returns only mutable tasks and paginates across filtered-out rows", async () => {
    const workspace = await seedWorkspace();
    const activeProject = await seedProject(workspace, { publicId: "project-active", status: "Active" });
    const archivedProject = await seedProject(workspace, {
      publicId: "project-archived",
      status: "Active",
      archived: true,
    });
    const completedProject = await seedProject(workspace, {
      publicId: "project-completed",
      status: "Completed",
      completedAt: now(),
    });
    const draftProject = await seedProject(workspace, { publicId: "project-draft", status: "Draft" });
    const reviewProject = await seedProject(workspace, { publicId: "project-review", status: "Review" });

    await seedTask(workspace, {
      taskId: "task-archived",
      projectId: archivedProject.projectId,
      projectPublicId: archivedProject.projectPublicId,
      position: 0,
    });
    await seedTask(workspace, {
      taskId: "task-completed",
      projectId: completedProject.projectId,
      projectPublicId: completedProject.projectPublicId,
      position: 1,
    });
    await seedTask(workspace, {
      taskId: "task-active-1",
      projectId: activeProject.projectId,
      projectPublicId: activeProject.projectPublicId,
      position: 2,
    });
    await seedTask(workspace, { taskId: "task-unassigned", projectPublicId: null, position: 3 });
    await seedTask(workspace, {
      taskId: "task-draft",
      projectId: draftProject.projectId,
      projectPublicId: draftProject.projectPublicId,
      position: 4,
    });
    await seedTask(workspace, {
      taskId: "task-review",
      projectId: reviewProject.projectId,
      projectPublicId: reviewProject.projectPublicId,
      position: 5,
    });
    await seedTask(workspace, {
      taskId: "task-active-2",
      projectId: activeProject.projectId,
      projectPublicId: activeProject.projectPublicId,
      position: 6,
    });

    const collectedTaskIds: string[] = [];
    let cursor: string | null = null;
    let isDone = false;
    let iterationCount = 0;

    while (!isDone && iterationCount < 10) {
      const page: {
        page: Array<{ taskId: string }>;
        isDone: boolean;
        continueCursor: string | null;
      } = await asMember().query(api.tasks.listMutableForWorkspace, {
        workspaceSlug: workspace.workspaceSlug,
        paginationOpts: { cursor, numItems: 2 },
      });
      collectedTaskIds.push(
        ...page.page.map((task: { taskId: string }) => task.taskId),
      );
      isDone = page.isDone;
      cursor = page.continueCursor;
      iterationCount += 1;
    }

    expect(collectedTaskIds).toEqual([
      "task-active-1",
      "task-unassigned",
      "task-active-2",
    ]);
    expect(collectedTaskIds).not.toEqual(
      expect.arrayContaining([
        "task-archived",
        "task-completed",
        "task-draft",
        "task-review",
      ]),
    );
    expect(isDone).toBe(true);
  });
});
