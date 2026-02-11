/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { MainContent } from "./MainContent";
import type {
  MainContentFileActions,
  MainContentNavigationActions,
  MainContentProjectActions,
  PendingHighlight,
} from "../dashboard/types";
import type {
  ProjectData,
  ProjectFileData,
  ViewerIdentity,
  WorkspaceMember,
} from "../types";

vi.mock("../../imports/HorizontalBorder", () => ({
  default: ({ onToggleSidebar }: { onToggleSidebar: () => void }) => (
    <button type="button" onClick={onToggleSidebar}>
      Toggle
    </button>
  ),
}));

vi.mock("./ProjectTasks", () => ({
  ProjectTasks: () => <div data-testid="project-tasks" />,
}));

vi.mock("./ProjectLogo", () => ({
  ProjectLogo: ({ category }: { category: string }) => (
    <div data-testid="project-logo">{category}</div>
  ),
}));

vi.mock("./main-content/MenuIcon", () => ({
  MenuIcon: () => <button type="button">Menu</button>,
}));

const BASE_PROJECT: ProjectData = {
  id: "project-1",
  name: "Website Redesign",
  description: "Refresh landing page",
  creator: {
    name: "Owner",
    avatar: "",
  },
  status: {
    label: "Active",
    color: "#58AFFF",
    bgColor: "rgba(88,175,255,0.12)",
    dotColor: "#58AFFF",
  },
  category: "Web Design",
  archived: false,
  completedAt: null,
  tasks: [],
};

const VIEWER: ViewerIdentity = {
  userId: "user-1",
  workosUserId: "workos-1",
  name: "Alex Owner",
  email: "alex@example.com",
  avatarUrl: null,
  role: "owner",
};

const MEMBERS: WorkspaceMember[] = [
  {
    userId: "user-1",
    workosUserId: "workos-1",
    name: "Alex Owner",
    email: "alex@example.com",
    avatarUrl: null,
    role: "owner",
    isViewer: true,
  },
];

const buildFileActions = (): MainContentFileActions => ({
  create: vi.fn(),
  remove: vi.fn(),
  download: vi.fn(),
});

const PROJECT_ACTIONS: MainContentProjectActions = {
  archive: vi.fn(),
  unarchive: vi.fn(),
  remove: vi.fn(),
  updateStatus: vi.fn(),
  updateProject: vi.fn(),
};

const renderMainContent = (args?: {
  project?: ProjectData;
  projectFiles?: ProjectFileData[];
  pendingHighlight?: PendingHighlight | null;
  onClearPendingHighlight?: () => void;
  fileActions?: MainContentFileActions;
  navigationActions?: MainContentNavigationActions;
}) => {
  const fileActions = args?.fileActions ?? buildFileActions();

  const view = render(
    <MainContent
      onToggleSidebar={vi.fn()}
      isSidebarOpen
      project={args?.project ?? BASE_PROJECT}
      projectFiles={args?.projectFiles ?? []}
      workspaceMembers={MEMBERS}
      viewerIdentity={VIEWER}
      fileActions={fileActions}
      projectActions={PROJECT_ACTIONS}
      navigationActions={args?.navigationActions}
      pendingHighlight={args?.pendingHighlight}
      onClearPendingHighlight={args?.onClearPendingHighlight}
    />,
  );

  return { ...view, fileActions };
};

