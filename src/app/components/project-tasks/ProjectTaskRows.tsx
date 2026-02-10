import React from "react";
import { createPortal } from "react-dom";
import { Check, Trash2, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DayPicker } from "react-day-picker";
import { cn } from "../../../lib/utils";
import { formatTaskDueDate, fromUtcNoonEpochMsToDateOnly } from "../../lib/dates";
import { ProjectLogo } from "../ProjectLogo";
import type { Task, WorkspaceMember } from "../../types";

type TaskProjectOption = {
  id: string;
  name: string;
  category: string;
};

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

const getInitials = (name: string) =>
  name.split(" ").map((entry) => entry[0]).join("").substring(0, 2).toUpperCase();

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
  return (
    <>
      <AnimatePresence initial={false}>
        {sortedTasks.map((task) => {
          const taskIsEditable = isTaskEditable(task);
          const hasOpenDropdown =
            openCalendarTaskId === task.id
            || openAssigneeTaskId === task.id
            || openProjectTaskId === task.id;
          return (
            <motion.div
              key={task.id}
              ref={(el: HTMLDivElement | null) => { taskRowRefs.current[task.id] = el; }}
              layout
              exit={{ opacity: 0 }}
              className={cn(
                "project-task-row group flex items-center justify-between py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors relative",
                hasOpenDropdown && "z-50",
              )}
              style={taskRowStyle}
            >
              <div
                className={cn(
                  "flex items-center gap-3 min-w-0 flex-1",
                  taskIsEditable ? "cursor-pointer" : "cursor-not-allowed",
                )}
                title={taskIsEditable ? undefined : editTaskDisabledMessage}
                onClick={() => {
                  if (!taskIsEditable) {
                    return;
                  }
                  handleToggle(task.id);
                }}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all",
                    task.completed
                      ? "bg-[#58AFFF] border-[#58AFFF] text-black"
                      : taskIsEditable
                        ? "border-white/20 group-hover:border-white/40 bg-transparent"
                        : "border-white/15 bg-transparent",
                  )}
                >
                  {task.completed && <Check size={12} strokeWidth={3} />}
                </div>

                <span className={cn(
                  "text-[14px] font-medium truncate transition-all",
                  task.completed ? "text-white/30 line-through" : "text-[#E8E8E8]",
                )}>
                  {task.title}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0 pl-4 relative">
                {showProjectColumn && (
                  <div className="w-[170px] relative">
                    <div
                      onClick={(event) => {
                        if (!taskIsEditable) {
                          return;
                        }
                        event.stopPropagation();
                        closeAllDropdowns();
                        setOpenProjectTaskId(openProjectTaskId === task.id ? null : task.id);
                      }}
                      className={cn(
                        "flex items-center gap-1.5 text-[12px] transition-colors py-1 px-2 rounded-md w-full",
                        task.completed || !taskIsEditable
                          ? "text-white/30 pointer-events-none cursor-not-allowed"
                          : "cursor-pointer hover:text-[#E8E8E8] hover:bg-[rgba(232,232,232,0.08)] text-[rgba(232,232,232,0.44)]",
                        openProjectTaskId === task.id && "bg-[rgba(232,232,232,0.08)] text-[#E8E8E8]",
                      )}
                      title={taskIsEditable ? undefined : editTaskDisabledMessage}
                    >
                      {projectOptions.some((project) => project.id === task.projectId) ? (
                        <ProjectLogo
                          size={12}
                          category={projectOptions.find((project) => project.id === task.projectId)?.category ?? "General"}
                        />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-[rgba(232,232,232,0.22)]" />
                      )}
                      <span className="truncate">
                        {projectOptions.find((project) => project.id === task.projectId)?.name ?? "No project"}
                      </span>
                    </div>

                    <AnimatePresence>
                      {openProjectTaskId === task.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 top-full mt-2 z-50 py-1 bg-[rgba(30,31,32,0.98)] rounded-xl shadow-xl border border-[rgba(232,232,232,0.12)] w-[220px] overflow-hidden"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <div className="px-3 py-2 text-[10px] uppercase font-medium text-[rgba(232,232,232,0.44)] tracking-wider">
                            Move to project
                          </div>
                          <div
                            onClick={() => {
                              handleProjectSelect(task.id, "");
                              setOpenProjectTaskId(null);
                            }}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 hover:bg-[rgba(232,232,232,0.08)] cursor-pointer transition-colors",
                              !task.projectId && "bg-[rgba(232,232,232,0.08)]",
                            )}
                          >
                            <div className="w-3 h-3 rounded-full bg-[rgba(232,232,232,0.22)]" />
                            <span className={cn(
                              "text-[13px] truncate",
                              !task.projectId ? "text-white font-medium" : "text-[#E8E8E8]",
                            )}>
                              No project
                            </span>
                          </div>
                          {projectOptions.map((project) => (
                            <div
                              key={project.id}
                              onClick={() => {
                                handleProjectSelect(task.id, project.id);
                                setOpenProjectTaskId(null);
                              }}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 hover:bg-[rgba(232,232,232,0.08)] cursor-pointer transition-colors",
                                task.projectId === project.id && "bg-[rgba(232,232,232,0.08)]",
                              )}
                            >
                              <ProjectLogo size={12} category={project.category} />
                              <span className={cn(
                                "text-[13px] truncate",
                                task.projectId === project.id ? "text-white font-medium" : "text-[#E8E8E8]",
                              )}>
                                {project.name}
                              </span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                <div className="relative w-[120px]">
                  <div
                    onClick={(event) => {
                      if (!taskIsEditable) {
                        return;
                      }
                      event.stopPropagation();
                      if (openCalendarTaskId === task.id) {
                        closeAllDropdowns();
                        return;
                      }
                      closeAllDropdowns();
                      const rect = event.currentTarget.getBoundingClientRect();
                      const calH = 310;
                      const calW = 250;
                      const gap = 8;
                      const spaceBelow = window.innerHeight - rect.bottom;
                      setCalendarPosition({
                        top: spaceBelow >= calH + gap
                          ? rect.bottom + gap
                          : Math.max(gap, rect.top - calH - gap),
                        left: Math.max(gap, Math.min(rect.right - calW, window.innerWidth - calW - gap)),
                      });
                      setOpenCalendarTaskId(task.id);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 text-[12px] transition-colors py-1 px-2 rounded-md w-full",
                      task.completed || !taskIsEditable
                        ? "text-white/20 pointer-events-none cursor-not-allowed"
                        : "cursor-pointer hover:text-[#E8E8E8] hover:bg-white/5 text-white/40",
                      openCalendarTaskId === task.id && "bg-white/5 text-[#E8E8E8]",
                    )}
                    title={taskIsEditable ? undefined : editTaskDisabledMessage}
                  >
                    <Calendar size={12} />
                    <span>{formatTaskDueDate(task.dueDateEpochMs)}</span>
                  </div>
                </div>

                <div className="relative w-6">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0 transition-transform active:scale-95",
                      task.completed || !taskIsEditable
                        ? "opacity-50 pointer-events-none cursor-not-allowed"
                        : "cursor-pointer",
                    )}
                    title={taskIsEditable ? task.assignee.name : editTaskDisabledMessage}
                    onClick={(event) => {
                      if (!taskIsEditable) {
                        return;
                      }
                      event.stopPropagation();
                      closeAllDropdowns();
                      setOpenAssigneeTaskId(openAssigneeTaskId === task.id ? null : task.id);
                    }}
                  >
                    {task.assignee.avatar ? (
                      <img
                        src={task.assignee.avatar}
                        alt={task.assignee.name ? `${task.assignee.name} avatar` : "Assignee avatar"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#333] flex items-center justify-center text-[9px] font-medium text-white">
                        {getInitials(task.assignee.name)}
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {openAssigneeTaskId === task.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 z-50 py-1 bg-[rgba(30,31,32,0.98)] rounded-xl shadow-xl border border-[rgba(232,232,232,0.12)] w-[200px] overflow-hidden"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <div className="px-3 py-2 text-[10px] uppercase font-medium text-[rgba(232,232,232,0.44)] tracking-wider">
                          Assign to
                        </div>
                        {assignableMembers.length === 0 && (
                          <div className="px-3 py-2 text-[12px] text-[rgba(232,232,232,0.44)]">
                            No active members
                          </div>
                        )}
                        {assignableMembers.map((member) => (
                          <div
                            key={member.userId}
                            onClick={() => handleAssigneeSelect(task.id, member)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 hover:bg-[rgba(232,232,232,0.08)] cursor-pointer transition-colors",
                              task.assignee.name === member.name
                                && (task.assignee.avatar || "") === (member.avatarUrl || "")
                                && "bg-[rgba(232,232,232,0.08)]",
                            )}
                          >
                            <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0">
                              {member.avatarUrl ? (
                                <img
                                  src={member.avatarUrl}
                                  alt={member.name ? `${member.name} avatar` : "Member avatar"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-[#333] flex items-center justify-center text-[9px] font-medium text-white">
                                  {getInitials(member.name)}
                                </div>
                              )}
                            </div>
                            <span className={cn(
                              "text-[13px]",
                              task.assignee.name === member.name
                                && (task.assignee.avatar || "") === (member.avatarUrl || "")
                                ? "text-white font-medium"
                                : "text-[#E8E8E8]",
                            )}>
                              {member.name}
                            </span>
                            {task.assignee.name === member.name
                              && (task.assignee.avatar || "") === (member.avatarUrl || "")
                              && (
                                <Check size={14} className="ml-auto text-[#58AFFF]" />
                              )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="w-7 flex items-center justify-center">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      if (!taskIsEditable) {
                        return;
                      }
                      handleDelete(task.id);
                    }}
                    disabled={!taskIsEditable}
                    title={taskIsEditable ? "Delete task" : editTaskDisabledMessage}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100",
                      taskIsEditable
                        ? "hover:bg-red-500/10 hover:text-red-500 text-white/20 cursor-pointer"
                        : "text-white/10 cursor-not-allowed",
                    )}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

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
          onClick={(event) => event.stopPropagation()}
        >
          <DayPicker
            className="rdp-dark-theme"
            mode="single"
            selected={(() => {
              const activeTask = initialTasks.find((entry) => entry.id === openCalendarTaskId);
              return activeTask ? fromUtcNoonEpochMsToDateOnly(activeTask.dueDateEpochMs) : undefined;
            })()}
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
