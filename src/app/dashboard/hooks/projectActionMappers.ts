import type { Task, ViewerIdentity } from "../../types";

const CATEGORY_TO_SERVICE: Record<string, string> = {
  webdesign: "Web Design",
  "web design": "Web Design",
  automation: "AI Automation",
  "ai automation": "AI Automation",
  marketing: "Marketing Campaigns",
  "marketing campaigns": "Marketing Campaigns",
  presentation: "Presentation",
  "ai consulting": "AI Consulting",
  "creative strategy & concept": "Creative Strategy & Concept",
};

export const categoryToService = (category: string): string =>
  CATEGORY_TO_SERVICE[category.toLowerCase()] || category;

const toBaseMutationTask = (task: Task, viewerIdentity: ViewerIdentity) => ({
  id: String(task.id),
  title: task.title,
  assignee: {
    userId: task.assignee?.userId,
    name: task.assignee?.name || viewerIdentity.name,
    avatar: task.assignee?.avatar || viewerIdentity.avatarUrl || "",
  },
  dueDateEpochMs: task.dueDateEpochMs ?? null,
  completed: task.completed,
});

export const toProjectMutationTasks = (tasks: Task[], viewerIdentity: ViewerIdentity) =>
  tasks.map((task) => toBaseMutationTask(task, viewerIdentity));

export const toWorkspaceMutationTasks = (tasks: Task[], viewerIdentity: ViewerIdentity) =>
  tasks.map((task) => ({
    ...toBaseMutationTask(task, viewerIdentity),
    projectPublicId: task.projectId ?? null,
  }));
