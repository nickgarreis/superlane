import { ConvexError, v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";
import { taskInputValidator, workspaceTaskInputValidator, taskAssigneeValidator } from "./lib/validators";
import { requireProjectRole, requireWorkspaceRole } from "./lib/auth";
import { reserveTaskPosition } from "./lib/taskPagination";
import {
  applyTaskDiffHandler,
  taskCreateDiffValidator,
  taskUpdateDiffValidator,
} from "./lib/taskDiffMutation";
import {
  assertTaskProjectMutationAccess,
  getWorkspaceBySlug,
  getWorkspaceTaskRowByTaskId,
  mapTaskForClient,
  normalizeOptionalEpochMs,
  normalizeOptionalProjectPublicId,
  normalizeTaskAssignee,
  normalizeTaskTitle,
  replaceProjectTasks,
  replaceWorkspaceTasksLegacy,
  resolveTaskTargetProject,
} from "./lib/taskMutations";

export const listForWorkspace = query({
  args: {
    workspaceSlug: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });

    const paginated = await ctx.db
      .query("tasks")
      .withIndex("by_workspace_projectDeletedAt_position", (q: any) =>
        q.eq("workspaceId", workspace._id).eq("projectDeletedAt", null),
      )
      .paginate(args.paginationOpts);

    return {
      ...paginated,
      page: paginated.page.map(mapTaskForClient),
    };
  },
});

export const listForProject = query({
  args: {
    projectPublicId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const { project } = await requireProjectRole(ctx, args.projectPublicId, "member");

    const paginated = await ctx.db
      .query("tasks")
      .withIndex("by_projectPublicId_position", (q: any) =>
        q.eq("projectPublicId", project.publicId),
      )
      .paginate(args.paginationOpts);

    return {
      ...paginated,
      page: paginated.page.map(mapTaskForClient),
    };
  },
});

