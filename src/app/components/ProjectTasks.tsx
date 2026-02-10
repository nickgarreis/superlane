import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Plus, ArrowUpDown, CornerDownLeft } from "lucide-react";
import { cn } from "../../lib/utils";
import { createClientId } from "../lib/id";
import { Task, ViewerIdentity, WorkspaceMember } from "../types";
import { motion, AnimatePresence } from "motion/react";
import "react-day-picker/dist/style.css";
import {
  compareNullableEpochMsAsc,
  toUtcNoonEpochMsFromDateOnly,
} from "../lib/dates";
import { safeScrollIntoView } from "../lib/dom";
import { ProjectTaskRows } from "./project-tasks/ProjectTaskRows";
import { DeniedAction } from "./permissions/DeniedAction";

type TaskProjectOption = {
  id: string;
  name: string;
  category: string;
};

type TaskSortBy = "dueDate" | "name" | "status";

const TASK_SORT_OPTIONS: ReadonlyArray<{ id: TaskSortBy; label: string }> = [
  { id: "dueDate", label: "Due Date" },
  { id: "name", label: "Name" },
  { id: "status", label: "Status" },
];

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
  projectOptions = [],
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
  const [openCalendarTaskId, setOpenCalendarTaskId] = useState<string | null>(null);
  const [calendarPosition, setCalendarPosition] = useState<{ top: number; left: number } | null>(null);
  const [openAssigneeTaskId, setOpenAssigneeTaskId] = useState<string | null>(null);
  const [openProjectTaskId, setOpenProjectTaskId] = useState<string | null>(null);
  const canCreateTask = newTaskTitle.trim().length > 0;
  const addTaskRowRef = useRef<HTMLDivElement | null>(null);

  // Sorting
  const [sortBy, setSortBy] = useState<TaskSortBy>("dueDate");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const sortedTasks = useMemo(
    () =>
      disableInternalSort
        ? initialTasks
        : [...initialTasks].sort((a, b) => {
            if (sortBy === "name") return a.title.localeCompare(b.title);
            if (sortBy === "status") return Number(a.completed) - Number(b.completed);
            return compareNullableEpochMsAsc(a.dueDateEpochMs, b.dueDateEpochMs);
          }),
    [disableInternalSort, initialTasks, sortBy],
  );
  const shouldOptimizeTaskRows = sortedTasks.length > 40;
  const taskRowStyle = shouldOptimizeTaskRows
    ? ({ contentVisibility: "auto", containIntrinsicSize: "56px" } as const)
    : undefined;
  const isTaskEditable = useCallback(
    (task: Task) => canEditTasks && (canEditTask ? canEditTask(task) : true),
    [canEditTask, canEditTasks],
  );
  const findTaskById = useCallback(
    (taskId: string) => initialTasks.find((task) => task.id === taskId),
    [initialTasks],
  );

  const handleToggle = (id: string) => {
    const task = findTaskById(id);
    if (!task || !isTaskEditable(task)) {
      return;
    }
    const newTasks = initialTasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    onUpdateTasks(newTasks);
  };

  const handleDelete = (id: string) => {
    const task = findTaskById(id);
    if (!task || !isTaskEditable(task)) {
      return;
    }
    const newTasks = initialTasks.filter(t => t.id !== id);
    onUpdateTasks(newTasks);
  };

  const handleCancelAddTask = useCallback(() => {
    setNewTaskTitle("");
    setIsAdding(false);
  }, [setIsAdding]);

  const handleAddTask = () => {
    if (!canCreateTask) return;
    const resolvedProjectId = showProjectColumn
      && defaultProjectId
      && projectOptions.some((project) => project.id === defaultProjectId)
      ? defaultProjectId
      : undefined;

    const defaultAssignee = assignableMembers[0];
    const newTask: Task = {
      id: createClientId("task"),
      title: newTaskTitle,
      projectId: resolvedProjectId,
      assignee: {
        name: defaultAssignee?.name ?? viewerIdentity.name ?? "Unassigned",
        avatar: defaultAssignee?.avatarUrl ?? viewerIdentity.avatarUrl ?? "",
      },
      dueDateEpochMs: null,
      completed: false
    };

    onUpdateTasks([...initialTasks, newTask]);
    setNewTaskTitle("");
    setIsAdding(false);
  };

  const handleDateSelect = (taskId: string, date: Date | undefined) => {
    if (!date) return;
    const task = findTaskById(taskId);
    if (!task || !isTaskEditable(task)) {
      setOpenCalendarTaskId(null);
      return;
    }
    const dueDateEpochMs = toUtcNoonEpochMsFromDateOnly(date);
    const newTasks = initialTasks.map(t => 
        t.id === taskId ? { ...t, dueDateEpochMs } : t
    );
    onUpdateTasks(newTasks);
    setOpenCalendarTaskId(null);
  };

  const handleAssigneeSelect = (taskId: string, member: WorkspaceMember) => {
      const task = findTaskById(taskId);
      if (!task || !isTaskEditable(task)) {
        setOpenAssigneeTaskId(null);
        return;
      }
      const newTasks = initialTasks.map(t => 
          t.id === taskId
            ? {
                ...t,
                assignee: {
                  name: member.name,
                  avatar: member.avatarUrl ?? "",
                },
              }
            : t
      );
      onUpdateTasks(newTasks);
      setOpenAssigneeTaskId(null);
  };

  const handleProjectSelect = (taskId: string, projectId: string) => {
    const task = findTaskById(taskId);
    if (!task || !isTaskEditable(task)) {
      setOpenProjectTaskId(null);
      return;
    }
    const newTasks = initialTasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            projectId: projectId.trim().length > 0 ? projectId : undefined,
          }
        : task,
    );
    onUpdateTasks(newTasks);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTask();
    } else if (e.key === 'Escape') {
      handleCancelAddTask();
    }
  };

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

  // ── Highlight / scroll-into-view for mention clicks ──────────
  const taskRowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!highlightedTaskId) return;
    const el = taskRowRefs.current[highlightedTaskId];
    if (el) {
      safeScrollIntoView(el, { behavior: "smooth", block: "center" });
      // Add flash class
      el.classList.add("task-row-flash");
      const timer = setTimeout(() => {
        el.classList.remove("task-row-flash");
        onHighlightDone?.();
      }, 1600);
      return () => clearTimeout(timer);
    } else {
      onHighlightDone?.();
    }
  }, [highlightedTaskId, onHighlightDone]);

  return (
    <div className="flex flex-col gap-5 mb-8">
        {/* Backdrop for dropdowns */}
        {(openCalendarTaskId || openAssigneeTaskId || openProjectTaskId || isSortOpen) && (
            <div className="fixed inset-0 z-40 bg-transparent" onClick={() => {
                closeAllDropdowns();
                setIsSortOpen(false);
            }} />
        )}

        {!hideHeader && (
        <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <h4 className="text-[13px] font-medium text-[#E8E8E8]/60 uppercase tracking-wider">Tasks ({initialTasks.length})</h4>
             </div>
             
             <div className="flex items-center gap-3">
                 <DeniedAction denied={!canAddTasks} reason={addTaskDisabledMessage} tooltipAlign="right">
                    <button
                       type="button"
                       onClick={() => {
                         if (!canAddTasks) {
                           return;
                         }
                         setIsAdding(true);
                       }}
                       aria-disabled={!canAddTasks}
                       className={cn(
                         "text-[12px] font-medium transition-colors flex items-center gap-1",
                         canAddTasks
                           ? "text-[#58AFFF] hover:text-[#58AFFF]/80 cursor-pointer"
                           : "text-[#58AFFF]/45 opacity-50 cursor-not-allowed",
                       )}
                    >
                       <Plus size={14} /> Add Task
                    </button>
                 </DeniedAction>

                 {/* Sort Dropdown */}
                 <div className="relative">
                    <button 
                        onClick={() => setIsSortOpen(!isSortOpen)}
                        className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 cursor-pointer",
                            isSortOpen 
                                ? "bg-white/10 text-[#E8E8E8]" 
                                : "text-[#E8E8E8]/60 hover:text-[#E8E8E8] hover:bg-white/5"
                        )}
                        title="Sort tasks"
                    >
                        <ArrowUpDown size={16} strokeWidth={2} />
                    </button>
                    
                    {isSortOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-[#1A1A1C] border border-[#262626] rounded-xl shadow-2xl overflow-hidden p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                            <div className="px-3 py-2 text-[10px] uppercase font-bold text-white/30 tracking-wider">
                                Sort by
                            </div>
                            {TASK_SORT_OPTIONS.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => {
                                        setSortBy(option.id);
                                        setIsSortOpen(false);
                                    }}
                                    className="w-full px-2 py-1.5 rounded-lg text-left text-[13px] hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-3 group"
                                >
                                    <div className={cn(
                                        "w-4 h-4 flex items-center justify-center transition-opacity",
                                        sortBy === option.id ? "opacity-100" : "opacity-0"
                                    )}>
                                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                            <path d="M9 1L3.5 6.5L1 4" stroke="#E8E8E8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <span className={cn(
                                        "transition-colors",
                                        sortBy === option.id ? "text-white" : "text-[#E8E8E8]/60 group-hover:text-[#E8E8E8]"
                                    )}>
                                        {option.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
        )}

        <div className="flex flex-col border-t border-white/5">
            {showProjectColumn && (
                <div className="flex items-center justify-between py-2 border-b border-white/5 text-[10px] uppercase tracking-wider text-white/35">
                    <div className="pl-8">Task</div>
                    <div className="flex items-center gap-3 shrink-0 pl-4">
                        <div className="w-[170px]">Project</div>
                        <div className="w-[120px]">Due Date</div>
                        <div className="w-6 text-center">Assignee</div>
                        <div className="w-7" />
                    </div>
                </div>
            )}
            <AnimatePresence initial={false}>
                {isAdding && (
                     <motion.div
                        ref={addTaskRowRef}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-b border-white/5"
                     >
                        <div className="py-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-5 h-5 rounded-full border border-white/20 shrink-0 opacity-50" />
                                <input
                                    autoFocus
                                    type="text"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="What needs to be done?"
                                    className="flex-1 bg-transparent border-none outline-none text-[14px] text-[#E8E8E8] placeholder:text-white/20"
                                />
                            </div>

                            <div className="shrink-0 pl-4">
                                <button
                                    type="button"
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={handleAddTask}
                                    disabled={!canCreateTask}
                                    className={cn(
                                        "inline-flex items-center gap-2 h-8 px-2.5 rounded-full border transition-colors",
                                        canCreateTask
                                            ? "border-[#58AFFF]/30 bg-[#58AFFF]/10 text-[#58AFFF] hover:bg-[#58AFFF]/15 cursor-pointer"
                                            : "border-white/10 bg-white/5 text-white/30 cursor-not-allowed",
                                    )}
                                >
                                    <span className={cn(
                                        "inline-flex items-center justify-center w-6 h-5 rounded-md border",
                                        canCreateTask
                                            ? "border-[#58AFFF]/35 bg-[#58AFFF]/15 text-[#9BD0FF]"
                                            : "border-white/10 bg-white/5 text-white/30",
                                    )}>
                                        <CornerDownLeft size={11} strokeWidth={2.3} aria-hidden="true" />
                                    </span>
                                    <span className="text-[12px] font-medium">Create</span>
                                </button>
                            </div>
                        </div>
                     </motion.div>
                )}
            </AnimatePresence>
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
            />
        </div>
    </div>
  );
}
