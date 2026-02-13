import React from "react";
import { Filter, Plus, ArrowUpDown } from "lucide-react";
import { cn } from "../../../lib/utils";
import svgPaths from "../../../imports/svg-0erue6fqwq";
import { ProjectTasks } from "../ProjectTasks";
import { ProjectLogo } from "../ProjectLogo";
import type { ProjectData, Task, ViewerIdentity, WorkspaceMember } from "../../types";
import { DashboardTopBar } from "../layout/DashboardTopBar";
import { useIsMobile } from "../ui/use-mobile";
import {
  MENU_CHECK_ICON_CLASS,
  MENU_HEADER_CLASS,
  MENU_ITEM_ACTIVE_CLASS,
  MENU_ITEM_CLASS,
  MENU_SURFACE_CLASS,
} from "../ui/menuChrome";
import {
  DASHBOARD_ICON_TRIGGER_ACCENT_CLASS,
  DASHBOARD_ICON_TRIGGER_CLASS,
  DASHBOARD_ICON_TRIGGER_IDLE_CLASS,
  DASHBOARD_ICON_TRIGGER_OPEN_CLASS,
  DASHBOARD_SEARCH_BORDER_CLASS,
  DASHBOARD_SEARCH_CONTAINER_CLASS,
  DASHBOARD_SEARCH_CONTENT_CLASS,
  DASHBOARD_SEARCH_ICON_WRAP_CLASS,
  DASHBOARD_SEARCH_INPUT_CLASS,
} from "../ui/dashboardChrome";

type TaskSortBy = "dueDate" | "name" | "status";

type TasksViewProps = {
  isMobile: boolean;
  onToggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  isAdding: boolean;
  setIsAdding: (value: boolean) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (value: boolean) => void;
  filterProject: string[];
  setFilterProject: React.Dispatch<React.SetStateAction<string[]>>;
  activeProjects: ProjectData[];
  isSortOpen: boolean;
  setIsSortOpen: (value: boolean) => void;
  sortBy: TaskSortBy;
  setSortBy: (value: TaskSortBy) => void;
  sortOptions: ReadonlyArray<{ id: TaskSortBy; label: string }>;
  filteredTasks: Task[];
  handleUpdateTasks: (newTasks: Task[]) => void;
  workspaceMembers: WorkspaceMember[];
  viewerIdentity: ViewerIdentity;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
};

