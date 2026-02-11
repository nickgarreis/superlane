import { ConvexError, v } from "convex/values";
import type { MutationCtx } from "../_generated/server";
import { requireWorkspaceRole } from "./auth";
import { reserveTaskPosition } from "./taskPagination";
import {
  assertTaskProjectMutationAccess,
  getWorkspaceBySlug,
  normalizeOptionalEpochMs,
  normalizeOptionalProjectPublicId,
  normalizeTaskAssignee,
  normalizeTaskTitle,
  resolveTaskTargetProject,
} from "./taskMutations";
import { taskAssigneeValidator } from "./validators";

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
  const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
  await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });

  const now = Date.now();
  const projectAccessCache = new Map<string, any>();
  const taskRows = await ctx.db
    .query("tasks")
    .withIndex("by_workspace_projectDeletedAt_position", (q: any) =>
      q.eq("workspaceId", workspace._id).eq("projectDeletedAt", null),
    )
    .collect();
  const taskByTaskId = new Map<string, any>(
    taskRows.map((task: any) => [String(task.taskId), task]),
  );

  for (const create of args.creates) {
    const taskId = create.id.trim();
    if (!taskId) {
      throw new ConvexError("Task id is required");
    }
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
  }

  for (const update of args.updates) {
    const task = taskByTaskId.get(update.taskId);
    if (!task) {
      throw new ConvexError(`Task not found: ${update.taskId}`);
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
    taskByTaskId.set(update.taskId, {
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
    taskByTaskId.delete(normalizedTaskId);
  }

  const normalizedOrderedTaskIds = (args.orderedTaskIds ?? []).map((taskId) => taskId.trim()).filter(Boolean);
  if (normalizedOrderedTaskIds.length > 0) {
    const deduped = new Set(normalizedOrderedTaskIds);
    if (deduped.size !== normalizedOrderedTaskIds.length) {
      throw new ConvexError("Duplicate task id in reorder payload");
    }

    const freshTaskRows = await ctx.db
      .query("tasks")
      .withIndex("by_workspace_projectDeletedAt_position", (q: any) =>
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
      return ctx.db.patch(task._id, {
        position: reorderOffset + (index * POSITION_STRIDE),
        updatedAt: now,
      });
    }));
  }

  return {
    created: args.creates.length,
    updated: args.updates.length,
    removed: args.removes.length,
    reordered: normalizedOrderedTaskIds.length,
  };
};
