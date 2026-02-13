/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { DashboardPopups } from "./DashboardPopups";
import type { ProjectData, ViewerIdentity, Workspace } from "../../types";

vi.mock("../../components/SearchPopup", () => ({
  SearchPopup: ({
    onClose,
    onOpenSettings,
    onOpenInbox,
    onNavigate,
  }: {
    onClose: () => void;
    onOpenSettings: (tab?: string) => void;
    onOpenInbox: () => void;
    onNavigate: (view: string) => void;
  }) => (
    <div data-testid="search-popup">
      <button type="button" onClick={onClose}>
        Close Search
      </button>
      <button type="button" onClick={() => onOpenSettings("Company")}>
        Open Settings
      </button>
      <button type="button" onClick={onOpenInbox}>
        Open Inbox
      </button>
      <button
        type="button"
        onClick={() => onNavigate("completed-project:project-1")}
      >
        Open Completed From Search
      </button>
      <button
        type="button"
        onClick={() => onNavigate("draft-project:project-1")}
      >
        Open Draft From Search
      </button>
      <button
        type="button"
        onClick={() => onNavigate("pending-project:project-1")}
      >
        Open Pending From Search
      </button>
    </div>
  ),
}));

vi.mock("../../components/CreateProjectPopup", () => ({
  CreateProjectPopup: ({
    onClose,
    onBackToDraftPendingProjects,
    backToDraftPendingProjectsLabel,
    editProjectId,
    reviewProject,
  }: {
    onClose: () => void;
    onBackToDraftPendingProjects?: () => void;
    backToDraftPendingProjectsLabel?: string;
    editProjectId?: string | null;
    reviewProject?: { id: string } | null;
  }) => (
    <div data-testid="create-project-popup">
      <div>
        {editProjectId
          ? `draft-detail:${editProjectId}`
          : reviewProject
            ? `review-detail:${reviewProject.id}`
            : "create-project"}
      </div>
      {onBackToDraftPendingProjects ? (
        <button type="button" onClick={onBackToDraftPendingProjects}>
          Back to {backToDraftPendingProjectsLabel}
        </button>
      ) : null}
      <button type="button" onClick={onClose}>
        Close Create Project
      </button>
    </div>
  ),
}));

vi.mock("../../components/CreateWorkspacePopup", () => ({
  CreateWorkspacePopup: ({ onClose }: { onClose: () => void }) => (
    <button
      type="button"
      onClick={onClose}
      data-testid="create-workspace-popup"
    >
      Create Workspace
    </button>
  ),
}));

vi.mock("../../components/SettingsPopup", () => ({
  SettingsPopup: ({
    onClose,
    viewerRole,
  }: {
    onClose: () => void;
    viewerRole: "owner" | "admin" | "member" | null;
  }) => (
    <button
      type="button"
      onClick={onClose}
      data-testid="settings-popup"
      data-viewer-role={viewerRole ?? "none"}
    >
      Settings
    </button>
  ),
}));

vi.mock("../../components/CompletedProjectsPopup", () => ({
  CompletedProjectsPopup: ({
    onClose,
    onOpenProjectDetail,
  }: {
    onClose: () => void;
    onOpenProjectDetail: (projectId: string) => void;
  }) => (
    <div data-testid="completed-projects-popup">
      <button type="button" onClick={onClose}>
        Close Completed
      </button>
      <button type="button" onClick={() => onOpenProjectDetail("project-1")}>
        Open Completed Detail
      </button>
    </div>
  ),
}));

vi.mock("../../components/CompletedProjectDetailPopup", () => ({
  CompletedProjectDetailPopup: ({
    onClose,
    onBackToCompletedProjects,
  }: {
    onClose: () => void;
    onBackToCompletedProjects: () => void;
  }) => (
    <div data-testid="completed-project-detail-popup">
      <button type="button" onClick={onBackToCompletedProjects}>
        Back Completed
      </button>
      <button type="button" onClick={onClose}>
        Close Completed Detail
      </button>
    </div>
  ),
}));

vi.mock("../../components/DraftPendingProjectsPopup", () => ({
  DraftPendingProjectsPopup: ({
    onClose,
    projects,
    draftPendingProjectDetailId,
    onOpenProjectDetail,
    onBackToDraftPendingProjects,
    renderDetail,
  }: {
    onClose: () => void;
    projects: Record<string, ProjectData>;
    draftPendingProjectDetailId: string | null;
    onOpenProjectDetail: (projectId: string, status: "Draft" | "Review") => void;
    onBackToDraftPendingProjects: () => void;
    renderDetail: (project: ProjectData) => React.ReactNode;
  }) => (
    <div data-testid="draft-pending-projects-popup">
      <button type="button" onClick={onClose}>
        Close Draft Pending
      </button>
      <button
        type="button"
        onClick={() => onOpenProjectDetail("project-1", "Draft")}
      >
        Open Draft Pending Detail
      </button>
      <button type="button" onClick={onBackToDraftPendingProjects}>
        Back Draft Pending List
      </button>
      {draftPendingProjectDetailId
        ? renderDetail(projects[draftPendingProjectDetailId])
        : null}
    </div>
  ),
}));

