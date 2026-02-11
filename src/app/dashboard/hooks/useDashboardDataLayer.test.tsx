/** @vitest-environment jsdom */

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useDashboardDataLayer } from "./useDashboardDataLayer";

const {
  useAuthMock,
  useConvexMock,
  useConvexAuthMock,
  toastMock,
  useDashboardNavigationMock,
  useDashboardDataMock,
  useDashboardWorkspaceActionsMock,
  useDashboardApiHandlersMock,
  useDashboardLifecycleEffectsMock,
  loadSearchPopupModuleMock,
  loadCreateProjectPopupModuleMock,
  loadCreateWorkspacePopupModuleMock,
  loadSettingsPopupModuleMock,
} = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  useConvexMock: vi.fn(),
  useConvexAuthMock: vi.fn(),
  toastMock: {
    error: vi.fn(),
  },
  useDashboardNavigationMock: vi.fn(),
  useDashboardDataMock: vi.fn(),
  useDashboardWorkspaceActionsMock: vi.fn(),
  useDashboardApiHandlersMock: vi.fn(),
  useDashboardLifecycleEffectsMock: vi.fn(),
  loadSearchPopupModuleMock: vi.fn().mockResolvedValue(undefined),
  loadCreateProjectPopupModuleMock: vi.fn().mockResolvedValue(undefined),
  loadCreateWorkspacePopupModuleMock: vi.fn().mockResolvedValue(undefined),
  loadSettingsPopupModuleMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@workos-inc/authkit-react", () => ({
  useAuth: (...args: unknown[]) => useAuthMock(...args),
}));

vi.mock("convex/react", () => ({
  useConvex: (...args: unknown[]) => useConvexMock(...args),
  useConvexAuth: (...args: unknown[]) => useConvexAuthMock(...args),
}));

vi.mock("sonner", () => ({
  toast: toastMock,
}));

vi.mock("../useDashboardNavigation", () => ({
  useDashboardNavigation: (...args: unknown[]) =>
    useDashboardNavigationMock(...args),
}));

vi.mock("../useDashboardData", () => ({
  useDashboardData: (...args: unknown[]) => useDashboardDataMock(...args),
}));

vi.mock("../useDashboardWorkspaceActions", () => ({
  useDashboardWorkspaceActions: (...args: unknown[]) =>
    useDashboardWorkspaceActionsMock(...args),
}));

vi.mock("./useDashboardApiHandlers", () => ({
  useDashboardApiHandlers: (...args: unknown[]) =>
    useDashboardApiHandlersMock(...args),
}));

vi.mock("./useDashboardLifecycleEffects", () => ({
  useDashboardLifecycleEffects: (...args: unknown[]) =>
    useDashboardLifecycleEffectsMock(...args),
}));

vi.mock("../components/DashboardPopups", () => ({
  loadSearchPopupModule: (...args: unknown[]) =>
    loadSearchPopupModuleMock(...args),
  loadCreateProjectPopupModule: (...args: unknown[]) =>
    loadCreateProjectPopupModuleMock(...args),
  loadCreateWorkspacePopupModule: (...args: unknown[]) =>
    loadCreateWorkspacePopupModuleMock(...args),
  loadSettingsPopupModule: (...args: unknown[]) =>
    loadSettingsPopupModuleMock(...args),
}));

const createNavigation = () => ({
  activeWorkspaceSlug: "workspace-1",
  setActiveWorkspaceSlug: vi.fn(),
  isSettingsOpen: false,
  settingsTab: "Account",
  isSearchOpen: false,
  currentView: "tasks" as const,
  setIsSidebarOpen: vi.fn(),
  setPendingHighlight: vi.fn(),
  navigateView: vi.fn(),
  completedProjectDetailId: null,
  openCreateWorkspace: vi.fn(),
  closeCreateWorkspace: vi.fn(),
  openCompletedProjectsPopup: vi.fn(),
  closeCompletedProjectsPopup: vi.fn(),
  openCompletedProjectDetail: vi.fn(),
  backToCompletedProjectsList: vi.fn(),
  openSearch: vi.fn(),
  navigate: vi.fn(),
  location: { pathname: "/tasks" },
});

