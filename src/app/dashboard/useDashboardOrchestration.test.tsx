/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { AppView } from "../lib/routing";
import type { ProjectData, ViewerIdentity, Workspace } from "../types";
import { useDashboardOrchestration } from "./useDashboardOrchestration";

const useAuthMock = vi.fn();
const useConvexAuthMock = vi.fn();
const useConvexMock = vi.fn();

const useDashboardNavigationMock = vi.fn();
const useDashboardApiHandlersMock = vi.fn();
const useDashboardDataMock = vi.fn();
const useDashboardWorkspaceActionsMock = vi.fn();
const useDashboardProjectActionsMock = vi.fn();
const useDashboardFileActionsMock = vi.fn();
const useDashboardCommandsMock = vi.fn();
const useDashboardPopupBindingsMock = vi.fn();
const useDashboardSettingsDataMock = vi.fn();
const useDashboardLifecycleEffectsMock = vi.fn();

let navigationState: ReturnType<typeof buildNavigationState>;
let projectActionsState: ReturnType<typeof buildProjectActionsState>;
let dashboardCommandsState: ReturnType<typeof buildDashboardCommandsState>;

vi.mock("@workos-inc/authkit-react", () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock("convex/react", () => ({
  useConvexAuth: () => useConvexAuthMock(),
  useConvex: () => useConvexMock(),
}));

vi.mock("./useDashboardNavigation", () => ({
  useDashboardNavigation: (...args: unknown[]) => useDashboardNavigationMock(...args),
}));

vi.mock("./hooks/useDashboardApiHandlers", () => ({
  useDashboardApiHandlers: (...args: unknown[]) => useDashboardApiHandlersMock(...args),
}));

vi.mock("./useDashboardData", () => ({
  useDashboardData: (...args: unknown[]) => useDashboardDataMock(...args),
}));

vi.mock("./useDashboardWorkspaceActions", () => ({
  useDashboardWorkspaceActions: (...args: unknown[]) => useDashboardWorkspaceActionsMock(...args),
}));

vi.mock("./hooks/useDashboardProjectActions", () => ({
  useDashboardProjectActions: (...args: unknown[]) => useDashboardProjectActionsMock(...args),
}));

vi.mock("./hooks/useDashboardFileActions", () => ({
  useDashboardFileActions: (...args: unknown[]) => useDashboardFileActionsMock(...args),
}));

vi.mock("./useDashboardCommands", () => ({
  useDashboardCommands: (...args: unknown[]) => useDashboardCommandsMock(...args),
}));

vi.mock("./hooks/useDashboardPopupBindings", () => ({
  useDashboardPopupBindings: (...args: unknown[]) => useDashboardPopupBindingsMock(...args),
}));

vi.mock("./hooks/useDashboardSettingsData", () => ({
  useDashboardSettingsData: (...args: unknown[]) => useDashboardSettingsDataMock(...args),
}));

vi.mock("./hooks/useDashboardLifecycleEffects", () => ({
  useDashboardLifecycleEffects: (...args: unknown[]) => useDashboardLifecycleEffectsMock(...args),
}));

const BASE_PROJECT: ProjectData = {
  id: "project-1",
  name: "Project",
  description: "Desc",
  creator: { name: "Owner", avatar: "" },
  status: {
    label: "Active",
    color: "#58AFFF",
    bgColor: "rgba(88,175,255,0.12)",
    dotColor: "#58AFFF",
  },
  category: "Web",
  archived: false,
  tasks: [],
};

const OWNER_VIEWER: ViewerIdentity = {
  userId: "user-1",
  workosUserId: "workos-1",
  name: "Owner",
  email: "owner@example.com",
  avatarUrl: null,
  role: "owner",
};

const WORKSPACE: Workspace = {
  id: "ws-1",
  slug: "primary",
  name: "Primary",
  plan: "starter",
};

const buildNavigationState = () => ({
  location: { pathname: "/tasks" },
  navigate: vi.fn(),
  currentView: "tasks" as AppView,
  settingsTab: "Account",
  isSettingsOpen: false,
  isSidebarOpen: true,
  setIsSidebarOpen: vi.fn(),
  isSearchOpen: false,
  setIsSearchOpen: vi.fn(),
  isCreateProjectOpen: false,
  isCreateWorkspaceOpen: false,
  highlightedArchiveProjectId: null,
  setHighlightedArchiveProjectId: vi.fn(),
  pendingHighlight: null,
  setPendingHighlight: vi.fn(),
  editProjectId: null,
  setEditProjectId: vi.fn(),
  editDraftData: null,
  setEditDraftData: vi.fn(),
  reviewProject: null,
  setReviewProject: vi.fn(),
  activeWorkspaceSlug: "primary",
  setActiveWorkspaceSlug: vi.fn(),
  navigateView: vi.fn(),
  openSearch: vi.fn(),
  openCreateProject: vi.fn(),
  closeCreateProject: vi.fn(),
  openCreateWorkspace: vi.fn(),
  closeCreateWorkspace: vi.fn(),
  handleOpenSettings: vi.fn(),
  handleCloseSettings: vi.fn(),
});

const buildApiHandlers = () => ({
  ensureDefaultWorkspaceAction: vi.fn(),
  createWorkspaceMutation: vi.fn(),
  createProjectMutation: vi.fn(),
  updateProjectMutation: vi.fn(),
  archiveProjectMutation: vi.fn(),
  unarchiveProjectMutation: vi.fn(),
  removeProjectMutation: vi.fn(),
  setProjectStatusMutation: vi.fn(),
  updateReviewCommentsMutation: vi.fn(),
  replaceProjectTasksMutation: vi.fn(),
  replaceWorkspaceTasksMutation: vi.fn(),
  applyTaskDiffMutation: vi.fn(),
  generateUploadUrlMutation: vi.fn(),
  finalizeProjectUploadAction: vi.fn(),
  finalizePendingDraftAttachmentUploadAction: vi.fn(),
  discardPendingUploadMutation: vi.fn(),
  discardPendingUploadsForSessionMutation: vi.fn(),
  removeProjectFileMutation: vi.fn(),
  generateAvatarUploadUrlMutation: vi.fn(),
  finalizeAvatarUploadMutation: vi.fn(),
  removeAvatarMutation: vi.fn(),
  saveNotificationPreferencesMutation: vi.fn(),
  updateWorkspaceGeneralMutation: vi.fn(),
  generateWorkspaceLogoUploadUrlMutation: vi.fn(),
  finalizeWorkspaceLogoUploadMutation: vi.fn(),
  generateBrandAssetUploadUrlMutation: vi.fn(),
  finalizeBrandAssetUploadMutation: vi.fn(),
  removeBrandAssetMutation: vi.fn(),
  softDeleteWorkspaceMutation: vi.fn(),
  updateAccountProfileAction: vi.fn(),
  inviteWorkspaceMemberAction: vi.fn(),
  resendWorkspaceInvitationAction: vi.fn(),
  revokeWorkspaceInvitationAction: vi.fn(),
  changeWorkspaceMemberRoleAction: vi.fn(),
  removeWorkspaceMemberAction: vi.fn(),
  reconcileWorkspaceInvitationsAction: vi.fn(),
  reconcileWorkspaceOrganizationMembershipsAction: vi.fn(),
  ensureOrganizationLinkAction: vi.fn(),
});

const buildProjectActionsState = () => ({
  handleCreateProject: vi.fn(),
  handleEditProject: vi.fn(),
  handleViewReviewProject: vi.fn(),
  handleUpdateComments: vi.fn(),
  handleArchiveProject: vi.fn(),
  handleUnarchiveProject: vi.fn(),
  handleDeleteProject: vi.fn(),
  handleUpdateProjectStatus: vi.fn(),
  handleApproveReviewProject: vi.fn(),
  handleUpdateProject: vi.fn(),
  handleReplaceWorkspaceTasks: vi.fn(),
});

const buildDashboardCommandsState = () => ({
  project: {
    archiveProject: vi.fn(),
    unarchiveProject: vi.fn(),
    deleteProject: vi.fn(),
    updateProjectStatus: vi.fn(),
    editProject: vi.fn(),
    viewReviewProject: vi.fn(),
  },
  file: {
    createProjectFile: vi.fn(),
    removeProjectFile: vi.fn(),
    downloadProjectFile: vi.fn(),
    uploadDraftAttachment: vi.fn(),
    removeDraftAttachment: vi.fn(),
    discardDraftSessionUploads: vi.fn(),
  },
  settings: {
    openSettings: vi.fn(),
    closeSettings: vi.fn(),
    saveAccount: vi.fn(),
    uploadAccountAvatar: vi.fn(),
    removeAccountAvatar: vi.fn(),
    saveNotifications: vi.fn(),
  },
  workspace: {
    switchWorkspace: vi.fn(),
    createWorkspace: vi.fn(),
  },
});

const buildDashboardData = (overrides?: Partial<Record<string, unknown>>) => ({
  snapshot: { activeWorkspaceSlug: "primary" },
  resolvedWorkspaceSlug: "primary",
  accountSettings: {},
  notificationSettings: {},
  companySummary: {},
  companyMembersResult: { results: [] },
  companyPendingInvitationsResult: { results: [] },
  companyBrandAssetsResult: { results: [] },
  workspaceMembers: [],
  viewerIdentity: OWNER_VIEWER,
  workspaces: [WORKSPACE],
  projects: { [BASE_PROJECT.id]: BASE_PROJECT },
  workspaceTasks: [],
  tasksPaginationStatus: "Exhausted",
  loadMoreWorkspaceTasks: vi.fn(),
  activeWorkspace: WORKSPACE,
  visibleProjects: { [BASE_PROJECT.id]: BASE_PROJECT },
  allWorkspaceFiles: [],
  workspaceFilesPaginationStatus: "Exhausted",
  loadMoreWorkspaceFiles: vi.fn(),
  projectFilesByProject: { [BASE_PROJECT.id]: [] },
  projectFilesPaginationStatus: "Exhausted",
  loadMoreProjectFiles: vi.fn(),
  contentModel: { kind: "tasks" },
  handleToggleSidebar: vi.fn(),
  clearPendingHighlight: vi.fn(),
  ...overrides,
});

function Harness() {
  const orchestrated = useDashboardOrchestration();

  return (
    <div>
      <div data-testid="has-snapshot">{String(orchestrated.hasSnapshot)}</div>
      <button type="button" onClick={orchestrated.chromeProps.onCreateWorkspace}>create-workspace</button>
      <button type="button" onClick={() => orchestrated.contentProps.createMainContentProjectActions("project-1").updateProject?.({ description: "updated" } as any)}>
        update-project
      </button>
      <button type="button" onClick={() => orchestrated.contentProps.handleNavigateToArchiveProject("project-1")}>go-archive</button>
    </div>
  );
}

beforeEach(() => {
  vi.clearAllMocks();

  useAuthMock.mockReturnValue({
    user: {
      firstName: "Owner",
      lastName: "User",
      email: "owner@example.com",
      profilePictureUrl: null,
    },
    signOut: vi.fn(),
  });

  useConvexAuthMock.mockReturnValue({ isAuthenticated: true });
  useConvexMock.mockReturnValue({ query: vi.fn() });

  navigationState = buildNavigationState();
  useDashboardNavigationMock.mockReturnValue(navigationState);
  useDashboardApiHandlersMock.mockReturnValue(buildApiHandlers());
  useDashboardDataMock.mockReturnValue(buildDashboardData());

  useDashboardWorkspaceActionsMock.mockReturnValue({
    runWorkspaceSettingsReconciliation: vi.fn(),
    handleSaveAccountSettings: vi.fn(),
    handleUploadAccountAvatar: vi.fn(),
    handleRemoveAccountAvatar: vi.fn(),
    handleSaveSettingsNotifications: vi.fn(),
    handleCreateWorkspaceSubmit: vi.fn(),
    handleUpdateWorkspaceGeneral: vi.fn(),
    handleUploadWorkspaceLogo: vi.fn(),
    handleInviteWorkspaceMember: vi.fn(),
    handleChangeWorkspaceMemberRole: vi.fn(),
    handleRemoveWorkspaceMember: vi.fn(),
    handleResendWorkspaceInvitation: vi.fn(),
    handleRevokeWorkspaceInvitation: vi.fn(),
    handleUploadWorkspaceBrandAsset: vi.fn(),
    handleRemoveWorkspaceBrandAsset: vi.fn(),
    handleGetWorkspaceBrandAssetDownloadUrl: vi.fn(),
    handleSoftDeleteWorkspace: vi.fn(),
  });

  projectActionsState = buildProjectActionsState();
  useDashboardProjectActionsMock.mockReturnValue(projectActionsState);

  useDashboardFileActionsMock.mockReturnValue({
    handleCreateProjectFile: vi.fn(),
    handleUploadDraftAttachment: vi.fn(),
    handleRemoveDraftAttachment: vi.fn(),
    handleDiscardDraftSessionUploads: vi.fn(),
    handleRemoveProjectFile: vi.fn(),
    handleDownloadProjectFile: vi.fn(),
  });

  dashboardCommandsState = buildDashboardCommandsState();
  useDashboardCommandsMock.mockReturnValue(dashboardCommandsState);

  useDashboardPopupBindingsMock.mockReturnValue({
    createProjectViewer: {
      name: "Owner",
      avatar: "",
      role: "owner",
    },
    searchPopupOpenSettings: vi.fn(),
    searchPopupHighlightNavigate: vi.fn(),
    handleSearchIntent: vi.fn(),
    handleCreateProjectIntent: vi.fn(),
    handleSettingsIntent: vi.fn(),
    handleSignOut: vi.fn(),
  });

  useDashboardSettingsDataMock.mockReturnValue({
    settingsAccountData: {},
    settingsNotificationsData: {},
    settingsCompanyData: {},
  });

  useDashboardLifecycleEffectsMock.mockReturnValue(undefined);
});

describe("useDashboardOrchestration", () => {
  test("reports unresolved snapshot state", () => {
    useDashboardDataMock.mockReturnValue(buildDashboardData({ snapshot: null }));

    render(<Harness />);

    expect(screen.getByTestId("has-snapshot")).toHaveTextContent("false");
  });

  test("wires navigation and project action callbacks through returned props", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "go-archive" }));
    fireEvent.click(screen.getByRole("button", { name: "update-project" }));

    expect(navigationState.navigateView).toHaveBeenCalledWith("archive-project:project-1");
    expect(projectActionsState.handleUpdateProject).toHaveBeenCalledWith("project-1", { description: "updated" });
  });

  test("uses owner role to enable workspace creation", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "create-workspace" }));

    expect(dashboardCommandsState.workspace.createWorkspace).toHaveBeenCalledTimes(1);
  });
});
