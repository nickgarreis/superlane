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
  owner: { subject: "owner-task-reorder-subject" },
  member: { subject: "member-task-reorder-subject" },
} as const;

type SeededWorkspace = {
  workspaceId: Id<"workspaces">;
  workspaceSlug: string;
  ownerUserId: Id<"users">;
  memberUserId: Id<"users">;
};

describe("tasks.reorder", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    t = convexTest(schema, modules);
    workosAuthKitTest.register(t, "workOSAuthKit");
  });

  const asMember = () => t.withIdentity(IDENTITIES.member);

  const seedWorkspace = async (): Promise<SeededWorkspace> =>
    t.run(async (ctx) => {
      const createdAt = 1_000;
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

      const workspaceSlug = "workspace-task-reorder";
      const workspaceId = await ctx.db.insert("workspaces", {
        slug: workspaceSlug,
        name: "Workspace Task Reorder",
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

  test("does not patch tasks whose position already matches requested order", async () => {
    const workspace = await seedWorkspace();

    await t.run(async (ctx) => {
      const timestamp = 1_500;
      await ctx.db.insert("tasks", {
        workspaceId: workspace.workspaceId,
        projectId: null,
        projectPublicId: null,
        projectDeletedAt: null,
        taskId: "task-a",
        title: "Task A",
        assignee: { userId: String(workspace.memberUserId), name: "Member User", avatar: "" },
        dueDateEpochMs: null,
        completed: false,
        position: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      await ctx.db.insert("tasks", {
        workspaceId: workspace.workspaceId,
        projectId: null,
        projectPublicId: null,
        projectDeletedAt: null,
        taskId: "task-b",
        title: "Task B",
        assignee: { userId: String(workspace.memberUserId), name: "Member User", avatar: "" },
        dueDateEpochMs: null,
        completed: false,
        position: 1,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      await ctx.db.insert("tasks", {
        workspaceId: workspace.workspaceId,
        projectId: null,
        projectPublicId: null,
        projectDeletedAt: null,
        taskId: "task-c",
        title: "Task C",
        assignee: { userId: String(workspace.memberUserId), name: "Member User", avatar: "" },
        dueDateEpochMs: null,
        completed: false,
        position: 2,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    });

    const reordered = await asMember().mutation(api.tasks.reorder, {
      workspaceSlug: workspace.workspaceSlug,
      orderedTaskIds: ["task-a", "task-b"],
    });
    expect(reordered.updated).toBe(0);

    await t.run(async (ctx) => {
      const workspaceTasks = await (ctx.db as any)
        .query("tasks")
        .withIndex("by_workspaceId", (q: any) =>
          q.eq("workspaceId", workspace.workspaceId),
        )
        .collect();
      const taskById = new Map<string, any>(
        workspaceTasks.map((task: any) => [String(task.taskId), task]),
      );
      const taskA: any = taskById.get("task-a");
      const taskB: any = taskById.get("task-b");
      const taskC: any = taskById.get("task-c");

      expect(taskA?.position).toBe(0);
      expect(taskB?.position).toBe(1);
      expect(taskC?.position).toBe(2);
      expect(taskA?.updatedAt).toBe(1_500);
      expect(taskB?.updatedAt).toBe(1_500);
      expect(taskC?.updatedAt).toBe(1_500);
    });
  });
});
