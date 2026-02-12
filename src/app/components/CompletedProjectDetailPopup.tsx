import React, { Suspense, useMemo } from "react";
import { X } from "lucide-react";
import {
  POPUP_CLOSE_BUTTON_CLASS,
  POPUP_OVERLAY_CENTER_CLASS,
  POPUP_SHELL_BORDER_CLASS,
  POPUP_SHELL_CLASS,
} from "./popup/popupChrome";
import { Z_LAYERS } from "../lib/zLayers";
import type {
  MainContentFileActions,
  MainContentNavigationActions,
  MainContentProjectActions,
} from "../dashboard/types";
import type {
  ProjectData,
  ProjectFileData,
  Task,
  ViewerIdentity,
  WorkspaceMember,
} from "../types";

const loadMainContentModule = () => import("./MainContent");
const LazyMainContent = React.lazy(async () => {
  const module = await loadMainContentModule();
  return { default: module.MainContent };
});

type CompletedProjectDetailPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  onBackToCompletedProjects: () => void;
  project: ProjectData;
  projectTasks?: Task[];
  projects: Record<string, ProjectData>;
  projectFiles: ProjectFileData[];
  projectFilesPaginationStatus:
    | "LoadingFirstPage"
    | "CanLoadMore"
    | "LoadingMore"
    | "Exhausted";
  loadMoreProjectFiles: (numItems: number) => void;
  workspaceMembers: WorkspaceMember[];
  viewerIdentity: ViewerIdentity;
  fileActions: MainContentFileActions;
  projectActions: MainContentProjectActions;
  navigationActions?: MainContentNavigationActions;
};

export function CompletedProjectDetailPopup({
  isOpen,
  onClose,
  onBackToCompletedProjects,
  project,
  projectTasks,
  projects,
  projectFiles,
  projectFilesPaginationStatus,
  loadMoreProjectFiles,
  workspaceMembers,
  viewerIdentity,
  fileActions,
  projectActions,
  navigationActions,
}: CompletedProjectDetailPopupProps) {
  const popupNavigationActions = useMemo<MainContentNavigationActions>(
    () => ({
      ...navigationActions,
      backTo: "archive",
      backLabel: "completed projects",
      back: onBackToCompletedProjects,
    }),
    [navigationActions, onBackToCompletedProjects],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={POPUP_OVERLAY_CENTER_CLASS}
      style={{ zIndex: Z_LAYERS.modalPriority }}
      onClick={onClose}
    >
      <div
        className={`${POPUP_SHELL_CLASS} max-w-[980px] w-full h-[86vh] max-h-[86vh] flex flex-col font-app`}
        role="dialog"
        aria-modal="true"
        aria-label={`Completed project details for ${project.name}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div aria-hidden className={POPUP_SHELL_BORDER_CLASS} />
        <div className="absolute top-6 right-6 z-30">
          <button
            type="button"
            onClick={onClose}
            className={`${POPUP_CLOSE_BUTTON_CLASS} size-8`}
            aria-label="Close"
          >
            <X size={16} className="txt-tone-subtle" />
          </button>
        </div>
        <div className="flex-1 min-h-0">
          <Suspense fallback={null}>
            <LazyMainContent
              onToggleSidebar={() => {}}
              isSidebarOpen={false}
              layoutMode="popup"
              project={project}
              projectTasks={projectTasks ?? project.tasks ?? []}
              projectFiles={projectFiles}
              projectFilesPaginationStatus={projectFilesPaginationStatus}
              loadMoreProjectFiles={loadMoreProjectFiles}
              workspaceMembers={workspaceMembers}
              viewerIdentity={viewerIdentity}
              fileActions={fileActions}
              projectActions={projectActions}
              navigationActions={popupNavigationActions}
              allProjects={projects}
              pendingHighlight={null}
              onClearPendingHighlight={undefined}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
