import { useCallback, useMemo, type ComponentProps } from "react";
import { useConvex, useConvexAuth } from "convex/react";
import { useAuth } from "@workos-inc/authkit-react";
import { toast } from "sonner";
import { DashboardChrome } from "./components/DashboardChrome";
import { DashboardContent } from "./components/DashboardContent";
import {
  DashboardPopups,
  loadCreateProjectPopupModule,
  loadCreateWorkspacePopupModule,
  loadSearchPopupModule,
  loadSettingsPopupModule,
} from "./components/DashboardPopups";
import { useDashboardData } from "./useDashboardData";
import { useDashboardCommands } from "./useDashboardCommands";
import { useDashboardNavigation } from "./useDashboardNavigation";
import { useDashboardWorkspaceActions } from "./useDashboardWorkspaceActions";
import { MainContentFileActions, MainContentNavigationActions, MainContentProjectActions } from "./types";
import { useDashboardProjectActions } from "./hooks/useDashboardProjectActions";
import { useDashboardFileActions } from "./hooks/useDashboardFileActions";
import { useDashboardSettingsData } from "./hooks/useDashboardSettingsData";
import { useDashboardApiHandlers } from "./hooks/useDashboardApiHandlers";
import { useDashboardLifecycleEffects } from "./hooks/useDashboardLifecycleEffects";
import { useDashboardPopupBindings } from "./hooks/useDashboardPopupBindings";
import {
  asBrandAssetId,
  asPendingUploadId,
  asProjectFileId,
  asStorageId,
  asUserId,
  computeFileChecksumSha256,
  omitUndefined,
  uploadFileToConvexStorage,
} from "./lib/uploadHelpers";

type DashboardOrchestrationResult = {
  hasSnapshot: boolean;
  popupsProps: ComponentProps<typeof DashboardPopups>;
  chromeProps: ComponentProps<typeof DashboardChrome>;
  contentProps: ComponentProps<typeof DashboardContent>;
};

