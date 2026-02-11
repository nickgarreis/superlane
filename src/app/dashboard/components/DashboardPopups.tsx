import React, { Suspense } from "react";
import type { AppView } from "../../lib/routing";
import type {
  DashboardCommands,
  MainContentFileActions,
  MainContentNavigationActions,
  MainContentProjectActions,
  SettingsTab,
} from "../types";
import type {
  ProjectData,
  ProjectDraftData,
  ProjectFileData,
  ReviewComment,
  Task,
  ViewerIdentity,
  WorkspaceRole,
  WorkspaceMember,
  Workspace,
} from "../../types";
import type {
  AccountSettingsData,
  CompanySettingsData,
  NotificationSettingsData,
} from "../../components/settings-popup/types";
import { Z_LAYERS } from "../../lib/zLayers";
export const loadSearchPopupModule = () =>
  import("../../components/SearchPopup");
export const loadCreateProjectPopupModule = () =>
  import("../../components/CreateProjectPopup");
export const loadCreateWorkspacePopupModule = () =>
  import("../../components/CreateWorkspacePopup");
export const loadSettingsPopupModule = () =>
  import("../../components/SettingsPopup");
export const loadCompletedProjectsPopupModule = () =>
  import("../../components/CompletedProjectsPopup");
export const loadCompletedProjectDetailPopupModule = () =>
  import("../../components/CompletedProjectDetailPopup");
