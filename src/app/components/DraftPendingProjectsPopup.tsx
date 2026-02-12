import React, { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  X,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileClock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { Z_LAYERS } from "../lib/zLayers";
import type { ProjectData } from "../types";
import { ProjectLogo } from "./ProjectLogo";
import {
  POPUP_CLOSE_BUTTON_CLASS,
  POPUP_OVERLAY_CENTER_CLASS,
  POPUP_SHELL_BORDER_CLASS,
  POPUP_SHELL_CLASS,
} from "./popup/popupChrome";
import {
  DASHBOARD_SEARCH_BORDER_CLASS,
  DASHBOARD_SEARCH_CONTAINER_CLASS,
  DASHBOARD_SEARCH_CONTENT_CLASS,
  DASHBOARD_SEARCH_INPUT_CLASS,
} from "./ui/dashboardChrome";

type SortField = "name" | "category" | "status";
type SortDir = "asc" | "desc";
type DraftPendingRouteKind = "draft" | "pending";

type DraftPendingProjectsPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  projects: Record<string, ProjectData>;
  draftPendingProjectDetailId: string | null;
  draftPendingProjectDetailKind: DraftPendingRouteKind | null;
  onOpenProjectDetail: (
    projectId: string,
    status: "Draft" | "Review",
    options?: { replace?: boolean },
  ) => void;
  onBackToDraftPendingProjects: () => void;
  renderDetail: (project: ProjectData) => ReactNode;
};

const asDetailStatus = (project: ProjectData): "Draft" | "Review" =>
  project.status.label === "Review" ? "Review" : "Draft";

const asRouteKind = (status: "Draft" | "Review"): DraftPendingRouteKind =>
  status === "Draft" ? "draft" : "pending";

