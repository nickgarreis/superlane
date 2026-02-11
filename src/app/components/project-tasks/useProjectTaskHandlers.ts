import { useCallback, useMemo, type KeyboardEvent } from "react";
import { createClientId } from "../../lib/id";
import { toUtcNoonEpochMsFromDateOnly } from "../../lib/dates";
import type { Task, ViewerIdentity, WorkspaceMember } from "../../types";
export type TaskProjectOption = { id: string; name: string; category: string };
type UseProjectTaskHandlersArgs = {
  initialTasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
  assignableMembers: WorkspaceMember[];
  viewerIdentity: ViewerIdentity;
  projectOptions: TaskProjectOption[];
  showProjectColumn: boolean;
  defaultProjectId: string | null;
  canEditTasks: boolean;
  canEditTask?: (task: Task) => boolean;
  newTaskTitle: string;
  setNewTaskTitle: (value: string) => void;
  setIsAdding: (value: boolean) => void;
  setOpenCalendarTaskId: (value: string | null) => void;
  setOpenAssigneeTaskId: (value: string | null) => void;
  setOpenProjectTaskId: (value: string | null) => void;
};
export function useProjectTaskHandlers({
  initialTasks,
  onUpdateTasks,
  assignableMembers,
  viewerIdentity,
  projectOptions,
  showProjectColumn,
  defaultProjectId,
  canEditTasks,
  canEditTask,
  newTaskTitle,
  setNewTaskTitle,
  setIsAdding,
  setOpenCalendarTaskId,
  setOpenAssigneeTaskId,
  setOpenProjectTaskId,
}: UseProjectTaskHandlersArgs) {
  const canCreateTask = useMemo(
    () => newTaskTitle.trim().length > 0,
    [newTaskTitle],
  );
  const isTaskEditable = useCallback(
    (task: Task) => canEditTasks && (canEditTask ? canEditTask(task) : true),
    [canEditTask, canEditTasks],
  );
  const findTaskById = useCallback(
    (taskId: string) => initialTasks.find((task) => task.id === taskId),
    [initialTasks],
  );
  const handleToggle = useCallback(
    (id: string) => {
      const task = findTaskById(id);
      if (!task || !isTaskEditable(task)) {
        return;
      }
      const newTasks = initialTasks.map((entry) =>
        entry.id === id ? { ...entry, completed: !entry.completed } : entry,
      );
      onUpdateTasks(newTasks);
    },
    [findTaskById, initialTasks, isTaskEditable, onUpdateTasks],
  );
  const handleDelete = useCallback(
    (id: string) => {
      const task = findTaskById(id);
      if (!task || !isTaskEditable(task)) {
        return;
      }
      const newTasks = initialTasks.filter((entry) => entry.id !== id);
      onUpdateTasks(newTasks);
    },
    [findTaskById, initialTasks, isTaskEditable, onUpdateTasks],
  );
  const handleCancelAddTask = useCallback(() => {
    setNewTaskTitle("");
    setIsAdding(false);
  }, [setIsAdding, setNewTaskTitle]);
  const handleAddTask = useCallback(() => {
    if (!canCreateTask) {
      return;
    }
    const resolvedProjectId =
      showProjectColumn &&
      defaultProjectId &&
      projectOptions.some((project) => project.id === defaultProjectId)
        ? defaultProjectId
        : undefined;
    const defaultAssignee = assignableMembers[0];
    const newTask: Task = {
      id: createClientId("task"),
      title: newTaskTitle,
      projectId: resolvedProjectId,
      assignee: {
        userId: defaultAssignee?.userId,
        name: defaultAssignee?.name ?? viewerIdentity.name ?? "Unassigned",
        avatar: defaultAssignee?.avatarUrl ?? viewerIdentity.avatarUrl ?? "",
      },
      dueDateEpochMs: null,
      completed: false,
    };
    onUpdateTasks([...initialTasks, newTask]);
    setNewTaskTitle("");
    setIsAdding(false);
  }, [
    assignableMembers,
    canCreateTask,
    defaultProjectId,
    initialTasks,
    newTaskTitle,
    onUpdateTasks,
    projectOptions,
    setIsAdding,
    setNewTaskTitle,
    showProjectColumn,
    viewerIdentity.avatarUrl,
    viewerIdentity.name,
  ]);
  const handleDateSelect = useCallback(
    (taskId: string, date: Date | undefined) => {
      if (!date) {
        return;
      }
      const task = findTaskById(taskId);
      if (!task || !isTaskEditable(task)) {
        setOpenCalendarTaskId(null);
        return;
      }
      const dueDateEpochMs = toUtcNoonEpochMsFromDateOnly(date);
      const newTasks = initialTasks.map((entry) =>
        entry.id === taskId ? { ...entry, dueDateEpochMs } : entry,
      );
      onUpdateTasks(newTasks);
      setOpenCalendarTaskId(null);
    },
    [
      findTaskById,
      initialTasks,
      isTaskEditable,
      onUpdateTasks,
      setOpenCalendarTaskId,
    ],
  );
  const handleAssigneeSelect = useCallback(
    (taskId: string, member: WorkspaceMember) => {
      const task = findTaskById(taskId);
      if (!task || !isTaskEditable(task)) {
        setOpenAssigneeTaskId(null);
        return;
      }
      const newTasks = initialTasks.map((entry) =>
        entry.id === taskId
          ? {
              ...entry,
              assignee: {
                userId: member.userId,
                name: member.name,
                avatar: member.avatarUrl ?? "",
              },
            }
          : entry,
      );
      onUpdateTasks(newTasks);
      setOpenAssigneeTaskId(null);
    },
    [
      findTaskById,
      initialTasks,
      isTaskEditable,
      onUpdateTasks,
      setOpenAssigneeTaskId,
    ],
  );
  const handleProjectSelect = useCallback(
    (taskId: string, projectId: string) => {
      const task = findTaskById(taskId);
      if (!task || !isTaskEditable(task)) {
        setOpenProjectTaskId(null);
        return;
      }
      const newTasks = initialTasks.map((entry) =>
        entry.id === taskId
          ? {
              ...entry,
              projectId: projectId.trim().length > 0 ? projectId : undefined,
            }
          : entry,
      );
      onUpdateTasks(newTasks);
      setOpenProjectTaskId(null);
    },
    [
      findTaskById,
      initialTasks,
      isTaskEditable,
      onUpdateTasks,
      setOpenProjectTaskId,
    ],
  );
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleAddTask();
        return;
      }
      if (event.key === "Escape") {
        handleCancelAddTask();
      }
    },
    [handleAddTask, handleCancelAddTask],
  );
  return {
    canCreateTask,
    isTaskEditable,
    handleToggle,
    handleDelete,
    handleCancelAddTask,
    handleAddTask,
    handleDateSelect,
    handleAssigneeSelect,
    handleProjectSelect,
    handleKeyDown,
  };
}
