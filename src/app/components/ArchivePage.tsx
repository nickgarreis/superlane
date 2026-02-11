import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Archive, ArchiveRestore, Trash2, Search } from "lucide-react";
import HorizontalBorder from "../../imports/HorizontalBorder";
import { cn } from "../../lib/utils";
import { ProjectData, WorkspaceRole } from "../types";
import { ProjectLogo } from "./ProjectLogo";
import { motion, AnimatePresence } from "motion/react";
import { safeScrollIntoView } from "../lib/dom";
import { DeniedAction } from "./permissions/DeniedAction";
import { getProjectLifecycleDeniedReason } from "../lib/permissionRules";
import {
  DASHBOARD_SEARCH_BORDER_CLASS,
  DASHBOARD_SEARCH_CONTAINER_CLASS,
  DASHBOARD_SEARCH_CONTENT_CLASS,
  DASHBOARD_SEARCH_INPUT_CLASS,
} from "./ui/dashboardChrome";
export function ArchivePage({
  onToggleSidebar,
  isSidebarOpen,
  projects,
  viewerRole,
  onNavigateToProject,
  onUnarchiveProject,
  onDeleteProject,
  highlightedProjectId,
  setHighlightedProjectId,
}: {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  projects: Record<string, ProjectData>;
  viewerRole?: WorkspaceRole | null;
  onNavigateToProject: (id: string) => void;
  onUnarchiveProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  highlightedProjectId?: string | null;
  setHighlightedProjectId?: (id: string | null) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const projectLifecycleDeniedReason =
    getProjectLifecycleDeniedReason(viewerRole);
  const canManageProjectLifecycle = projectLifecycleDeniedReason == null;

  useEffect(() => {
    if (!highlightedProjectId) return;
    const timeout = setTimeout(() => {
      const el = rowRefs.current[highlightedProjectId];
      if (el) {
        safeScrollIntoView(el, { behavior: "smooth", block: "center" });
        el.classList.remove("archive-row-flash");
        void el.offsetWidth;
        el.classList.add("archive-row-flash");
      }
    }, 100);
    const clearTimer = setTimeout(() => {
      setHighlightedProjectId?.(null);
    }, 1800);
    return () => {
      clearTimeout(timeout);
      clearTimeout(clearTimer);
    };
  }, [highlightedProjectId, setHighlightedProjectId]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const archivedProjects = useMemo(
    () =>
      Object.values(projects)
        .filter((project) => project.archived)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [projects],
  );
  const filteredProjects = useMemo(
    () =>
      archivedProjects.filter(
        (project) =>
          project.name.toLowerCase().includes(normalizedQuery) ||
          project.category.toLowerCase().includes(normalizedQuery),
      ),
    [archivedProjects, normalizedQuery],
  );
  const formatDate = useCallback((dateValue?: number | null) => {
    if (typeof dateValue !== "number" || !Number.isFinite(dateValue)) {
      return "—";
    }
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) {
      return "—";
    }
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return "Today";
    }
    if (diffDays === 1) {
      return "1 day ago";
    }
    return `${diffDays} days ago`;
  }, []);

  return (
    <div className="flex-1 h-full bg-bg-base txt-tone-primary overflow-hidden font-app flex flex-col relative">
      <div className="relative bg-bg-surface rounded-none flex-1 overflow-hidden flex flex-col transition-all duration-500 ease-in-out">
        {/* Top Border / Header */}
        <div className="w-full h-[57px] shrink-0">
          <HorizontalBorder onToggleSidebar={onToggleSidebar} />
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-[80px] py-[40px]">
          {/* Header Section */}
          <div className="flex gap-6 mb-10 items-center">
            <div className="flex-1">
              <h1 className="txt-role-page-title txt-tone-primary tracking-tight">
                Archive
              </h1>
              <p className="txt-role-body-md text-white/40 mt-1">
                Archived projects will be automatically deleted after 30 days
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center justify-between mb-6 z-10 relative">
            <div className={DASHBOARD_SEARCH_CONTAINER_CLASS}>
              <div className={DASHBOARD_SEARCH_BORDER_CLASS} />
              <div className={DASHBOARD_SEARCH_CONTENT_CLASS}>
                <Search size={16} className="shrink-0 mr-2 opacity-40" />
                <input
                  type="text"
                  placeholder="Search archived projects"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={DASHBOARD_SEARCH_INPUT_CLASS}
                />
              </div>
            </div>
          </div>

          {/* Project Table */}
          {filteredProjects.length > 0 ? (
            <div className="flex flex-col">
              {/* Table Header */}
              <div className="flex items-center px-4 py-2 txt-role-meta uppercase tracking-wider text-white/30">
                <div className="flex-1 min-w-0">Project</div>
                <div className="w-[140px] shrink-0">Category</div>
                <div className="w-[140px] shrink-0">Archived on</div>
                <div className="w-[120px] shrink-0 text-right">Actions</div>
              </div>

              {/* Table Rows */}
              <AnimatePresence initial={false}>
                {filteredProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    ref={(el) => {
                      rowRefs.current[project.id] = el;
                    }}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center px-4 py-3 hover:bg-white/[0.02] transition-colors group cursor-pointer"
                    onClick={() => onNavigateToProject(project.id)}
                  >
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <div className="opacity-60">
                        <ProjectLogo size={28} category={project.category} />
                      </div>
                      <span className="txt-role-body-lg txt-tone-primary truncate">
                        {project.name}
                      </span>
                    </div>
                    <div className="w-[140px] shrink-0 txt-role-body-md text-white/50">
                      {project.category}
                    </div>
                    <div className="w-[140px] shrink-0 txt-role-body-md text-white/40">
                      {formatDate(project.archivedAt)}
                    </div>
                    <div className="w-[120px] shrink-0 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DeniedAction
                        denied={!canManageProjectLifecycle}
                        reason={projectLifecycleDeniedReason}
                        tooltipAlign="right"
                      >
                        <button
                          className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            canManageProjectLifecycle
                              ? "hover:bg-white/10 cursor-pointer"
                              : "cursor-not-allowed opacity-55",
                          )}
                          title="Unarchive"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!canManageProjectLifecycle) {
                              return;
                            }
                            onUnarchiveProject(project.id);
                          }}
                        >
                          <ArchiveRestore
                            size={15}
                            className={cn(
                              canManageProjectLifecycle
                                ? "text-white/50 hover:text-white"
                                : "text-white/30",
                            )}
                          />
                        </button>
                      </DeniedAction>
                      <DeniedAction
                        denied={!canManageProjectLifecycle}
                        reason={projectLifecycleDeniedReason}
                        tooltipAlign="right"
                      >
                        <button
                          className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            canManageProjectLifecycle
                              ? "hover:bg-red-500/10 cursor-pointer"
                              : "cursor-not-allowed opacity-55",
                          )}
                          title="Delete permanently"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!canManageProjectLifecycle) {
                              return;
                            }
                            if (
                              window.confirm(
                                "Are you sure you want to permanently delete this project?",
                              )
                            ) {
                              onDeleteProject(project.id);
                            }
                          }}
                        >
                          <Trash2
                            size={15}
                            className={cn(
                              canManageProjectLifecycle
                                ? "text-white/50 hover:text-red-400"
                                : "text-white/30",
                            )}
                          />
                        </button>
                      </DeniedAction>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-white/20">
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Archive size={24} className="opacity-40" />
              </div>
              <p className="txt-role-body-lg font-medium">
                {searchQuery
                  ? "No matching archived projects"
                  : "No archived projects"}
              </p>
              <p className="txt-role-body-sm text-white/15 mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : "Projects you archive will appear here"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
