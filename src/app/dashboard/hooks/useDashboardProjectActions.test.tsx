/** @vitest-environment jsdom */

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useDashboardProjectActions } from "./useDashboardProjectActions";
import type { ProjectData, ViewerIdentity } from "../../types";

const { toastMock } = vi.hoisted(() => ({
  toastMock: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: toastMock,
}));

const viewerIdentity: ViewerIdentity = {
  userId: "viewer-1",
  workosUserId: "workos-viewer-1",
  name: "Viewer",
  email: "viewer@example.com",
  avatarUrl: "",
  role: "owner",
};

const baseProject: ProjectData = {
  id: "project-1",
  name: "Project One",
  description: "Description",
  creator: { userId: "viewer-1", name: "Viewer", avatar: "" },
  status: {
    label: "Active",
    color: "#fff",
    bgColor: "#000",
    dotColor: "#fff",
  },
  category: "Web",
  scope: "Landing",
  archived: false,
  tasks: [],
};

const createBaseArgs = () => ({
  activeWorkspaceId: "workspace-1",
  projects: { "project-1": baseProject },
  visibleProjects: { "project-1": baseProject },
  workspaceTasks: [],
  currentView: "project:project-1" as const,
  isCompletedProjectsOpen: false,
  completedProjectDetailId: null as string | null,
  viewerIdentity,
  setEditProjectId: vi.fn(),
  setEditDraftData: vi.fn(),
  setReviewProject: vi.fn(),
  setHighlightedArchiveProjectId: vi.fn(),
  openCreateProject: vi.fn(),
  closeCompletedProjectsPopup: vi.fn(),
  navigateView: vi.fn(),
  navigateToPath: vi.fn(),
  createProjectMutation: vi
    .fn()
    .mockResolvedValue({ publicId: "project-created" }),
  updateProjectMutation: vi.fn().mockResolvedValue({ publicId: "project-1" }),
  archiveProjectMutation: vi.fn().mockResolvedValue({}),
  unarchiveProjectMutation: vi.fn().mockResolvedValue({}),
  removeProjectMutation: vi.fn().mockResolvedValue({}),
  setProjectStatusMutation: vi.fn().mockResolvedValue({}),
  updateReviewCommentsMutation: vi.fn().mockResolvedValue({}),
  applyTaskDiffMutation: vi.fn().mockResolvedValue({}),
  reorderTasksMutation: vi.fn().mockResolvedValue({}),
  canReorderWorkspaceTasks: true,
  asPendingUploadId: vi.fn((value: string) => value as any),
  omitUndefined: <T extends Record<string, unknown>>(value: T) => value,
});

