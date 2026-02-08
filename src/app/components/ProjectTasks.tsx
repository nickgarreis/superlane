import React, { useState, useEffect, useRef } from "react";
import { Plus, Check, Trash2, Calendar, ArrowUpDown } from "lucide-react";
import { cn } from "../../lib/utils";
import { Task } from "../types";
import { motion, AnimatePresence } from "motion/react";
import imgAvatar from "figma:asset/fea98b130b1d6a04ebf9c88afab5cd53fbd3e447.png";
import { DayPicker } from "react-day-picker";
import { format, parse } from "date-fns";

// Mock members data matching SettingsPopup
const AVAILABLE_MEMBERS = [
    { name: "Nick Garreis", avatar: imgAvatar },
    { name: "Sarah Smith", avatar: null }, // Will use initials
    { name: "Mike Johnson", avatar: null }
];

interface ProjectTasksProps {
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
  hideHeader?: boolean;
  isAddingMode?: boolean;
  onAddingModeChange?: (isAdding: boolean) => void;
  highlightedTaskId?: string | null;
  onHighlightDone?: () => void;
}

export function ProjectTasks({ tasks: initialTasks, onUpdateTasks, hideHeader = false, isAddingMode, onAddingModeChange, highlightedTaskId, onHighlightDone }: ProjectTasksProps) {
  const [internalIsAdding, setInternalIsAdding] = useState(false);
  
  const isAdding = isAddingMode !== undefined ? isAddingMode : internalIsAdding;
  const setIsAdding = onAddingModeChange || setInternalIsAdding;

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [openCalendarTaskId, setOpenCalendarTaskId] = useState<string | null>(null);
  const [openAssigneeTaskId, setOpenAssigneeTaskId] = useState<string | null>(null);

  // Sorting
  const [sortBy, setSortBy] = useState<"dueDate" | "name" | "status">("dueDate");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const sortedTasks = [...initialTasks].sort((a, b) => {
      if (sortBy === "name") return a.title.localeCompare(b.title);
      if (sortBy === "status") return Number(a.completed) - Number(b.completed);
      // Simple date sort (just string comparison for now as dates are formatted strings)
      return 0;
  });

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
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      assignee: AVAILABLE_MEMBERS[0], // Default to first member
      dueDate: "No date",
      completed: false
    };
    
    onUpdateTasks([...initialTasks, newTask]);
    setNewTaskTitle("");
    setIsAdding(false);
  };

  const handleDateSelect = (taskId: string, date: Date | undefined) => {
    if (!date) return;
    const formattedDate = format(date, "MMM d");
    const newTasks = initialTasks.map(t => 
        t.id === taskId ? { ...t, dueDate: formattedDate } : t
    );
    onUpdateTasks(newTasks);
    setOpenCalendarTaskId(null);
  };

  const handleAssigneeSelect = (taskId: string, member: typeof AVAILABLE_MEMBERS[0]) => {
      const newTasks = initialTasks.map(t => 
          t.id === taskId ? { ...t, assignee: member } : t
      );
      onUpdateTasks(newTasks);
      setOpenAssigneeTaskId(null);
  };

  // Helper to parse date string back to Date object
  const getTaskDate = (dateStr: string): Date | undefined => {
    if (!dateStr || dateStr === "No date") return undefined;
    try {
        const parsedDate = parse(dateStr, "MMM d", new Date());
        if (isNaN(parsedDate.getTime())) return undefined;
        return parsedDate;
    } catch (e) {
        return undefined;
    }
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
      setOpenAssigneeTaskId(null);
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
        {(openCalendarTaskId || openAssigneeTaskId || isSortOpen) && (
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
                            {[
                                { id: "dueDate", label: "Due Date" },
                                { id: "name", label: "Name" },
                                { id: "status", label: "Status" }
                            ].map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => {
                                        setSortBy(option.id as any);
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
            <AnimatePresence initial={false}>
                {isAdding && (
                     <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-b border-white/5"
                     >
                        <div className="py-3 flex items-center gap-3">
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
                     </motion.div>
                )}
            </AnimatePresence>

                <AnimatePresence initial={false}>
                {sortedTasks.map((task) => (
                    <motion.div
                        key={task.id}
                        ref={(el: HTMLDivElement | null) => { taskRowRefs.current[task.id] = el; }}
                        layout
                        exit={{ opacity: 0 }}
                        className="group flex items-center justify-between py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors relative"
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

                        <div className="flex items-center gap-4 shrink-0 pl-4 relative">
                             {/* Date */}
                             <div className="relative">
                                 <div 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        closeAllDropdowns();
                                        setOpenCalendarTaskId(openCalendarTaskId === task.id ? null : task.id);
                                    }}
                                    className={cn(
                                        "flex items-center gap-1.5 text-[12px] cursor-pointer hover:text-[#E8E8E8] transition-colors py-1 px-2 rounded-md hover:bg-white/5", 
                                        task.completed ? "text-white/20 pointer-events-none" : "text-white/40",
                                        openCalendarTaskId === task.id && "bg-white/5 text-[#E8E8E8]"
                                    )}
                                 >
                                    <Calendar size={12} />
                                    <span>{task.dueDate}</span>
                                 </div>

                                 <AnimatePresence>
                                    {openCalendarTaskId === task.id && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 top-full mt-2 z-50 p-4 bg-[#262626] rounded-2xl shadow-xl border border-white/10 w-[280px]"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <style>{`
                                                .rdp {
                                                  --rdp-cell-size: 32px;
                                                  --rdp-accent-color: #ffffff;
                                                  --rdp-background-color: #333333;
                                                  margin: 0;
                                                }
                                                .rdp-day_selected:not([disabled]) { 
                                                  background-color: #ef4444;
                                                  color: #ffffff;
                                                  font-weight: bold;
                                                  border-radius: 50%;
                                                }
                                                .rdp-day_selected:hover:not([disabled]) { 
                                                  background-color: #dc2626;
                                                }
                                                .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
                                                  background-color: rgba(255,255,255,0.1);
                                                  border-radius: 50%;
                                                }
                                                .rdp-caption_label {
                                                  color: #e8e8e8;
                                                  font-size: 14px;
                                                  font-weight: 500;
                                                }
                                                .rdp-nav_button {
                                                  color: #e8e8e8;
                                                  width: 24px;
                                                  height: 24px;
                                                  background: transparent;
                                                  border: none;
                                                  opacity: 0.7;
                                                  transition: opacity 0.2s;
                                                  cursor: pointer;
                                                }
                                                .rdp-nav_button:hover {
                                                  opacity: 1;
                                                  background-color: rgba(255,255,255,0.05) !important;
                                                }
                                                .rdp-nav_button svg {
                                                  width: 14px;
                                                  height: 14px;
                                                }
                                                .rdp-head_cell {
                                                   color: rgba(232,232,232,0.5);
                                                   font-size: 12px;
                                                }
                                                .rdp-day {
                                                   color: #e8e8e8;
                                                   font-size: 13px;
                                                   cursor: pointer;
                                                }
                                                .rdp-day_outside {
                                                  opacity: 0.5;
                                                }
                                                .rdp-day_disabled { 
                                                  color: rgba(232,232,232, 0.2);
                                                  opacity: 0.5;
                                                  pointer-events: none;
                                                }
                                            `}</style>
                                            <DayPicker
                                                mode="single"
                                                selected={getTaskDate(task.dueDate)}
                                                onSelect={(date) => handleDateSelect(task.id, date)}
                                                showOutsideDays
                                                disabled={{ before: new Date() }}
                                            />
                                        </motion.div>
                                    )}
                                 </AnimatePresence>
                             </div>

                             {/* Assignee */}
                             <div className="relative">
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
                                            className="absolute right-0 top-full mt-2 z-50 py-1 bg-[#262626] rounded-xl shadow-xl border border-white/10 w-[200px] overflow-hidden"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="px-3 py-2 text-[10px] uppercase font-medium text-white/40 tracking-wider">
                                                Assign to
                                            </div>
                                            {AVAILABLE_MEMBERS.map((member) => (
                                                <div 
                                                    key={member.name}
                                                    onClick={() => handleAssigneeSelect(task.id, member)}
                                                    className={cn(
                                                        "flex items-center gap-3 px-3 py-2 hover:bg-white/5 cursor-pointer transition-colors",
                                                        task.assignee.name === member.name && "bg-white/5"
                                                    )}
                                                >
                                                    <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0">
                                                        {member.avatar ? (
                                                            <img src={member.avatar} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-[#333] flex items-center justify-center text-[9px] font-medium text-white">
                                                                {getInitials(member.name)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className={cn(
                                                        "text-[13px]",
                                                        task.assignee.name === member.name ? "text-white font-medium" : "text-[#E8E8E8]"
                                                    )}>
                                                        {member.name}
                                                    </span>
                                                    {task.assignee.name === member.name && (
                                                        <Check size={14} className="ml-auto text-[#58AFFF]" />
                                                    )}
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                 </AnimatePresence>
                             </div>
                             
                             {/* Delete Action (visible on hover) */}
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
                    </motion.div>
                ))}
                </AnimatePresence>
            
            {initialTasks.length === 0 && !isAdding && (
                <div className="py-8 text-center text-[13px] text-white/20 italic">
                    No tasks yet. Click "Add Task" to create one.
                </div>
            )}
        </div>
    </div>
  );
}