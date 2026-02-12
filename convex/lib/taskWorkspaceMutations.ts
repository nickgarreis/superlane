import { ConvexError } from "convex/values";
import type { MutationCtx } from "../_generated/server";
import { requireWorkspaceRole } from "./auth";
import {
  assertTaskProjectMutationAccess,
  getWorkspaceBySlug,
  replaceProjectTasks,
} from "./taskMutations";

export const reorderWorkspaceTasksHandler = async (
  ctx: MutationCtx,
  args: { workspaceSlug: string; orderedTaskIds: string[] },
) => {
  const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
  await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });

  const orderedTaskIds = args.orderedTaskIds.map((taskId) => taskId.trim()).filter(Boolean);
  const uniqueTaskIds = new Set(orderedTaskIds);
  if (uniqueTaskIds.size !== orderedTaskIds.length) {
    throw new ConvexError("Duplicate task id in reorder payload");
  }

  const taskRows = await Promise.all(
    orderedTaskIds.map((taskId) =>
      ctx.db
        .query("tasks")
        .withIndex("by_workspace_taskId", (q) =>
          q.eq("workspaceId", workspace._id).eq("taskId", taskId),
        )
        .unique(),
    ),
  );
  const projectAccessCache = new Map();
  const tasksToReorder = taskRows.map((task, index) => {
    if (!task || task.projectDeletedAt != null) {
      throw new ConvexError(`Task not found: ${orderedTaskIds[index]}`);
    }
    return task;
  });

  await Promise.all(
    tasksToReorder.map((task) =>
      assertTaskProjectMutationAccess(ctx, {
        workspaceId: workspace._id,
        task,
        projectAccessCache,
      }),
    ),
  );

  const now = Date.now();
  const updatedCounts = await Promise.all(
    tasksToReorder.map(async (task, index) => {
      if (task.position === index) {
        return 0;
      }
      await ctx.db.patch(task._id, {
        position: index,
        updatedAt: now,
      });
      return 1;
    }),
  );

  return {
    updated: updatedCounts.reduce<number>((total, count) => total + count, 0),
  };
};

export const bulkReplaceWorkspaceTasksHandler = async (
  ctx: MutationCtx,
  args: {
    workspaceSlug: string;
    updates: Array<{
      projectPublicId: string;
      tasks: Parameters<typeof replaceProjectTasks>[2];
    }>;
  },
) => {
  const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
  await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });

  const workspaceProjects = await ctx.db
    .query("projects")
    .withIndex("by_workspaceId", (q) => q.eq("workspaceId", workspace._id))
    .collect();
  const projectByPublicId = new Map(
    workspaceProjects
      .filter((project) => project.deletedAt == null)
      .map((project) => [project.publicId, project]),
  );

  for (const update of args.updates) {
    const project = projectByPublicId.get(update.projectPublicId);
    if (!project) {
      throw new ConvexError(`Project not found in workspace: ${update.projectPublicId}`);
    }
    await replaceProjectTasks(ctx, project, update.tasks);
  }

  return { updatedProjects: args.updates.length };
};
