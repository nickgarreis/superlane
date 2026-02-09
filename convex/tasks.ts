import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { taskInputValidator } from "./lib/validators";
import { requireWorkspaceMember } from "./lib/auth";

const getProjectForMember = async (ctx: any, projectPublicId: string) => {
  const project = await ctx.db
    .query("projects")
    .withIndex("by_publicId", (q: any) => q.eq("publicId", projectPublicId))
    .unique();

  if (!project) {
    throw new ConvexError("Project not found");
  }

  await requireWorkspaceMember(ctx, project.workspaceId);
  return project;
};

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
        dueDate: task.dueDate,
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
    const project = await getProjectForMember(ctx, args.projectPublicId);
    await replaceProjectTasks(ctx, project, args.tasks);

    return { projectPublicId: project.publicId };
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

    await requireWorkspaceMember(ctx, workspace._id);

    for (const update of args.updates) {
      const project = await ctx.db
        .query("projects")
        .withIndex("by_publicId", (q: any) => q.eq("publicId", update.projectPublicId))
        .unique();

      if (!project || project.workspaceId !== workspace._id) {
        throw new ConvexError(`Project not found in workspace: ${update.projectPublicId}`);
      }

      await replaceProjectTasks(ctx, project, update.tasks);
    }

    return { updatedProjects: args.updates.length };
  },
});
