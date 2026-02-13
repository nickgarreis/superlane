import React, { Suspense, useEffect, useState } from "react";
import imgLogo from "figma:asset/c3a996a7bf06b0777eaf43cb323cfde0872e163e.png";
import type {
  DashboardContentModel,
  MainContentFileActions,
  MainContentNavigationActions,
  MainContentProjectActions,
  PendingHighlight,
} from "../types";
import type {
  ProjectData,
  ProjectFileData,
  Task,
  ViewerIdentity,
  WorkspaceMember,
} from "../../types";
const loadArchivePageModule = () => import("../../components/ArchivePage");
const loadMainContentModule = () => import("../../components/MainContent");
const loadTasksModule = () => import("../../components/Tasks");
const LazyArchivePage = React.lazy(async () => {
  const module = await loadArchivePageModule();
  return { default: module.ArchivePage };
});
const LazyMainContent = React.lazy(async () => {
  const module = await loadMainContentModule();
  return { default: module.MainContent };
});
const LazyTasks = React.lazy(async () => {
  const module = await loadTasksModule();
  return { default: module.Tasks };
});
const ContentLoadingFallback = (
  <div className="flex-1 h-full bg-bg-base flex items-center justify-center text-white/50 text-sm font-app">
    Loading...
  </div>
);
const paneClassName = (isActive: boolean): string =>
  isActive ? "h-full w-full" : "hidden h-full w-full";
