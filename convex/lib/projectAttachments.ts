type ProjectIdentity = {
  _id: any;
  publicId: string;
};

const toAttachmentMirror = (file: any) => ({
  id: String(file._id),
  name: file.name,
  type: file.type,
  date: file.displayDate,
  img: file.thumbnailRef ?? "",
});

export const listActiveAttachmentFiles = async (
  ctx: any,
  projectPublicId: string,
) => {
  const files = await ctx.db
    .query("projectFiles")
    .withIndex("by_projectPublicId", (q: any) => q.eq("projectPublicId", projectPublicId))
    .collect();

  return files
    .filter((file: any) => file.tab === "Attachments" && file.deletedAt == null && file.storageId != null)
    .sort((a: any, b: any) => b.createdAt - a.createdAt);
};

export const syncProjectAttachmentMirror = async (
  ctx: any,
  project: ProjectIdentity,
) => {
  const attachmentFiles = await listActiveAttachmentFiles(ctx, project.publicId);
  await ctx.db.patch(project._id, {
    attachments: attachmentFiles.map(toAttachmentMirror),
    updatedAt: Date.now(),
  });
};
