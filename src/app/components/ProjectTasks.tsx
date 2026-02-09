import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { Plus, Check, Trash2, Calendar, ArrowUpDown } from "lucide-react";
import { cn } from "../../lib/utils";
import { Task, ViewerIdentity, WorkspaceMember } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  compareNullableEpochMsAsc,
  formatTaskDueDate,
  fromUtcNoonEpochMsToDateOnly,
  toUtcNoonEpochMsFromDateOnly,
} from "../lib/dates";
import { ProjectLogo } from "./ProjectLogo";

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
}: ProjectTasksProps) {
  const [internalIsAdding, setInternalIsAdding] = useState(false);
  
  const isAdding = isAddingMode !== undefined ? isAddingMode : internalIsAdding;
  const setIsAdding = onAddingModeChange || setInternalIsAdding;

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskProjectId, setNewTaskProjectId] = useState<string>(defaultProjectId ?? "");
  const [openCalendarTaskId, setOpenCalendarTaskId] = useState<string | null>(null);
  const [calendarPosition, setCalendarPosition] = useState<{ top: number; left: number } | null>(null);
  const [openAssigneeTaskId, setOpenAssigneeTaskId] = useState<string | null>(null);
  const [openProjectTaskId, setOpenProjectTaskId] = useState<string | null>(null);
  const [isNewTaskProjectOpen, setIsNewTaskProjectOpen] = useState(false);

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

  useEffect(() => {
    if (!showProjectColumn) {
      return;
    }

    const isCurrentValid = projectOptions.some((project) => project.id === newTaskProjectId);
    if (isCurrentValid) {
      return;
    }

    const preferredProjectId = defaultProjectId && projectOptions.some((project) => project.id === defaultProjectId)
      ? defaultProjectId
      : "";
    setNewTaskProjectId(preferredProjectId);
  }, [defaultProjectId, newTaskProjectId, projectOptions, showProjectColumn]);

  const handleToggle = (id: string) => {
    const newTasks = initialTasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    onUpdateTasks(newTasks);
  };

  const handleDelete = (id: string) => {
    const newTasks = initialTasks.filter(t => t.id !== id);
    onUpdateTasks(newTasks);
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const resolvedProjectId = showProjectColumn ? newTaskProjectId || undefined : undefined;

    const defaultAssignee = assignableMembers[0];
    const newTask: Task = {
      id: Date.now().toString(),
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
    setNewTaskProjectId(defaultProjectId ?? "");
    setIsAdding(false);
  };

  const handleDateSelect = (taskId: string, date: Date | undefined) => {
    if (!date) return;
    const dueDateEpochMs = toUtcNoonEpochMsFromDateOnly(date);
    const newTasks = initialTasks.map(t => 
        t.id === taskId ? { ...t, dueDateEpochMs } : t
    );
    onUpdateTasks(newTasks);
    setOpenCalendarTaskId(null);
  };

  const handleAssigneeSelect = (taskId: string, member: WorkspaceMember) => {
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
      handleAddTask();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewTaskTitle("");
    }
  };

  const getInitials = (name: string) => {
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const closeAllDropdowns = () => {
      setOpenCalendarTaskId(null);
      setCalendarPosition(null);
      setOpenAssigneeTaskId(null);
      setOpenProjectTaskId(null);
      setIsNewTaskProjectOpen(false);
  };

  // ── Highlight / scroll-into-view for mention clicks ──────────
  const taskRowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!highlightedTaskId) return;
    const el = taskRowRefs.current[highlightedTaskId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
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
        {(openCalendarTaskId || openAssigneeTaskId || openProjectTaskId || isNewTaskProjectOpen || isSortOpen) && (
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
                 <button
                    onClick={() => setIsAdding(true)}
                    className="text-[12px] font-medium text-[#58AFFF] hover:text-[#58AFFF]/80 transition-colors flex items-center gap-1 cursor-pointer"
                 >
                    <Plus size={14} /> Add Task
                 </button>

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
                                    onBlur={() => !newTaskTitle && setIsAdding(false)}
                                    placeholder="What needs to be done?"
                                    className="flex-1 bg-transparent border-none outline-none text-[14px] text-[#E8E8E8] placeholder:text-white/20"
                                />
                            </div>

                            {showProjectColumn && (
                                <div className="flex items-center gap-3 shrink-0 pl-4">
                                    <div className="w-[170px] relative">
                                        <div
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                closeAllDropdowns();
                                                if (projectOptions.length === 0) {
                                                  return;
                                                }
                                                setIsNewTaskProjectOpen((open) => !open);
                                            }}
                                            className={cn(
                                              "flex items-center gap-1.5 text-[12px] transition-colors py-1 px-2 rounded-md w-full",
                                              projectOptions.length === 0
                                                ? "text-[rgba(232,232,232,0.22)] cursor-not-allowed"
                                                : "text-[rgba(232,232,232,0.44)] cursor-pointer hover:text-[#E8E8E8] hover:bg-[rgba(232,232,232,0.08)]",
                                              isNewTaskProjectOpen && "bg-[rgba(232,232,232,0.08)] text-[#E8E8E8]",
                                            )}
                                        >
                                            {newTaskProjectId ? (
                                                <ProjectLogo
                                                  size={12}
                                                  category={
                                                    projectOptions.find((project) => project.id === newTaskProjectId)?.category ?? "General"
                                                  }
                                                />
                                            ) : (
                                                <div className="w-3 h-3 rounded-full bg-[rgba(232,232,232,0.22)]" />
                                            )}
                                            <span className="truncate">
                                                {projectOptions.length === 0
                                                  ? "No active projects"
                                                  : projectOptions.find((project) => project.id === newTaskProjectId)?.name ?? "No project"}
                                            </span>
                                        </div>

                                        <AnimatePresence>
                                            {isNewTaskProjectOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute right-0 top-full mt-2 z-50 py-1 bg-[rgba(30,31,32,0.98)] rounded-xl shadow-xl border border-[rgba(232,232,232,0.12)] w-[220px] overflow-hidden"
                                                    onClick={(event) => event.stopPropagation()}
                                                >
                                                    <div className="px-3 py-2 text-[10px] uppercase font-medium text-[rgba(232,232,232,0.44)] tracking-wider">
                                                        Project
                                                    </div>
                                                    <div
                                                        onClick={() => {
                                                            setNewTaskProjectId("");
                                                            setIsNewTaskProjectOpen(false);
                                                        }}
                                                        className={cn(
                                                          "flex items-center gap-2 px-3 py-2 hover:bg-[rgba(232,232,232,0.08)] cursor-pointer transition-colors",
                                                          newTaskProjectId === "" && "bg-[rgba(232,232,232,0.08)]",
                                                        )}
                                                    >
                                                        <div className="w-3 h-3 rounded-full bg-[rgba(232,232,232,0.22)]" />
                                                        <span className={cn(
                                                          "text-[13px]",
                                                          newTaskProjectId === "" ? "text-white font-medium" : "text-[#E8E8E8]",
                                                        )}>
                                                            No project
                                                        </span>
                                                    </div>
                                                    {projectOptions.map((project) => (
                                                        <div
                                                            key={project.id}
                                                            onClick={() => {
                                                                setNewTaskProjectId(project.id);
                                                                setIsNewTaskProjectOpen(false);
                                                            }}
                                                            className={cn(
                                                              "flex items-center gap-2 px-3 py-2 hover:bg-[rgba(232,232,232,0.08)] cursor-pointer transition-colors",
                                                              newTaskProjectId === project.id && "bg-[rgba(232,232,232,0.08)]",
                                                            )}
                                                        >
                                                            <ProjectLogo size={12} category={project.category} />
                                                            <span className={cn(
                                                              "text-[13px] truncate",
                                                              newTaskProjectId === project.id ? "text-white font-medium" : "text-[#E8E8E8]",
                                                            )}>
                                                                {project.name}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <div className="w-[120px] text-[11px] text-white/35">No due date</div>
                                    <div className="w-6" />
                                    <div className="w-7" />
                                </div>
                            )}
                        </div>
                     </motion.div>
                )}
            </AnimatePresence>

                <AnimatePresence initial={false}>
                {sortedTasks.map((task) => {
                    const hasOpenDropdown =
                      openCalendarTaskId === task.id ||
                      openAssigneeTaskId === task.id ||
                      openProjectTaskId === task.id;
                    return (
                    <motion.div
                        key={task.id}
                        ref={(el: HTMLDivElement | null) => { taskRowRefs.current[task.id] = el; }}
                        layout
                        exit={{ opacity: 0 }}
                        className={cn(
                            "project-task-row group flex items-center justify-between py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors relative",
                            hasOpenDropdown && "z-50"
                        )}
                    >
                        <div 
                            className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                            onClick={() => handleToggle(task.id)}
                        >
                            <div 
                                className={cn(
                                    "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all",
                                    task.completed 
                                        ? "bg-[#58AFFF] border-[#58AFFF] text-black" 
                                        : "border-white/20 group-hover:border-white/40 bg-transparent"
                                )}
                            >
                                {task.completed && <Check size={12} strokeWidth={3} />}
                            </div>
                            
                            <span className={cn(
                                "text-[14px] font-medium truncate transition-all", 
                                task.completed ? "text-white/30 line-through" : "text-[#E8E8E8]"
                            )}>
                                {task.title}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 pl-4 relative">
                             {/* Project */}
                             {showProjectColumn && (
                                <div className="w-[170px] relative">
                                    <div
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            closeAllDropdowns();
                                            setOpenProjectTaskId(openProjectTaskId === task.id ? null : task.id);
                                        }}
                                        className={cn(
                                          "flex items-center gap-1.5 text-[12px] cursor-pointer hover:text-[#E8E8E8] transition-colors py-1 px-2 rounded-md hover:bg-[rgba(232,232,232,0.08)] w-full",
                                          task.completed ? "text-white/30 pointer-events-none" : "text-[rgba(232,232,232,0.44)]",
                                          openProjectTaskId === task.id && "bg-[rgba(232,232,232,0.08)] text-[#E8E8E8]",
                                        )}
                                    >
                                        {projectOptions.some((project) => project.id === task.projectId) ? (
                                            <ProjectLogo
                                                size={12}
                                                category={
                                                    projectOptions.find((project) => project.id === task.projectId)?.category ?? "General"
                                                }
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
                             {/* Date */}
                             <div className="relative w-[120px]">
                                 <div 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (openCalendarTaskId === task.id) {
                                            closeAllDropdowns();
                                            return;
                                        }
                                        closeAllDropdowns();
                                        const rect = e.currentTarget.getBoundingClientRect();
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
                                        "flex items-center gap-1.5 text-[12px] cursor-pointer hover:text-[#E8E8E8] transition-colors py-1 px-2 rounded-md hover:bg-white/5 w-full", 
                                        task.completed ? "text-white/20 pointer-events-none" : "text-white/40",
                                        openCalendarTaskId === task.id && "bg-white/5 text-[#E8E8E8]"
                                    )}
                                 >
                                    <Calendar size={12} />
                                    <span>{formatTaskDueDate(task.dueDateEpochMs)}</span>
                                 </div>
                             </div>

                             {/* Assignee */}
                             <div className="relative w-6">
                                 <div 
                                    className={cn(
                                        "w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0 cursor-pointer transition-transform active:scale-95",
                                        task.completed && "opacity-50 pointer-events-none"
                                    )}
                                    title={task.assignee.name}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        closeAllDropdowns();
                                        setOpenAssigneeTaskId(openAssigneeTaskId === task.id ? null : task.id);
                                    }}
                                 >
                                     {task.assignee.avatar ? (
                                        <img src={task.assignee.avatar} className="w-full h-full object-cover" />
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
                                            onClick={(e) => e.stopPropagation()}
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
                                                          && "bg-[rgba(232,232,232,0.08)]"
                                                    )}
                                                >
                                                    <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0">
                                                        {member.avatarUrl ? (
                                                            <img src={member.avatarUrl} className="w-full h-full object-cover" />
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
                                                          : "text-[#E8E8E8]"
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
                            
                             {/* Delete Action (visible on hover) */}
                             <div className="w-7 flex items-center justify-center">
                               <button
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(task.id);
                                  }}
                                  className="p-1.5 hover:bg-red-500/10 hover:text-red-500 text-white/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
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
        </div>

        {/* Calendar dropdown – portaled to body to escape overflow containers */}
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
                onClick={(e) => e.stopPropagation()}
            >
                <DayPicker
                    className="rdp-dark-theme"
                    mode="single"
                    selected={(() => {
                        const activeTask = initialTasks.find(tk => tk.id === openCalendarTaskId);
                        return activeTask ? fromUtcNoonEpochMsToDateOnly(activeTask.dueDateEpochMs) : undefined;
                    })()}
                    onSelect={(date) => handleDateSelect(openCalendarTaskId, date)}
                    showOutsideDays
                    disabled={{ before: new Date() }}
                />
            </motion.div>,
            document.body,
        )}
    </div>
  );
}
