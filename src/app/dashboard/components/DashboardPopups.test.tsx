/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { DashboardPopups } from "./DashboardPopups";
import type { ProjectData, ViewerIdentity, Workspace } from "../../types";

vi.mock("../../components/SearchPopup", () => ({
  SearchPopup: ({ onClose, onOpenSettings }: { onClose: () => void; onOpenSettings: (tab?: string) => void }) => (
    <div data-testid="search-popup">
      <button type="button" onClick={onClose}>Close Search</button>
      <button type="button" onClick={() => onOpenSettings("Company")}>Open Settings</button>
    </div>
  ),
}));

vi.mock("../../components/CreateProjectPopup", () => ({
  CreateProjectPopup: ({ onClose }: { onClose: () => void }) => (
    <button type="button" onClick={onClose} data-testid="create-project-popup">
      Create Project
    </button>
  ),
}));

vi.mock("../../components/CreateWorkspacePopup", () => ({
  CreateWorkspacePopup: ({ onClose }: { onClose: () => void }) => (
    <button type="button" onClick={onClose} data-testid="create-workspace-popup">
      Create Workspace
    </button>
  ),
}));

vi.mock("../../components/SettingsPopup", () => ({
  SettingsPopup: ({ onClose }: { onClose: () => void }) => (
    <button type="button" onClick={onClose} data-testid="settings-popup">
      Settings
    </button>
  ),
}));

const PROJECT: ProjectData = {
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

const WORKSPACE: Workspace = {
  id: "ws-1",
  slug: "primary",
  name: "Primary",
  plan: "free",
};

const viewer: ViewerIdentity = {
  userId: "user-1",
  workosUserId: "workos-1",
  name: "Alex",
  email: "alex@example.com",
  avatarUrl: null,
  role: "owner",
};

const baseProps = () => ({
  isSearchOpen: false,
  setIsSearchOpen: vi.fn(),
  projects: { [PROJECT.id]: PROJECT },
  allWorkspaceFiles: [],
  workspaceFilesPaginationStatus: "Exhausted" as const,
  loadMoreWorkspaceFiles: vi.fn(),
  navigateView: vi.fn(),
  openCreateProject: vi.fn(),
  searchPopupOpenSettings: vi.fn(),
  searchPopupHighlightNavigate: vi.fn(),
  isCreateProjectOpen: false,
  closeCreateProject: vi.fn(),
  dashboardCommands: {
    project: {
      createOrUpdateProject: vi.fn(),
      deleteProject: vi.fn(),
    },
    file: {
      uploadDraftAttachment: vi.fn(),
      removeDraftAttachment: vi.fn(),
      discardDraftSessionUploads: vi.fn(),
    },
    settings: {
      closeSettings: vi.fn(),
      saveAccount: vi.fn(),
      uploadAccountAvatar: vi.fn(),
      removeAccountAvatar: vi.fn(),
      saveNotifications: vi.fn(),
    },
  },
  createProjectViewer: {
    userId: viewer.userId ?? undefined,
    name: viewer.name,
    avatar: viewer.avatarUrl ?? "",
    role: viewer.role ?? undefined,
  },
  editProjectId: null,
  editDraftData: null,
  reviewProject: null,
  handleUpdateComments: vi.fn(),
  handleApproveReviewProject: vi.fn(),
  isCreateWorkspaceOpen: false,
  closeCreateWorkspace: vi.fn(),
  handleCreateWorkspaceSubmit: vi.fn(),
  isSettingsOpen: false,
  settingsTab: "Account" as const,
  activeWorkspace: WORKSPACE,
  settingsAccountData: null,
  settingsNotificationsData: null,
  settingsCompanyData: null,
  resolvedWorkspaceSlug: "primary",
  companySummary: {},
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

describe("DashboardPopups", () => {
  test("renders nothing when all popup flags are false", () => {
    render(<DashboardPopups {...baseProps()} />);

    expect(screen.queryByTestId("search-popup")).not.toBeInTheDocument();
    expect(screen.queryByTestId("create-project-popup")).not.toBeInTheDocument();
    expect(screen.queryByTestId("create-workspace-popup")).not.toBeInTheDocument();
    expect(screen.queryByTestId("settings-popup")).not.toBeInTheDocument();
  });

  test("renders enabled popups and wires close/settings callbacks", async () => {
    const props = {
      ...baseProps(),
      isSearchOpen: true,
      isCreateProjectOpen: true,
      isCreateWorkspaceOpen: true,
      isSettingsOpen: true,
    };

    render(<DashboardPopups {...props} />);

    fireEvent.click(await screen.findByRole("button", { name: "Close Search" }));
    expect(props.setIsSearchOpen).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByRole("button", { name: "Open Settings" }));
    expect(props.searchPopupOpenSettings).toHaveBeenCalledWith("Company");

    fireEvent.click(await screen.findByTestId("create-project-popup"));
    expect(props.closeCreateProject).toHaveBeenCalledTimes(1);

    fireEvent.click(await screen.findByTestId("create-workspace-popup"));
    expect(props.closeCreateWorkspace).toHaveBeenCalledTimes(1);

    fireEvent.click(await screen.findByTestId("settings-popup"));
    expect(props.dashboardCommands.settings.closeSettings).toHaveBeenCalledTimes(1);
  });
});
