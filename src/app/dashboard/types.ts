import type { Dispatch, SetStateAction } from "react";
import type { AppView } from "../lib/routing";
import type { ProjectData, ProjectDraftData, ProjectFileTab, ReviewComment, Task } from "../types";

export type PendingHighlight = {
  projectId: string;
  type: "task" | "file";
  taskId?: string;
  fileName?: string;
  fileTab?: string;
};

export type SettingsTab = "Account" | "Notifications" | "Company" | "Billing";

export const SETTINGS_TABS: readonly SettingsTab[] = ["Account", "Notifications", "Company", "Billing"];

export const parseSettingsTab = (value: string | null | undefined): SettingsTab => {
  if (value && (SETTINGS_TABS as readonly string[]).includes(value)) {
    return value as SettingsTab;
  }
  return "Account";
};

export interface MainContentProjectActions {
  archive?: (id: string) => void;
  unarchive?: (id: string) => void;
  remove?: (id: string) => void;
  updateStatus?: (id: string, status: string) => void;
  updateProject?: (data: Partial<ProjectData>) => void;
}

export interface MainContentFileActions {
  create: (projectPublicId: string, tab: ProjectFileTab, file: File) => void;
  remove: (fileId: string) => void;
  download: (fileId: string) => void;
}

export type CreateProjectPayload = {
  name?: string;
  description?: string;
  category?: string;
  scope?: string;
  deadlineEpochMs?: number | null;
  status?: string;
  draftData?: ProjectDraftData | null;
  _editProjectId?: string;
  attachmentPendingUploadIds?: string[];
};

export type CreateProjectResult = {
  publicId: string;
  mode: "create" | "update";
};

export interface ProjectCommands {
  createOrUpdateProject: (payload: CreateProjectPayload) => Promise<CreateProjectResult>;
  editProject: (project: ProjectData) => void;
  viewReviewProject: (project: ProjectData) => void;
  archiveProject: (projectId: string) => void;
  unarchiveProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;
  updateProjectStatus: (projectId: string, newStatus: string) => void;
}

export interface FileCommands {
  createProjectFile: (projectPublicId: string, tab: ProjectFileTab, file: File) => void;
  removeProjectFile: (fileId: string) => void;
  downloadProjectFile: (fileId: string) => void;
  uploadDraftAttachment: (
    file: File,
    draftSessionId: string,
  ) => Promise<{
    pendingUploadId: string;
    name: string;
    type: string;
    mimeType: string | null;
    sizeBytes: number;
  }>;
  removeDraftAttachment: (pendingUploadId: string) => Promise<void>;
  discardDraftSessionUploads: (draftSessionId: string) => Promise<void>;
}

export interface SettingsCommands {
  openSettings: (tab?: SettingsTab) => void;
  closeSettings: () => void;
  saveAccount: (payload: { firstName: string; lastName: string; email: string }) => Promise<void>;
  uploadAccountAvatar: (file: File) => Promise<void>;
  removeAccountAvatar: () => Promise<void>;
  saveNotifications: (payload: {
    channels: { email: boolean; desktop: boolean };
    events: { productUpdates: boolean; teamActivity: boolean };
  }) => Promise<void>;
}

export interface DashboardCommands {
  project: ProjectCommands;
  file: FileCommands;
  settings: SettingsCommands;
  workspace: {
    switchWorkspace: (workspaceSlug: string) => void;
    createWorkspace: () => void;
  };
}

export interface DashboardProjectActions {
  handleCreateProject: (payload: CreateProjectPayload) => Promise<CreateProjectResult>;
  handleEditProject: (project: ProjectData) => void;
  handleViewReviewProject: (project: ProjectData) => void;
  handleUpdateComments: (projectId: string, comments: ReviewComment[]) => Promise<unknown>;
  handleArchiveProject: (projectId: string) => void;
  handleUnarchiveProject: (projectId: string) => void;
  handleDeleteProject: (projectId: string) => void;
  handleUpdateProjectStatus: (projectId: string, newStatus: string) => void;
  handleApproveReviewProject: (projectId: string) => Promise<void>;
  handleUpdateProject: (projectId: string, data: Partial<ProjectData>) => void;
  handleReplaceWorkspaceTasks: (tasks: Task[]) => void;
}

export interface DashboardFileActions {
  handleCreateProjectFile: (projectPublicId: string, tab: ProjectFileTab, file: File) => void;
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
  handleRemoveProjectFile: (fileId: string) => void;
  handleDownloadProjectFile: (fileId: string) => void;
}

export type NavigationDestination = "archive";

export interface MainContentNavigationActions {
  navigate?: (view: AppView) => void;
  backTo?: NavigationDestination;
  back?: () => void;
}

export type DashboardContentModel =
  | { kind: "tasks" }
  | { kind: "archive" }
  | { kind: "main"; project: ProjectData; backTo?: NavigationDestination; back?: () => void }
  | { kind: "empty" };

export interface DashboardControllerArgs {
  currentView: AppView;
  projects: Record<string, ProjectData>;
  visibleProjects: Record<string, ProjectData>;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
  setPendingHighlight: Dispatch<SetStateAction<PendingHighlight | null>>;
  navigateView: (view: AppView) => void;
}

export interface DashboardControllerResult {
  contentModel: DashboardContentModel;
  toggleSidebar: () => void;
  clearPendingHighlight: () => void;
}
