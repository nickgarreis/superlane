import React, { useEffect, useMemo, useRef, useState } from "react";
import { Maximize2 } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { SidebarProjectsSectionProps } from "./types";
import { partitionSidebarProjects } from "./partitionProjects";
import { SidebarItem } from "./SidebarItem";
import { ProjectLogo } from "../ProjectLogo";
function CollapsibleContent({
  isExpanded,
  children,
  className,
}: {
  isExpanded: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        isExpanded ? "opacity-100" : "opacity-0",
        className,
      )}
      style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}
function SectionHeader({
  title,
  count,
  isExpanded,
  onToggle,
}: {
  title: string;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between px-3 py-2 group cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex items-center gap-2">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className={cn(
            "text-white/30 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            isExpanded && "rotate-90",
          )}
        >
          <path d="M4 2l4 4-4 4" fill="currentColor" />
        </svg>
        <span className="txt-role-meta font-medium uppercase tracking-wider text-white/40 group-hover:text-white/55 transition-colors select-none">
          {title}
        </span>
        <span className="txt-role-kbd text-white/20 tabular-nums">{count}</span>
      </div>
    </div>
  );
}
export function SidebarProjectsSection({
  projects,
  currentView,
  onNavigate,
  onEditProject,
  onViewReviewProject,
  onOpenCompletedProjectsPopup,
}: SidebarProjectsSectionProps) {
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  const { activeProjects, completedProjects, activeCompletedProject } = useMemo(
    () => partitionSidebarProjects(projects, currentView),
    [projects, currentView],
  );
  const renderedActiveProjects = useMemo(
    () =>
      activeProjects.map((project) => {
        const projectIsDraft = project.status.label === "Draft";
        const projectIsReview = project.status.label === "Review";
        return (
          <SidebarItem
            key={project.id}
            projectId={project.id}
            icon={<ProjectLogo size={16} category={project.category} />}
            label={project.name}
            onClick={() => {
              if (projectIsDraft) {
                onEditProject(project);
              } else if (projectIsReview) {
                onViewReviewProject(project);
              } else {
                onNavigate(`project:${project.id}`);
              }
            }}
            isActive={
              !projectIsDraft &&
              !projectIsReview &&
              currentView === `project:${project.id}`
            }
            isDraft={projectIsDraft}
            isReview={projectIsReview}
          />
        );
      }),
    [
      activeProjects,
      currentView,
      onEditProject,
      onNavigate,
      onViewReviewProject,
    ],
  );
  const prevProjectCount = useRef(activeProjects.length);
  useEffect(() => {
    if (prevProjectCount.current > 0 && activeProjects.length === 0) {
      setIsProjectsExpanded(false);
    } else if (
      activeProjects.length > 0 &&
      !isProjectsExpanded &&
      prevProjectCount.current === 0
    ) {
      setIsProjectsExpanded(true);
    }
    prevProjectCount.current = activeProjects.length;
  }, [activeProjects.length, isProjectsExpanded]);
  return (
    <>
      <div className="flex-1 min-h-0 -mx-3 px-3 flex flex-col relative">
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <SectionHeader
            title="Projects"
            count={activeProjects.length}
            isExpanded={isProjectsExpanded}
            onToggle={() => setIsProjectsExpanded((prev) => !prev)}
          />
          <CollapsibleContent isExpanded={isProjectsExpanded}>
            <div className="flex flex-col gap-0.5 pb-2">
              {activeProjects.length > 0 ? (
                renderedActiveProjects
              ) : (
                <div className="px-3 py-1.5 txt-role-body-sm text-white/30 italic">
                  No projects
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
        {completedProjects.length > 0 && (
          <div className="shrink-0 pb-2 flex flex-col min-h-0">
            <div className="mx-3 mb-1 h-px bg-gradient-to-r from-white/[0.06] via-white/[0.04] to-transparent shrink-0" />
            <div
              className="flex items-center justify-between px-3 py-2 cursor-pointer group"
              onClick={onOpenCompletedProjectsPopup}
            >
              <div className="flex items-center gap-2">
                <span className="txt-role-meta font-medium uppercase tracking-wider text-white/40 group-hover:text-white/55 transition-colors select-none">
                  Completed
                </span>
                <span className="txt-role-kbd text-white/20 tabular-nums">
                  {completedProjects.length}
                </span>
              </div>
              <div
                className="p-1 hover:bg-white/10 rounded cursor-pointer transition-all opacity-0 group-hover:opacity-100"
                title="View all"
              >
                <Maximize2 size={12} className="text-white/40" />
              </div>
            </div>
            {activeCompletedProject && (
              <div className="flex flex-col gap-0.5">
                <SidebarItem
                  key={activeCompletedProject.id}
                  projectId={activeCompletedProject.id}
                  icon={
                    <ProjectLogo
                      size={16}
                      category={activeCompletedProject.category}
                    />
                  }
                  label={activeCompletedProject.name}
                  onClick={() =>
                    onNavigate(`project:${activeCompletedProject.id}`)
                  }
                  isActive
                  completionDate={
                    activeCompletedProject.completedAt
                      ? new Date(
                          activeCompletedProject.completedAt,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : ""
                  }
                />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