const PROJECT: ProjectData = {
  id: "project-1",
  name: "Project",
  description: "Desc",
  creator: { name: "Owner", avatar: "" },
  status: {
    label: "Draft",
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
  currentView: "tasks" as const,
  isSearchOpen: false,
  setIsSearchOpen: vi.fn(),
  projects: { [PROJECT.id]: PROJECT },
  workspaceTasks: [],
  tasksByProject: { [PROJECT.id]: [] },
  allWorkspaceFiles: [],
  workspaceFilesPaginationStatus: "Exhausted" as const,
  loadMoreWorkspaceFiles: vi.fn(),
  navigateView: vi.fn(),
  openInbox: vi.fn(),
  openCreateProject: vi.fn(),
  searchPopupOpenSettings: vi.fn(),
  searchPopupHighlightNavigate: vi.fn(),
  isCreateProjectOpen: false,
  closeCreateProject: vi.fn(),
  dashboardCommands: {
    project: {
      createOrUpdateProject: vi.fn(),
      deleteProject: vi.fn(),
      updateProjectStatus: vi.fn(),
    },
    file: {
      uploadDraftAttachment: vi.fn(),
      removeDraftAttachment: vi.fn(),
      discardDraftSessionUploads: vi.fn(),
    },
    settings: {
      closeSettings: vi.fn(),
      saveAccount: vi.fn(),
      requestPasswordReset: vi.fn(),
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
  isCompletedProjectsOpen: false,
  closeCompletedProjectsPopup: vi.fn(),
  completedProjectDetailId: null,
  openCompletedProjectDetail: vi.fn(),
  backToCompletedProjectsList: vi.fn(),
  isDraftPendingProjectsOpen: false,
  closeDraftPendingProjectsPopup: vi.fn(),
  draftPendingProjectDetailId: null,
  draftPendingProjectDetailKind: null as "draft" | "pending" | null,
  openDraftPendingProjectDetail: vi.fn(),
  backToDraftPendingProjectsList: vi.fn(),
  projectFilesByProject: { [PROJECT.id]: [] },
  projectFilesPaginationStatus: "Exhausted" as const,
  loadMoreProjectFiles: vi.fn(),
  workspaceMembers: [],
  viewerIdentity: viewer,
  mainContentFileActions: {
    create: vi.fn(),
    remove: vi.fn(),
    download: vi.fn(),
  },
  createMainContentProjectActions: vi.fn().mockReturnValue({}),
  baseMainContentNavigationActions: { navigate: vi.fn() },
  isSettingsOpen: false,
  settingsTab: "Account" as const,
  settingsFocusTarget: null,
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
    expect(
      screen.queryByTestId("create-project-popup"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("create-workspace-popup"),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("settings-popup")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("completed-projects-popup"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("draft-pending-projects-popup"),
    ).not.toBeInTheDocument();
  });

  test("renders enabled base popups and wires close/settings callbacks", async () => {
    const props = {
      ...baseProps(),
      isSearchOpen: true,
      isCreateProjectOpen: true,
      isCreateWorkspaceOpen: true,
      isSettingsOpen: true,
      isCompletedProjectsOpen: true,
    };

    render(<DashboardPopups {...props} />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Close Search" }),
    );
    expect(props.setIsSearchOpen).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByRole("button", { name: "Open Settings" }));
    expect(props.searchPopupOpenSettings).toHaveBeenCalledWith("Company");

    fireEvent.click(screen.getByRole("button", { name: "Open Inbox" }));
    expect(props.openInbox).toHaveBeenCalledTimes(1);

    fireEvent.click(
      screen.getByRole("button", { name: "Open Completed From Search" }),
    );
    expect(props.openCompletedProjectDetail).toHaveBeenCalledWith("project-1", {
      from: "/tasks",
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Open Draft From Search" }),
    );
    expect(props.openDraftPendingProjectDetail).toHaveBeenCalledWith(
      "project-1",
      "Draft",
      { from: "/tasks" },
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Open Pending From Search" }),
    );
    expect(props.openDraftPendingProjectDetail).toHaveBeenCalledWith(
      "project-1",
      "Review",
      { from: "/tasks" },
    );

    fireEvent.click(await screen.findByRole("button", { name: "Close Create Project" }));
    expect(props.closeCreateProject).toHaveBeenCalledTimes(1);

    fireEvent.click(await screen.findByTestId("create-workspace-popup"));
    expect(props.closeCreateWorkspace).toHaveBeenCalledTimes(1);

    fireEvent.click(await screen.findByTestId("settings-popup"));
    expect(
      props.dashboardCommands.settings.closeSettings,
    ).toHaveBeenCalledTimes(1);

    fireEvent.click(
      await screen.findByRole("button", { name: "Open Completed Detail" }),
    );
    expect(props.openCompletedProjectDetail).toHaveBeenCalledWith("project-1");

    fireEvent.click(
      await screen.findByRole("button", { name: "Close Completed" }),
    );
    expect(props.closeCompletedProjectsPopup).toHaveBeenCalledTimes(1);
  });

  test("wires draft/pending popup list, detail open, back, and close callbacks", async () => {
    const props = {
      ...baseProps(),
      isDraftPendingProjectsOpen: true,
    };

    const { rerender } = render(<DashboardPopups {...props} />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Open Draft Pending Detail" }),
    );
    expect(props.openDraftPendingProjectDetail).toHaveBeenCalledWith(
      "project-1",
      "Draft",
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Close Draft Pending" }),
    );
    expect(props.closeDraftPendingProjectsPopup).toHaveBeenCalledTimes(1);

    rerender(
      <DashboardPopups
        {...props}
        draftPendingProjectDetailId="project-1"
        draftPendingProjectDetailKind="draft"
      />,
    );

    expect(
      await screen.findByText("draft-detail:project-1"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Back to draft & pending projects",
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Back to draft & pending projects",
      }),
    );
    expect(props.backToDraftPendingProjectsList).toHaveBeenCalledTimes(1);
  });

  test("passes viewer role through to settings popup", async () => {
    render(
      <DashboardPopups
        {...baseProps()}
        isSettingsOpen={true}
        viewerIdentity={{ ...viewer, role: "admin" }}
      />,
    );

    expect(await screen.findByTestId("settings-popup")).toHaveAttribute(
      "data-viewer-role",
      "admin",
    );
  });
});
