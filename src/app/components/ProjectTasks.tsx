import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { useTaskHighlight } from "./project-tasks/useTaskHighlight";
import {
  useProjectTaskHandlers,
  type TaskProjectOption,
} from "./project-tasks/useProjectTaskHandlers";

const EMPTY_PROJECT_OPTIONS: TaskProjectOption[] = [];

interface ProjectTasksProps {
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
  onHighlightDone?: () => void;
  canAddTasks?: boolean;
  addTaskDisabledMessage?: string;
  canEditTasks?: boolean;
  canEditTask?: (task: Task) => boolean;
  editTaskDisabledMessage?: string;
}
export function ProjectTasks({
  tasks: initialTasks,
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
  const addTaskRowRef = useRef<HTMLDivElement | null>(null);
  const [sortBy, setSortBy] = useState<TaskSortBy>("dueDate");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const { sortedTasks, taskRowStyle } = useWorkspaceTaskFiltering({
    initialTasks,
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
  });
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
        taskCount={initialTasks.length}
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
      <div className="flex flex-col border-t border-white/5">
        {" "}
        {showProjectColumn && <ProjectTaskTableHeader />}{" "}
        {isAdding && (
          <AddTaskRow
            addTaskRowRef={addTaskRowRef}
            newTaskTitle={newTaskTitle}
            onTitleChange={setNewTaskTitle}
            canCreateTask={canCreateTask}
            onAddTask={handleAddTask}
            onKeyDown={handleKeyDown}
          />
        )}{" "}
        <ProjectTaskRows
          initialTasks={initialTasks}
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
          taskRowRefs={taskRowRefs}
          taskRowStyle={taskRowStyle}
          editTaskDisabledMessage={editTaskDisabledMessage}
          isTaskEditable={isTaskEditable}
        />{" "}
      </div>{" "}
    </div>
  );
}
