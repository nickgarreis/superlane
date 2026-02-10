import { useMemo } from "react";
import type {
  CreateProjectPayload,
  CreateProjectResult,
  DashboardCommands,
  SettingsTab,
} from "./types";
import type { ProjectData, ProjectFileTab } from "../types";
import { createProjectCommands } from "./commands/createProjectCommands";
import { createFileCommands } from "./commands/createFileCommands";
import { createSettingsCommands } from "./commands/createSettingsCommands";

type UseDashboardCommandsArgs = {
  handleCreateProject: (payload: CreateProjectPayload) => Promise<CreateProjectResult>;
  handleEditProject: (project: ProjectData) => void;
  handleViewReviewProject: (project: ProjectData) => void;
  handleArchiveProject: (projectId: string) => void;
  handleUnarchiveProject: (projectId: string) => void;
  handleDeleteProject: (projectId: string) => void;
  handleUpdateProjectStatus: (projectId: string, newStatus: string) => void;
  handleCreateProjectFile: (projectPublicId: string, tab: ProjectFileTab, file: File) => void;
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
    events: {
      eventNotifications: boolean;
      teamActivities: boolean;
      productUpdates: boolean;
    };
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
  useMemo(() => ({
    project: createProjectCommands({
      handleCreateProject,
      handleEditProject,
      handleViewReviewProject,
      handleArchiveProject,
      handleUnarchiveProject,
      handleDeleteProject,
      handleUpdateProjectStatus,
    }),
    file: createFileCommands({
      handleCreateProjectFile,
      handleRemoveProjectFile,
      handleDownloadProjectFile,
      handleUploadDraftAttachment,
      handleRemoveDraftAttachment,
      handleDiscardDraftSessionUploads,
    }),
    settings: createSettingsCommands({
      handleOpenSettings,
      handleCloseSettings,
      handleSaveAccountSettings,
      handleUploadAccountAvatar,
      handleRemoveAccountAvatar,
      handleSaveSettingsNotifications,
    }),
    workspace: {
      switchWorkspace: handleSwitchWorkspace,
      createWorkspace: handleCreateWorkspace,
    },
  } satisfies DashboardCommands), [
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
  ]);
