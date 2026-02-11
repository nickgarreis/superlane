import { ConvexError } from "convex/values";
import { assertFiniteEpochMs } from "./dateNormalization";
import { requireProjectRole } from "./auth";

export const projectAllowsTaskMutations = (project: any) =>
  project.deletedAt == null
  && project.archived !== true
  && project.status === "Active"
  && project.completedAt == null;

export const assertProjectAllowsTaskMutations = (project: any) => {
  if (!projectAllowsTaskMutations(project)) {
    throw new ConvexError("Tasks can only be modified for active projects");
  }
};

export const getWorkspaceBySlug = async (ctx: any, workspaceSlug: string) => {
  const workspace = await ctx.db
    .query("workspaces")
    .withIndex("by_slug", (q: any) => q.eq("slug", workspaceSlug))
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

export const mapTaskForClient = (task: any) => ({
  taskId: task.taskId,
  title: task.title,
  assignee: task.assignee,
  dueDateEpochMs: task.dueDateEpochMs ?? null,
  completed: task.completed,
  projectPublicId: task.projectPublicId ?? null,
  position: task.position,
});

export const resolveTaskTargetProject = async (
  ctx: any,
  args: {
    workspaceId: any;
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
  ctx: any,
  args: {
    workspaceId: any;
    taskId: string;
  },
) => ctx.db
  .query("tasks")
  .withIndex("by_workspace_taskId", (q: any) =>
    q.eq("workspaceId", args.workspaceId).eq("taskId", args.taskId))
  .unique();

export const replaceProjectTasks = async (ctx: any, project: any, tasks: Array<any>) => {
  assertProjectAllowsTaskMutations(project);

  const existing = await ctx.db
    .query("tasks")
    .withIndex("by_projectPublicId", (q: any) => q.eq("projectPublicId", project.publicId))
    .collect();

  await Promise.all(existing.map((task: any) => ctx.db.delete(task._id)));

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
  ctx: any,
  args: {
    workspace: any;
    tasks: Array<any>;
  },
) => {
  const projects = await ctx.db
    .query("projects")
    .withIndex("by_workspaceId", (q: any) => q.eq("workspaceId", args.workspace._id))
    .collect();
  const activeProjectsByPublicId = new Map<string, any>(
    projects
      .filter((project: any) => projectAllowsTaskMutations(project))
      .map((project: any) => [project.publicId, project]),
  );
  const inactiveProjectPublicIds = new Set(
    projects
      .filter((project: any) => project.deletedAt == null && !projectAllowsTaskMutations(project))
      .map((project: any) => project.publicId),
  );

  const existing = await ctx.db
    .query("tasks")
    .withIndex("by_workspaceId", (q: any) => q.eq("workspaceId", args.workspace._id))
    .collect();
  const preservedInactiveProjectTasks = existing.filter(
    (task: any) =>
      typeof task.projectPublicId === "string"
      && inactiveProjectPublicIds.has(task.projectPublicId),
  );
  const preservedInactiveTaskIds = new Set(
    preservedInactiveProjectTasks.map((task: any) => task.taskId),
  );
  const preservedInactiveRowIds = new Set(
    preservedInactiveProjectTasks.map((task: any) => String(task._id)),
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
      .filter((task: any) => !preservedInactiveRowIds.has(String(task._id)))
      .map((task: any) => ctx.db.delete(task._id)),
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
  ctx: any,
  args: {
    workspaceId: any;
    task: any;
    projectAccessCache?: Map<string, any>;
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
