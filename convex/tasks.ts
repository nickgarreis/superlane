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
  projectAllowsTaskMutations,
  replaceProjectTasks,
  replaceWorkspaceTasksLegacy,
  resolveTaskTargetProject,
} from "./lib/taskMutations";
import { logWorkspaceActivityForActorUser } from "./lib/activityEvents";
import {
  bulkReplaceWorkspaceTasksHandler,
  reorderWorkspaceTasksHandler,
} from "./lib/taskWorkspaceMutations";

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
      .withIndex("by_workspace_projectDeletedAt_position", (q) =>
        q.eq("workspaceId", workspace._id).eq("projectDeletedAt", null),
      )
      .paginate(args.paginationOpts);

    return {
      ...paginated,
      page: paginated.page.map(mapTaskForClient),
    };
  },
});

export const listMutableForWorkspace = query({
  args: {
    workspaceSlug: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
    await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });

    const workspaceProjects = await ctx.db
      .query("projects")
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", workspace._id))
      .collect();
    const mutableProjectPublicIds = new Set<string>(
      workspaceProjects
        .filter((project) => project.publicId && projectAllowsTaskMutations(project))
        .map((project) => project.publicId),
    );

    const paginated = await ctx.db
      .query("tasks")
      .withIndex("by_workspace_projectDeletedAt_position", (q) =>
        q.eq("workspaceId", workspace._id).eq("projectDeletedAt", null),
      )
      .paginate(args.paginationOpts);

    return {
      ...paginated,
      page: paginated.page
        .filter(
          (task) =>
            task.projectPublicId == null
            || mutableProjectPublicIds.has(task.projectPublicId),
        )
        .map(mapTaskForClient),
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
      .withIndex("by_projectPublicId_position", (q) =>
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
    const { appUser } = await requireWorkspaceRole(
      ctx,
      workspace._id,
      "member",
      { workspace },
    );

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
    await logWorkspaceActivityForActorUser(ctx, {
      workspaceId: workspace._id,
      kind: "task",
      action: "created",
      actorUser: appUser,
      projectPublicId: targetProject?.publicId,
      projectName: targetProject?.name,
      taskId,
      taskTitle: normalizeTaskTitle(args.title),
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
    const { appUser } = await requireWorkspaceRole(
      ctx,
      workspace._id,
      "member",
      { workspace },
    );

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
    const previousCompleted = task.completed;
    const previousAssigneeName = (task.assignee?.name ?? "").trim();
    const previousDueDate =
      typeof task.dueDateEpochMs === "number" ? String(task.dueDateEpochMs) : "";
    const previousProjectPublicId = task.projectPublicId ?? null;

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
    const nextTitle = (patch.title as string | undefined) ?? task.title;
    const nextProjectPublicIdRaw =
      (patch.projectPublicId as string | null | undefined) ?? previousProjectPublicId;
    const normalizedNextProjectPublicId =
      nextProjectPublicIdRaw === "" ? null : nextProjectPublicIdRaw ?? null;
    const resolvedProject =
      typeof normalizedNextProjectPublicId === "string"
      && normalizedNextProjectPublicId.length > 0
        ? await ctx.db
            .query("projects")
            .withIndex("by_publicId", (q) => q.eq("publicId", normalizedNextProjectPublicId))
            .unique()
        : null;

    if (args.completed !== undefined && args.completed !== previousCompleted) {
      await logWorkspaceActivityForActorUser(ctx, {
        workspaceId: workspace._id,
        kind: "task",
        action: args.completed ? "completed" : "reopened",
        actorUser: appUser,
        projectPublicId: normalizedNextProjectPublicId ?? undefined,
        projectName: resolvedProject?.name,
        taskId: task.taskId,
        taskTitle: nextTitle,
      });
    }
    const nextAssigneeName = args.assignee ? args.assignee.name.trim() : "";
    if (nextAssigneeName.length > 0 && nextAssigneeName !== previousAssigneeName) {
      await logWorkspaceActivityForActorUser(ctx, {
        workspaceId: workspace._id,
        kind: "task",
        action: "assignee_changed",
        actorUser: appUser,
        projectPublicId: normalizedNextProjectPublicId ?? undefined,
        projectName: resolvedProject?.name,
        taskId: task.taskId,
        taskTitle: nextTitle,
        fromValue: previousAssigneeName,
        toValue: nextAssigneeName,
      });
    }
    if (args.dueDateEpochMs !== undefined) {
      const nextDueDate =
        args.dueDateEpochMs == null ? "" : String(args.dueDateEpochMs);
      if (previousDueDate !== nextDueDate) {
        await logWorkspaceActivityForActorUser(ctx, {
          workspaceId: workspace._id,
          kind: "task",
          action: "due_date_changed",
          actorUser: appUser,
          projectPublicId: normalizedNextProjectPublicId ?? undefined,
          projectName: resolvedProject?.name,
          taskId: task.taskId,
          taskTitle: nextTitle,
          fromValue: previousDueDate,
          toValue: nextDueDate,
        });
      }
    }
    if (args.projectPublicId !== undefined) {
      const normalizedPreviousProjectPublicId =
        previousProjectPublicId === "" ? null : previousProjectPublicId;
      const normalizedNewProjectPublicId =
        args.projectPublicId === "" ? null : args.projectPublicId ?? null;
      if (normalizedNewProjectPublicId !== normalizedPreviousProjectPublicId) {
        await logWorkspaceActivityForActorUser(ctx, {
          workspaceId: workspace._id,
          kind: "task",
          action: "moved_project",
          actorUser: appUser,
          projectPublicId: normalizedNextProjectPublicId ?? undefined,
          projectName: resolvedProject?.name,
          taskId: task.taskId,
          taskTitle: nextTitle,
          fromValue: normalizedPreviousProjectPublicId ?? "",
          toValue: normalizedNextProjectPublicId ?? "",
        });
      }
    }
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
    const { appUser } = await requireWorkspaceRole(
      ctx,
      workspace._id,
      "member",
      { workspace },
    );

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
    const taskProjectPublicId =
      typeof task.projectPublicId === "string" && task.projectPublicId.length > 0
        ? task.projectPublicId
        : null;
    const project = taskProjectPublicId
      ? await ctx.db
          .query("projects")
          .withIndex("by_publicId", (q) => q.eq("publicId", taskProjectPublicId))
          .unique()
      : null;
    await logWorkspaceActivityForActorUser(ctx, {
      workspaceId: workspace._id,
      kind: "task",
      action: "deleted",
      actorUser: appUser,
      projectPublicId: task.projectPublicId ?? undefined,
      projectName: project?.name,
      taskId: task.taskId,
      taskTitle: task.title,
    });
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
  handler: reorderWorkspaceTasksHandler,
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
  handler: bulkReplaceWorkspaceTasksHandler,
});
