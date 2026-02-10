/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import type { ProjectData, ViewerIdentity, Workspace } from "../../types";
import { DashboardChrome } from "./DashboardChrome";

vi.mock("sonner", () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

vi.mock("../../components/Sidebar", () => ({
  Sidebar: (props: {
    onSearchIntent: () => void;
    onOpenCreateProjectIntent: () => void;
    onOpenSettingsIntent: () => void;
    onLogout: () => void;
    onSwitchWorkspace: (workspaceSlug: string) => void;
    onCreateWorkspace: () => void;
    onOpenSettings: (tab?: "Account" | "Notifications" | "Company" | "Billing") => void;
    onUpdateProjectStatus: (projectId: string, newStatus: string) => void;
    onEditProject: (project: ProjectData) => void;
    onViewReviewProject: (project: ProjectData) => void;
    projects: Record<string, ProjectData>;
  }) => (
    <div data-testid="sidebar">
      <button onClick={props.onSearchIntent}>search-intent</button>
      <button onClick={props.onOpenCreateProjectIntent}>create-project-intent</button>
      <button onClick={props.onOpenSettingsIntent}>settings-intent</button>
      <button onClick={props.onLogout}>logout</button>
      <button onClick={() => props.onSwitchWorkspace("workspace-b")}>switch-workspace</button>
      <button onClick={props.onCreateWorkspace}>create-workspace</button>
      <button onClick={() => props.onOpenSettings("Company")}>open-settings-company</button>
      <button onClick={() => props.onUpdateProjectStatus("project-1", "Completed")}>update-status</button>
      <button onClick={() => props.onEditProject(props.projects["project-1"])}>edit-project</button>
      <button onClick={() => props.onViewReviewProject(props.projects["project-1"])}>review-project</button>
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
  onUpdateProjectStatus: vi.fn(),
  onEditProject: vi.fn(),
  onViewReviewProject: vi.fn(),
});

describe("DashboardChrome", () => {
  test("renders sidebar and wires sidebar callbacks", () => {
    const props = baseProps();

    render(<DashboardChrome {...props} />);

    expect(screen.getByTestId("toaster")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "search-intent" }));
    fireEvent.click(screen.getByRole("button", { name: "create-project-intent" }));
    fireEvent.click(screen.getByRole("button", { name: "settings-intent" }));
    fireEvent.click(screen.getByRole("button", { name: "logout" }));
    fireEvent.click(screen.getByRole("button", { name: "switch-workspace" }));
    fireEvent.click(screen.getByRole("button", { name: "create-workspace" }));
    fireEvent.click(screen.getByRole("button", { name: "open-settings-company" }));
    fireEvent.click(screen.getByRole("button", { name: "update-status" }));
    fireEvent.click(screen.getByRole("button", { name: "edit-project" }));
    fireEvent.click(screen.getByRole("button", { name: "review-project" }));

    expect(props.handleSearchIntent).toHaveBeenCalledTimes(1);
    expect(props.handleCreateProjectIntent).toHaveBeenCalledTimes(1);
    expect(props.handleSettingsIntent).toHaveBeenCalledTimes(1);
    expect(props.handleSignOut).toHaveBeenCalledTimes(1);
    expect(props.onSwitchWorkspace).toHaveBeenCalledWith("workspace-b");
    expect(props.onCreateWorkspace).toHaveBeenCalledTimes(1);
    expect(props.onOpenSettings).toHaveBeenCalledWith("Company");
    expect(props.onUpdateProjectStatus).toHaveBeenCalledWith("project-1", "Completed");
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
});
