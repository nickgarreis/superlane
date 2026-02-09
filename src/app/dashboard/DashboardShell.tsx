import React, { Suspense, useCallback, useEffect, useMemo, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useAction, useConvex, useConvexAuth, useMutation } from "convex/react";
import { useAuth } from "@workos-inc/authkit-react";
import { AnimatePresence, motion } from "motion/react";
import { Toaster, toast } from "sonner";
import imgAvatar from "figma:asset/fea98b130b1d6a04ebf9c88afab5cd53fbd3e447.png";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Sidebar } from "../components/Sidebar";
import { pathToView, viewToPath } from "../lib/routing";
import { scheduleIdlePrefetch } from "../lib/prefetch";
import { DashboardContent } from "./components/DashboardContent";
import { useDashboardData } from "./useDashboardData";
import { useDashboardCommands } from "./useDashboardCommands";
import { useDashboardNavigation } from "./useDashboardNavigation";
import { useDashboardWorkspaceActions } from "./useDashboardWorkspaceActions";
import {
  parseSettingsTab,
  MainContentFileActions,
  MainContentNavigationActions,
  MainContentProjectActions,
} from "./types";
import { useDashboardProjectActions } from "./hooks/useDashboardProjectActions";
import { useDashboardFileActions } from "./hooks/useDashboardFileActions";
import { useDashboardSettingsData } from "./hooks/useDashboardSettingsData";

const bytesToHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((entry) => entry.toString(16).padStart(2, "0"))
    .join("");

const computeFileChecksumSha256 = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return bytesToHex(new Uint8Array(digest));
};

const asStorageId = (value: string) => value as Id<"_storage">;
const asUserId = (value: string) => value as Id<"users">;
const asBrandAssetId = (value: string) => value as Id<"workspaceBrandAssets">;
const asPendingUploadId = (value: string) => value as Id<"pendingFileUploads">;
const asProjectFileId = (value: string) => value as Id<"projectFiles">;
const omitUndefined = <T extends Record<string, unknown>>(value: T) =>
  Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  ) as T;

const uploadFileToConvexStorage = async (
  uploadUrl: string,
  file: File,
) => {
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }

  const payload = await response.json();
  if (!payload?.storageId) {
    throw new Error("Upload response missing storageId");
  }
  return String(payload.storageId);
};

const loadSearchPopupModule = () => import("../components/SearchPopup");
const loadCreateProjectPopupModule = () => import("../components/CreateProjectPopup");
const loadCreateWorkspacePopupModule = () => import("../components/CreateWorkspacePopup");
const loadSettingsPopupModule = () => import("../components/SettingsPopup");

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