export function TasksView({
  isMobile,
  onToggleSidebar,
  searchQuery,
  setSearchQuery,
  isAdding,
  setIsAdding,
  isFilterOpen,
  setIsFilterOpen,
  filterProject,
  setFilterProject,
  activeProjects,
  isSortOpen,
  setIsSortOpen,
  sortBy,
  setSortBy,
  sortOptions,
  filteredTasks,
  handleUpdateTasks,
  workspaceMembers,
  viewerIdentity,
  scrollContainerRef,
  onScroll,
}: TasksViewProps) {
  const viewportIsMobile = useIsMobile();
  const useMobileLayout = isMobile || viewportIsMobile;

  return (
    <div className="relative flex h-full flex-1 flex-col overflow-hidden bg-bg-base font-app txt-tone-primary">
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-none bg-bg-surface transition-all duration-500 ease-in-out">
        <div className="h-[57px] w-full shrink-0">
          <DashboardTopBar onToggleSidebar={onToggleSidebar} />
        </div>

        <div
          ref={scrollContainerRef}
          className={cn(
            "scrollbar-page flex-1 overflow-y-auto px-4 py-5 md:px-[80px] md:py-[40px]",
            useMobileLayout && "pb-8",
          )}
          onScroll={onScroll}
        >
          <div className="mb-6 md:mb-10 flex items-center gap-6">
            <div className="flex-1">
              <h1 className="tracking-tight txt-role-page-title txt-tone-primary">
                Tasks
              </h1>
            </div>
          </div>

          <div className="relative z-10 mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className={DASHBOARD_SEARCH_CONTAINER_CLASS}>
              <div className={DASHBOARD_SEARCH_BORDER_CLASS} />
              <div className={DASHBOARD_SEARCH_CONTENT_CLASS}>
                <div className={DASHBOARD_SEARCH_ICON_WRAP_CLASS}>
                  <svg className="h-full w-full" viewBox="0 0 16 16" fill="none">
                    <path d={svgPaths.p3f80a980} fill="currentColor" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search tasks"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className={DASHBOARD_SEARCH_INPUT_CLASS}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => setIsAdding(true)}
                className="mr-1 md:mr-2 flex cursor-pointer items-center gap-1 txt-role-body-sm font-medium txt-tone-accent transition-colors"
              >
                <Plus size={14} />
                <span>{useMobileLayout ? "Add" : "Add Task"}</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={cn(
                    DASHBOARD_ICON_TRIGGER_CLASS,
                    filterProject.length > 0
                      ? DASHBOARD_ICON_TRIGGER_ACCENT_CLASS
                      : isFilterOpen
                        ? DASHBOARD_ICON_TRIGGER_OPEN_CLASS
                        : DASHBOARD_ICON_TRIGGER_IDLE_CLASS,
                  )}
                  title="Filter by project"
                >
                  <Filter size={16} strokeWidth={2} />
                </button>
                {isFilterOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsFilterOpen(false)}
                    />
                    <div
                      className={cn(
                        "absolute right-0 top-full z-20 mt-2 w-60 animate-in fade-in zoom-in-95 duration-100 p-1",
                        useMobileLayout && "w-[min(92vw,320px)]",
                        MENU_SURFACE_CLASS,
                      )}
                    >
                      <div className={MENU_HEADER_CLASS}>Filter by Project</div>
                      {activeProjects.map((project) => {
                        const isSelected = filterProject.includes(project.id);
                        return (
                          <button
                            key={project.id}
                            onClick={() => {
                              setFilterProject((prev) =>
                                prev.includes(project.id)
                                  ? prev.filter((id) => id !== project.id)
                                  : [...prev, project.id],
                              );
                            }}
                            className={cn(
                              MENU_ITEM_CLASS,
                              isSelected
                                ? MENU_ITEM_ACTIVE_CLASS
                                : "txt-tone-muted",
                            )}
                          >
                            <div
                              className={cn(
                                MENU_CHECK_ICON_CLASS,
                                "flex items-center justify-center transition-opacity",
                                isSelected ? "opacity-100" : "opacity-0",
                              )}
                            >
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path
                                  d="M9 1L3.5 6.5L1 4"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                            <ProjectLogo size={12} category={project.category} />
                            <span className="truncate">{project.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className={cn(
                    DASHBOARD_ICON_TRIGGER_CLASS,
                    isSortOpen
                      ? DASHBOARD_ICON_TRIGGER_OPEN_CLASS
                      : DASHBOARD_ICON_TRIGGER_IDLE_CLASS,
                  )}
                  title="Sort tasks"
                >
                  <ArrowUpDown size={16} strokeWidth={2} />
                </button>
                {isSortOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsSortOpen(false)}
                    />
                    <div
                      className={cn(
                        "absolute right-0 top-full z-20 mt-2 w-48 animate-in fade-in zoom-in-95 duration-100 p-1",
                        useMobileLayout && "w-[min(80vw,220px)]",
                        MENU_SURFACE_CLASS,
                      )}
                    >
                      <div className={MENU_HEADER_CLASS}>Sort by</div>
                      {sortOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setSortBy(option.id);
                            setIsSortOpen(false);
                          }}
                          className={cn(
                            MENU_ITEM_CLASS,
                            sortBy === option.id
                              ? MENU_ITEM_ACTIVE_CLASS
                              : "txt-tone-muted",
                          )}
                        >
                          <div className={MENU_CHECK_ICON_CLASS}>
                            {sortBy === option.id && (
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path
                                  d="M9 1L3.5 6.5L1 4"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <ProjectTasks
            isMobile={useMobileLayout}
            tasks={filteredTasks}
            onUpdateTasks={handleUpdateTasks}
            hideHeader
            isAddingMode={isAdding}
            onAddingModeChange={setIsAdding}
            assignableMembers={workspaceMembers}
            viewerIdentity={viewerIdentity}
            showProjectColumn
            projectOptions={activeProjects.map((project) => ({
              id: project.id,
              name: project.name,
              category: project.category,
            }))}
            defaultProjectId={activeProjects[0]?.id ?? null}
          />
        </div>
      </div>
    </div>
  );
}
