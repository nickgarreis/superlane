import React, {
  startTransition,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { Search, ArrowRight, ListChecks, Plus, Settings, Palette, Archive, CornerDownLeft, ChevronUp, ChevronDown, Clock, X, FileText, Paperclip } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProjectData, ProjectFileData } from "../types";
import { ProjectLogo } from "./ProjectLogo";
import type { AppView } from "../lib/routing";
import { formatFileDisplayDate, formatTaskDueDate } from "../lib/dates";

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

interface SearchIndexedProject {
  project: ProjectData;
  searchable: string;
}

interface SearchIndexedTask {
  projectId: string;
  projectName: string;
  taskId: string;
  title: string;
  assigneeName: string;
  dueDateLabel: string;
  completed: boolean;
  searchable: string;
}

interface SearchIndexedFile {
  key: string;
  name: string;
  type: string;
  tab: string;
  projectId: string | null;
  dateLabel: string;
  searchable: string;
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
  const deferredQuery = useDeferredValue(query);
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [recentResults, setRecentResults] = useState<Array<{ id: string; title: string; type: string }>>([]);

  const handleQueryChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    startTransition(() => {
      setQuery(nextValue);
    });
  }, []);

  // Focus input on open
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setQuery("");
    setActiveIndex(0);
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Build action handlers
  const actionHandlers: Record<string, () => void> = useMemo(() => ({
    "action-create": () => { onClose(); onOpenCreateProject(); },
    "action-tasks": () => { onClose(); onNavigate("tasks"); },
    "action-assets": () => { onClose(); onOpenSettings("Company"); },
    "action-archive": () => { onClose(); onNavigate("archive"); },
    "action-settings": () => { onClose(); onOpenSettings(); },
  }), [onClose, onNavigate, onOpenCreateProject, onOpenSettings]);

  const projectsList = useMemo(() => Object.values(projects), [projects]);
  const normalizedDeferredQuery = useMemo(
    () => deferredQuery.toLowerCase().trim(),
    [deferredQuery],
  );
  const trimmedQuery = useMemo(() => query.trim(), [query]);

  const firstActiveProjectId = useMemo(() => {
    const active = projectsList.find((project) => !project.archived && project.status.label !== "Draft");
    return active?.id || projectsList[0]?.id;
  }, [projectsList]);

  const searchIndex = useMemo(() => {
    const projectIndex: SearchIndexedProject[] = [];
    const taskIndex: SearchIndexedTask[] = [];

    for (const project of projectsList) {
      const projectSearchable = [
        project.name,
        project.description,
        project.category,
        project.status.label,
        project.scope ?? "",
      ].join(" ").toLowerCase();

      projectIndex.push({
        project,
        searchable: projectSearchable,
      });

      for (const task of project.tasks ?? []) {
        const dueDateLabel = formatTaskDueDate(task.dueDateEpochMs);
        const assigneeName = task.assignee?.name?.trim() || "Unassigned";
        taskIndex.push({
          projectId: project.id,
          projectName: project.name,
          taskId: task.id,
          title: task.title,
          assigneeName,
          dueDateLabel,
          completed: task.completed,
          searchable: `${task.title} ${assigneeName} ${dueDateLabel}`.toLowerCase(),
        });
      }
    }

    const fileIndex: SearchIndexedFile[] = [];
    const seen = new Set<string>();
    for (const file of files) {
      const normalizedProjectId = file.projectPublicId ?? "no-project";
      const key = `${normalizedProjectId}-${file.tab}-${file.name}-${String(file.id)}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      fileIndex.push({
        key,
        name: file.name,
        type: file.type,
        tab: file.tab,
        projectId: file.projectPublicId ?? null,
        dateLabel: formatFileDisplayDate(file.displayDateEpochMs),
        searchable: `${file.name} ${file.type}`.toLowerCase(),
      });
    }

    return {
      projectIndex,
      taskIndex,
      fileIndex,
    };
  }, [files, projectsList]);

  // Search logic
  const results = useMemo(() => {
    const items: SearchResult[] = [];

    if (!normalizedDeferredQuery) return items;

    for (const projectEntry of searchIndex.projectIndex) {
      const { project, searchable } = projectEntry;
      if (searchable.includes(normalizedDeferredQuery)) {
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
    }

    for (const taskEntry of searchIndex.taskIndex) {
      if (!taskEntry.searchable.includes(normalizedDeferredQuery)) {
        continue;
      }
      items.push({
        id: `task-${taskEntry.projectId}-${taskEntry.taskId}`,
        type: "task",
        title: taskEntry.title,
        subtitle: `${taskEntry.assigneeName} · ${taskEntry.dueDateLabel} · in ${taskEntry.projectName}`,
        icon: <ListChecks size={15} />,
        projectId: taskEntry.projectId,
        taskCompleted: taskEntry.completed,
        action: () => {
          onClose();
          onNavigate(`project:${taskEntry.projectId}`);
          if (onHighlightNavigate) {
            onHighlightNavigate(taskEntry.projectId, { type: "task", taskId: taskEntry.taskId });
          }
        }
      });
    }

    for (const fileEntry of searchIndex.fileIndex) {
      if (!fileEntry.searchable.includes(normalizedDeferredQuery)) {
        continue;
      }
      const targetProject = fileEntry.projectId || firstActiveProjectId;
      items.push({
        id: `file-${fileEntry.key}`,
        type: "file",
        title: fileEntry.name,
        subtitle: fileEntry.projectId
          ? `${fileEntry.tab} · in ${projects[fileEntry.projectId]?.name || "project"}`
          : `${fileEntry.tab} · ${fileEntry.dateLabel}`,
        icon: fileEntry.tab === "Attachments" ? <Paperclip size={14} /> : <FileText size={14} />,
        fileType: fileEntry.type,
        fileTab: fileEntry.tab,
        projectId: targetProject,
        action: () => {
          onClose();
          if (targetProject) {
            onNavigate(`project:${targetProject}`);
            if (onHighlightNavigate) {
              onHighlightNavigate(targetProject, { type: "file", fileName: fileEntry.name, fileTab: fileEntry.tab });
            }
          }
        }
      });
    }

    QUICK_ACTIONS.forEach((act) => {
      if (
        act.label.toLowerCase().includes(normalizedDeferredQuery)
        || act.keyword.toLowerCase().includes(normalizedDeferredQuery)
      ) {
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
  }, [
    actionHandlers,
    firstActiveProjectId,
    normalizedDeferredQuery,
    onClose,
    onHighlightNavigate,
    onNavigate,
    projects,
    searchIndex,
  ]);

  // Group results by type
  const grouped = useMemo(() => {
    return results.reduce<{
      projectResults: SearchResult[];
      taskResults: SearchResult[];
      fileResults: SearchResult[];
      actionResults: SearchResult[];
    }>((acc, result) => {
      if (result.type === "project") {
        acc.projectResults.push(result);
      } else if (result.type === "task") {
        acc.taskResults.push(result);
      } else if (result.type === "file") {
        acc.fileResults.push(result);
      } else {
        acc.actionResults.push(result);
      }
      return acc;
    }, {
      projectResults: [],
      taskResults: [],
      fileResults: [],
      actionResults: [],
    });
  }, [results]);

  // Flat list for keyboard navigation
  const flatResults = useMemo(() => {
    return [...grouped.projectResults, ...grouped.taskResults, ...grouped.fileResults, ...grouped.actionResults];
  }, [grouped]);

  // Default content when no query
  const defaultContent = useMemo(() => {
    const activeProjects = projectsList
      .filter((project) => !project.archived && project.status.label !== "Completed" && project.status.label !== "Draft")
      .slice(0, 4);

    const defaultItems: SearchResult[] = [];

    // Recent result items
    recentResults.forEach((recent) => {
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
      activeProjects.forEach((project) => {
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
  }, [onClose, onNavigate, projects, projectsList, recentResults]);

  // Suggestions: incomplete tasks, draft projects, projects not already in recents
  const suggestions = useMemo(() => {
    const recentIds = new Set(recentResults.map((recent) => recent.id));
    const defaultIds = new Set(defaultContent.map((item) => item.projectId).filter(Boolean));
    const items: SearchResult[] = [];
    let taskSuggestionCount = 0;

    for (const project of projectsList) {
      if (project.archived || project.status.label === "Completed") {
        continue;
      }
      for (const task of project.tasks || []) {
        if (task.completed || taskSuggestionCount >= 3) {
          continue;
        }
        taskSuggestionCount += 1;
        items.push({
          id: `suggest-task-${project.id}-${task.id}`,
          type: "task",
          title: task.title,
          subtitle: `${formatTaskDueDate(task.dueDateEpochMs)} · in ${project.name}`,
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
    }

    // 2. Draft projects that need attention (up to 2)
    projectsList
      .filter((project) => !project.archived && project.status.label === "Draft" && !recentIds.has(project.id) && !defaultIds.has(project.id))
      .slice(0, 2)
      .forEach((project) => {
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
    projectsList
      .filter((project) =>
        !project.archived
        && project.status.label !== "Completed"
        && project.status.label !== "Draft"
        && !recentIds.has(project.id)
        && !defaultIds.has(project.id))
      .slice(0, 2)
      .forEach((project) => {
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
  }, [defaultContent, onClose, onHighlightNavigate, onNavigate, projectsList, recentResults]);

  const flatDefault = useMemo(() => [...defaultContent], [defaultContent]);
  // Combined default list for keyboard navigation: recent/projects + suggestions
  const combinedDefaultList = useMemo(() => [...flatDefault, ...suggestions], [flatDefault, suggestions]);
  const hasSearchQuery = trimmedQuery.length > 0;
  const currentList = hasSearchQuery ? flatResults : combinedDefaultList;

  // Clamp active index
  useEffect(() => {
    setActiveIndex(0);
  }, [trimmedQuery]);

  const trackRecent = useCallback((id: string, title: string, type: string) => {
    setRecentResults((prev) => {
      const filtered = prev.filter((entry) => entry.id !== id);
      return [{ id, title, type }, ...filtered].slice(0, MAX_RECENT);
    });
  }, []);

  const trackRecentSearch = useCallback((value: string) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((entry) => entry.toLowerCase() !== value.toLowerCase());
      return [value, ...filtered].slice(0, MAX_RECENT);
    });
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const totalQuickActions = hasSearchQuery ? 0 : QUICK_ACTIONS.length;
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
        if (hasSearchQuery) trackRecentSearch(trimmedQuery);
        item.action();
      } else {
        const actionIdx = activeIndex - currentList.length;
        if (!hasSearchQuery && actionIdx >= 0 && actionIdx < QUICK_ACTIONS.length) {
          const act = QUICK_ACTIONS[actionIdx];
          actionHandlers[act.id]();
        }
      }
    }
  }, [
    actionHandlers,
    activeIndex,
    currentList,
    hasSearchQuery,
    trackRecent,
    trackRecentSearch,
    trimmedQuery,
  ]);

  // Scroll active item into view
  useEffect(() => {
    if (resultsRef.current) {
      const activeEl = resultsRef.current.querySelector(`[data-index="${activeIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [activeIndex]);

  const handleItemClick = useCallback((item: SearchResult) => {
    if (item.projectId) {
      trackRecent(item.projectId, item.title, item.type);
    }
    if (hasSearchQuery) trackRecentSearch(trimmedQuery);
    item.action();
  }, [hasSearchQuery, trackRecent, trackRecentSearch, trimmedQuery]);

  if (!isOpen) return null;

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
            {hasSearchQuery ? highlightMatch(item.title, query) : item.title}
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
                onChange={handleQueryChange}
                onKeyDown={handleKeyDown}
                placeholder="Search projects, tasks, files, or actions..."
                className="flex-1 bg-transparent border-none text-[14px] text-[#E8E8E8] placeholder:text-white/25 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => {
                    startTransition(() => {
                      setQuery("");
                    });
                    inputRef.current?.focus();
                  }}
                  className="p-1 hover:bg-white/10 rounded-md transition-colors"
                >
                  <X size={14} className="text-white/30" />
                </button>
              )}
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-white/25 bg-white/[0.04] rounded border border-white/[0.06] shrink-0 select-none">ESC</kbd>
            </div>

            {/* Results */}
            <div ref={resultsRef} className="flex-1 overflow-y-auto overflow-x-hidden py-1.5 scrollbar-hide">
              {hasSearchQuery ? (
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
                            onClick={() => {
                              startTransition(() => {
                                setQuery(s);
                              });
                            }}
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
              {hasSearchQuery && hasResults && (
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
