import { v } from "convex/values";

export const projectStatusValidator = v.union(
  v.literal("Draft"),
  v.literal("Review"),
  v.literal("Active"),
  v.literal("Completed"),
);

export const taskAssigneeValidator = v.object({
  name: v.string(),
  avatar: v.string(),
});

export const taskInputValidator = v.object({
  id: v.string(),
  title: v.string(),
  assignee: taskAssigneeValidator,
  dueDate: v.string(),
  completed: v.boolean(),
});

export const draftDataValidator = v.object({
  selectedService: v.string(),
  projectName: v.string(),
  selectedJob: v.string(),
  description: v.string(),
  isAIEnabled: v.boolean(),
  deadline: v.optional(v.string()),
  lastStep: v.number(),
});

export const attachmentValidator = v.object({
  id: v.union(v.string(), v.number()),
  name: v.string(),
  type: v.string(),
  date: v.string(),
  img: v.string(),
});

export const fileTabValidator = v.union(
  v.literal("Assets"),
  v.literal("Contract"),
  v.literal("Attachments"),
);

export const reviewCommentValidator = v.object({
  id: v.string(),
  author: v.object({
    name: v.string(),
    avatar: v.string(),
  }),
  content: v.string(),
  timestamp: v.string(),
});