const LazySearchPopup = React.lazy(async () => {
  const module = await loadSearchPopupModule();
  return { default: module.SearchPopup };
});
const LazyCreateProjectPopup = React.lazy(async () => {
  const module = await loadCreateProjectPopupModule();
  return { default: module.CreateProjectPopup };
});
const LazyCreateWorkspacePopup = React.lazy(async () => {
  const module = await loadCreateWorkspacePopupModule();
  return { default: module.CreateWorkspacePopup };
});
const LazySettingsPopup = React.lazy(async () => {
  const module = await loadSettingsPopupModule();
  return { default: module.SettingsPopup };
});
const LazyCompletedProjectsPopup = React.lazy(async () => {
  const module = await loadCompletedProjectsPopupModule();
  return { default: module.CompletedProjectsPopup };
});
const LazyCompletedProjectDetailPopup = React.lazy(async () => {
  const module = await loadCompletedProjectDetailPopupModule();
  return { default: module.CompletedProjectDetailPopup };
});
const PopupLoadingFallback = (
  <div
    className="fixed inset-0 flex items-center justify-center bg-black/35 backdrop-blur-sm txt-tone-secondary font-app text-sm"
    style={{ zIndex: Z_LAYERS.modalPriority }}
  >
    Loading...
  </div>
);
type SearchHighlight = {
  type: "task" | "file";
  taskId?: string;
  fileName?: string;
  fileTab?: string;
};
type DashboardPopupsProps = {
  isSearchOpen: boolean;
  setIsSearchOpen: (value: boolean) => void;
  projects: Record<string, ProjectData>;
  workspaceTasks: Task[];
  tasksByProject: Record<string, Task[]>;
  allWorkspaceFiles: ProjectFileData[];
  workspaceFilesPaginationStatus:
    | "LoadingFirstPage"
    | "CanLoadMore"
    | "LoadingMore"
    | "Exhausted";
  loadMoreWorkspaceFiles: (numItems: number) => void;
  navigateView: (view: AppView) => void;
  openCreateProject: () => void;
  searchPopupOpenSettings: (tab?: string) => void;
  searchPopupHighlightNavigate: (
    projectId: string,
    highlight: SearchHighlight,
  ) => void;
  isCreateProjectOpen: boolean;
  closeCreateProject: () => void;
  dashboardCommands: DashboardCommands;
  createProjectViewer: {
    userId?: string;
    name: string;
    avatar: string;
    role?: WorkspaceRole;
  };
  editProjectId: string | null;
  editDraftData: ProjectDraftData | null;
  reviewProject: ProjectData | null;
  handleUpdateComments: (
    projectId: string,
    comments: ReviewComment[],
  ) => Promise<unknown>;
  handleApproveReviewProject: (projectId: string) => Promise<void>;
  isCreateWorkspaceOpen: boolean;
  closeCreateWorkspace: () => void;
  handleCreateWorkspaceSubmit: (payload: {
    name: string;
    logoFile?: File | null;
  }) => Promise<void>;
  isCompletedProjectsOpen: boolean;
  closeCompletedProjectsPopup: () => void;
  completedProjectDetailId: string | null;
  openCompletedProjectDetail: (projectId: string) => void;
  backToCompletedProjectsList: () => void;
  projectFilesByProject: Record<string, ProjectFileData[]>;
  projectFilesPaginationStatus:
    | "LoadingFirstPage"
    | "CanLoadMore"
    | "LoadingMore"
    | "Exhausted";
  loadMoreProjectFiles: (numItems: number) => void;
  workspaceMembers: WorkspaceMember[];
  viewerIdentity: ViewerIdentity;
  mainContentFileActions: MainContentFileActions;
  createMainContentProjectActions: (
    projectId: string,
  ) => MainContentProjectActions;
  baseMainContentNavigationActions: MainContentNavigationActions;
  isSettingsOpen: boolean;
  settingsTab: SettingsTab;
  activeWorkspace: Workspace | undefined;
  settingsAccountData: AccountSettingsData | null;
  settingsNotificationsData: NotificationSettingsData | null;
  settingsCompanyData: CompanySettingsData | null;
  resolvedWorkspaceSlug: string | null;
  companySummary?: unknown;
  handleUpdateWorkspaceGeneral: (payload: {
    name: string;
    logo?: string;
    logoColor?: string;
    logoText?: string;
  }) => Promise<void>;
  handleUploadWorkspaceLogo: (file: File) => Promise<void>;
  handleInviteWorkspaceMember: (payload: {
    email: string;
    role: "admin" | "member";
  }) => Promise<void>;
  handleChangeWorkspaceMemberRole: (payload: {
    userId: string;
    role: "admin" | "member";
  }) => Promise<void>;
  handleRemoveWorkspaceMember: (payload: { userId: string }) => Promise<void>;
  handleResendWorkspaceInvitation: (payload: {
    invitationId: string;
  }) => Promise<void>;
  handleRevokeWorkspaceInvitation: (payload: {
    invitationId: string;
  }) => Promise<void>;
  handleUploadWorkspaceBrandAsset: (file: File) => Promise<void>;
  handleRemoveWorkspaceBrandAsset: (payload: {
    brandAssetId: string;
  }) => Promise<void>;
  handleGetWorkspaceBrandAssetDownloadUrl: (payload: {
    brandAssetId: string;
  }) => Promise<string | null>;
  handleSoftDeleteWorkspace: () => Promise<void>;
};
export function DashboardPopups({
  isSearchOpen,
  setIsSearchOpen,
  projects,
  workspaceTasks,
  tasksByProject,
  allWorkspaceFiles,
  workspaceFilesPaginationStatus,
  loadMoreWorkspaceFiles,
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
  isCompletedProjectsOpen,
  closeCompletedProjectsPopup,
  completedProjectDetailId,
  openCompletedProjectDetail,
  backToCompletedProjectsList,
  projectFilesByProject,
  projectFilesPaginationStatus,
  loadMoreProjectFiles,
  workspaceMembers,
  viewerIdentity,
  mainContentFileActions,
  createMainContentProjectActions,
  baseMainContentNavigationActions,
  isSettingsOpen,
  settingsTab,
  activeWorkspace,
  settingsAccountData,
  settingsNotificationsData,
  settingsCompanyData,
  resolvedWorkspaceSlug,
  companySummary,
  handleUpdateWorkspaceGeneral,
  handleUploadWorkspaceLogo,
  handleInviteWorkspaceMember,
  handleChangeWorkspaceMemberRole,
  handleRemoveWorkspaceMember,
  handleResendWorkspaceInvitation,
  handleRevokeWorkspaceInvitation,
  handleUploadWorkspaceBrandAsset,
  handleRemoveWorkspaceBrandAsset,
  handleGetWorkspaceBrandAssetDownloadUrl,
  handleSoftDeleteWorkspace,
}: DashboardPopupsProps) {
  return (
    <>
      {isSearchOpen && (
        <Suspense fallback={PopupLoadingFallback}>
          <LazySearchPopup
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            projects={projects}
            workspaceTasks={workspaceTasks}
            files={allWorkspaceFiles}
            workspaceFilesPaginationStatus={workspaceFilesPaginationStatus}
            loadMoreWorkspaceFiles={loadMoreWorkspaceFiles}
            onNavigate={navigateView}
            onOpenCreateProject={openCreateProject}
            onOpenSettings={searchPopupOpenSettings}
            onHighlightNavigate={searchPopupHighlightNavigate}
          />
        </Suspense>
      )}
      {isCreateProjectOpen && (
        <Suspense fallback={PopupLoadingFallback}>
          <LazyCreateProjectPopup
            isOpen={isCreateProjectOpen}
            onClose={closeCreateProject}
            onCreate={dashboardCommands.project.createOrUpdateProject}
            user={createProjectViewer}
            editProjectId={editProjectId}
            initialDraftData={editDraftData}
            onDeleteDraft={dashboardCommands.project.deleteProject}
            reviewProject={reviewProject}
            onUpdateComments={handleUpdateComments}
            onApproveReviewProject={handleApproveReviewProject}
            onUploadAttachment={dashboardCommands.file.uploadDraftAttachment}
            onRemovePendingAttachment={
              dashboardCommands.file.removeDraftAttachment
            }
            onDiscardDraftUploads={
              dashboardCommands.file.discardDraftSessionUploads
            }
          />
        </Suspense>
      )}
      {isCreateWorkspaceOpen && (
        <Suspense fallback={PopupLoadingFallback}>
          <LazyCreateWorkspacePopup
            isOpen={isCreateWorkspaceOpen}
            onClose={closeCreateWorkspace}
            onCreate={handleCreateWorkspaceSubmit}
          />
        </Suspense>
      )}
      {isCompletedProjectsOpen && (
        <Suspense fallback={PopupLoadingFallback}>
          <LazyCompletedProjectsPopup
            isOpen={isCompletedProjectsOpen}
            onClose={closeCompletedProjectsPopup}
            projects={projects}
            viewerRole={viewerIdentity.role}
            completedProjectDetailId={completedProjectDetailId}
            onOpenProjectDetail={openCompletedProjectDetail}
            onBackToCompletedProjects={backToCompletedProjectsList}
            onUncompleteProject={(id) =>
              dashboardCommands.project.updateProjectStatus(id, "Active")
            }
            renderDetail={(project) => (
              <Suspense fallback={PopupLoadingFallback}>
                <LazyCompletedProjectDetailPopup
                  isOpen={isCompletedProjectsOpen}
                  onClose={closeCompletedProjectsPopup}
                  onBackToCompletedProjects={backToCompletedProjectsList}
                  project={project}
                  projectTasks={tasksByProject[project.id] ?? []}
                  projects={projects}
                  projectFiles={projectFilesByProject[project.id] ?? []}
                  projectFilesPaginationStatus={projectFilesPaginationStatus}
                  loadMoreProjectFiles={loadMoreProjectFiles}
                  workspaceMembers={workspaceMembers}
                  viewerIdentity={viewerIdentity}
                  fileActions={mainContentFileActions}
                  projectActions={createMainContentProjectActions(project.id)}
                  navigationActions={baseMainContentNavigationActions}
                />
              </Suspense>
            )}
          />
        </Suspense>
      )}
      {isSettingsOpen && (
        <Suspense fallback={PopupLoadingFallback}>
          <LazySettingsPopup
            isOpen={isSettingsOpen}
            onClose={dashboardCommands.settings.closeSettings}
            initialTab={settingsTab}
            activeWorkspace={activeWorkspace}
            account={settingsAccountData}
            notifications={settingsNotificationsData}
            company={settingsCompanyData}
            loadingCompany={
              isSettingsOpen &&
              !!resolvedWorkspaceSlug &&
              companySummary === undefined
            }
            onSaveAccount={dashboardCommands.settings.saveAccount}
            onUploadAvatar={dashboardCommands.settings.uploadAccountAvatar}
            onRemoveAvatar={dashboardCommands.settings.removeAccountAvatar}
            onSaveNotifications={dashboardCommands.settings.saveNotifications}
            onUpdateWorkspaceGeneral={handleUpdateWorkspaceGeneral}
            onUploadWorkspaceLogo={handleUploadWorkspaceLogo}
            onInviteMember={handleInviteWorkspaceMember}
            onChangeMemberRole={handleChangeWorkspaceMemberRole}
            onRemoveMember={handleRemoveWorkspaceMember}
            onResendInvitation={handleResendWorkspaceInvitation}
            onRevokeInvitation={handleRevokeWorkspaceInvitation}
            onUploadBrandAsset={handleUploadWorkspaceBrandAsset}
            onRemoveBrandAsset={handleRemoveWorkspaceBrandAsset}
            onGetBrandAssetDownloadUrl={handleGetWorkspaceBrandAssetDownloadUrl}
            onSoftDeleteWorkspace={handleSoftDeleteWorkspace}
          />
        </Suspense>
      )}
    </>
  );
}
