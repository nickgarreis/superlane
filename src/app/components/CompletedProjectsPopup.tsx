import React, { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  X,
  Search,
  Undo2,
  CheckCircle2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { ProjectData, WorkspaceRole } from "../types";
import { ProjectLogo } from "./ProjectLogo";
import { motion, AnimatePresence } from "motion/react";
import { DeniedAction } from "./permissions/DeniedAction";
import { getProjectLifecycleDeniedReason } from "../lib/permissionRules";
import { Z_LAYERS } from "../lib/zLayers";
import {
  POPUP_CLOSE_BUTTON_CLASS,
  POPUP_OVERLAY_CENTER_CLASS,
  POPUP_SHELL_BORDER_CLASS,
  POPUP_SHELL_CLASS,
  POPUP_SHELL_MOBILE_CLASS,
} from "./popup/popupChrome";
import {
  DASHBOARD_SEARCH_BORDER_CLASS,
  DASHBOARD_SEARCH_CONTAINER_CLASS,
  DASHBOARD_SEARCH_CONTENT_CLASS,
  DASHBOARD_SEARCH_INPUT_CLASS,
} from "./ui/dashboardChrome";
type SortField = "name" | "category" | "completedAt";
type SortDir = "asc" | "desc";
export function CompletedProjectsPopup({
  isMobile = false,
  isOpen,
  onClose,
  projects,
  viewerRole,
  completedProjectDetailId,
  onOpenProjectDetail,
  onBackToCompletedProjects,
  onUncompleteProject,
  renderDetail,
}: {
  isMobile?: boolean;
  isOpen: boolean;
  onClose: () => void;
  projects: Record<string, ProjectData>;
  viewerRole?: WorkspaceRole | null;
  completedProjectDetailId: string | null;
  onOpenProjectDetail: (id: string) => void;
  onBackToCompletedProjects: () => void;
  onUncompleteProject: (id: string) => void;
  renderDetail: (project: ProjectData) => ReactNode;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("completedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const projectLifecycleDeniedReason =
    getProjectLifecycleDeniedReason(viewerRole);
  const canManageProjectLifecycle = projectLifecycleDeniedReason == null;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const completedProjects = useMemo(
    () =>
      Object.values(projects).filter(
        (project) => !project.archived && project.status.label === "Completed",
      ),
    [projects],
  );
  const filteredProjects = useMemo(
    () =>
      completedProjects
        .filter(
          (project) =>
            project.name.toLowerCase().includes(normalizedQuery) ||
            project.category.toLowerCase().includes(normalizedQuery),
        )
        .sort((a, b) => {
          let cmp = 0;
          if (sortField === "name") {
            cmp = a.name.localeCompare(b.name);
          } else if (sortField === "category") {
            cmp = a.category.localeCompare(b.category);
          } else {
            const dateA = typeof a.completedAt === "number" ? a.completedAt : 0;
            const dateB = typeof b.completedAt === "number" ? b.completedAt : 0;
            cmp = dateA - dateB;
          }
          return sortDir === "asc" ? cmp : -cmp;
        }),
    [completedProjects, normalizedQuery, sortDir, sortField],
  );
  const completedProjectDetail = useMemo(() => {
    if (!completedProjectDetailId) {
      return null;
    }
    const project = projects[completedProjectDetailId];
    if (!project || project.archived || project.status.label !== "Completed") {
      return null;
    }
    return project;
  }, [completedProjectDetailId, projects]);
  useEffect(() => {
    if (!isOpen || !completedProjectDetailId) {
      return;
    }
    if (!completedProjectDetail) {
      onBackToCompletedProjects();
    }
  }, [
    isOpen,
    completedProjectDetailId,
    completedProjectDetail,
    onBackToCompletedProjects,
  ]);
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "name" || field === "category" ? "asc" : "desc");
    }
  };
  const formatDate = (dateEpochMs?: number | null) => {
    if (typeof dateEpochMs !== "number" || !Number.isFinite(dateEpochMs)) {
      return "\u2014";
    }
    const d = new Date(dateEpochMs);
    if (isNaN(d.getTime())) {
      return "\u2014";
    }
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} className="text-white/20" />;
    }
    return sortDir === "asc" ? (
      <ArrowUp size={12} className="text-white/50" />
    ) : (
      <ArrowDown size={12} className="text-white/50" />
    );
  };
  if (!isOpen) return null;
  if (completedProjectDetail) {
    return <>{renderDetail(completedProjectDetail)}</>;
  }
  return (
    <div
      className={`${POPUP_OVERLAY_CENTER_CLASS} ${isMobile ? "p-0" : ""}`}
      style={{ zIndex: Z_LAYERS.modalPriority }}
      onClick={onClose}
    >
      <div
        data-testid="completed-projects-popup-shell"
        className={`${POPUP_SHELL_CLASS} ${isMobile ? POPUP_SHELL_MOBILE_CLASS : ""} ${isMobile ? "h-[100dvh] max-h-[100dvh]" : "max-w-[720px] max-h-[80vh]"} flex flex-col font-app`}
        onClick={(event) => event.stopPropagation()}
      >
        <div aria-hidden className={POPUP_SHELL_BORDER_CLASS} />
        {/* Header */}
        <div className={`shrink-0 flex items-center justify-between ${isMobile ? "px-4 pt-4 pb-1 safe-pt" : "px-8 pt-7 pb-1"}`}>
          <div>
            <h2 className="txt-role-panel-title txt-tone-primary tracking-tight">
              Completed Projects
            </h2>
            <p className="txt-role-body-md text-white/40 mt-1">
              {completedProjects.length} project
              {completedProjects.length !== 1 ? "s" : ""} completed
            </p>
          </div>
          <button
            onClick={onClose}
            className={`${POPUP_CLOSE_BUTTON_CLASS} size-8`}
          >
            <X size={16} className="txt-tone-subtle" />
          </button>
        </div>
        {/* Search Bar */}
        <div className={`${isMobile ? "px-4 pt-3 pb-3" : "px-8 pt-5 pb-4"} shrink-0`}>
          <div className={cn(DASHBOARD_SEARCH_CONTAINER_CLASS, "w-full")}>
            <div className={DASHBOARD_SEARCH_BORDER_CLASS} />
            <div className={DASHBOARD_SEARCH_CONTENT_CLASS}>
              <Search
                size={16}
                className="shrink-0 mr-2 opacity-40 txt-tone-primary"
              />
              <input
                type="text"
                placeholder="Search completed projects"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={DASHBOARD_SEARCH_INPUT_CLASS}
                autoFocus
              />
            </div>
          </div>
        </div>
        {/* Table */}
        <div className={`${isMobile ? "px-4 pb-4" : "px-8 pb-6"} flex-1 overflow-y-auto min-h-0`}>
          {filteredProjects.length > 0 ? (
            isMobile ? (
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2 pb-1">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full border border-popup-border-soft px-3 py-1.5 txt-role-body-sm txt-tone-muted hover:bg-white/5"
                    onClick={() => handleSort("name")}
                  >
                    Project <SortIcon field="name" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full border border-popup-border-soft px-3 py-1.5 txt-role-body-sm txt-tone-muted hover:bg-white/5"
                    onClick={() => handleSort("category")}
                  >
                    Category <SortIcon field="category" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full border border-popup-border-soft px-3 py-1.5 txt-role-body-sm txt-tone-muted hover:bg-white/5"
                    onClick={() => handleSort("completedAt")}
                  >
                    Completed <SortIcon field="completedAt" />
                  </button>
                </div>
                <AnimatePresence initial={false}>
                  {filteredProjects.map((project) => (
                    <motion.div
                      key={project.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="w-full text-left rounded-2xl border border-popup-border-soft bg-popup-surface-soft px-4 py-3"
                      role="button"
                      tabIndex={0}
                      onClick={() => onOpenProjectDetail(project.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onOpenProjectDetail(project.id);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex items-center gap-3">
                          <ProjectLogo size={28} category={project.category} />
                          <span className="txt-role-body-lg txt-tone-primary truncate">
                            {project.name}
                          </span>
                        </div>
                        <DeniedAction
                          denied={!canManageProjectLifecycle}
                          reason={projectLifecycleDeniedReason}
                          tooltipAlign="right"
                        >
                          <button
                            type="button"
                            className={cn(
                              "shrink-0 p-1.5 rounded-lg transition-colors",
                              canManageProjectLifecycle
                                ? "hover:bg-white/10 cursor-pointer"
                                : "cursor-not-allowed opacity-55",
                            )}
                            title="Revert to Active"
                            onClick={(event) => {
                              event.stopPropagation();
                              if (!canManageProjectLifecycle) {
                                return;
                              }
                              onUncompleteProject(project.id);
                            }}
                          >
                            <Undo2
                              size={15}
                              className={
                                canManageProjectLifecycle
                                  ? "text-white/60"
                                  : "text-white/30"
                              }
                            />
                          </button>
                        </DeniedAction>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 txt-role-body-sm text-white/45">
                        <span className="inline-flex items-center rounded-full border border-popup-border-soft px-2 py-0.5">
                          {project.category}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <CheckCircle2
                            size={13}
                            className="txt-tone-success shrink-0"
                          />
                          {formatDate(project.completedAt)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col">
                {/* Table Header */}
                <div className="flex items-center px-4 py-2 txt-role-meta uppercase tracking-wider text-white/30">
                  <div
                    className="flex-1 min-w-0 flex items-center gap-1.5 cursor-pointer hover:text-white/50 transition-colors select-none"
                    onClick={() => handleSort("name")}
                  >
                    Project <SortIcon field="name" />
                  </div>
                  <div
                    className="w-[130px] shrink-0 flex items-center gap-1.5 cursor-pointer hover:text-white/50 transition-colors select-none"
                    onClick={() => handleSort("category")}
                  >
                    Category <SortIcon field="category" />
                  </div>
                  <div
                    className="w-[150px] shrink-0 flex items-center gap-1.5 cursor-pointer hover:text-white/50 transition-colors select-none"
                    onClick={() => handleSort("completedAt")}
                  >
                    Completed on <SortIcon field="completedAt" />
                  </div>
                  <div className="w-[90px] shrink-0 text-right">Actions</div>
                </div>
                {/* Table Rows */}
                <AnimatePresence initial={false}>
                  {filteredProjects.map((project) => (
                    <motion.div
                      key={project.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center px-4 py-3 hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        onOpenProjectDetail(project.id);
                      }}
                      onKeyDown={(event) => {
                        if (event.target !== event.currentTarget) {
                          return;
                        }
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          onOpenProjectDetail(project.id);
                        }
                      }}
                    >
                      <div className="flex-1 min-w-0 flex items-center gap-3">
                        <ProjectLogo size={28} category={project.category} />
                        <span className="txt-role-body-lg txt-tone-primary truncate">
                          {project.name}
                        </span>
                      </div>
                      <div className="w-[130px] shrink-0 txt-role-body-md text-white/50">
                        {project.category}
                      </div>
                      <div className="w-[150px] shrink-0 txt-role-body-md text-white/40 flex items-center gap-1.5">
                        <CheckCircle2
                          size={13}
                          className="txt-tone-success shrink-0"
                        />
                        {formatDate(project.completedAt)}
                      </div>
                      <div className="w-[90px] shrink-0 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
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
                            title="Revert to Active"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!canManageProjectLifecycle) {
                                return;
                              }
                              onUncompleteProject(project.id);
                            }}
                          >
                            <Undo2
                              size={15}
                              className={cn(
                                canManageProjectLifecycle
                                  ? "text-white/50 hover:text-white"
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
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-white/20">
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <CheckCircle2 size={24} className="opacity-40" />
              </div>
              <p className="txt-role-body-lg font-medium">
                {searchQuery
                  ? "No matching completed projects"
                  : "No completed projects"}
              </p>
              <p className="txt-role-body-sm text-white/15 mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : "Projects you complete will appear here"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
