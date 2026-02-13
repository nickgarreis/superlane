import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { cn } from "../../lib/utils";
import { Task, ViewerIdentity, WorkspaceMember } from "../types";
import "react-day-picker/dist/style.css";
import { ProjectTaskRows } from "./project-tasks/ProjectTaskRows";
import { TasksToolbar } from "./project-tasks/TasksToolbar";
import {
  useWorkspaceTaskFiltering,
  type TaskSortBy,
} from "./project-tasks/useWorkspaceTaskFiltering";
import { AddTaskRow } from "./project-tasks/AddTaskRow";
import { ProjectTaskTableHeader } from "./project-tasks/ProjectTaskTableHeader";
import {
  useTaskHighlight,
  type TaskHighlightResult,
} from "./project-tasks/useTaskHighlight";
import {
  useProjectTaskHandlers,
  type TaskProjectOption,
} from "./project-tasks/useProjectTaskHandlers";

const EMPTY_PROJECT_OPTIONS: TaskProjectOption[] = [];
const PENDING_CREATED_TASK_TTL_MS = 30_000;

type PendingCreatedTask = {
  task: Task;
  expiresAtMs: number;
};

const prunePendingCreatedTasks = (
  entries: PendingCreatedTask[],
  {
    existingTaskIds,
    nowMs,
  }: {
    existingTaskIds?: Set<string>;
    nowMs: number;
  },
): PendingCreatedTask[] => {
  let changed = false;
  const next = entries.filter((entry) => {
    if (entry.expiresAtMs <= nowMs) {
      changed = true;
      return false;
    }
    if (existingTaskIds?.has(entry.task.id)) {
      changed = true;
      return false;
    }
    return true;
  });
  return changed ? next : entries;
};