describe("useDashboardProjectActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("creates and updates projects through create handler", async () => {
    const args = createBaseArgs();
    const { result } = renderHook(() => useDashboardProjectActions(args));

    await result.current.handleCreateProject({
      name: "New Project",
      description: "new",
      category: "Web Design",
      scope: "Landing",
      status: "Active",
    });

    expect(args.createProjectMutation).toHaveBeenCalled();
    expect(args.navigateView).toHaveBeenCalledWith("project:project-created");

    await result.current.handleCreateProject({
      _editProjectId: "project-1",
      name: "Updated Name",
      status: "Draft",
    });

    expect(args.updateProjectMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        publicId: "project-1",
        name: "Updated Name",
        status: "Draft",
      }),
    );
    expect(args.setEditProjectId).toHaveBeenCalledWith(null);
    expect(args.setEditDraftData).toHaveBeenCalledWith(null);
  });

  test("wires archive/delete/status/task handlers", async () => {
    const args = createBaseArgs();
    const { result } = renderHook(() => useDashboardProjectActions(args));

    act(() => {
      result.current.handleEditProject(baseProject);
      result.current.handleViewReviewProject(baseProject);
      result.current.handleArchiveProject("project-1");
      result.current.handleUnarchiveProject("project-1");
      result.current.handleDeleteProject("project-1");
      result.current.handleUpdateProjectStatus("project-1", "Completed");
      result.current.handleUpdateProject("project-1", {
        description: "Updated",
        tasks: [
          {
            id: "task-1",
            title: "Task",
            assignee: { name: "Viewer", avatar: "" },
            dueDateEpochMs: null,
            completed: false,
          },
        ],
      });
      result.current.handleReplaceWorkspaceTasks([
        {
          id: "task-1",
          title: "Task",
          assignee: { name: "Viewer", avatar: "" },
          dueDateEpochMs: null,
          completed: false,
          projectId: "project-1",
        },
      ]);
    });

    await waitFor(() => {
      expect(args.archiveProjectMutation).toHaveBeenCalledWith({
        publicId: "project-1",
      });
      expect(args.unarchiveProjectMutation).toHaveBeenCalledWith({
        publicId: "project-1",
      });
      expect(args.removeProjectMutation).toHaveBeenCalledWith({
        publicId: "project-1",
      });
      expect(args.setProjectStatusMutation).toHaveBeenCalledWith({
        publicId: "project-1",
        status: "Completed",
      });
    });

    expect(args.setEditProjectId).toHaveBeenCalledWith("project-1");
    expect(args.setReviewProject).toHaveBeenCalledWith(baseProject);
    expect(args.applyTaskDiffMutation).toHaveBeenCalledTimes(2);
    expect(args.reorderTasksMutation).toHaveBeenCalledWith({
      workspaceSlug: "workspace-1",
      orderedTaskIds: ["task-1"],
    });
    expect(args.applyTaskDiffMutation).toHaveBeenLastCalledWith(
      expect.objectContaining({
        workspaceSlug: "workspace-1",
      }),
    );
  });

  test("navigates to archive immediately when archiving from a project route", () => {
    const args = createBaseArgs();
    const { result } = renderHook(() => useDashboardProjectActions(args));

    act(() => {
      result.current.handleArchiveProject("project-1");
    });

    expect(args.navigateView).toHaveBeenCalledWith("archive");
    expect(args.setHighlightedArchiveProjectId).toHaveBeenCalledWith(
      "project-1",
    );
  });

  test("returns to the source project route when archive fails after pre-navigation", async () => {
    const args = createBaseArgs();
    args.archiveProjectMutation = vi
      .fn()
      .mockRejectedValue(new Error("archive failed"));
    const { result } = renderHook(() => useDashboardProjectActions(args));

    act(() => {
      result.current.handleArchiveProject("project-1");
    });

    await waitFor(() => {
      expect(args.navigateView).toHaveBeenCalledWith("project:project-1");
      expect(args.setHighlightedArchiveProjectId).toHaveBeenCalledWith(null);
      expect(toastMock.error).toHaveBeenCalledWith("Failed to archive project");
    });
  });

  test("approves review projects", async () => {
    const args = createBaseArgs();
    const { result } = renderHook(() => useDashboardProjectActions(args));

    await result.current.handleApproveReviewProject("project-1");

    expect(args.setProjectStatusMutation).toHaveBeenCalledWith({
      publicId: "project-1",
      status: "Active",
    });
    expect(args.navigateView).toHaveBeenCalledWith("project:project-1");
  });

  test("navigates to the project route after reverting from completed detail popup", async () => {
    const args = createBaseArgs();
    args.projects = {
      "project-1": {
        ...baseProject,
        status: {
          label: "Completed",
          color: "#fff",
          bgColor: "#000",
          dotColor: "#fff",
        },
        completedAt: Date.now(),
      },
    };
    args.visibleProjects = args.projects;
    args.currentView = "tasks";
    args.isCompletedProjectsOpen = true;
    args.completedProjectDetailId = "project-1";
    const { result } = renderHook(() => useDashboardProjectActions(args));

    act(() => {
      result.current.handleUpdateProjectStatus("project-1", "Active");
    });

    await waitFor(() => {
      expect(args.closeCompletedProjectsPopup).toHaveBeenCalledTimes(1);
      expect(args.navigateView).toHaveBeenCalledWith("project:project-1");
    });
  });

  test("surfaces backend task-sync error details in workspace toast", async () => {
    const args = createBaseArgs();
    args.applyTaskDiffMutation = vi
      .fn()
      .mockRejectedValue(new Error("Tasks can only be modified for active projects"));
    const { result } = renderHook(() => useDashboardProjectActions(args));

    act(() => {
      result.current.handleReplaceWorkspaceTasks([
        {
          id: "task-1",
          title: "Task",
          assignee: { name: "Viewer", avatar: "" },
          dueDateEpochMs: null,
          completed: false,
          projectId: "project-1",
        },
      ]);
    });

    await waitFor(() => {
      expect(toastMock.error).toHaveBeenCalledWith(
        "Failed to update tasks: Tasks can only be modified for active projects",
      );
    });
  });
});
