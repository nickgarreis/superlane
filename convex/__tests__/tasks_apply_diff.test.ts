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
  owner: { subject: "owner-task-diff-subject" },
  member: { subject: "member-task-diff-subject" },
  outsider: { subject: "outsider-task-diff-subject" },
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

describe("tasks.applyDiff", () => {
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

      const workspaceSlug = "workspace-task-diff";
      const workspaceId = await ctx.db.insert("workspaces", {
        slug: workspaceSlug,
        name: "Workspace Task Diff",
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
      const projectPublicId = "project-task-diff";
      const projectId = await ctx.db.insert("projects", {
        publicId: projectPublicId,
        workspaceId: workspace.workspaceId,
        creatorUserId: workspace.ownerUserId,
        name: "Task Diff Project",
        description: "Task diff coverage project",
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
      return { projectId, projectPublicId };
    });

  test("enforces workspace membership", async () => {
    const workspace = await seedWorkspace();
    await seedProject(workspace);

    await expect(
      asOutsider().mutation(api.tasks.applyDiff, {
        workspaceSlug: workspace.workspaceSlug,
        creates: [],
        updates: [],
        removes: [],
      }),
    ).rejects.toThrow("Forbidden");
  });

  test("applies create/update/remove/reorder in one mutation", async () => {
    const workspace = await seedWorkspace();
    const project = await seedProject(workspace);

    await asMember().mutation(api.tasks.applyDiff, {
      workspaceSlug: workspace.workspaceSlug,
      creates: [
        {
          id: "task-a",
          title: "Task A",
          assignee: { userId: String(workspace.memberUserId), name: "Member User", avatar: "" },
          dueDateEpochMs: null,
          completed: false,
          projectPublicId: project.projectPublicId,
        },
        {
          id: "task-b",
          title: "Task B",
          assignee: { userId: String(workspace.memberUserId), name: "Member User", avatar: "" },
          dueDateEpochMs: null,
          completed: false,
          projectPublicId: null,
        },
        {
          id: "task-c",
          title: "Task C",
          assignee: { userId: String(workspace.memberUserId), name: "Member User", avatar: "" },
          dueDateEpochMs: null,
          completed: false,
          projectPublicId: project.projectPublicId,
        },
      ],
      updates: [],
      removes: [],
      orderedTaskIds: ["task-c", "task-a", "task-b"],
    });

    let page = await asMember().query(api.tasks.listForWorkspace, {
      workspaceSlug: workspace.workspaceSlug,
      paginationOpts: { cursor: null, numItems: 10 },
    });
    expect(page.page.map((task) => task.taskId)).toEqual(["task-c", "task-a", "task-b"]);

    await asMember().mutation(api.tasks.applyDiff, {
      workspaceSlug: workspace.workspaceSlug,
      creates: [],
      updates: [
        {
          taskId: "task-a",
          title: "Task A Updated",
          completed: true,
          projectPublicId: project.projectPublicId,
          assignee: { userId: String(workspace.memberUserId), name: "Member User", avatar: "" },
          dueDateEpochMs: null,
        },
      ],
      removes: ["task-b"],
      orderedTaskIds: ["task-c", "task-a"],
    });

    page = await asMember().query(api.tasks.listForWorkspace, {
      workspaceSlug: workspace.workspaceSlug,
      paginationOpts: { cursor: null, numItems: 10 },
    });
    expect(page.page.map((task) => task.taskId)).toEqual(["task-c", "task-a"]);
    expect(page.page.find((task) => task.taskId === "task-a")?.title).toBe("Task A Updated");
    expect(page.page.find((task) => task.taskId === "task-a")?.completed).toBe(true);
  });

  test("supports idempotent no-op removals and updates", async () => {
    const workspace = await seedWorkspace();
    const project = await seedProject(workspace);

    await asOwner().mutation(api.tasks.applyDiff, {
      workspaceSlug: workspace.workspaceSlug,
      creates: [
        {
          id: "task-idempotent",
          title: "Task Idempotent",
          assignee: { userId: String(workspace.ownerUserId), name: "Owner User", avatar: "" },
          dueDateEpochMs: null,
          completed: false,
          projectPublicId: project.projectPublicId,
        },
      ],
      updates: [],
      removes: [],
    });

    await asOwner().mutation(api.tasks.applyDiff, {
      workspaceSlug: workspace.workspaceSlug,
      creates: [],
      updates: [
        {
          taskId: "task-idempotent",
          title: "Task Idempotent",
          assignee: { userId: String(workspace.ownerUserId), name: "Owner User", avatar: "" },
          dueDateEpochMs: null,
          completed: false,
          projectPublicId: project.projectPublicId,
        },
      ],
      removes: [],
    });

    await asOwner().mutation(api.tasks.applyDiff, {
      workspaceSlug: workspace.workspaceSlug,
      creates: [],
      updates: [],
      removes: ["task-idempotent"],
    });

    await asOwner().mutation(api.tasks.applyDiff, {
      workspaceSlug: workspace.workspaceSlug,
      creates: [],
      updates: [],
      removes: ["task-idempotent"],
    });

    const page = await asOwner().query(api.tasks.listForWorkspace, {
      workspaceSlug: workspace.workspaceSlug,
      paginationOpts: { cursor: null, numItems: 10 },
    });
    expect(page.page).toHaveLength(0);
  });
});