interface ProjectTasksProps {
  isMobile?: boolean;
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
  assignableMembers: WorkspaceMember[];
  viewerIdentity: ViewerIdentity;
  projectOptions?: TaskProjectOption[];
  showProjectColumn?: boolean;
  defaultProjectId?: string | null;
  disableInternalSort?: boolean;
  hideHeader?: boolean;
  isAddingMode?: boolean;
  onAddingModeChange?: (isAdding: boolean) => void;
  highlightedTaskId?: string | null;
  onHighlightDone?: (result: TaskHighlightResult) => void;
  canAddTasks?: boolean;
  addTaskDisabledMessage?: string;
  canEditTasks?: boolean;
  canEditTask?: (task: Task) => boolean;
  editTaskDisabledMessage?: string;
}
export function ProjectTasks({
  isMobile = false,
  tasks: serverTasks,
  onUpdateTasks,
  assignableMembers,
  viewerIdentity,
  projectOptions = EMPTY_PROJECT_OPTIONS,
  showProjectColumn = false,
  defaultProjectId = null,
  disableInternalSort = false,
  hideHeader = false,
  isAddingMode,
  onAddingModeChange,
  highlightedTaskId,
  onHighlightDone,
  canAddTasks = true,
  addTaskDisabledMessage = "Tasks can only be created for active projects",
  canEditTasks = true,
  canEditTask,
  editTaskDisabledMessage = "Tasks can only be edited for active projects",
}: ProjectTasksProps) {
  const [internalIsAdding, setInternalIsAdding] = useState(false);
  const isAdding = isAddingMode !== undefined ? isAddingMode : internalIsAdding;
  const setIsAdding = onAddingModeChange || setInternalIsAdding;
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [openCalendarTaskId, setOpenCalendarTaskId] = useState<string | null>(
    null,
  );
  const [calendarPosition, setCalendarPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [openAssigneeTaskId, setOpenAssigneeTaskId] = useState<string | null>(
    null,
  );
  const [openProjectTaskId, setOpenProjectTaskId] = useState<string | null>(
    null,
  );
  const [pendingCreatedTasks, setPendingCreatedTasks] = useState<
    PendingCreatedTask[]
  >([]);

  const visibleTasks = useMemo(() => {
    if (pendingCreatedTasks.length === 0) {
      return serverTasks;
    }
    const existingTaskIds = new Set(serverTasks.map((task) => task.id));
    const pending = pendingCreatedTasks
      .map((entry) => entry.task)
      .filter((task) => !existingTaskIds.has(task.id));
    if (pending.length === 0) {
      return serverTasks;
    }
    return [...serverTasks, ...pending];
  }, [pendingCreatedTasks, serverTasks]);

  const handleUpdateTasks = useCallback(
    (nextTasks: Task[]) => {
      const previousTaskIds = new Set(serverTasks.map((task) => task.id));
      const nowMs = Date.now();
      const createdTasks = nextTasks.filter((task) => !previousTaskIds.has(task.id));
      if (createdTasks.length > 0) {
        setPendingCreatedTasks((current) => {
          const currentTaskIds = new Set(current.map((entry) => entry.task.id));
          const additions = createdTasks
            .filter((task) => !currentTaskIds.has(task.id))
            .map((task) => ({
              task,
              expiresAtMs: nowMs + PENDING_CREATED_TASK_TTL_MS,
            }));
          if (additions.length === 0) {
            return current;
          }
          return [...current, ...additions];
        });
      }
      onUpdateTasks(nextTasks);
    },
    [onUpdateTasks, serverTasks],
  );

  const addTaskRowRef = useRef<HTMLDivElement | null>(null);
  const [sortBy, setSortBy] = useState<TaskSortBy>("dueDate");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const { sortedTasks, taskRowStyle } = useWorkspaceTaskFiltering({
    initialTasks: visibleTasks,
    disableInternalSort,
    sortBy,
  });
  const {
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
  } = useProjectTaskHandlers({
    initialTasks: serverTasks,
    onUpdateTasks: handleUpdateTasks,
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
  });

  useEffect(() => {
    if (pendingCreatedTasks.length === 0) {
      return;
    }
    const existingTaskIds = new Set(serverTasks.map((task) => task.id));
    const nowMs = Date.now();
    setPendingCreatedTasks((current) =>
      prunePendingCreatedTasks(current, { existingTaskIds, nowMs }),
    );
  }, [pendingCreatedTasks.length, serverTasks]);

  useEffect(() => {
    if (pendingCreatedTasks.length === 0) {
      return;
    }
    const nextExpiryMs = pendingCreatedTasks.reduce(
      (minimumMs, entry) => Math.min(minimumMs, entry.expiresAtMs),
      Number.POSITIVE_INFINITY,
    );
    const timeoutMs = Math.max(0, nextExpiryMs - Date.now());
    const timeoutId = window.setTimeout(() => {
      const nowMs = Date.now();
      setPendingCreatedTasks((current) =>
        prunePendingCreatedTasks(current, { nowMs }),
      );
    }, timeoutMs);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pendingCreatedTasks]);

  const closeAllDropdowns = useCallback(() => {
    setOpenCalendarTaskId(null);
    setCalendarPosition(null);
    setOpenAssigneeTaskId(null);
    setOpenProjectTaskId(null);
  }, []);
  useEffect(() => {
    if (canEditTasks) {
      return;
    }
    closeAllDropdowns();
  }, [canEditTasks, closeAllDropdowns]);
  useEffect(() => {
    if (!isAdding) {
      return;
    }
    const handlePointerDownOutside = (event: PointerEvent) => {
      const rowElement = addTaskRowRef.current;
      if (!rowElement) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (rowElement.contains(target)) {
        return;
      }
      handleCancelAddTask();
    };
    document.addEventListener("pointerdown", handlePointerDownOutside);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDownOutside);
    };
  }, [handleCancelAddTask, isAdding]);
  useEffect(() => {
    if (canAddTasks) {
      return;
    }
    if (!isAdding) {
      return;
    }
    handleCancelAddTask();
  }, [canAddTasks, handleCancelAddTask, isAdding]);
  const taskRowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  useTaskHighlight({ highlightedTaskId, onHighlightDone, taskRowRefs });
  return (
    <div className="flex flex-col gap-5 mb-8">
      {" "}
      {/* Backdrop for dropdowns */}{" "}
      {(openCalendarTaskId ||
        openAssigneeTaskId ||
        openProjectTaskId ||
        isSortOpen) && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => {
            closeAllDropdowns();
            setIsSortOpen(false);
          }}
        />
      )}{" "}
      <TasksToolbar
        taskCount={visibleTasks.length}
        hideHeader={hideHeader}
        canAddTasks={canAddTasks}
        addTaskDisabledMessage={addTaskDisabledMessage}
        onStartAdding={() => setIsAdding(true)}
        isSortOpen={isSortOpen}
        onToggleSort={() => setIsSortOpen(!isSortOpen)}
        onCloseSort={() => setIsSortOpen(false)}
        sortBy={sortBy}
        onSortSelect={setSortBy}
      />{" "}
      <div
        className={cn(
          "flex w-full max-w-full min-w-0 flex-col",
          isMobile && "overflow-x-auto pb-1",
        )}
      >
        <div
          className={cn(
            "w-full min-w-0",
            isMobile && (showProjectColumn ? "min-w-[760px]" : "min-w-[560px]"),
          )}
        >
          {showProjectColumn && <ProjectTaskTableHeader />}
          {isAdding && (
            <AddTaskRow
              addTaskRowRef={addTaskRowRef}
              newTaskTitle={newTaskTitle}
              onTitleChange={setNewTaskTitle}
              canCreateTask={canCreateTask}
              onAddTask={handleAddTask}
              onKeyDown={handleKeyDown}
            />
          )}
          <ProjectTaskRows
            // Keep task rows in desktop mode on mobile; container handles horizontal scrolling.
            isMobile={false}
            initialTasks={visibleTasks}
            sortedTasks={sortedTasks}
            showProjectColumn={showProjectColumn}
            projectOptions={projectOptions}
            assignableMembers={assignableMembers}
            openCalendarTaskId={openCalendarTaskId}
            setOpenCalendarTaskId={setOpenCalendarTaskId}
            calendarPosition={calendarPosition}
            setCalendarPosition={setCalendarPosition}
            openAssigneeTaskId={openAssigneeTaskId}
            setOpenAssigneeTaskId={setOpenAssigneeTaskId}
            openProjectTaskId={openProjectTaskId}
            setOpenProjectTaskId={setOpenProjectTaskId}
            closeAllDropdowns={closeAllDropdowns}
            handleToggle={handleToggle}
            handleDelete={handleDelete}
            handleDateSelect={handleDateSelect}
            handleAssigneeSelect={handleAssigneeSelect}
            handleProjectSelect={handleProjectSelect}
            isAdding={isAdding}
            highlightedTaskId={highlightedTaskId}
            taskRowRefs={taskRowRefs}
            taskRowStyle={taskRowStyle}
            editTaskDisabledMessage={editTaskDisabledMessage}
            isTaskEditable={isTaskEditable}
          />
        </div>
      </div>{" "}
    </div>
  );
}
