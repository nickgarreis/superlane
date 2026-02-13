import React, { Suspense } from "react";
import type { DashboardPopupsProps } from "./dashboardPopups.types";
import { Z_LAYERS } from "../../lib/zLayers";
import type { AppView } from "../../lib/routing";
import type { ProjectData, ProjectDraftData } from "../../types";
import { categoryToService } from "../hooks/projectActionMappers";
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
export const loadDraftPendingProjectsPopupModule = () =>
  import("../../components/DraftPendingProjectsPopup");
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
const LazyDraftPendingProjectsPopup = React.lazy(async () => {
  const module = await loadDraftPendingProjectsPopupModule();
  return { default: module.DraftPendingProjectsPopup };
});
const PopupLoadingFallback = (
  <div
    className="fixed inset-0 flex items-center justify-center bg-black/35 backdrop-blur-sm txt-tone-secondary font-app text-sm"
    style={{ zIndex: Z_LAYERS.modalPriority }}
  >
    Loading...
  </div>
);

const buildDraftDataFromProject = (
  project: ProjectData,
): ProjectDraftData => ({
  selectedService:
    project.draftData?.selectedService ?? categoryToService(project.category),
  projectName: project.draftData?.projectName ?? project.name,
  selectedJob: project.draftData?.selectedJob ?? project.scope ?? "",
  description: project.draftData?.description ?? project.description,
  isAIEnabled: project.draftData?.isAIEnabled ?? true,
  deadlineEpochMs:
    project.draftData?.deadlineEpochMs ?? project.deadlineEpochMs ?? null,
  lastStep: project.draftData?.lastStep ?? 1,
});
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
  openInbox,
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
  isDraftPendingProjectsOpen,
  closeDraftPendingProjectsPopup,
  draftPendingProjectDetailId,
  draftPendingProjectDetailKind,
  openDraftPendingProjectDetail,
  backToDraftPendingProjectsList,
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
  settingsFocusTarget,
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
  const handleSearchNavigate = (view: AppView) => {
    if (view.startsWith("completed-project:")) {
      openCompletedProjectDetail(view.slice("completed-project:".length));
      return;
    }
    navigateView(view);
  };

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
            onNavigate={handleSearchNavigate}
            onOpenInbox={openInbox}
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
      {isDraftPendingProjectsOpen && (
        <Suspense fallback={PopupLoadingFallback}>
          <LazyDraftPendingProjectsPopup
            isOpen={isDraftPendingProjectsOpen}
            onClose={closeDraftPendingProjectsPopup}
            projects={projects}
            draftPendingProjectDetailId={draftPendingProjectDetailId}
            draftPendingProjectDetailKind={draftPendingProjectDetailKind}
            onOpenProjectDetail={openDraftPendingProjectDetail}
            onBackToDraftPendingProjects={backToDraftPendingProjectsList}
            renderDetail={(project) => (
              <Suspense fallback={PopupLoadingFallback}>
                {project.status.label === "Draft" ? (
                  <LazyCreateProjectPopup
                    isOpen={isDraftPendingProjectsOpen}
                    onClose={closeDraftPendingProjectsPopup}
                    onBackToDraftPendingProjects={backToDraftPendingProjectsList}
                    backToDraftPendingProjectsLabel="draft & pending projects"
                    onCreate={dashboardCommands.project.createOrUpdateProject}
                    user={createProjectViewer}
                    editProjectId={project.id}
                    initialDraftData={buildDraftDataFromProject(project)}
                    onDeleteDraft={dashboardCommands.project.deleteProject}
                    onUpdateComments={handleUpdateComments}
                    onApproveReviewProject={handleApproveReviewProject}
                    onUploadAttachment={
                      dashboardCommands.file.uploadDraftAttachment
                    }
                    onRemovePendingAttachment={
                      dashboardCommands.file.removeDraftAttachment
                    }
                    onDiscardDraftUploads={
                      dashboardCommands.file.discardDraftSessionUploads
                    }
                  />
                ) : (
                  <LazyCreateProjectPopup
                    isOpen={isDraftPendingProjectsOpen}
                    onClose={closeDraftPendingProjectsPopup}
                    onBackToDraftPendingProjects={backToDraftPendingProjectsList}
                    backToDraftPendingProjectsLabel="draft & pending projects"
                    onCreate={dashboardCommands.project.createOrUpdateProject}
                    user={createProjectViewer}
                    onDeleteDraft={dashboardCommands.project.deleteProject}
                    reviewProject={project}
                    onUpdateComments={handleUpdateComments}
                    onApproveReviewProject={handleApproveReviewProject}
                  />
                )}
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
            initialFocusTarget={settingsFocusTarget}
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
            onRequestPasswordReset={
              dashboardCommands.settings.requestPasswordReset
            }
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
