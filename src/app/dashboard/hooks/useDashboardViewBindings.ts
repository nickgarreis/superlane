import { useMemo, type ComponentProps } from "react";
import { DashboardChrome } from "../components/DashboardChrome";
import { DashboardContent } from "../components/DashboardContent";
import {
  DashboardPopups,
  loadCreateProjectPopupModule,
  loadSearchPopupModule,
  loadSettingsPopupModule,
} from "../components/DashboardPopups";
import { useDashboardPopupBindings } from "./useDashboardPopupBindings";
import { useDashboardSettingsData } from "./useDashboardSettingsData";
import type { DashboardActionLayer } from "./useDashboardActionLayer";
import type { DashboardDataLayer } from "./useDashboardDataLayer";

type DashboardViewBindings = {
  hasSnapshot: boolean;
  popupsProps: ComponentProps<typeof DashboardPopups>;
  chromeProps: ComponentProps<typeof DashboardChrome>;
  contentProps: ComponentProps<typeof DashboardContent>;
};

export function useDashboardViewBindings(
  dataLayer: DashboardDataLayer,
  actionLayer: DashboardActionLayer,
): DashboardViewBindings {
  const { user, signOut, navigation, data, viewerFallback, canCreateWorkspace, workspaceActions } = dataLayer;
  const { dashboardCommands, projectActions, mainContentFileActions, createMainContentProjectActions, baseMainContentNavigationActions, handleNavigateToArchiveProject } = actionLayer;

  const {
    createProjectViewer,
    searchPopupOpenSettings,
    searchPopupHighlightNavigate,
    handleSearchIntent,
    handleCreateProjectIntent,
    handleSettingsIntent,
    handleSignOut,
  } = useDashboardPopupBindings({
    viewerIdentity: data.viewerIdentity,
    setPendingHighlight: navigation.setPendingHighlight,
    openSettings: dashboardCommands.settings.openSettings,
    preloadSearchPopupModule: loadSearchPopupModule,
    preloadCreateProjectPopupModule: loadCreateProjectPopupModule,
    preloadSettingsPopupModule: loadSettingsPopupModule,
    signOut,
  });

  const { settingsAccountData, settingsNotificationsData, settingsCompanyData } = useDashboardSettingsData({
    accountSettings: data.accountSettings,
    notificationSettings: data.notificationSettings,
    companySettings: data.companySettings,
    fallbackAvatarUrl: data.viewerIdentity.avatarUrl ?? viewerFallback.avatarUrl,
    user,
  });

  const popupsProps = useMemo<ComponentProps<typeof DashboardPopups>>(
    () => ({
      isSearchOpen: navigation.isSearchOpen,
      setIsSearchOpen: navigation.setIsSearchOpen,
      projects: data.projects,
      allWorkspaceFiles: data.allWorkspaceFiles,
      navigateView: navigation.navigateView,
      openCreateProject: navigation.openCreateProject,
      searchPopupOpenSettings,
      searchPopupHighlightNavigate,
      isCreateProjectOpen: navigation.isCreateProjectOpen,
      closeCreateProject: navigation.closeCreateProject,
      dashboardCommands,
      createProjectViewer,
      editProjectId: navigation.editProjectId,
      editDraftData: navigation.editDraftData,
      reviewProject: navigation.reviewProject,
      handleUpdateComments: projectActions.handleUpdateComments,
      handleApproveReviewProject: projectActions.handleApproveReviewProject,
      isCreateWorkspaceOpen: navigation.isCreateWorkspaceOpen,
      closeCreateWorkspace: navigation.closeCreateWorkspace,
      handleCreateWorkspaceSubmit: workspaceActions.handleCreateWorkspaceSubmit,
      isSettingsOpen: navigation.isSettingsOpen,
      settingsTab: navigation.settingsTab,
      activeWorkspace: data.activeWorkspace,
      settingsAccountData,
      settingsNotificationsData,
      settingsCompanyData,
      resolvedWorkspaceSlug: data.resolvedWorkspaceSlug,
      companySettings: data.companySettings,
      handleUpdateWorkspaceGeneral: workspaceActions.handleUpdateWorkspaceGeneral,
      handleUploadWorkspaceLogo: workspaceActions.handleUploadWorkspaceLogo,
      handleInviteWorkspaceMember: workspaceActions.handleInviteWorkspaceMember,
      handleChangeWorkspaceMemberRole: workspaceActions.handleChangeWorkspaceMemberRole,
      handleRemoveWorkspaceMember: workspaceActions.handleRemoveWorkspaceMember,
      handleResendWorkspaceInvitation: workspaceActions.handleResendWorkspaceInvitation,
      handleRevokeWorkspaceInvitation: workspaceActions.handleRevokeWorkspaceInvitation,
      handleUploadWorkspaceBrandAsset: workspaceActions.handleUploadWorkspaceBrandAsset,
      handleRemoveWorkspaceBrandAsset: workspaceActions.handleRemoveWorkspaceBrandAsset,
      handleSoftDeleteWorkspace: workspaceActions.handleSoftDeleteWorkspace,
    }),
    [
      createProjectViewer,
      dashboardCommands,
      data.activeWorkspace,
      data.allWorkspaceFiles,
      data.companySettings,
      data.projects,
      data.resolvedWorkspaceSlug,
      navigation.closeCreateProject,
      navigation.closeCreateWorkspace,
      navigation.editDraftData,
      navigation.editProjectId,
      navigation.isCreateProjectOpen,
      navigation.isCreateWorkspaceOpen,
      navigation.isSearchOpen,
      navigation.isSettingsOpen,
      navigation.navigateView,
      navigation.openCreateProject,
      navigation.reviewProject,
      navigation.setIsSearchOpen,
      navigation.settingsTab,
      projectActions.handleApproveReviewProject,
      projectActions.handleUpdateComments,
      searchPopupHighlightNavigate,
      searchPopupOpenSettings,
      settingsAccountData,
      settingsCompanyData,
      settingsNotificationsData,
      workspaceActions.handleChangeWorkspaceMemberRole,
      workspaceActions.handleCreateWorkspaceSubmit,
      workspaceActions.handleInviteWorkspaceMember,
      workspaceActions.handleRemoveWorkspaceBrandAsset,
      workspaceActions.handleRemoveWorkspaceMember,
      workspaceActions.handleResendWorkspaceInvitation,
      workspaceActions.handleRevokeWorkspaceInvitation,
      workspaceActions.handleSoftDeleteWorkspace,
      workspaceActions.handleUpdateWorkspaceGeneral,
      workspaceActions.handleUploadWorkspaceBrandAsset,
      workspaceActions.handleUploadWorkspaceLogo,
    ],
  );

  const chromeProps = useMemo<ComponentProps<typeof DashboardChrome>>(
    () => ({
      isSidebarOpen: navigation.isSidebarOpen,
      navigateView: navigation.navigateView,
      openSearch: navigation.openSearch,
      handleSearchIntent,
      currentView: navigation.currentView,
      openCreateProject: navigation.openCreateProject,
      handleCreateProjectIntent,
      visibleProjects: data.visibleProjects,
      viewerIdentity: data.viewerIdentity,
      activeWorkspace: data.activeWorkspace,
      workspaces: data.workspaces,
      canCreateWorkspace,
      handleSettingsIntent,
      handleSignOut,
      onSwitchWorkspace: dashboardCommands.workspace.switchWorkspace,
      onCreateWorkspace: dashboardCommands.workspace.createWorkspace,
      onOpenSettings: dashboardCommands.settings.openSettings,
      onUpdateProjectStatus: dashboardCommands.project.updateProjectStatus,
      onEditProject: dashboardCommands.project.editProject,
      onViewReviewProject: dashboardCommands.project.viewReviewProject,
    }),
    [
      canCreateWorkspace,
      dashboardCommands.project.editProject,
      dashboardCommands.project.updateProjectStatus,
      dashboardCommands.project.viewReviewProject,
      dashboardCommands.settings.openSettings,
      dashboardCommands.workspace.createWorkspace,
      dashboardCommands.workspace.switchWorkspace,
      data.activeWorkspace,
      data.viewerIdentity,
      data.visibleProjects,
      data.workspaces,
      handleCreateProjectIntent,
      handleSearchIntent,
      handleSettingsIntent,
      handleSignOut,
      navigation.currentView,
      navigation.isSidebarOpen,
      navigation.navigateView,
      navigation.openCreateProject,
      navigation.openSearch,
    ],
  );

  const contentProps = useMemo<ComponentProps<typeof DashboardContent>>(
    () => ({
      contentModel: data.contentModel,
      handleToggleSidebar: data.handleToggleSidebar,
      isSidebarOpen: navigation.isSidebarOpen,
      visibleProjects: data.visibleProjects,
      workspaceTasks: data.workspaceTasks,
      handleReplaceWorkspaceTasks: projectActions.handleReplaceWorkspaceTasks,
      workspaceMembers: data.workspaceMembers,
      viewerIdentity: data.viewerIdentity,
      handleNavigateToArchiveProject,
      handleUnarchiveProject: projectActions.handleUnarchiveProject,
      handleDeleteProject: projectActions.handleDeleteProject,
      highlightedArchiveProjectId: navigation.highlightedArchiveProjectId,
      setHighlightedArchiveProjectId: navigation.setHighlightedArchiveProjectId,
      projectFilesByProject: data.projectFilesByProject,
      mainContentFileActions,
      createMainContentProjectActions,
      baseMainContentNavigationActions,
      pendingHighlight: navigation.pendingHighlight,
      clearPendingHighlight: data.clearPendingHighlight,
      openCreateProject: navigation.openCreateProject,
    }),
    [
      baseMainContentNavigationActions,
      createMainContentProjectActions,
      data.clearPendingHighlight,
      data.contentModel,
      data.handleToggleSidebar,
      data.projectFilesByProject,
      data.viewerIdentity,
      data.visibleProjects,
      data.workspaceMembers,
      data.workspaceTasks,
      handleNavigateToArchiveProject,
      mainContentFileActions,
      navigation.highlightedArchiveProjectId,
      navigation.isSidebarOpen,
      navigation.openCreateProject,
      navigation.pendingHighlight,
      navigation.setHighlightedArchiveProjectId,
      projectActions.handleDeleteProject,
      projectActions.handleReplaceWorkspaceTasks,
      projectActions.handleUnarchiveProject,
    ],
  );

  return {
    hasSnapshot: Boolean(data.snapshot),
    popupsProps,
    chromeProps,
    contentProps,
  };
}
