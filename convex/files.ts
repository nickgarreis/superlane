import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireWorkspaceMember } from "./lib/auth";
import { fileTabValidator } from "./lib/validators";

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

export const listForWorkspace = query({
  args: {
    workspaceSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q) => q.eq("slug", args.workspaceSlug))
      .unique();

    if (!workspace) {
      throw new ConvexError("Workspace not found");
    }

    await requireWorkspaceMember(ctx, workspace._id);

    const files = await ctx.db
      .query("projectFiles")
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", workspace._id))
      .collect();

    files.sort((a, b) => b.createdAt - a.createdAt);

    return files.map((file) => ({
      id: file._id,
      projectPublicId: file.projectPublicId,
      tab: file.tab,
      name: file.name,
      type: file.type,
      displayDate: file.displayDate,
      thumbnailRef: file.thumbnailRef ?? null,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    }));
  },
});

export const listForProject = query({
  args: {
    projectPublicId: v.string(),
  },
  handler: async (ctx, args) => {
    const project = await getProjectForMember(ctx, args.projectPublicId);
    const files = await ctx.db
      .query("projectFiles")
      .withIndex("by_projectPublicId", (q) => q.eq("projectPublicId", project.publicId))
      .collect();

    files.sort((a, b) => b.createdAt - a.createdAt);

    return files.map((file) => ({
      id: file._id,
      projectPublicId: file.projectPublicId,
      tab: file.tab,
      name: file.name,
      type: file.type,
      displayDate: file.displayDate,
      thumbnailRef: file.thumbnailRef ?? null,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    }));
  },
});

export const create = mutation({
  args: {
    projectPublicId: v.string(),
    tab: fileTabValidator,
    name: v.string(),
    type: v.optional(v.string()),
    displayDate: v.optional(v.string()),
    thumbnailRef: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const project = await getProjectForMember(ctx, args.projectPublicId);
    const now = Date.now();
    const inferredType = args.type ?? args.name.split(".").pop();
    const fileType = (inferredType?.trim() || "FILE").toUpperCase();
    const displayDateInput = args.displayDate ?? new Date(now).toISOString();
    const normalizedDisplayDate = new Date(displayDateInput);

    if (Number.isNaN(normalizedDisplayDate.getTime())) {
      throw new ConvexError("Invalid displayDate");
    }

    const fileId = await ctx.db.insert("projectFiles", {
      workspaceId: project.workspaceId,
      projectId: project._id,
      projectPublicId: project.publicId,
      tab: args.tab,
      name: args.name,
      type: fileType,
      displayDate: normalizedDisplayDate.toISOString(),
      thumbnailRef: args.thumbnailRef,
      source: "upload",
      createdAt: now,
      updatedAt: now,
    });

    return { fileId };
  },
});

export const remove = mutation({
  args: {
    fileId: v.id("projectFiles"),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      return { removed: false };
    }

    await requireWorkspaceMember(ctx, file.workspaceId);
    await ctx.db.delete(file._id);

    return { removed: true, projectPublicId: file.projectPublicId };
  },
});
