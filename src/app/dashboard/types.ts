import type { Dispatch, SetStateAction } from "react";
import type {
  FunctionArgs,
  FunctionReference,
  FunctionReturnType,
} from "convex/server";
import type { AppView } from "../lib/routing";
import type {
  ProjectData,
  ProjectDraftData,
  ProjectFileTab,
  ReviewComment,
  Task,
} from "../types";
export type PendingHighlight = {
  projectId: string;
  type: "task" | "file";
  taskId?: string;
  fileName?: string;
  fileTab?: string;
};
export type SettingsTab =
  | "Account"
  | "Notifications"
  | "Company"
  | "Workspace"
  | "Billing";

export type SettingsFocusTarget =
  | {
      kind: "member";
      userId?: string;
      email?: string;
    }
  | {
      kind: "invitation";
      email: string;
    }
  | {
      kind: "brandAsset";
      assetName: string;
    };

export const SETTINGS_TABS: readonly SettingsTab[] = [
  "Account",
  "Notifications",
  "Company",
  "Workspace",
  "Billing",
];

export const SETTINGS_FOCUS_KIND_QUERY_KEY = "focusKind";
export const SETTINGS_FOCUS_USER_ID_QUERY_KEY = "focusUserId";
export const SETTINGS_FOCUS_EMAIL_QUERY_KEY = "focusEmail";
export const SETTINGS_FOCUS_ASSET_NAME_QUERY_KEY = "focusAssetName";

const trimQueryValue = (value: string | null | undefined): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const parseSettingsFocusTarget = (
  searchParams: URLSearchParams,
): SettingsFocusTarget | null => {
  const focusKind = trimQueryValue(
    searchParams.get(SETTINGS_FOCUS_KIND_QUERY_KEY),
  );
  if (!focusKind) {
    return null;
  }

  if (focusKind === "member") {
    const userId = trimQueryValue(
      searchParams.get(SETTINGS_FOCUS_USER_ID_QUERY_KEY),
    );
    const email = trimQueryValue(
      searchParams.get(SETTINGS_FOCUS_EMAIL_QUERY_KEY),
    );
    if (!userId && !email) {
      return null;
    }
    return {
      kind: "member",
      ...(userId ? { userId } : {}),
      ...(email ? { email } : {}),
    };
  }

  if (focusKind === "invitation") {
    const email = trimQueryValue(searchParams.get(SETTINGS_FOCUS_EMAIL_QUERY_KEY));
    if (!email) {
      return null;
    }
    return {
      kind: "invitation",
      email,
    };
  }

  if (focusKind === "brandAsset") {
    const assetName = trimQueryValue(
      searchParams.get(SETTINGS_FOCUS_ASSET_NAME_QUERY_KEY),
    );
    if (!assetName) {
      return null;
    }
    return {
      kind: "brandAsset",
      assetName,
    };
  }

  return null;
};

export const applySettingsFocusTargetToSearchParams = (
  searchParams: URLSearchParams,
  focus: SettingsFocusTarget | null | undefined,
): void => {
  searchParams.delete(SETTINGS_FOCUS_KIND_QUERY_KEY);
  searchParams.delete(SETTINGS_FOCUS_USER_ID_QUERY_KEY);
  searchParams.delete(SETTINGS_FOCUS_EMAIL_QUERY_KEY);
  searchParams.delete(SETTINGS_FOCUS_ASSET_NAME_QUERY_KEY);

  if (!focus) {
    return;
  }

  if (focus.kind === "member") {
    const userId = trimQueryValue(focus.userId);
    const email = trimQueryValue(focus.email);
    if (!userId && !email) {
      return;
    }
    searchParams.set(SETTINGS_FOCUS_KIND_QUERY_KEY, "member");
    if (userId) {
      searchParams.set(SETTINGS_FOCUS_USER_ID_QUERY_KEY, userId);
    }
    if (email) {
      searchParams.set(SETTINGS_FOCUS_EMAIL_QUERY_KEY, email);
    }
    return;
  }

  if (focus.kind === "invitation") {
    const email = trimQueryValue(focus.email);
    if (!email) {
      return;
    }
    searchParams.set(SETTINGS_FOCUS_KIND_QUERY_KEY, "invitation");
    searchParams.set(SETTINGS_FOCUS_EMAIL_QUERY_KEY, email);
    return;
  }

  const assetName = trimQueryValue(focus.assetName);
  if (!assetName) {
    return;
  }
  searchParams.set(SETTINGS_FOCUS_KIND_QUERY_KEY, "brandAsset");
  searchParams.set(SETTINGS_FOCUS_ASSET_NAME_QUERY_KEY, assetName);
};
export const parseSettingsTab = (
  value: string | null | undefined,
): SettingsTab => {
  if (value && (SETTINGS_TABS as readonly string[]).includes(value)) {
    return value as SettingsTab;
  }
  return "Account";
};
export type DashboardMutationHandler<
  Ref extends FunctionReference<"mutation">,
> = (args: FunctionArgs<Ref>) => Promise<FunctionReturnType<Ref>>;
export type DashboardActionHandler<Ref extends FunctionReference<"action">> = (
  args: FunctionArgs<Ref>,
) => Promise<FunctionReturnType<Ref>>;
export type DashboardQueryInvoker = <Ref extends FunctionReference<"query">>(
  query: Ref,
  args: FunctionArgs<Ref>,
) => Promise<FunctionReturnType<Ref>>;
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
  createOrUpdateProject: (
    payload: CreateProjectPayload,
  ) => Promise<CreateProjectResult>;
  editProject: (project: ProjectData) => void;
  viewReviewProject: (project: ProjectData) => void;
  archiveProject: (projectId: string) => void;
  unarchiveProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;
  updateProjectStatus: (projectId: string, newStatus: string) => void;
}
export interface FileCommands {
  createProjectFile: (
    projectPublicId: string,
    tab: ProjectFileTab,
    file: File,
  ) => void;
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
  saveAccount: (payload: {
    firstName: string;
    lastName: string;
    email: string;
  }) => Promise<void>;
  uploadAccountAvatar: (file: File) => Promise<void>;
  removeAccountAvatar: () => Promise<void>;
  saveNotifications: (payload: {
    events: {
      eventNotifications: boolean;
      teamActivities: boolean;
      productUpdates: boolean;
    };
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
  handleCreateProject: (
    payload: CreateProjectPayload,
  ) => Promise<CreateProjectResult>;
  handleEditProject: (project: ProjectData) => void;
  handleViewReviewProject: (project: ProjectData) => void;
  handleUpdateComments: (
    projectId: string,
    comments: ReviewComment[],
  ) => Promise<unknown>;
  handleArchiveProject: (projectId: string) => void;
  handleUnarchiveProject: (projectId: string) => void;
  handleDeleteProject: (projectId: string) => void;
  handleUpdateProjectStatus: (projectId: string, newStatus: string) => void;
  handleApproveReviewProject: (projectId: string) => Promise<void>;
  handleUpdateProject: (projectId: string, data: Partial<ProjectData>) => void;
  handleReplaceWorkspaceTasks: (tasks: Task[]) => void;
}
export interface DashboardFileActions {
  handleCreateProjectFile: (
    projectPublicId: string,
    tab: ProjectFileTab,
    file: File,
  ) => void;
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
  backLabel?: string;
  back?: () => void;
}
export type DashboardContentModel =
  | { kind: "tasks" }
  | { kind: "archive" }
  | { kind: "activities" }
  | {
      kind: "main";
      project: ProjectData;
      backTo?: NavigationDestination;
      back?: () => void;
    }
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
