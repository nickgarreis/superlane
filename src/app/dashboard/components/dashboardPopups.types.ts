import type { AppView } from "../../lib/routing";
import type {
  DashboardCommands,
  MainContentFileActions,
  MainContentNavigationActions,
  MainContentProjectActions,
  SettingsFocusTarget,
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

export type SearchHighlight = {
  type: "task" | "file";
  taskId?: string;
  fileName?: string;
  fileTab?: string;
};

export type DashboardPopupsProps = {
  currentView: AppView;
  isSearchOpen: boolean;
  setIsSearchOpen: (value: boolean) => void;
  projects: Record<string, ProjectData>;
  chatProjects: Record<string, ProjectData>;
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
  openInbox: () => void;
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
  openCompletedProjectDetail: (
    projectId: string,
    options?: { replace?: boolean; from?: string },
  ) => void;
  backToCompletedProjectsList: () => void;
  isDraftPendingProjectsOpen: boolean;
  closeDraftPendingProjectsPopup: () => void;
  draftPendingProjectDetailId: string | null;
  draftPendingProjectDetailKind: "draft" | "pending" | null;
  openDraftPendingProjectDetail: (
    projectId: string,
    status: "Draft" | "Review",
    options?: { replace?: boolean; from?: string },
  ) => void;
  backToDraftPendingProjectsList: () => void;
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
  settingsFocusTarget: SettingsFocusTarget | null;
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
