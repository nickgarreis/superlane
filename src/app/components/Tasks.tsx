import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../../lib/utils";
import svgPaths from "../../imports/svg-0erue6fqwq";
import HorizontalBorder from "../../imports/HorizontalBorder";
import { ProjectTasks } from "./ProjectTasks";
import { Task, ProjectData, ViewerIdentity, WorkspaceMember } from "../types";
import { Filter, Plus, ArrowUpDown } from "lucide-react";
import { ProjectLogo } from "./ProjectLogo";
import { compareNullableEpochMsAsc } from "../lib/dates";
import {
  MENU_CHECK_ICON_CLASS,
  MENU_HEADER_CLASS,
  MENU_ITEM_ACTIVE_CLASS,
  MENU_ITEM_CLASS,
  MENU_SURFACE_CLASS,
} from "./ui/menuChrome";
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
} from "./ui/dashboardChrome";
type TaskSortBy = "dueDate" | "name" | "status";
const TASK_SORT_OPTIONS: ReadonlyArray<{ id: TaskSortBy; label: string }> = [
  { id: "dueDate", label: "Due Date" },
  { id: "name", label: "Name" },
  { id: "status", label: "Status" },
];
export function Tasks({
  onToggleSidebar,
  isSidebarOpen,
  projects,
  workspaceTasks,
  tasksPaginationStatus = "Exhausted",
  loadMoreWorkspaceTasks,
  onUpdateWorkspaceTasks,
  workspaceMembers,
  viewerIdentity,
}: {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  projects: Record<string, ProjectData>;
  workspaceTasks: Task[];
  tasksPaginationStatus?:
    | "LoadingFirstPage"
    | "CanLoadMore"
    | "LoadingMore"
    | "Exhausted";
  loadMoreWorkspaceTasks?: (numItems: number) => void;
  onUpdateWorkspaceTasks: (tasks: Task[]) => void;
  workspaceMembers: WorkspaceMember[];
  viewerIdentity: ViewerIdentity;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<TaskSortBy>("dueDate");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [filterProject, setFilterProject] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const isLoadingMoreRef = useRef(false);
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  const normalizedSearchQuery = useMemo(
    () => deferredSearchQuery.trim().toLowerCase(),
    [deferredSearchQuery],
  );
  const selectedProjectIds = useMemo(
    () => new Set(filterProject),
    [filterProject],
  );
  const activeProjects = useMemo(
    () =>
      Object.values(projects).filter(
        (project) => !project.archived && project.status.label === "Active",
      ),
    [projects],
  );
  const activeProjectIds = useMemo(
    () => new Set(activeProjects.map((project) => project.id)),
    [activeProjects],
  );
  const allTasks = useMemo(() => workspaceTasks, [workspaceTasks]);
  useEffect(() => {
    setFilterProject((current) =>
      current.filter((projectId) => activeProjectIds.has(projectId)),
    );
  }, [activeProjectIds]);
  useEffect(() => {
    if (tasksPaginationStatus !== "LoadingMore") {
      isLoadingMoreRef.current = false;
    }
  }, [tasksPaginationStatus]);
  const filteredTasks = useMemo(() => {
    const next: Task[] = [];
    const hasProjectFilter = selectedProjectIds.size > 0;
    for (const task of allTasks) {
      const matchesSearch =
        normalizedSearchQuery.length === 0 ||
        task.title.toLowerCase().includes(normalizedSearchQuery);
      if (!matchesSearch) {
        continue;
      }
      if (
        hasProjectFilter &&
        (!task.projectId || !selectedProjectIds.has(task.projectId))
      ) {
        continue;
      }
      next.push(task);
    }
    return next.sort((a, b) => {
      if (sortBy === "name") return a.title.localeCompare(b.title);
      if (sortBy === "status") return Number(a.completed) - Number(b.completed);
      return compareNullableEpochMsAsc(a.dueDateEpochMs, b.dueDateEpochMs);
    });
  }, [allTasks, normalizedSearchQuery, selectedProjectIds, sortBy]);
  const handleUpdateTasks = (newTasks: Task[]) => {
    const previousIdsInView = new Set(filteredTasks.map((task) => task.id));
    const nextById = new Map(newTasks.map((task) => [task.id, task]));
    const nextAll: Task[] = [];
    for (const task of allTasks) {
      if (!previousIdsInView.has(task.id)) {
        nextAll.push(task);
        continue;
      }
      const nextTask = nextById.get(task.id);
      if (!nextTask) {
        continue;
      }
      nextAll.push(nextTask);
    }
    for (const task of newTasks) {
      if (!previousIdsInView.has(task.id)) {
        nextAll.push(task);
      }
    }
    const normalized = nextAll.map((task) => ({
      ...task,
      projectId:
        task.projectId && activeProjectIds.has(task.projectId)
          ? task.projectId
          : undefined,
    }));
    onUpdateWorkspaceTasks(normalized);
  };
  const handleTasksScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      if (
        isLoadingMoreRef.current ||
        tasksPaginationStatus !== "CanLoadMore" ||
        !loadMoreWorkspaceTasks
      ) {
        return;
      }
      const element = event.currentTarget;
      const remaining =
        element.scrollHeight - element.scrollTop - element.clientHeight;
      if (remaining <= 240) {
        isLoadingMoreRef.current = true;
        loadMoreWorkspaceTasks(100);
      }
    },
    [loadMoreWorkspaceTasks, tasksPaginationStatus],
  );
  return (
    <div className="flex-1 h-full bg-bg-base txt-tone-primary overflow-hidden font-app flex flex-col relative">
      {" "}
      <div className="relative bg-bg-surface rounded-none flex-1 overflow-hidden flex flex-col transition-all duration-500 ease-in-out">
        {" "}
        {/* Top Border / Header */}{" "}
        <div className="w-full h-[57px] shrink-0">
          {" "}
          <HorizontalBorder onToggleSidebar={onToggleSidebar} />{" "}
        </div>{" "}
        {/* Scrollable Content Area */}{" "}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-[80px] py-[40px]"
          onScroll={handleTasksScroll}
        >
          {" "}
          {/* Header Section */}{" "}
          <div className="flex gap-6 mb-10 items-center">
            {" "}
            <div className="flex-1">
              {" "}
              <h1 className="txt-role-page-title txt-tone-primary tracking-tight">
                Tasks
              </h1>{" "}
            </div>{" "}
          </div>{" "}
          {/* Toolbar */}{" "}
          <div className="flex items-center justify-between mb-6 z-10 relative">
            {" "}
            <div className={DASHBOARD_SEARCH_CONTAINER_CLASS}>
              {" "}
              <div className={DASHBOARD_SEARCH_BORDER_CLASS} />{" "}
              <div className={DASHBOARD_SEARCH_CONTENT_CLASS}>
                {" "}
                <div className={DASHBOARD_SEARCH_ICON_WRAP_CLASS}>
                  {" "}
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    {" "}
                    <path d={svgPaths.p3f80a980} fill="currentColor" />{" "}
                  </svg>{" "}
                </div>{" "}
                <input
                  type="text"
                  placeholder="Search tasks"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={DASHBOARD_SEARCH_INPUT_CLASS}
                />{" "}
              </div>{" "}
            </div>{" "}
            <div className="flex items-center gap-3">
              {" "}
              <button
                onClick={() => setIsAdding(true)}
                className="txt-role-body-sm font-medium txt-tone-accent hover:txt-tone-accent transition-colors flex items-center gap-1 cursor-pointer mr-2"
              >
                {" "}
                <Plus size={14} /> Add Task{" "}
              </button>{" "}
              {/* Filter Dropdown */}{" "}
              <div className="relative">
                {" "}
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
                  {" "}
                  <Filter size={16} strokeWidth={2} />{" "}
                </button>{" "}
                {isFilterOpen && (
                  <>
                    {" "}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsFilterOpen(false)}
                    />{" "}
                    <div
                      className={cn(
                        "absolute right-0 top-full mt-2 w-60 p-1 z-20 animate-in fade-in zoom-in-95 duration-100",
                        MENU_SURFACE_CLASS,
                      )}
                    >
                      {" "}
                      <div className={MENU_HEADER_CLASS}>
                        {" "}
                        Filter by Project{" "}
                      </div>{" "}
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
                            {" "}
                            <div
                              className={cn(
                                MENU_CHECK_ICON_CLASS,
                                "flex items-center justify-center transition-opacity",
                                isSelected ? "opacity-100" : "opacity-0",
                              )}
                            >
                              {" "}
                              <svg
                                width="10"
                                height="8"
                                viewBox="0 0 10 8"
                                fill="none"
                              >
                                {" "}
                                <path
                                  d="M9 1L3.5 6.5L1 4"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />{" "}
                              </svg>{" "}
                            </div>{" "}
                            <ProjectLogo
                              size={16}
                              category={project.category}
                            />{" "}
                            <span
                              className={cn(
                                "truncate transition-colors",
                                isSelected
                                  ? "text-white"
                                  : "txt-tone-subtle group-hover:text-white",
                              )}
                            >
                              {project.name}
                            </span>{" "}
                          </button>
                        );
                      })}{" "}
                      {activeProjects.length === 0 && (
                        <div className="px-3 py-2 txt-role-body-sm text-white/40">
                          {" "}
                          No active projects{" "}
                        </div>
                      )}{" "}
                    </div>{" "}
                  </>
                )}{" "}
              </div>{" "}
              <div className="w-px h-4 bg-white/10" /> {/* Sort Dropdown */}{" "}
              <div className="relative">
                {" "}
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
                  {" "}
                  <ArrowUpDown size={16} strokeWidth={2} />{" "}
                </button>{" "}
                {isSortOpen && (
                  <>
                    {" "}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsSortOpen(false)}
                    />{" "}
                    <div
                      className={cn(
                        "absolute right-0 top-full mt-2 w-48 p-1 z-20 animate-in fade-in zoom-in-95 duration-100",
                        MENU_SURFACE_CLASS,
                      )}
                    >
                      {" "}
                      <div className={MENU_HEADER_CLASS}>
                        {" "}
                        Sort by{" "}
                      </div>{" "}
                      {TASK_SORT_OPTIONS.map((option) => (
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
                          {" "}
                          <div
                            className={cn(
                              MENU_CHECK_ICON_CLASS,
                              "flex items-center justify-center transition-opacity",
                              sortBy === option.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          >
                            {" "}
                            <svg
                              width="10"
                              height="8"
                              viewBox="0 0 10 8"
                              fill="none"
                            >
                              {" "}
                              <path
                                d="M9 1L3.5 6.5L1 4"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />{" "}
                            </svg>{" "}
                          </div>{" "}
                          <span
                            className={cn(
                              "transition-colors",
                              sortBy === option.id
                                ? "text-white"
                                : "txt-tone-subtle group-hover:text-white",
                            )}
                          >
                            {" "}
                            {option.label}{" "}
                          </span>{" "}
                        </button>
                      ))}{" "}
                    </div>{" "}
                  </>
                )}{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          {/* Tasks List */}{" "}
          <div className="">
            {" "}
            <ProjectTasks
              tasks={filteredTasks}
              onUpdateTasks={handleUpdateTasks}
              disableInternalSort={true}
              hideHeader={true}
              isAddingMode={isAdding}
              onAddingModeChange={setIsAdding}
              assignableMembers={workspaceMembers}
              viewerIdentity={viewerIdentity}
              showProjectColumn={true}
              projectOptions={activeProjects.map((project) => ({
                id: project.id,
                name: project.name,
                category: project.category,
              }))}
              defaultProjectId={null}
            />{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
