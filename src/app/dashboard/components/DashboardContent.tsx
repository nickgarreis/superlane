import imgLogo from "figma:asset/c3a996a7bf06b0777eaf43cb323cfde0872e163e.png";
import { ArchivePage } from "../../components/ArchivePage";
import { MainContent } from "../../components/MainContent";
import { Tasks } from "../../components/Tasks";
import type {
  MainContentFileActions,
  MainContentNavigationActions,
  MainContentProjectActions,
  PendingHighlight,
} from "../types";
import type {
  DashboardContentModel,
} from "../types";
import type {
  ProjectData,
  ProjectFileData,
  Task,
  ViewerIdentity,
  WorkspaceMember,
} from "../../types";

type DashboardContentProps = {
  contentModel: DashboardContentModel;
  handleToggleSidebar: () => void;
  isSidebarOpen: boolean;
  visibleProjects: Record<string, ProjectData>;
  workspaceTasks: Task[];
  handleReplaceWorkspaceTasks: (tasks: Task[]) => void;
  workspaceMembers: WorkspaceMember[];
  viewerIdentity: ViewerIdentity;
  handleNavigateToArchiveProject: (projectId: string) => void;
  handleUnarchiveProject: (id: string) => void;
  handleDeleteProject: (id: string) => void;
  highlightedArchiveProjectId: string | null;
  setHighlightedArchiveProjectId: (id: string | null) => void;
  projectFilesByProject: Record<string, ProjectFileData[]>;
  mainContentFileActions: MainContentFileActions;
  createMainContentProjectActions: (projectId: string) => MainContentProjectActions;
  baseMainContentNavigationActions: MainContentNavigationActions;
  pendingHighlight: PendingHighlight | null;
  clearPendingHighlight: () => void;
  openCreateProject: () => void;
};

export function DashboardContent({
  contentModel,
  handleToggleSidebar,
  isSidebarOpen,
  visibleProjects,
  workspaceTasks,
  handleReplaceWorkspaceTasks,
  workspaceMembers,
  viewerIdentity,
  handleNavigateToArchiveProject,
  handleUnarchiveProject,
  handleDeleteProject,
  highlightedArchiveProjectId,
  setHighlightedArchiveProjectId,
  projectFilesByProject,
  mainContentFileActions,
  createMainContentProjectActions,
  baseMainContentNavigationActions,
  pendingHighlight,
  clearPendingHighlight,
  openCreateProject,
}: DashboardContentProps) {
  if (contentModel.kind === "tasks") {
    return (
      <Tasks
        onToggleSidebar={handleToggleSidebar}
        isSidebarOpen={isSidebarOpen}
        projects={visibleProjects}
        workspaceTasks={workspaceTasks}
        onUpdateWorkspaceTasks={handleReplaceWorkspaceTasks}
        workspaceMembers={workspaceMembers}
        viewerIdentity={viewerIdentity}
      />
    );
  }

  if (contentModel.kind === "archive") {
    return (
      <ArchivePage
        onToggleSidebar={handleToggleSidebar}
        isSidebarOpen={isSidebarOpen}
        projects={visibleProjects}
        onNavigateToProject={handleNavigateToArchiveProject}
        onUnarchiveProject={handleUnarchiveProject}
        onDeleteProject={handleDeleteProject}
        highlightedProjectId={highlightedArchiveProjectId}
        setHighlightedProjectId={setHighlightedArchiveProjectId}
      />
    );
  }

  if (contentModel.kind === "main") {
    const project = contentModel.project;
    const navigationActions: MainContentNavigationActions = contentModel.backTo
      ? {
          ...baseMainContentNavigationActions,
          backTo: contentModel.backTo,
          back: contentModel.back,
        }
      : baseMainContentNavigationActions;

    return (
      <MainContent
        onToggleSidebar={handleToggleSidebar}
        isSidebarOpen={isSidebarOpen}
        project={project}
        projectFiles={projectFilesByProject[project.id] ?? []}
        workspaceMembers={workspaceMembers}
        viewerIdentity={viewerIdentity}
        fileActions={mainContentFileActions}
        projectActions={createMainContentProjectActions(project.id)}
        navigationActions={navigationActions}
        allProjects={visibleProjects}
        pendingHighlight={pendingHighlight}
        onClearPendingHighlight={clearPendingHighlight}
      />
    );
  }

  return (
    <div className="flex-1 h-full bg-bg-base flex flex-col items-center justify-center text-white/20">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
          <img src={imgLogo} alt="" aria-hidden="true" className="w-8 h-8 opacity-40 grayscale" />
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
