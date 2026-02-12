import { ConvexError, v } from "convex/values";
import type { MutationCtx } from "../_generated/server";
import { requireWorkspaceRole } from "./auth";
import { reserveTaskPosition } from "./taskPagination";
import {
  assertTaskProjectMutationAccess,
  getWorkspaceTaskRowByTaskId,
  getWorkspaceBySlug,
  normalizeOptionalEpochMs,
  normalizeOptionalProjectPublicId,
  normalizeTaskAssignee,
  normalizeTaskTitle,
  resolveTaskTargetProject,
} from "./taskMutations";
import { taskAssigneeValidator } from "./validators";
import { logWorkspaceActivityForActorUser } from "./activityEvents";

export const taskCreateDiffValidator = v.object({
  id: v.string(),
  title: v.string(),
  assignee: taskAssigneeValidator,
  dueDateEpochMs: v.optional(v.union(v.number(), v.null())),
  completed: v.optional(v.boolean()),
  projectPublicId: v.optional(v.union(v.string(), v.null())),
});

export const taskUpdateDiffValidator = v.object({
  taskId: v.string(),
  title: v.optional(v.string()),
  assignee: v.optional(taskAssigneeValidator),
  dueDateEpochMs: v.optional(v.union(v.number(), v.null())),
  completed: v.optional(v.boolean()),
  projectPublicId: v.optional(v.union(v.string(), v.null())),
});

type TaskAssignee = {
  userId?: string;
  name: string;
  avatar: string;
};

type TaskCreateDiff = {
  id: string;
  title: string;
  assignee: TaskAssignee;
  dueDateEpochMs?: number | null;
  completed?: boolean;
  projectPublicId?: string | null;
};

type TaskUpdateDiff = {
  taskId: string;
  title?: string;
  assignee?: TaskAssignee;
  dueDateEpochMs?: number | null;
  completed?: boolean;
  projectPublicId?: string | null;
};

type ApplyTaskDiffArgs = {
  workspaceSlug: string;
  creates: TaskCreateDiff[];
  updates: TaskUpdateDiff[];
  removes: string[];
  orderedTaskIds?: string[];
};

const POSITION_STRIDE = 1000;

