import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Search, ArrowRight, ListChecks, Plus, Settings, Palette, Archive, CornerDownLeft, ChevronUp, ChevronDown, Clock, X, FileText, Paperclip } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProjectData, ProjectFileData } from "../types";
import { ProjectLogo } from "./ProjectLogo";
import type { AppView } from "../lib/routing";

interface SearchResult {
  id: string;
  type: "project" | "task" | "file" | "action";
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  category?: string;
  status?: { label: string; color: string; bgColor: string; dotColor: string };
  action: () => void;
  projectId?: string;
  taskCompleted?: boolean;
  fileType?: string;
  fileTab?: string;
}

interface SearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Record<string, ProjectData>;
  files: ProjectFileData[];
  onNavigate: (view: AppView) => void;
  onOpenCreateProject: () => void;
  onOpenSettings: (tab?: string) => void;
  onHighlightNavigate?: (projectId: string, highlight: { type: "task" | "file"; taskId?: string; fileName?: string; fileTab?: string }) => void;
}

const QUICK_ACTIONS = [
  { id: "action-create", label: "Create New Project", icon: <Plus size={15} />, keyword: "create new add project" },
  { id: "action-tasks", label: "Go to Tasks", icon: <ListChecks size={15} />, keyword: "tasks todo list" },
  { id: "action-assets", label: "Go to Brand Assets", icon: <Palette size={15} />, keyword: "brand assets design" },
  { id: "action-archive", label: "Go to Archive", icon: <Archive size={15} />, keyword: "archive archived" },
  { id: "action-settings", label: "Open Settings", icon: <Settings size={15} />, keyword: "settings preferences config" },
];

// File type → color mapping for the badge
const FILE_TYPE_COLORS: Record<string, string> = {
  SVG: "#f472b6",
  PNG: "#60a5fa",
  PDF: "#f87171",
  ZIP: "#a78bfa",
  FIG: "#34d399",
  DOCX: "#38bdf8",
  XLSX: "#4ade80",
  FILE: "#9ca3af",
};

const MAX_RECENT = 5;

