import React from "react";
import { Check, Trash2, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../../lib/utils";
import { formatTaskDueDate } from "../../lib/dates";
import { ProjectLogo } from "../ProjectLogo";
import type { Task, WorkspaceMember } from "../../types";
import type { TaskProjectOption } from "./useProjectTaskHandlers";
import {
  getAssigneeInitials,
  resolveSelectedAssigneeUserId,
} from "./taskRowHelpers";
import {
  MENU_CHECK_ICON_CLASS,
  MENU_HEADER_CLASS,
  MENU_ITEM_ACTIVE_CLASS,
  MENU_ITEM_CLASS,
  MENU_SURFACE_CLASS,
} from "../ui/menuChrome";
type ProjectTaskRowProps = {
  isMobile?: boolean;
  task: Task;
  taskIsEditable: boolean;
  hasOpenDropdown: boolean;
  showProjectColumn: boolean;
  projectOptions: TaskProjectOption[];
  projectById: Map<string, TaskProjectOption>;
  assignableMembers: WorkspaceMember[];
  openCalendarTaskId: string | null;
  setOpenCalendarTaskId: (value: string | null) => void;
  setCalendarPosition: (value: { top: number; left: number } | null) => void;
  openAssigneeTaskId: string | null;
  setOpenAssigneeTaskId: (value: string | null) => void;
  openProjectTaskId: string | null;
  setOpenProjectTaskId: (value: string | null) => void;
  closeAllDropdowns: () => void;
  handleToggle: (taskId: string) => void;
  handleDelete: (taskId: string) => void;
  handleAssigneeSelect: (taskId: string, member: WorkspaceMember) => void;
  handleProjectSelect: (taskId: string, projectId: string) => void;
  editTaskDisabledMessage: string;
  taskRowRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  taskRowStyle?: React.CSSProperties;
  disableLayoutAnimation?: boolean;
};
const areProjectTaskRowPropsEqual = (
  prev: ProjectTaskRowProps,
  next: ProjectTaskRowProps,
) => {
  if (prev.task !== next.task) return false;
  if (prev.isMobile !== next.isMobile) return false;
  if (prev.taskIsEditable !== next.taskIsEditable) return false;
  if (prev.hasOpenDropdown !== next.hasOpenDropdown) return false;
  if (prev.showProjectColumn !== next.showProjectColumn) return false;
  if (prev.projectOptions !== next.projectOptions) return false;
  if (prev.projectById !== next.projectById) return false;
  if (prev.assignableMembers !== next.assignableMembers) return false;
  if (prev.editTaskDisabledMessage !== next.editTaskDisabledMessage) return false;
  if (prev.taskRowStyle !== next.taskRowStyle) return false;
  if (prev.disableLayoutAnimation !== next.disableLayoutAnimation) return false;

  const taskId = prev.task.id;
  const prevCalendarOpen = prev.openCalendarTaskId === taskId;
  const nextCalendarOpen = next.openCalendarTaskId === taskId;
  if (prevCalendarOpen !== nextCalendarOpen) return false;

  const prevAssigneeOpen = prev.openAssigneeTaskId === taskId;
  const nextAssigneeOpen = next.openAssigneeTaskId === taskId;
  if (prevAssigneeOpen !== nextAssigneeOpen) return false;

  const prevProjectOpen = prev.openProjectTaskId === taskId;
  const nextProjectOpen = next.openProjectTaskId === taskId;
  if (prevProjectOpen !== nextProjectOpen) return false;

  return true;
};

function ProjectTaskRowComponent({
  isMobile = false,
  task,
  taskIsEditable,
  hasOpenDropdown,
  showProjectColumn,
  projectOptions,
  projectById,
  assignableMembers,
  openCalendarTaskId,
  setOpenCalendarTaskId,
  setCalendarPosition,
  openAssigneeTaskId,
  setOpenAssigneeTaskId,
  openProjectTaskId,
  setOpenProjectTaskId,
  closeAllDropdowns,
  handleToggle,
  handleDelete,
  handleAssigneeSelect,
  handleProjectSelect,
  editTaskDisabledMessage,
  taskRowRefs,
  taskRowStyle,
  disableLayoutAnimation = false,
}: ProjectTaskRowProps) {
  const selectedProject = task.projectId
    ? projectById.get(task.projectId)
    : undefined;
  const selectedAssigneeUserId = resolveSelectedAssigneeUserId(
    task,
    assignableMembers,
  );
  const isSelectedAssignee = (member: WorkspaceMember) =>
    selectedAssigneeUserId != null && selectedAssigneeUserId === member.userId;
  const checkboxStateClassName = !taskIsEditable
    ? task.completed
      ? "bg-white/15 border-white/15 text-white/50 opacity-60"
      : "border-white/15 bg-transparent opacity-50"
    : task.completed
      ? "bg-text-tone-accent border-text-tone-accent text-text-tone-inverse"
      : "border-white/20 group-hover:border-white/40 bg-transparent";
  const taskTitleStateClassName = task.completed
    ? "text-white/30 line-through"
    : taskIsEditable
      ? "txt-tone-primary"
      : "text-white/40";
  return (
    <motion.div
      key={task.id}
      ref={(el: HTMLDivElement | null) => {
        taskRowRefs.current[task.id] = el;
      }}
      layout={!disableLayoutAnimation}
      className={cn(
        "project-task-row group flex transition-colors relative",
        isMobile
          ? "flex-col items-stretch gap-2 rounded-xl border border-border-subtle-soft px-3 py-3 bg-surface-hover-subtle"
          : "items-center justify-between py-3 hover:bg-white/[0.02]",
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
            checkboxStateClassName,
          )}
        >
          {task.completed && <Check size={12} strokeWidth={3} />}
        </div>
        <span
          className={cn(
            "txt-role-body-lg font-medium truncate transition-all",
            taskTitleStateClassName,
          )}
        >
          {task.title}
        </span>
      </div>
      <div
        className={cn(
          "flex items-center gap-3 shrink-0 relative",
          isMobile ? "pl-8 flex-wrap pt-1" : "pl-4",
        )}
      >
        {showProjectColumn && (
          <div className={cn("relative", isMobile ? "min-w-0 flex-1" : "w-[170px]")}>
            <div
              onClick={(event) => {
                if (!taskIsEditable) {
                  return;
                }
                event.stopPropagation();
                closeAllDropdowns();
                setOpenProjectTaskId(
                  openProjectTaskId === task.id ? null : task.id,
                );
              }}
              className={cn(
                "flex items-center gap-1.5 txt-role-body-sm transition-colors py-1 px-2 rounded-md w-full",
                task.completed || !taskIsEditable
                  ? "text-white/30 pointer-events-none cursor-not-allowed"
                  : "cursor-pointer hover:txt-tone-primary hover:bg-control-surface-muted txt-tone-faint",
                openProjectTaskId === task.id &&
                  "bg-control-surface-muted txt-tone-primary",
              )}
              title={taskIsEditable ? undefined : editTaskDisabledMessage}
            >
              {selectedProject ? (
                <ProjectLogo size={12} category={selectedProject.category} />
              ) : (
                <div className="w-3 h-3 rounded-full bg-control-dot-muted" />
              )}
              <span className="truncate">
                {selectedProject?.name ?? "No project"}
              </span>
            </div>
            <AnimatePresence>
              {openProjectTaskId === task.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className={cn(
                    "absolute right-0 top-full mt-1 z-50 w-[220px]",
                    MENU_SURFACE_CLASS,
                  )}
                  onClick={(event: React.MouseEvent<HTMLDivElement>) =>
                    event.stopPropagation()
                  }
                >
                  <div className={MENU_HEADER_CLASS}>
                    Move to project
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleProjectSelect(task.id, "");
                      setOpenProjectTaskId(null);
                    }}
                    className={cn(
                      MENU_ITEM_CLASS,
                      !task.projectId ? MENU_ITEM_ACTIVE_CLASS : "txt-tone-muted",
                    )}
                  >
                    <div className="w-3 h-3 rounded-full bg-control-dot-muted" />
                    <span
                      className={cn(
                        "truncate flex-1",
                        task.projectId &&
                          "group-hover:text-white transition-colors",
                      )}
                    >
                      No project
                    </span>
                    {!task.projectId && (
                      <Check className={MENU_CHECK_ICON_CLASS} />
                    )}
                  </button>
                  {projectOptions.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => {
                        handleProjectSelect(task.id, project.id);
                        setOpenProjectTaskId(null);
                      }}
                      className={cn(
                        MENU_ITEM_CLASS,
                        task.projectId === project.id
                          ? MENU_ITEM_ACTIVE_CLASS
                          : "txt-tone-muted",
                      )}
                    >
                      <ProjectLogo size={12} category={project.category} />
                      <span
                        className={cn(
                          "truncate flex-1",
                          task.projectId !== project.id &&
                            "group-hover:text-white transition-colors",
                        )}
                      >
                        {project.name}
                      </span>
                      {task.projectId === project.id && (
                        <Check className={MENU_CHECK_ICON_CLASS} />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        <div className={cn("relative", isMobile ? "w-auto" : "w-[120px]")}>
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
                top:
                  spaceBelow >= calH + gap
                    ? rect.bottom + gap
                    : Math.max(gap, rect.top - calH - gap),
                left: Math.max(
                  gap,
                  Math.min(rect.right - calW, window.innerWidth - calW - gap),
                ),
              });
              setOpenCalendarTaskId(task.id);
            }}
            className={cn(
              "flex items-center gap-1.5 txt-role-body-sm transition-colors py-1 px-2 rounded-md w-full",
              task.completed || !taskIsEditable
                ? "text-white/20 pointer-events-none cursor-not-allowed"
                : "cursor-pointer hover:txt-tone-primary hover:bg-white/5 text-white/40",
              openCalendarTaskId === task.id && "bg-white/5 txt-tone-primary",
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
            title={
              taskIsEditable ? task.assignee.name : editTaskDisabledMessage
            }
            onClick={(event) => {
              if (!taskIsEditable) {
                return;
              }
              event.stopPropagation();
              closeAllDropdowns();
              setOpenAssigneeTaskId(
                openAssigneeTaskId === task.id ? null : task.id,
              );
            }}
          >
            {task.assignee.avatar ? (
              <img
                src={task.assignee.avatar}
                alt={
                  task.assignee.name
                    ? `${task.assignee.name} avatar`
                    : "Assignee avatar"
                }
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-bg-avatar-fallback flex items-center justify-center txt-role-micro font-medium text-white">
                {getAssigneeInitials(task.assignee.name)}
              </div>
            )}
          </div>
          <AnimatePresence>
            {openAssigneeTaskId === task.id && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={cn(
                  "absolute right-0 top-full mt-1 z-50 w-[220px]",
                  MENU_SURFACE_CLASS,
                )}
                onClick={(event: React.MouseEvent<HTMLDivElement>) =>
                  event.stopPropagation()
                }
              >
                <div className={MENU_HEADER_CLASS}>
                  Assign to
                </div>
                {assignableMembers.length === 0 && (
                  <div className="px-3 py-2 txt-role-body-sm txt-tone-faint">
                    No active members
                  </div>
                )}
                <div className="max-h-[220px] overflow-y-auto py-1">
                  {assignableMembers.map((member) => (
                    <button
                      key={member.userId}
                      type="button"
                      onClick={() => handleAssigneeSelect(task.id, member)}
                      className={cn(
                        MENU_ITEM_CLASS,
                        isSelectedAssignee(member)
                          ? MENU_ITEM_ACTIVE_CLASS
                          : "txt-tone-muted",
                      )}
                    >
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={
                              member.name
                                ? `${member.name} avatar`
                                : "Member avatar"
                            }
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-bg-avatar-fallback flex items-center justify-center txt-role-micro font-medium text-white">
                            {getAssigneeInitials(member.name)}
                          </div>
                        )}
                      </div>
                      <span
                        className={cn(
                          "truncate flex-1",
                          !isSelectedAssignee(member) &&
                            "group-hover:text-white transition-colors",
                        )}
                      >
                        {member.name}
                      </span>
                      {isSelectedAssignee(member) && (
                        <Check className={MENU_CHECK_ICON_CLASS} />
                      )}
                    </button>
                  ))}
                </div>
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
              "p-1.5 rounded-lg transition-colors",
              isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100",
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
}

export const ProjectTaskRow = React.memo(
  ProjectTaskRowComponent,
  areProjectTaskRowPropsEqual,
);

ProjectTaskRow.displayName = "ProjectTaskRow";