type MainContentModel = Extract<DashboardContentModel, { kind: "main" }>;
type DashboardContentProps = {
  contentModel: DashboardContentModel;
  handleToggleSidebar: () => void;
  isSidebarOpen: boolean;
  visibleProjects: Record<string, ProjectData>;
  chatProjects: Record<string, ProjectData>;
  tasksByProject?: Record<string, Task[]>;
  workspaceTasks: Task[];
  tasksPaginationStatus:
    | "LoadingFirstPage"
    | "CanLoadMore"
    | "LoadingMore"
    | "Exhausted";
  loadMoreWorkspaceTasks: (numItems: number) => void;
  handleReplaceWorkspaceTasks: (tasks: Task[]) => void;
  workspaceMembers: WorkspaceMember[];
  viewerIdentity: ViewerIdentity;
  handleNavigateToArchiveProject: (projectId: string) => void;
  handleUnarchiveProject: (id: string) => void;
  handleDeleteProject: (id: string) => void;
  highlightedArchiveProjectId: string | null;
  setHighlightedArchiveProjectId: (id: string | null) => void;
  projectFilesByProject: Record<string, ProjectFileData[]>;
  projectFilesPaginationStatus:
    | "LoadingFirstPage"
    | "CanLoadMore"
    | "LoadingMore"
    | "Exhausted";
  loadMoreProjectFiles: (numItems: number) => void;
  mainContentFileActions: MainContentFileActions;
  createMainContentProjectActions: (
    projectId: string,
  ) => MainContentProjectActions;
  baseMainContentNavigationActions: MainContentNavigationActions;
  pendingHighlight: PendingHighlight | null;
  clearPendingHighlight: () => void;
  openCreateProject: () => void;
};
export const DashboardContent = React.memo(function DashboardContent({
  contentModel,
  handleToggleSidebar,
  isSidebarOpen,
  visibleProjects,
  chatProjects,
  tasksByProject = {},
  workspaceTasks,
  tasksPaginationStatus,
  loadMoreWorkspaceTasks,
  handleReplaceWorkspaceTasks,
  workspaceMembers,
  viewerIdentity,
  handleNavigateToArchiveProject,
  handleUnarchiveProject,
  handleDeleteProject,
  highlightedArchiveProjectId,
  setHighlightedArchiveProjectId,
  projectFilesByProject,
  projectFilesPaginationStatus,
  loadMoreProjectFiles,
  mainContentFileActions,
  createMainContentProjectActions,
  baseMainContentNavigationActions,
  pendingHighlight,
  clearPendingHighlight,
  openCreateProject,
}: DashboardContentProps) {
  const [hasLoadedTasksPane, setHasLoadedTasksPane] = useState(
    contentModel.kind === "tasks",
  );
  const [hasLoadedArchivePane, setHasLoadedArchivePane] = useState(
    contentModel.kind === "archive",
  );
  const [hasLoadedMainPane, setHasLoadedMainPane] = useState(
    contentModel.kind === "main",
  );
  const [cachedMainModel, setCachedMainModel] = useState<MainContentModel | null>(
    contentModel.kind === "main" ? contentModel : null,
  );

  useEffect(() => {
    if (contentModel.kind === "tasks") {
      setHasLoadedTasksPane(true);
      return;
    }
    if (contentModel.kind === "archive") {
      setHasLoadedArchivePane(true);
      return;
    }
    if (contentModel.kind === "main") {
      setHasLoadedMainPane(true);
      setCachedMainModel(contentModel);
    }
  }, [contentModel]);

  const activeMainModel =
    contentModel.kind === "main" ? contentModel : cachedMainModel;
  const mainProjectId = activeMainModel?.project.id ?? null;
  const mainNavigationActions: MainContentNavigationActions =
    activeMainModel?.backTo
      ? {
          ...baseMainContentNavigationActions,
          backTo: activeMainModel.backTo,
          back: activeMainModel.back,
        }
      : baseMainContentNavigationActions;

  const isTasksActive = contentModel.kind === "tasks";
  const isArchiveActive = contentModel.kind === "archive";
  const isMainActive = contentModel.kind === "main";

  if (
    !hasLoadedTasksPane &&
    !hasLoadedArchivePane &&
    !hasLoadedMainPane &&
    contentModel.kind === "empty"
  ) {
    return (
      <div className="flex-1 h-full bg-bg-base flex flex-col items-center justify-center text-white/20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
            <img
              src={imgLogo}
              alt=""
              aria-hidden="true"
              className="w-8 h-8 opacity-40 grayscale"
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">No projects in this workspace</p>
            <button
              onClick={openCreateProject}
              className="mt-3 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/60 hover:text-white transition-colors"
            >
              Create new project
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full bg-bg-base relative">
      {(hasLoadedTasksPane || isTasksActive) && (
        <div className={paneClassName(isTasksActive)} aria-hidden={!isTasksActive}>
          <Suspense fallback={ContentLoadingFallback}>
            <LazyTasks
              onToggleSidebar={handleToggleSidebar}
              projects={visibleProjects}
              workspaceTasks={workspaceTasks}
              tasksPaginationStatus={tasksPaginationStatus}
              loadMoreWorkspaceTasks={loadMoreWorkspaceTasks}
              onUpdateWorkspaceTasks={handleReplaceWorkspaceTasks}
              workspaceMembers={workspaceMembers}
              viewerIdentity={viewerIdentity}
            />
          </Suspense>
        </div>
      )}
      {(hasLoadedArchivePane || isArchiveActive) && (
        <div
          className={paneClassName(isArchiveActive)}
          aria-hidden={!isArchiveActive}
        >
          <Suspense fallback={ContentLoadingFallback}>
            <LazyArchivePage
              onToggleSidebar={handleToggleSidebar}
              isSidebarOpen={isSidebarOpen}
              projects={visibleProjects}
              viewerRole={viewerIdentity.role}
              onNavigateToProject={handleNavigateToArchiveProject}
              onUnarchiveProject={handleUnarchiveProject}
              onDeleteProject={handleDeleteProject}
              highlightedProjectId={highlightedArchiveProjectId}
              setHighlightedProjectId={setHighlightedArchiveProjectId}
            />
          </Suspense>
        </div>
      )}
      {(hasLoadedMainPane || isMainActive) && activeMainModel && mainProjectId && (
        <div className={paneClassName(isMainActive)} aria-hidden={!isMainActive}>
          <Suspense fallback={ContentLoadingFallback}>
            <LazyMainContent
              onToggleSidebar={handleToggleSidebar}
              isSidebarOpen={isSidebarOpen}
              project={activeMainModel.project}
              projectTasks={tasksByProject[mainProjectId] ?? []}
              projectFiles={projectFilesByProject[mainProjectId] ?? []}
              projectFilesPaginationStatus={projectFilesPaginationStatus}
              loadMoreProjectFiles={loadMoreProjectFiles}
              workspaceMembers={workspaceMembers}
              viewerIdentity={viewerIdentity}
              fileActions={mainContentFileActions}
              projectActions={createMainContentProjectActions(mainProjectId)}
              navigationActions={mainNavigationActions}
              allProjects={chatProjects}
              pendingHighlight={isMainActive ? pendingHighlight : null}
              onClearPendingHighlight={clearPendingHighlight}
            />
          </Suspense>
        </div>
      )}
      {contentModel.kind === "empty" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <img
                src={imgLogo}
                alt=""
                aria-hidden="true"
                className="w-8 h-8 opacity-40 grayscale"
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">No projects in this workspace</p>
              <button
                onClick={openCreateProject}
                className="mt-3 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/60 hover:text-white transition-colors"
              >
                Create new project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
DashboardContent.displayName = "DashboardContent";
