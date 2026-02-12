/** @vitest-environment jsdom */

import { renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useDashboardTaskSync } from "./useDashboardTaskSync";
import type { Task, ViewerIdentity } from "../../types";

const viewerIdentity: ViewerIdentity = {
  userId: "viewer-1",
  workosUserId: "workos-1",
  name: "Viewer",
  email: "viewer@example.com",
  avatarUrl: "",
  role: "owner",
};

const baseWorkspaceTasks: Task[] = [
  {
    id: "task-1",
    title: "Task One",
    assignee: { userId: "viewer-1", name: "Viewer", avatar: "" },
    dueDateEpochMs: null,
    completed: false,
    projectId: "project-1",
  },
  {
    id: "task-2",
    title: "Task Two",
    assignee: { userId: "viewer-1", name: "Viewer", avatar: "" },
    dueDateEpochMs: null,
    completed: false,
  },
];

describe("useDashboardTaskSync", () => {
  test("applies workspace task diff for visible-task edits and keeps reorder enabled", async () => {
    const applyTaskDiffMutation = vi.fn().mockResolvedValue({});
    const reorderTasksMutation = vi.fn().mockResolvedValue({});
    const { result } = renderHook(() =>
      useDashboardTaskSync({
        activeWorkspaceId: "workspace-1",
        tasksByProject: {},
        workspaceTasks: baseWorkspaceTasks,
        canReorderWorkspaceTasks: true,
        viewerIdentity,
        applyTaskDiffMutation: applyTaskDiffMutation as any,
        reorderTasksMutation: reorderTasksMutation as any,
      }),
    );

    await result.current.syncWorkspaceTasks([
      {
        ...baseWorkspaceTasks[1],
      },
      {
        ...baseWorkspaceTasks[0],
        title: "Task One Updated",
      },
      {
        id: "task-3",
        title: "Task Three",
        assignee: { userId: "viewer-1", name: "Viewer", avatar: "" },
        dueDateEpochMs: null,
        completed: false,
        projectId: "project-1",
      },
    ]);

    expect(applyTaskDiffMutation).toHaveBeenCalledWith({
      workspaceSlug: "workspace-1",
      creates: [
        {
          id: "task-3",
          title: "Task Three",
          assignee: { userId: "viewer-1", name: "Viewer", avatar: "" },
          dueDateEpochMs: null,
          completed: false,
          projectPublicId: "project-1",
        },
      ],
      updates: [
        {
          taskId: "task-1",
          title: "Task One Updated",
          assignee: { userId: "viewer-1", name: "Viewer", avatar: "" },
          dueDateEpochMs: null,
          completed: false,
          projectPublicId: "project-1",
        },
      ],
      removes: [],
    });
    expect(reorderTasksMutation).toHaveBeenCalledWith({
      workspaceSlug: "workspace-1",
      orderedTaskIds: ["task-2", "task-1", "task-3"],
    });
  });

  test("keeps reorder enabled when remove changes visible-task order", async () => {
    const applyTaskDiffMutation = vi.fn().mockResolvedValue({});
    const reorderTasksMutation = vi.fn().mockResolvedValue({});
    const { result } = renderHook(() =>
      useDashboardTaskSync({
        activeWorkspaceId: "workspace-1",
        tasksByProject: {},
        workspaceTasks: baseWorkspaceTasks,
        canReorderWorkspaceTasks: true,
        viewerIdentity,
        applyTaskDiffMutation: applyTaskDiffMutation as any,
        reorderTasksMutation: reorderTasksMutation as any,
      }),
    );

    await result.current.syncWorkspaceTasks([baseWorkspaceTasks[0]]);

    expect(applyTaskDiffMutation).toHaveBeenCalledWith({
      workspaceSlug: "workspace-1",
      creates: [],
      updates: [],
      removes: ["task-2"],
    });
    expect(reorderTasksMutation).toHaveBeenCalledWith({
      workspaceSlug: "workspace-1",
      orderedTaskIds: ["task-1"],
    });
  });
});
