import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { compareNullableEpochMsAsc } from "../lib/dates";
import { useSessionBackedState } from "../dashboard/hooks/useSessionBackedState";
import type { ProjectData, Task, ViewerIdentity, WorkspaceMember } from "../types";
import { TasksView } from "./tasks-page/TasksView";

type TaskSortBy = "dueDate" | "name" | "status";

const TASK_SORT_OPTIONS: ReadonlyArray<{ id: TaskSortBy; label: string }> = [
  { id: "dueDate", label: "Due Date" },
  { id: "name", label: "Name" },
  { id: "status", label: "Status" },
];
const TASKS_UI_SEARCH_KEY = "tasks.search";
const TASKS_UI_SORT_KEY = "tasks.sort";
const TASKS_UI_FILTER_PROJECTS_KEY = "tasks.filterProjectIds";
const EMPTY_PROJECT_FILTER: string[] = [];
const deserializeString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;
const deserializeTaskSortBy = (value: unknown): TaskSortBy | undefined =>
  value === "dueDate" || value === "name" || value === "status"
    ? value
    : undefined;
const deserializeProjectFilter = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }
  return value
    .filter((entry): entry is string => typeof entry === "string")
    .slice(0, 100);
};

type TasksProps = {
  isMobile?: boolean;
  onToggleSidebar: () => void;
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
};

export function Tasks({
  isMobile = false,
  onToggleSidebar,
  projects,
  workspaceTasks,
  tasksPaginationStatus = "Exhausted",
  loadMoreWorkspaceTasks,
  onUpdateWorkspaceTasks,
  workspaceMembers,
  viewerIdentity,
}: TasksProps) {
  const [searchQuery, setSearchQuery] = useSessionBackedState(
    TASKS_UI_SEARCH_KEY,
    "",
    deserializeString,
  );
  const [sortBy, setSortBy] = useSessionBackedState<TaskSortBy>(
    TASKS_UI_SORT_KEY,
    "dueDate",
    deserializeTaskSortBy,
  );
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [filterProject, setFilterProject] = useSessionBackedState<string[]>(
    TASKS_UI_FILTER_PROJECTS_KEY,
    EMPTY_PROJECT_FILTER,
    deserializeProjectFilter,
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isLoadingMoreRef = useRef(false);

  const normalizedSearchQuery = useMemo(
    () => deferredSearchQuery.trim().toLowerCase(),
    [deferredSearchQuery],
  );
  const selectedProjectIds = useMemo(() => new Set(filterProject), [filterProject]);
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
  const mutableWorkspaceTasks = useMemo(
    () =>
      workspaceTasks.filter(
        (task) =>
          typeof task.projectId === "string"
          && activeProjectIds.has(task.projectId),
      ),
    [activeProjectIds, workspaceTasks],
  );

  useEffect(() => {
    setFilterProject((current) =>
      current.filter((projectId) => activeProjectIds.has(projectId)),
    );
  }, [activeProjectIds, setFilterProject]);
  useEffect(() => {
    if (tasksPaginationStatus !== "LoadingMore") {
      isLoadingMoreRef.current = false;
    }
  }, [tasksPaginationStatus]);

  const filteredTasks = useMemo(() => {
    const next: Task[] = [];
    const hasProjectFilter = selectedProjectIds.size > 0;
    for (const task of mutableWorkspaceTasks) {
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

    return next.sort((left, right) => {
      if (sortBy === "name") return left.title.localeCompare(right.title);
      if (sortBy === "status") return Number(left.completed) - Number(right.completed);
      return compareNullableEpochMsAsc(left.dueDateEpochMs, right.dueDateEpochMs);
    });
  }, [mutableWorkspaceTasks, normalizedSearchQuery, selectedProjectIds, sortBy]);

  const handleUpdateTasks = useCallback(
    (newTasks: Task[]) => {
      const previousIdsInView = new Set(filteredTasks.map((task) => task.id));
      const nextById = new Map(newTasks.map((task) => [task.id, task]));
      const nextAll: Task[] = [];

      for (const task of mutableWorkspaceTasks) {
        if (!previousIdsInView.has(task.id)) {
          nextAll.push(task);
          continue;
        }
        const nextTask = nextById.get(task.id);
        if (nextTask) {
          nextAll.push(nextTask);
        }
      }
      for (const task of newTasks) {
        if (!previousIdsInView.has(task.id)) {
          nextAll.push(task);
        }
      }

      onUpdateWorkspaceTasks(nextAll);
    },
    [filteredTasks, mutableWorkspaceTasks, onUpdateWorkspaceTasks],
  );

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
      const remaining = element.scrollHeight - element.scrollTop - element.clientHeight;
      if (remaining <= 240) {
        isLoadingMoreRef.current = true;
        loadMoreWorkspaceTasks(100);
      }
    },
    [loadMoreWorkspaceTasks, tasksPaginationStatus],
  );

  return (
    <TasksView
      isMobile={isMobile}
      onToggleSidebar={onToggleSidebar}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      isAdding={isAdding}
      setIsAdding={setIsAdding}
      isFilterOpen={isFilterOpen}
      setIsFilterOpen={setIsFilterOpen}
      filterProject={filterProject}
      setFilterProject={setFilterProject}
      activeProjects={activeProjects}
      isSortOpen={isSortOpen}
      setIsSortOpen={setIsSortOpen}
      sortBy={sortBy}
      setSortBy={setSortBy}
      sortOptions={TASK_SORT_OPTIONS}
      filteredTasks={filteredTasks}
      handleUpdateTasks={handleUpdateTasks}
      workspaceMembers={workspaceMembers}
      viewerIdentity={viewerIdentity}
      scrollContainerRef={scrollContainerRef}
      onScroll={handleTasksScroll}
    />
  );
}