export function SearchPopup({ isOpen, onClose, projects, files, onNavigate, onOpenCreateProject, onOpenSettings, onHighlightNavigate }: SearchPopupProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [recentResults, setRecentResults] = useState<Array<{ id: string; title: string; type: string }>>([]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isOpen]);

  // Build action handlers
  const actionHandlers: Record<string, () => void> = useMemo(() => ({
    "action-create": () => { onClose(); onOpenCreateProject(); },
    "action-tasks": () => { onClose(); onNavigate("tasks"); },
    "action-assets": () => { onClose(); onOpenSettings("Company"); },
    "action-archive": () => { onClose(); onNavigate("archive"); },
    "action-settings": () => { onClose(); onOpenSettings(); },
  }), [onClose, onNavigate, onOpenCreateProject, onOpenSettings]);

  // Get the first navigable project ID for "global" file results
  const firstActiveProjectId = useMemo(() => {
    const active = Object.values(projects).find(p => !p.archived && p.status.label !== "Draft");
    return active?.id || Object.values(projects)[0]?.id;
  }, [projects]);

  // Build searchable file metadata from persisted Convex records
  const allFiles = useMemo(() => {
    const entries: Array<{ name: string; type: string; tab: string; projectId: string | null; date: string }> = [];
    const seen = new Set<string>();

    files.forEach((file) => {
      const key = `${file.projectPublicId}-${file.tab}-${file.name}`;
      if (!seen.has(key)) {
        seen.add(key);
        entries.push({
          name: file.name,
          type: file.type,
          tab: file.tab,
          projectId: file.projectPublicId,
          date: file.displayDate,
        });
      }
    });

    return entries;
  }, [files]);

  // Search logic
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    const items: SearchResult[] = [];

    const allProjects = Object.values(projects);

    if (!q) return items;

    // Search projects
    allProjects.forEach(project => {
      const nameMatch = project.name.toLowerCase().includes(q);
      const descMatch = project.description.toLowerCase().includes(q);
      const catMatch = project.category.toLowerCase().includes(q);
      const statusMatch = project.status.label.toLowerCase().includes(q);
      const scopeMatch = project.scope?.toLowerCase().includes(q) || false;

      if (nameMatch || descMatch || catMatch || statusMatch || scopeMatch) {
        items.push({
          id: `project-${project.id}`,
          type: "project",
          title: project.name,
          subtitle: project.archived ? "Archived" : project.status.label === "Completed" ? "Completed" : `${project.category} · ${project.status.label}`,
          icon: <ProjectLogo size={18} category={project.category} />,
          category: project.category,
          status: project.status,
          projectId: project.id,
          action: () => {
            if (project.archived) {
              onClose();
              onNavigate(`archive-project:${project.id}`);
            } else {
              onClose();
              onNavigate(`project:${project.id}`);
            }
          }
        });
      }

      // Search tasks within this project (title + assignee + dueDate)
      if (project.tasks) {
        project.tasks.forEach(task => {
          const titleMatch = task.title.toLowerCase().includes(q);
          const assigneeMatch = task.assignee.name.toLowerCase().includes(q);
          const dueDateMatch = task.dueDate.toLowerCase().includes(q);

          if (titleMatch || assigneeMatch || dueDateMatch) {
            items.push({
              id: `task-${project.id}-${task.id}`,
              type: "task",
              title: task.title,
              subtitle: `${task.assignee.name} · ${task.dueDate} · in ${project.name}`,
              icon: <ListChecks size={15} />,
              projectId: project.id,
              taskCompleted: task.completed,
              action: () => {
                onClose();
                onNavigate(`project:${project.id}`);
                if (onHighlightNavigate) {
                  onHighlightNavigate(project.id, { type: "task", taskId: task.id });
                }
              }
            });
          }
        });
      }
    });

    // Search files
    allFiles.forEach((file, idx) => {
      const nameMatch = file.name.toLowerCase().includes(q);
      const typeMatch = file.type.toLowerCase().includes(q);

      if (nameMatch || typeMatch) {
        const targetProject = file.projectId || firstActiveProjectId;
        items.push({
          id: `file-${idx}-${file.name}`,
          type: "file",
          title: file.name,
          subtitle: file.projectId
            ? `${file.tab} · in ${projects[file.projectId]?.name || "project"}`
            : `${file.tab} · ${file.date}`,
          icon: file.tab === "Attachments" ? <Paperclip size={14} /> : <FileText size={14} />,
          fileType: file.type,
          fileTab: file.tab,
          projectId: targetProject,
          action: () => {
            onClose();
            if (targetProject) {
              onNavigate(`project:${targetProject}`);
              if (onHighlightNavigate) {
                onHighlightNavigate(targetProject, { type: "file", fileName: file.name, fileTab: file.tab });
              }
            }
          }
        });
      }
    });

    // Search quick actions
    QUICK_ACTIONS.forEach(act => {
      if (act.label.toLowerCase().includes(q) || act.keyword.toLowerCase().includes(q)) {
        items.push({
          id: act.id,
          type: "action",
          title: act.label,
          subtitle: "Quick Action",
          icon: act.icon,
          action: actionHandlers[act.id],
        });
      }
    });

    return items;
  }, [query, projects, allFiles, firstActiveProjectId, onClose, onNavigate, actionHandlers, onHighlightNavigate]);

  // Group results by type
  const grouped = useMemo(() => {
    const projectResults = results.filter(r => r.type === "project");
    const taskResults = results.filter(r => r.type === "task");
    const fileResults = results.filter(r => r.type === "file");
    const actionResults = results.filter(r => r.type === "action");
    return { projectResults, taskResults, fileResults, actionResults };
  }, [results]);

  // Flat list for keyboard navigation
  const flatResults = useMemo(() => {
    return [...grouped.projectResults, ...grouped.taskResults, ...grouped.fileResults, ...grouped.actionResults];
  }, [grouped]);

  // Default content when no query
  const defaultContent = useMemo(() => {
    const allProjects = Object.values(projects);
    const activeProjects = allProjects
      .filter(p => !p.archived && p.status.label !== "Completed" && p.status.label !== "Draft")
      .slice(0, 4);

    const defaultItems: SearchResult[] = [];

    // Recent result items
    recentResults.forEach(recent => {
      const project = projects[recent.id];
      if (project) {
        defaultItems.push({
          id: `recent-${project.id}`,
          type: "project",
          title: project.name,
          subtitle: project.archived ? "Archived" : `${project.category} · ${project.status.label}`,
          icon: <ProjectLogo size={18} category={project.category} />,
          category: project.category,
          status: project.status,
          projectId: project.id,
          action: () => {
            onClose();
            if (project.archived) {
              onNavigate(`archive-project:${project.id}`);
            } else {
              onNavigate(`project:${project.id}`);
            }
          }
        });
      }
    });

    // If no recents, show active projects
    if (defaultItems.length === 0) {
      activeProjects.forEach(project => {
        defaultItems.push({
          id: `default-${project.id}`,
          type: "project",
          title: project.name,
          subtitle: `${project.category} · ${project.status.label}`,
          icon: <ProjectLogo size={18} category={project.category} />,
          category: project.category,
          status: project.status,
          projectId: project.id,
          action: () => {
            onClose();
            onNavigate(`project:${project.id}`);
          }
        });
      });
    }

    return defaultItems;
  }, [projects, recentResults, onClose, onNavigate]);

  // Suggestions: incomplete tasks, draft projects, projects not already in recents
  const suggestions = useMemo(() => {
    const recentIds = new Set(recentResults.map(r => r.id));
    const defaultIds = new Set(defaultContent.map(d => d.projectId));
    const items: SearchResult[] = [];

    const allProjects = Object.values(projects);

    // 1. Incomplete tasks due soon (up to 3)
    allProjects.forEach(project => {
      if (project.archived || project.status.label === "Completed") return;
      (project.tasks || []).forEach(task => {
        if (!task.completed && items.filter(i => i.type === "task").length < 3) {
          items.push({
            id: `suggest-task-${project.id}-${task.id}`,
            type: "task",
            title: task.title,
            subtitle: `${task.dueDate} · in ${project.name}`,
            icon: <ListChecks size={15} />,
            projectId: project.id,
            taskCompleted: false,
            action: () => {
              onClose();
              onNavigate(`project:${project.id}`);
              if (onHighlightNavigate) {
                onHighlightNavigate(project.id, { type: "task", taskId: task.id });
              }
            }
          });
        }
      });
    });

    // 2. Draft projects that need attention (up to 2)
    allProjects
      .filter(p => !p.archived && p.status.label === "Draft" && !recentIds.has(p.id) && !defaultIds.has(p.id))
      .slice(0, 2)
      .forEach(project => {
        items.push({
          id: `suggest-draft-${project.id}`,
          type: "project",
          title: project.name,
          subtitle: `Draft · ${project.category}`,
          icon: <ProjectLogo size={18} category={project.category} />,
          category: project.category,
          status: project.status,
          projectId: project.id,
          action: () => { onClose(); onNavigate(`project:${project.id}`); }
        });
      });

    // 3. Other active projects not already shown (up to 2)
    allProjects
      .filter(p => !p.archived && p.status.label !== "Completed" && p.status.label !== "Draft" && !recentIds.has(p.id) && !defaultIds.has(p.id))
      .slice(0, 2)
      .forEach(project => {
        items.push({
          id: `suggest-project-${project.id}`,
          type: "project",
          title: project.name,
          subtitle: `${project.category} · ${project.status.label}`,
          icon: <ProjectLogo size={18} category={project.category} />,
          category: project.category,
          status: project.status,
          projectId: project.id,
          action: () => { onClose(); onNavigate(`project:${project.id}`); }
        });
      });

    return items;
  }, [projects, recentResults, defaultContent, onClose, onNavigate, onHighlightNavigate]);

  const flatDefault = useMemo(() => [...defaultContent], [defaultContent]);
  // Combined default list for keyboard navigation: recent/projects + suggestions
  const combinedDefaultList = useMemo(() => [...flatDefault, ...suggestions], [flatDefault, suggestions]);
  const currentList = query.trim() ? flatResults : combinedDefaultList;

  // Clamp active index
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const totalQuickActions = query.trim() ? 0 : QUICK_ACTIONS.length;
    const total = currentList.length + totalQuickActions;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % Math.max(total, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + Math.max(total, 1)) % Math.max(total, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex < currentList.length) {
        const item = currentList[activeIndex];
        if (item.projectId) {
          trackRecent(item.projectId, item.title, item.type);
        }
        if (query.trim()) trackRecentSearch(query.trim());
        item.action();
      } else {
        const actionIdx = activeIndex - currentList.length;
        if (!query.trim() && actionIdx >= 0 && actionIdx < QUICK_ACTIONS.length) {
          const act = QUICK_ACTIONS[actionIdx];
          actionHandlers[act.id]();
        }
      }
    }
  }, [activeIndex, currentList, query, actionHandlers]);

  const trackRecent = (id: string, title: string, type: string) => {
    setRecentResults(prev => {
      const filtered = prev.filter(r => r.id !== id);
      return [{ id, title, type }, ...filtered].slice(0, MAX_RECENT);
    });
  };

  const trackRecentSearch = (q: string) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== q.toLowerCase());
      return [q, ...filtered].slice(0, MAX_RECENT);
    });
  };

  // Scroll active item into view
  useEffect(() => {
    if (resultsRef.current) {
      const activeEl = resultsRef.current.querySelector(`[data-index="${activeIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [activeIndex]);

  const handleItemClick = (item: SearchResult) => {
    if (item.projectId) {
      trackRecent(item.projectId, item.title, item.type);
    }
    if (query.trim()) trackRecentSearch(query.trim());
    item.action();
  };

  if (!isOpen) return null;

  const hasQuery = query.trim().length > 0;
  const hasResults = flatResults.length > 0;

  // Compute index offsets for each section
  const projectOffset = 0;
  const taskOffset = grouped.projectResults.length;
  const fileOffset = taskOffset + grouped.taskResults.length;
  const actionOffset = fileOffset + grouped.fileResults.length;

  const renderResultItem = (item: SearchResult, index: number) => {
    const isActive = activeIndex === index;
    return (
      <div
        key={item.id}
        data-index={index}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-100 group mx-1 ${
          isActive ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"
        }`}
        onClick={() => handleItemClick(item)}
        onMouseEnter={() => setActiveIndex(index)}
      >
        {/* Icon */}
        <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
          item.type === "project" ? "bg-white/[0.06]" : 
          item.type === "task" ? "bg-white/[0.04]" :
          item.type === "file" ? "bg-white/[0.04]" :
          "bg-[#58AFFF]/10"
        }`}>
          {item.type === "action" ? (
            <span className="text-[#58AFFF]">{item.icon}</span>
          ) : item.type === "task" ? (
            <span className={item.taskCompleted ? "text-emerald-400/70" : "text-white/40"}>{item.icon}</span>
          ) : item.type === "file" ? (
            <span className="text-white/40">{item.icon}</span>
          ) : (
            <span className="text-white/60">{item.icon}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col min-w-0 flex-1">
          <span className={`text-[13px] truncate transition-colors ${
            isActive ? "text-[#E8E8E8]" : "text-[#E8E8E8]/80"
          }`}>
            {hasQuery ? highlightMatch(item.title, query) : item.title}
          </span>
          <span className="text-[11px] text-white/30 truncate flex items-center gap-1.5">
            {item.type === "task" && item.taskCompleted !== undefined && (
              <span className={`inline-block size-1.5 rounded-full shrink-0 ${item.taskCompleted ? "bg-emerald-400" : "bg-white/20"}`} />
            )}
            {item.subtitle}
          </span>
        </div>

        {/* Status badge for projects */}
        {item.type === "project" && item.status && (
          <div 
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] shrink-0"
            style={{ backgroundColor: item.status.bgColor, color: item.status.color }}
          >
            <span className="size-1.5 rounded-full" style={{ backgroundColor: item.status.dotColor }} />
            {item.status.label}
          </div>
        )}

        {/* File type badge */}
        {item.type === "file" && item.fileType && (
          <span
            className="text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0 uppercase tracking-wide"
            style={{
              color: FILE_TYPE_COLORS[item.fileType] || FILE_TYPE_COLORS.FILE,
              backgroundColor: `${FILE_TYPE_COLORS[item.fileType] || FILE_TYPE_COLORS.FILE}15`,
            }}
          >
            {item.fileType}
          </span>
        )}

        {/* Arrow indicator on active */}
        <div className={`transition-all duration-100 shrink-0 ${isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1"}`}>
          <ArrowRight size={13} className="text-white/30" />
        </div>
      </div>
    );
  };

  const renderQuickAction = (act: typeof QUICK_ACTIONS[0], globalIndex: number) => {
    const isActive = activeIndex === globalIndex;
    return (
      <div
        key={act.id}
        data-index={globalIndex}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-100 mx-1 ${
          isActive ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"
        }`}
        onClick={() => actionHandlers[act.id]()}
        onMouseEnter={() => setActiveIndex(globalIndex)}
      >
        <div className="size-8 rounded-lg flex items-center justify-center shrink-0 bg-[#58AFFF]/10">
          <span className="text-[#58AFFF]">{act.icon}</span>
        </div>
        <span className={`text-[13px] flex-1 transition-colors ${isActive ? "text-[#E8E8E8]" : "text-[#E8E8E8]/70"}`}>
          {act.label}
        </span>
        <div className={`transition-all duration-100 shrink-0 ${isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1"}`}>
          <ArrowRight size={13} className="text-white/30" />
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[min(20vh,180px)] bg-black/60 backdrop-blur-sm" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-[560px] bg-[#1C1D1E] border border-white/[0.06] rounded-2xl shadow-[0_24px_80px_-12px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col max-h-[min(70vh,520px)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 h-[52px] shrink-0 border-b border-white/[0.06]">
              <Search size={17} className="text-white/30 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search projects, tasks, files, or actions..."
                className="flex-1 bg-transparent border-none text-[14px] text-[#E8E8E8] placeholder:text-white/25 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                  className="p-1 hover:bg-white/10 rounded-md transition-colors"
                >
                  <X size={14} className="text-white/30" />
                </button>
              )}
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-white/25 bg-white/[0.04] rounded border border-white/[0.06] shrink-0 select-none">ESC</kbd>
            </div>

            {/* Results */}
            <div ref={resultsRef} className="flex-1 overflow-y-auto overflow-x-hidden py-1.5 scrollbar-hide">
              {hasQuery ? (
                hasResults ? (
                  <>
                    {grouped.projectResults.length > 0 && (
                      <div className="mb-1">
                        <SectionLabel label="Projects" count={grouped.projectResults.length} />
                        {grouped.projectResults.map((item, i) => renderResultItem(item, projectOffset + i))}
                      </div>
                    )}
                    {grouped.taskResults.length > 0 && (
                      <div className="mb-1">
                        <SectionLabel label="Tasks" count={grouped.taskResults.length} />
                        {grouped.taskResults.map((item, i) => renderResultItem(item, taskOffset + i))}
                      </div>
                    )}
                    {grouped.fileResults.length > 0 && (
                      <div className="mb-1">
                        <SectionLabel label="Files" count={grouped.fileResults.length} />
                        {grouped.fileResults.map((item, i) => renderResultItem(item, fileOffset + i))}
                      </div>
                    )}
                    {grouped.actionResults.length > 0 && (
                      <div className="mb-1">
                        <SectionLabel label="Quick Actions" />
                        {grouped.actionResults.map((item, i) => renderResultItem(item, actionOffset + i))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-6">
                    <div className="size-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
                      <Search size={18} className="text-white/20" />
                    </div>
                    <p className="text-[13px] text-white/40 mb-1">No results for &ldquo;{query}&rdquo;</p>
                    <p className="text-[11px] text-white/20">Try a project name, task, file, or category</p>
                  </div>
                )
              ) : (
                <>
                  {/* Recent searches pills */}
                  {recentSearches.length > 0 && (
                    <div className="px-4 pt-1 pb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Clock size={11} className="text-white/20 shrink-0" />
                        {recentSearches.map((s, i) => (
                          <button
                            key={i}
                            className="text-[11px] text-white/35 hover:text-white/60 bg-white/[0.04] hover:bg-white/[0.07] px-2 py-0.5 rounded-md transition-colors"
                            onClick={() => setQuery(s)}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Default project list */}
                  <div className="mb-1">
                    <SectionLabel label={recentResults.length > 0 ? "Recent" : "Projects"} />
                    {flatDefault.map((item, i) => renderResultItem(item, i))}
                  </div>

                  {/* Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="mb-1">
                      <SectionLabel label="Suggestions" />
                      {suggestions.map((item, i) => renderResultItem(item, flatDefault.length + i))}
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="mb-1">
                    <SectionLabel label="Quick Actions" />
                    {QUICK_ACTIONS.map((act, i) => renderQuickAction(act, combinedDefaultList.length + i))}
                  </div>
                </>
              )}
            </div>

            {/* Footer hint bar */}
            <div className="flex items-center gap-4 px-4 h-[36px] shrink-0 border-t border-white/[0.04] bg-white/[0.015]">
              <div className="flex items-center gap-1.5 text-[10px] text-white/20">
                <span className="flex items-center gap-0.5">
                  <kbd className="inline-flex items-center justify-center size-4 rounded bg-white/[0.06] border border-white/[0.06]"><ChevronUp size={9} /></kbd>
                  <kbd className="inline-flex items-center justify-center size-4 rounded bg-white/[0.06] border border-white/[0.06]"><ChevronDown size={9} /></kbd>
                </span>
                navigate
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-white/20">
                <kbd className="inline-flex items-center justify-center h-4 px-1 rounded bg-white/[0.06] border border-white/[0.06]"><CornerDownLeft size={9} /></kbd>
                open
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-white/20">
                <kbd className="px-1 h-4 inline-flex items-center rounded bg-white/[0.06] border border-white/[0.06] text-[9px]">esc</kbd>
                close
              </div>
              {hasQuery && hasResults && (
                <span className="ml-auto text-[10px] text-white/15 tabular-nums">{flatResults.length} result{flatResults.length !== 1 ? "s" : ""}</span>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// -- Helper components --

function SectionLabel({ label, count }: { label: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 px-4 pt-2 pb-1">
      <span className="text-[10px] font-medium uppercase tracking-wider text-white/20">{label}</span>
      {typeof count === "number" && (
        <span className="text-[9px] text-white/15 tabular-nums">{count}</span>
      )}
    </div>
  );
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const q = query.trim().toLowerCase();
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return text;

  return (
    <>
      {text.slice(0, idx)}
      <span className="text-[#58AFFF] bg-[#58AFFF]/10 rounded-sm px-0.5 -mx-0.5">{text.slice(idx, idx + q.length)}</span>
      {text.slice(idx + q.length)}
    </>
  );
}
