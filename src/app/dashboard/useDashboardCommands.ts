import { useMemo } from "react";
import type { DashboardCommands, SettingsTab } from "./types";
import type { ProjectData, ProjectDraftData } from "../types";

type UseDashboardCommandsArgs = {
  handleCreateProject: (payload: {
    name?: string;
    description?: string;
    category?: string;
    scope?: string;
    deadlineEpochMs?: number | null;
    status?: string;
    draftData?: ProjectDraftData | null;
    _editProjectId?: string;
    _generatedId?: string;
    attachmentPendingUploadIds?: string[];
  }) => Promise<void>;
  handleEditProject: (project: ProjectData) => void;
  handleViewReviewProject: (project: ProjectData) => void;
  handleArchiveProject: (projectId: string) => void;
  handleUnarchiveProject: (projectId: string) => void;
  handleDeleteProject: (projectId: string) => void;
  handleUpdateProjectStatus: (projectId: string, newStatus: string) => void;
  handleCreateProjectFile: (projectPublicId: string, tab: "Assets" | "Contract" | "Attachments", file: File) => void;
  handleRemoveProjectFile: (fileId: string) => void;
  handleDownloadProjectFile: (fileId: string) => void;
  handleUploadDraftAttachment: (
    file: File,
    draftSessionId: string,
  ) => Promise<{
    pendingUploadId: string;
    name: string;
    type: string;
    mimeType: string | null;
    sizeBytes: number;
  }>;
  handleRemoveDraftAttachment: (pendingUploadId: string) => Promise<void>;
  handleDiscardDraftSessionUploads: (draftSessionId: string) => Promise<void>;
  handleOpenSettings: (tab?: SettingsTab) => void;
  handleCloseSettings: () => void;
  handleSaveAccountSettings: (payload: { firstName: string; lastName: string; email: string }) => Promise<void>;
  handleUploadAccountAvatar: (file: File) => Promise<void>;
  handleRemoveAccountAvatar: () => Promise<void>;
  handleSaveSettingsNotifications: (payload: {
    channels: { email: boolean; desktop: boolean };
    events: { productUpdates: boolean; teamActivity: boolean };
  }) => Promise<void>;
  handleSwitchWorkspace: (workspaceSlug: string) => void;
  handleCreateWorkspace: () => void;
};

export const useDashboardCommands = ({
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
}: UseDashboardCommandsArgs): DashboardCommands =>
  useMemo(
    () => ({
      project: {
        createOrUpdateProject: handleCreateProject,
        editProject: handleEditProject,
        viewReviewProject: handleViewReviewProject,
        archiveProject: handleArchiveProject,
        unarchiveProject: handleUnarchiveProject,
        deleteProject: handleDeleteProject,
        updateProjectStatus: handleUpdateProjectStatus,
      },
      file: {
        createProjectFile: handleCreateProjectFile,
        removeProjectFile: handleRemoveProjectFile,
        downloadProjectFile: handleDownloadProjectFile,
        uploadDraftAttachment: handleUploadDraftAttachment,
        removeDraftAttachment: handleRemoveDraftAttachment,
        discardDraftSessionUploads: handleDiscardDraftSessionUploads,
      },
      settings: {
        openSettings: handleOpenSettings,
        closeSettings: handleCloseSettings,
        saveAccount: handleSaveAccountSettings,
        uploadAccountAvatar: handleUploadAccountAvatar,
        removeAccountAvatar: handleRemoveAccountAvatar,
        saveNotifications: handleSaveSettingsNotifications,
      },
      workspace: {
        switchWorkspace: handleSwitchWorkspace,
        createWorkspace: handleCreateWorkspace,
      },
    }),
    [
      handleArchiveProject,
      handleCloseSettings,
      handleCreateProject,
      handleCreateProjectFile,
      handleCreateWorkspace,
      handleDeleteProject,
      handleDiscardDraftSessionUploads,
      handleDownloadProjectFile,
      handleEditProject,
      handleOpenSettings,
      handleRemoveAccountAvatar,
      handleRemoveDraftAttachment,
      handleRemoveProjectFile,
      handleSaveAccountSettings,
      handleSaveSettingsNotifications,
      handleSwitchWorkspace,
      handleUnarchiveProject,
      handleUpdateProjectStatus,
      handleUploadAccountAvatar,
      handleUploadDraftAttachment,
      handleViewReviewProject,
    ],
  );
