import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { taskInputValidator, workspaceTaskInputValidator } from "./lib/validators";
import { requireProjectRole, requireWorkspaceRole } from "./lib/auth";
import { assertFiniteEpochMs } from "./lib/dateNormalization";

const replaceProjectTasks = async (ctx: any, project: any, tasks: Array<any>) => {
  const existing = await ctx.db
    .query("tasks")
    .withIndex("by_projectPublicId", (q: any) => q.eq("projectPublicId", project.publicId))
    .collect();

  await Promise.all(existing.map((task: any) => ctx.db.delete(task._id)));

  const now = Date.now();
  await Promise.all(
    tasks.map((task, index) =>
      ctx.db.insert("tasks", {
        workspaceId: project.workspaceId,
        projectId: project._id,
        projectPublicId: project.publicId,
        taskId: task.id,
        title: task.title,
        assignee: task.assignee,
        dueDateEpochMs:
          task.dueDateEpochMs === undefined || task.dueDateEpochMs === null
            ? null
            : assertFiniteEpochMs(task.dueDateEpochMs, "dueDateEpochMs"),
        completed: task.completed,
        position: index,
        createdAt: now,
        updatedAt: now,
      }),
    ),
  );
};

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
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q: any) => q.eq("slug", args.workspaceSlug))
      .unique();

    if (!workspace) {
      throw new ConvexError("Workspace not found");
    }

    await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_workspaceId", (q: any) => q.eq("workspaceId", workspace._id))
      .collect();
    const activeProjectsByPublicId = new Map(
      projects
        .filter((project: any) => project.deletedAt == null && project.status === "Active")
        .map((project: any) => [project.publicId, project]),
    );

    const existing = await ctx.db
      .query("tasks")
      .withIndex("by_workspaceId", (q: any) => q.eq("workspaceId", workspace._id))
      .collect();
    await Promise.all(existing.map((task: any) => ctx.db.delete(task._id)));

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

        await ctx.db.insert("tasks", {
          workspaceId: workspace._id,
          projectId: project?._id ?? null,
          projectPublicId: project?.publicId ?? null,
          taskId: task.id,
          title: task.title,
          assignee: task.assignee,
          dueDateEpochMs:
            task.dueDateEpochMs === undefined || task.dueDateEpochMs === null
              ? null
              : assertFiniteEpochMs(task.dueDateEpochMs, "dueDateEpochMs"),
          completed: task.completed,
          position: index,
          createdAt: now,
          updatedAt: now,
        });
      }),
    );

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
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q: any) => q.eq("slug", args.workspaceSlug))
      .unique();

    if (!workspace) {
      throw new ConvexError("Workspace not found");
    }

    await requireWorkspaceRole(ctx, workspace._id, "member", { workspace });

    for (const update of args.updates) {
      const project = await ctx.db
        .query("projects")
        .withIndex("by_publicId", (q: any) => q.eq("publicId", update.projectPublicId))
        .unique();

      if (!project || project.workspaceId !== workspace._id || project.deletedAt != null) {
        throw new ConvexError(`Project not found in workspace: ${update.projectPublicId}`);
      }

      await replaceProjectTasks(ctx, project, update.tasks);
    }

    return { updatedProjects: args.updates.length };
  },
});