export const create = mutation({
  args: {
    workspaceSlug: v.string(),
    id: v.optional(v.string()),
    title: v.string(),
    assignee: taskAssigneeValidator,
    dueDateEpochMs: v.optional(v.union(v.number(), v.null())),
    completed: v.optional(v.boolean()),
    projectPublicId: v.optional(v.union(v.string(), v.null())),
    position: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });

    const requestedTaskId = (args.id ?? "").trim();
    const taskId = requestedTaskId.length > 0
      ? requestedTaskId
      : `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const existingTask = await getWorkspaceTaskRowByTaskId(ctx, {
      workspaceId: workspace._id,
      taskId,
    });
    if (existingTask) {
      throw new ConvexError("Task id already exists in workspace");
    }

    const normalizedProjectPublicId = normalizeOptionalProjectPublicId(args.projectPublicId);
    const targetProject = await resolveTaskTargetProject(ctx, {
      workspaceId: workspace._id,
      projectPublicId: normalizedProjectPublicId,
    });

    const position = await reserveTaskPosition(ctx, {
      workspaceId: workspace._id,
      requestedPosition: args.position,
    });

    const now = Date.now();
    await ctx.db.insert("tasks", {
      workspaceId: workspace._id,
      projectId: targetProject?._id ?? null,
      projectPublicId: targetProject?.publicId ?? null,
      projectDeletedAt: targetProject?.deletedAt ?? null,
      taskId,
      title: normalizeTaskTitle(args.title),
      assignee: normalizeTaskAssignee(args.assignee),
      dueDateEpochMs: normalizeOptionalEpochMs(args.dueDateEpochMs),
      completed: args.completed ?? false,
      position,
      createdAt: now,
      updatedAt: now,
    });

    return { taskId };
  },
});

export const update = mutation({
  args: {
    workspaceSlug: v.string(),
    taskId: v.string(),
    title: v.optional(v.string()),
    assignee: v.optional(taskAssigneeValidator),
    dueDateEpochMs: v.optional(v.union(v.number(), v.null())),
    completed: v.optional(v.boolean()),
    projectPublicId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });

    const task = await getWorkspaceTaskRowByTaskId(ctx, {
      workspaceId: workspace._id,
      taskId: args.taskId,
    });
    if (!task) {
      throw new ConvexError("Task not found");
    }

    await assertTaskProjectMutationAccess(ctx, {
      workspaceId: workspace._id,
      task,
    });

    const patch: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) {
      patch.title = normalizeTaskTitle(args.title);
    }
    if (args.assignee !== undefined) {
      patch.assignee = normalizeTaskAssignee(args.assignee);
    }
    if (args.dueDateEpochMs !== undefined) {
      patch.dueDateEpochMs = normalizeOptionalEpochMs(args.dueDateEpochMs);
    }
    if (args.completed !== undefined) {
      patch.completed = args.completed;
    }
    if (args.projectPublicId !== undefined) {
      const normalizedProjectPublicId = normalizeOptionalProjectPublicId(args.projectPublicId);
      const targetProject = await resolveTaskTargetProject(ctx, {
        workspaceId: workspace._id,
        projectPublicId: normalizedProjectPublicId,
      });
      patch.projectId = targetProject?._id ?? null;
      patch.projectPublicId = targetProject?.publicId ?? null;
      patch.projectDeletedAt = targetProject?.deletedAt ?? null;
    }

    await ctx.db.patch(task._id, patch);
    return { taskId: args.taskId };
  },
});

export const remove = mutation({
  args: {
    workspaceSlug: v.string(),
    taskId: v.string(),
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });

    const task = await getWorkspaceTaskRowByTaskId(ctx, {
      workspaceId: workspace._id,
      taskId: args.taskId,
    });
    if (!task) {
      return { removed: false };
    }

    await assertTaskProjectMutationAccess(ctx, {
      workspaceId: workspace._id,
      task,
    });

    await ctx.db.delete(task._id);
    return { removed: true };
  },
});

export const applyDiff = mutation({
  args: {
    workspaceSlug: v.string(),
    creates: v.array(taskCreateDiffValidator),
    updates: v.array(taskUpdateDiffValidator),
    removes: v.array(v.string()),
    orderedTaskIds: v.optional(v.array(v.string())),
  },
  handler: applyTaskDiffHandler,
});

export const reorder = mutation({
  args: {
    workspaceSlug: v.string(),
    orderedTaskIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
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
          .withIndex("by_workspace_taskId", (q: any) =>
            q.eq("workspaceId", workspace._id).eq("taskId", taskId),
          )
          .unique(),
      ),
    );
    const projectAccessCache = new Map<string, any>();

    const tasksToReorder = taskRows.map((task, index) => {
      if (!task || task.projectDeletedAt != null) {
        throw new ConvexError(`Task not found: ${orderedTaskIds[index]}`);
      }
      return task;
    });

    await Promise.all(tasksToReorder.map((task: any) => assertTaskProjectMutationAccess(ctx, {
      workspaceId: workspace._id,
      task,
      projectAccessCache,
    })));

    const now = Date.now();
    const updatedCounts = await Promise.all(
      tasksToReorder.map(async (task: any, index) => {
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
  },
});

export const replaceForProject = mutation({
  args: {
    projectPublicId: v.string(),
    tasks: v.array(taskInputValidator),
  },
  handler: async (ctx, args) => {
    const { project } = await requireProjectRole(ctx, args.projectPublicId, "member");
    await replaceProjectTasks(ctx, project, args.tasks);
    return { projectPublicId: project.publicId };
  },
});

export const replaceForWorkspace = mutation({
  args: {
    workspaceSlug: v.string(),
    tasks: v.array(workspaceTaskInputValidator),
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });
    await replaceWorkspaceTasksLegacy(ctx, {
      workspace,
      tasks: args.tasks,
    });
    return { updatedTasks: args.tasks.length };
  },
});

export const bulkReplaceForWorkspace = mutation({
  args: {
    workspaceSlug: v.string(),
    updates: v.array(
      v.object({
        projectPublicId: v.string(),
        tasks: v.array(taskInputValidator),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });

    const workspaceProjects = await ctx.db
      .query("projects")
      .withIndex("by_workspaceId", (q: any) => q.eq("workspaceId", workspace._id))
      .collect();
    const projectByPublicId = new Map(
      workspaceProjects
        .filter((project: any) => project.deletedAt == null)
        .map((project: any) => [project.publicId, project]),
    );

    for (const update of args.updates) {
      const project = projectByPublicId.get(update.projectPublicId);
      if (!project) {
        throw new ConvexError(`Project not found in workspace: ${update.projectPublicId}`);
      }
      await replaceProjectTasks(ctx, project, update.tasks);
    }

    return { updatedProjects: args.updates.length };
  },
});