export function DraftPendingProjectsPopup({
  isOpen,
  onClose,
  projects,
  draftPendingProjectDetailId,
  draftPendingProjectDetailKind,
  onOpenProjectDetail,
  onBackToDraftPendingProjects,
  renderDetail,
}: DraftPendingProjectsPopupProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("status");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const draftPendingProjects = useMemo(
    () =>
      Object.values(projects).filter(
        (project) =>
          !project.archived &&
          (project.status.label === "Draft" || project.status.label === "Review"),
      ),
    [projects],
  );

  const filteredProjects = useMemo(
    () =>
      draftPendingProjects
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
            cmp = a.status.label.localeCompare(b.status.label);
          }
          return sortDir === "asc" ? cmp : -cmp;
        }),
    [draftPendingProjects, normalizedQuery, sortDir, sortField],
  );

  const draftPendingProjectDetail = useMemo(() => {
    if (!draftPendingProjectDetailId) {
      return null;
    }
    const project = projects[draftPendingProjectDetailId];
    if (
      !project ||
      project.archived ||
      (project.status.label !== "Draft" && project.status.label !== "Review")
    ) {
      return null;
    }
    return project;
  }, [draftPendingProjectDetailId, projects]);

  useEffect(() => {
    if (!isOpen || !draftPendingProjectDetailId) {
      return;
    }
    if (!draftPendingProjectDetail) {
      onBackToDraftPendingProjects();
      return;
    }
    const detailStatus = asDetailStatus(draftPendingProjectDetail);
    const expectedKind = asRouteKind(detailStatus);
    if (draftPendingProjectDetailKind && draftPendingProjectDetailKind !== expectedKind) {
      onOpenProjectDetail(draftPendingProjectDetail.id, detailStatus, {
        replace: true,
      });
    }
  }, [
    draftPendingProjectDetail,
    draftPendingProjectDetailId,
    draftPendingProjectDetailKind,
    isOpen,
    onBackToDraftPendingProjects,
    onOpenProjectDetail,
  ]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
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

  if (!isOpen) {
    return null;
  }

  if (draftPendingProjectDetail) {
    return <>{renderDetail(draftPendingProjectDetail)}</>;
  }

  return (
    <div
      className={POPUP_OVERLAY_CENTER_CLASS}
      style={{ zIndex: Z_LAYERS.modalPriority }}
      onClick={onClose}
    >
      <div
        className={`${POPUP_SHELL_CLASS} max-w-[720px] max-h-[80vh] flex flex-col font-app`}
        onClick={(event) => event.stopPropagation()}
      >
        <div aria-hidden className={POPUP_SHELL_BORDER_CLASS} />
        <div className="flex items-center justify-between px-8 pt-7 pb-1">
          <div>
            <h2 className="txt-role-panel-title txt-tone-primary tracking-tight">
              Drafts & Pending Projects
            </h2>
            <p className="txt-role-body-md text-white/40 mt-1">
              {draftPendingProjects.length} project
              {draftPendingProjects.length !== 1 ? "s" : ""} waiting
            </p>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className={`${POPUP_CLOSE_BUTTON_CLASS} size-8`}
          >
            <X size={16} className="txt-tone-subtle" />
          </button>
        </div>

        <div className="px-8 pt-5 pb-4">
          <div className={cn(DASHBOARD_SEARCH_CONTAINER_CLASS, "w-full")}>
            <div className={DASHBOARD_SEARCH_BORDER_CLASS} />
            <div className={DASHBOARD_SEARCH_CONTENT_CLASS}>
              <Search
                size={16}
                className="shrink-0 mr-2 opacity-40 txt-tone-primary"
              />
              <input
                type="text"
                placeholder="Search drafts and pending projects"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={DASHBOARD_SEARCH_INPUT_CLASS}
                autoFocus
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-6 min-h-0">
          {filteredProjects.length > 0 ? (
            <div className="flex flex-col">
              <div className="flex items-center px-4 py-2 txt-role-meta uppercase tracking-wider text-white/30">
                <button
                  type="button"
                  className="flex-1 min-w-0 flex items-center gap-1.5 cursor-pointer hover:text-white/50 transition-colors select-none text-left bg-transparent border-0 p-0"
                  onClick={() => handleSort("name")}
                >
                  Project <SortIcon field="name" />
                </button>
                <button
                  type="button"
                  className="w-[150px] shrink-0 flex items-center gap-1.5 cursor-pointer hover:text-white/50 transition-colors select-none text-left bg-transparent border-0 p-0"
                  onClick={() => handleSort("category")}
                >
                  Category <SortIcon field="category" />
                </button>
                <button
                  type="button"
                  className="w-[140px] shrink-0 flex items-center gap-1.5 cursor-pointer hover:text-white/50 transition-colors select-none text-left bg-transparent border-0 p-0"
                  onClick={() => handleSort("status")}
                >
                  Status <SortIcon field="status" />
                </button>
              </div>

              <AnimatePresence initial={false}>
                {filteredProjects.map((project) => {
                  const detailStatus = asDetailStatus(project);
                  return (
                    <motion.div
                      key={project.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center px-4 py-3 hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      onClick={() => onOpenProjectDetail(project.id, detailStatus)}
                    >
                      <div className="flex-1 min-w-0 flex items-center gap-3">
                        <ProjectLogo size={28} category={project.category} />
                        <span className="txt-role-body-lg txt-tone-primary truncate">
                          {project.name}
                        </span>
                      </div>
                      <div className="w-[150px] shrink-0 txt-role-body-md text-white/50">
                        {project.category}
                      </div>
                      <div className="w-[140px] shrink-0 txt-role-body-md text-white/40">
                        <span
                          className="inline-flex items-center gap-1.5"
                          style={{ color: project.status.color }}
                        >
                          <FileClock size={13} className="shrink-0" />
                          {project.status.label === "Review"
                            ? "Pending review"
                            : "Draft"}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-white/20">
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <FileClock size={24} className="opacity-40" />
              </div>
              <p className="txt-role-body-lg font-medium">
                {searchQuery
                  ? "No matching draft or pending projects"
                  : "No drafts or pending projects"}
              </p>
              <p className="txt-role-body-sm text-white/15 mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : "Draft and review projects will appear here"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
