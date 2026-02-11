import { v } from "convex/values";

export const projectStatusValidator = v.union(
  v.literal("Draft"),
  v.literal("Review"),
  v.literal("Active"),
  v.literal("Completed"),
);

export const taskAssigneeValidator = v.object({
  userId: v.optional(v.string()),
  name: v.string(),
  avatar: v.string(),
});

export const taskInputValidator = v.object({
  id: v.string(),
  title: v.string(),
  assignee: taskAssigneeValidator,
  dueDateEpochMs: v.optional(v.union(v.number(), v.null())),
  // Legacy compatibility for pre-normalization payloads.
  dueDate: v.optional(v.union(v.string(), v.null())),
  completed: v.boolean(),
});

export const workspaceTaskInputValidator = v.object({
  id: v.string(),
  title: v.string(),
  assignee: taskAssigneeValidator,
  dueDateEpochMs: v.optional(v.union(v.number(), v.null())),
  // Legacy compatibility for pre-normalization payloads.
  dueDate: v.optional(v.union(v.string(), v.null())),
  completed: v.boolean(),
  projectPublicId: v.optional(v.union(v.string(), v.null())),
});

export const draftDataValidator = v.object({
  selectedService: v.string(),
  projectName: v.string(),
  selectedJob: v.string(),
  description: v.string(),
  isAIEnabled: v.boolean(),
  deadlineEpochMs: v.optional(v.union(v.number(), v.null())),
  // Legacy compatibility for pre-normalization payloads.
  deadline: v.optional(v.union(v.string(), v.null())),
  lastStep: v.number(),
});

export const attachmentValidator = v.object({
  id: v.union(v.string(), v.number()),
  name: v.string(),
  type: v.string(),
  dateEpochMs: v.optional(v.union(v.number(), v.null())),
  // Legacy compatibility for pre-normalization payloads.
  date: v.optional(v.union(v.string(), v.null())),
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
    userId: v.optional(v.string()),
    name: v.string(),
    avatar: v.string(),
  }),
  content: v.string(),
  timestamp: v.string(),
});
