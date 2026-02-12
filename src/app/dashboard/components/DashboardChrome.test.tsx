/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import type { ProjectData, ViewerIdentity, Workspace } from "../../types";
import { DashboardChrome } from "./DashboardChrome";

vi.mock("sonner", () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

vi.mock("./DashboardSidebarDndBoundary", () => ({
  default: (props: {
    onSearchIntent: () => void;
    onOpenCreateProjectIntent: () => void;
    onOpenSettingsIntent: () => void;
    onOpenInbox: () => void;
    onLogout: () => void;
    onOpenCompletedProjectsPopup: () => void;
    onSwitchWorkspace: (workspaceSlug: string) => void;
    onCreateWorkspace: () => void;
    onOpenSettings: (
      tab?: "Account" | "Notifications" | "Company" | "Workspace" | "Billing",
    ) => void;
    onEditProject: (project: ProjectData) => void;
    onViewReviewProject: (project: ProjectData) => void;
    projects: Record<string, ProjectData>;
    inboxUnreadCount: number;
  }) => (
    <div data-testid="sidebar">
      <button onClick={props.onSearchIntent}>search-intent</button>
      <button onClick={props.onOpenInbox}>open-inbox</button>
      <button onClick={props.onOpenCreateProjectIntent}>
        create-project-intent
      </button>
      <button onClick={props.onOpenCompletedProjectsPopup}>
        open-completed-popup
      </button>
      <button onClick={props.onOpenSettingsIntent}>settings-intent</button>
      <button onClick={props.onLogout}>logout</button>
      <button onClick={() => props.onSwitchWorkspace("workspace-b")}>
        switch-workspace
      </button>
      <button onClick={props.onCreateWorkspace}>create-workspace</button>
      <button onClick={() => props.onOpenSettings("Company")}>
        open-settings-company
      </button>
      <button onClick={() => props.onEditProject(props.projects["project-1"])}>
        edit-project
      </button>
      <button
        onClick={() => props.onViewReviewProject(props.projects["project-1"])}
      >
        review-project
      </button>
      <span data-testid="inbox-unread-count">{props.inboxUnreadCount}</span>
    </div>
  ),
}));

vi.mock("../../components/InboxSidebarPanel", () => ({
  InboxSidebarPanel: (props: {
    isOpen: boolean;
    unreadCount: number;
    onMarkActivityRead: (activityId: string) => void;
    onMarkAllRead: () => void;
    onActivityClick: (activity: { id: string; kind: string }) => void;
  }) => (
    <div data-testid="inbox-panel" data-open={props.isOpen}>
      <span data-testid="panel-unread-count">{props.unreadCount}</span>
      <button onClick={() => props.onMarkActivityRead("activity-1")}>
        mark-one
      </button>
      <button onClick={props.onMarkAllRead}>mark-all</button>
      <button
        onClick={() => props.onActivityClick({ id: "activity-2", kind: "project" })}
      >
        activity-click
      </button>
    </div>
  ),
}));

const PROJECT: ProjectData = {
  id: "project-1",
  name: "Project One",
  description: "Description",
  creator: { name: "Owner", avatar: "" },
  status: {
    label: "Active",
    color: "#fff",
    bgColor: "#000",
    dotColor: "#fff",
  },
  category: "Web",
};

const VIEWER: ViewerIdentity = {
  userId: "user-1",
  workosUserId: "workos-1",
  name: "Owner",
  email: "owner@example.com",
  avatarUrl: null,
  role: "owner",
};

const WORKSPACE: Workspace = {
  id: "workspace-a",
  slug: "workspace-a",
  name: "Workspace A",
  plan: "pro",
};

const baseProps = () => ({
  isSidebarOpen: true,
  navigateView: vi.fn(),
  openInbox: vi.fn(),
  closeInbox: vi.fn(),
  isInboxOpen: false,
  openSearch: vi.fn(),
  handleSearchIntent: vi.fn(),
  currentView: "tasks" as const,
  openCreateProject: vi.fn(),
  handleCreateProjectIntent: vi.fn(),
  visibleProjects: { "project-1": PROJECT },
  viewerIdentity: VIEWER,
  activeWorkspace: WORKSPACE,
  workspaces: [WORKSPACE],
  canCreateWorkspace: true,
  handleSettingsIntent: vi.fn(),
  handleSignOut: vi.fn(),
  onSwitchWorkspace: vi.fn(),
  onCreateWorkspace: vi.fn(),
  onOpenSettings: vi.fn(),
  onEditProject: vi.fn(),
  onViewReviewProject: vi.fn(),
  onOpenCompletedProjectsPopup: vi.fn(),
  workspaceActivities: [],
  inboxUnreadCount: 12,
  activitiesPaginationStatus: "Exhausted" as const,
  loadMoreWorkspaceActivities: vi.fn(),
  onMarkInboxActivityRead: vi.fn(),
  onMarkAllInboxActivitiesRead: vi.fn(),
  onInboxActivityClick: vi.fn(),
});

describe("DashboardChrome", () => {
  test("renders sidebar and wires sidebar callbacks", async () => {
    const props = baseProps();

    render(<DashboardChrome {...props} />);

    expect(screen.getByTestId("toaster")).toBeInTheDocument();
    expect(await screen.findByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("inbox-unread-count").textContent).toBe("12");

    fireEvent.click(screen.getByRole("button", { name: "search-intent" }));
    fireEvent.click(screen.getByRole("button", { name: "open-inbox" }));
    fireEvent.click(
      screen.getByRole("button", { name: "create-project-intent" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "open-completed-popup" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "settings-intent" }));
    fireEvent.click(screen.getByRole("button", { name: "logout" }));
    fireEvent.click(screen.getByRole("button", { name: "switch-workspace" }));
    fireEvent.click(screen.getByRole("button", { name: "create-workspace" }));
    fireEvent.click(
      screen.getByRole("button", { name: "open-settings-company" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "edit-project" }));
    fireEvent.click(screen.getByRole("button", { name: "review-project" }));

    expect(props.handleSearchIntent).toHaveBeenCalledTimes(1);
    expect(props.openInbox).toHaveBeenCalledTimes(1);
    expect(props.handleCreateProjectIntent).toHaveBeenCalledTimes(1);
    expect(props.onOpenCompletedProjectsPopup).toHaveBeenCalledTimes(1);
    expect(props.handleSettingsIntent).toHaveBeenCalledTimes(1);
    expect(props.handleSignOut).toHaveBeenCalledTimes(1);
    expect(props.onSwitchWorkspace).toHaveBeenCalledWith("workspace-b");
    expect(props.onCreateWorkspace).toHaveBeenCalledTimes(1);
    expect(props.onOpenSettings).toHaveBeenCalledWith("Company");
    expect(props.onEditProject).toHaveBeenCalledWith(PROJECT);
    expect(props.onViewReviewProject).toHaveBeenCalledWith(PROJECT);
  });

  test("hides sidebar when closed", () => {
    const props = baseProps();
    props.isSidebarOpen = false;

    render(<DashboardChrome {...props} />);

    expect(screen.queryByTestId("sidebar")).toBeNull();
    expect(screen.getByTestId("toaster")).toBeInTheDocument();
  });

  test("routes inbox button to close callback when inbox is already open", async () => {
    const props = baseProps();
    props.isInboxOpen = true;

    render(<DashboardChrome {...props} />);

    fireEvent.click(await screen.findByRole("button", { name: "open-inbox" }));

    expect(props.closeInbox).toHaveBeenCalledTimes(1);
    expect(props.openInbox).not.toHaveBeenCalled();
  });

  test("forwards unread actions to inbox panel", async () => {
    const props = baseProps();
    props.isInboxOpen = true;

    render(<DashboardChrome {...props} />);

    expect(await screen.findByTestId("inbox-panel")).toBeInTheDocument();
    expect(screen.getByTestId("panel-unread-count").textContent).toBe("12");

    fireEvent.click(screen.getByRole("button", { name: "mark-one" }));
    fireEvent.click(screen.getByRole("button", { name: "mark-all" }));
    fireEvent.click(screen.getByRole("button", { name: "activity-click" }));

    expect(props.onMarkInboxActivityRead).toHaveBeenCalledWith("activity-1");
    expect(props.onMarkAllInboxActivitiesRead).toHaveBeenCalledTimes(1);
    expect(props.onInboxActivityClick).toHaveBeenCalledWith({
      id: "activity-2",
      kind: "project",
    });
  });
});
