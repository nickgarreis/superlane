import { useCallback, useMemo } from "react";
import { useDashboardCommands } from "../useDashboardCommands";
import type {
  MainContentFileActions,
  MainContentNavigationActions,
  MainContentProjectActions,
} from "../types";
import { useDashboardFileActions } from "./useDashboardFileActions";
import { useDashboardProjectActions } from "./useDashboardProjectActions";
import { asPendingUploadId, asProjectFileId, asStorageId, computeFileChecksumSha256, omitUndefined, uploadFileToConvexStorage } from "../lib/uploadHelpers";
import type { DashboardDataLayer } from "./useDashboardDataLayer";

export function useDashboardActionLayer(dataLayer: DashboardDataLayer) {
  const {
    convex,
    navigation,
    data,
    apiHandlers,
    handleSwitchWorkspace,
    handleCreateWorkspace,
    workspaceActions,
  } = dataLayer;
  const { navigateView } = navigation;

  const projectActions = useDashboardProjectActions({
    activeWorkspaceId: data.activeWorkspace?.id,
    projects: data.projects,
    visibleProjects: data.visibleProjects,
    workspaceTasks: data.workspaceTasks,
    currentView: navigation.currentView,
    viewerIdentity: data.viewerIdentity,
    setEditProjectId: navigation.setEditProjectId,
    setEditDraftData: navigation.setEditDraftData,
    setReviewProject: navigation.setReviewProject,
    setHighlightedArchiveProjectId: navigation.setHighlightedArchiveProjectId,
    openCreateProject: navigation.openCreateProject,
    navigateView: navigation.navigateView,
    navigateToPath: (path) => navigation.navigate(path),
    createProjectMutation: apiHandlers.createProjectMutation,
    updateProjectMutation: apiHandlers.updateProjectMutation,
    archiveProjectMutation: apiHandlers.archiveProjectMutation,
    unarchiveProjectMutation: apiHandlers.unarchiveProjectMutation,
    removeProjectMutation: apiHandlers.removeProjectMutation,
    setProjectStatusMutation: apiHandlers.setProjectStatusMutation,
    updateReviewCommentsMutation: apiHandlers.updateReviewCommentsMutation,
    applyTaskDiffMutation: apiHandlers.applyTaskDiffMutation,
    canReorderWorkspaceTasks: data.tasksPaginationStatus === "Exhausted",
    asPendingUploadId,
    omitUndefined,
  });

  const fileActions = useDashboardFileActions({
    activeWorkspaceId: data.activeWorkspace?.id,
    resolvedWorkspaceSlug: data.resolvedWorkspaceSlug,
    convexQuery: (query, args) => convex.query(query, args),
    generateUploadUrlMutation: apiHandlers.generateUploadUrlMutation,
    finalizeProjectUploadAction: apiHandlers.finalizeProjectUploadAction,
    finalizePendingDraftAttachmentUploadAction: apiHandlers.finalizePendingDraftAttachmentUploadAction,
    discardPendingUploadMutation: apiHandlers.discardPendingUploadMutation,
    discardPendingUploadsForSessionMutation: apiHandlers.discardPendingUploadsForSessionMutation,
    removeProjectFileMutation: apiHandlers.removeProjectFileMutation,
    computeFileChecksumSha256,
    uploadFileToConvexStorage,
    asStorageId,
    asPendingUploadId,
    asProjectFileId,
  });

  const dashboardCommands = useDashboardCommands({
    handleCreateProject: projectActions.handleCreateProject,
    handleEditProject: projectActions.handleEditProject,
    handleViewReviewProject: projectActions.handleViewReviewProject,
    handleArchiveProject: projectActions.handleArchiveProject,
    handleUnarchiveProject: projectActions.handleUnarchiveProject,
    handleDeleteProject: projectActions.handleDeleteProject,
    handleUpdateProjectStatus: projectActions.handleUpdateProjectStatus,
    handleCreateProjectFile: fileActions.handleCreateProjectFile,
    handleRemoveProjectFile: fileActions.handleRemoveProjectFile,
    handleDownloadProjectFile: fileActions.handleDownloadProjectFile,
    handleUploadDraftAttachment: fileActions.handleUploadDraftAttachment,
    handleRemoveDraftAttachment: fileActions.handleRemoveDraftAttachment,
    handleDiscardDraftSessionUploads: fileActions.handleDiscardDraftSessionUploads,
    handleOpenSettings: navigation.handleOpenSettings,
    handleCloseSettings: navigation.handleCloseSettings,
    handleSaveAccountSettings: workspaceActions.handleSaveAccountSettings,
    handleUploadAccountAvatar: workspaceActions.handleUploadAccountAvatar,
    handleRemoveAccountAvatar: workspaceActions.handleRemoveAccountAvatar,
    handleSaveSettingsNotifications: workspaceActions.handleSaveSettingsNotifications,
    handleSwitchWorkspace,
    handleCreateWorkspace,
  });
  const { handleUpdateProject } = projectActions;
  const { file: fileCommands, project: projectCommands } = dashboardCommands;
  const {
    createProjectFile,
    removeProjectFile,
    downloadProjectFile,
  } = fileCommands;
  const {
    archiveProject,
    unarchiveProject,
    deleteProject,
    updateProjectStatus,
  } = projectCommands;

  const mainContentFileActions = useMemo<MainContentFileActions>(
    () => ({
      create: createProjectFile,
      remove: removeProjectFile,
      download: downloadProjectFile,
    }),
    [createProjectFile, downloadProjectFile, removeProjectFile],
  );

  const createMainContentProjectActions = useCallback(
    (projectId: string): MainContentProjectActions => ({
      archive: archiveProject,
      unarchive: unarchiveProject,
      remove: deleteProject,
      updateStatus: updateProjectStatus,
      updateProject: (payload) => handleUpdateProject(projectId, payload),
    }),
    [archiveProject, deleteProject, handleUpdateProject, unarchiveProject, updateProjectStatus],
  );

  const baseMainContentNavigationActions = useMemo<MainContentNavigationActions>(
    () => ({ navigate: navigateView }),
    [navigateView],
  );

  const handleNavigateToArchiveProject = useCallback(
    (projectId: string) => navigateView(`archive-project:${projectId}`),
    [navigateView],
  );

  return {
    projectActions,
    fileActions,
    dashboardCommands,
    mainContentFileActions,
    createMainContentProjectActions,
    baseMainContentNavigationActions,
    handleNavigateToArchiveProject,
  };
}

export type DashboardActionLayer = ReturnType<typeof useDashboardActionLayer>;