const createApiHandlers = () => ({
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
  reorderTasksMutation: vi.fn(),
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

describe("useDashboardDataLayer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({
      user: {
        firstName: "Nick",
        lastName: "User",
        email: "nick@example.com",
        profilePictureUrl: "https://cdn.test/avatar.png",
      },
      signOut: vi.fn(),
    });
    useConvexAuthMock.mockReturnValue({ isAuthenticated: true });
    useConvexMock.mockReturnValue({ query: vi.fn() });

    useDashboardNavigationMock.mockReturnValue(createNavigation());
    useDashboardDataMock.mockReturnValue({
      snapshot: { workspaces: [{}], activeWorkspaceSlug: "workspace-1" },
      projects: {},
      companySummary: null,
      resolvedWorkspaceSlug: "workspace-1",
      viewerIdentity: { role: "owner" },
    });
    useDashboardWorkspaceActionsMock.mockReturnValue({
      runWorkspaceSettingsReconciliation: vi.fn(),
    });
    useDashboardApiHandlersMock.mockReturnValue(createApiHandlers());
  });

  test("switches workspace and opens create workspace for owners", () => {
    const { result } = renderHook(() => useDashboardDataLayer());
    const navigation = result.current.navigation;
    const preloadArgs = useDashboardNavigationMock.mock.calls[0][0] as {
      preloadSearchPopup: () => void;
      preloadCreateProjectPopup: () => void;
      preloadCreateWorkspacePopup: () => void;
      preloadSettingsPopup: () => void;
    };

    act(() => {
      result.current.handleSwitchWorkspace("workspace-2");
      result.current.handleCreateWorkspace();
      preloadArgs.preloadSearchPopup();
      preloadArgs.preloadCreateProjectPopup();
      preloadArgs.preloadCreateWorkspacePopup();
      preloadArgs.preloadSettingsPopup();
    });

    expect(result.current.canCreateWorkspace).toBe(true);
    expect(navigation.setActiveWorkspaceSlug).toHaveBeenCalledWith(
      "workspace-2",
    );
    expect(navigation.navigateView).toHaveBeenCalledWith("tasks");
    expect(navigation.openCreateWorkspace).toHaveBeenCalledTimes(1);
    expect(loadSearchPopupModuleMock).toHaveBeenCalledTimes(1);
    expect(loadCreateProjectPopupModuleMock).toHaveBeenCalledTimes(1);
    expect(loadCreateWorkspacePopupModuleMock).toHaveBeenCalledTimes(1);
    expect(loadSettingsPopupModuleMock).toHaveBeenCalledTimes(1);
    expect(toastMock.error).not.toHaveBeenCalled();
  });

  test("shows owner-only create workspace error for non-owners", () => {
    useDashboardDataMock.mockReturnValueOnce({
      snapshot: { workspaces: [{}], activeWorkspaceSlug: "workspace-1" },
      projects: {},
      companySummary: null,
      resolvedWorkspaceSlug: "workspace-1",
      viewerIdentity: { role: "member" },
    });

    const { result } = renderHook(() => useDashboardDataLayer());

    act(() => {
      result.current.handleCreateWorkspace();
    });

    expect(result.current.canCreateWorkspace).toBe(false);
    expect(toastMock.error).toHaveBeenCalledWith(
      "Only workspace owners can create workspaces",
    );
    expect(
      result.current.navigation.openCreateWorkspace,
    ).not.toHaveBeenCalled();
  });

  test("builds unknown-user fallback when auth user is missing", () => {
    useAuthMock.mockReturnValueOnce({
      user: null,
      signOut: vi.fn(),
    });

    const { result } = renderHook(() => useDashboardDataLayer());

    expect(result.current.viewerFallback).toEqual({
      name: "Unknown user",
      email: "",
      avatarUrl: null,
    });
    expect(useDashboardLifecycleEffectsMock).toHaveBeenCalledTimes(1);
  });

  test("keeps workspace action callbacks stable across rerenders", () => {
    const { result, rerender } = renderHook(() => useDashboardDataLayer());
    const initialHandleSwitchWorkspace = result.current.handleSwitchWorkspace;
    const initialHandleCreateWorkspace = result.current.handleCreateWorkspace;

    rerender();

    expect(result.current.handleSwitchWorkspace).toBe(
      initialHandleSwitchWorkspace,
    );
    expect(result.current.handleCreateWorkspace).toBe(
      initialHandleCreateWorkspace,
    );
  });
});