const PopupLoadingFallback = (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 backdrop-blur-sm text-[#E8E8E8]/80 font-['Roboto',sans-serif] text-sm">
    Loading...
  </div>
);

export default function DashboardShell() {
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

  const ensureDefaultWorkspace = useAction(api.workspaces.ensureDefaultWorkspace);
  const createWorkspaceMutation = useAction(api.workspaces.create);
  const createProjectMutation = useMutation(api.projects.create);
  const updateProjectMutation = useMutation(api.projects.update);
  const archiveProjectMutation = useMutation(api.projects.archive);
  const unarchiveProjectMutation = useMutation(api.projects.unarchive);
  const removeProjectMutation = useMutation(api.projects.remove);
  const setProjectStatusMutation = useMutation(api.projects.setStatus);
  const updateReviewCommentsMutation = useMutation(api.projects.updateReviewComments);
  const replaceProjectTasksMutation = useMutation(api.tasks.replaceForProject);
  const replaceWorkspaceTasksMutation = useMutation(api.tasks.replaceForWorkspace);
  const generateUploadUrlMutation = useMutation(api.files.generateUploadUrl);
  const finalizeProjectUploadAction = useAction(api.files.finalizeProjectUpload);
  const finalizePendingDraftAttachmentUploadAction = useAction(api.files.finalizePendingDraftAttachmentUpload);
  const discardPendingUploadMutation = useMutation(api.files.discardPendingUpload);
  const discardPendingUploadsForSessionMutation = useMutation(api.files.discardPendingUploadsForSession);
  const removeProjectFileMutation = useMutation(api.files.remove);
  const generateAvatarUploadUrlMutation = useMutation(api.settings.generateAvatarUploadUrl);
  const finalizeAvatarUploadMutation = useMutation(api.settings.finalizeAvatarUpload);
  const removeAvatarMutation = useMutation(api.settings.removeAvatar);
  const saveNotificationPreferencesMutation = useMutation(api.settings.saveNotificationPreferences);
  const updateWorkspaceGeneralMutation = useMutation(api.settings.updateWorkspaceGeneral);
  const generateWorkspaceLogoUploadUrlMutation = useMutation(api.settings.generateWorkspaceLogoUploadUrl);
  const finalizeWorkspaceLogoUploadMutation = useMutation(api.settings.finalizeWorkspaceLogoUpload);
  const removeWorkspaceLogoMutation = useMutation(api.settings.removeWorkspaceLogo);
  const generateBrandAssetUploadUrlMutation = useMutation(api.settings.generateBrandAssetUploadUrl);
  const finalizeBrandAssetUploadMutation = useMutation(api.settings.finalizeBrandAssetUpload);
  const removeBrandAssetMutation = useMutation(api.settings.removeBrandAsset);
  const softDeleteWorkspaceMutation = useMutation(api.settings.softDeleteWorkspace);
  const updateAccountProfileAction = useAction(api.settings.updateAccountProfile);
  const inviteWorkspaceMemberAction = useAction(api.settings.inviteWorkspaceMember);
  const resendWorkspaceInvitationAction = useAction(api.settings.resendWorkspaceInvitation);
  const revokeWorkspaceInvitationAction = useAction(api.settings.revokeWorkspaceInvitation);
  const changeWorkspaceMemberRoleAction = useAction(api.settings.changeWorkspaceMemberRole);
  const removeWorkspaceMemberAction = useAction(api.settings.removeWorkspaceMember);
  const reconcileWorkspaceInvitationsAction = useAction(api.settings.reconcileWorkspaceInvitations);
  const reconcileWorkspaceOrganizationMembershipsAction = useAction(
    api.organizationSync.reconcileWorkspaceOrganizationMemberships,
  );
  const ensureOrganizationLinkAction = useAction(api.workspaces.ensureOrganizationLink);

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

  const defaultWorkspaceRequestedRef = useRef(false);
  const organizationLinkAttemptedWorkspacesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!snapshot) {
      return;
    }
    if (snapshot.workspaces.length > 0 || defaultWorkspaceRequestedRef.current) {
      return;
    }

    defaultWorkspaceRequestedRef.current = true;
    void ensureDefaultWorkspace({})
      .then((result) => {
        setActiveWorkspaceSlug(result.slug);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to create your default workspace");
      });
  }, [snapshot, ensureDefaultWorkspace, setActiveWorkspaceSlug]);

  useEffect(() => {
    const cancel = scheduleIdlePrefetch(() => loadSearchPopupModule());
    return cancel;
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openSearch]);

  const viewerName = viewerIdentity.name;
  const viewerAvatar = viewerIdentity.avatarUrl || imgAvatar;
  const canCreateWorkspace = viewerIdentity.role === "owner";

  const invalidRouteRef = useRef<string | null>(null);

  useEffect(() => {
    if (!snapshot) {
      return;
    }

    const routeView = pathToView(location.pathname);
    if (!routeView) {
      invalidRouteRef.current = null;
      return;
    }

    if (routeView.startsWith("project:")) {
      const projectId = routeView.split(":")[1];
      const project = projects[projectId];

      if (!project) {
        if (invalidRouteRef.current !== location.pathname) {
          invalidRouteRef.current = location.pathname;
          toast.error("Project not found");
        }
        navigate("/tasks", { replace: true });
        return;
      }

      if (project.archived) {
        navigate(viewToPath(`archive-project:${projectId}`), { replace: true });
        return;
      }

      invalidRouteRef.current = null;
      return;
    }

    if (routeView.startsWith("archive-project:")) {
      const projectId = routeView.split(":")[1];
      const project = projects[projectId];

      if (!project) {
        if (invalidRouteRef.current !== location.pathname) {
          invalidRouteRef.current = location.pathname;
          toast.error("Archived project not found");
        }
        navigate("/archive", { replace: true });
        return;
      }

      if (!project.archived) {
        navigate(viewToPath(`project:${projectId}`), { replace: true });
        return;
      }

      invalidRouteRef.current = null;
    }
  }, [snapshot, location.pathname, projects, navigate]);

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
    handleRemoveWorkspaceLogo,
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
    removeWorkspaceLogoMutation,
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

  useEffect(() => {
    if (!resolvedWorkspaceSlug || !companySettings) {
      return;
    }
    if (companySettings.capability.hasOrganizationLink || companySettings.viewerRole !== "owner") {
      return;
    }

    const attempted = organizationLinkAttemptedWorkspacesRef.current;
    if (attempted.has(resolvedWorkspaceSlug)) {
      return;
    }
    attempted.add(resolvedWorkspaceSlug);

    void ensureOrganizationLinkAction({ workspaceSlug: resolvedWorkspaceSlug })
      .then(async (result) => {
        if (!result.alreadyLinked) {
          await runWorkspaceSettingsReconciliation(resolvedWorkspaceSlug);
          toast.success("Workspace linked to WorkOS organization");
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to link workspace organization");
      });
  }, [
    resolvedWorkspaceSlug,
    companySettings,
    ensureOrganizationLinkAction,
    runWorkspaceSettingsReconciliation,
  ]);

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

  const searchPopupOpenSettings = useCallback(
    (tab?: string) => {
      dashboardCommands.settings.openSettings(parseSettingsTab(tab));
    },
    [dashboardCommands.settings],
  );

  const searchPopupHighlightNavigate = useCallback(
    (projectId: string, highlight: { type: "task" | "file"; taskId?: string; fileName?: string; fileTab?: string }) => {
      setPendingHighlight({ projectId, ...highlight });
    },
    [setPendingHighlight],
  );

  const createProjectViewer = useMemo(
    () => ({
      userId: viewerIdentity.userId ?? undefined,
      name: viewerName,
      avatar: viewerAvatar,
      role: viewerIdentity.role ?? undefined,
    }),
    [viewerAvatar, viewerIdentity.role, viewerIdentity.userId, viewerName],
  );

  const {
    settingsAccountData,
    settingsNotificationsData,
    settingsCompanyData,
  } = useDashboardSettingsData({
    accountSettings,
    notificationSettings,
    companySettings,
    user,
  });

  const handleSearchIntent = useCallback(() => {
    void loadSearchPopupModule();
  }, []);

  const handleCreateProjectIntent = useCallback(() => {
    void loadCreateProjectPopupModule();
  }, []);

  const handleSettingsIntent = useCallback(() => {
    void loadSettingsPopupModule();
  }, []);

  const handleSignOut = useCallback(() => {
    void signOut();
  }, [signOut]);

  if (!snapshot) {
    return (
      <div className="min-h-screen w-full bg-bg-base flex items-center justify-center text-white/60 font-['Roboto',sans-serif]">
        Loading workspace...
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen w-full bg-bg-base overflow-hidden font-['Roboto',sans-serif] antialiased text-[#E8E8E8]">
        {isSearchOpen && (
          <Suspense fallback={PopupLoadingFallback}>
            <LazySearchPopup
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              projects={projects}
              files={allWorkspaceFiles}
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
              onRemovePendingAttachment={dashboardCommands.file.removeDraftAttachment}
              onDiscardDraftUploads={dashboardCommands.file.discardDraftSessionUploads}
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
              loadingCompany={isSettingsOpen && !!resolvedWorkspaceSlug && companySettings === undefined}
              onSaveAccount={dashboardCommands.settings.saveAccount}
              onUploadAvatar={dashboardCommands.settings.uploadAccountAvatar}
              onRemoveAvatar={dashboardCommands.settings.removeAccountAvatar}
              onSaveNotifications={dashboardCommands.settings.saveNotifications}
              onUpdateWorkspaceGeneral={handleUpdateWorkspaceGeneral}
              onUploadWorkspaceLogo={handleUploadWorkspaceLogo}
              onRemoveWorkspaceLogo={handleRemoveWorkspaceLogo}
              onInviteMember={handleInviteWorkspaceMember}
              onChangeMemberRole={handleChangeWorkspaceMemberRole}
              onRemoveMember={handleRemoveWorkspaceMember}
              onResendInvitation={handleResendWorkspaceInvitation}
              onRevokeInvitation={handleRevokeWorkspaceInvitation}
              onUploadBrandAsset={handleUploadWorkspaceBrandAsset}
              onRemoveBrandAsset={handleRemoveWorkspaceBrandAsset}
              onSoftDeleteWorkspace={handleSoftDeleteWorkspace}
            />
          </Suspense>
        )}

        <Toaster
          position="bottom-right"
          theme="dark"
          gap={8}
          duration={3000}
          offset={20}
          toastOptions={{
            style: {
              background: "#1A1A1C",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              color: "#E8E8E8",
              fontFamily: "'Roboto', sans-serif",
              fontSize: "13px",
              padding: "14px 16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
              backdropFilter: "blur(12px)",
              gap: "12px",
            },
            classNames: {
              toast: "custom-toast",
              title: "custom-toast-title",
              icon: "custom-toast-icon",
              success: "custom-toast-success",
              error: "custom-toast-error",
              info: "custom-toast-info",
            },
          }}
        />

        <AnimatePresence mode="wait" initial={false}>
          {isSidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="h-full shrink-0 overflow-hidden"
            >
              <div className="w-[260px] h-full">
                <Sidebar
                  onNavigate={navigateView}
                  onSearch={openSearch}
                  onSearchIntent={handleSearchIntent}
                  currentView={currentView}
                  onOpenCreateProject={openCreateProject}
                  onOpenCreateProjectIntent={handleCreateProjectIntent}
                  projects={visibleProjects}
                  viewerIdentity={viewerIdentity}
                  activeWorkspace={activeWorkspace}
                  workspaces={workspaces}
                  onSwitchWorkspace={dashboardCommands.workspace.switchWorkspace}
                  onCreateWorkspace={dashboardCommands.workspace.createWorkspace}
                  canCreateWorkspace={canCreateWorkspace}
                  onOpenSettings={dashboardCommands.settings.openSettings}
                  onOpenSettingsIntent={handleSettingsIntent}
                  onArchiveProject={dashboardCommands.project.archiveProject}
                  onUnarchiveProject={dashboardCommands.project.unarchiveProject}
                  onUpdateProjectStatus={dashboardCommands.project.updateProjectStatus}
                  onEditProject={dashboardCommands.project.editProject}
                  onViewReviewProject={dashboardCommands.project.viewReviewProject}
                  onLogout={handleSignOut}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <DashboardContent
          contentModel={contentModel}
          handleToggleSidebar={handleToggleSidebar}
          isSidebarOpen={isSidebarOpen}
          visibleProjects={visibleProjects}
          workspaceTasks={workspaceTasks}
          handleReplaceWorkspaceTasks={handleReplaceWorkspaceTasks}
          workspaceMembers={workspaceMembers}
          viewerIdentity={viewerIdentity}
          handleNavigateToArchiveProject={handleNavigateToArchiveProject}
          handleUnarchiveProject={handleUnarchiveProject}
          handleDeleteProject={handleDeleteProject}
          highlightedArchiveProjectId={highlightedArchiveProjectId}
          setHighlightedArchiveProjectId={setHighlightedArchiveProjectId}
          projectFilesByProject={projectFilesByProject}
          mainContentFileActions={mainContentFileActions}
          createMainContentProjectActions={createMainContentProjectActions}
          baseMainContentNavigationActions={baseMainContentNavigationActions}
          pendingHighlight={pendingHighlight}
          clearPendingHighlight={clearPendingHighlight}
          openCreateProject={openCreateProject}
        />
      </div>
    </DndProvider>
  );
}
