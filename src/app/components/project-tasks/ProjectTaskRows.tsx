import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { DayPicker } from "react-day-picker";
import { cn } from "../../../lib/utils";
import { fromUtcNoonEpochMsToDateOnly } from "../../lib/dates";
import { Z_LAYERS } from "../../lib/zLayers";
import type { Task, WorkspaceMember } from "../../types";
import type { TaskProjectOption } from "./useProjectTaskHandlers";
import { ProjectTaskRow } from "./ProjectTaskRow";
import { CALENDAR_POPOVER_SURFACE_CLASS } from "../ui/menuChrome";
type ProjectTaskRowsProps = {
  initialTasks: Task[];
  sortedTasks: Task[];
  showProjectColumn: boolean;
  projectOptions: TaskProjectOption[];
  assignableMembers: WorkspaceMember[];
  openCalendarTaskId: string | null;
  setOpenCalendarTaskId: (value: string | null) => void;
  calendarPosition: { top: number; left: number } | null;
  setCalendarPosition: (value: { top: number; left: number } | null) => void;
  openAssigneeTaskId: string | null;
  setOpenAssigneeTaskId: (value: string | null) => void;
  openProjectTaskId: string | null;
  setOpenProjectTaskId: (value: string | null) => void;
  closeAllDropdowns: () => void;
  handleToggle: (taskId: string) => void;
  handleDelete: (taskId: string) => void;
  handleDateSelect: (taskId: string, date: Date | undefined) => void;
  handleAssigneeSelect: (taskId: string, member: WorkspaceMember) => void;
  handleProjectSelect: (taskId: string, projectId: string) => void;
  isAdding: boolean;
  highlightedTaskId?: string | null;
  taskRowRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  taskRowStyle?: React.CSSProperties;
  editTaskDisabledMessage: string;
  isTaskEditable: (task: Task) => boolean;
};
export const ProjectTaskRows = React.memo(function ProjectTaskRows({
  initialTasks,
  sortedTasks,
  showProjectColumn,
  projectOptions,
  assignableMembers,
  openCalendarTaskId,
  setOpenCalendarTaskId,
  calendarPosition,
  setCalendarPosition,
  openAssigneeTaskId,
  setOpenAssigneeTaskId,
  openProjectTaskId,
  setOpenProjectTaskId,
  closeAllDropdowns,
  handleToggle,
  handleDelete,
  handleDateSelect,
  handleAssigneeSelect,
  handleProjectSelect,
  isAdding,
  highlightedTaskId,
  taskRowRefs,
  taskRowStyle,
  editTaskDisabledMessage,
  isTaskEditable,
}: ProjectTaskRowsProps) {
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);
  const rowsRootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!rowsRootRef.current) {
      setScrollElement(null);
      return;
    }
    let parent = rowsRootRef.current.parentElement;
    while (parent) {
      const overflowY = window.getComputedStyle(parent).overflowY;
      if (overflowY === "auto" || overflowY === "scroll") {
        setScrollElement(parent);
        return;
      }
      parent = parent.parentElement;
    }
    setScrollElement(null);
  }, [sortedTasks.length]);
  const projectById = useMemo(
    () =>
      new Map(projectOptions.map((project) => [project.id, project] as const)),
    [projectOptions],
  );
  const tasksById = useMemo(
    () => new Map(initialTasks.map((task) => [task.id, task] as const)),
    [initialTasks],
  );
  const activeCalendarTask = openCalendarTaskId
    ? tasksById.get(openCalendarTaskId)
    : null;
  const shouldVirtualizeRows =
    sortedTasks.length > 80 && Boolean(scrollElement);
  const rowVirtualizer = useVirtualizer({
    count: sortedTasks.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => 56,
    overscan: 8,
  });
  useEffect(() => {
    if (!highlightedTaskId || !shouldVirtualizeRows) {
      return;
    }
    const highlightedTaskIndex = sortedTasks.findIndex(
      (task) => task.id === highlightedTaskId,
    );
    if (highlightedTaskIndex < 0) {
      return;
    }
    rowVirtualizer.scrollToIndex(highlightedTaskIndex, { align: "center" });
  }, [highlightedTaskId, rowVirtualizer, shouldVirtualizeRows, sortedTasks]);
  return (
    <>
      <div ref={rowsRootRef}>
        {shouldVirtualizeRows ? (
          <div
            style={{
              height: rowVirtualizer.getTotalSize(),
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const task = sortedTasks[virtualItem.index];
              if (!task) {
                return null;
              }
              return (
                <div
                  key={task.id}
                  data-index={virtualItem.index}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <ProjectTaskRow
                    task={task}
                    taskIsEditable={isTaskEditable(task)}
                    hasOpenDropdown={
                      openCalendarTaskId === task.id ||
                      openAssigneeTaskId === task.id ||
                      openProjectTaskId === task.id
                    }
                    showProjectColumn={showProjectColumn}
                    projectOptions={projectOptions}
                    projectById={projectById}
                    assignableMembers={assignableMembers}
                    openCalendarTaskId={openCalendarTaskId}
                    setOpenCalendarTaskId={setOpenCalendarTaskId}
                    setCalendarPosition={setCalendarPosition}
                    openAssigneeTaskId={openAssigneeTaskId}
                    setOpenAssigneeTaskId={setOpenAssigneeTaskId}
                    openProjectTaskId={openProjectTaskId}
                    setOpenProjectTaskId={setOpenProjectTaskId}
                    closeAllDropdowns={closeAllDropdowns}
                    handleToggle={handleToggle}
                    handleDelete={handleDelete}
                    handleAssigneeSelect={handleAssigneeSelect}
                    handleProjectSelect={handleProjectSelect}
                    editTaskDisabledMessage={editTaskDisabledMessage}
                    taskRowRefs={taskRowRefs}
                    taskRowStyle={taskRowStyle}
                    disableLayoutAnimation
                  />
                </div>
              );
            })}
          </div>
        ) : (
          sortedTasks.map((task) => (
            <ProjectTaskRow
              key={task.id}
              task={task}
              taskIsEditable={isTaskEditable(task)}
              hasOpenDropdown={
                openCalendarTaskId === task.id ||
                openAssigneeTaskId === task.id ||
                openProjectTaskId === task.id
              }
              showProjectColumn={showProjectColumn}
              projectOptions={projectOptions}
              projectById={projectById}
              assignableMembers={assignableMembers}
              openCalendarTaskId={openCalendarTaskId}
              setOpenCalendarTaskId={setOpenCalendarTaskId}
              setCalendarPosition={setCalendarPosition}
              openAssigneeTaskId={openAssigneeTaskId}
              setOpenAssigneeTaskId={setOpenAssigneeTaskId}
              openProjectTaskId={openProjectTaskId}
              setOpenProjectTaskId={setOpenProjectTaskId}
              closeAllDropdowns={closeAllDropdowns}
              handleToggle={handleToggle}
              handleDelete={handleDelete}
              handleAssigneeSelect={handleAssigneeSelect}
              handleProjectSelect={handleProjectSelect}
              editTaskDisabledMessage={editTaskDisabledMessage}
              taskRowRefs={taskRowRefs}
              taskRowStyle={taskRowStyle}
            />
          ))
        )}
      </div>
      {initialTasks.length === 0 && !isAdding && (
        <div className="py-8 text-center txt-role-body-md text-white/20 italic">
          {showProjectColumn && projectOptions.length === 0
            ? "No active projects available. Activate a project to assign tasks."
            : 'No tasks yet. Click "Add Task" to create one.'}
        </div>
      )}
      {openCalendarTaskId &&
        calendarPosition &&
        createPortal(
          <motion.div
            key={openCalendarTaskId}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
              position: "fixed",
              top: calendarPosition.top,
              left: calendarPosition.left,
              zIndex: Z_LAYERS.popover,
            }}
            className={cn("p-2 rounded-[14px]", CALENDAR_POPOVER_SURFACE_CLASS)}
            onClick={(event: React.MouseEvent<HTMLDivElement>) =>
              event.stopPropagation()
            }
          >
            <DayPicker
              className="rdp-dark-theme"
              mode="single"
              selected={
                activeCalendarTask
                  ? fromUtcNoonEpochMsToDateOnly(
                      activeCalendarTask.dueDateEpochMs,
                    )
                  : undefined
              }
              onSelect={(date) => handleDateSelect(openCalendarTaskId, date)}
              showOutsideDays
              disabled={{ before: new Date() }}
            />
          </motion.div>,
          document.body,
        )}
    </>
  );
});