export function useDashboardOrchestration(): DashboardOrchestrationResult {
  const { user, signOut } = useAuth();
  const { isAuthenticated } = useConvexAuth();
  const convex = useConvex();

  const navigation = useDashboardNavigation({
    preloadSearchPopup: () => {
      void loadSearchPopupModule();
    },
    preloadCreateProjectPopup: () => {
      void loadCreateProjectPopupModule();
    },
    preloadCreateWorkspacePopup: () => {
      void loadCreateWorkspacePopupModule();
    },
    preloadSettingsPopup: () => {
      void loadSettingsPopupModule();
    },
  });

  const {
    location,
    navigate,
    currentView,
    settingsTab,
    isSettingsOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    isSearchOpen,
    setIsSearchOpen,
    isCreateProjectOpen,
    isCreateWorkspaceOpen,
    highlightedArchiveProjectId,
    setHighlightedArchiveProjectId,
    pendingHighlight,
    setPendingHighlight,
    editProjectId,
    setEditProjectId,
    editDraftData,
    setEditDraftData,
    reviewProject,
    setReviewProject,
    activeWorkspaceSlug,
    setActiveWorkspaceSlug,
    navigateView,
    openSearch,
    openCreateProject,
    closeCreateProject,
    openCreateWorkspace,
    closeCreateWorkspace,
    handleOpenSettings,
    handleCloseSettings,
  } = navigation;

  const {
    ensureDefaultWorkspaceAction,
    createWorkspaceMutation,
    createProjectMutation,
    updateProjectMutation,
    archiveProjectMutation,
    unarchiveProjectMutation,
    removeProjectMutation,
    setProjectStatusMutation,
    updateReviewCommentsMutation,
    replaceProjectTasksMutation,
    replaceWorkspaceTasksMutation,
    generateUploadUrlMutation,
    finalizeProjectUploadAction,
    finalizePendingDraftAttachmentUploadAction,
    discardPendingUploadMutation,
    discardPendingUploadsForSessionMutation,
    removeProjectFileMutation,
    generateAvatarUploadUrlMutation,
    finalizeAvatarUploadMutation,
    removeAvatarMutation,
    saveNotificationPreferencesMutation,
    updateWorkspaceGeneralMutation,
    generateWorkspaceLogoUploadUrlMutation,
    finalizeWorkspaceLogoUploadMutation,
    generateBrandAssetUploadUrlMutation,
    finalizeBrandAssetUploadMutation,
    removeBrandAssetMutation,
    softDeleteWorkspaceMutation,
    updateAccountProfileAction,
    inviteWorkspaceMemberAction,
    resendWorkspaceInvitationAction,
    revokeWorkspaceInvitationAction,
    changeWorkspaceMemberRoleAction,
    removeWorkspaceMemberAction,
    reconcileWorkspaceInvitationsAction,
    reconcileWorkspaceOrganizationMembershipsAction,
    ensureOrganizationLinkAction,
  } = useDashboardApiHandlers();

  const viewerFallback = useMemo(() => ({
    name:
      [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim()
      || user?.email
      || "Unknown user",
    email: user?.email ?? "",
    avatarUrl: user?.profilePictureUrl ?? null,
  }), [user?.email, user?.firstName, user?.lastName, user?.profilePictureUrl]);

  const {
    snapshot,
    resolvedWorkspaceSlug,
    accountSettings,
    notificationSettings,
    companySettings,
    workspaceMembers,
    viewerIdentity,
    workspaces,
    projects,
    workspaceTasks,
    activeWorkspace,
    visibleProjects,
    allWorkspaceFiles,
    projectFilesByProject,
    contentModel,
    handleToggleSidebar,
    clearPendingHighlight,
  } = useDashboardData({
    isAuthenticated,
    activeWorkspaceSlug,
    setActiveWorkspaceSlug,
    isSettingsOpen,
    isSearchOpen,
    currentView,
    viewerFallback,
    setIsSidebarOpen,
    setPendingHighlight,
    navigateView,
  });

  const canCreateWorkspace = viewerIdentity.role === "owner";

  const handleSwitchWorkspace = useCallback((workspaceSlug: string) => {
    setActiveWorkspaceSlug(workspaceSlug);
    navigateView("tasks");
  }, [setActiveWorkspaceSlug, navigateView]);

  const handleCreateWorkspace = useCallback(() => {
    if (!canCreateWorkspace) {
      toast.error("Only workspace owners can create workspaces");
      return;
    }
    openCreateWorkspace();
  }, [canCreateWorkspace, openCreateWorkspace]);

  const {
    runWorkspaceSettingsReconciliation,
    handleSaveAccountSettings,
    handleUploadAccountAvatar,
    handleRemoveAccountAvatar,
    handleSaveSettingsNotifications,
    handleCreateWorkspaceSubmit,
    handleUpdateWorkspaceGeneral,
    handleUploadWorkspaceLogo,
    handleInviteWorkspaceMember,
    handleChangeWorkspaceMemberRole,
    handleRemoveWorkspaceMember,
    handleResendWorkspaceInvitation,
    handleRevokeWorkspaceInvitation,
    handleUploadWorkspaceBrandAsset,
    handleRemoveWorkspaceBrandAsset,
    handleSoftDeleteWorkspace,
  } = useDashboardWorkspaceActions({
    canCreateWorkspace,
    resolvedWorkspaceSlug,
    setActiveWorkspaceSlug,
    navigateToPath: (path) => navigate(path),
    navigateView,
    closeCreateWorkspace,
    createWorkspaceMutation,
    reconcileWorkspaceInvitationsAction,
    reconcileWorkspaceOrganizationMembershipsAction,
    updateAccountProfileAction,
    generateAvatarUploadUrlMutation,
    finalizeAvatarUploadMutation,
    removeAvatarMutation,
    saveNotificationPreferencesMutation,
    updateWorkspaceGeneralMutation,
    generateWorkspaceLogoUploadUrlMutation,
    finalizeWorkspaceLogoUploadMutation,
    inviteWorkspaceMemberAction,
    resendWorkspaceInvitationAction,
    revokeWorkspaceInvitationAction,
    changeWorkspaceMemberRoleAction,
    removeWorkspaceMemberAction,
    generateBrandAssetUploadUrlMutation,
    finalizeBrandAssetUploadMutation,
    removeBrandAssetMutation,
    softDeleteWorkspaceMutation,
    computeFileChecksumSha256,
    uploadFileToConvexStorage,
    asStorageId,
    asUserId,
    asBrandAssetId,
    omitUndefined,
  });

  useDashboardLifecycleEffects({
    snapshot,
    ensureDefaultWorkspace: ensureDefaultWorkspaceAction,
    setActiveWorkspaceSlug,
    preloadSearchPopupModule: loadSearchPopupModule,
    openSearch,
    locationPathname: location.pathname,
    projects,
    navigateToPath: (path, replace = false) => navigate(path, { replace }),
    resolvedWorkspaceSlug,
    companySettings,
    ensureOrganizationLinkAction,
    runWorkspaceSettingsReconciliation,
  });

  const {
    handleCreateProject,
    handleEditProject,
    handleViewReviewProject,
    handleUpdateComments,
    handleArchiveProject,
    handleUnarchiveProject,
    handleDeleteProject,
    handleUpdateProjectStatus,
    handleApproveReviewProject,
    handleUpdateProject,
    handleReplaceWorkspaceTasks,
  } = useDashboardProjectActions({
    activeWorkspaceId: activeWorkspace?.id,
    projects,
    visibleProjects,
    currentView,
    viewerIdentity,
    setEditProjectId,
    setEditDraftData,
    setReviewProject,
    setHighlightedArchiveProjectId,
    openCreateProject,
    navigateView,
    navigateToPath: (path) => navigate(path),
    createProjectMutation,
    updateProjectMutation,
    archiveProjectMutation,
    unarchiveProjectMutation,
    removeProjectMutation,
    setProjectStatusMutation,
    updateReviewCommentsMutation,
    replaceProjectTasksMutation,
    replaceWorkspaceTasksMutation,
    asPendingUploadId,
    omitUndefined,
  });

  const {
    handleCreateProjectFile,
    handleUploadDraftAttachment,
    handleRemoveDraftAttachment,
    handleDiscardDraftSessionUploads,
    handleRemoveProjectFile,
    handleDownloadProjectFile,
  } = useDashboardFileActions({
    activeWorkspaceId: activeWorkspace?.id,
    resolvedWorkspaceSlug,
    convexQuery: (query, args) => convex.query(query, args),
    generateUploadUrlMutation,
    finalizeProjectUploadAction,
    finalizePendingDraftAttachmentUploadAction,
    discardPendingUploadMutation,
    discardPendingUploadsForSessionMutation,
    removeProjectFileMutation,
    computeFileChecksumSha256,
    uploadFileToConvexStorage,
    asStorageId,
    asPendingUploadId,
    asProjectFileId,
  });

  const handleNavigateToArchiveProject = useCallback(
    (projectId: string) => navigateView(`archive-project:${projectId}`),
    [navigateView],
  );

  const dashboardCommands = useDashboardCommands({
    handleCreateProject,
    handleEditProject,
    handleViewReviewProject,
    handleArchiveProject,
    handleUnarchiveProject,
    handleDeleteProject,
    handleUpdateProjectStatus,
    handleCreateProjectFile,
    handleRemoveProjectFile,
    handleDownloadProjectFile,
    handleUploadDraftAttachment,
    handleRemoveDraftAttachment,
    handleDiscardDraftSessionUploads,
    handleOpenSettings,
    handleCloseSettings,
    handleSaveAccountSettings,
    handleUploadAccountAvatar,
    handleRemoveAccountAvatar,
    handleSaveSettingsNotifications,
    handleSwitchWorkspace,
    handleCreateWorkspace,
  });

  const mainContentFileActions = useMemo<MainContentFileActions>(
    () => ({
      create: dashboardCommands.file.createProjectFile,
      remove: dashboardCommands.file.removeProjectFile,
      download: dashboardCommands.file.downloadProjectFile,
    }),
    [dashboardCommands.file],
  );

  const createMainContentProjectActions = useCallback(
    (projectId: string): MainContentProjectActions => ({
      archive: dashboardCommands.project.archiveProject,
      unarchive: dashboardCommands.project.unarchiveProject,
      remove: dashboardCommands.project.deleteProject,
      updateStatus: dashboardCommands.project.updateProjectStatus,
      updateProject: (data) => handleUpdateProject(projectId, data),
    }),
    [dashboardCommands.project, handleUpdateProject],
  );

  const baseMainContentNavigationActions = useMemo<MainContentNavigationActions>(
    () => ({ navigate: navigateView }),
    [navigateView],
  );

  const {
    createProjectViewer,
    searchPopupOpenSettings,
    searchPopupHighlightNavigate,
    handleSearchIntent,
    handleCreateProjectIntent,
    handleSettingsIntent,
    handleSignOut,
  } = useDashboardPopupBindings({
    viewerIdentity,
    setPendingHighlight,
    openSettings: dashboardCommands.settings.openSettings,
    preloadSearchPopupModule: loadSearchPopupModule,
    preloadCreateProjectPopupModule: loadCreateProjectPopupModule,
    preloadSettingsPopupModule: loadSettingsPopupModule,
    signOut,
  });

  const { settingsAccountData, settingsNotificationsData, settingsCompanyData } = useDashboardSettingsData({
    accountSettings,
    notificationSettings,
    companySettings,
    fallbackAvatarUrl: viewerIdentity.avatarUrl ?? viewerFallback.avatarUrl,
    user,
  });

  const popupsProps: ComponentProps<typeof DashboardPopups> = {
    isSearchOpen,
    setIsSearchOpen,
    projects,
    allWorkspaceFiles,
    navigateView,
    openCreateProject,
    searchPopupOpenSettings,
    searchPopupHighlightNavigate,
    isCreateProjectOpen,
    closeCreateProject,
    dashboardCommands,
    createProjectViewer,
    editProjectId,
    editDraftData,
    reviewProject,
    handleUpdateComments,
    handleApproveReviewProject,
    isCreateWorkspaceOpen,
    closeCreateWorkspace,
    handleCreateWorkspaceSubmit,
    isSettingsOpen,
    settingsTab,
    activeWorkspace,
    settingsAccountData,
    settingsNotificationsData,
    settingsCompanyData,
    resolvedWorkspaceSlug,
    companySettings,
    handleUpdateWorkspaceGeneral,
    handleUploadWorkspaceLogo,
    handleInviteWorkspaceMember,
    handleChangeWorkspaceMemberRole,
    handleRemoveWorkspaceMember,
    handleResendWorkspaceInvitation,
    handleRevokeWorkspaceInvitation,
    handleUploadWorkspaceBrandAsset,
    handleRemoveWorkspaceBrandAsset,
    handleSoftDeleteWorkspace,
  };

  const chromeProps: ComponentProps<typeof DashboardChrome> = {
    isSidebarOpen,
    navigateView,
    openSearch,
    handleSearchIntent,
    currentView,
    openCreateProject,
    handleCreateProjectIntent,
    visibleProjects,
    viewerIdentity,
    activeWorkspace,
    workspaces,
    canCreateWorkspace,
    handleSettingsIntent,
    handleSignOut,
    onSwitchWorkspace: dashboardCommands.workspace.switchWorkspace,
    onCreateWorkspace: dashboardCommands.workspace.createWorkspace,
    onOpenSettings: dashboardCommands.settings.openSettings,
    onUpdateProjectStatus: dashboardCommands.project.updateProjectStatus,
    onEditProject: dashboardCommands.project.editProject,
    onViewReviewProject: dashboardCommands.project.viewReviewProject,
  };

  const contentProps: ComponentProps<typeof DashboardContent> = {
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
  };

  return {
    hasSnapshot: Boolean(snapshot),
    popupsProps,
    chromeProps,
    contentProps,
  };
}
