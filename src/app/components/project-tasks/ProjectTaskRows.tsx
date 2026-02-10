import React, { useMemo } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { DayPicker } from "react-day-picker";
import { fromUtcNoonEpochMsToDateOnly } from "../../lib/dates";
import type { Task, WorkspaceMember } from "../../types";
import type { TaskProjectOption } from "./useProjectTaskHandlers";
import { ProjectTaskRow } from "./ProjectTaskRow";

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
  taskRowRefs,
  taskRowStyle,
  editTaskDisabledMessage,
  isTaskEditable,
}: ProjectTaskRowsProps) {
  const projectById = useMemo(
    () => new Map(projectOptions.map((project) => [project.id, project] as const)),
    [projectOptions],
  );

  const tasksById = useMemo(
    () => new Map(initialTasks.map((task) => [task.id, task] as const)),
    [initialTasks],
  );

  const activeCalendarTask = openCalendarTaskId ? tasksById.get(openCalendarTaskId) : null;

  return (
    <>
      {sortedTasks.map((task) => (
        <ProjectTaskRow
          key={task.id}
          task={task}
          taskIsEditable={isTaskEditable(task)}
          hasOpenDropdown={
            openCalendarTaskId === task.id
            || openAssigneeTaskId === task.id
            || openProjectTaskId === task.id
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
      ))}

      {initialTasks.length === 0 && !isAdding && (
        <div className="py-8 text-center text-[13px] text-white/20 italic">
          {showProjectColumn && projectOptions.length === 0
            ? "No active projects available. Activate a project to assign tasks."
            : "No tasks yet. Click \"Add Task\" to create one."}
        </div>
      )}

      {openCalendarTaskId && calendarPosition && createPortal(
        <motion.div
          key={openCalendarTaskId}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{
            position: "fixed",
            top: calendarPosition.top,
            left: calendarPosition.left,
            zIndex: 9999,
          }}
          className="p-2 bg-[rgba(30,31,32,0.98)] rounded-[14px] shadow-[0px_18px_40px_-28px_rgba(0,0,0,0.9)] border border-[rgba(232,232,232,0.12)]"
          onClick={(event: React.MouseEvent<HTMLDivElement>) => event.stopPropagation()}
        >
          <DayPicker
            className="rdp-dark-theme"
            mode="single"
            selected={activeCalendarTask ? fromUtcNoonEpochMsToDateOnly(activeCalendarTask.dueDateEpochMs) : undefined}
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
