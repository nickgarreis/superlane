import { useCallback } from "react";
import type { api } from "../../../../convex/_generated/api";
import type { DashboardMutationHandler } from "../types";
import type { ProjectData, Task, ViewerIdentity } from "../../types";
import { toProjectMutationTasks, toWorkspaceMutationTasks } from "./projectActionMappers";

type ComparableTask = {
  id: string;
  title: string;
  assignee: {
    userId?: string;
    name: string;
    avatar: string;
  };
  dueDateEpochMs: number | null;
  completed: boolean;
  projectPublicId: string | null;
};

const normalizeComparableTask = (task: {
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
}): ComparableTask => ({
  id: String(task.id),
  title: task.title,
  assignee: {
    userId:
      typeof task.assignee.userId === "string" && task.assignee.userId.trim().length > 0
        ? task.assignee.userId.trim()
        : undefined,
    name: task.assignee.name,
    avatar: task.assignee.avatar,
  },
  dueDateEpochMs: task.dueDateEpochMs ?? null,
  completed: task.completed,
  projectPublicId:
    typeof task.projectPublicId === "string" && task.projectPublicId.trim().length > 0
      ? task.projectPublicId.trim()
      : null,
});

const areComparableTasksEqual = (left: ComparableTask, right: ComparableTask) =>
  left.title === right.title
  && (left.assignee.userId ?? null) === (right.assignee.userId ?? null)
  && left.assignee.name === right.assignee.name
  && left.assignee.avatar === right.assignee.avatar
  && (left.dueDateEpochMs ?? null) === (right.dueDateEpochMs ?? null)
  && left.completed === right.completed
  && (left.projectPublicId ?? null) === (right.projectPublicId ?? null);

type UseDashboardTaskSyncArgs = {
  activeWorkspaceId: string | null | undefined;
  projects: Record<string, ProjectData>;
  workspaceTasks: Task[];
  viewerIdentity: ViewerIdentity;
  createTaskMutation: DashboardMutationHandler<typeof api.tasks.create>;
  updateTaskMutation: DashboardMutationHandler<typeof api.tasks.update>;
  removeTaskMutation: DashboardMutationHandler<typeof api.tasks.remove>;
  reorderTasksMutation: DashboardMutationHandler<typeof api.tasks.reorder>;
};

export const useDashboardTaskSync = ({
  activeWorkspaceId,
  projects,
  workspaceTasks,
  viewerIdentity,
  createTaskMutation,
  updateTaskMutation,
  removeTaskMutation,
  reorderTasksMutation,
}: UseDashboardTaskSyncArgs) => {
  const syncProjectTasks = useCallback(async (
    projectPublicId: string,
    nextTasks: Task[],
  ) => {
    if (!activeWorkspaceId) {
      throw new Error("Select a workspace before updating tasks");
    }

    const previous = toProjectMutationTasks(projects[projectPublicId]?.tasks ?? [], viewerIdentity)
      .map((task) => normalizeComparableTask({ ...task, projectPublicId }));
    const next = toProjectMutationTasks(nextTasks, viewerIdentity)
      .map((task) => normalizeComparableTask({ ...task, projectPublicId }));

    const previousById = new Map(previous.map((task) => [task.id, task]));
    const nextById = new Map(next.map((task) => [task.id, task]));

    const creates = next.filter((task) => !previousById.has(task.id));
    const updates = next.filter((task) => {
      const previousTask = previousById.get(task.id);
      if (!previousTask) {
        return false;
      }
      return !areComparableTasksEqual(previousTask, task);
    });
    const removes = previous.filter((task) => !nextById.has(task.id));

    await Promise.all(creates.map((task) => createTaskMutation({
      workspaceSlug: activeWorkspaceId,
      id: task.id,
      title: task.title,
      assignee: task.assignee,
      dueDateEpochMs: task.dueDateEpochMs,
      completed: task.completed,
      projectPublicId,
    })));

    await Promise.all(updates.map((task) => updateTaskMutation({
      workspaceSlug: activeWorkspaceId,
      taskId: task.id,
      title: task.title,
      assignee: task.assignee,
      dueDateEpochMs: task.dueDateEpochMs,
      completed: task.completed,
      projectPublicId,
    })));

    await Promise.all(removes.map((task) => removeTaskMutation({
      workspaceSlug: activeWorkspaceId,
      taskId: task.id,
    })));
  }, [
    activeWorkspaceId,
    createTaskMutation,
    projects,
    removeTaskMutation,
    updateTaskMutation,
    viewerIdentity,
  ]);

  const syncWorkspaceTasks = useCallback(async (nextTasks: Task[]) => {
    if (!activeWorkspaceId) {
      throw new Error("Select a workspace before updating tasks");
    }

    const previous = toWorkspaceMutationTasks(workspaceTasks, viewerIdentity)
      .map((task) => normalizeComparableTask({
        ...task,
        projectPublicId: task.projectPublicId ?? null,
      }));
    const next = toWorkspaceMutationTasks(nextTasks, viewerIdentity)
      .map((task) => normalizeComparableTask({
        ...task,
        projectPublicId: task.projectPublicId ?? null,
      }));

    const previousById = new Map(previous.map((task) => [task.id, task]));
    const nextById = new Map(next.map((task) => [task.id, task]));

    const creates = next.filter((task) => !previousById.has(task.id));
    const updates = next.filter((task) => {
      const previousTask = previousById.get(task.id);
      if (!previousTask) {
        return false;
      }
      return !areComparableTasksEqual(previousTask, task);
    });
    const removes = previous.filter((task) => !nextById.has(task.id));

    await Promise.all(creates.map((task) => createTaskMutation({
      workspaceSlug: activeWorkspaceId,
      id: task.id,
      title: task.title,
      assignee: task.assignee,
      dueDateEpochMs: task.dueDateEpochMs,
      completed: task.completed,
      projectPublicId: task.projectPublicId,
    })));

    await Promise.all(updates.map((task) => updateTaskMutation({
      workspaceSlug: activeWorkspaceId,
      taskId: task.id,
      title: task.title,
      assignee: task.assignee,
      dueDateEpochMs: task.dueDateEpochMs,
      completed: task.completed,
      projectPublicId: task.projectPublicId,
    })));

    await Promise.all(removes.map((task) => removeTaskMutation({
      workspaceSlug: activeWorkspaceId,
      taskId: task.id,
    })));

    const currentOrder = previous.map((task) => task.id);
    const nextOrder = next.map((task) => task.id);
    const orderChanged =
      currentOrder.length !== nextOrder.length
      || currentOrder.some((taskId, index) => taskId !== nextOrder[index]);

    if (orderChanged && nextOrder.length > 0) {
      await reorderTasksMutation({
        workspaceSlug: activeWorkspaceId,
        orderedTaskIds: nextOrder,
      });
    }
  }, [
    activeWorkspaceId,
    createTaskMutation,
    removeTaskMutation,
    reorderTasksMutation,
    updateTaskMutation,
    viewerIdentity,
    workspaceTasks,
  ]);

  return {
    syncProjectTasks,
    syncWorkspaceTasks,
  };
};
