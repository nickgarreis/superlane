import { ConvexError } from "convex/values";
import type { Id, Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { assertFiniteEpochMs } from "./dateNormalization";
import { requireProjectRole } from "./auth";

type ProjectDoc = Doc<"projects">;
type TaskDoc = Doc<"tasks">;
type WorkspaceDoc = Doc<"workspaces">;
type TaskMutationCtx = QueryCtx | MutationCtx;

type TaskInput = {
  id: string;
  title: string;
  assignee: {
    userId?: string;
    name: string;
    avatar: string;
  };
  dueDateEpochMs?: number | null;
  completed: boolean;
  projectPublicId?: string | null;
};

export const projectAllowsTaskMutations = (project: ProjectDoc) =>
  project.deletedAt == null
  && project.archived !== true
  && project.status === "Active"
  && project.completedAt == null;

export const assertProjectAllowsTaskMutations = (project: ProjectDoc) => {
  if (!projectAllowsTaskMutations(project)) {
    throw new ConvexError("Tasks can only be modified for active projects");
  }
};

export const getWorkspaceBySlug = async (ctx: TaskMutationCtx, workspaceSlug: string) => {
  const workspace = await ctx.db
    .query("workspaces")
    .withIndex("by_slug", (q) => q.eq("slug", workspaceSlug))
    .unique();

  if (!workspace || workspace.deletedAt != null) {
    throw new ConvexError("Workspace not found");
  }

  return workspace;
};

export const normalizeTaskTitle = (value: string) => {
  const normalized = value.trim();
  if (!normalized) {
    throw new ConvexError("Task title is required");
  }
  return normalized;
};

export const normalizeTaskAssignee = (assignee: {
  userId?: string;
  name: string;
  avatar: string;
}) => {
  const name = assignee.name.trim();
  if (!name) {
    throw new ConvexError("Task assignee is required");
  }

  return {
    userId: typeof assignee.userId === "string" && assignee.userId.trim().length > 0
      ? assignee.userId.trim()
      : undefined,
    name,
    avatar: assignee.avatar ?? "",
  };
};

export const normalizeOptionalEpochMs = (value: number | null | undefined) => {
  if (value === undefined || value === null) {
    return null;
  }
  return assertFiniteEpochMs(value, "dueDateEpochMs");
};

export const normalizeOptionalProjectPublicId = (value: string | null | undefined) => {
  if (value === undefined || value === null) {
    return null;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

export const mapTaskForClient = (task: TaskDoc) => ({
  taskId: task.taskId,
  title: task.title,
  assignee: task.assignee,
  dueDateEpochMs: task.dueDateEpochMs ?? null,
  completed: task.completed,
  projectPublicId: task.projectPublicId ?? null,
  position: task.position,
});

export const resolveTaskTargetProject = async (
  ctx: TaskMutationCtx,
  args: {
    workspaceId: Id<"workspaces">;
    projectPublicId: string | null;
  },
) => {
  if (!args.projectPublicId) {
    return null;
  }

  const access = await requireProjectRole(ctx, args.projectPublicId, "member");
  if (String(access.project.workspaceId) !== String(args.workspaceId)) {
    throw new ConvexError("Project not found in workspace");
  }
  assertProjectAllowsTaskMutations(access.project);

  return access.project;
};

export const getWorkspaceTaskRowByTaskId = async (
  ctx: TaskMutationCtx,
  args: {
    workspaceId: Id<"workspaces">;
    taskId: string;
  },
) => ctx.db
  .query("tasks")
  .withIndex("by_workspace_taskId", (q) =>
    q.eq("workspaceId", args.workspaceId).eq("taskId", args.taskId))
  .unique();

export const replaceProjectTasks = async (
  ctx: MutationCtx,
  project: ProjectDoc,
  tasks: TaskInput[],
) => {
  assertProjectAllowsTaskMutations(project);

  const existing = await ctx.db
    .query("tasks")
    .withIndex("by_projectPublicId", (q) => q.eq("projectPublicId", project.publicId))
    .collect();

  await Promise.all(existing.map((task) => ctx.db.delete(task._id)));

  const now = Date.now();
  await Promise.all(
    tasks.map((task, index) => {
      if (typeof task.completed !== "boolean") {
        throw new ConvexError(`Invalid completed value for task ${task.id ?? index}`);
      }
      const validatedCompleted = task.completed;

      return ctx.db.insert("tasks", {
        workspaceId: project.workspaceId,
        projectId: project._id,
        projectPublicId: project.publicId,
        projectDeletedAt: project.deletedAt ?? null,
        taskId: task.id,
        title: normalizeTaskTitle(task.title),
        assignee: normalizeTaskAssignee(task.assignee),
        dueDateEpochMs: normalizeOptionalEpochMs(task.dueDateEpochMs),
        completed: validatedCompleted,
        position: index,
        createdAt: now,
        updatedAt: now,
      });
    }),
  );
};

export const replaceWorkspaceTasksLegacy = async (
  ctx: MutationCtx,
  args: {
    workspace: WorkspaceDoc;
    tasks: TaskInput[];
  },
) => {
  const projects = await ctx.db
    .query("projects")
    .withIndex("by_workspaceId", (q) => q.eq("workspaceId", args.workspace._id))
    .collect();
  const activeProjectsByPublicId = new Map<string, ProjectDoc>(
    projects
      .filter((project): project is ProjectDoc => projectAllowsTaskMutations(project))
      .map((project) => [project.publicId, project]),
  );
  const inactiveProjectPublicIds = new Set(
    projects
      .filter((project) => project.deletedAt == null && !projectAllowsTaskMutations(project))
      .map((project) => project.publicId),
  );

  const existing = await ctx.db
    .query("tasks")
    .withIndex("by_workspaceId", (q) => q.eq("workspaceId", args.workspace._id))
    .collect();
  const preservedInactiveProjectTasks = existing.filter(
    (task) =>
      typeof task.projectPublicId === "string"
      && inactiveProjectPublicIds.has(task.projectPublicId),
  );
  const preservedInactiveTaskIds = new Set(
    preservedInactiveProjectTasks.map((task) => task.taskId),
  );
  const preservedInactiveRowIds = new Set(
    preservedInactiveProjectTasks.map((task) => String(task._id)),
  );

  for (const task of args.tasks) {
    const requestedProjectPublicId =
      typeof task.projectPublicId === "string" && task.projectPublicId.trim().length > 0
        ? task.projectPublicId.trim()
        : null;
    const project = requestedProjectPublicId
      ? activeProjectsByPublicId.get(requestedProjectPublicId)
      : null;

    if (requestedProjectPublicId && !project) {
      if (inactiveProjectPublicIds.has(requestedProjectPublicId)) {
        throw new ConvexError("Tasks can only be modified for active projects");
      }
      throw new ConvexError(
        `Project not found in workspace or not active: ${requestedProjectPublicId}`,
      );
    }

    if (preservedInactiveTaskIds.has(task.id)) {
      throw new ConvexError("Tasks can only be modified for active projects");
    }
  }

  await Promise.all(
    existing
      .filter((task) => !preservedInactiveRowIds.has(String(task._id)))
      .map((task) => ctx.db.delete(task._id)),
  );

  const now = Date.now();
  await Promise.all(
    args.tasks.map(async (task, index) => {
      const requestedProjectPublicId =
        typeof task.projectPublicId === "string" && task.projectPublicId.trim().length > 0
          ? task.projectPublicId.trim()
          : null;
      const project = requestedProjectPublicId
        ? activeProjectsByPublicId.get(requestedProjectPublicId)
        : null;

      if (requestedProjectPublicId && !project) {
        throw new ConvexError(
          `Project not found in workspace or not active: ${requestedProjectPublicId}`,
        );
      }

      if (typeof task.completed !== "boolean") {
        throw new ConvexError(`Invalid completed value for task ${task.id ?? index}`);
      }
      const validatedCompleted = task.completed;

      await ctx.db.insert("tasks", {
        workspaceId: args.workspace._id,
        projectId: project?._id ?? null,
        projectPublicId: project?.publicId ?? null,
        projectDeletedAt: project?.deletedAt ?? null,
        taskId: task.id,
        title: normalizeTaskTitle(task.title),
        assignee: normalizeTaskAssignee(task.assignee),
        dueDateEpochMs: normalizeOptionalEpochMs(task.dueDateEpochMs),
        completed: validatedCompleted,
        position: index,
        createdAt: now,
        updatedAt: now,
      });
    }),
  );
};

export const assertTaskProjectMutationAccess = async (
  ctx: TaskMutationCtx,
  args: {
    workspaceId: Id<"workspaces">;
    task: TaskDoc;
    projectAccessCache?: Map<string, ProjectDoc>;
  },
) => {
  if (!args.task.projectPublicId) {
    return;
  }

  const cachedProject = args.projectAccessCache?.get(args.task.projectPublicId) ?? null;
  if (cachedProject) {
    if (String(cachedProject.workspaceId) !== String(args.workspaceId)) {
      throw new ConvexError("Task not found in workspace");
    }
    assertProjectAllowsTaskMutations(cachedProject);
    return;
  }

  const { project } = await requireProjectRole(ctx, args.task.projectPublicId, "member");
  if (String(project.workspaceId) !== String(args.workspaceId)) {
    throw new ConvexError("Task not found in workspace");
  }
  assertProjectAllowsTaskMutations(project);
  args.projectAccessCache?.set(args.task.projectPublicId, project);
};
