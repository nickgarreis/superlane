import { type ComponentProps } from "react";
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

  const popupsProps: ComponentProps<typeof DashboardPopups> = {
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
  };

  const chromeProps: ComponentProps<typeof DashboardChrome> = {
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
  };

  const contentProps: ComponentProps<typeof DashboardContent> = {
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
  };

  return {
    hasSnapshot: Boolean(data.snapshot),
    popupsProps,
    chromeProps,
    contentProps,
  };
}
