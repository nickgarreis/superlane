/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { DashboardContent } from "./DashboardContent";
import type { ProjectData, ViewerIdentity } from "../../types";

vi.mock("../../components/Tasks", () => ({
  Tasks: ({ onToggleSidebar }: { onToggleSidebar: () => void }) => (
    <button type="button" onClick={onToggleSidebar} data-testid="tasks-view">
      Tasks
    </button>
  ),
}));

vi.mock("../../components/ArchivePage", () => ({
  ArchivePage: ({
    onUnarchiveProject,
  }: {
    onUnarchiveProject: (id: string) => void;
  }) => (
    <button
      type="button"
      onClick={() => onUnarchiveProject("project-1")}
      data-testid="archive-view"
    >
      Archive
    </button>
  ),
}));

vi.mock("../../components/MainContent", () => ({
  MainContent: ({
    navigationActions,
  }: {
    navigationActions?: { back?: () => void };
  }) => (
    <button
      type="button"
      onClick={() => navigationActions?.back?.()}
      data-testid="main-view"
    >
      Main
    </button>
  ),
}));

const BASE_PROJECT: ProjectData = {
  id: "project-1",
  name: "Website Redesign",
  description: "Refresh pages",
  creator: { name: "Owner", avatar: "" },
  status: {
    label: "Active",
    color: "#58AFFF",
    bgColor: "rgba(88,175,255,0.12)",
    dotColor: "#58AFFF",
  },
  category: "Web Design",
  archived: false,
  tasks: [],
};

const VIEWER: ViewerIdentity = {
  userId: "user-1",
  workosUserId: "workos-1",
  name: "Alex",
  email: "alex@example.com",
  avatarUrl: null,
  role: "owner",
};

const baseProps = () => ({
  handleToggleSidebar: vi.fn(),
  isSidebarOpen: true,
  visibleProjects: { [BASE_PROJECT.id]: BASE_PROJECT },
  workspaceTasks: [],
  tasksPaginationStatus: "Exhausted" as const,
  loadMoreWorkspaceTasks: vi.fn(),
  handleReplaceWorkspaceTasks: vi.fn(),
  workspaceMembers: [],
  viewerIdentity: VIEWER,
  handleNavigateToArchiveProject: vi.fn(),
  handleUnarchiveProject: vi.fn(),
  handleDeleteProject: vi.fn(),
  highlightedArchiveProjectId: null,
  setHighlightedArchiveProjectId: vi.fn(),
  projectFilesByProject: {},
  projectFilesPaginationStatus: "Exhausted" as const,
  loadMoreProjectFiles: vi.fn(),
  mainContentFileActions: {
    create: vi.fn(),
    remove: vi.fn(),
    download: vi.fn(),
  },
  createMainContentProjectActions: vi.fn(() => ({})),
  baseMainContentNavigationActions: { navigate: vi.fn() },
  pendingHighlight: null,
  clearPendingHighlight: vi.fn(),
  openCreateProject: vi.fn(),
});

describe("DashboardContent", () => {
  test("renders tasks content for tasks model", async () => {
    const props = baseProps();

    render(<DashboardContent {...props} contentModel={{ kind: "tasks" }} />);

    fireEvent.click(await screen.findByTestId("tasks-view"));
    expect(props.handleToggleSidebar).toHaveBeenCalledTimes(1);
  });

  test("renders archive content for archive model", async () => {
    const props = baseProps();

    render(<DashboardContent {...props} contentModel={{ kind: "archive" }} />);

    fireEvent.click(await screen.findByTestId("archive-view"));
    expect(props.handleUnarchiveProject).toHaveBeenCalledWith("project-1");
  });

  test("renders main content with back action for main model", async () => {
    const props = baseProps();
    const back = vi.fn();

    render(
      <DashboardContent
        {...props}
        contentModel={{
          kind: "main",
          project: BASE_PROJECT,
          backTo: "archive",
          back,
        }}
      />,
    );

    fireEvent.click(await screen.findByTestId("main-view"));
    expect(back).toHaveBeenCalledTimes(1);
    expect(props.createMainContentProjectActions).toHaveBeenCalledWith(
      "project-1",
    );
  });

  test("renders empty state and triggers create project", () => {
    const props = baseProps();

    render(<DashboardContent {...props} contentModel={{ kind: "empty" }} />);

    fireEvent.click(screen.getByRole("button", { name: "Create new project" }));
    expect(props.openCreateProject).toHaveBeenCalledTimes(1);
  });
});