export const applyTaskDiffHandler = async (ctx: MutationCtx, args: ApplyTaskDiffArgs) => {
  const startedAt = Date.now();
  const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
  const { appUser } = await requireWorkspaceRole(ctx, workspace._id, "member", {
    workspace,
  });

  const now = Date.now();
  const projectAccessCache = new Map<string, any>();
  const processedTaskIds = new Set<string>();
  let usedFullScan = false;
  let createdCount = 0;
  let updatedCount = 0;
  let removedCount = 0;

  const taskIdsToLoad = Array.from(
    new Set(
      [
        ...args.creates.map((create) => create.id.trim()),
        ...args.updates.map((update) => update.taskId.trim()),
        ...args.removes.map((removeTaskId) => removeTaskId.trim()),
      ].filter(Boolean),
    ),
  );
  const existingTaskRows = await Promise.all(
    taskIdsToLoad.map((taskId) =>
      getWorkspaceTaskRowByTaskId(ctx, {
        workspaceId: workspace._id,
        taskId,
      }),
    ),
  );
  const taskByTaskId = new Map<string, any>(
    existingTaskRows
      .filter((task): task is any => task !== null)
      .map((task) => [String(task.taskId), task]),
  );
  const seenCreateTaskIds = new Set<string>();

  for (const create of args.creates) {
    const taskId = create.id.trim();
    if (!taskId) {
      throw new ConvexError("Task id is required");
    }
    if (seenCreateTaskIds.has(taskId)) {
      throw new ConvexError(`Duplicate task id in create payload: ${taskId}`);
    }
    seenCreateTaskIds.add(taskId);
    if (taskByTaskId.has(taskId)) {
      throw new ConvexError(`Task id already exists in workspace: ${taskId}`);
    }

    const normalizedProjectPublicId = normalizeOptionalProjectPublicId(create.projectPublicId);
    const targetProject = await resolveTaskTargetProject(ctx, {
      workspaceId: workspace._id,
      projectPublicId: normalizedProjectPublicId,
    });
    const position = await reserveTaskPosition(ctx, {
      workspaceId: workspace._id,
      requestedPosition: undefined,
    });

    const taskRowId = await ctx.db.insert("tasks", {
      workspaceId: workspace._id,
      projectId: targetProject?._id ?? null,
      projectPublicId: targetProject?.publicId ?? null,
      projectDeletedAt: targetProject?.deletedAt ?? null,
      taskId,
      title: normalizeTaskTitle(create.title),
      assignee: normalizeTaskAssignee(create.assignee),
      dueDateEpochMs: normalizeOptionalEpochMs(create.dueDateEpochMs),
      completed: create.completed ?? false,
      position,
      createdAt: now,
      updatedAt: now,
    });
    createdCount += 1;
    processedTaskIds.add(taskId);

    taskByTaskId.set(taskId, {
      _id: taskRowId,
      taskId,
      workspaceId: workspace._id,
      projectId: targetProject?._id ?? null,
      projectPublicId: targetProject?.publicId ?? null,
      projectDeletedAt: targetProject?.deletedAt ?? null,
      title: normalizeTaskTitle(create.title),
      assignee: normalizeTaskAssignee(create.assignee),
      dueDateEpochMs: normalizeOptionalEpochMs(create.dueDateEpochMs),
      completed: create.completed ?? false,
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
      taskTitle: normalizeTaskTitle(create.title),
    });
  }

  for (const update of args.updates) {
    const taskId = update.taskId.trim();
    if (!taskId) {
      throw new ConvexError("Task id is required");
    }
    const task = taskByTaskId.get(taskId);
    if (!task) {
      throw new ConvexError(`Task not found: ${taskId}`);
    }
    await assertTaskProjectMutationAccess(ctx, {
      workspaceId: workspace._id,
      task,
      projectAccessCache,
    });

    const patch: Record<string, unknown> = {
      updatedAt: now,
    };

    if (update.title !== undefined) {
      patch.title = normalizeTaskTitle(update.title);
    }
    if (update.assignee !== undefined) {
      patch.assignee = normalizeTaskAssignee(update.assignee);
    }
    if (update.dueDateEpochMs !== undefined) {
      patch.dueDateEpochMs = normalizeOptionalEpochMs(update.dueDateEpochMs);
    }
    if (update.completed !== undefined) {
      patch.completed = update.completed;
    }
    if (update.projectPublicId !== undefined) {
      const normalizedProjectPublicId = normalizeOptionalProjectPublicId(update.projectPublicId);
      const targetProject = await resolveTaskTargetProject(ctx, {
        workspaceId: workspace._id,
        projectPublicId: normalizedProjectPublicId,
      });
      patch.projectId = targetProject?._id ?? null;
      patch.projectPublicId = targetProject?.publicId ?? null;
      patch.projectDeletedAt = targetProject?.deletedAt ?? null;
    }

    await ctx.db.patch(task._id, patch);
    if (
      update.completed !== undefined &&
      update.completed !== task.completed
    ) {
      await logWorkspaceActivityForActorUser(ctx, {
        workspaceId: workspace._id,
        kind: "task",
        action: update.completed ? "completed" : "reopened",
        actorUser: appUser,
        projectPublicId: ((patch.projectPublicId as string | null | undefined) ??
          task.projectPublicId) ?? undefined,
        taskId,
        taskTitle: (patch.title as string | undefined) ?? task.title,
      });
    }
    updatedCount += 1;
    processedTaskIds.add(taskId);
    taskByTaskId.set(taskId, {
      ...task,
      ...patch,
    });
  }

  for (const removeTaskId of args.removes) {
    const normalizedTaskId = removeTaskId.trim();
    if (!normalizedTaskId) {
      continue;
    }
    const task = taskByTaskId.get(normalizedTaskId);
    if (!task) {
      continue;
    }

    await assertTaskProjectMutationAccess(ctx, {
      workspaceId: workspace._id,
      task,
      projectAccessCache,
    });
    await ctx.db.delete(task._id);
    await logWorkspaceActivityForActorUser(ctx, {
      workspaceId: workspace._id,
      kind: "task",
      action: "deleted",
      actorUser: appUser,
      projectPublicId: task.projectPublicId ?? undefined,
      taskId: normalizedTaskId,
      taskTitle: task.title,
    });
    removedCount += 1;
    processedTaskIds.add(normalizedTaskId);
    taskByTaskId.delete(normalizedTaskId);
  }

  const normalizedOrderedTaskIds = (args.orderedTaskIds ?? []).map((taskId) => taskId.trim()).filter(Boolean);
  if (normalizedOrderedTaskIds.length > 0) {
    const deduped = new Set(normalizedOrderedTaskIds);
    if (deduped.size !== normalizedOrderedTaskIds.length) {
      throw new ConvexError("Duplicate task id in reorder payload");
    }

    // Legacy compatibility path: ordering uses a full active-task scan.
    usedFullScan = true;
    const freshTaskRows = await ctx.db
      .query("tasks")
      .withIndex("by_workspace_projectDeletedAt_position", (q) =>
        q.eq("workspaceId", workspace._id).eq("projectDeletedAt", null),
      )
      .collect();
    const freshTaskById = new Map(
      freshTaskRows.map((task: any) => [String(task.taskId), task]),
    );
    const orderedTaskIdSet = new Set(normalizedOrderedTaskIds);
    const maxUnchangedTaskPosition = freshTaskRows.reduce((maxPosition: number, task: any) => {
      if (orderedTaskIdSet.has(String(task.taskId))) {
        return maxPosition;
      }
      if (typeof task.position !== "number") {
        return maxPosition;
      }
      return Math.max(maxPosition, task.position);
    }, -POSITION_STRIDE);
    const reorderOffset = maxUnchangedTaskPosition + POSITION_STRIDE;

    await Promise.all(normalizedOrderedTaskIds.map(async (taskId) => {
      const task = freshTaskById.get(taskId);
      if (!task) {
        throw new ConvexError(`Task not found: ${taskId}`);
      }
      await assertTaskProjectMutationAccess(ctx, {
        workspaceId: workspace._id,
        task,
        projectAccessCache,
      });
    }));

    await Promise.all(normalizedOrderedTaskIds.map((taskId, index) => {
      const task = freshTaskById.get(taskId)!;
      processedTaskIds.add(taskId);
      return ctx.db.patch(task._id, {
        position: reorderOffset + (index * POSITION_STRIDE),
        updatedAt: now,
      });
    }));
  }

  return {
    created: createdCount,
    updated: updatedCount,
    removed: removedCount,
    reordered: normalizedOrderedTaskIds.length,
    processedTaskIds: processedTaskIds.size,
    usedFullScan,
    durationMs: Date.now() - startedAt,
  };
};