describe("MainContent", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    const refWarnings = consoleErrorSpy.mock.calls
      .map((args) => args.map((arg) => String(arg)).join(" "))
      .filter((message) => message.includes("`ref` is not a prop"));
    expect(refWarnings).toHaveLength(0);
    consoleErrorSpy.mockRestore();
  });

  test("uploads files for active projects", () => {
    const { container, fileActions } = renderMainContent();

    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();

    fireEvent.change(fileInput as HTMLInputElement, {
      target: {
        files: [new File(["asset"], "logo.png", { type: "image/png" })],
      },
    });

    expect(fileActions.create).toHaveBeenCalledTimes(1);
    expect(fileActions.create).toHaveBeenCalledWith(
      "project-1",
      "Assets",
      expect.objectContaining({ name: "logo.png" }),
    );
  });

  test("blocks file mutations for completed projects", () => {
    const fileActions = buildFileActions();

    const completedProject: ProjectData = {
      ...BASE_PROJECT,
      status: {
        ...BASE_PROJECT.status,
        label: "Completed",
      },
      completedAt: 1700000000000,
    };

    const files: ProjectFileData[] = [
      {
        id: "file-1",
        projectPublicId: "project-1",
        tab: "Assets",
        name: "handoff.pdf",
        type: "PDF",
        displayDateEpochMs: 1700000000000,
      },
    ];

    const { container } = renderMainContent({
      project: completedProject,
      projectFiles: files,
      fileActions,
    });

    const addButton = screen.getByRole("button", { name: "Add asset" });
    expect(addButton).toBeDisabled();

    const fileInput = container.querySelector('input[type="file"]');
    fireEvent.change(fileInput as HTMLInputElement, {
      target: {
        files: [new File(["asset"], "blocked.png", { type: "image/png" })],
      },
    });

    const removeButton = screen.getByTitle(
      "Files can only be modified for active projects",
    );
    expect(removeButton).toBeDisabled();
    fireEvent.click(removeButton);

    expect(fileActions.create).not.toHaveBeenCalled();
    expect(fileActions.remove).not.toHaveBeenCalled();
  });

  test("consumes pending file highlight and clears it", async () => {
    const onClearPendingHighlight = vi.fn();

    renderMainContent({
      projectFiles: [
        {
          id: "file-1",
          projectPublicId: "project-1",
          tab: "Contract",
          name: "agreement.pdf",
          type: "PDF",
          displayDateEpochMs: 1700000000000,
        },
      ],
      pendingHighlight: {
        projectId: "project-1",
        type: "file",
        fileName: "agreement.pdf",
        fileTab: "Contract",
      },
      onClearPendingHighlight,
    });

    await waitFor(() => {
      expect(screen.getByText("agreement.pdf")).toBeInTheDocument();
      expect(onClearPendingHighlight).toHaveBeenCalledTimes(1);
    });
  });

  test("downloads and removes files for active projects", () => {
    const fileActions = buildFileActions();

    renderMainContent({
      projectFiles: [
        {
          id: "file-1",
          projectPublicId: "project-1",
          tab: "Assets",
          name: "brand-kit.zip",
          type: "ZIP",
          displayDateEpochMs: 1700000000000,
          downloadable: true,
        },
      ],
      fileActions,
    });

    fireEvent.click(screen.getByTitle("Download"));
    fireEvent.click(screen.getByTitle("Remove"));

    expect(fileActions.download).toHaveBeenCalledWith("file-1");
    expect(fileActions.remove).toHaveBeenCalledWith("file-1");
  });

  test("shows archive back navigation and executes callback", () => {
    const back = vi.fn();

    renderMainContent({
      navigationActions: {
        backTo: "archive",
        back,
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Back to Archive" }));
    expect(back).toHaveBeenCalledTimes(1);
  });

  test("uses explicit back label override for completed popup detail", () => {
    const back = vi.fn();

    renderMainContent({
      navigationActions: {
        backTo: "archive",
        backLabel: "completed projects",
        back,
      },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Back to completed projects" }),
    );
    expect(back).toHaveBeenCalledTimes(1);
  });

  test("preserves project detail scroll position when switching file tabs", () => {
    const rafSpy = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback: FrameRequestCallback) => {
        callback(0);
        return 0;
      });

    const { container } = renderMainContent({
      projectFiles: [
        {
          id: "file-1",
          projectPublicId: "project-1",
          tab: "Assets",
          name: "brand-guide.pdf",
          type: "PDF",
          displayDateEpochMs: 1700000000000,
        },
        {
          id: "file-2",
          projectPublicId: "project-1",
          tab: "Contract",
          name: "agreement.pdf",
          type: "PDF",
          displayDateEpochMs: 1700000000000,
        },
      ],
    });

    const scrollContainer = container.querySelector(
      ".overflow-y-auto",
    ) as HTMLDivElement | null;
    expect(scrollContainer).not.toBeNull();
    if (!scrollContainer) {
      rafSpy.mockRestore();
      return;
    }

    scrollContainer.scrollTop = 420;
    fireEvent.click(screen.getByRole("button", { name: "Contract" }));

    expect(scrollContainer.scrollTop).toBe(420);
    rafSpy.mockRestore();
  });
});
