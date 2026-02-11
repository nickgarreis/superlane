import type { Task, ViewerIdentity } from "../../types";
import { normalizeServiceName } from "../../lib/projectServices";

export const categoryToService = (category: string): string =>
  normalizeServiceName(category);
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
export const toProjectMutationTasks = (
  tasks: Task[],
  viewerIdentity: ViewerIdentity,
) => tasks.map((task) => toBaseMutationTask(task, viewerIdentity));
export const toWorkspaceMutationTasks = (
  tasks: Task[],
  viewerIdentity: ViewerIdentity,
) =>
  tasks.map((task) => ({
    ...toBaseMutationTask(task, viewerIdentity),
    projectPublicId: task.projectId ?? null,
  }));
